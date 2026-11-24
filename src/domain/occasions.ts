import { addDays, subDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import type { Customer, LoyaltyConfig, OccasionGrant, OccasionRule, Tier } from './types';
import { occurrencesAround } from './dates';

export interface DueOccasionGrantAction {
  key: string; // occasion:{ruleId}:{customerId}:{occurrenceYear}
  rule: OccasionRule;
  customer: Customer;
  occurrenceDate: string; // ISO date of the occasion itself
  windowStart: string;
  windowEnd: string;
}

/**
 * Evaluates whether an occasion occurrence window is currently open (BR-39).
 * window = [occurrence - unlockDaysBefore, occurrence - unlockDaysBefore + validityDays]
 */
export function isOccasionWindowOpen(
  occurrenceDate: Date,
  unlockDaysBefore: number,
  validityDays: number,
  now: Date
): { isOpen: boolean; windowStart: Date; windowEnd: Date } {
  const windowStart = subDays(startOfDay(occurrenceDate), unlockDaysBefore);
  const windowEnd = addDays(windowStart, validityDays);
  windowEnd.setHours(23, 59, 59, 999);

  const isOpen = now >= windowStart && now <= windowEnd;
  return { isOpen, windowStart, windowEnd };
}

/**
 * Evaluates whether customer's occasion date was on file for the required anti-abuse period (BR-40).
 */
export function isDateOnFileEligible(
  dateSetAt: string | undefined,
  occurrenceDate: Date,
  minDaysOnFile: number
): boolean {
  if (!dateSetAt) return false;
  const setDate = new Date(dateSetAt);
  const diffDays = differenceInCalendarDays(occurrenceDate, setDate);
  return diffDays >= minDaysOnFile;
}

/**
 * Finds all due occasion grants across all active rules and customers.
 * Evaluates BOTH the previous and next occurrence to protect members whose first visit
 * after unlock happens after the occasion date (BR-39, Tech Arch §6.7).
 */
export function findDueOccasionGrants(
  customers: Customer[],
  rules: OccasionRule[],
  config: LoyaltyConfig,
  existingGrants: OccasionGrant[],
  customerTiers: Map<string, Tier>,
  now: Date = new Date()
): DueOccasionGrantAction[] {
  const dueActions: DueOccasionGrantAction[] = [];
  const existingKeySet = new Set(existingGrants.map((g) => g.key));

  for (const customer of customers) {
    const tier = customerTiers.get(customer.id);
    if (!tier) continue;

    for (const rule of rules) {
      if (!rule.active) continue;

      // Tier check
      if (rule.eligibleTierIds.length > 0 && !rule.eligibleTierIds.includes(tier.id)) {
        continue;
      }

      // Check occasion date details
      const occasionDateInfo =
        rule.occasion === 'birthday' ? customer.birthday : customer.anniversary;

      if (!occasionDateInfo || !occasionDateInfo.day || !occasionDateInfo.month) {
        continue;
      }

      // Anniversary requires Married marital status (BR-37, BR-39)
      if (rule.occasion === 'anniversary' && customer.maritalStatus !== 'married') {
        continue;
      }

      const dateSetAt =
        rule.occasion === 'birthday'
          ? customer.occasionDates.birthdaySetAt
          : customer.occasionDates.anniversarySetAt;

      // Evaluate both previous and next occurrences
      const { prev, next } = occurrencesAround(
        occasionDateInfo.day,
        occasionDateInfo.month,
        now
      );

      for (const occurrence of [prev, next]) {
        const occurrenceYear = occurrence.getFullYear();
        const idempotencyKey = `occasion:${rule.id}:${customer.id}:${occurrenceYear}`;

        if (existingKeySet.has(idempotencyKey)) {
          continue; // Already granted for this occurrence year
        }

        // Anti-abuse check (BR-40)
        if (!isDateOnFileEligible(dateSetAt, occurrence, config.occasionMinDaysOnFile)) {
          continue;
        }

        // Window check (BR-39)
        const { isOpen, windowStart, windowEnd } = isOccasionWindowOpen(
          occurrence,
          rule.unlockDaysBefore,
          rule.validityDays,
          now
        );

        if (isOpen) {
          dueActions.push({
            key: idempotencyKey,
            rule,
            customer,
            occurrenceDate: occurrence.toISOString(),
            windowStart: windowStart.toISOString(),
            windowEnd: windowEnd.toISOString(),
          });
          // Avoid duplicate push in same run
          existingKeySet.add(idempotencyKey);
        }
      }
    }
  }

  return dueActions;
}

export interface UpcomingOccasion {
  occasion: 'birthday' | 'anniversary';
  date: Date;
  daysAway: number;
  unlocked: boolean;
  unlockDate: Date;
  applicableRules: OccasionRule[];
}

/**
 * Returns customer's upcoming birthday or anniversary within 30 days (for dashboard display).
 * Only returns if at least one active rule applies to customer (BR-41).
 */
export function getUpcomingOccasions(
  customer: Customer,
  rules: OccasionRule[],
  tier: Tier,
  now: Date = new Date()
): UpcomingOccasion[] {
  const results: UpcomingOccasion[] = [];
  const occasions: ('birthday' | 'anniversary')[] = ['birthday', 'anniversary'];

  for (const occ of occasions) {
    if (occ === 'anniversary' && customer.maritalStatus !== 'married') {
      continue;
    }

    const info = occ === 'birthday' ? customer.birthday : customer.anniversary;
    if (!info || !info.day || !info.month) continue;

    const applicableRules = rules.filter(
      (r) =>
        r.active &&
        r.occasion === occ &&
        (r.eligibleTierIds.length === 0 || r.eligibleTierIds.includes(tier.id))
    );

    if (applicableRules.length === 0) continue;

    const { next } = occurrencesAround(info.day, info.month, now);
    const daysAway = differenceInCalendarDays(startOfDay(next), startOfDay(now));

    // Show from 30 days before
    if (daysAway >= 0 && daysAway <= 30) {
      // Find unlock date from rules (min unlockDaysBefore)
      const maxUnlockDaysBefore = Math.max(...applicableRules.map((r) => r.unlockDaysBefore));
      const unlockDate = subDays(startOfDay(next), maxUnlockDaysBefore);
      const unlocked = now >= unlockDate;

      results.push({
        occasion: occ,
        date: next,
        daysAway,
        unlocked,
        unlockDate,
        applicableRules,
      });
    }
  }

  return results;
}
