import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/data/store';
import { recordPurchase } from '@/services/purchases';
import { updateLoyaltyConfig } from '@/services/config';

describe('Command-Side Permissions (TC-010, TC-027)', () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });

  it('rejects an unknown staff ID from recording a purchase', () => {
    const res = recordPurchase({
      customerId: 'cust-kabir',
      billNo: 'BILL-UNKNOWN-STAFF-1',
      amountPaise: 200000,
      staffId: 'staff-non-existent-999',
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('FORBIDDEN');
    }
  });

  it('rejects an inactive staff member from performing actions', () => {
    // Deactivate Pooja in store
    useAppStore.getState().commit((prev) => ({
      ...prev,
      staff: prev.staff.map((s) => (s.id === 'staff-pooja' ? { ...s, active: false } : s)),
    }));

    const res = recordPurchase({
      customerId: 'cust-kabir',
      billNo: 'BILL-INACTIVE-STAFF-1',
      amountPaise: 200000,
      staffId: 'staff-pooja',
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('FORBIDDEN');
      expect(res.error.message).toContain('inactive');
    }
  });

  it('rejects a manager from updating loyalty config and logs PERMISSION_DENIED', () => {
    const prevAuditCount = useAppStore.getState().data.audit.length;
    const currentConfig = useAppStore.getState().data.config;

    const res = updateLoyaltyConfig({
      staffId: 'staff-arjun', // Arjun is manager, not admin
      config: {
        ...currentConfig,
        earning: {
          ...currentConfig.earning,
          baseRatePaisePerPoint: 800,
        },
      },
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('FORBIDDEN');
    }

    const nextData = useAppStore.getState().data;
    expect(nextData.audit.length).toBeGreaterThan(prevAuditCount);
    const deniedAudit = nextData.audit.find((a) => a.action === 'permission_denied');
    expect(deniedAudit).toBeDefined();
    expect(deniedAudit?.actor.id).toBe('staff-arjun');
    expect(deniedAudit?.summary).toContain('Arjun Shetty');
  });
});
