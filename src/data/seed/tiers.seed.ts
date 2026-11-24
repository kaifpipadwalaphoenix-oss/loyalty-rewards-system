import type { Tier } from '@/domain/types';

export const seedTiers: Tier[] = [
  {
    id: 'tier-shore',
    name: 'Shore',
    rank: 0,
    thresholdPaise: 0,
    earnBonusPct: 0,
    benefits: ['Member-only rewards catalogue'],
    description: 'Welcome to Trove Club. Earn points on every store purchase.',
    accent: 'shore',
    active: true,
  },
  {
    id: 'tier-tide',
    name: 'Tide',
    rank: 1,
    thresholdPaise: 1500000, // ₹15,000
    earnBonusPct: 10,
    benefits: ['Early access to sale previews'],
    description: 'Enjoy +10% bonus points on all purchases and seasonal perks.',
    accent: 'tide',
    active: true,
  },
  {
    id: 'tier-golden',
    name: 'Golden Hour',
    rank: 2,
    thresholdPaise: 4000000, // ₹40,000
    earnBonusPct: 25,
    benefits: ['Priority alterations', 'Invitations to new-collection previews'],
    description: 'Our signature tier with +25% points and priority atelier services.',
    accent: 'golden',
    active: true,
  },
  {
    id: 'tier-endless',
    name: 'Endless Summer',
    rank: 3,
    thresholdPaise: 10000000, // ₹1,00,000
    earnBonusPct: 50,
    benefits: ['A private styling appointment each season', 'First look at limited drops'],
    description: 'The ultimate resort lifestyle privileges with +50% points.',
    accent: 'endless',
    active: true,
  },
];
