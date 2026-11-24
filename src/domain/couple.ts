import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import type { CoupleVisit, Customer, LoyaltyConfig } from './types';
import { formatDate } from '@/lib/format';

export interface CoupleVisitEligibilityResult {
  eligible: boolean;
  reason?: string;
  nextEligibleAt?: string;
  bonusPoints: number;
}

/**
 * Checks if a member is currently eligible for the in-store couple visit bonus (BR-42, BR-43, BR-44).
 */
export function checkCoupleVisitEligibility(
  customer: Customer,
  coupleVisits: CoupleVisit[],
  config: LoyaltyConfig['couple'],
  now: Date = new Date()
): CoupleVisitEligibilityResult {
  const bonusPoints = config.bonusPoints;

  // 1. Program active check
  if (!config.active) {
    return {
      eligible: false,
      reason: 'Couple visit bonus is currently inactive.',
      bonusPoints,
    };
  }

  // 2. Marital status check
  if (config.requireMarried && customer.maritalStatus !== 'married') {
    return {
      eligible: false,
      reason: 'Member profile requires marital status "Married" to receive this treat.',
      bonusPoints,
    };
  }

  // 3. Cooldown check based on member's last visit
  const memberVisits = coupleVisits
    .filter((v) => v.customerId === customer.id)
    .sort((a, b) => b.at.localeCompare(a.at));

  const lastVisit = memberVisits[0];
  if (lastVisit) {
    const lastDate = new Date(lastVisit.at);
    const calendarDaysPassed = differenceInCalendarDays(startOfDay(now), startOfDay(lastDate));

    if (calendarDaysPassed < config.cooldownDays) {
      const nextEligibleDate = addDays(startOfDay(lastDate), config.cooldownDays);
      return {
        eligible: false,
        reason: `Last couple visit recorded ${calendarDaysPassed} day${calendarDaysPassed === 1 ? '' : 's'} ago. Next eligible on ${formatDate(nextEligibleDate)}.`,
        nextEligibleAt: nextEligibleDate.toISOString(),
        bonusPoints,
      };
    }
  }

  // Eligible!
  return {
    eligible: true,
    bonusPoints,
  };
}
