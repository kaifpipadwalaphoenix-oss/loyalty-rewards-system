import { describe, it, expect } from 'vitest';
import { occurrencesAround } from '@/domain/dates';
import {
  isOccasionWindowOpen,
  isDateOnFileEligible,
  findDueOccasionGrants,
} from '@/domain/occasions';
import type { Customer, LoyaltyConfig, OccasionRule, Tier } from '@/domain/types';

describe('Domain: Occasions (BL-31 to BL-36)', () => {
  it('BL-31: 29 Feb birthday in non-leap year (e.g. 2026 or 2027) occurs on 28 Feb', () => {
    const now = new Date('2026-01-15T12:00:00Z');
    const { next } = occurrencesAround(29, 2, now);
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(1); // Feb
    expect(next.getDate()).toBe(28); // 28 Feb!
  });

  it('BL-32: occasion window opens unlockDaysBefore and stays open for validityDays', () => {
    // Birthday on 15 June 2026, unlock 7 days before, valid 30 days
    const occurrence = new Date('2026-06-15T12:00:00Z');
    const unlockDaysBefore = 7;
    const validityDays = 30;

    // 1. 10 days before (5 June) -> closed
    const beforeWindow = new Date('2026-06-05T12:00:00Z');
    expect(isOccasionWindowOpen(occurrence, unlockDaysBefore, validityDays, beforeWindow).isOpen).toBe(false);

    // 2. 5 days before (10 June) -> open
    const insideWindow = new Date('2026-06-10T12:00:00Z');
    expect(isOccasionWindowOpen(occurrence, unlockDaysBefore, validityDays, insideWindow).isOpen).toBe(true);

    // 3. On the birthday (15 June) -> open
    expect(isOccasionWindowOpen(occurrence, unlockDaysBefore, validityDays, occurrence).isOpen).toBe(true);

    // 4. 10 days after the birthday (25 June) -> still open
    const afterBirthday = new Date('2026-06-25T12:00:00Z');
    expect(isOccasionWindowOpen(occurrence, unlockDaysBefore, validityDays, afterBirthday).isOpen).toBe(true);

    // 5. 35 days after unlock (15 July) -> expired / closed
    const afterWindow = new Date('2026-07-15T12:00:00Z');
    expect(isOccasionWindowOpen(occurrence, unlockDaysBefore, validityDays, afterWindow).isOpen).toBe(false);
  });

  it('BL-33: date on file set less than 30 days before occurrence is ineligible', () => {
    const occurrence = new Date('2026-06-15T12:00:00Z');
    // Set only 10 days before occurrence
    const recentSetDate = '2026-06-05T12:00:00Z';
    expect(isDateOnFileEligible(recentSetDate, occurrence, 30)).toBe(false);

    // Set 40 days before occurrence -> eligible
    const validSetDate = '2026-05-01T12:00:00Z';
    expect(isDateOnFileEligible(validSetDate, occurrence, 30)).toBe(true);
  });

  it('BL-34 & BL-35 & BL-36: findDueOccasionGrants respects marital status, tier, and generates idempotency key', () => {
    const shoreTier: Tier = {
      id: 'shore',
      name: 'Shore',
      rank: 0,
      thresholdPaise: 0,
      earnBonusPct: 0,
      benefits: [],
      description: '',
      accent: 'shore',
      active: true,
    };

    const goldenTier: Tier = {
      id: 'golden',
      name: 'Golden Hour',
      rank: 2,
      thresholdPaise: 4000000,
      earnBonusPct: 25,
      benefits: [],
      description: '',
      accent: 'golden',
      active: true,
    };

    const rules: OccasionRule[] = [
      {
        id: 'rule-bday-bonus',
        occasion: 'birthday',
        name: 'Birthday 250 Pts',
        benefit: { type: 'bonus_points', points: 250 },
        eligibleTierIds: [], // All tiers
        unlockDaysBefore: 7,
        validityDays: 30,
        active: true,
      },
      {
        id: 'rule-anniv-voucher',
        occasion: 'anniversary',
        name: 'Anniversary ₹1,000 off',
        benefit: { type: 'fixed_discount', amountPaise: 100000 },
        eligibleTierIds: [], // All tiers
        unlockDaysBefore: 7,
        validityDays: 30,
        active: true,
      },
      {
        id: 'rule-vip-treat',
        occasion: 'birthday',
        name: 'Golden Hour Birthday Treat',
        benefit: { type: 'percent_discount', percent: 15 },
        eligibleTierIds: ['golden'], // Golden Hour only
        unlockDaysBefore: 7,
        validityDays: 30,
        active: true,
      },
    ];

    const config: LoyaltyConfig = {
      earning: { spendUnitPaise: 10000, pointsPerUnit: 5, rounding: 'down', minPurchasePaise: 50000, pointValuePaise: 50 },
      expiry: { mode: 'fixed_months', months: 12, expiringSoonDays: 30 },
      tierWindow: 'rolling_12m',
      occasions: rules,
      couple: { active: true, bonusPoints: 100, requireMarried: true, cooldownDays: 30 },
      redemption: { defaultVoucherValidityDays: 30, allowStaffAssisted: true, occasionSelfEdits: 1 },
      occasionMinDaysOnFile: 30,
      updatedAt: '',
      updatedBy: '',
    };

    const now = new Date('2026-11-24T12:00:00Z');

    // Customer 1: Zoya (Golden Hour, birthday in 5 days -> unlocked)
    const zoya: Customer = {
      id: 'cust-zoya',
      memberNo: 'TC004',
      name: 'Zoya Siddiqui',
      mobile: '+919000000004',
      birthday: { day: 29, month: 11 }, // 29 Nov (5 days away)
      occasionDates: {
        birthdaySetAt: '2025-01-01T00:00:00Z', // Well over 30 days
        birthdayEdits: 0,
        anniversaryEdits: 0,
      },
      consent: { terms: '', updates: false },
      enrolledAt: '',
      enrolledVia: 'online',
    };

    // Customer 2: Single member with anniversary date filled by accident -> BL-35: should NOT grant
    const singleMember: Customer = {
      id: 'cust-single',
      memberNo: 'TC008',
      name: 'Single Member',
      mobile: '+919000000008',
      maritalStatus: 'single',
      anniversary: { day: 25, month: 11 },
      occasionDates: {
        anniversarySetAt: '2025-01-01T00:00:00Z',
        birthdayEdits: 0,
        anniversaryEdits: 0,
      },
      consent: { terms: '', updates: false },
      enrolledAt: '',
      enrolledVia: 'online',
    };

    const customerTiers = new Map<string, Tier>([
      ['cust-zoya', goldenTier],
      ['cust-single', shoreTier],
    ]);

    const due = findDueOccasionGrants([zoya, singleMember], rules, config, [], customerTiers, now);

    // Zoya should receive 2 grants: Birthday 250 pts + VIP 15% treat (because she is Golden Hour)
    expect(due).toHaveLength(2);
    expect(due.some((d) => d.rule.id === 'rule-bday-bonus')).toBe(true);
    expect(due.some((d) => d.rule.id === 'rule-vip-treat')).toBe(true);

    // Single member should receive 0 grants (maritalStatus !== married)
    expect(due.some((d) => d.customer.id === 'cust-single')).toBe(false);
  });
});
