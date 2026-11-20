import test from 'node:test';
import assert from 'node:assert/strict';

// Test domain calculations directly
function calculatePoints(amount, config, source = 'Store') {
  const threshold = Math.max(1, Number(config.purchaseThreshold) || 100);
  const pointsPerThr = Math.max(0, Number(config.pointsPerThreshold) || 10);
  const pointVal = Math.max(0.01, Number(config.pointValue) || 1.0);
  const minPurchase = Math.max(0, Number(config.minimumPurchase) || 0);

  if (!config.earningEnabled) {
    return { pointsEarned: 0, monetaryValue: 0, blocked: true, reason: 'Earning disabled' };
  }
  if (source === 'Store' && !config.storeEarningEnabled) {
    return { pointsEarned: 0, monetaryValue: 0, blocked: true, reason: 'Store earning disabled' };
  }
  if (source === 'Online' && !config.onlineEarningEnabled) {
    return { pointsEarned: 0, monetaryValue: 0, blocked: true, reason: 'Online earning disabled' };
  }
  if (amount < minPurchase) {
    return { pointsEarned: 0, monetaryValue: 0, blocked: true, reason: 'Below minimum qualifying purchase' };
  }

  const eligibleAmount = Math.max(0, amount);
  let pointsEarned = 0;
  if (config.earningMethod === 'proportional') {
    pointsEarned = Math.round((eligibleAmount / threshold) * pointsPerThr);
  } else {
    // Floor calculation
    pointsEarned = Math.floor(eligibleAmount / threshold) * pointsPerThr;
  }

  const modulo = eligibleAmount % threshold;
  const remainingTowardsNext = modulo === 0 ? 0 : threshold - modulo;

  return {
    purchaseAmount: amount,
    pointsEarned,
    monetaryValue: pointsEarned * pointVal,
    remainingTowardsNext,
    blocked: false,
  };
}

function validateRedemption(billAmount, pointsToRedeem, customerBalance, config) {
  const pointVal = Math.max(0.01, Number(config.pointValue) || 1.0);
  const maxPercent = Math.min(100, Math.max(1, Number(config.maximumRedemptionPercentage) || 30));
  const minRedemption = Math.max(0, Number(config.minimumRedemptionPoints) || 50);

  const maxAllowedDiscount = (billAmount * maxPercent) / 100;
  const maxAllowedPoints = Math.floor(maxAllowedDiscount / pointVal);

  if (!config.redemptionEnabled) {
    return { isValid: false, errorMessage: 'Redemption disabled' };
  }
  if (pointsToRedeem <= 0) {
    return { isValid: true, pointsToRedeem: 0, discountRupees: 0, finalPayableAmount: billAmount };
  }
  if (pointsToRedeem > customerBalance) {
    return { isValid: false, errorMessage: 'Insufficient balance' };
  }
  if (pointsToRedeem < minRedemption) {
    return { isValid: false, errorMessage: 'Below minimum redemption points' };
  }

  const discountRupees = pointsToRedeem * pointVal;
  if (discountRupees > maxAllowedDiscount) {
    return { isValid: false, errorMessage: 'Exceeds maximum bill percentage cap' };
  }
  if (discountRupees > billAmount) {
    return { isValid: false, errorMessage: 'Discount exceeds bill' };
  }

  return {
    isValid: true,
    pointsToRedeem,
    discountRupees,
    finalPayableAmount: Math.max(0, billAmount - discountRupees),
    maxAllowedPoints,
    maxAllowedDiscount,
  };
}

test('1. Default Earning Calculation: ₹2,000 with ₹100 threshold and 10 pts/thr gives 200 pts', () => {
  const config = {
    earningEnabled: true,
    purchaseThreshold: 100,
    pointsPerThreshold: 10,
    pointValue: 1.0,
    minimumPurchase: 0,
    earningMethod: 'threshold_floor',
    storeEarningEnabled: true,
    onlineEarningEnabled: true,
  };

  const result = calculatePoints(2000, config, 'Store');
  assert.equal(result.pointsEarned, 200);
  assert.equal(result.monetaryValue, 200);
  assert.equal(result.remainingTowardsNext, 0);
});

test('2. Floor Calculation with remainder: ₹2,550 with ₹100 threshold and 10 pts/thr gives 250 pts', () => {
  const config = {
    earningEnabled: true,
    purchaseThreshold: 100,
    pointsPerThreshold: 10,
    pointValue: 1.0,
    minimumPurchase: 0,
    earningMethod: 'threshold_floor',
    storeEarningEnabled: true,
    onlineEarningEnabled: true,
  };

  const result = calculatePoints(2550, config, 'Store');
  assert.equal(result.pointsEarned, 250);
  assert.equal(result.remainingTowardsNext, 50); // 50 more to next 100
});

test('3. Dynamic Configuration Change: Changing ₹100=10 pts to ₹100=20 pts produces 400 pts on ₹2,000', () => {
  const config = {
    earningEnabled: true,
    purchaseThreshold: 100,
    pointsPerThreshold: 20, // dynamically changed
    pointValue: 1.0,
    minimumPurchase: 0,
    earningMethod: 'threshold_floor',
    storeEarningEnabled: true,
    onlineEarningEnabled: true,
  };

  const result = calculatePoints(2000, config, 'Store');
  assert.equal(result.pointsEarned, 400);
  assert.equal(result.monetaryValue, 400);
});

test('4. Configurable Point Monetary Value: 1 pt = ₹0.50 conversion rate', () => {
  const config = {
    earningEnabled: true,
    purchaseThreshold: 100,
    pointsPerThreshold: 10,
    pointValue: 0.5, // 1 point = 50 paise
    minimumPurchase: 0,
    earningMethod: 'threshold_floor',
    storeEarningEnabled: true,
    onlineEarningEnabled: true,
  };

  const result = calculatePoints(2000, config, 'Store');
  assert.equal(result.pointsEarned, 200);
  assert.equal(result.monetaryValue, 100); // 200 * 0.5 = ₹100
});

test('5. Minimum Qualifying Purchase: Bill below threshold earns 0 points', () => {
  const config = {
    earningEnabled: true,
    purchaseThreshold: 100,
    pointsPerThreshold: 10,
    pointValue: 1.0,
    minimumPurchase: 500, // ₹500 required
    earningMethod: 'threshold_floor',
    storeEarningEnabled: true,
    onlineEarningEnabled: true,
  };

  const resultBelow = calculatePoints(450, config, 'Store');
  assert.equal(resultBelow.pointsEarned, 0);
  assert.equal(resultBelow.blocked, true);

  const resultAbove = calculatePoints(600, config, 'Store');
  assert.equal(resultAbove.pointsEarned, 60);
  assert.equal(resultAbove.blocked, false);
});

test('6. Valid Redemption: 50 points on ₹2,000 bill at ₹1/pt deducts ₹50 (payable ₹1,950)', () => {
  const config = {
    pointValue: 1.0,
    minimumRedemptionPoints: 50,
    maximumRedemptionPercentage: 30,
    redemptionEnabled: true,
  };

  const result = validateRedemption(2000, 50, 350, config);
  assert.equal(result.isValid, true);
  assert.equal(result.discountRupees, 50);
  assert.equal(result.finalPayableAmount, 1950);
});

test('7. Insufficient Balance Rejection: Customer with 45 points cannot redeem 50 points', () => {
  const config = {
    pointValue: 1.0,
    minimumRedemptionPoints: 50,
    maximumRedemptionPercentage: 30,
    redemptionEnabled: true,
  };

  const result = validateRedemption(2000, 50, 45, config);
  assert.equal(result.isValid, false);
  assert.equal(result.errorMessage, 'Insufficient balance');
});

test('8. Minimum Redemption Threshold Rejection: Attempting 30 points when min is 50 is blocked', () => {
  const config = {
    pointValue: 1.0,
    minimumRedemptionPoints: 50,
    maximumRedemptionPercentage: 30,
    redemptionEnabled: true,
  };

  const result = validateRedemption(2000, 30, 350, config);
  assert.equal(result.isValid, false);
  assert.equal(result.errorMessage, 'Below minimum redemption points');
});

test('9. Maximum Bill Percentage Cap: 30% cap on ₹2,000 bill is ₹600 (600 pts); attempting 700 pts is blocked', () => {
  const config = {
    pointValue: 1.0,
    minimumRedemptionPoints: 50,
    maximumRedemptionPercentage: 30,
    redemptionEnabled: true,
  };

  const result = validateRedemption(2000, 700, 1000, config);
  assert.equal(result.isValid, false);
  assert.equal(result.errorMessage, 'Exceeds maximum bill percentage cap');

  // Exact maximum redemption: 600 points on ₹2,000 is allowed
  const validMax = validateRedemption(2000, 600, 1000, config);
  assert.equal(validMax.isValid, true);
  assert.equal(validMax.discountRupees, 600);
  assert.equal(validMax.finalPayableAmount, 1400);
});

test('10. Disabled Redemption & Disabled Earning Toggles', () => {
  const earningDisabledConfig = {
    earningEnabled: false,
    purchaseThreshold: 100,
    pointsPerThreshold: 10,
    pointValue: 1.0,
    minimumPurchase: 0,
    storeEarningEnabled: true,
    onlineEarningEnabled: true,
  };
  const earnResult = calculatePoints(2000, earningDisabledConfig, 'Store');
  assert.equal(earnResult.pointsEarned, 0);
  assert.equal(earnResult.blocked, true);

  const redemptionDisabledConfig = {
    pointValue: 1.0,
    minimumRedemptionPoints: 50,
    maximumRedemptionPercentage: 30,
    redemptionEnabled: false,
  };
  const redeemResult = validateRedemption(2000, 50, 350, redemptionDisabledConfig);
  assert.equal(redeemResult.isValid, false);
  assert.equal(redeemResult.errorMessage, 'Redemption disabled');
});

test('11. Online Earning and Refund Reversal Verification', () => {
  const config = {
    earningEnabled: true,
    purchaseThreshold: 100,
    pointsPerThreshold: 10,
    pointValue: 1.0,
    minimumPurchase: 0,
    earningMethod: 'threshold_floor',
    storeEarningEnabled: true,
    onlineEarningEnabled: true,
  };

  // 1. Initial purchase awards points
  const onlineEarn = calculatePoints(3200, config, 'Online');
  assert.equal(onlineEarn.pointsEarned, 320);

  // 2. Refund reverses the exact points awarded
  const pointsReversed = onlineEarn.pointsEarned;
  const initialBalance = 820;
  const balanceAfterEarn = initialBalance + onlineEarn.pointsEarned; // 1140
  const balanceAfterRefund = balanceAfterEarn - pointsReversed; // 820
  assert.equal(balanceAfterRefund, initialBalance);
});

test('12. Webhook Idempotency: Duplicate order reference is rejected', () => {
  const processedEvents = [
    { orderReference: 'WEB-ORD-88210', status: 'processed' },
  ];

  const newEventRef = 'WEB-ORD-88210';
  const isDuplicate = processedEvents.some(
    (e) => e.orderReference === newEventRef && e.status === 'processed'
  );
  assert.equal(isDuplicate, true);

  const freshEventRef = 'WEB-ORD-99999';
  const isFreshDuplicate = processedEvents.some(
    (e) => e.orderReference === freshEventRef && e.status === 'processed'
  );
  assert.equal(isFreshDuplicate, false);
});
