import { z } from 'zod';
import { addDays } from 'date-fns';
import type { IssuedVoucher, PointsTransaction, Reward, Customer, AppData } from '@/domain/types';
import type { Result } from '@/lib/result';
import { ok, err } from '@/lib/result';
import { createAppError } from '@/lib/errors';
import { runCommand } from './command';
import { deriveLedger } from '@/domain/ledger';
import { qualifyingSpend, resolveTier } from '@/domain/tiers';
import { generateVoucherCode, normalizeVoucherCode } from '@/domain/codes';
import { getRewardStockRemaining } from '@/domain/rewards';

export const RedeemRewardInputSchema = z.object({
  customerId: z.string(),
  rewardId: z.string(),
  channel: z.enum(['portal', 'store']).default('portal'),
  staffId: z.string().optional(),
  requestId: z.string().optional(),
});
export type RedeemRewardInput = z.infer<typeof RedeemRewardInputSchema>;

export function redeemReward(input: RedeemRewardInput): Result<IssuedVoucher> {
  const actor = input.staffId
    ? { kind: 'staff' as const, id: input.staffId }
    : { kind: 'member' as const, id: input.customerId };

  return runCommand({
    actor,
    schema: RedeemRewardInputSchema,
    requestId: input.requestId,
    input,
    handler: (validInput, data) => {
      const customer = data.customers.find((c) => c.id === validInput.customerId);
      if (!customer) {
        return err(createAppError('NOT_FOUND', 'Member not found'));
      }

      const reward = data.rewards.find((r) => r.id === validInput.rewardId);
      if (!reward) {
        return err(createAppError('NOT_FOUND', 'Reward not found'));
      }

      if (reward.status !== 'active') {
        return err(createAppError('FORBIDDEN', 'This reward is currently unavailable'));
      }

      const now = new Date();
      const nowIso = now.toISOString();

      // Check dates if reward has validity window
      if (reward.startsAt && reward.startsAt > nowIso) {
        return err(createAppError('FORBIDDEN', 'This reward promotion has not started yet'));
      }
      if (reward.endsAt && reward.endsAt < nowIso) {
        return err(createAppError('FORBIDDEN', 'This reward promotion has ended'));
      }

      // Check tier eligibility
      const spend = qualifyingSpend(data.purchases, customer.id, now);
      const tier = resolveTier(spend, data.tiers);
      if (
        reward.eligibleTierIds.length > 0 &&
        !reward.eligibleTierIds.includes(tier.id)
      ) {
        return err(
          createAppError(
            'NOT_ELIGIBLE',
            `This reward is exclusive to ${reward.eligibleTierIds.join(', ')} tier members.`
          )
        );
      }

      // Check stock
      const remainingStock = getRewardStockRemaining(reward, data.vouchers);
      if (remainingStock !== null && remainingStock <= 0) {
        return err(createAppError('CONFLICT', 'This reward is currently out of stock'));
      }

      // Check per-member limit
      if (reward.perMemberLimit) {
        const memberRedeemedCount = data.vouchers.filter(
          (v) =>
            v.customerId === customer.id &&
            v.rewardId === reward.id &&
            v.status !== 'cancelled'
        ).length;
        if (memberRedeemedCount >= reward.perMemberLimit) {
          return err(
            createAppError(
              'FORBIDDEN',
              `You have reached the maximum redemption limit (${reward.perMemberLimit}) for this reward.`
            )
          );
        }
      }

      // Check points balance
      const derived = deriveLedger(data.transactions, customer.id, now);
      if (derived.balance < reward.pointsCost) {
        return err(
          createAppError(
            'INSUFFICIENT_POINTS',
            `Insufficient Trove Points. You have ${derived.balance} pts, but this reward requires ${reward.pointsCost} pts.`
          )
        );
      }

      const voucherSeq = data.vouchers.length + 1;
      let txnSeq = data.seq.txn;

      const voucherId = `vouch-${voucherSeq}`;
      const txnId = `txn-${txnSeq++}`;
      const code = generateVoucherCode();

      const voucher: IssuedVoucher = {
        id: voucherId,
        code,
        customerId: customer.id,
        source: 'catalogue',
        rewardId: reward.id,
        title: reward.name,
        valueLabel: reward.value.label,
        pointsSpent: reward.pointsCost,
        channel: validInput.channel,
        issuedAt: nowIso,
        expiresAt: addDays(now, reward.voucherValidityDays).toISOString(),
        status: 'issued',
        redeemTxnId: txnId,
      };

      const txn: PointsTransaction = {
        id: txnId,
        ref: `TX-${txnSeq.toString().padStart(6, '0')}`,
        customerId: customer.id,
        type: 'REDEEM',
        points: -reward.pointsCost,
        at: nowIso,
        actor: validInput.staffId
          ? { kind: 'staff', id: validInput.staffId }
          : { kind: 'member', id: customer.id },
        voucherId,
        description: `Redeemed ${reward.name}`,
      };

      const notification = {
        id: `notif-redeem-${voucherId}`,
        customerId: customer.id,
        title: 'Voucher Ready!',
        body: `Your voucher for ${reward.name} is ready to use: ${code}.`,
        kind: 'redeemed' as const,
        at: nowIso,
      };

      const nextData: AppData = {
        ...data,
        seq: {
          ...data.seq,
          txn: txnSeq,
        },
        vouchers: [...data.vouchers, voucher],
        transactions: [...data.transactions, txn],
        notifications: [...data.notifications, notification],
      };

      return ok({
        nextData,
        value: voucher,
      });
    },
    audit: (validInput, voucher) => ({
      action: 'REWARD_REDEEM',
      entity: { type: 'voucher', id: voucher.id },
      summary: `Redeemed voucher ${voucher.code} (${voucher.title}) for ${validInput.customerId}`,
      after: voucher as unknown as Record<string, unknown>,
    }),
  });
}

export const MarkVoucherUsedInputSchema = z.object({
  voucherCode: z.string().min(1, 'Voucher code is required'),
  billNo: z.string().optional(),
  billAmountPaise: z.number().int().optional(),
  staffId: z.string(),
  requestId: z.string().optional(),
});
export type MarkVoucherUsedInput = z.infer<typeof MarkVoucherUsedInputSchema>;

export function markVoucherUsed(input: MarkVoucherUsedInput): Result<IssuedVoucher> {
  return runCommand({
    actor: { kind: 'staff', id: input.staffId },
    permission: 'counter.use',
    requestId: input.requestId,
    schema: MarkVoucherUsedInputSchema,
    input,
    handler: (validInput, data) => {
      const normalized = normalizeVoucherCode(validInput.voucherCode);
      const idx = data.vouchers.findIndex(
        (v) => normalizeVoucherCode(v.code) === normalized
      );

      if (idx === -1) {
        return err(createAppError('NOT_FOUND', `Voucher "${validInput.voucherCode}" was not found.`));
      }

      const voucher = data.vouchers[idx]!;
      const now = new Date();
      const nowIso = now.toISOString();

      if (voucher.status === 'used') {
        return err(
          createAppError('CONFLICT', `This voucher was already used on ${voucher.usedAt}.`)
        );
      }

      if (voucher.status === 'cancelled') {
        return err(createAppError('CONFLICT', 'This voucher has been cancelled and cannot be used.'));
      }

      if (new Date(voucher.expiresAt).getTime() < now.getTime()) {
        return err(
          createAppError('CONFLICT', `This voucher expired on ${voucher.expiresAt}.`)
        );
      }

      const reward = voucher.rewardId ? data.rewards.find((r) => r.id === voucher.rewardId) : undefined;
      if (reward?.minPurchasePaise && validInput.billAmountPaise !== undefined) {
        if (validInput.billAmountPaise < reward.minPurchasePaise) {
          const reqRupees = Math.round(reward.minPurchasePaise / 100);
          const actRupees = Math.round(validInput.billAmountPaise / 100);
          return err(
            createAppError(
              'FORBIDDEN',
              `Requires minimum bill of ₹${reqRupees.toLocaleString('en-IN')} (current bill: ₹${actRupees.toLocaleString('en-IN')}).`
            )
          );
        }
      }

      const updatedVoucher: IssuedVoucher = {
        ...voucher,
        status: 'used',
        usedAt: nowIso,
        usedByStaffId: validInput.staffId,
        usedBillNo: validInput.billNo?.trim() || undefined,
      };

      const updatedVouchers = [...data.vouchers];
      updatedVouchers[idx] = updatedVoucher;

      const updatedNotifications = [
        ...data.notifications,
        {
          id: `notif-use-${voucher.id}`,
          customerId: voucher.customerId,
          title: 'Reward Used',
          body: `Your voucher ${voucher.code} for ${voucher.title} was redeemed at counter.`,
          kind: 'redeemed' as const,
          at: nowIso,
        },
      ];

      return ok({
        nextData: {
          ...data,
          vouchers: updatedVouchers,
          notifications: updatedNotifications,
        },
        value: updatedVoucher,
      });
    },
    audit: (validInput, voucher) => ({
      action: 'VOUCHER_USED',
      entity: { type: 'voucher', id: voucher.id },
      summary: `Voucher ${voucher.code} (${voucher.title}) marked used by staff ${validInput.staffId}`,
      after: voucher as unknown as Record<string, unknown>,
    }),
  });
}

export const CancelVoucherInputSchema = z.object({
  voucherId: z.string(),
  reason: z.string().min(3, 'Cancellation reason is required'),
  staffId: z.string(),
});
export type CancelVoucherInput = z.infer<typeof CancelVoucherInputSchema>;

export function cancelVoucher(input: CancelVoucherInput): Result<IssuedVoucher> {
  return runCommand({
    actor: { kind: 'staff', id: input.staffId },
    permission: 'points.correct',
    schema: CancelVoucherInputSchema,
    input,
    handler: (validInput, data) => {
      const idx = data.vouchers.findIndex((v) => v.id === validInput.voucherId);
      if (idx === -1) {
        return err(createAppError('NOT_FOUND', 'Voucher not found'));
      }

      const voucher = data.vouchers[idx]!;
      if (voucher.status !== 'issued') {
        return err(
          createAppError('CONFLICT', `Only active vouchers can be cancelled (current status: ${voucher.status})`)
        );
      }

      const now = new Date();
      const nowIso = now.toISOString();

      let txnSeq = data.seq.txn;
      const updatedTransactions = [...data.transactions];
      let refundTxnId: string | undefined;

      // Refund points if member spent points on this voucher
      if (voucher.pointsSpent > 0) {
        refundTxnId = `txn-${txnSeq++}`;
        const refundTxn: PointsTransaction = {
          id: refundTxnId,
          ref: `TX-${txnSeq.toString().padStart(6, '0')}`,
          customerId: voucher.customerId,
          type: 'REDEEM_REFUND',
          points: voucher.pointsSpent,
          at: nowIso,
          actor: { kind: 'staff', id: validInput.staffId },
          voucherId: voucher.id,
          reason: {
            category: 'voucher_cancel',
            note: validInput.reason,
          },
          description: `Refund for cancelled voucher ${voucher.code}`,
        };
        updatedTransactions.push(refundTxn);
      }

      const updatedVoucher: IssuedVoucher = {
        ...voucher,
        status: 'cancelled',
        cancelled: {
          at: nowIso,
          staffId: validInput.staffId,
          reason: validInput.reason,
          refundTxnId,
        },
      };

      const updatedVouchers = [...data.vouchers];
      updatedVouchers[idx] = updatedVoucher;

      const updatedNotifications = [
        ...data.notifications,
        {
          id: `notif-cancel-${voucher.id}`,
          customerId: voucher.customerId,
          title: 'Voucher Cancelled',
          body: `Voucher ${voucher.code} was cancelled.${
            voucher.pointsSpent > 0 ? ` ${voucher.pointsSpent} points have been refunded.` : ''
          }`,
          kind: 'adjusted' as const,
          at: nowIso,
        },
      ];

      return ok({
        nextData: {
          ...data,
          seq: {
            ...data.seq,
            txn: txnSeq,
          },
          vouchers: updatedVouchers,
          transactions: updatedTransactions,
          notifications: updatedNotifications,
        },
        value: updatedVoucher,
      });
    },
    audit: (validInput, voucher) => ({
      action: 'VOUCHER_CANCELLED',
      entity: { type: 'voucher', id: voucher.id },
      summary: `Cancelled voucher ${voucher.code}: ${validInput.reason}`,
      after: voucher as unknown as Record<string, unknown>,
    }),
  });
}

export interface VerifyCodeResult {
  valid: boolean;
  status: 'active' | 'used' | 'expired' | 'cancelled' | 'not_found';
  voucher?: IssuedVoucher;
  reward?: Reward;
  customer?: Customer;
  message: string;
}

export function verifyCode(
  code: string,
  data: AppData,
  now: Date = new Date()
): VerifyCodeResult {
  const normalized = normalizeVoucherCode(code);
  const voucher = data.vouchers.find((v) => normalizeVoucherCode(v.code) === normalized);

  if (!voucher) {
    return {
      valid: false,
      status: 'not_found',
      message: 'Voucher code not found.',
    };
  }

  const customer = data.customers.find((c) => c.id === voucher.customerId);
  const reward = voucher.rewardId
    ? data.rewards.find((r) => r.id === voucher.rewardId)
    : undefined;

  if (voucher.status === 'used') {
    return {
      valid: false,
      status: 'used',
      voucher,
      reward,
      customer,
      message: `Already used on ${new Date(voucher.usedAt!).toLocaleDateString('en-IN')}`,
    };
  }

  if (voucher.status === 'cancelled') {
    return {
      valid: false,
      status: 'cancelled',
      voucher,
      reward,
      customer,
      message: 'This voucher has been cancelled.',
    };
  }

  if (new Date(voucher.expiresAt).getTime() < now.getTime()) {
    return {
      valid: false,
      status: 'expired',
      voucher,
      reward,
      customer,
      message: `Expired on ${new Date(voucher.expiresAt).toLocaleDateString('en-IN')}`,
    };
  }

  return {
    valid: true,
    status: 'active',
    voucher,
    reward,
    customer,
    message: 'Valid voucher ready for redemption.',
  };
}
