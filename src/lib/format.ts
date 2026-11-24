import { format as dateFnsFormat } from 'date-fns';

/**
 * Format paise into Indian Rupee display string with en-IN digit grouping.
 * E.g. 499000 -> "₹4,990", 499050 -> "₹4,990.50"
 */
export function formatRupees(paise: number, showPaise = true): string {
  const rupees = showPaise ? Math.floor(Math.abs(paise) / 100) : Math.round(Math.abs(paise) / 100);
  const remainderPaise = Math.abs(paise) % 100;
  const sign = paise < 0 ? '-' : '';

  const formattedRupees = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(rupees);

  if (!showPaise || remainderPaise === 0) {
    return `${sign}₹${formattedRupees}`;
  }

  const paddedPaise = remainderPaise.toString().padStart(2, '0');
  return `${sign}₹${formattedRupees}.${paddedPaise}`;
}

/**
 * Format points count with en-IN digit grouping.
 * E.g. 1240 -> "1,240 pts" (or "1,240 points" if fullWord is true)
 */
export function formatPoints(points: number, fullWord = false): string {
  const sign = points < 0 ? '-' : '';
  const formatted = new Intl.NumberFormat('en-IN').format(Math.abs(points));
  const suffix = fullWord ? (Math.abs(points) === 1 ? ' point' : ' points') : ' pts';
  return `${sign}${formatted}${suffix}`;
}

/**
 * Format an ISO string or Date object in Indian English format (e.g., 24 Nov 2026).
 */
export function formatDate(date: string | Date, formatStr = 'dd MMM yyyy'): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return dateFnsFormat(d, formatStr);
  } catch {
    return '';
  }
}

/**
 * Format date & time (e.g., 24 Nov 2026, 4:32 pm)
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'dd MMM yyyy, h:mm a');
}

/**
 * Format Indian mobile number (+91XXXXXXXXXX) into "+91 98765 43210" or "98765 43210".
 */
export function formatMobile(mobile: string, includePrefix = true): string {
  const cleaned = mobile.replace(/\D/g, '');
  const digits = cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;
  if (digits.length !== 10) return mobile;

  const part1 = digits.slice(0, 5);
  const part2 = digits.slice(5);

  return includePrefix ? `+91 ${part1} ${part2}` : `${part1} ${part2}`;
}

/**
 * Mask mobile number, showing only the last 4 digits (e.g., "••••• 00002" or "+91 ••••• 00002")
 */
export function maskMobile(mobile: string, includePrefix = true): string {
  const cleaned = mobile.replace(/\D/g, '');
  const digits = cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;
  if (digits.length !== 10) return mobile;

  const last4 = digits.slice(6);
  return includePrefix ? `+91 ••••• •${last4}` : `••••• •${last4}`;
}
