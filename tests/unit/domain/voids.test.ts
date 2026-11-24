import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/data/store';
import { voidPurchase } from '@/services/purchases';
import { deriveLedger, remainingForLot } from '@/domain/ledger';
import { qualifyingSpend } from '@/domain/tiers';

describe('Voids and Shortfall Calculations (TC-004, BR-47, BR-14)', () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });

  it('correctly calculates remaining points for lot', () => {
    const data = useAppStore.getState().data;
    // Tara earned 320 points on bill 4101 (pur-1), but redeemed 500 points on rew-voucher-250
    // Because debits consume FIFO by earliest expiry, pur-1's lot was already consumed
    const tara4101 = data.purchases.find((p) => p.billNo === '4101');
    expect(tara4101).toBeDefined();

    const remaining = remainingForLot(data.transactions, 'cust-tara', tara4101!.earnTxnId!);
    expect(remaining).toBe(0);
  });

  it('voiding Tara bill 4101 reverses 0 points, records 320 shortfall, and deducts spend', () => {
    const initialData = useAppStore.getState().data;
    const initialLedger = deriveLedger(initialData.transactions, 'cust-tara');
    expect(initialLedger.balance).toBe(1438);

    const initialSpend = qualifyingSpend('cust-tara', initialData.purchases, new Date());
    expect(initialSpend).toBe(3740000); // ₹37,400

    const tara4101 = initialData.purchases.find((p) => p.billNo === '4101');
    expect(tara4101).toBeDefined();

    const res = voidPurchase({
      purchaseId: tara4101!.id,
      staffId: 'staff-arjun', // Manager has permission points.correct
      reason: 'Customer return — sizing issue',
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const voided = res.value;
    expect(voided.voided).toBeDefined();
    expect(voided.voided?.pointsReversed).toBe(0);
    expect(voided.voided?.shortfall).toBe(320);
    expect(voided.voided?.voidTxnId).toBeUndefined(); // No transaction written if 0 reversed

    const nextData = useAppStore.getState().data;
    const nextLedger = deriveLedger(nextData.transactions, 'cust-tara');
    // Balance stays 1,438! Does not go negative or drop to 1,118
    expect(nextLedger.balance).toBe(1438);

    // Spend dropped by bill 4101 amount (₹6,490 / 649000 paise)
    const nextSpend = qualifyingSpend('cust-tara', nextData.purchases, new Date());
    expect(nextSpend).toBe(initialSpend - 649000);
  });

  it('rejects reason shorter than 5 characters', () => {
    const data = useAppStore.getState().data;
    const tara4101 = data.purchases.find((p) => p.billNo === '4101');

    const res = voidPurchase({
      purchaseId: tara4101!.id,
      staffId: 'staff-arjun',
      reason: 'Bad',
    });

    expect(res.ok).toBe(false);
  });
});
