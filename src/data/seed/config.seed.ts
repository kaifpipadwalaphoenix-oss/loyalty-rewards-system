import type { LoyaltyConfig } from '@/domain/types';

export const seedConfig: LoyaltyConfig = {
  earning: {
    spendUnitPaise: 10000, // ₹100
    pointsPerUnit: 5,
    rounding: 'down',
    minPurchasePaise: 50000, // ₹500
    pointValuePaise: 50, // ₹0.50
  },
  expiry: {
    mode: 'fixed_months',
    months: 12,
    expiringSoonDays: 30,
  },
  tierWindow: 'rolling_12m',
  occasions: [
    {
      id: 'rule-bday-bonus',
      occasion: 'birthday',
      name: 'Birthday 250 Bonus Points',
      benefit: {
        type: 'bonus_points',
        points: 250,
        description: '250 bonus points added directly to your balance.',
      },
      eligibleTierIds: [], // All tiers
      unlockDaysBefore: 7,
      validityDays: 30,
      active: true,
    },
    {
      id: 'rule-bday-vip-discount',
      occasion: 'birthday',
      name: 'Birthday 15% Atelier Voucher',
      benefit: {
        type: 'percent_discount',
        percent: 15,
        capPaise: 200000, // ₹2,000 max savings
        description: '15% off your next summer piece (up to ₹2,000 off).',
      },
      eligibleTierIds: ['tier-golden', 'tier-endless'],
      unlockDaysBefore: 7,
      validityDays: 30,
      active: true,
    },
    {
      id: 'rule-anniv-voucher',
      occasion: 'anniversary',
      name: 'Anniversary ₹1,000 Celebratory Treat',
      benefit: {
        type: 'fixed_discount',
        amountPaise: 100000, // ₹1,000
        description: '₹1,000 off your holiday celebratory purchase.',
      },
      minPurchasePaise: 500000, // Min purchase ₹5,000
      eligibleTierIds: [], // All tiers
      unlockDaysBefore: 7,
      validityDays: 30,
      active: true,
    },
  ],
  couple: {
    active: true,
    bonusPoints: 100,
    requireMarried: true,
    cooldownDays: 30,
  },
  redemption: {
    defaultVoucherValidityDays: 30,
    allowStaffAssisted: true,
    occasionSelfEdits: 1,
  },
  occasionMinDaysOnFile: 30,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Nisha Varma (System Initialisation)',
};
