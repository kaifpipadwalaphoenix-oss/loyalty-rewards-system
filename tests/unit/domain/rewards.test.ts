import { describe, it, expect } from 'vitest';
import { checkRewardEligibility, getRewardStockRemaining } from '@/domain/rewards';
import type { IssuedVoucher, Reward, Tier } from '@/domain/types';

describe('Domain: Rewards & Eligibility (BL-28 to BL-30, BL-44)', () => {
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

  const baseReward: Reward = {
    id: 'rwd-1',
    name: '₹250 off Resortwear',
    type: 'fixed_discount',
    shortDescription: '',
    description: '',
    howToUse: '',
    terms: '',
    value: { amountPaise: 25000, label: '₹250 off' },
    image: { src: '', alt: 'Voucher' },
    pointsCost: 500,
    eligibleTierIds: [],
    voucherValidityDays: 30,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  it('BL-28: evaluates eligibility order (inactive, dates, stock, tier, member limit, points)', () => {
    // 1. Inactive status check
    const inactiveReward: Reward = { ...baseReward, status: 'inactive' };
    const res1 = checkRewardEligibility(inactiveReward, shoreTier, 1000, 'c1', []);
    expect(res1.code).toBe('inactive');

    // 2. Not started
    const futureReward: Reward = { ...baseReward, startsAt: '2026-12-01T00:00:00Z' };
    const res2 = checkRewardEligibility(futureReward, shoreTier, 1000, 'c1', [], [], new Date('2026-11-24T00:00:00Z'));
    expect(res2.code).toBe('not_started');

    // 3. Ended
    const pastReward: Reward = { ...baseReward, endsAt: '2026-11-01T00:00:00Z' };
    const res3 = checkRewardEligibility(pastReward, shoreTier, 1000, 'c1', [], [], new Date('2026-11-24T00:00:00Z'));
    expect(res3.code).toBe('ended');

    // 4. Out of stock
    const limitedReward: Reward = { ...baseReward, stockLimit: 1 };
    const issuedVoucher: IssuedVoucher = {
      id: 'v-1',
      code: 'TC-ABCD-EFGH',
      customerId: 'c-other',
      source: 'catalogue',
      rewardId: 'rwd-1',
      title: '₹250 off',
      valueLabel: '₹250',
      pointsSpent: 500,
      channel: 'portal',
      issuedAt: '2026-11-20T00:00:00Z',
      expiresAt: '2026-12-20T00:00:00Z',
      status: 'issued',
    };
    const res4 = checkRewardEligibility(limitedReward, shoreTier, 1000, 'c1', [issuedVoucher]);
    expect(res4.code).toBe('out_of_stock');

    // 5. Tier restricted
    const tideReward: Reward = { ...baseReward, eligibleTierIds: ['tier-tide'] };
    const res5 = checkRewardEligibility(tideReward, shoreTier, 1000, 'c1', [], [shoreTier, tideTier]);
    expect(res5.code).toBe('tier_not_eligible');

    // 6. Insufficient points
    const res6 = checkRewardEligibility(baseReward, shoreTier, 200, 'c1', []);
    expect(res6.code).toBe('insufficient_points');
    expect(res6.message).toContain('300 more points');

    // 7. Success
    const res7 = checkRewardEligibility(baseReward, shoreTier, 600, 'c1', []);
    expect(res7.code).toBe('ok');
    expect(res7.eligible).toBe(true);
  });

  it('BL-29 & BL-44: derived stock ignores cancelled vouchers', () => {
    const limitedReward: Reward = { ...baseReward, stockLimit: 5 };
    const vouchers: IssuedVoucher[] = [
      {
        id: 'v-1',
        code: 'TC-1111-2222',
        customerId: 'c1',
        source: 'catalogue',
        rewardId: 'rwd-1',
        title: '',
        valueLabel: '',
        pointsSpent: 500,
        channel: 'portal',
        issuedAt: '',
        expiresAt: '',
        status: 'issued',
      },
      {
        id: 'v-2',
        code: 'TC-3333-4444',
        customerId: 'c2',
        source: 'catalogue',
        rewardId: 'rwd-1',
        title: '',
        valueLabel: '',
        pointsSpent: 500,
        channel: 'portal',
        issuedAt: '',
        expiresAt: '',
        status: 'used',
      },
      {
        id: 'v-3',
        code: 'TC-5555-6666',
        customerId: 'c3',
        source: 'catalogue',
        rewardId: 'rwd-1',
        title: '',
        valueLabel: '',
        pointsSpent: 500,
        channel: 'portal',
        issuedAt: '',
        expiresAt: '',
        status: 'cancelled', // Cancelled! Should not count against stock
      },
    ];

    const stockLeft = getRewardStockRemaining(limitedReward, vouchers);
    expect(stockLeft).toBe(3); // 5 - 2 active/used = 3
  });

  it('BL-30: per-member limit blocks further redemptions when limit is reached', () => {
    const limitedPerMember: Reward = { ...baseReward, perMemberLimit: 1 };
    const vouchers: IssuedVoucher[] = [
      {
        id: 'v-1',
        code: 'TC-1111-2222',
        customerId: 'c1',
        source: 'catalogue',
        rewardId: 'rwd-1',
        title: '',
        valueLabel: '',
        pointsSpent: 500,
        channel: 'portal',
        issuedAt: '',
        expiresAt: '',
        status: 'issued',
      },
    ];

    const res = checkRewardEligibility(limitedPerMember, shoreTier, 1000, 'c1', vouchers);
    expect(res.code).toBe('member_limit_reached');
  });
});
