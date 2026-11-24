import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/data/store';
import { recordPurchase } from '@/services/purchases';
import { redeemReward, markVoucherUsed } from '@/services/redemptions';
import { selectMemberDetails } from '@/data/selectors/member';
import { selectCounterCustomerDetails } from '@/data/selectors/counter';
import { selectAdminDashboard } from '@/data/selectors/dashboard';

describe('Canonical Consistency Chain (QA Acceptance)', () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });

  it('executes Kabir consistency chain across customer, cashier, and admin views', () => {
    const kabirId = 'cust-kabir';
    let data = useAppStore.getState().data;

    // 1. Initial State: Kabir starts with exactly 1,000 points
    let memberView = selectMemberDetails(data, kabirId);
    let counterView = selectCounterCustomerDetails(data, kabirId);
    expect(memberView?.balance).toBe(1000);
    expect(counterView?.balance).toBe(1000);

    // 2. Cashier records ₹2,000 purchase (PAISE: 200,000)
    // Spend rule: ₹100 = 5 pts. ₹2,000 = 20 * 5 = 100 base pts. Shore has 0% tier bonus.
    const purchaseRes = recordPurchase({
      customerId: kabirId,
      billNo: 'BILL-CANONICAL-001',
      amountPaise: 200000,
      staffId: 'staff-pooja',
      channel: 'store',
    });

    expect(purchaseRes.ok).toBe(true);
    data = useAppStore.getState().data;

    // Balance must be exactly 1,100 across both views
    memberView = selectMemberDetails(data, kabirId);
    counterView = selectCounterCustomerDetails(data, kabirId);
    expect(memberView?.balance).toBe(1100);
    expect(counterView?.balance).toBe(1100);

    // 3. Redeem 500 pt reward
    // Find ₹250 off voucher reward (rew-voucher-250, 500 pts)
    const reward = data.rewards.find((r) => r.pointsCost === 500);
    expect(reward).toBeDefined();

    const redeemRes = redeemReward({
      customerId: kabirId,
      rewardId: reward!.id,
      channel: 'portal',
    });

    expect(redeemRes.ok).toBe(true);
    if (!redeemRes.ok) return;
    const voucher = redeemRes.value;
    expect(voucher.code).toBeDefined();

    data = useAppStore.getState().data;

    // Balance must now be exactly 600 points across both views
    memberView = selectMemberDetails(data, kabirId);
    counterView = selectCounterCustomerDetails(data, kabirId);
    expect(memberView?.balance).toBe(600);
    expect(counterView?.balance).toBe(600);

    // 4. Cashier marks voucher used at checkout
    const useRes = markVoucherUsed({
      voucherCode: voucher.code,
      billNo: 'BILL-CANONICAL-002',
      staffId: 'staff-pooja',
    });

    expect(useRes.ok).toBe(true);
    data = useAppStore.getState().data;

    const usedVoucher = data.vouchers.find((v) => v.id === voucher.id);
    expect(usedVoucher?.status).toBe('used');

    // 5. Admin Dashboard reflects total points liability and activity
    const adminDashboard = selectAdminDashboard(data);
    expect(adminDashboard.kpis.totalMembers).toBeGreaterThanOrEqual(6);
    expect(adminDashboard.kpis.pointsIssued).toBeGreaterThan(0);
    expect(adminDashboard.kpis.pointsRedeemed).toBeGreaterThanOrEqual(500);
  });
});
