import type { Campaign, LoyaltyConfig, Tier } from './types';
import { findBestCampaign } from './campaigns';

export interface EarnCalculationResult {
  eligible: boolean;
  reason?: 'below_minimum';
  amountPaise: number;
  basePoints: number;
  tierBonus: number;
  tierName: string;
  tierPct: number;
  campaignBonus: number;
  campaign?: Campaign;
  totalPoints: number;
  ruleSnapshot: {
    spendUnitPaise: number;
    pointsPerUnit: number;
    rounding: 'down' | 'nearest';
  };
}

export interface CalculateEarnInput {
  amountPaise: number;
  config: LoyaltyConfig['earning'];
  tier: Tier;
  campaigns?: Campaign[];
  at?: Date;
}

/**
 * Calculates Trove Points earned for a given purchase.
 * Pure integer arithmetic.
 */
export function calculateEarn({
  amountPaise,
  config,
  tier,
  campaigns = [],
  at = new Date(),
}: CalculateEarnInput): EarnCalculationResult {
  const ruleSnapshot = {
    spendUnitPaise: config.spendUnitPaise,
    pointsPerUnit: config.pointsPerUnit,
    rounding: config.rounding,
  };

  // Check minimum eligible spend (BR-6)
  if (amountPaise < config.minPurchasePaise) {
    return {
      eligible: false,
      reason: 'below_minimum',
      amountPaise,
      basePoints: 0,
      tierBonus: 0,
      tierName: tier.name,
      tierPct: tier.earnBonusPct,
      campaignBonus: 0,
      totalPoints: 0,
      ruleSnapshot,
    };
  }

  // Calculate units based on rounding mode (BR-4, BR-5)
  const units =
    config.rounding === 'down'
      ? Math.floor(amountPaise / config.spendUnitPaise)
      : Math.floor((amountPaise + config.spendUnitPaise / 2) / config.spendUnitPaise);

  const basePoints = units * config.pointsPerUnit;

  // Tier earn bonus % (BR-7)
  const tierBonus = Math.floor((basePoints * tier.earnBonusPct) / 100);

  // Campaign bonus (BR-8) — at most one best campaign
  const bestCampaignMatch = findBestCampaign(campaigns, basePoints, amountPaise, tier, at);
  const campaignBonus = bestCampaignMatch?.bonus ?? 0;

  const totalPoints = basePoints + tierBonus + campaignBonus;

  return {
    eligible: true,
    amountPaise,
    basePoints,
    tierBonus,
    tierName: tier.name,
    tierPct: tier.earnBonusPct,
    campaignBonus,
    campaign: bestCampaignMatch?.campaign,
    totalPoints,
    ruleSnapshot,
  };
}
