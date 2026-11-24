import { describe, it, expect } from 'vitest';
import { runSweeps } from '@/services/sweeps';
import { buildSeed } from '@/data/seed/buildSeed';
import { expiryDateFor } from '@/domain/expiry';

describe('NX-015: Runtime Occasion Bonus Expiry', () => {
  it('stamps expiresAt equal to policy expiry on occasion bonus transactions', () => {
    const seed = buildSeed();

    // Run sweep for Aditi's upcoming anniversary (3 Dec, unlock window 7 days before = 26 Nov)
    // Run sweep on 27 Nov 2026
    const sweepDate = new Date('2026-11-27T10:00:00.000Z');
    const result = runSweeps(seed, sweepDate);

    // Look for newly created occasion bonus transaction from the sweep
    const initialTxnIds = new Set(seed.transactions.map((t) => t.id));
    const newBonusTxns = result.data.transactions.filter(
      (t) => !initialTxnIds.has(t.id) && t.type === 'EARN_BONUS'
    );

    expect(newBonusTxns.length).toBeGreaterThan(0);
    const expectedExpiry = expiryDateFor(sweepDate, seed.config.expiry);
    for (const txn of newBonusTxns) {
      expect(txn.expiresAt).toBe(expectedExpiry);
    }
  });
});
