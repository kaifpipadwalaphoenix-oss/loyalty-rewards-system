import type { LoyaltyConfig } from './types';
import { addMonthsEndOfMonth } from './dates';

/**
 * Calculates the expiry ISO timestamp for a new points credit.
 * In 'fixed_months' mode, points expire at the end of the month N months after credit (BR-15).
 */
export function expiryDateFor(
  arg1: Date | LoyaltyConfig['expiry'],
  arg2: Date | LoyaltyConfig['expiry']
): string | null {
  const at = arg1 instanceof Date ? arg1 : (arg2 as Date);
  const config = arg1 instanceof Date ? (arg2 as LoyaltyConfig['expiry']) : arg1;
  if (config.mode === 'none') {
    return null;
  }
  const eom = addMonthsEndOfMonth(at, config.months);
  return eom.toISOString();
}
