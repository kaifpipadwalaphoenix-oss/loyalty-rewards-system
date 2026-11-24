/**
 * Domain Money & Points conversion helpers.
 * All amounts in the system are stored as integer paise (₹1 = 100 paise).
 * Points are integers.
 */

export function parseRupeesToPaise(input: string): number | null {
  if (!input || typeof input !== 'string') return null;
  const cleaned = input.trim().replace(/,/g, '');
  if (!cleaned) return null;

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }

  const [rupeesStr, paiseStr = ''] = cleaned.split('.');
  if (!rupeesStr) return null;

  const rupees = parseInt(rupeesStr, 10);
  if (isNaN(rupees) || rupees < 0 || rupees > 10000000) {
    return null;
  }

  const paddedPaise = (paiseStr + '00').slice(0, 2);
  const fraction = parseInt(paddedPaise, 10);

  return rupees * 100 + fraction;
}

export function paiseToRupees(paise: number): number {
  return Math.floor(paise / 100);
}
