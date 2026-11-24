import { addDays, subDays, subMonths } from 'date-fns';
import type {
  AppData,
  AuditEntry,
  CoupleVisit,
  Customer,
  IssuedVoucher,
  Notification,
  OccasionGrant,
  PointsTransaction,
  Purchase,
} from '@/domain/types';
import { AppDataSchema, SCHEMA_VERSION } from '@/data/schema';
import { seedConfig } from './config.seed';
import { seedTiers } from './tiers.seed';
import { seedStaff } from './staff.seed';
import { createSeedCampaigns } from './campaigns.seed';
import { createSeedRewards } from './rewards.seed';
import { createScenarioMembers } from './members.scenarios';
import { createPopulationMembers } from './members.population';
import { createMulberry32 } from './prng';
import { calculateEarn } from '@/domain/earning';
import { expiryDateFor } from '@/domain/expiry';
import { resolveTier } from '@/domain/tiers';
import { generateVoucherCode } from '@/domain/codes';

/**
 * Builds the complete deterministic demo dataset relative to `now`.
 * Executes real domain calculations in chronological order (Tech Arch §9).
 */
export function buildSeed(now: Date = new Date()): AppData {
  const rand = createMulberry32(20261124);
  const seededAt = now.toISOString();

  let txnSeq = 1;
  let purchaseSeq = 1;
  const memberSeq = 1;

  const nextTxnRef = () => `TX-${(txnSeq++).toString().padStart(6, '0')}`;
  const nextPurchaseRef = () => `P-${(purchaseSeq++).toString().padStart(6, '0')}`;

  const config = { ...seedConfig, updatedAt: seededAt };
  const tiers = [...seedTiers];
  const staff = [...seedStaff];
  const campaigns = createSeedCampaigns(now);
  const rewards = createSeedRewards(now);

  const scenarioCustomers = createScenarioMembers(now);
  const populationCustomers = createPopulationMembers();
  const allCustomers: Customer[] = [...scenarioCustomers, ...populationCustomers];

  const purchases: Purchase[] = [];
  const transactions: PointsTransaction[] = [];
  const vouchers: IssuedVoucher[] = [];
  const coupleVisits: CoupleVisit[] = [];
  const occasionGrants: OccasionGrant[] = [];
  const notifications: Notification[] = [];
  const audit: AuditEntry[] = [];

  // Helper to record purchase in seed
  const recordSeedPurchase = (
    customerId: string,
    amountPaise: number,
    billNo: string,
    at: Date,
    staffId = 'staff-pooja'
  ): { purchase: Purchase; txn: PointsTransaction | null } => {
    // Current customer qualifying spend up to this point
    const priorPurchases = purchases.filter(
      (p) => p.customerId === customerId && p.eligible && !p.voided && p.at <= at.toISOString()
    );
    const priorSpend = priorPurchases.reduce((sum, p) => sum + p.amountPaise, 0);
    const tierBefore = resolveTier(priorSpend, tiers);

    const earnResult = calculateEarn({
      amountPaise,
      config: config.earning,
      tier: tierBefore,
      campaigns,
      at,
    });

    const pId = `purch-${purchaseSeq}`;
    const pRef = nextPurchaseRef();
    const atIso = at.toISOString();

    let earnTxn: PointsTransaction | null = null;

    if (earnResult.eligible && earnResult.totalPoints > 0) {
      const tId = `txn-${txnSeq}`;
      const tRef = nextTxnRef();
      const expiresAt = expiryDateFor(at, config.expiry);

      earnTxn = {
        id: tId,
        ref: tRef,
        customerId,
        type: 'EARN_PURCHASE',
        points: earnResult.totalPoints,
        at: atIso,
        actor: { kind: 'staff', id: staffId },
        purchaseId: pId,
        expiresAt,
        breakdown: {
          basePoints: earnResult.basePoints,
          tierBonus: earnResult.tierBonus,
          tierName: tierBefore.name,
          tierPct: tierBefore.earnBonusPct,
          campaignBonus: earnResult.campaignBonus,
          campaignName: earnResult.campaign?.name,
          ruleSnapshot: earnResult.ruleSnapshot,
        },
        description: `Purchase at Trove store — bill ${billNo}`,
      };

      transactions.push(earnTxn);
    }

    const purchase: Purchase = {
      id: pId,
      ref: pRef,
      customerId,
      amountPaise,
      billNo,
      channel: 'store',
      at: atIso,
      staffId,
      eligible: earnResult.eligible,
      earnTxnId: earnTxn ? earnTxn.id : undefined,
    };

    purchases.push(purchase);
    return { purchase, txn: earnTxn };
  };

  // --- 1. Scenario Customer Histories ---

  // TARA MENON (cust-tara)
  // Purchases: ₹6,490 (-10mo), ₹3,990 (-8mo), ₹9,990 (-6mo), ₹4,500 (-4mo), ₹5,500 (-2mo), ₹6,930 (-3wk)
  recordSeedPurchase('cust-tara', 649000, '4101', subMonths(now, 10));
  recordSeedPurchase('cust-tara', 399000, '4102', subMonths(now, 8));
  recordSeedPurchase('cust-tara', 999000, '4103', subMonths(now, 6));

  // Redeemed ₹250 off voucher (-5mo, 500 pts)
  const taraRedeemTxnId = `txn-${txnSeq}`;
  transactions.push({
    id: taraRedeemTxnId,
    ref: nextTxnRef(),
    customerId: 'cust-tara',
    type: 'REDEEM',
    points: -500,
    at: subMonths(now, 5).toISOString(),
    actor: { kind: 'member', id: 'cust-tara' },
    voucherId: 'vouch-tara-1',
    description: 'Redeemed ₹250 off Resortwear voucher',
  });
  const seededCodes = new Set<string>(['TC-7K3M-Q9PX']);
  vouchers.push({
    id: 'vouch-tara-1',
    code: 'TC-7K3M-Q9PX',
    customerId: 'cust-tara',
    source: 'catalogue',
    rewardId: 'rwd-250-off',
    title: '₹250 off Resortwear',
    valueLabel: '₹250 off',
    pointsSpent: 500,
    channel: 'store',
    issuedAt: subMonths(now, 5).toISOString(),
    expiresAt: subMonths(now, 4).toISOString(),
    status: 'used',
    usedAt: subMonths(now, 5).toISOString(),
    usedByStaffId: 'staff-pooja',
    usedBillNo: '4104',
    redeemTxnId: taraRedeemTxnId,
  });

  recordSeedPurchase('cust-tara', 450000, '4104', subMonths(now, 4));
  recordSeedPurchase('cust-tara', 550000, '4105', subMonths(now, 2));
  recordSeedPurchase('cust-tara', 693000, '4106', subDays(now, 21));

  // KABIR MALHOTRA (cust-kabir)
  // Purchases: ₹4,000 (-8mo), ₹3,000 (-5mo), ₹4,000 (-2mo) = 550 pts
  recordSeedPurchase('cust-kabir', 400000, '4201', subMonths(now, 8));
  // Birthday bonus 250 pts (-8mo)
  transactions.push({
    id: `txn-${txnSeq}`,
    ref: nextTxnRef(),
    customerId: 'cust-kabir',
    type: 'EARN_BONUS',
    points: 250,
    at: subMonths(now, 8).toISOString(),
    expiresAt: expiryDateFor(subMonths(now, 8), config.expiry) ?? undefined,
    actor: { kind: 'system' },
    description: 'Birthday celebration bonus',
  });
  recordSeedPurchase('cust-kabir', 300000, '4202', subMonths(now, 5));
  recordSeedPurchase('cust-kabir', 400000, '4203', subMonths(now, 2));
  // Goodwill adjustment +200 (-1mo)
  transactions.push({
    id: `txn-${txnSeq}`,
    ref: nextTxnRef(),
    customerId: 'cust-kabir',
    type: 'ADJUST_CREDIT',
    points: 200,
    at: subMonths(now, 1).toISOString(),
    expiresAt: expiryDateFor(subMonths(now, 1), config.expiry) ?? undefined,
    actor: { kind: 'staff', id: 'staff-arjun' },
    reason: {
      category: 'Service recovery',
      note: 'Service recovery — delayed alteration',
    },
    description: 'Points adjustment: Goodwill (Service recovery — delayed alteration)',
  });

  // ZOYA SIDDIQUI (cust-zoya)
  // Purchases: ₹12,000 (-10mo), ₹14,000 (-7mo), ₹20,000 (-4mo) -> Golden Hour (₹46,000)
  recordSeedPurchase('cust-zoya', 1200000, '4301', subMonths(now, 10));
  recordSeedPurchase('cust-zoya', 1400000, '4302', subMonths(now, 7));
  recordSeedPurchase('cust-zoya', 2000000, '4303', subMonths(now, 4));

  // Zoya birthday treat unlocked (5 days away)
  const zoyaOccDate = addDays(now, 5).toISOString();
  const zoyaBonusTxnId = `txn-${txnSeq}`;
  transactions.push({
    id: zoyaBonusTxnId,
    ref: nextTxnRef(),
    customerId: 'cust-zoya',
    type: 'EARN_BONUS',
    points: 250,
    at: subDays(now, 2).toISOString(),
    expiresAt: expiryDateFor(subDays(now, 2), config.expiry) ?? undefined,
    actor: { kind: 'system' },
    description: 'Birthday celebration bonus',
  });
  occasionGrants.push({
    id: 'grant-zoya-bday-1',
    key: `occasion:rule-bday-bonus:cust-zoya:${now.getFullYear()}`,
    customerId: 'cust-zoya',
    ruleId: 'rule-bday-bonus',
    occasion: 'birthday',
    occurrenceDate: zoyaOccDate,
    grantedAt: subDays(now, 2).toISOString(),
    txnId: zoyaBonusTxnId,
  });

  const zoyaVoucherCode = generateVoucherCode(seededCodes, rand);
  seededCodes.add(zoyaVoucherCode);
  const zoyaVoucherId = 'vouch-zoya-vip';
  vouchers.push({
    id: zoyaVoucherId,
    code: zoyaVoucherCode,
    customerId: 'cust-zoya',
    source: 'occasion',
    occasionRuleId: 'rule-bday-vip-discount',
    title: 'Birthday 15% Atelier Voucher',
    valueLabel: '15% off (max ₹2,000)',
    pointsSpent: 0,
    channel: 'portal',
    issuedAt: subDays(now, 2).toISOString(),
    expiresAt: addDays(now, 28).toISOString(),
    status: 'issued',
  });
  occasionGrants.push({
    id: 'grant-zoya-bday-2',
    key: `occasion:rule-bday-vip-discount:cust-zoya:${now.getFullYear()}`,
    customerId: 'cust-zoya',
    ruleId: 'rule-bday-vip-discount',
    occasion: 'birthday',
    occurrenceDate: zoyaOccDate,
    grantedAt: subDays(now, 2).toISOString(),
    voucherId: zoyaVoucherId,
  });

  // ADITI RAO (cust-aditi)
  // Purchases: ₹8,000 (-9mo), ₹10,000 (-5mo), ₹10,000 (-2mo) -> Tide (₹28,000)
  recordSeedPurchase('cust-aditi', 800000, '4401', subMonths(now, 9));
  recordSeedPurchase('cust-aditi', 1000000, '4402', subMonths(now, 5));
  recordSeedPurchase('cust-aditi', 1000000, '4403', subMonths(now, 2));

  // Couple visit 45 days ago (+100 pts)
  const aditiCoupleTxnId = `txn-${txnSeq}`;
  transactions.push({
    id: aditiCoupleTxnId,
    ref: nextTxnRef(),
    customerId: 'cust-aditi',
    type: 'EARN_BONUS',
    points: 100,
    at: subDays(now, 45).toISOString(),
    expiresAt: expiryDateFor(subDays(now, 45), config.expiry) ?? undefined,
    actor: { kind: 'staff', id: 'staff-pooja' },
    coupleVisitId: 'cv-aditi-1',
    description: 'Couple visit store celebration bonus',
  });
  coupleVisits.push({
    id: 'cv-aditi-1',
    customerId: 'cust-aditi',
    at: subDays(now, 45).toISOString(),
    staffId: 'staff-pooja',
    bonusPoints: 100,
    txnId: aditiCoupleTxnId,
  });

  // FARHAN QURESHI (cust-farhan)
  // Purchases on 1st of month at 11:00:
  // -13mo: ₹4,000 -> 200 pts, expired
  const farhanP1Date = new Date(now.getFullYear(), now.getMonth() - 13, 1, 11, 0, 0);
  const farhanP1 = recordSeedPurchase('cust-farhan', 400000, '4501', farhanP1Date);
  // Expiry instant for farhanP1 was end of month (-1 month)
  if (farhanP1.txn && farhanP1.txn.expiresAt) {
    transactions.push({
      id: `txn-${txnSeq}`,
      ref: nextTxnRef(),
      customerId: 'cust-farhan',
      type: 'EXPIRE',
      points: -200,
      at: farhanP1.txn.expiresAt,
      actor: { kind: 'system' },
      expiresLotTxnId: farhanP1.txn.id,
      description: 'Points expired after 12 months',
    });
  }

  // -12mo: ₹9,000 -> 450 pts expiring end of this month
  const farhanP2Date = new Date(now.getFullYear(), now.getMonth() - 12, 1, 11, 0, 0);
  recordSeedPurchase('cust-farhan', 900000, '4502', farhanP2Date);

  // -11mo: ₹5,000 -> 250 pts expiring end of next month
  const farhanP3Date = new Date(now.getFullYear(), now.getMonth() - 11, 1, 11, 0, 0);
  recordSeedPurchase('cust-farhan', 500000, '4503', farhanP3Date);

  // --- 2. Population Members Purchases & Transactions ---
  // Realistic purchases to satisfy tier mix: 10 Shore, 8 Tide, 4 Golden Hour, 2 Endless Summer
  // Scenarios gave: Meera (Shore), Tara (Tide), Kabir (Shore), Zoya (Golden), Aditi (Tide), Farhan (Shore)
  // Needed from 18 population:
  // Shore: 7 more
  // Tide: 6 more
  // Golden Hour: 3 more
  // Endless Summer: 2

  const popTiersTarget = [
    'endless', // pop-1
    'endless', // pop-2
    'golden',  // pop-3
    'golden',  // pop-4
    'golden',  // pop-5
    'tide',    // pop-6
    'tide',    // pop-7
    'tide',    // pop-8
    'tide',    // pop-9
    'tide',    // pop-10
    'tide',    // pop-11
    'shore',   // pop-12
    'shore',   // pop-13
    'shore',   // pop-14
    'shore',   // pop-15
    'shore',   // pop-16
    'shore',   // pop-17
    'shore',   // pop-18
  ];

  const targetSpendMap: Record<string, number> = {
    endless: 11500000, // ₹1,15,000
    golden: 4800000,   // ₹48,000
    tide: 18500000,    // ₹18,500 (wait: 1850000 = ₹18,500)
    shore: 650000,     // ₹6,500
  };

  targetSpendMap.tide = 1850000; // fix

  popTiersTarget.forEach((targetTier, idx) => {
    const custId = `cust-pop-${idx + 1}`;
    const targetSpend = targetSpendMap[targetTier] || 650000;
    const purchasesCount = targetTier === 'endless' ? 8 : targetTier === 'golden' ? 5 : 3;
    const chunk = Math.floor(targetSpend / purchasesCount);

    for (let pIdx = 0; pIdx < purchasesCount; pIdx++) {
      const monthsAgo = Math.floor(rand() * 10) + 1;
      const daysAgo = monthsAgo * 30 + Math.floor(rand() * 20);
      const purchaseTime = subDays(now, daysAgo);
      recordSeedPurchase(custId, chunk, `5${(idx + 1).toString().padStart(2, '0')}${pIdx + 1}`, purchaseTime);
    }
  });

  // Seed 1 voided purchase in population
  const popVoidCustId = 'cust-pop-12';
  const voidPurchaseRes = recordSeedPurchase(popVoidCustId, 399000, '5129', subDays(now, 15));
  if (voidPurchaseRes.txn) {
    const voidTxnId = `txn-${txnSeq}`;
    transactions.push({
      id: voidTxnId,
      ref: nextTxnRef(),
      customerId: popVoidCustId,
      purchaseId: voidPurchaseRes.purchase.id,
      type: 'PURCHASE_VOID',
      points: -voidPurchaseRes.txn.points,
      at: subDays(now, 14).toISOString(),
      actor: { kind: 'staff', id: 'staff-arjun' },
      description: `Voided purchase ${voidPurchaseRes.purchase.ref} — bill 5129 (Customer return)`,
    });
    voidPurchaseRes.purchase.voided = {
      at: subDays(now, 14).toISOString(),
      staffId: 'staff-arjun',
      reason: 'Customer return of unworn merchandise',
      voidTxnId,
      pointsReversed: voidPurchaseRes.txn.points,
      shortfall: 0,
    };
  }

  // Seed 4 manual adjustments
  const adjustTargets = [
    { custId: 'cust-pop-1', pts: 500, type: 'ADJUST_CREDIT' as const, reason: 'Goodwill — styling gift' },
    { custId: 'cust-pop-3', pts: 250, type: 'ADJUST_CREDIT' as const, reason: 'Correction — missing bill points' },
    { custId: 'cust-pop-6', pts: -100, type: 'ADJUST_DEBIT' as const, reason: 'Correction — duplicate point entry' },
    { custId: 'cust-pop-9', pts: 300, type: 'ADJUST_CREDIT' as const, reason: 'Service recovery — delivery delay' },
  ];
  for (const adj of adjustTargets) {
    transactions.push({
      id: `txn-${txnSeq}`,
      ref: nextTxnRef(),
      customerId: adj.custId,
      type: adj.type,
      points: adj.pts,
      at: subDays(now, 10).toISOString(),
      actor: { kind: 'staff', id: 'staff-arjun' },
      reason: { category: adj.reason.split(' — ')[0] || 'Correction', note: adj.reason },
      description: `Manual adjustment: ${adj.reason}`,
    });
  }

  // Seed 6 couple visits across population
  for (let i = 1; i <= 6; i++) {
    const custId = `cust-pop-${i * 2}`;
    const cvTxnId = `txn-${txnSeq}`;
    transactions.push({
      id: cvTxnId,
      ref: nextTxnRef(),
      customerId: custId,
      type: 'EARN_BONUS',
      points: 100,
      at: subDays(now, 20 + i * 5).toISOString(),
      expiresAt: expiryDateFor(subDays(now, 20 + i * 5), config.expiry) ?? undefined,
      actor: { kind: 'staff', id: 'staff-pooja' },
      coupleVisitId: `cv-pop-${i}`,
      description: 'Couple visit celebration bonus',
    });
    coupleVisits.push({
      id: `cv-pop-${i}`,
      customerId: custId,
      at: subDays(now, 20 + i * 5).toISOString(),
      staffId: 'staff-pooja',
      bonusPoints: 100,
      txnId: cvTxnId,
    });
  }

  // Seed catalogue redemptions across population
  const redeemConfigs = [
    { custId: 'cust-pop-1', rwdId: 'rwd-styling', pts: 2500, status: 'used' as const },
    { custId: 'cust-pop-2', rwdId: 'rwd-tote', pts: 1200, status: 'issued' as const },
    { custId: 'cust-pop-3', rwdId: 'rwd-600-off', pts: 1000, status: 'used' as const },
    { custId: 'cust-pop-4', rwdId: 'rwd-250-off', pts: 500, status: 'issued' as const },
    { custId: 'cust-pop-5', rwdId: 'rwd-10-percent', pts: 800, status: 'issued' as const },
    { custId: 'cust-pop-7', rwdId: 'rwd-alterations', pts: 400, status: 'used' as const },
    { custId: 'cust-pop-8', rwdId: 'rwd-early-access', pts: 300, status: 'used' as const },
    { custId: 'cust-pop-10', rwdId: 'rwd-250-off', pts: 500, status: 'cancelled' as const },
  ];

  redeemConfigs.forEach((rc, rIdx) => {
    const rwd = rewards.find((r) => r.id === rc.rwdId)!;
    const rTxnId = `txn-${txnSeq}`;
    transactions.push({
      id: rTxnId,
      ref: nextTxnRef(),
      customerId: rc.custId,
      type: 'REDEEM',
      points: -rc.pts,
      at: subDays(now, 30 - rIdx * 2).toISOString(),
      actor: { kind: 'member', id: rc.custId },
      voucherId: `vouch-pop-${rIdx + 1}`,
      description: `Redeemed ${rwd.name}`,
    });

    const vCode = generateVoucherCode(seededCodes, rand);
    seededCodes.add(vCode);
    const v: IssuedVoucher = {
      id: `vouch-pop-${rIdx + 1}`,
      code: vCode,
      customerId: rc.custId,
      source: 'catalogue',
      rewardId: rc.rwdId,
      title: rwd.name,
      valueLabel: rwd.value.label,
      pointsSpent: rc.pts,
      channel: 'portal',
      issuedAt: subDays(now, 30 - rIdx * 2).toISOString(),
      expiresAt: addDays(now, 10 + rIdx).toISOString(),
      status: rc.status,
      usedAt: rc.status === 'used' ? subDays(now, 10).toISOString() : undefined,
      usedByStaffId: rc.status === 'used' ? 'staff-pooja' : undefined,
      redeemTxnId: rTxnId,
    };

    if (rc.status === 'cancelled') {
      const refundTxnId = `txn-${txnSeq}`;
      transactions.push({
        id: refundTxnId,
        ref: nextTxnRef(),
        customerId: rc.custId,
        type: 'REDEEM_REFUND',
        points: rc.pts,
        at: subDays(now, 5).toISOString(),
        actor: { kind: 'staff', id: 'staff-arjun' },
        voucherId: v.id,
        description: `Refund for cancelled voucher: ${rwd.name}`,
      });
      v.cancelled = {
        at: subDays(now, 5).toISOString(),
        staffId: 'staff-arjun',
        reason: 'Requested cancellation by customer',
        refundTxnId,
      };
    }

    vouchers.push(v);
  });

  // Seed in-app notifications
  allCustomers.slice(0, 8).forEach((cust, i) => {
    notifications.push({
      id: `notif-${i + 1}`,
      customerId: cust.id,
      kind: i % 2 === 0 ? 'points_earned' : 'occasion_ready',
      title: i % 2 === 0 ? 'Points Added to Your Balance' : 'A Summer Treat is Ready For You',
      body:
        i % 2 === 0
          ? 'Your recent in-store purchase has been recorded. Check your updated points!'
          : 'Celebrate your special season with a bespoke Trove Club reward.',
      at: subDays(now, i + 1).toISOString(),
      readAt: i > 3 ? subDays(now, 1).toISOString() : undefined,
    });
  });

  // Initial audit entries
  audit.push({
    id: 'audit-seed-1',
    at: seededAt,
    actor: { kind: 'staff', id: 'staff-nisha', name: 'Nisha Varma', role: 'admin' },
    action: 'SEED_INITIALISED',
    entity: { type: 'system', id: 'system' },
    summary: 'Initialised Trove Club commercial prototype seed data',
  });

  const appData: AppData = {
    schemaVersion: SCHEMA_VERSION,
    seededAt,
    seq: {
      txn: txnSeq,
      member: memberSeq + allCustomers.length,
      purchase: purchaseSeq,
    },
    config,
    tiers,
    customers: allCustomers,
    staff,
    purchases,
    transactions,
    rewards,
    vouchers,
    coupleVisits,
    campaigns,
    occasionGrants,
    notifications,
    audit,
    processedRequests: {},
  };

  // Validate entire dataset against AppDataSchema
  AppDataSchema.parse(appData);

  return appData;
}
