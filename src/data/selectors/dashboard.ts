import type { AppData, Tier, Reward, PointsTransaction } from '@/domain/types';
import { deriveLedger } from '@/domain/ledger';
import { qualifyingSpend, resolveTier } from '@/domain/tiers';
import { getUpcomingOccasions, type UpcomingOccasion } from '@/domain/occasions';

export interface TrendPoint {
  period: string;
  issued: number;
  redeemed: number;
}

export type AdminDateRangePreset = 'today' | '7d' | '30d' | '90d' | '12m';

export interface NeedsAttention {
  expiringPoints: {
    totalPoints: number;
    memberCount: number;
    members: Array<{ id: string; name: string; memberNo: string; points: number; expiresAt: string }>;
  };
  celebrations: Array<UpcomingOccasion & { customer: { id: string; name: string; memberNo: string } }>;
  expiringVouchers: Array<{ id: string; code: string; customerId: string; customerName: string; title: string; expiresAt: string }>;
}

export interface AdminDashboardData {
  rangePreset: AdminDateRangePreset;
  kpis: {
    totalMembers: number;
    activeMembers: number; // made purchase or enrolled in range
    totalSalesPaise: number;
    pointsIssued: number;
    pointsRedeemed: number;
    pointsLiability: number; // total outstanding unexpired points
    liabilityRupees: number; // whole rupees
  };
  needsAttention: NeedsAttention;
  trendSeries: TrendPoint[];
  tierBreakdown: Array<{
    tier: Tier;
    count: number;
    pct: number;
  }>;
  popularRewards: Array<{
    reward: Reward;
    redeemedCount: number;
    stockRemaining?: number;
  }>;
  upcomingOccasions: Array<UpcomingOccasion & { customer: { id: string; name: string; memberNo: string } }>;
  recentTransactions: PointsTransaction[];
}

export function selectAdminDashboard(
  data: AppData,
  presetOrNow: AdminDateRangePreset | Date = '30d',
  maybeNow?: Date
): AdminDashboardData {
  const isDateParam = presetOrNow instanceof Date;
  const preset: AdminDateRangePreset = isDateParam ? '30d' : presetOrNow;
  const now: Date = isDateParam ? presetOrNow : (maybeNow ?? new Date());
  const nowIso = now.toISOString();

  let rangeStart: Date;
  switch (preset) {
    case 'today':
      rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      break;
    case '7d':
      rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      rangeStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '12m':
      rangeStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
    default:
      rangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }
  const rangeStartIso = rangeStart.toISOString();

  const totalMembers = data.customers.length;

  const activeMembers = data.customers.filter((c) => {
    if (c.enrolledAt >= rangeStartIso) return true;
    return data.purchases.some((p) => p.customerId === c.id && !p.voided && p.at >= rangeStartIso);
  }).length;

  const totalSalesPaise = data.purchases
    .filter((p) => !p.voided && p.at >= rangeStartIso)
    .reduce((sum, p) => sum + p.amountPaise, 0);

  let pointsIssued = 0;
  let pointsRedeemed = 0;
  let pointsLiability = 0;

  for (const customer of data.customers) {
    const derived = deriveLedger(data.transactions, customer.id, now);
    pointsLiability += Math.max(0, derived.balance);
  }

  for (const tx of data.transactions) {
    if (tx.at >= rangeStartIso) {
      if (tx.points > 0) {
        pointsIssued += tx.points;
      } else if (tx.type === 'REDEEM') {
        pointsRedeemed += Math.abs(tx.points);
      }
    }
  }

  const pointValueRupees = data.config.earning.pointValuePaise / 100;
  const liabilityRupees = Math.round(pointsLiability * pointValueRupees);

  // Tier breakdown
  const tierCountMap = new Map<string, number>();
  for (const t of data.tiers) {
    tierCountMap.set(t.id, 0);
  }

  for (const customer of data.customers) {
    const spend = qualifyingSpend(customer.id, data.purchases, now);
    const tier = resolveTier(spend, data.tiers);
    tierCountMap.set(tier.id, (tierCountMap.get(tier.id) ?? 0) + 1);
  }

  const tierBreakdown = data.tiers.map((t) => {
    const count = tierCountMap.get(t.id) ?? 0;
    const pct = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;
    return { tier: t, count, pct };
  });

  // Popular rewards
  const rewardRedeemedCountMap = new Map<string, number>();
  for (const v of data.vouchers) {
    if (v.rewardId) {
      rewardRedeemedCountMap.set(
        v.rewardId,
        (rewardRedeemedCountMap.get(v.rewardId) ?? 0) + 1
      );
    }
  }

  const popularRewards = data.rewards
    .map((reward) => {
      const redeemedCount = rewardRedeemedCountMap.get(reward.id) ?? 0;
      const stockRemaining = reward.stockLimit !== undefined ? Math.max(0, reward.stockLimit - redeemedCount) : undefined;
      return {
        reward,
        redeemedCount,
        stockRemaining,
      };
    })
    .sort((a, b) => b.redeemedCount - a.redeemedCount)
    .slice(0, 5);

  // 6-month points activity trend
  const months: { label: string; start: Date; end: Date; issued: number; redeemed: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    months.push({
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
      start: d,
      end,
      issued: 0,
      redeemed: 0,
    });
  }

  for (const tx of data.transactions) {
    const txDate = new Date(tx.at);
    for (const m of months) {
      if (txDate >= m.start && txDate <= m.end) {
        if (tx.points > 0) {
          m.issued += tx.points;
        } else if (tx.type === 'REDEEM') {
          m.redeemed += Math.abs(tx.points);
        }
        break;
      }
    }
  }

  const trendSeries: TrendPoint[] = months.map((m) => ({
    period: m.label,
    issued: m.issued,
    redeemed: m.redeemed,
  }));

  // Upcoming occasions in next 14 days
  const upcomingOccasions: Array<UpcomingOccasion & { customer: { id: string; name: string; memberNo: string } }> = [];
  for (const customer of data.customers) {
    const spend = qualifyingSpend(customer.id, data.purchases, now);
    const tier = resolveTier(spend, data.tiers);
    const customerOccasions = getUpcomingOccasions(customer, data.config.occasions, tier, now);
    for (const occ of customerOccasions) {
      if (occ.daysAway <= 14) {
        upcomingOccasions.push({
          ...occ,
          customer: {
            id: customer.id,
            name: customer.name,
            memberNo: customer.memberNo,
          },
        });
      }
    }
  }

  // Recent transactions
  const recentTransactions = [...data.transactions]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 10);

  // Needs attention:
  // 1. Points expiring <= 30 days
  const thirtyDaysAheadIso = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  let expiringPointsTotal = 0;
  const expiringMembersList: Array<{ id: string; name: string; memberNo: string; points: number; expiresAt: string }> = [];

  for (const customer of data.customers) {
    const derived = deriveLedger(data.transactions, customer.id, now);
    let custExpiringPts = 0;
    let earliestExpiry = '';
    for (const lot of derived.lots) {
      if (lot.remaining > 0 && lot.expiresAt && lot.expiresAt >= nowIso && lot.expiresAt <= thirtyDaysAheadIso) {
        custExpiringPts += lot.remaining;
        if (!earliestExpiry || lot.expiresAt < earliestExpiry) {
          earliestExpiry = lot.expiresAt;
        }
      }
    }
    if (custExpiringPts > 0) {
      expiringPointsTotal += custExpiringPts;
      expiringMembersList.push({
        id: customer.id,
        name: customer.name,
        memberNo: customer.memberNo,
        points: custExpiringPts,
        expiresAt: earliestExpiry,
      });
    }
  }

  // 2. Unused vouchers expiring <= 7 days
  const sevenDaysAheadIso = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const expiringVouchersList: Array<{ id: string; code: string; customerId: string; customerName: string; title: string; expiresAt: string }> = [];
  const custNameMap = new Map(data.customers.map((c) => [c.id, c.name]));

  for (const v of data.vouchers) {
    if (v.status === 'issued' && v.expiresAt && v.expiresAt >= nowIso && v.expiresAt <= sevenDaysAheadIso) {
      expiringVouchersList.push({
        id: v.id,
        code: v.code,
        customerId: v.customerId,
        customerName: custNameMap.get(v.customerId) ?? 'Member',
        title: v.title,
        expiresAt: v.expiresAt,
      });
    }
  }

  const needsAttention: NeedsAttention = {
    expiringPoints: {
      totalPoints: expiringPointsTotal,
      memberCount: expiringMembersList.length,
      members: expiringMembersList,
    },
    celebrations: upcomingOccasions,
    expiringVouchers: expiringVouchersList,
  };

  return {
    rangePreset: preset,
    kpis: {
      totalMembers,
      activeMembers,
      totalSalesPaise,
      pointsIssued,
      pointsRedeemed,
      pointsLiability,
      liabilityRupees,
    },
    needsAttention,
    trendSeries,
    tierBreakdown,
    popularRewards,
    upcomingOccasions,
    recentTransactions,
  };
}
