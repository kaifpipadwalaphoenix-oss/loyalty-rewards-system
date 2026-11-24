import {
  endOfMonth,
  addMonths,
  isLeapYear,
  startOfDay,
  differenceInCalendarDays,
} from 'date-fns';

/**
 * Returns the end of the month in local time at 23:59:59.999.
 */
export function endOfMonthLocal(date: Date): Date {
  const eom = endOfMonth(date);
  eom.setHours(23, 59, 59, 999);
  return eom;
}

/**
 * Safely adds months and returns the end of that month.
 */
export function addMonthsEndOfMonth(date: Date, months: number): Date {
  const future = addMonths(date, months);
  return endOfMonthLocal(future);
}

/**
 * Compare calendar dates: checks if target calendar date is within `days` from reference date (today <= target <= today + days).
 */
export function isCalendarDateWithinDays(targetDate: Date, fromDate: Date, days: number): boolean {
  const targetStart = startOfDay(targetDate);
  const fromStart = startOfDay(fromDate);
  const diffDays = differenceInCalendarDays(targetStart, fromStart);
  return diffDays >= 0 && diffDays <= days;
}

/**
 * Returns previous and next calendar occurrences of an annual day/month occasion relative to `now`.
 * 29 Feb birthdays are celebrated on 28 Feb in non-leap years (BR-36).
 */
export function occurrencesAround(
  day: number,
  month: number, // 1..12
  now: Date
): { prev: Date; next: Date } {
  const currentYear = now.getFullYear();

  function buildDate(d: number, m: number, y: number): Date {
    let effectiveDay = d;
    if (m === 2 && d === 29 && !isLeapYear(new Date(y, 1, 1))) {
      effectiveDay = 28;
    }
    // Set to local noon to avoid any midnight timezone edge cases
    return new Date(y, m - 1, effectiveDay, 12, 0, 0, 0);
  }

  const thisYearDate = buildDate(day, month, currentYear);
  const startOfToday = startOfDay(now);

  if (startOfDay(thisYearDate) < startOfToday) {
    // Already occurred this year -> prev is this year, next is next year
    return {
      prev: thisYearDate,
      next: buildDate(day, month, currentYear + 1),
    };
  } else {
    // Occurring today or later this year -> prev is last year, next is this year
    return {
      prev: buildDate(day, month, currentYear - 1),
      next: thisYearDate,
    };
  }
}
