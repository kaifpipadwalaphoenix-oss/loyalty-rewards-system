import type { Campaign, Tier } from './types';

export interface CampaignCandidate {
  campaign: Campaign;
  bonus: number;
}

/**
 * Filter campaigns active and matching for a given purchase.
 */
export function applicableCampaigns(
  campaigns: Campaign[],
  amountPaise: number,
  tier: Tier,
  at: Date
): Campaign[] {
  const atIso = at.toISOString();
  const dayOfWeek = at.getDay(); // 0 = Sun ... 6 = Sat

  return campaigns.filter((c) => {
    if (!c.active) return false;
    if (atIso < c.startsAt || atIso > c.endsAt) return false;
    if (c.daysOfWeek && c.daysOfWeek.length > 0 && !c.daysOfWeek.includes(dayOfWeek)) {
      return false;
    }
    if (c.minSpendPaise !== undefined && amountPaise < c.minSpendPaise) {
      return false;
    }
    if (c.eligibleTierIds && c.eligibleTierIds.length > 0 && !c.eligibleTierIds.includes(tier.id)) {
      return false;
    }
    return true;
  });
}

/**
 * Calculates bonus points for a single campaign given base points.
 */
export function calculateCampaignBonus(campaign: Campaign, basePoints: number): number {
  if (campaign.type === 'multiplier') {
    const tenths = campaign.multiplierTenths ?? 10;
    if (tenths <= 10) return 0;
    return Math.floor((basePoints * (tenths - 10)) / 10);
  }
  return campaign.bonusPoints ?? 0;
}

/**
 * Finds the single best campaign bonus (no stacking per BR-8).
 * Tiebreaker: earliest startsAt, then alphabetical name.
 */
export function findBestCampaign(
  campaigns: Campaign[],
  basePoints: number,
  amountPaise: number,
  tier: Tier,
  at: Date
): CampaignCandidate | null {
  const candidates = applicableCampaigns(campaigns, amountPaise, tier, at);
  if (candidates.length === 0) return null;

  const scored: CampaignCandidate[] = candidates
    .map((c) => ({
      campaign: c,
      bonus: calculateCampaignBonus(c, basePoints),
    }))
    .filter((c) => c.bonus > 0);

  if (scored.length === 0) return null;

  scored.sort((a, b) => {
    if (b.bonus !== a.bonus) return b.bonus - a.bonus; // Highest bonus first
    if (a.campaign.startsAt !== b.campaign.startsAt) {
      return a.campaign.startsAt.localeCompare(b.campaign.startsAt); // Earliest start date
    }
    return a.campaign.name.localeCompare(b.campaign.name); // Alphabetical
  });

  return scored[0] || null;
}
