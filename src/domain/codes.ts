export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generates a unique, human-readable voucher code format: TC-XXXX-XXXX (BR-30).
 * Alphabet excludes easily confused characters (0, O, 1, I).
 */
export function generateVoucherCode(
  existingCodes: Set<string> = new Set(),
  rng?: () => number
): string {
  const chars = CODE_ALPHABET;
  let code = '';
  let attempts = 0;

  do {
    let part1 = '';
    let part2 = '';

    if (rng) {
      for (let i = 0; i < 4; i++) {
        part1 += chars[Math.floor(rng() * chars.length)];
      }
      for (let i = 4; i < 8; i++) {
        part2 += chars[Math.floor(rng() * chars.length)];
      }
    } else {
      const bytes = new Uint8Array(8);
      crypto.getRandomValues(bytes);

      for (let i = 0; i < 4; i++) {
        const byte = bytes[i];
        if (byte !== undefined) {
          part1 += chars[byte % chars.length];
        }
      }
      for (let i = 4; i < 8; i++) {
        const byte = bytes[i];
        if (byte !== undefined) {
          part2 += chars[byte % chars.length];
        }
      }
    }

    code = `TC-${part1}-${part2}`;
    attempts++;
  } while (existingCodes.has(code) && attempts < 50);

  return code;
}

/**
 * Normalises input code string: uppercase, strips spaces/dashes, re-inserts format (BL-39).
 * E.g. "tc 7k3m q9px" -> "TC-7K3M-Q9PX", "7K3MQ9PX" -> "TC-7K3M-Q9PX".
 */
export function normalizeVoucherCode(input: string): string {
  if (!input) return '';
  let cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (cleaned.startsWith('TC')) {
    cleaned = cleaned.slice(2);
  }

  if (cleaned.length !== 8) {
    return input.trim().toUpperCase();
  }

  const part1 = cleaned.slice(0, 4);
  const part2 = cleaned.slice(4, 8);
  return `TC-${part1}-${part2}`;
}

/**
 * Validates voucher code format.
 */
export function isValidVoucherCodeFormat(code: string): boolean {
  return /^TC-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(code);
}
