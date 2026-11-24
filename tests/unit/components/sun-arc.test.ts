import { describe, it, expect } from 'vitest';
import { computeSunArc } from '@/components/brand/sun-arc';

describe('Sun Arc Geometry Helper (NX-101)', () => {
  const config = { cx: 200, cy: 100, radius: 100 };

  it('computes dot position at 0% progress (left endpoint, 180 degrees)', () => {
    const res = computeSunArc(0, config);
    expect(res.percentage).toBe(0);
    expect(res.angleDeg).toBe(180);
    // At 180deg: x = 200 - 100 = 100, y = 100 - 0 = 100
    expect(res.dot.x).toBe(100);
    expect(res.dot.y).toBe(100);
    expect(res.pathD).toBe('M 100 100 A 100 100 0 0 1 300 100');
  });

  it('computes dot position at 50% progress (zenith, 90 degrees)', () => {
    const res = computeSunArc(50, config);
    expect(res.percentage).toBe(50);
    expect(res.angleDeg).toBe(90);
    // At 90deg: x = 200 + 0 = 200, y = 100 - 100 = 0
    expect(res.dot.x).toBe(200);
    expect(res.dot.y).toBe(0);
  });

  it('computes dot position at 100% progress (right endpoint, 0 degrees)', () => {
    const res = computeSunArc(100, config);
    expect(res.percentage).toBe(100);
    expect(res.angleDeg).toBe(0);
    // At 0deg: x = 200 + 100 = 300, y = 100 - 0 = 100
    expect(res.dot.x).toBe(300);
    expect(res.dot.y).toBe(100);
  });

  it('clamps negative or exceeding percentages safely', () => {
    const resNeg = computeSunArc(-20, config);
    expect(resNeg.percentage).toBe(0);
    expect(resNeg.dot.x).toBe(100);

    const resOver = computeSunArc(150, config);
    expect(resOver.percentage).toBe(100);
    expect(resOver.dot.x).toBe(300);
  });

  it('accurately computes arbitrary tierProgress percentages', () => {
    // 90% progress (Tara's progress toward Golden Hour)
    const res = computeSunArc(90, config);
    expect(res.percentage).toBe(90);
    expect(res.angleDeg).toBe(18); // 180 - 0.9 * 180 = 18 deg
    expect(res.dot.x).toBeGreaterThan(200); // Past zenith
    expect(res.dot.y).toBeGreaterThan(0); // Lower than zenith
  });
});
