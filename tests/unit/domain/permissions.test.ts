import { describe, it, expect } from 'vitest';
import { can, ALL_PERMISSIONS } from '@/domain/permissions';

describe('Domain: Permissions Matrix (BL-40)', () => {
  it('Admin has all capabilities', () => {
    for (const perm of ALL_PERMISSIONS) {
      expect(can('admin', perm)).toBe(true);
    }
  });

  it('Manager has counter, dashboard, customer management, corrections, reports and audit', () => {
    expect(can('manager', 'counter.use')).toBe(true);
    expect(can('manager', 'counter.ownHistory')).toBe(true);
    expect(can('manager', 'dashboard.view')).toBe(true);
    expect(can('manager', 'customers.view')).toBe(true);
    expect(can('manager', 'customers.edit')).toBe(true);
    expect(can('manager', 'customers.export')).toBe(true);
    expect(can('manager', 'points.adjust')).toBe(true);
    expect(can('manager', 'points.correct')).toBe(true);
    expect(can('manager', 'reports.view')).toBe(true);
    expect(can('manager', 'audit.view')).toBe(true);

    // Lacks configuration & administration
    expect(can('manager', 'programme.manage')).toBe(false);
    expect(can('manager', 'rewards.manage')).toBe(false);
    expect(can('manager', 'staff.manage')).toBe(false);
  });

  it('Cashier has only counter operations and own history', () => {
    expect(can('cashier', 'counter.use')).toBe(true);
    expect(can('cashier', 'counter.ownHistory')).toBe(true);

    expect(can('cashier', 'dashboard.view')).toBe(false);
    expect(can('cashier', 'customers.view')).toBe(false);
    expect(can('cashier', 'customers.edit')).toBe(false);
    expect(can('cashier', 'points.adjust')).toBe(false);
    expect(can('cashier', 'points.correct')).toBe(false);
    expect(can('cashier', 'programme.manage')).toBe(false);
    expect(can('cashier', 'rewards.manage')).toBe(false);
    expect(can('cashier', 'staff.manage')).toBe(false);
  });
});
