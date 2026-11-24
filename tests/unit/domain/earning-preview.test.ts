import { describe, it, expect } from 'vitest';
import { selectEarnPreview } from '@/data/selectors/earning';
import { buildSeed } from '@/data/seed/buildSeed';

describe('selectEarnPreview (TC-003, D1)', () => {
  it('correctly previews Zoya ₹10,000 purchase including tier bonus and campaign', () => {
    const data = buildSeed();
    const now = new Date('2026-11-24T12:00:00Z');

    const preview = selectEarnPreview(data, 'cust-zoya', 1000000, now);
    expect(preview).not.toBeNull();
    if (!preview) return;

    expect(preview.eligible).toBe(true);
    expect(preview.basePoints).toBe(500);
    expect(preview.tierBonus).toBe(125); // +25% Golden Hour
    expect(preview.campaignBonus).toBe(250); // Golden Hour Week campaign
    expect(preview.totalPoints).toBe(875);
    expect(preview.newBalance).toBe(preview.currentBalance + 875);
  });

  it('correctly indicates below_minimum when purchase is less than minPurchasePaise', () => {
    const data = buildSeed();
    const now = new Date('2026-11-24T12:00:00Z');

    const preview = selectEarnPreview(data, 'cust-tara', 49900, now); // ₹499
    expect(preview).not.toBeNull();
    if (!preview) return;

    expect(preview.eligible).toBe(false);
    expect(preview.reason).toBe('below_minimum');
    expect(preview.totalPoints).toBe(0);
    expect(preview.newBalance).toBe(preview.currentBalance);
  });

  it('dynamically adapts when admin changes pointsPerUnit', () => {
    const data = buildSeed();
    // Admin changes rate from 5 to 8 per ₹100
    data.config.earning.pointsPerUnit = 8;
    const now = new Date('2026-11-24T12:00:00Z');

    const preview = selectEarnPreview(data, 'cust-kabir', 200000, now); // Kabir ₹2,000, Shore tier (0% bonus)
    expect(preview).not.toBeNull();
    if (!preview) return;

    expect(preview.eligible).toBe(true);
    expect(preview.rateLabel).toBe('8 pts per ₹100');
    expect(preview.basePoints).toBe(160);
    expect(preview.totalPoints).toBe(160);
  });
});
