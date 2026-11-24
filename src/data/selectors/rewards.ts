import type { AppData, Reward } from '@/domain/types';
import { deriveLedger } from '@/domain/ledger';
import { qualifyingSpend, resolveTier } from '@/domain/tiers';
import { getRewardStockRemaining } from '@/domain/rewards';

export interface CatalogRewardItem {
  reward: Reward;
  canAfford: boolean;
  isTierEligible: boolean;
  isOutOfStock: boolean;
  hasReachedLimit: boolean;
  remainingStock: number | null;
  pointsGap: number;
}

export function selectAvailableRewards(
  data: AppData,
  customerId?: string,
  now: Date = new Date()
): CatalogRewardItem[] {
  let memberBalance = 0;
  let memberTierId: string | undefined;
  const nowIso = now.toISOString();

  if (customerId) {
    const customer = data.customers.find((c) => c.id === customerId);
    if (customer) {
      memberBalance = deriveLedger(data.transactions, customer.id, now).balance;
      const spend = qualifyingSpend(data.purchases, customer.id, now);
      memberTierId = resolveTier(spend, data.tiers).id;
    }
  }

  // Filter to active rewards within date windows
  const activeRewards = data.rewards.filter((r) => {
    if (r.status !== 'active') return false;
    if (r.startsAt && r.startsAt > nowIso) return false;
    if (r.endsAt && r.endsAt < nowIso) return false;
    return true;
  });

  return activeRewards.map((reward) => {
    const remainingStock = getRewardStockRemaining(reward, data.vouchers);
    const isOutOfStock = remainingStock !== null && remainingStock <= 0;
    const isTierEligible =
      !memberTierId ||
      reward.eligibleTierIds.length === 0 ||
      reward.eligibleTierIds.includes(memberTierId);

    const canAfford = memberBalance >= reward.pointsCost;
    const pointsGap = Math.max(0, reward.pointsCost - memberBalance);

    let hasReachedLimit = false;
    if (customerId && reward.perMemberLimit) {
      const claimedCount = data.vouchers.filter(
        (v) =>
          v.customerId === customerId &&
          v.rewardId === reward.id &&
          v.status !== 'cancelled'
      ).length;
      hasReachedLimit = claimedCount >= reward.perMemberLimit;
    }

    return {
      reward,
      canAfford,
      isTierEligible,
      isOutOfStock,
      hasReachedLimit,
      remainingStock,
      pointsGap,
    };
  });
}
