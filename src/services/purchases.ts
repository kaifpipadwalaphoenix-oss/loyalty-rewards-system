import { z } from 'zod';
import type { PointsTransaction, Purchase } from '@/domain/types';
import type { Result } from '@/lib/result';
import { ok, err } from '@/lib/result';
import { createAppError } from '@/lib/errors';
import { runCommand } from './command';
import { qualifyingSpend, resolveTier } from '@/domain/tiers';
import { calculateEarn } from '@/domain/earning';
import { expiryDateFor } from '@/domain/expiry';
import { remainingForLot } from '@/domain/ledger';

export const RecordPurchaseInputSchema = z.object({
  customerId: z.string(),
  billNo: z.string().min(1, 'Bill number is required'),
  amountPaise: z
    .number()
    .int()
    .min(1, 'Purchase amount must be positive')
    .max(100000000, 'Bill amount cannot exceed ₹10,00,000 (maximum allowed per transaction)'),
  staffId: z.string(),
  channel: z.enum(['store', 'online']).default('store'),
  requestId: z.string().optional(),
});
export type RecordPurchaseInput = z.infer<typeof RecordPurchaseInputSchema>;

export interface RecordPurchaseResult {
  purchase: Purchase;
  transaction?: PointsTransaction;
}

export function recordPurchase(input: RecordPurchaseInput): Result<RecordPurchaseResult> {
  return runCommand({
    actor: { kind: 'staff', id: input.staffId },
    permission: 'counter.use',
    requestId: input.requestId,
    schema: RecordPurchaseInputSchema,
    input,
    handler: (validInput, data) => {
      const customer = data.customers.find((c) => c.id === validInput.customerId);
      if (!customer) {
        return err(createAppError('NOT_FOUND', 'Customer not found'));
      }

      // BL-04: Duplicate bill number check (case-insensitive for active purchases)
      const duplicate = data.purchases.some(
        (p) => !p.voided && p.billNo.trim().toLowerCase() === validInput.billNo.trim().toLowerCase()
      );
      if (duplicate) {
        return err(
          createAppError('CONFLICT', `A purchase with bill number "${validInput.billNo}" has already been recorded.`)
        );
      }

      const now = new Date();
      const nowIso = now.toISOString();

      // Resolve current tier
      const spend = qualifyingSpend(customer.id, data.purchases, now);
      const tier = resolveTier(spend, data.tiers);

      // Calculate total earn
      const earn = calculateEarn({
        amountPaise: validInput.amountPaise,
        config: data.config.earning,
        tier,
        campaigns: data.campaigns,
        at: now,
      });

      const purchaseSeq = data.seq.purchase + 1;
      let txnSeq = data.seq.txn;

      const purchaseId = `pur-${purchaseSeq}`;
      const txnId = earn.totalPoints > 0 ? `txn-${txnSeq++}` : undefined;

      const purchase: Purchase = {
        id: purchaseId,
        ref: `P-${purchaseSeq.toString().padStart(6, '0')}`,
        customerId: customer.id,
        amountPaise: validInput.amountPaise,
        billNo: validInput.billNo.trim(),
        channel: validInput.channel,
        at: nowIso,
        staffId: validInput.staffId,
        eligible: earn.eligible,
        earnTxnId: txnId,
      };

      const updatedPurchases = [...data.purchases, purchase];
      const updatedTransactions = [...data.transactions];
      const updatedNotifications = [...data.notifications];

      let transaction: PointsTransaction | undefined;

      if (earn.totalPoints > 0 && txnId) {
        const expiresAt = expiryDateFor(now, data.config.expiry);
        transaction = {
          id: txnId,
          ref: `TX-${(txnSeq).toString().padStart(6, '0')}`,
          customerId: customer.id,
          type: 'EARN_PURCHASE',
          points: earn.totalPoints,
          at: nowIso,
          actor: { kind: 'staff', id: validInput.staffId },
          purchaseId,
          campaignId: earn.campaign?.id,
          expiresAt: expiresAt ?? null,
          breakdown: {
            basePoints: earn.basePoints,
            tierBonus: earn.tierBonus,
            tierName: tier.name,
            tierPct: tier.earnBonusPct,
            campaignBonus: earn.campaignBonus,
            campaignName: earn.campaign?.name,
            ruleSnapshot: {
              spendUnitPaise: data.config.earning.spendUnitPaise,
              pointsPerUnit: data.config.earning.pointsPerUnit,
              rounding: data.config.earning.rounding,
            },
          },
          description: `Store purchase #${validInput.billNo}`,
        };
        updatedTransactions.push(transaction);

        updatedNotifications.push({
          id: `notif-earn-${purchaseId}`,
          customerId: customer.id,
          title: 'Points Earned!',
          body: `You earned ${earn.totalPoints} Trove Points from bill #${validInput.billNo}.`,
          kind: 'points_earned',
          at: nowIso,
        });
      }

      const nextData = {
        ...data,
        seq: {
          ...data.seq,
          purchase: purchaseSeq,
          txn: txnSeq,
        },
        purchases: updatedPurchases,
        transactions: updatedTransactions,
        notifications: updatedNotifications,
      };

      return ok({
        nextData,
        value: { purchase, transaction },
      });
    },
    audit: (validInput, result) => ({
      action: 'PURCHASE_RECORD',
      entity: { type: 'purchase', id: result.purchase.id },
      summary: `Recorded bill #${result.purchase.billNo} (₹${(result.purchase.amountPaise / 100).toFixed(2)}) for member ${validInput.customerId}`,
      after: result.purchase as unknown as Record<string, unknown>,
    }),
  });
}

export const VoidPurchaseInputSchema = z.object({
  purchaseId: z.string(),
  reason: z.string().min(5, 'A reason of at least 5 characters is required'),
  staffId: z.string(),
  requestId: z.string().optional(),
});
export type VoidPurchaseInput = z.infer<typeof VoidPurchaseInputSchema>;

export function voidPurchase(input: VoidPurchaseInput): Result<Purchase> {
  return runCommand({
    actor: { kind: 'staff', id: input.staffId },
    permission: 'points.correct',
    requestId: input.requestId,
    schema: VoidPurchaseInputSchema,
    input,
    handler: (validInput, data) => {
      const idx = data.purchases.findIndex((p) => p.id === validInput.purchaseId);
      if (idx === -1) {
        return err(createAppError('NOT_FOUND', 'Purchase not found'));
      }

      const purchase = data.purchases[idx]!;
      if (purchase.voided) {
        return err(createAppError('CONFLICT', 'Purchase has already been voided'));
      }

      const nowIso = new Date().toISOString();
      let txnSeq = data.seq.txn;

      // Find original earn transaction if any
      const earnTxn = purchase.earnTxnId
        ? data.transactions.find((t) => t.id === purchase.earnTxnId)
        : undefined;

      const earnedPoints = earnTxn ? earnTxn.points : 0;
      const remainingOfLot = earnTxn
        ? remainingForLot(data.transactions, purchase.customerId, earnTxn.id, new Date())
        : 0;

      const pointsReversed = Math.min(earnedPoints, remainingOfLot);
      const shortfall = earnedPoints - pointsReversed;
      let voidTxnId: string | undefined;

      const updatedTransactions = [...data.transactions];
      const updatedNotifications = [...data.notifications];

      if (pointsReversed > 0) {
        voidTxnId = `txn-${txnSeq++}`;
        const voidTxn: PointsTransaction = {
          id: voidTxnId,
          ref: `TX-${txnSeq.toString().padStart(6, '0')}`,
          customerId: purchase.customerId,
          type: 'PURCHASE_VOID',
          points: -pointsReversed,
          at: nowIso,
          actor: { kind: 'staff', id: validInput.staffId },
          purchaseId: purchase.id,
          reason: {
            category: 'void',
            note: validInput.reason,
          },
          description: `Reversal for voided bill #${purchase.billNo}`,
        };
        updatedTransactions.push(voidTxn);

        updatedNotifications.push({
          id: `notif-void-${purchase.id}`,
          customerId: purchase.customerId,
          title: 'Purchase Voided',
          body: `Bill #${purchase.billNo} was voided. ${pointsReversed} Trove Points were reversed${shortfall > 0 ? ` (${shortfall} points shortfall)` : ''}.`,
          kind: 'adjusted',
          at: nowIso,
        });
      }

      const voidedPurchase: Purchase = {
        ...purchase,
        voided: {
          at: nowIso,
          staffId: validInput.staffId,
          reason: validInput.reason,
          voidTxnId,
          pointsReversed,
          shortfall,
        },
      };

      const updatedPurchases = [...data.purchases];
      updatedPurchases[idx] = voidedPurchase;

      const nextData = {
        ...data,
        seq: {
          ...data.seq,
          txn: txnSeq,
        },
        purchases: updatedPurchases,
        transactions: updatedTransactions,
        notifications: updatedNotifications,
      };

      return ok({
        nextData,
        value: voidedPurchase,
      });
    },
    audit: (validInput, voided) => ({
      action: 'PURCHASE_VOID',
      entity: { type: 'purchase', id: voided.id },
      summary: `Voided purchase bill #${voided.billNo}: ${validInput.reason}`,
      after: voided as unknown as Record<string, unknown>,
    }),
  });
}
