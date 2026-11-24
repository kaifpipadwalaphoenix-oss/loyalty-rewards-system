import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/data/store';
import { recordPurchase } from '@/services/purchases';

describe('Enforced Idempotency (TC-008, BR-31)', () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });

  it('second submit with same requestId returns cached result without recording twice', () => {
    const requestId = 'req-test-uuid-12345';

    // First call with requestId
    const res1 = recordPurchase({
      customerId: 'cust-kabir',
      billNo: 'BILL-IDEMPOTENT-1',
      amountPaise: 200000,
      staffId: 'staff-pooja',
      requestId,
    });

    expect(res1.ok).toBe(true);
    const purchaseCountAfter1 = useAppStore.getState().data.purchases.length;

    // Second call with EXACT SAME requestId and billNo
    const res2 = recordPurchase({
      customerId: 'cust-kabir',
      billNo: 'BILL-IDEMPOTENT-1',
      amountPaise: 200000,
      staffId: 'staff-pooja',
      requestId,
    });

    expect(res2.ok).toBe(true);
    const purchaseCountAfter2 = useAppStore.getState().data.purchases.length;
    // Exactly the same purchases count; second call was idempotent and didn't write again
    expect(purchaseCountAfter2).toBe(purchaseCountAfter1);
  });
});
