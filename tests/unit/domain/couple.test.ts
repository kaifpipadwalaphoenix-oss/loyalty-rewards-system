import { describe, it, expect } from 'vitest';
import { checkCoupleVisitEligibility } from '@/domain/couple';
import type { CoupleVisit, Customer, LoyaltyConfig } from '@/domain/types';

describe('Domain: Couple Visit Eligibility (BL-37)', () => {
  const config: LoyaltyConfig['couple'] = {
    active: true,
    bonusPoints: 100,
    requireMarried: true,
    cooldownDays: 30,
  };

  const marriedCustomer: Customer = {
    id: 'c-married',
    memberNo: 'TC101',
    name: 'Aditi Rao',
    mobile: '+919000000005',
    maritalStatus: 'married',
    occasionDates: { birthdayEdits: 0, anniversaryEdits: 0 },
    consent: { terms: '', updates: false },
    enrolledAt: '',
    enrolledVia: 'online',
  };

  const singleCustomer: Customer = {
    ...marriedCustomer,
    id: 'c-single',
    maritalStatus: 'single',
  };

  it('BL-37: visit on 1 Nov is blocked on 30 Nov (29 days) and allowed on 1 Dec (30 days)', () => {
    const visits: CoupleVisit[] = [
      {
        id: 'cv-1',
        customerId: 'c-married',
        at: '2026-11-01T14:30:00+05:30',
        staffId: 's1',
        bonusPoints: 100,
        txnId: 'tx-1',
      },
    ];

    // Day 29: 30 Nov 2026 -> Blocked!
    const day29 = new Date('2026-11-30T10:00:00+05:30');
    const resBlocked = checkCoupleVisitEligibility(marriedCustomer, visits, config, day29);
    expect(resBlocked.eligible).toBe(false);
    expect(resBlocked.reason).toContain('Next eligible on 01 Dec 2026');

    // Day 30: 1 Dec 2026 -> Allowed!
    const day30 = new Date('2026-12-01T10:00:00+05:30');
    const resAllowed = checkCoupleVisitEligibility(marriedCustomer, visits, config, day30);
    expect(resAllowed.eligible).toBe(true);
    expect(resAllowed.bonusPoints).toBe(100);
  });

  it('blocks single members when requireMarried is true', () => {
    const res = checkCoupleVisitEligibility(singleCustomer, [], config, new Date());
    expect(res.eligible).toBe(false);
    expect(res.reason).toContain('Married');
  });

  it('blocks when couple visit bonus is deactivated in config', () => {
    const res = checkCoupleVisitEligibility(marriedCustomer, [], { ...config, active: false }, new Date());
    expect(res.eligible).toBe(false);
    expect(res.reason).toContain('inactive');
  });
});
