export interface LoyaltyConfig {
  earningEnabled: boolean;
  purchaseThreshold: number; // e.g. ₹100
  pointsPerThreshold: number; // e.g. 10 points
  pointValue: number; // ₹ monetary value of 1 point (e.g. ₹1.0)
  minimumPurchase: number; // e.g. ₹0
  earningMethod: 'threshold_floor' | 'proportional';
  minimumRedemptionPoints: number; // e.g. 50 points
  maximumRedemptionPercentage: number; // e.g. 30% of eligible bill
  redemptionEnabled: boolean;
  partialRedemptionAllowed: boolean;
  expiryEnabled: boolean;
  expiryMonths: number; // e.g. 12 months
  earnOnDiscountedPurchases: boolean;
  earnOnRedeemedAmount: boolean; // if false, points earned on gross bill before redemption
  onlineEarningEnabled: boolean;
  storeEarningEnabled: boolean;
  updatedAt: string;
}

export type CustomerTier = 'Classic' | 'Silver' | 'Gold' | 'Platinum';

export interface Customer {
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
  createdAt: string;
  currentPointsBalance: number;
  tier: CustomerTier;
  status: 'active' | 'inactive';
  city?: string;
  lifetimePointsEarned: number;
  lifetimePointsRedeemed: number;
}

export type TransactionType = 'earn' | 'redeem' | 'adjust' | 'refund' | 'expire';
export type TransactionSource = 'Store' | 'Online' | 'Admin';

export interface RuleSnapshot {
  purchaseThreshold: number;
  pointsPerThreshold: number;
  pointValue: number;
  maximumRedemptionPercentage: number;
  earnOnRedeemedAmount: boolean;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  type: TransactionType;
  source: TransactionSource;
  saleId?: string;
  purchaseAmount?: number;
  pointsDelta: number; // + for earn/adjust(+), - for redeem/refund/expire
  pointValueSnapshot: number; // monetary value per point at execution
  monetaryValue: number; // ₹ equivalent of pointsDelta
  balanceAfter: number;
  earningRuleSnapshot: RuleSnapshot;
  reference: string;
  createdAt: string;
  expiryAt?: string; // Rolling expiry timestamp for earned points
  status: 'completed' | 'reversed';
  notes?: string;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Razorpay';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface SaleOrder {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  channel: 'Store' | 'Online';
  subtotal: number;
  discount: number;
  payableAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  pointsRedeemed: number;
  pointsEarned: number;
  createdAt: string;
  status: 'completed' | 'refunded' | 'cancelled';
}

export interface PaymentRecord {
  id: string;
  saleId: string;
  provider: 'Cashier_Manual' | 'Razorpay' | 'UPI_QR' | 'Card_POS';
  method: PaymentMethod;
  providerReference: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface ShopifyWebhookEvent {
  id: string;
  topic: 'orders/paid' | 'orders/cancelled' | 'refunds/create';
  orderReference: string;
  customerId: string;
  customerMobile: string;
  amount: number;
  pointsAwarded?: number;
  pointsReversed?: number;
  paymentStatus: PaymentStatus;
  processedAt: string;
  status: 'processed' | 'rejected_duplicate' | 'failed';
  rawPayload?: Record<string, unknown>;
}

export interface PurchaseCalculationResult {
  purchaseAmount: number;
  eligiblePurchaseAmount: number;
  pointsEarned: number;
  monetaryRewardValue: number;
  remainingTowardsNextThreshold: number;
  ruleUsed: {
    purchaseThreshold: number;
    pointsPerThreshold: number;
    pointValue: number;
  };
  earningBlockedReason?: string;
}

export interface RedemptionValidationResult {
  isValid: boolean;
  pointsToRedeem: number;
  discountRupees: number;
  finalPayableAmount: number;
  errorMessage?: string;
  maxAllowedPoints: number;
  maxAllowedDiscount: number;
}
