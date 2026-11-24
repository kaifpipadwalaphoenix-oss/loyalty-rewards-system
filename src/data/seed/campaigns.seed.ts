import { addDays, subDays, subMonths } from 'date-fns';
import type { Campaign } from '@/domain/types';

export function createSeedCampaigns(now: Date = new Date()): Campaign[] {
  return [
    {
      id: 'camp-resort-edit',
      name: 'Resort Edit Bonus',
      customerDescription: 'Earn 150 bonus points on orders of ₹8,000 or more across the new Resort collection.',
      type: 'flat_bonus',
      bonusPoints: 150,
      minSpendPaise: 800000, // ₹8,000
      startsAt: subDays(now, 10).toISOString(),
      endsAt: addDays(now, 21).toISOString(),
      eligibleTierIds: [], // All tiers
      showToMembers: true,
      active: true,
    },
    {
      id: 'camp-golden-hour-week',
      name: 'Golden Hour Week',
      customerDescription: 'Celebrate sunset season with 1.5× points on all resortwear purchases this week.',
      type: 'multiplier',
      multiplierTenths: 15, // 1.5x
      startsAt: subDays(now, 1).toISOString(),
      endsAt: addDays(now, 6).toISOString(),
      eligibleTierIds: ['tier-golden', 'tier-endless'],
      showToMembers: true,
      active: true,
    },
    {
      id: 'camp-double-points-weekend',
      name: 'Double Points Weekend',
      customerDescription: '2× Trove Points on all store purchases every Saturday and Sunday.',
      type: 'multiplier',
      multiplierTenths: 20, // 2.0x
      daysOfWeek: [0, 6], // Sunday & Saturday
      startsAt: subDays(now, 30).toISOString(),
      endsAt: addDays(now, 60).toISOString(),
      eligibleTierIds: [],
      showToMembers: true,
      active: false, // Inactive in seed; admin can switch on live
    },
    {
      id: 'camp-monsoon-escape',
      name: 'Monsoon Escape',
      customerDescription: '200 bonus points on all resort purchases of ₹6,000 or more.',
      type: 'flat_bonus',
      bonusPoints: 200,
      minSpendPaise: 600000,
      startsAt: subMonths(now, 4).toISOString(),
      endsAt: subMonths(now, 2).toISOString(),
      eligibleTierIds: [],
      showToMembers: false,
      active: false, // Ended
    },
  ];
}
