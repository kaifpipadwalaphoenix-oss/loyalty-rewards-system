import { describe, it, expect } from 'vitest';
import { formatRupees, formatPoints, formatDate, formatMobile, maskMobile } from '@/lib/format';

describe('format utilities', () => {
  it('formats rupees with en-IN digit grouping without decimals when paise is 0', () => {
    expect(formatRupees(10000000)).toBe('₹1,00,000');
    expect(formatRupees(499000)).toBe('₹4,990');
    expect(formatRupees(0)).toBe('₹0');
    expect(formatRupees(-200000)).toBe('-₹2,000');
  });

  it('formats rupees with decimals when fractional paise exist', () => {
    expect(formatRupees(499050)).toBe('₹4,990.50');
    expect(formatRupees(105)).toBe('₹1.05');
  });

  it('formats points with en-IN digit grouping', () => {
    expect(formatPoints(1240)).toBe('1,240 pts');
    expect(formatPoints(1240, true)).toBe('1,240 points');
    expect(formatPoints(1, true)).toBe('1 point');
    expect(formatPoints(0)).toBe('0 pts');
    expect(formatPoints(-500)).toBe('-500 pts');
  });

  it('formats dates in en-IN style', () => {
    const iso = '2026-11-24T12:00:00+05:30';
    expect(formatDate(iso)).toBe('24 Nov 2026');
  });

  it('formats and masks mobile numbers', () => {
    expect(formatMobile('+919876543210')).toBe('+91 98765 43210');
    expect(formatMobile('9876543210', false)).toBe('98765 43210');
    expect(maskMobile('+919000000002')).toBe('+91 ••••• •0002');
  });
});
