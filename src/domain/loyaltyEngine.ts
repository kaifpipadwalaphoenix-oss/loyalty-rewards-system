import type {
  LoyaltyConfig,
  PurchaseCalculationResult,
  RedemptionValidationResult,
  TransactionSource,
} from '../types/loyalty';

/**
 * Calculates rolling expiry date based on starting date and validity months
 */
export function calculateExpiryDate(fromDateISO: string, expiryMonths: number): string {
  const date = new Date(fromDateISO);
  date.setMonth(date.getMonth() + expiryMonths);
  return date.toISOString();
}

/**
 * Pure calculation engine for points earned on a purchase
 * Evaluates active loyalty rules dynamically
 */
export function calculatePoints(
  purchaseAmount: number,
  config: LoyaltyConfig,
  source: TransactionSource = 'Store'
): PurchaseCalculationResult {
  const threshold = Math.max(1, Number(config.purchaseThreshold) || 100);
  const pointsPerThr = Math.max(0, Number(config.pointsPerThreshold) || 10);
  const pointVal = Math.max(0.01, Number(config.pointValue) || 1.0);
  const minPurchase = Math.max(0, Number(config.minimumPurchase) || 0);

  // Check master earning toggle
  if (!config.earningEnabled) {
    return {
      purchaseAmount,
      eligiblePurchaseAmount: 0,
      pointsEarned: 0,
      monetaryRewardValue: 0,
      remainingTowardsNextThreshold: threshold,
      ruleUsed: { purchaseThreshold: threshold, pointsPerThreshold: pointsPerThr, pointValue: pointVal },
      earningBlockedReason: 'Points earning is disabled by program administrator.',
    };
  }

  // Check physical store channel toggle
  if (source === 'Store' && !config.storeEarningEnabled) {
    return {
      purchaseAmount,
      eligiblePurchaseAmount: 0,
      pointsEarned: 0,
      monetaryRewardValue: 0,
      remainingTowardsNextThreshold: threshold,
      ruleUsed: { purchaseThreshold: threshold, pointsPerThreshold: pointsPerThr, pointValue: pointVal },
      earningBlockedReason: 'Points earning for physical retail store purchases is currently paused.',
    };
  }

  // Check online channel toggle
  if (source === 'Online' && !config.onlineEarningEnabled) {
    return {
      purchaseAmount,
      eligiblePurchaseAmount: 0,
      pointsEarned: 0,
      monetaryRewardValue: 0,
      remainingTowardsNextThreshold: threshold,
      ruleUsed: { purchaseThreshold: threshold, pointsPerThreshold: pointsPerThr, pointValue: pointVal },
      earningBlockedReason: 'Points earning for online e-commerce orders is currently paused.',
    };
  }

  // Check minimum qualifying purchase amount
  if (purchaseAmount < minPurchase) {
    return {
      purchaseAmount,
      eligiblePurchaseAmount: purchaseAmount,
      pointsEarned: 0,
      monetaryRewardValue: 0,
      remainingTowardsNextThreshold: threshold,
      ruleUsed: { purchaseThreshold: threshold, pointsPerThreshold: pointsPerThr, pointValue: pointVal },
      earningBlockedReason: `Purchase amount ₹${purchaseAmount} is below the qualifying threshold of ₹${minPurchase}.`,
    };
  }

  const eligibleAmount = Math.max(0, purchaseAmount);
  let pointsEarned = 0;

  if (config.earningMethod === 'proportional') {
    pointsEarned = Math.round((eligibleAmount / threshold) * pointsPerThr);
  } else {
    // Standard retail Floor calculation: FLOOR(Eligible Purchase / Threshold) × Points Per Threshold
    const fullThresholdsMet = Math.floor(eligibleAmount / threshold);
    pointsEarned = fullThresholdsMet * pointsPerThr;
  }

  // Calculate remaining spend towards the next earning threshold
  const modulo = eligibleAmount % threshold;
  const remainingTowardsNextThreshold = modulo === 0 ? 0 : threshold - modulo;

  const monetaryRewardValue = pointsEarned * pointVal;

  return {
    purchaseAmount,
    eligiblePurchaseAmount: eligibleAmount,
    pointsEarned,
    monetaryRewardValue,
    remainingTowardsNextThreshold,
    ruleUsed: {
      purchaseThreshold: threshold,
      pointsPerThreshold: pointsPerThr,
      pointValue: pointVal,
    },
  };
}

/**
 * Validates checkout point redemption against policy caps and customer balance
 */
export function validateRedemption(
  billAmount: number,
  pointsToRedeem: number,
  customerAvailablePoints: number,
  config: LoyaltyConfig
): RedemptionValidationResult {
  const pointVal = Math.max(0.01, Number(config.pointValue) || 1.0);
  const maxPercent = Math.min(100, Math.max(1, Number(config.maximumRedemptionPercentage) || 30));
  const minRedemption = Math.max(0, Number(config.minimumRedemptionPoints) || 50);

  // Maximum discount allowed per configured percentage of the bill
  const maxAllowedDiscount = (billAmount * maxPercent) / 100;
  const maxAllowedPoints = Math.floor(maxAllowedDiscount / pointVal);

  if (!config.redemptionEnabled) {
    return {
      isValid: false,
      pointsToRedeem,
      discountRupees: 0,
      finalPayableAmount: billAmount,
      errorMessage: 'Point redemption is currently disabled in the loyalty program.',
      maxAllowedPoints: 0,
      maxAllowedDiscount: 0,
    };
  }

  if (pointsToRedeem <= 0) {
    return {
      isValid: true,
      pointsToRedeem: 0,
      discountRupees: 0,
      finalPayableAmount: billAmount,
      maxAllowedPoints: Math.min(customerAvailablePoints, maxAllowedPoints),
      maxAllowedDiscount,
    };
  }

  if (pointsToRedeem > customerAvailablePoints) {
    return {
      isValid: false,
      pointsToRedeem,
      discountRupees: 0,
      finalPayableAmount: billAmount,
      errorMessage: `Customer has only ${customerAvailablePoints} points available (requested ${pointsToRedeem}).`,
      maxAllowedPoints: Math.min(customerAvailablePoints, maxAllowedPoints),
      maxAllowedDiscount,
    };
  }

  if (pointsToRedeem < minRedemption) {
    return {
      isValid: false,
      pointsToRedeem,
      discountRupees: 0,
      finalPayableAmount: billAmount,
      errorMessage: `Minimum redemption threshold is ${minRedemption} points (customer requested ${pointsToRedeem}).`,
      maxAllowedPoints: Math.min(customerAvailablePoints, maxAllowedPoints),
      maxAllowedDiscount,
    };
  }

  const discountRupees = pointsToRedeem * pointVal;

  if (discountRupees > maxAllowedDiscount) {
    return {
      isValid: false,
      pointsToRedeem,
      discountRupees,
      finalPayableAmount: billAmount,
      errorMessage: `Redemption exceeds policy cap of ${maxPercent}% of bill (max ${maxAllowedPoints} points / ₹${maxAllowedDiscount.toFixed(2)}).`,
      maxAllowedPoints: Math.min(customerAvailablePoints, maxAllowedPoints),
      maxAllowedDiscount,
    };
  }

  if (discountRupees > billAmount) {
    return {
      isValid: false,
      pointsToRedeem,
      discountRupees,
      finalPayableAmount: billAmount,
      errorMessage: 'Redemption discount cannot exceed total purchase amount.',
      maxAllowedPoints: Math.floor(billAmount / pointVal),
      maxAllowedDiscount: billAmount,
    };
  }

  const finalPayableAmount = Math.max(0, billAmount - discountRupees);

  return {
    isValid: true,
    pointsToRedeem,
    discountRupees,
    finalPayableAmount,
    maxAllowedPoints: Math.min(customerAvailablePoints, maxAllowedPoints),
    maxAllowedDiscount,
  };
}
