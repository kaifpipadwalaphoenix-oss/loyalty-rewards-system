import { z } from 'zod';

export const SCHEMA_VERSION = 1;

export const RoleSchema = z.enum(['admin', 'manager', 'cashier']);
export type Role = z.infer<typeof RoleSchema>;

export const StaffMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: RoleSchema,
  pin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
  active: z.boolean(),
  createdAt: z.string(),
  lastSignInAt: z.string().optional(),
});
export type StaffMember = z.infer<typeof StaffMemberSchema>;

export const TierAccentSchema = z.enum(['shore', 'tide', 'golden', 'endless']);
export type TierAccent = z.infer<typeof TierAccentSchema>;

export const TierSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  rank: z.number().int().min(0),
  thresholdPaise: z.number().int().min(0),
  earnBonusPct: z.number().int().min(0).max(200),
  benefits: z.array(z.string()),
  description: z.string(),
  accent: TierAccentSchema,
  active: z.boolean(),
});
export type Tier = z.infer<typeof TierSchema>;

export const OccasionTypeSchema = z.enum(['birthday', 'anniversary']);
export type OccasionType = z.infer<typeof OccasionTypeSchema>;

export const BenefitTypeSchema = z.enum([
  'bonus_points',
  'fixed_discount',
  'percent_discount',
  'voucher',
  'gift',
]);
export type BenefitType = z.infer<typeof BenefitTypeSchema>;

export const OccasionRuleBenefitSchema = z.object({
  type: BenefitTypeSchema,
  points: z.number().int().optional(),
  amountPaise: z.number().int().optional(),
  percent: z.number().int().optional(),
  capPaise: z.number().int().optional(),
  description: z.string().optional(),
});
export type OccasionRuleBenefit = z.infer<typeof OccasionRuleBenefitSchema>;

export const OccasionRuleSchema = z.object({
  id: z.string(),
  occasion: OccasionTypeSchema,
  name: z.string().min(1),
  benefit: OccasionRuleBenefitSchema,
  minPurchasePaise: z.number().int().optional(),
  eligibleTierIds: z.array(z.string()),
  unlockDaysBefore: z.number().int().min(0).max(60),
  validityDays: z.number().int().min(1).max(365),
  active: z.boolean(),
});
export type OccasionRule = z.infer<typeof OccasionRuleSchema>;

export const LoyaltyConfigSchema = z.object({
  earning: z.object({
    spendUnitPaise: z.number().int().min(100), // Default 10000 = ₹100
    pointsPerUnit: z.number().int().min(1), // Default 5
    rounding: z.enum(['down', 'nearest']),
    minPurchasePaise: z.number().int().min(0), // Default 50000 = ₹500
    pointValuePaise: z.number().int().min(1), // Default 50 = ₹0.50
  }),
  expiry: z.object({
    mode: z.enum(['none', 'fixed_months']),
    months: z.number().int().min(1).max(60), // Default 12
    expiringSoonDays: z.number().int().min(1).max(90), // Default 30
  }),
  tierWindow: z.enum(['rolling_12m', 'lifetime']),
  occasions: z.array(OccasionRuleSchema),
  couple: z.object({
    active: z.boolean(),
    bonusPoints: z.number().int().min(0),
    requireMarried: z.boolean(),
    cooldownDays: z.number().int().min(1).max(365),
  }),
  redemption: z.object({
    defaultVoucherValidityDays: z.number().int().min(1).max(365),
    allowStaffAssisted: z.boolean(),
    occasionSelfEdits: z.number().int().min(0).max(2),
  }),
  occasionMinDaysOnFile: z.number().int().min(0).max(365),
  updatedAt: z.string(),
  updatedBy: z.string(),
});
export type LoyaltyConfig = z.infer<typeof LoyaltyConfigSchema>;

export const CustomerSchema = z.object({
  id: z.string(),
  memberNo: z.string(), // e.g. TC104582
  name: z.string().min(1),
  mobile: z.string().regex(/^\+91\d{10}$/, 'Must be +91 followed by 10 digits'),
  email: z.string().email().optional().or(z.literal('')),
  birthday: z
    .object({
      day: z.number().int().min(1).max(31),
      month: z.number().int().min(1).max(12),
    })
    .optional(),
  maritalStatus: z.enum(['single', 'married', 'undisclosed']).optional(),
  spouseFirstName: z.string().optional(),
  anniversary: z
    .object({
      day: z.number().int().min(1).max(31),
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(1950).max(2100).optional(),
    })
    .optional(),
  occasionDates: z.object({
    birthdaySetAt: z.string().optional(),
    birthdayEdits: z.number().int().min(0).default(0),
    anniversarySetAt: z.string().optional(),
    anniversaryEdits: z.number().int().min(0).default(0),
  }),
  consent: z.object({
    terms: z.string(),
    updates: z.boolean(),
  }),
  enrolledAt: z.string(),
  enrolledVia: z.enum(['online', 'counter']),
  enrolledByStaffId: z.string().optional(),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const PurchaseSchema = z.object({
  id: z.string(),
  ref: z.string(), // P-000123
  customerId: z.string(),
  amountPaise: z.number().int().min(0),
  billNo: z.string().min(1),
  channel: z.enum(['store', 'online']),
  at: z.string(),
  staffId: z.string(),
  eligible: z.boolean(),
  earnTxnId: z.string().optional(),
  voided: z
    .object({
      at: z.string(),
      staffId: z.string(),
      reason: z.string().min(1),
      voidTxnId: z.string().optional(),
      pointsReversed: z.number().int().min(0),
      shortfall: z.number().int().min(0),
    })
    .optional(),
});
export type Purchase = z.infer<typeof PurchaseSchema>;

export const TransactionTypeSchema = z.enum([
  'EARN_PURCHASE',
  'EARN_BONUS',
  'ADJUST_CREDIT',
  'ADJUST_DEBIT',
  'REDEEM',
  'REDEEM_REFUND',
  'PURCHASE_VOID',
  'EXPIRE',
]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const PointsTransactionSchema = z.object({
  id: z.string(),
  ref: z.string(), // TX-000456
  customerId: z.string(),
  type: TransactionTypeSchema,
  points: z.number().int(), // signed integer
  at: z.string(),
  actor: z.object({
    kind: z.enum(['staff', 'member', 'system']),
    id: z.string().optional(),
  }),
  purchaseId: z.string().optional(),
  voucherId: z.string().optional(),
  coupleVisitId: z.string().optional(),
  occasionGrantId: z.string().optional(),
  campaignId: z.string().optional(),
  expiresAt: z.string().nullable().optional(),
  expiresLotTxnId: z.string().optional(),
  breakdown: z
    .object({
      basePoints: z.number().int(),
      tierBonus: z.number().int(),
      tierName: z.string(),
      tierPct: z.number().int(),
      campaignBonus: z.number().int(),
      campaignName: z.string().optional(),
      ruleSnapshot: z.object({
        spendUnitPaise: z.number().int(),
        pointsPerUnit: z.number().int(),
        rounding: z.enum(['down', 'nearest']),
      }),
    })
    .optional(),
  reason: z
    .object({
      category: z.string(),
      note: z.string(),
    })
    .optional(),
  description: z.string(),
});
export type PointsTransaction = z.infer<typeof PointsTransactionSchema>;

export const RewardTypeSchema = z.enum([
  'fixed_discount',
  'percent_discount',
  'voucher',
  'gift',
  'experience',
  'promotional',
]);
export type RewardType = z.infer<typeof RewardTypeSchema>;

export const RewardStatusSchema = z.enum(['draft', 'active', 'inactive', 'archived']);
export type RewardStatus = z.infer<typeof RewardStatusSchema>;

export const RewardSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: RewardTypeSchema,
  shortDescription: z.string(),
  description: z.string(),
  howToUse: z.string(),
  terms: z.string(),
  value: z.object({
    amountPaise: z.number().int().optional(),
    percent: z.number().int().optional(),
    capPaise: z.number().int().optional(),
    label: z.string(),
  }),
  image: z.object({
    src: z.string(),
    alt: z.string().min(1, 'Alt text is required'),
  }),
  pointsCost: z.number().int().min(1),
  eligibleTierIds: z.array(z.string()),
  minPurchasePaise: z.number().int().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  stockLimit: z.number().int().optional(),
  perMemberLimit: z.number().int().optional(),
  voucherValidityDays: z.number().int().min(1),
  status: RewardStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Reward = z.infer<typeof RewardSchema>;

export const VoucherStatusSchema = z.enum(['issued', 'used', 'cancelled']);
export type VoucherStatus = z.infer<typeof VoucherStatusSchema>;

export const IssuedVoucherSchema = z.object({
  id: z.string(),
  code: z.string(), // TC-XXXX-XXXX
  customerId: z.string(),
  source: z.enum(['catalogue', 'occasion']),
  rewardId: z.string().optional(),
  occasionRuleId: z.string().optional(),
  title: z.string(),
  valueLabel: z.string(),
  pointsSpent: z.number().int().min(0),
  channel: z.enum(['portal', 'store']),
  issuedAt: z.string(),
  expiresAt: z.string(),
  status: VoucherStatusSchema,
  usedAt: z.string().optional(),
  usedByStaffId: z.string().optional(),
  usedBillNo: z.string().optional(),
  cancelled: z
    .object({
      at: z.string(),
      staffId: z.string(),
      reason: z.string().min(1),
      refundTxnId: z.string().optional(),
    })
    .optional(),
  redeemTxnId: z.string().optional(),
});
export type IssuedVoucher = z.infer<typeof IssuedVoucherSchema>;

export const OccasionGrantSchema = z.object({
  id: z.string(),
  key: z.string(), // occasion:{ruleId}:{customerId}:{year}
  customerId: z.string(),
  ruleId: z.string(),
  occasion: OccasionTypeSchema,
  occurrenceDate: z.string(),
  grantedAt: z.string(),
  txnId: z.string().optional(),
  voucherId: z.string().optional(),
});
export type OccasionGrant = z.infer<typeof OccasionGrantSchema>;

export const CoupleVisitSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  at: z.string(),
  staffId: z.string(),
  bonusPoints: z.number().int().min(0),
  txnId: z.string(),
});
export type CoupleVisit = z.infer<typeof CoupleVisitSchema>;

export const CampaignTypeSchema = z.enum(['multiplier', 'flat_bonus']);
export type CampaignType = z.infer<typeof CampaignTypeSchema>;

export const CampaignSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  customerDescription: z.string(),
  type: CampaignTypeSchema,
  multiplierTenths: z.number().int().min(10).optional(), // 20 = 2.0x, 15 = 1.5x
  bonusPoints: z.number().int().min(1).optional(),
  minSpendPaise: z.number().int().optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  eligibleTierIds: z.array(z.string()),
  showToMembers: z.boolean(),
  active: z.boolean(),
});
export type Campaign = z.infer<typeof CampaignSchema>;

export const NotificationKindSchema = z.enum([
  'points_earned',
  'redeemed',
  'occasion_ready',
  'expiring',
  'tier_up',
  'adjusted',
]);
export type NotificationKind = z.infer<typeof NotificationKindSchema>;

export const NotificationSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  kind: NotificationKindSchema,
  title: z.string(),
  body: z.string(),
  at: z.string(),
  readAt: z.string().optional(),
});
export type Notification = z.infer<typeof NotificationSchema>;

export const AuditEntrySchema = z.object({
  id: z.string(),
  at: z.string(),
  actor: z.object({
    kind: z.enum(['staff', 'member', 'system']),
    id: z.string().optional(),
    name: z.string().optional(),
    role: z.string().optional(),
  }),
  action: z.string(),
  entity: z.object({
    type: z.string(),
    id: z.string(),
  }),
  summary: z.string(),
  reason: z.string().optional(),
  before: z.record(z.string(), z.unknown()).optional(),
  after: z.record(z.string(), z.unknown()).optional(),
});
export type AuditEntry = z.infer<typeof AuditEntrySchema>;

export const AppDataSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  seededAt: z.string(),
  seq: z.object({
    txn: z.number().int().min(0),
    member: z.number().int().min(0),
    purchase: z.number().int().min(0),
  }),
  config: LoyaltyConfigSchema,
  tiers: z.array(TierSchema),
  customers: z.array(CustomerSchema),
  staff: z.array(StaffMemberSchema),
  purchases: z.array(PurchaseSchema),
  transactions: z.array(PointsTransactionSchema),
  rewards: z.array(RewardSchema),
  vouchers: z.array(IssuedVoucherSchema),
  coupleVisits: z.array(CoupleVisitSchema),
  campaigns: z.array(CampaignSchema),
  occasionGrants: z.array(OccasionGrantSchema),
  notifications: z.array(NotificationSchema),
  audit: z.array(AuditEntrySchema),
  processedRequests: z.record(
    z.string(),
    z.object({
      at: z.string(),
      resultRef: z.string(),
    })
  ),
});
export type AppData = z.infer<typeof AppDataSchema>;
