import { differenceInDays } from 'date-fns';
import type { Customer, Purchase, Tier } from './types';

/**
 * Calculates customer's qualifying spend in paise.
 * Sum of eligible, non-voided purchases in the qualification window (BR-22).
 */
export function qualifyingSpend(
  arg1: string | Purchase[],
  arg2: string | Purchase[],
  now: Date = new Date(),
  window: 'rolling_12m' | 'lifetime' = 'rolling_12m'
): number {
  const customerId = typeof arg1 === 'string' ? arg1 : (arg2 as string);
  const purchases = Array.isArray(arg1) ? arg1 : (arg2 as Purchase[]);

  return purchases
    .filter((p) => {
      if (p.customerId !== customerId) return false;
      if (!p.eligible) return false;
      if (p.voided) return false;

      if (window === 'rolling_12m') {
        const purchaseDate = new Date(p.at);
        const diff = differenceInDays(now, purchaseDate);
        // Inside 365 days
        return diff >= 0 && diff <= 365;
      }

      return true;
    })
    .reduce((sum, p) => sum + p.amountPaise, 0);
}

/**
 * Resolves current tier based on qualifying spend and active tiers (BR-23).
 */
export function resolveTier(spendPaise: number, tiers: Tier[]): Tier {
  const activeTiers = tiers.filter((t) => t.active).sort((a, b) => b.rank - a.rank);
  const matched = activeTiers.find((t) => spendPaise >= t.thresholdPaise);
  if (matched) return matched;

  // Fallback to lowest active tier
  const lowest = tiers.filter((t) => t.active).sort((a, b) => a.rank - b.rank)[0];
  if (!lowest) {
    throw new Error('At least one active tier must exist');
  }
  return lowest;
}

export interface TierProgress {
  currentTier: Tier;
  nextTier: Tier | null;
  spendPaise: number;
  remainingPaise: number;
  progressPct: number;
}

/**
 * Calculates tier progress towards next tier.
 */
export function tierProgress(
  spendPaise: number,
  currentTier: Tier,
  tiers: Tier[]
): TierProgress {
  const activeTiers = tiers.filter((t) => t.active).sort((a, b) => a.rank - b.rank);
  const nextTier = activeTiers.find((t) => t.rank > currentTier.rank) || null;

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      spendPaise,
      remainingPaise: 0,
      progressPct: 100,
    };
  }

  const range = nextTier.thresholdPaise - currentTier.thresholdPaise;
  const progressAmount = spendPaise - currentTier.thresholdPaise;
  const progressPct = range > 0 ? Math.min(100, Math.max(0, Math.round((progressAmount / range) * 100))) : 0;
  const remainingPaise = Math.max(0, nextTier.thresholdPaise - spendPaise);

  return {
    currentTier,
    nextTier,
    spendPaise,
    remainingPaise,
    progressPct,
  };
}

export interface TierImpactResult {
  movingUp: number;
  movingDown: number;
  unchanged: number;
}

/**
 * Calculates how many members will move up or down when changing tier thresholds (BR-24, Tech Arch §6.5).
 */
export function tierImpact(
  customers: Customer[],
  purchases: Purchase[],
  oldTiers: Tier[],
  newTiers: Tier[],
  now: Date = new Date(),
  window: 'rolling_12m' | 'lifetime' = 'rolling_12m'
): TierImpactResult {
  let movingUp = 0;
  let movingDown = 0;
  let unchanged = 0;

  for (const customer of customers) {
    const spend = qualifyingSpend(customer.id, purchases, now, window);
    const oldTier = resolveTier(spend, oldTiers);
    const newTier = resolveTier(spend, newTiers);

    if (newTier.rank > oldTier.rank) {
      movingUp++;
    } else if (newTier.rank < oldTier.rank) {
      movingDown++;
    } else {
      unchanged++;
    }
  }

  return { movingUp, movingDown, unchanged };
}
