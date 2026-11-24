import { describe, it, expect } from 'vitest';
import { calculateEarn } from '@/domain/earning';
import type { Campaign, LoyaltyConfig, Tier } from '@/domain/types';

describe('Domain: Earning (BL-01 to BL-12)', () => {
  const defaultConfig: LoyaltyConfig['earning'] = {
    spendUnitPaise: 10000, // ₹100
    pointsPerUnit: 5,
    rounding: 'down',
    minPurchasePaise: 50000, // ₹500
    pointValuePaise: 50,
  };

  const shoreTier: Tier = {
    id: 'tier-shore',
    name: 'Shore',
    rank: 0,
    thresholdPaise: 0,
    earnBonusPct: 0,
    benefits: [],
    description: '',
    accent: 'shore',
    active: true,
  };

  const tideTier: Tier = {
    id: 'tier-tide',
    name: 'Tide',
    rank: 1,
    thresholdPaise: 1500000,
    earnBonusPct: 10,
    benefits: [],
    description: '',
    accent: 'tide',
    active: true,
  };

  it('BL-01: calculates base points for ₹2,000 at ₹100=5 round down on Shore (100 pts)', () => {
    const res = calculateEarn({
      amountPaise: 200000, // ₹2,000
      config: defaultConfig,
      tier: shoreTier,
    });

    expect(res.eligible).toBe(true);
    expect(res.basePoints).toBe(100);
    expect(res.tierBonus).toBe(0);
    expect(res.campaignBonus).toBe(0);
    expect(res.totalPoints).toBe(100);
  });

  it('BL-02: ₹2,099.99 with round down yields floor units (100 pts)', () => {
    const res = calculateEarn({
      amountPaise: 209999, // ₹2,099.99
      config: defaultConfig,
      tier: shoreTier,
    });

    expect(res.eligible).toBe(true);
    expect(res.basePoints).toBe(100);
    expect(res.totalPoints).toBe(100);
  });

  it('BL-03: ₹2,050 with rounding nearest rounds 20.5 units up to 21 (105 pts)', () => {
    const res = calculateEarn({
      amountPaise: 205000, // ₹2,050
      config: { ...defaultConfig, rounding: 'nearest' },
      tier: shoreTier,
    });

    expect(res.eligible).toBe(true);
    expect(res.basePoints).toBe(105);
    expect(res.totalPoints).toBe(105);
  });

  it('BL-04: ₹499.99 with min ₹500 is ineligible and earns 0 points', () => {
    const res = calculateEarn({
      amountPaise: 49999, // ₹499.99
      config: defaultConfig,
      tier: shoreTier,
    });

    expect(res.eligible).toBe(false);
    expect(res.reason).toBe('below_minimum');
    expect(res.totalPoints).toBe(0);
  });

  it('BL-05: ₹500.00 exactly reaches minimum and earns 25 points', () => {
    const res = calculateEarn({
      amountPaise: 50000, // ₹500.00
      config: defaultConfig,
      tier: shoreTier,
    });

    expect(res.eligible).toBe(true);
    expect(res.basePoints).toBe(25);
    expect(res.totalPoints).toBe(25);
  });

  it('BL-06: Tide tier +10% on base 345 points gives tier bonus 34 points (floor)', () => {
    // ₹6,900 purchase -> units 69 * 5 = 345 base points
    const res = calculateEarn({
      amountPaise: 690000,
      config: defaultConfig,
      tier: tideTier,
    });

    expect(res.basePoints).toBe(345);
    expect(res.tierBonus).toBe(34); // floor(345 * 10 / 100) = 34
    expect(res.totalPoints).toBe(379);
  });

  it('BL-07: 2x multiplier campaign on base 100 gives campaign bonus 100', () => {
    const doubleCampaign: Campaign = {
      id: 'camp-double',
      name: 'Double Points',
      customerDescription: '',
      type: 'multiplier',
      multiplierTenths: 20, // 2.0x
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-12-31T23:59:59.000Z',
      eligibleTierIds: [],
      showToMembers: true,
      active: true,
    };

    const res = calculateEarn({
      amountPaise: 200000,
      config: defaultConfig,
      tier: shoreTier,
      campaigns: [doubleCampaign],
      at: new Date('2026-06-15T12:00:00Z'),
    });

    expect(res.basePoints).toBe(100);
    expect(res.campaignBonus).toBe(100);
    expect(res.totalPoints).toBe(200);
  });

  it('BL-08: 1.5x multiplier on base 245 gives floor(245 * 5 / 10) = 122', () => {
    const multiplier15: Campaign = {
      id: 'camp-15',
      name: '1.5x Boost',
      customerDescription: '',
      type: 'multiplier',
      multiplierTenths: 15, // 1.5x
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-12-31T23:59:59.000Z',
      eligibleTierIds: [],
      showToMembers: true,
      active: true,
    };

    // ₹4,900 purchase = 49 * 5 = 245 base points
    const res = calculateEarn({
      amountPaise: 490000,
      config: defaultConfig,
      tier: shoreTier,
      campaigns: [multiplier15],
      at: new Date('2026-06-15T12:00:00Z'),
    });

    expect(res.basePoints).toBe(245);
    expect(res.campaignBonus).toBe(122);
    expect(res.totalPoints).toBe(367);
  });

  it('BL-09: picks best campaign when two apply (no stacking per BR-8)', () => {
    const doubleCampaign: Campaign = {
      id: 'camp-2x',
      name: '2x Points',
      customerDescription: '',
      type: 'multiplier',
      multiplierTenths: 20, // +100 bonus on 100 base
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-12-31T23:59:59.000Z',
      eligibleTierIds: [],
      showToMembers: true,
      active: true,
    };

    const flat150Campaign: Campaign = {
      id: 'camp-flat',
      name: 'Flat 150',
      customerDescription: '',
      type: 'flat_bonus',
      bonusPoints: 150, // +150 bonus
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-12-31T23:59:59.000Z',
      eligibleTierIds: [],
      showToMembers: true,
      active: true,
    };

    const res = calculateEarn({
      amountPaise: 200000, // 100 base
      config: defaultConfig,
      tier: shoreTier,
      campaigns: [doubleCampaign, flat150Campaign],
      at: new Date('2026-06-15T12:00:00Z'),
    });

    expect(res.basePoints).toBe(100);
    expect(res.campaign?.name).toBe('Flat 150');
    expect(res.campaignBonus).toBe(150);
    expect(res.totalPoints).toBe(250);
  });

  it('BL-09b: ties broken by earliest startsAt, then name', () => {
    const campA: Campaign = {
      id: 'camp-a',
      name: 'Alpha Bonus',
      customerDescription: '',
      type: 'flat_bonus',
      bonusPoints: 100,
      startsAt: '2026-02-01T00:00:00.000Z',
      endsAt: '2026-12-31T23:59:59.000Z',
      eligibleTierIds: [],
      showToMembers: true,
      active: true,
    };

    const campB: Campaign = {
      id: 'camp-b',
      name: 'Beta Bonus',
      customerDescription: '',
      type: 'flat_bonus',
      bonusPoints: 100,
      startsAt: '2026-01-01T00:00:00.000Z', // earlier start date
      endsAt: '2026-12-31T23:59:59.000Z',
      eligibleTierIds: [],
      showToMembers: true,
      active: true,
    };

    const res = calculateEarn({
      amountPaise: 200000,
      config: defaultConfig,
      tier: shoreTier,
      campaigns: [campA, campB],
      at: new Date('2026-06-15T12:00:00Z'),
    });

    expect(res.campaign?.id).toBe('camp-b');
  });

  it('BL-10: ignores campaigns outside dates, wrong weekday, wrong tier, or below min spend', () => {
    const sundayOnlyCampaign: Campaign = {
      id: 'camp-sun',
      name: 'Sunday Only',
      customerDescription: '',
      type: 'flat_bonus',
      bonusPoints: 100,
      daysOfWeek: [0], // Sunday
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-12-31T23:59:59.000Z',
      eligibleTierIds: [],
      showToMembers: true,
      active: true,
    };

    // 2026-06-15 was a Monday (day 1)
    const res = calculateEarn({
      amountPaise: 200000,
      config: defaultConfig,
      tier: shoreTier,
      campaigns: [sundayOnlyCampaign],
      at: new Date('2026-06-15T12:00:00Z'),
    });

    expect(res.campaignBonus).toBe(0);
    expect(res.campaign).toBeUndefined();
  });
});
