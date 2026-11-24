import { describe, it, expect } from 'vitest';
import { normaliseIndianMobile, formatMobile } from '@/lib/mobile';

describe('normaliseIndianMobile (TC-002)', () => {
  it('normalises 10 digits starting with 6-9 to +91XXXXXXXXXX', () => {
    expect(normaliseIndianMobile('9000000002')).toBe('+919000000002');
    expect(normaliseIndianMobile('9820098200')).toBe('+919820098200');
    expect(normaliseIndianMobile('7778889990')).toBe('+917778889990');
    expect(normaliseIndianMobile('6123456789')).toBe('+916123456789');
  });

  it('normalises with +91 prefix and formatting characters', () => {
    expect(normaliseIndianMobile('+91 90000 00002')).toBe('+919000000002');
    expect(normaliseIndianMobile('+91-98200-98200')).toBe('+919820098200');
    expect(normaliseIndianMobile('+91 (982) 009-8200')).toBe('+919820098200');
  });

  it('normalises 11 digits starting with 0', () => {
    expect(normaliseIndianMobile('09000000002')).toBe('+919000000002');
  });

  it('normalises 12 digits starting with 91', () => {
    expect(normaliseIndianMobile('919000000002')).toBe('+919000000002');
  });

  it('rejects invalid numbers', () => {
    expect(normaliseIndianMobile('')).toBeNull();
    expect(normaliseIndianMobile(null)).toBeNull();
    expect(normaliseIndianMobile('12345')).toBeNull(); // too short
    expect(normaliseIndianMobile('1234567890123')).toBeNull(); // too long
    expect(normaliseIndianMobile('5000000000')).toBeNull(); // does not start with 6-9
    expect(normaliseIndianMobile('05000000000')).toBeNull(); // starts with 05
    expect(normaliseIndianMobile('915000000000')).toBeNull(); // starts with 915
    expect(normaliseIndianMobile('abcdefghij')).toBeNull();
  });
});

describe('formatMobile (TC-025)', () => {
  it('formats E.164 and 10 digits as +91 XXXXX XXXXX', () => {
    expect(formatMobile('+919000000002')).toBe('+91 90000 00002');
    expect(formatMobile('9000000002')).toBe('+91 90000 00002');
    expect(formatMobile('09000000002')).toBe('+91 90000 00002');
  });

  it('returns empty string on empty input', () => {
    expect(formatMobile('')).toBe('');
    expect(formatMobile(null)).toBe('');
  });
});
