import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  LoyaltyConfig,
  Customer,
  LoyaltyTransaction,
  SaleOrder,
  ShopifyWebhookEvent,
  PurchaseCalculationResult,
  RedemptionValidationResult,
  RuleSnapshot,
  TransactionSource,
  PaymentMethod,
  PaymentStatus,
} from '../types/loyalty';
import {
  DEFAULT_LOYALTY_CONFIG,
  SEED_CUSTOMERS,
  SEED_TRANSACTIONS,
  SEED_SALES,
  SEED_WEBHOOK_EVENTS,
} from '../data/seedData';
import {
  calculatePoints as engineCalculatePoints,
  validateRedemption as engineValidateRedemption,
  calculateExpiryDate,
} from '../domain/loyaltyEngine';

const CONFIG_STORAGE_KEY = 'trove_loyalty_config_v2';
const CUSTOMERS_STORAGE_KEY = 'trove_loyalty_customers_v2';
const TRANSACTIONS_STORAGE_KEY = 'trove_loyalty_transactions_v2';
const SALES_STORAGE_KEY = 'trove_loyalty_sales_v2';
const WEBHOOKS_STORAGE_KEY = 'trove_loyalty_webhooks_v2';

export type PortalView = 'admin' | 'store' | 'online' | 'wallet';
export type AdminTab = 'overview' | 'rules' | 'customers' | 'transactions' | 'integrations' | 'settings';

interface LoyaltyContextType {
  // Navigation & View
  currentPortal: PortalView;
  setCurrentPortal: (portal: PortalView) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  selectedCustomerIdForWallet: string;
  setSelectedCustomerIdForWallet: (id: string) => void;

  // Data & State
  config: LoyaltyConfig;
  customers: Customer[];
  transactions: LoyaltyTransaction[];
  sales: SaleOrder[];
  webhookEvents: ShopifyWebhookEvent[];

  // Calculation Engines (Dynamic)
  calculatePoints: (purchaseAmount: number, source?: TransactionSource) => PurchaseCalculationResult;
  validateRedemption: (
    billAmount: number,
    pointsToRedeem: number,
    customerAvailablePoints: number
  ) => RedemptionValidationResult;

  // Actions - Configuration
  updateConfig: (newConfig: Partial<LoyaltyConfig>) => void;
  resetConfigToDefaults: () => void;

  // Actions - Physical Store / Cashier
  processStoreTransaction: (params: {
    customerId: string;
    purchaseAmount: number;
    pointsToRedeem: number;
    paymentMethod: PaymentMethod;
    paymentSimulateStatus?: 'completed' | 'failed';
    billReference?: string;
    notes?: string;
  }) => {
    success: boolean;
    sale?: SaleOrder;
    earningTxn?: LoyaltyTransaction;
    redemptionTxn?: LoyaltyTransaction;
    error?: string;
  };

  // Actions - Online Shopify + Razorpay Simulator
  simulateShopifyOrderPaid: (params: {
    customerId: string;
    orderReference: string;
    amount: number;
    paymentStatus: PaymentStatus;
    paymentGateway?: string;
  }) => {
    success: boolean;
    pointsAwarded?: number;
    txn?: LoyaltyTransaction;
    error?: string;
  };

  simulateShopifyRefund: (params: {
    orderReference: string;
    reason?: string;
  }) => {
    success: boolean;
    pointsReversed?: number;
    txn?: LoyaltyTransaction;
    error?: string;
  };

  // Customer Management
  addCustomer: (
    newCustomer: Omit<
      Customer,
      'id' | 'createdAt' | 'currentPointsBalance' | 'lifetimePointsEarned' | 'lifetimePointsRedeemed'
    >
  ) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  adjustCustomerPoints: (customerId: string, pointsDelta: number, reason: string) => boolean;

  // Persistence & Reset
  resetDemoData: () => void;

  // Notification Toasts
  notifications: Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissNotification: (id: string) => void;

  // Aggregate Metrics
  metrics: {
    totalMembers: number;
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    outstandingPoints: number;
    estimatedOutstandingRupeeValue: number;
    activeMembersCount: number;
    storeSalesCount: number;
    onlineSalesCount: number;
  };
}

export const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Portal navigation state
  const [currentPortal, setCurrentPortal] = useState<PortalView>('admin');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [selectedCustomerIdForWallet, setSelectedCustomerIdForWallet] = useState<string>('CUST-001');

  // Notifications
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Configuration state with localStorage
  const [config, setConfig] = useState<LoyaltyConfig>(() => {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse config from storage', e);
    }
    return DEFAULT_LOYALTY_CONFIG;
  });

  // Customers state with localStorage
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const stored = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse customers from storage', e);
    }
    return SEED_CUSTOMERS;
  });

  // Transactions state with localStorage
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse transactions from storage', e);
    }
    return SEED_TRANSACTIONS;
  });

  // Sales state with localStorage
  const [sales, setSales] = useState<SaleOrder[]>(() => {
    try {
      const stored = localStorage.getItem(SALES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse sales from storage', e);
    }
    return SEED_SALES;
  });

  // Webhook events state with localStorage
  const [webhookEvents, setWebhookEvents] = useState<ShopifyWebhookEvent[]>(() => {
    try {
      const stored = localStorage.getItem(WEBHOOKS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse webhooks from storage', e);
    }
    return SEED_WEBHOOK_EVENTS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to sync config', e);
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to sync customers', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to sync transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
    } catch (e) {
      console.error('Failed to sync sales', e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem(WEBHOOKS_STORAGE_KEY, JSON.stringify(webhookEvents));
    } catch (e) {
      console.error('Failed to sync webhooks', e);
    }
  }, [webhookEvents]);

  // Derived aggregate metrics
  const metrics = useMemo(() => {
    const totalMembers = customers.length;
    const activeMembersCount = customers.filter((c) => c.status === 'active').length;

    let totalPointsIssued = 0;
    let totalPointsRedeemed = 0;

    for (const t of transactions) {
      if (t.status !== 'completed') continue;
      if (t.type === 'earn') {
        totalPointsIssued += t.pointsDelta;
      } else if (t.type === 'redeem') {
        totalPointsRedeemed += Math.abs(t.pointsDelta);
      } else if (t.type === 'refund') {
        totalPointsIssued -= Math.abs(t.pointsDelta);
      } else if (t.type === 'adjust') {
        if (t.pointsDelta > 0) totalPointsIssued += t.pointsDelta;
        else totalPointsRedeemed += Math.abs(t.pointsDelta);
      }
    }

    const outstandingPoints = customers.reduce((sum, c) => sum + c.currentPointsBalance, 0);
    const estimatedOutstandingRupeeValue = outstandingPoints * (config.pointValue || 1.0);

    const storeSalesCount = sales.filter((s) => s.channel === 'Store' && s.paymentStatus === 'completed').length;
    const onlineSalesCount = sales.filter((s) => s.channel === 'Online' && s.paymentStatus === 'completed').length;

    return {
      totalMembers,
      totalPointsIssued,
      totalPointsRedeemed,
      outstandingPoints,
      estimatedOutstandingRupeeValue,
      activeMembersCount,
      storeSalesCount,
      onlineSalesCount,
    };
  }, [customers, transactions, sales, config.pointValue]);

  // Rule Snapshot Helper
  const currentSnapshot = useMemo<RuleSnapshot>(() => ({
    purchaseThreshold: config.purchaseThreshold,
    pointsPerThreshold: config.pointsPerThreshold,
    pointValue: config.pointValue,
    maximumRedemptionPercentage: config.maximumRedemptionPercentage,
    earnOnRedeemedAmount: config.earnOnRedeemedAmount,
  }), [config]);

  // Dynamic calculations utilizing domain engine
  const calculatePoints = useCallback(
    (purchaseAmount: number, source: TransactionSource = 'Store') => {
      return engineCalculatePoints(purchaseAmount, config, source);
    },
    [config]
  );

  const validateRedemption = useCallback(
    (billAmount: number, pointsToRedeem: number, customerAvailablePoints: number) => {
      return engineValidateRedemption(billAmount, pointsToRedeem, customerAvailablePoints, config);
    },
    [config]
  );

  // Update Config
  const updateConfig = useCallback((newConfig: Partial<LoyaltyConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...newConfig,
      updatedAt: new Date().toISOString(),
    }));
    showNotification('Loyalty configuration updated and active for all new transactions.', 'success');
  }, [showNotification]);

  // Reset Config
  const resetConfigToDefaults = useCallback(() => {
    setConfig(DEFAULT_LOYALTY_CONFIG);
    showNotification('Loyalty configuration reset to defaults.', 'info');
  }, [showNotification]);

  // Process Store Transaction (Cashier)
  const processStoreTransaction = useCallback(
    ({
      customerId,
      purchaseAmount,
      pointsToRedeem,
      paymentMethod,
      paymentSimulateStatus = 'completed',
      billReference,
      notes,
    }: {
      customerId: string;
      purchaseAmount: number;
      pointsToRedeem: number;
      paymentMethod: PaymentMethod;
      paymentSimulateStatus?: 'completed' | 'failed';
      billReference?: string;
      notes?: string;
    }) => {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) {
        return { success: false, error: 'Customer not found' };
      }

      // Check payment status simulation: if payment failed, abort!
      if (paymentSimulateStatus === 'failed') {
        showNotification(`Payment failed via ${paymentMethod}. Transaction cancelled. No points awarded or debited.`, 'error');
        return {
          success: false,
          error: `Payment declined or cancelled by ${paymentMethod} gateway.`,
        };
      }

      // Validate redemption
      const redemptionValidation = validateRedemption(
        purchaseAmount,
        pointsToRedeem,
        customer.currentPointsBalance
      );

      if (pointsToRedeem > 0 && !redemptionValidation.isValid) {
        return { success: false, error: redemptionValidation.errorMessage };
      }

      // Calculate earning base (gross bill by default unless earnOnRedeemedAmount is true)
      const earningBaseAmount = config.earnOnRedeemedAmount
        ? redemptionValidation.finalPayableAmount
        : purchaseAmount;

      const earningCalc = calculatePoints(earningBaseAmount, 'Store');

      const now = new Date().toISOString();
      const generatedRef = billReference?.trim() || `POS-MUM-${Math.floor(Math.random() * 8999 + 1000)}`;
      const saleId = `SALE-${Date.now().toString().slice(-6)}`;
      const newTransactions: LoyaltyTransaction[] = [];
      let runningBalance = customer.currentPointsBalance;
      let totalEarnedDelta = 0;
      let totalRedeemedDelta = 0;

      let redemptionTxn: LoyaltyTransaction | undefined;
      let earningTxn: LoyaltyTransaction | undefined;

      // 1. If points redeemed, deduct from ledger
      if (pointsToRedeem > 0 && redemptionValidation.isValid) {
        runningBalance -= pointsToRedeem;
        totalRedeemedDelta += pointsToRedeem;
        redemptionTxn = {
          id: `TXN-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
          customerId: customer.id,
          customerName: customer.name,
          customerMobile: customer.mobileNumber,
          type: 'redeem',
          source: 'Store',
          saleId,
          purchaseAmount,
          pointsDelta: -pointsToRedeem,
          pointValueSnapshot: config.pointValue,
          monetaryValue: redemptionValidation.discountRupees,
          balanceAfter: runningBalance,
          earningRuleSnapshot: currentSnapshot,
          reference: `${generatedRef}-R`,
          createdAt: now,
          status: 'completed',
          notes: notes || `Redeemed ${pointsToRedeem} points (₹${redemptionValidation.discountRupees.toFixed(2)} discount)`,
        };
        newTransactions.push(redemptionTxn);
      }

      // 2. If points earned, credit to ledger with rolling expiry
      if (earningCalc.pointsEarned > 0) {
        runningBalance += earningCalc.pointsEarned;
        totalEarnedDelta += earningCalc.pointsEarned;
        earningTxn = {
          id: `TXN-${Date.now() + 1}-${Math.floor(Math.random() * 900 + 100)}`,
          customerId: customer.id,
          customerName: customer.name,
          customerMobile: customer.mobileNumber,
          type: 'earn',
          source: 'Store',
          saleId,
          purchaseAmount: earningBaseAmount,
          pointsDelta: earningCalc.pointsEarned,
          pointValueSnapshot: config.pointValue,
          monetaryValue: earningCalc.monetaryRewardValue,
          balanceAfter: runningBalance,
          earningRuleSnapshot: currentSnapshot,
          reference: `${generatedRef}-E`,
          createdAt: new Date(Date.now() + 50).toISOString(),
          expiryAt: config.expiryEnabled ? calculateExpiryDate(now, config.expiryMonths) : undefined,
          status: 'completed',
          notes: notes || `Earned points on in-store purchase (${paymentMethod})`,
        };
        newTransactions.push(earningTxn);
      }

      // Create Sale Order Record
      const newSale: SaleOrder = {
        id: saleId,
        reference: generatedRef,
        customerId: customer.id,
        customerName: customer.name,
        channel: 'Store',
        subtotal: purchaseAmount,
        discount: redemptionValidation.discountRupees,
        payableAmount: redemptionValidation.finalPayableAmount,
        paymentMethod,
        paymentStatus: 'completed',
        pointsRedeemed: pointsToRedeem,
        pointsEarned: earningCalc.pointsEarned,
        createdAt: now,
        status: 'completed',
      };

      // Update customer record
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === customer.id) {
            return {
              ...c,
              currentPointsBalance: runningBalance,
              lifetimePointsEarned: c.lifetimePointsEarned + totalEarnedDelta,
              lifetimePointsRedeemed: c.lifetimePointsRedeemed + totalRedeemedDelta,
            };
          }
          return c;
        })
      );

      // Prepend transactions and sales
      setTransactions((prev) => [...newTransactions, ...prev]);
      setSales((prev) => [newSale, ...prev]);

      showNotification(
        `Sale ${generatedRef} confirmed! ${pointsToRedeem > 0 ? `Redeemed ${pointsToRedeem} pts. ` : ''}${earningCalc.pointsEarned > 0 ? `Earned ${earningCalc.pointsEarned} pts. ` : ''}Paid via ${paymentMethod}.`,
        'success'
      );

      return {
        success: true,
        sale: newSale,
        earningTxn,
        redemptionTxn,
      };
    },
    [customers, config, currentSnapshot, calculatePoints, validateRedemption, showNotification]
  );

  // Simulate Shopify Order Paid Event (Online Storefront Integration)
  const simulateShopifyOrderPaid = useCallback(
    ({
      customerId,
      orderReference,
      amount,
      paymentStatus,
      paymentGateway = 'Razorpay (Online UPI/Cards)',
    }: {
      customerId: string;
      orderReference: string;
      amount: number;
      paymentStatus: PaymentStatus;
      paymentGateway?: string;
    }) => {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) {
        return { success: false, error: 'Customer not found' };
      }

      // IDEMPOTENCY GUARD: Check if orderReference was already successfully processed
      const isDuplicate = webhookEvents.some(
        (e) => e.orderReference === orderReference && e.status === 'processed'
      );

      if (isDuplicate) {
        const rejectedEvent: ShopifyWebhookEvent = {
          id: `EVT-${Date.now()}`,
          topic: 'orders/paid',
          orderReference,
          customerId,
          customerMobile: customer.mobileNumber,
          amount,
          paymentStatus,
          processedAt: new Date().toISOString(),
          status: 'rejected_duplicate',
          rawPayload: { error: 'Idempotency key match: order already processed' },
        };
        setWebhookEvents((prev) => [rejectedEvent, ...prev]);
        showNotification(`Shopify Webhook Ignored: Order "${orderReference}" already processed (Duplicate Event Rejected).`, 'info');
        return { success: false, error: 'Duplicate webhook event rejected by idempotency filter.' };
      }

      // SAFEGUARD: Never award points for an unconfirmed payment
      if (paymentStatus !== 'completed') {
        const unconfirmedEvent: ShopifyWebhookEvent = {
          id: `EVT-${Date.now()}`,
          topic: 'orders/paid',
          orderReference,
          customerId,
          customerMobile: customer.mobileNumber,
          amount,
          paymentStatus,
          processedAt: new Date().toISOString(),
          status: 'failed',
          rawPayload: { error: 'Payment status is unconfirmed or failed' },
        };
        setWebhookEvents((prev) => [unconfirmedEvent, ...prev]);
        showNotification(`Online Payment Unconfirmed (${paymentStatus}). No loyalty points awarded.`, 'error');
        return { success: false, error: 'Unconfirmed payment: No loyalty points awarded.' };
      }

      // Calculate online points based on active rules
      const earningCalc = calculatePoints(amount, 'Online');
      const now = new Date().toISOString();
      const saleId = `SALE-WEB-${Date.now().toString().slice(-6)}`;

      let earningTxn: LoyaltyTransaction | undefined;

      if (earningCalc.pointsEarned > 0) {
        const newBalance = customer.currentPointsBalance + earningCalc.pointsEarned;
        earningTxn = {
          id: `TXN-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
          customerId: customer.id,
          customerName: customer.name,
          customerMobile: customer.mobileNumber,
          type: 'earn',
          source: 'Online',
          saleId,
          purchaseAmount: amount,
          pointsDelta: earningCalc.pointsEarned,
          pointValueSnapshot: config.pointValue,
          monetaryValue: earningCalc.monetaryRewardValue,
          balanceAfter: newBalance,
          earningRuleSnapshot: currentSnapshot,
          reference: orderReference,
          createdAt: now,
          expiryAt: config.expiryEnabled ? calculateExpiryDate(now, config.expiryMonths) : undefined,
          status: 'completed',
          notes: `Shopify storefront order ${orderReference} via ${paymentGateway}`,
        };

        // Update customer balance
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customer.id
              ? {
                  ...c,
                  currentPointsBalance: newBalance,
                  lifetimePointsEarned: c.lifetimePointsEarned + earningCalc.pointsEarned,
                }
              : c
          )
        );

        setTransactions((prev) => [earningTxn!, ...prev]);
      }

      // Create online sale order
      const newSale: SaleOrder = {
        id: saleId,
        reference: orderReference,
        customerId: customer.id,
        customerName: customer.name,
        channel: 'Online',
        subtotal: amount,
        discount: 0,
        payableAmount: amount,
        paymentMethod: 'Razorpay',
        paymentStatus: 'completed',
        pointsRedeemed: 0,
        pointsEarned: earningCalc.pointsEarned,
        createdAt: now,
        status: 'completed',
      };
      setSales((prev) => [newSale, ...prev]);

      // Record successful webhook event
      const eventRecord: ShopifyWebhookEvent = {
        id: `EVT-${Date.now()}`,
        topic: 'orders/paid',
        orderReference,
        customerId: customer.id,
        customerMobile: customer.mobileNumber,
        amount,
        pointsAwarded: earningCalc.pointsEarned,
        paymentStatus: 'completed',
        processedAt: now,
        status: 'processed',
        rawPayload: {
          order_id: orderReference,
          total_price: amount.toString(),
          gateway: paymentGateway,
          currency: 'INR',
          financial_status: 'paid',
        },
      };
      setWebhookEvents((prev) => [eventRecord, ...prev]);

      showNotification(
        `Shopify Webhook Processed! Order ${orderReference} confirmed via Razorpay: +${earningCalc.pointsEarned} pts awarded to ${customer.name}.`,
        'success'
      );

      return {
        success: true,
        pointsAwarded: earningCalc.pointsEarned,
        txn: earningTxn,
      };
    },
    [customers, webhookEvents, calculatePoints, config, currentSnapshot, showNotification]
  );

  // Simulate Shopify Online Refund
  const simulateShopifyRefund = useCallback(
    ({ orderReference, reason = 'Customer requested return of online apparel' }: { orderReference: string; reason?: string }) => {
      // Find original earning transaction for this order
      const originalTxn = transactions.find(
        (t) => t.reference === orderReference && t.type === 'earn' && t.status === 'completed'
      );

      if (!originalTxn) {
        showNotification(`No completed points earning record found for order "${orderReference}".`, 'error');
        return { success: false, error: 'Original transaction not found' };
      }

      const customer = customers.find((c) => c.id === originalTxn.customerId);
      if (!customer) {
        return { success: false, error: 'Customer not found' };
      }

      const pointsToReverse = originalTxn.pointsDelta;
      const newBalance = Math.max(0, customer.currentPointsBalance - pointsToReverse);
      const now = new Date().toISOString();

      const refundTxn: LoyaltyTransaction = {
        id: `TXN-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
        customerId: customer.id,
        customerName: customer.name,
        customerMobile: customer.mobileNumber,
        type: 'refund',
        source: 'Online',
        saleId: originalTxn.saleId,
        purchaseAmount: originalTxn.purchaseAmount,
        pointsDelta: -pointsToReverse,
        pointValueSnapshot: originalTxn.pointValueSnapshot,
        monetaryValue: pointsToReverse * originalTxn.pointValueSnapshot,
        balanceAfter: newBalance,
        earningRuleSnapshot: originalTxn.earningRuleSnapshot,
        reference: `${orderReference}-REFUND`,
        createdAt: now,
        status: 'completed',
        notes: `Reversal of points from refunded online order ${orderReference}: ${reason}`,
      };

      // Update customer balance
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id
            ? {
                ...c,
                currentPointsBalance: newBalance,
                lifetimePointsEarned: Math.max(0, c.lifetimePointsEarned - pointsToReverse),
              }
            : c
        )
      );

      // Prepend refund transaction
      setTransactions((prev) => [refundTxn, ...prev]);

      // Record refund webhook event
      const refundEvent: ShopifyWebhookEvent = {
        id: `EVT-${Date.now()}`,
        topic: 'refunds/create',
        orderReference,
        customerId: customer.id,
        customerMobile: customer.mobileNumber,
        amount: originalTxn.purchaseAmount || 0,
        pointsReversed: pointsToReverse,
        paymentStatus: 'refunded',
        processedAt: now,
        status: 'processed',
        rawPayload: {
          refund_order_id: orderReference,
          reversed_points: pointsToReverse,
          reason,
        },
      };
      setWebhookEvents((prev) => [refundEvent, ...prev]);

      showNotification(
        `Shopify Refund Processed: ${pointsToReverse} points reversed from ${customer.name}'s account for order ${orderReference}.`,
        'info'
      );

      return {
        success: true,
        pointsReversed: pointsToReverse,
        txn: refundTxn,
      };
    },
    [transactions, customers, showNotification]
  );

  // Add Customer
  const addCustomer = useCallback(
    (
      newCustomer: Omit<
        Customer,
        'id' | 'createdAt' | 'currentPointsBalance' | 'lifetimePointsEarned' | 'lifetimePointsRedeemed'
      >
    ): Customer => {
      const id = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
      const created: Customer = {
        ...newCustomer,
        id,
        createdAt: new Date().toISOString(),
        currentPointsBalance: 0,
        lifetimePointsEarned: 0,
        lifetimePointsRedeemed: 0,
      };

      setCustomers((prev) => [created, ...prev]);
      showNotification(`Member "${created.name}" registered.`, 'success');
      return created;
    },
    [customers.length, showNotification]
  );

  // Update Customer
  const updateCustomer = useCallback(
    (id: string, updates: Partial<Customer>) => {
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      showNotification('Customer details updated.', 'success');
    },
    [showNotification]
  );

  // Adjust Customer Points
  const adjustCustomerPoints = useCallback(
    (customerId: string, pointsDelta: number, reason: string): boolean => {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) return false;

      const newBalance = customer.currentPointsBalance + pointsDelta;
      if (newBalance < 0) {
        showNotification('Adjustment rejected: balance cannot fall below 0.', 'error');
        return false;
      }

      const now = new Date().toISOString();
      const pointVal = config.pointValue || 1.0;
      const monetaryVal = Math.abs(pointsDelta) * pointVal;

      const adjTxn: LoyaltyTransaction = {
        id: `TXN-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
        customerId: customer.id,
        customerName: customer.name,
        customerMobile: customer.mobileNumber,
        type: 'adjust',
        source: 'Admin',
        pointsDelta,
        pointValueSnapshot: pointVal,
        monetaryValue: monetaryVal,
        balanceAfter: newBalance,
        earningRuleSnapshot: currentSnapshot,
        reference: `ADJ-${Date.now().toString().slice(-5)}`,
        createdAt: now,
        status: 'completed',
        notes: reason || 'Manual points adjustment by administrator',
      };

      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === customer.id) {
            return {
              ...c,
              currentPointsBalance: newBalance,
              lifetimePointsEarned: pointsDelta > 0 ? c.lifetimePointsEarned + pointsDelta : c.lifetimePointsEarned,
              lifetimePointsRedeemed: pointsDelta < 0 ? c.lifetimePointsRedeemed + Math.abs(pointsDelta) : c.lifetimePointsRedeemed,
            };
          }
          return c;
        })
      );

      setTransactions((prev) => [adjTxn, ...prev]);
      showNotification(
        `Points adjusted by ${pointsDelta > 0 ? `+${pointsDelta}` : pointsDelta} pts for ${customer.name}.`,
        'success'
      );
      return true;
    },
    [customers, config.pointValue, currentSnapshot, showNotification]
  );

  // Reset Demo Data
  const resetDemoData = useCallback(() => {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    localStorage.removeItem(CUSTOMERS_STORAGE_KEY);
    localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
    localStorage.removeItem(SALES_STORAGE_KEY);
    localStorage.removeItem(WEBHOOKS_STORAGE_KEY);

    setConfig(DEFAULT_LOYALTY_CONFIG);
    setCustomers(SEED_CUSTOMERS);
    setTransactions(SEED_TRANSACTIONS);
    setSales(SEED_SALES);
    setWebhookEvents(SEED_WEBHOOK_EVENTS);
    setSelectedCustomerIdForWallet('CUST-001');

    showNotification('All demo data restored to pristine initial state.', 'info');
  }, [showNotification]);

  return (
    <LoyaltyContext.Provider
      value={{
        currentPortal,
        setCurrentPortal,
        adminTab,
        setAdminTab,
        selectedCustomerIdForWallet,
        setSelectedCustomerIdForWallet,
        config,
        customers,
        transactions,
        sales,
        webhookEvents,
        calculatePoints,
        validateRedemption,
        updateConfig,
        resetConfigToDefaults,
        processStoreTransaction,
        simulateShopifyOrderPaid,
        simulateShopifyRefund,
        addCustomer,
        updateCustomer,
        adjustCustomerPoints,
        resetDemoData,
        notifications,
        showNotification,
        dismissNotification,
        metrics,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};
