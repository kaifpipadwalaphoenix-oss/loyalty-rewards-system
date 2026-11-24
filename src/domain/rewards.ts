import type { IssuedVoucher, Reward, Tier } from './types';
import { formatDate } from '@/lib/format';

export type EligibilityCode =
  | 'ok'
  | 'inactive'
  | 'not_started'
  | 'ended'
  | 'out_of_stock'
  | 'tier_not_eligible'
  | 'member_limit_reached'
  | 'insufficient_points';

export interface EligibilityResult {
  code: EligibilityCode;
  eligible: boolean;
  message: string;
  actionHint?: string;
}

/**
 * Derives current remaining stock for a reward from issued vouchers (BR-30, BR-44).
 * Cancelled vouchers do not count toward stock limit exhaustion.
 */
export function getRewardStockRemaining(
  reward: Reward,
  vouchers: IssuedVoucher[]
): number | null {
  if (reward.stockLimit === undefined || reward.stockLimit === null) {
    return null; // Unlimited stock
  }

  // Count vouchers for this reward that are issued or used (not cancelled)
  const issuedCount = vouchers.filter(
    (v) => v.rewardId === reward.id && v.status !== 'cancelled'
  ).length;

  return Math.max(0, reward.stockLimit - issuedCount);
}

/**
 * Pure check of reward redemption eligibility.
 * Evaluates conditions in the exact order defined in BR-29 & Tech Arch §6.6.
 */
export function checkRewardEligibility(
  reward: Reward,
  memberTier: Tier,
  availablePoints: number,
  customerId: string,
  allVouchers: IssuedVoucher[],
  allTiers: Tier[] = [],
  now: Date = new Date()
): EligibilityResult {
  const nowIso = now.toISOString();

  // 1. Inactive or archived
  if (reward.status !== 'active') {
    return {
      code: 'inactive',
      eligible: false,
      message: 'This treat is currently unavailable.',
    };
  }

  // 2. Not started
  if (reward.startsAt && nowIso < reward.startsAt) {
    return {
      code: 'not_started',
      eligible: false,
      message: `Available from ${formatDate(reward.startsAt)}.`,
    };
  }

  // 3. Ended
  if (reward.endsAt && nowIso > reward.endsAt) {
    return {
      code: 'ended',
      eligible: false,
      message: 'This treat has ended.',
    };
  }

  // 4. Stock limit (derived from non-cancelled vouchers)
  const stockLeft = getRewardStockRemaining(reward, allVouchers);
  if (stockLeft !== null && stockLeft <= 0) {
    return {
      code: 'out_of_stock',
      eligible: false,
      message: 'Fully redeemed.',
    };
  }

  // 5. Tier eligibility
  if (reward.eligibleTierIds.length > 0 && !reward.eligibleTierIds.includes(memberTier.id)) {
    const requiredTiers = allTiers.filter((t) => reward.eligibleTierIds.includes(t.id));
    const lowestRequired = requiredTiers.sort((a, b) => a.rank - b.rank)[0];
    const tierName = lowestRequired?.name || 'Higher';
    return {
      code: 'tier_not_eligible',
      eligible: false,
      message: `Available from ${tierName}.`,
      actionHint: `Reach ${tierName} tier to unlock this treat.`,
    };
  }

  // 6. Per-member limit
  if (reward.perMemberLimit !== undefined && reward.perMemberLimit > 0) {
    const memberRedemptions = allVouchers.filter(
      (v) => v.rewardId === reward.id && v.customerId === customerId && v.status !== 'cancelled'
    ).length;

    if (memberRedemptions >= reward.perMemberLimit) {
      return {
        code: 'member_limit_reached',
        eligible: false,
        message: 'You have reached the redemption limit for this treat.',
      };
    }
  }

  // 7. Insufficient points
  if (availablePoints < reward.pointsCost) {
    const deficit = reward.pointsCost - availablePoints;
    return {
      code: 'insufficient_points',
      eligible: false,
      message: `You need ${deficit} more points.`,
      actionHint: `Earn points on your next purchase to unlock.`,
    };
  }

  // 8. OK!
  return {
    code: 'ok',
    eligible: true,
    message: 'You can redeem this treat.',
  };
}
