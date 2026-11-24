import { describe, it, expect } from 'vitest';
import { qualifyingSpend, resolveTier, tierProgress, tierImpact } from '@/domain/tiers';
import type { Customer, Purchase, Tier } from '@/domain/types';

describe('Domain: Tiers (BL-24 to BL-27)', () => {
  const tiers: Tier[] = [
    {
      id: 'shore',
      name: 'Shore',
      rank: 0,
      thresholdPaise: 0,
      earnBonusPct: 0,
      benefits: [],
      description: '',
      accent: 'shore',
      active: true,
    },
    {
      id: 'tide',
      name: 'Tide',
      rank: 1,
      thresholdPaise: 1500000, // ₹15,000
      earnBonusPct: 10,
      benefits: [],
      description: '',
      accent: 'tide',
      active: true,
    },
    {
      id: 'golden',
      name: 'Golden Hour',
      rank: 2,
      thresholdPaise: 4000000, // ₹40,000
      earnBonusPct: 25,
      benefits: [],
      description: '',
      accent: 'golden',
      active: true,
    },
    {
      id: 'endless',
      name: 'Endless Summer',
      rank: 3,
      thresholdPaise: 10000000, // ₹1,00,000
      earnBonusPct: 50,
      benefits: [],
      description: '',
      accent: 'endless',
      active: true,
    },
  ];

  it('BL-24: qualifying spend excludes > 365d, voided, and ineligible purchases', () => {
    const now = new Date('2026-11-24T12:00:00Z');
    const purchases: Purchase[] = [
      {
        id: 'p-1',
        ref: 'P-001',
        customerId: 'c1',
        amountPaise: 200000, // Valid (₹2,000)
        billNo: '101',
        channel: 'store',
        at: '2026-10-01T12:00:00Z',
        staffId: 's1',
        eligible: true,
      },
      {
        id: 'p-2',
        ref: 'P-002',
        customerId: 'c1',
        amountPaise: 500000, // Older than 365 days (2025-01-01)
        billNo: '102',
        channel: 'store',
        at: '2025-01-01T12:00:00Z',
        staffId: 's1',
        eligible: true,
      },
      {
        id: 'p-3',
        ref: 'P-003',
        customerId: 'c1',
        amountPaise: 300000, // Voided!
        billNo: '103',
        channel: 'store',
        at: '2026-09-01T12:00:00Z',
        staffId: 's1',
        eligible: true,
        voided: {
          at: '2026-09-02T12:00:00Z',
          staffId: 's1',
          reason: 'Return',
          pointsReversed: 150,
          shortfall: 0,
        },
      },
      {
        id: 'p-4',
        ref: 'P-004',
        customerId: 'c1',
        amountPaise: 40000, // Below min / ineligible
        billNo: '104',
        channel: 'store',
        at: '2026-11-01T12:00:00Z',
        staffId: 's1',
        eligible: false,
      },
    ];

    const spend = qualifyingSpend('c1', purchases, now, 'rolling_12m');
    expect(spend).toBe(200000); // Only p-1 counts
  });

  it('BL-25: spend exactly equal to threshold qualifies for new tier', () => {
    expect(resolveTier(1500000, tiers).name).toBe('Tide');
    expect(resolveTier(1499999, tiers).name).toBe('Shore');
    expect(resolveTier(4000000, tiers).name).toBe('Golden Hour');
  });

  it('BL-26: inactive tier is skipped and next lower active tier is assigned', () => {
    const tiersWithInactive: Tier[] = tiers.map((t) =>
      t.id === 'golden' ? { ...t, active: false } : t
    );

    // Spend ₹50,000 would be Golden Hour, but it is inactive -> falls back to Tide
    expect(resolveTier(5000000, tiersWithInactive).name).toBe('Tide');
  });

  it('calculates tier progress correctly', () => {
    const currentTier = tiers[1]!; // Tide (₹15,000 threshold)
    // Spend ₹37,400 (Golden Hour is ₹40,000 threshold) -> remaining ₹2,600
    const progress = tierProgress(3740000, currentTier, tiers);
    expect(progress.remainingPaise).toBe(260000); // ₹2,600
    expect(progress.nextTier?.name).toBe('Golden Hour');
  });

  it('BL-27: calculates tier impact accurately when thresholds change', () => {
    const customerA: Customer = {
      id: 'c-a',
      memberNo: 'TC1',
      name: 'Customer A',
      mobile: '+919000000001',
      occasionDates: { birthdayEdits: 0, anniversaryEdits: 0 },
      consent: { terms: '', updates: false },
      enrolledAt: '',
      enrolledVia: 'online',
    };

    const customerPurchases: Purchase[] = [
      {
        id: 'p-1',
        ref: 'P-1',
        customerId: 'c-a',
        amountPaise: 3500000, // ₹35,000 spend
        billNo: '101',
        channel: 'store',
        at: '2026-10-01T12:00:00Z',
        staffId: 's1',
        eligible: true,
      },
    ];

    // Under old tiers, ₹35,000 is Tide (< ₹40,000)
    // Under new tiers, Golden Hour threshold lowered to ₹30,000 -> Customer A moves up!
    const newTiers = tiers.map((t) =>
      t.id === 'golden' ? { ...t, thresholdPaise: 3000000 } : t
    );

    const impact = tierImpact([customerA], customerPurchases, tiers, newTiers);
    expect(impact.movingUp).toBe(1);
    expect(impact.movingDown).toBe(0);
    expect(impact.unchanged).toBe(0);
  });
});
