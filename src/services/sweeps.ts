import type {
  AppData,
  OccasionGrant,
  PointsTransaction,
  Notification,
  IssuedVoucher,
  Tier,
} from '@/domain/types';
import { deriveLedger } from '@/domain/ledger';
import { findDueOccasionGrants } from '@/domain/occasions';
import { resolveTier, qualifyingSpend } from '@/domain/tiers';
import { generateVoucherCode } from '@/domain/codes';
import { expiryDateFor } from '@/domain/expiry';

export interface SweepResults {
  data: AppData;
  expiredPointsTotal: number;
  occasionsGrantedTotal: number;
}

/**
 * Runs automatic sweeps for points expiry and due occasion grants.
 * Called automatically by store commit and on app load.
 */
export function runSweeps(data: AppData, now: Date = new Date()): SweepResults {
  const nowIso = now.toISOString();
  let expiredPointsTotal = 0;
  let occasionsGrantedTotal = 0;

  const newTransactions: PointsTransaction[] = [...data.transactions];
  const newOccasionGrants: OccasionGrant[] = [...data.occasionGrants];
  const newVouchers: IssuedVoucher[] = [...data.vouchers];
  const newNotifications: Notification[] = [...data.notifications];

  let txnSeq = data.seq.txn;

  // 1. Point Expiry Sweep
  for (const customer of data.customers) {
    const derived = deriveLedger(newTransactions, customer.id, now);
    for (const lot of derived.lots) {
      if (lot.remaining > 0 && lot.expiresAt && lot.expiresAt <= nowIso) {
        // Double-check an EXPIRE transaction hasn't already been created for this lot
        const alreadyExpired = newTransactions.some(
          (tx) => tx.type === 'EXPIRE' && tx.expiresLotTxnId === lot.txnId
        );
        if (alreadyExpired) continue;

        const pointsToExpire = lot.remaining;
        expiredPointsTotal += pointsToExpire;

        const expireTxn: PointsTransaction = {
          id: `txn-expire-${lot.txnId}`,
          ref: `TX-${(txnSeq++).toString().padStart(6, '0')}`,
          customerId: customer.id,
          type: 'EXPIRE',
          points: -pointsToExpire,
          at: lot.expiresAt,
          actor: { kind: 'system' },
          description: 'Points expired',
          expiresLotTxnId: lot.txnId,
        };
        newTransactions.push(expireTxn);

        newNotifications.push({
          id: `notif-expire-${lot.txnId}`,
          customerId: customer.id,
          title: 'Points Expired',
          body: `${pointsToExpire} Trove Points expired on ${new Date(lot.expiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
          kind: 'expiring',
          at: nowIso,
        });
      }
    }
  }

  // 2. Occasion Grants Sweep
  const customerTiers = new Map<string, Tier>();
  for (const c of data.customers) {
    const spend = qualifyingSpend(data.purchases, c.id, now);
    const tier = resolveTier(spend, data.tiers);
    customerTiers.set(c.id, tier);
  }

  const dueOccasions = findDueOccasionGrants(
    data.customers,
    data.config.occasions,
    data.config,
    newOccasionGrants,
    customerTiers,
    now
  );

  let voucherSeq = newVouchers.length + 1;

  for (const due of dueOccasions) {
    const grantId = `grant-${due.rule.id}-${due.customer.id}-${new Date(due.occurrenceDate).getFullYear()}`;

    if (due.rule.benefit.type === 'bonus_points') {
      const bonusPoints = due.rule.benefit.points ?? 0;
      occasionsGrantedTotal += bonusPoints;
      const txnId = `txn-occ-${due.rule.id}-${due.customer.id}-${new Date(due.occurrenceDate).getFullYear()}`;
      const txnRef = `TX-${(txnSeq++).toString().padStart(6, '0')}`;

      const occasionGrant: OccasionGrant = {
        id: grantId,
        key: due.key,
        customerId: due.customer.id,
        ruleId: due.rule.id,
        occasion: due.rule.occasion,
        occurrenceDate: due.occurrenceDate,
        grantedAt: nowIso,
        txnId,
      };
      newOccasionGrants.push(occasionGrant);

      const bonusExpiresAt = expiryDateFor(now, data.config.expiry);

      const occasionTxn: PointsTransaction = {
        id: txnId,
        ref: txnRef,
        customerId: due.customer.id,
        type: 'EARN_BONUS',
        points: bonusPoints,
        at: nowIso,
        actor: { kind: 'system' },
        occasionGrantId: grantId,
        description: `${due.rule.occasion === 'birthday' ? 'Birthday' : 'Anniversary'} celebration bonus`,
        expiresAt: bonusExpiresAt ?? undefined,
      };
      newTransactions.push(occasionTxn);

      newNotifications.push({
        id: `notif-occ-${grantId}`,
        customerId: due.customer.id,
        title: due.rule.occasion === 'birthday' ? 'Happy Birthday from Trove!' : 'Happy Anniversary from Trove!',
        body: `We've gifted you ${bonusPoints} Trove Points to celebrate.`,
        kind: 'occasion_ready',
        at: nowIso,
      });
    } else if (due.rule.benefit.type === 'voucher' || due.rule.benefit.type === 'gift') {
      const voucherId = `vouch-occ-${voucherSeq++}`;
      const code = generateVoucherCode();
      const valueLabel =
        due.rule.benefit.description ||
        (due.rule.benefit.amountPaise ? `₹${due.rule.benefit.amountPaise / 100} off` : '') ||
        (due.rule.benefit.percent ? `${due.rule.benefit.percent}% off` : '') ||
        due.rule.name;

      const voucher: IssuedVoucher = {
        id: voucherId,
        code,
        customerId: due.customer.id,
        source: 'occasion',
        occasionRuleId: due.rule.id,
        title: due.rule.name,
        valueLabel,
        pointsSpent: 0,
        channel: 'portal',
        issuedAt: nowIso,
        expiresAt: due.windowEnd,
        status: 'issued',
      };
      newVouchers.push(voucher);

      const occasionGrant: OccasionGrant = {
        id: grantId,
        key: due.key,
        customerId: due.customer.id,
        ruleId: due.rule.id,
        occasion: due.rule.occasion,
        occurrenceDate: due.occurrenceDate,
        grantedAt: nowIso,
        voucherId,
      };
      newOccasionGrants.push(occasionGrant);

      newNotifications.push({
        id: `notif-occ-${grantId}`,
        customerId: due.customer.id,
        title: due.rule.occasion === 'birthday' ? 'Birthday Treat Unlocked!' : 'Anniversary Treat Unlocked!',
        body: `Your exclusive ${due.rule.name} voucher (${code}) is now ready!`,
        kind: 'occasion_ready',
        at: nowIso,
      });
    }
  }

  const hasChanges =
    expiredPointsTotal > 0 || occasionsGrantedTotal > 0 || newVouchers.length > data.vouchers.length;

  if (!hasChanges) {
    return { data, expiredPointsTotal: 0, occasionsGrantedTotal: 0 };
  }

  return {
    data: {
      ...data,
      seq: {
        ...data.seq,
        txn: txnSeq,
      },
      transactions: newTransactions,
      occasionGrants: newOccasionGrants,
      vouchers: newVouchers,
      notifications: newNotifications,
    },
    expiredPointsTotal,
    occasionsGrantedTotal,
  };
}
