import { describe, it, expect } from 'vitest';
import { addDays, subDays } from 'date-fns';
import { buildSeed } from '@/data/seed/buildSeed';
import { runSweeps } from '@/services/sweeps';
import { AppDataSchema } from '@/data/schema';

describe('Seed Boundary Determinism', () => {
  const boundaryDates = [
    new Date('2026-11-24T12:00:00+05:30'), // Base seed time
    addDays(new Date('2026-11-24T12:00:00+05:30'), 5), // Zoya birthday unlocked
    addDays(new Date('2026-11-24T12:00:00+05:30'), 9), // Aditi anniversary unlocked
    addDays(new Date('2026-11-24T12:00:00+05:30'), 30), // Future sweep
    subDays(new Date('2026-11-24T12:00:00+05:30'), 30), // Past sweep
  ];

  for (const date of boundaryDates) {
    it(`builds and validates seed at ${date.toISOString().slice(0, 10)}`, () => {
      const seed = buildSeed(date);
      const validated = AppDataSchema.safeParse(seed);
      expect(validated.success).toBe(true);

      const swept = runSweeps(seed, date);
      expect(swept.data.customers.length).toBeGreaterThanOrEqual(6);
      expect(swept.data.transactions.length).toBeGreaterThanOrEqual(10);
    });
  }
});
