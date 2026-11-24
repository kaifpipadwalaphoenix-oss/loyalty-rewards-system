import type {
  AppData,
  Customer,
  Tier,
  PointsTransaction,
  IssuedVoucher,
  Notification,
} from '@/domain/types';
import { deriveLedger, type PointsLot } from '@/domain/ledger';
import { qualifyingSpend, resolveTier, tierProgress, type TierProgress } from '@/domain/tiers';

export interface MemberDetails {
  customer: Customer;
  tier: Tier;
  nextTier: Tier | null;
  tierProgress: TierProgress;
  balance: number;
  qualifyingSpendPaise: number;
  transactions: PointsTransaction[];
  lots: PointsLot[];
  vouchers: IssuedVoucher[];
  activeVouchers: IssuedVoucher[];
  expiringLots: PointsLot[];
  expiringSoonPoints: number;
  notifications: Notification[];
  unreadNotificationsCount: number;
}

export function selectMemberDetails(
  data: AppData,
  customerId: string,
  now: Date = new Date()
): MemberDetails | null {
  const customer = data.customers.find((c) => c.id === customerId);
  if (!customer) return null;

  const derived = deriveLedger(data.transactions, customer.id, now);
  const spend = qualifyingSpend(data.purchases, customer.id, now);
  const tier = resolveTier(spend, data.tiers);
  const progress = tierProgress(spend, tier, data.tiers);

  const customerTransactions = data.transactions
    .filter((t) => t.customerId === customer.id)
    .sort((a, b) => b.at.localeCompare(a.at));

  const customerVouchers = data.vouchers
    .filter((v) => v.customerId === customer.id)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  const nowIso = now.toISOString();
  const activeVouchers = customerVouchers.filter(
    (v) => v.status === 'issued' && v.expiresAt >= nowIso
  );

  // Expiring lots within configured threshold (e.g., 30 days)
  const expiringSoonLimit = new Date(
    now.getTime() + data.config.expiry.expiringSoonDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const expiringLots = derived.lots.filter(
    (l) => l.remaining > 0 && l.expiresAt && l.expiresAt >= nowIso && l.expiresAt <= expiringSoonLimit
  );

  const expiringSoonPoints = expiringLots.reduce((sum, l) => sum + l.remaining, 0);

  const customerNotifications = data.notifications
    .filter((n) => n.customerId === customer.id)
    .sort((a, b) => b.at.localeCompare(a.at));

  const unreadNotificationsCount = customerNotifications.filter((n) => !n.readAt).length;

  return {
    customer,
    tier,
    nextTier: progress.nextTier,
    tierProgress: progress,
    balance: derived.balance,
    qualifyingSpendPaise: spend,
    transactions: customerTransactions,
    lots: derived.lots,
    vouchers: customerVouchers,
    activeVouchers,
    expiringLots,
    expiringSoonPoints,
    notifications: customerNotifications,
    unreadNotificationsCount,
  };
}
