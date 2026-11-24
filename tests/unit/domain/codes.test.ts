import { describe, it, expect } from 'vitest';
import {
  generateVoucherCode,
  normalizeVoucherCode,
  isValidVoucherCodeFormat,
} from '@/domain/codes';
import { buildSeed } from '@/data/seed/buildSeed';

describe('Domain: Voucher Codes (BL-38, BL-39)', () => {
  it('BL-38: generates valid voucher code format without ambiguous characters (0, O, 1, I)', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateVoucherCode();
      expect(isValidVoucherCodeFormat(code)).toBe(true);
      expect(code).not.toMatch(/[0O1I]/);
    }
  });

  it('BL-39: normalises lowercase, spaced, or dashless voucher codes', () => {
    expect(normalizeVoucherCode('tc 7k3m q9px')).toBe('TC-7K3M-Q9PX');
    expect(normalizeVoucherCode('7k3mq9px')).toBe('TC-7K3M-Q9PX');
    expect(normalizeVoucherCode('TC-7K3M-Q9PX')).toBe('TC-7K3M-Q9PX');
    expect(normalizeVoucherCode('tc-7k3m-q9px')).toBe('TC-7K3M-Q9PX');
  });

  it('NX-018: all seeded vouchers comply with Crockford Base32 format TC-XXXX-XXXX', () => {
    const seed = buildSeed();
    expect(seed.vouchers.length).toBeGreaterThan(0);
    for (const v of seed.vouchers) {
      expect(
        isValidVoucherCodeFormat(v.code),
        `Voucher ${v.id} has invalid code "${v.code}"`
      ).toBe(true);
    }
  });
});
