import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/data/store';
import { deriveLedger } from '@/domain/ledger';
import { adjustPoints } from '@/services/points';
import { redeemReward } from '@/services/redemptions';

describe('Non-Negative Balance Invariant Guard (TC-004, TC-028, BR-14)', () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });

  it('rejects an adjustment debit that would drive customer balance below zero', () => {
    const data = useAppStore.getState().data;
    const kabir = data.customers.find((c) => c.id === 'cust-kabir');
    expect(kabir).toBeDefined();

    const ledger = deriveLedger(data.transactions, 'cust-kabir');
    const balance = ledger.balance; // 1,000

    // Try to debit 1,500 points (exceeding balance)
    const res = adjustPoints({
      customerId: 'cust-kabir',
      type: 'ADJUST_DEBIT',
      points: balance + 500,
      category: 'Correction',
      note: 'Excessive debit test',
      staffId: 'staff-arjun',
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(['CONFLICT', 'INSUFFICIENT_POINTS']).toContain(res.error.code);
    }

    const nextLedger = deriveLedger(useAppStore.getState().data.transactions, 'cust-kabir');
    expect(nextLedger.balance).toBe(balance); // Unchanged
    expect(nextLedger.balance).toBeGreaterThanOrEqual(0);
  });

  it('property test: 200 random operations never produce a negative customer balance', () => {
    // Seeded PRNG for reproducible test runs
    let seed = 123456789;
    function rand() {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    }

    const customerIds = ['cust-meera', 'cust-tara', 'cust-kabir', 'cust-zoya', 'cust-aditi', 'cust-farhan'];

    for (let i = 0; i < 200; i++) {
      const custId = customerIds[Math.floor(rand() * customerIds.length)]!;
      const r = rand();

      if (r < 0.4) {
        // Random credit: 50 to 500 pts
        const pts = Math.floor(rand() * 450) + 50;
        adjustPoints({
          customerId: custId,
          type: 'ADJUST_CREDIT',
          points: pts,
          category: 'Goodwill',
          note: 'Property test credit',
          staffId: 'staff-arjun',
        });
      } else if (r < 0.7) {
        // Random debit attempt: 50 to 2000 pts
        const pts = Math.floor(rand() * 1950) + 50;
        adjustPoints({
          customerId: custId,
          type: 'ADJUST_DEBIT',
          points: pts,
          category: 'Correction',
          note: 'Property test debit attempt',
          staffId: 'staff-arjun',
        });
      } else {
        // Try random redemption
        const currentData = useAppStore.getState().data;
        const rewards = currentData.rewards.filter((rw) => rw.status === 'active');
        if (rewards.length > 0) {
          const reward = rewards[Math.floor(rand() * rewards.length)]!;
          redeemReward({
            customerId: custId,
            rewardId: reward.id,
            channel: 'portal',
          });
        }
      }

      // Assert invariant for this customer
      const currentLedger = deriveLedger(useAppStore.getState().data.transactions, custId);
      expect(currentLedger.balance).toBeGreaterThanOrEqual(0);
    }
  });
});
