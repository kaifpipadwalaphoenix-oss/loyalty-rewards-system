import { describe, it, expect } from 'vitest';
import { buildSeed } from '@/data/seed/buildSeed';
import { selectAdminDashboard, type AdminDateRangePreset } from '@/data/selectors/dashboard';
import { formatRupees } from '@/lib/format';

describe('NX-016: Admin Dashboard Range Presets and Whole Rupee Formatting', () => {
  const seed = buildSeed();
  const presets: AdminDateRangePreset[] = ['today', '7d', '30d', '90d', '12m'];

  for (const preset of presets) {
    it(`computes valid dashboard metrics for preset "${preset}"`, () => {
      const data = selectAdminDashboard(seed, preset);
      expect(data.rangePreset).toBe(preset);
      expect(data.kpis.totalMembers).toBeGreaterThanOrEqual(data.kpis.activeMembers);
      expect(data.kpis.activeMembers).toBeGreaterThanOrEqual(0);
      expect(data.kpis.totalSalesPaise).toBeGreaterThanOrEqual(0);
      expect(data.kpis.pointsIssued).toBeGreaterThanOrEqual(0);
      expect(data.kpis.pointsRedeemed).toBeGreaterThanOrEqual(0);
      expect(data.kpis.pointsLiability).toBeGreaterThanOrEqual(0);

      // Verify whole rupees (no decimal points in integer rupees)
      expect(Number.isInteger(data.kpis.liabilityRupees)).toBe(true);
      const formattedSales = formatRupees(data.kpis.totalSalesPaise, false);
      expect(formattedSales).not.toContain('.');

      const formattedLiability = formatRupees(data.kpis.liabilityRupees * 100, false);
      expect(formattedLiability).not.toContain('.');
    });
  }

  it('provides populated needs attention metrics', () => {
    const data = selectAdminDashboard(seed, '30d');
    expect(data.needsAttention).toBeDefined();
    expect(typeof data.needsAttention.expiringPoints.totalPoints).toBe('number');
    expect(Array.isArray(data.needsAttention.celebrations)).toBe(true);
    expect(Array.isArray(data.needsAttention.expiringVouchers)).toBe(true);
  });
});
