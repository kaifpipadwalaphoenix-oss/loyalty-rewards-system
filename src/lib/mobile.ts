/**
 * Normalises an Indian mobile number to canonical E.164 format (+91XXXXXXXXXX).
 * Accepts:
 * - 10 digits starting with 6, 7, 8, 9 (e.g. "9000000002")
 * - 11 digits starting with 0 followed by 6-9 (e.g. "09000000002")
 * - 12 digits starting with 91 followed by 6-9 (e.g. "919000000002")
 * - Strings with "+91", spaces, hyphens, parentheses (e.g. "+91 90000 00002")
 * Returns null if the number cannot be parsed into a valid 10-digit Indian mobile.
 */
export function normaliseIndianMobile(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') return null;

  // Strip all non-digit characters
  const digits = input.replace(/\D/g, '');

  let tenDigits = '';

  if (digits.length === 10) {
    tenDigits = digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    tenDigits = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith('91')) {
    tenDigits = digits.slice(2);
  } else {
    return null;
  }

  // Indian mobile numbers must start with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(tenDigits)) {
    return null;
  }

  return `+91${tenDigits}`;
}

/**
 * Formats an E.164 or raw Indian mobile number for display:
 * "+919000000002" -> "+91 90000 00002"
 * "9000000002" -> "+91 90000 00002"
 */
export function formatMobile(input: string | null | undefined): string {
  if (!input) return '';
  const norm = normaliseIndianMobile(input);
  if (!norm) return input; // Return raw if invalid

  // norm is +91XXXXXXXXXX (length 13)
  const code = norm.slice(0, 3); // +91
  const first5 = norm.slice(3, 8); // XXXXX
  const last5 = norm.slice(8); // XXXXX

  return `${code} ${first5} ${last5}`;
}
