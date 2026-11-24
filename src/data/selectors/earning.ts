import type { AppData } from '@/domain/types';
import { calculateEarn } from '@/domain/earning';
import { deriveLedger } from '@/domain/ledger';
import { qualifyingSpend, resolveTier } from '@/domain/tiers';

export interface EarnPreview {
  eligible: boolean;
  minPurchasePaise: number;
  reason?: 'below_minimum';
  amountPaise: number;
  basePoints: number;
  rateLabel: string;
  tierBonus: number;
  tierName: string;
  tierPct: number;
  campaignBonus: number;
  campaignName?: string;
  totalPoints: number;
  currentBalance: number;
  newBalance: number;
}

/**
 * Single source of truth for purchase earning preview (TC-003, D1).
 * Used by cashier counter, admin simulation, and customer examples.
 */
export function selectEarnPreview(
  data: AppData,
  customerId: string,
  amountPaise: number,
  now: Date = new Date()
): EarnPreview | null {
  const customer = data.customers.find((c) => c.id === customerId);
  if (!customer) return null;

  const spend = qualifyingSpend(customer.id, data.purchases, now);
  const tier = resolveTier(spend, data.tiers);
  const ledger = deriveLedger(data.transactions, customer.id, now);

  const earn = calculateEarn({
    amountPaise,
    config: data.config.earning,
    tier,
    campaigns: data.campaigns,
    at: now,
  });

  const ratePerRupees = Math.round(data.config.earning.spendUnitPaise / 100);
  const rateLabel = `${data.config.earning.pointsPerUnit} pts per ₹${ratePerRupees}`;

  return {
    eligible: earn.eligible,
    minPurchasePaise: data.config.earning.minPurchasePaise,
    reason: earn.reason,
    amountPaise,
    basePoints: earn.basePoints,
    rateLabel,
    tierBonus: earn.tierBonus,
    tierName: earn.tierName,
    tierPct: earn.tierPct,
    campaignBonus: earn.campaignBonus,
    campaignName: earn.campaign?.name,
    totalPoints: earn.totalPoints,
    currentBalance: ledger.balance,
    newBalance: ledger.balance + earn.totalPoints,
  };
}
