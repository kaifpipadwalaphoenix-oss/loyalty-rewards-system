import React, { useState, useMemo } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import type { Customer, PaymentMethod, LoyaltyTransaction, SaleOrder } from '../../types/loyalty';
import {
  Store,
  UserX,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Wallet,
  Printer,
  CreditCard,
  QrCode,
  Banknote,
} from 'lucide-react';

export const StoreCashier: React.FC = () => {
  const {
    customers,
    config,
    calculatePoints,
    validateRedemption,
    processStoreTransaction,
    setCurrentPortal,
    setSelectedCustomerIdForWallet,
    addCustomer,
    transactions,
  } = useLoyalty();

  // Search & Selected Customer
  const [mobileQuery, setMobileQuery] = useState('9820123456'); // Pre-fill with Aarav Sharma for quick demo start
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(() => {
    return customers.find((c) => c.mobileNumber === '9820123456') || customers[0] || null;
  });

  // Purchase Details
  const STORE_LOCATIONS = useMemo(() => [
    { id: 'MUM', name: 'Mumbai Flagship (Colaba)' },
    { id: 'DEL', name: 'Delhi Select (Khan Market)' },
    { id: 'BLR', name: 'Bengaluru Concept (Indiranagar)' },
    { id: 'HYD', name: 'Hyderabad Boutique (Banjara Hills)' },
  ], []);

  const [selectedStore, setSelectedStore] = useState(STORE_LOCATIONS[0]);
  const [purchaseAmount, setPurchaseAmount] = useState<number>(2000); // Pre-fill ₹2,000 per standard scenario
  const [billReference, setBillReference] = useState<string>(() => `POS-MUM-${Math.floor(Math.random() * 8999 + 1000)}`);
  const storeLocation = selectedStore.name;

  // Redemption Details
  const [isRedeeming, setIsRedeeming] = useState<boolean>(true);
  const [pointsToRedeemInput, setPointsToRedeemInput] = useState<number>(50); // Pre-fill 50 points

  // Payment Method & Simulation
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentSimulateStatus, setPaymentSimulateStatus] = useState<'completed' | 'failed'>('completed');

  // Processing state & completed receipt
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<{
    customer: Customer;
    sale: SaleOrder;
    originalBill: number;
    pointsRedeemed: number;
    discountRupees: number;
    finalPayable: number;
    pointsEarned: number;
    newBalance: number;
    paymentMethod: PaymentMethod;
    earningTxn?: LoyaltyTransaction;
    redemptionTxn?: LoyaltyTransaction;
    timestamp: string;
  } | null>(null);

  // Quick Register Modal state if customer not found
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerName, setRegisterName] = useState('');

  // Handle Search
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = mobileQuery.replace(/\D/g, '');
    const found = customers.find(
      (c) =>
        c.mobileNumber === clean ||
        c.mobileNumber.endsWith(clean) ||
        c.id.toLowerCase() === mobileQuery.toLowerCase()
    );
    setActiveCustomer(found || null);
    if (!found) {
      setCompletedReceipt(null);
    }
  };

  const handleSelectQuickCustomer = (customer: Customer) => {
    setActiveCustomer(customer);
    setMobileQuery(customer.mobileNumber);
    setCompletedReceipt(null);
  };

  // Live Calculations
  const currentCustomerBalance = activeCustomer?.currentPointsBalance ?? 0;

  // 1. Redemption Validation
  const effectivePointsToRedeem = isRedeeming ? Number(pointsToRedeemInput) || 0 : 0;
  const redemptionResult = useMemo(() => {
    return validateRedemption(purchaseAmount, effectivePointsToRedeem, currentCustomerBalance);
  }, [validateRedemption, purchaseAmount, effectivePointsToRedeem, currentCustomerBalance]);

  // 2. Points Earning Calculation
  // Points earned on gross bill unless configured otherwise
  const earningBase = config.earnOnRedeemedAmount
    ? redemptionResult.finalPayableAmount
    : purchaseAmount;

  const earningResult = useMemo(() => {
    return calculatePoints(earningBase, 'Store');
  }, [calculatePoints, earningBase]);

  // Final Estimated Balance after transaction
  const estimatedNewBalance =
    currentCustomerBalance -
    (redemptionResult.isValid ? effectivePointsToRedeem : 0) +
    earningResult.pointsEarned;

  // Handle Transaction Confirmation
  const handleConfirmTransaction = () => {
    if (!activeCustomer) return;
    if (purchaseAmount <= 0) return;
    if (isRedeeming && effectivePointsToRedeem > 0 && !redemptionResult.isValid) return;

    setIsProcessing(true);

    try {
      const res = processStoreTransaction({
        customerId: activeCustomer.id,
        purchaseAmount,
        pointsToRedeem: isRedeeming ? effectivePointsToRedeem : 0,
        paymentMethod,
        paymentSimulateStatus,
        billReference,
        notes: `In-store purchase at ${storeLocation} via ${paymentMethod}`,
      });

      if (res.success && res.sale) {
        const updated = customers.find((c) => c.id === activeCustomer.id) || activeCustomer;

        setCompletedReceipt({
          customer: {
            ...updated,
            currentPointsBalance: estimatedNewBalance,
          },
          sale: res.sale,
          originalBill: purchaseAmount,
          pointsRedeemed: isRedeeming ? effectivePointsToRedeem : 0,
          discountRupees: redemptionResult.discountRupees,
          finalPayable: redemptionResult.finalPayableAmount,
          pointsEarned: earningResult.pointsEarned,
          newBalance: estimatedNewBalance,
          paymentMethod,
          earningTxn: res.earningTxn,
          redemptionTxn: res.redemptionTxn,
          timestamp: new Date().toISOString(),
        });

        setActiveCustomer({
          ...updated,
          currentPointsBalance: estimatedNewBalance,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartNextTransaction = () => {
    setCompletedReceipt(null);
    setBillReference(`POS-${selectedStore.id}-${Math.floor(Math.random() * 8999 + 1000)}`);
    setPurchaseAmount(2000);
    setPointsToRedeemInput(0);
    setIsRedeeming(false);
    setPaymentSimulateStatus('completed');
  };

  const handleQuickRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim() || !mobileQuery.trim()) return;

    const clean = mobileQuery.replace(/\D/g, '');
    const newCust = addCustomer({
      name: registerName.trim(),
      mobileNumber: clean,
      email: `${registerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      tier: 'Classic',
      city: 'Mumbai',
      status: 'active',
    });

    setActiveCustomer(newCust);
    setShowRegisterModal(false);
    setRegisterName('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Cashier Terminal Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Store className="w-3.5 h-3.5 text-emerald-700" />
              <span>Store POS Terminal</span>
            </div>
            <select
              value={selectedStore.id}
              onChange={(e) => {
                const found = STORE_LOCATIONS.find((s) => s.id === e.target.value) || STORE_LOCATIONS[0];
                setSelectedStore(found);
                setBillReference(`POS-${found.id}-${Math.floor(Math.random() * 8999 + 1000)}`);
              }}
              className="px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-full text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {STORE_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Cashier Checkout & Loyalty Redemption
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customer lookup, live point calculation, payment collection, and instant receipt issuance.
          </p>
        </div>

        {/* Active Rule Pill */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right shrink-0">
          <div className="text-[10px] uppercase font-bold text-slate-400">
            Active Store Loyalty Rule
          </div>
          <div className="text-xs font-bold text-slate-900 mt-0.5">
            Every ₹{config.purchaseThreshold} = {config.pointsPerThreshold} pts (1 pt = ₹{config.pointValue})
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            Max Redemption Cap: {config.maximumRedemptionPercentage}% of bill
          </div>
        </div>
      </div>

      {/* COMPLETED TRANSACTION RECEIPT SCREEN */}
      {completedReceipt ? (
        <div className="max-w-xl mx-auto space-y-6">
          <div
            id="printable-receipt"
            className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-300 shadow-md text-xs space-y-5"
          >
            {/* Receipt Header */}
            <div className="text-center pb-5 border-b border-dashed border-slate-300">
              <div className="font-serif text-lg font-bold tracking-wider text-slate-900">
                TROVE LABEL
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{storeLocation}</div>
              <div className="text-[11px] font-mono text-slate-600 mt-1">
                Receipt: {completedReceipt.sale.reference} &bull; {new Date(completedReceipt.timestamp).toLocaleString()}
              </div>
            </div>

            {/* Customer Details */}
            <div className="py-2 border-b border-dashed border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{completedReceipt.customer.name}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-500">Phone:</span>
                <span>+91 {completedReceipt.customer.mobileNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tier:</span>
                <span className="font-semibold">{completedReceipt.customer.tier} Member</span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2 py-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between text-slate-600">
                <span>Gross Purchase Amount:</span>
                <span className="font-semibold text-slate-900">
                  ₹{completedReceipt.originalBill.toFixed(2)}
                </span>
              </div>

              {completedReceipt.pointsRedeemed > 0 && (
                <div className="flex justify-between text-amber-800 font-semibold">
                  <span>
                    Loyalty Reward Discount ({completedReceipt.pointsRedeemed} pts):
                  </span>
                  <span>-₹{completedReceipt.discountRupees.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Net Amount Paid:</span>
                <span className="text-base text-emerald-800 tabular-nums">
                  ₹{completedReceipt.finalPayable.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Payment Method:</span>
                <span className="font-semibold text-slate-700">{completedReceipt.paymentMethod} (Confirmed)</span>
              </div>
            </div>

            {/* Loyalty Movement Summary */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-xs">
                Loyalty Account Movement
              </div>

              {completedReceipt.pointsRedeemed > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Points Redeemed:</span>
                  <span className="font-bold">-{completedReceipt.pointsRedeemed} pts</span>
                </div>
              )}

              {completedReceipt.pointsEarned > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Points Earned on Bill:</span>
                  <span className="font-bold">+{completedReceipt.pointsEarned} pts</span>
                </div>
              )}

              <div className="flex justify-between pt-1.5 border-t border-slate-200 font-bold text-slate-900">
                <span>Updated Available Balance:</span>
                <span className="text-emerald-800 font-extrabold">
                  {completedReceipt.newBalance} pts (₹{(completedReceipt.newBalance * config.pointValue).toFixed(2)})
                </span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-2">
              Thank you for shopping at Trove Label. Points valid for {config.expiryMonths} months.
            </div>
          </div>

          {/* Action Buttons (Excluded from print) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>

            <button
              type="button"
              onClick={handleStartNextTransaction}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Next Transaction</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCustomerIdForWallet(completedReceipt.customer.id);
                setCurrentPortal('wallet');
              }}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>View Customer Wallet</span>
            </button>
          </div>
        </div>
      ) : (
        /* MAIN CASHIER INTERACTION WORKFLOW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
          {/* Left Column: Customer Identification (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step 1: Customer Lookup */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-sm font-bold text-slate-900">
                    Customer Lookup
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400">Mobile ID</span>
              </div>

              <form onSubmit={handleSearch} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Mobile Number (10 digits)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-xs">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={mobileQuery}
                      onChange={(e) => setMobileQuery(e.target.value)}
                      placeholder="9820123456"
                      className="w-full pl-11 pr-3 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Quick Preset Member Selector */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">
                  Quick Member Presets:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {customers.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectQuickCustomer(c)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        activeCustomer?.id === c.id
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {c.name.split(' ')[0]} ({c.currentPointsBalance} pts)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Identification Profile */}
            {activeCustomer ? (
              <div className="bg-white rounded-2xl p-6 border border-emerald-500/30 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Member Verified
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {activeCustomer.tier}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-serif font-bold text-base flex items-center justify-center">
                    {activeCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{activeCustomer.name}</h3>
                    <p className="text-xs font-mono text-slate-500">
                      +91 {activeCustomer.mobileNumber} &bull; {activeCustomer.city || 'India'}
                    </p>
                  </div>
                </div>

                {/* Points Balance Card */}
                <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Available Points
                    </span>
                    <span className="text-2xl font-extrabold text-white tabular-nums">
                      {activeCustomer.currentPointsBalance} pts
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Rupee Value
                    </span>
                    <span className="text-xl font-bold text-emerald-400 tabular-nums">
                      ₹{(activeCustomer.currentPointsBalance * config.pointValue).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Eligibility note */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>Redemption status:</span>
                  {activeCustomer.currentPointsBalance >= config.minimumRedemptionPoints ? (
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Eligible (min {config.minimumRedemptionPoints} pts)
                    </span>
                  ) : (
                    <span className="font-semibold text-amber-700 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Below {config.minimumRedemptionPoints} pts minimum
                    </span>
                  )}
                </div>

                {/* Omnichannel Activity Snippet */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
                    <span>Recent Member Activity:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomerIdForWallet(activeCustomer.id);
                        setCurrentPortal('wallet');
                      }}
                      className="text-emerald-700 hover:underline"
                    >
                      Full Wallet &rarr;
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {transactions
                      .filter((t) => t.customerId === activeCustomer.id)
                      .slice(0, 2)
                      .map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between text-[11px] py-1 px-2.5 rounded-lg bg-slate-50 border border-slate-100"
                        >
                          <span className="text-slate-600 truncate max-w-[170px]">
                            {t.source}: {t.notes || t.reference}
                          </span>
                          <span
                            className={`font-bold tabular-nums shrink-0 ${
                              t.pointsDelta > 0 ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {t.pointsDelta > 0 ? `+${t.pointsDelta}` : t.pointsDelta} pts
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-dashed border-slate-300 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <UserX className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Member Found</h3>
                <p className="text-xs text-slate-500">
                  No account matching "+91 {mobileQuery}". Register them to earn rewards.
                </p>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Register New Customer
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Purchase, Redemption, Payment, and Confirm (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
              {/* Step 2: Purchase Amount */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h2 className="text-sm font-bold text-slate-900">
                      Purchase Details
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{billReference}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Purchase Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="1"
                        step="50"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(Math.max(0, Number(e.target.value)))}
                        className="w-full pl-8 pr-3 py-2 text-base font-extrabold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Quick Presets
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1000, 2000, 2550, 4500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setPurchaseAmount(amt)}
                          className={`text-xs px-2.5 py-2 rounded-xl font-bold transition-all border ${
                            purchaseAmount === amt
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Points Earned Preview Box */}
                <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">Points to be Earned on this Bill:</span>
                    <span className="text-base font-extrabold text-emerald-700 tabular-nums">
                      +{earningResult.pointsEarned} points
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1.5">
                      (Worth ₹{earningResult.monetaryRewardValue.toFixed(2)})
                    </span>
                  </div>
                  {earningResult.remainingTowardsNextThreshold > 0 && (
                    <div className="text-right text-[11px] text-slate-500">
                      <span>Add ₹{earningResult.remainingTowardsNextThreshold}</span>
                      <span className="text-emerald-700 font-bold block">
                        for +{config.pointsPerThreshold} pts
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Redemption */}
              <div className="pt-5 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h2 className="text-sm font-bold text-slate-900">
                      Redeem Available Points
                    </h2>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-700">
                      {isRedeeming ? 'Apply Points' : 'Do Not Redeem'}
                    </span>
                    <input
                      type="checkbox"
                      checked={isRedeeming}
                      onChange={(e) => setIsRedeeming(e.target.checked)}
                      disabled={!activeCustomer || currentCustomerBalance < config.minimumRedemptionPoints}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>

                {isRedeeming && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            Points to Redeem (1 pt = ₹{config.pointValue})
                          </label>
                          <button
                            type="button"
                            onClick={() => setPointsToRedeemInput(redemptionResult.maxAllowedPoints)}
                            className="text-[11px] text-emerald-700 font-bold hover:underline"
                          >
                            Max ({redemptionResult.maxAllowedPoints} pts)
                          </button>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={pointsToRedeemInput}
                          onChange={(e) => setPointsToRedeemInput(Math.max(0, Number(e.target.value)))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                        />
                        {/* Quick Point Selector Pills */}
                        <div className="flex items-center gap-1.5 mt-2">
                          {[50, 100, 200].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setPointsToRedeemInput(Math.min(preset, redemptionResult.maxAllowedPoints))}
                              className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              {preset} pts
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setPointsToRedeemInput(redemptionResult.maxAllowedPoints)}
                            className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
                          >
                            Max ({redemptionResult.maxAllowedPoints})
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex flex-col justify-center">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                          Instant Bill Discount
                        </span>
                        <span className="text-lg font-extrabold text-amber-950 tabular-nums">
                          -₹{redemptionResult.discountRupees.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-amber-700 mt-0.5">
                          Policy cap: Max {config.maximumRedemptionPercentage}% of bill (₹{redemptionResult.maxAllowedDiscount.toFixed(2)})
                        </span>
                      </div>
                    </div>

                    {!redemptionResult.isValid && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong>Validation Blocked:</strong> {redemptionResult.errorMessage}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 4: Payment Collection */}
              <div className="pt-5 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      4
                    </span>
                    <h2 className="text-sm font-bold text-slate-900">
                      Payment Collection Method
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">Amount Due: ₹{redemptionResult.finalPayableAmount.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'UPI', label: 'UPI / Dynamic QR', icon: QrCode },
                    { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard },
                    { id: 'Cash', label: 'Cash Tendered', icon: Banknote },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          paymentMethod === m.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 ${paymentMethod === m.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <div className="text-xs font-bold">{m.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Simulated Payment Interaction Details */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Simulate Payment Gateway Outcome:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentSimulateStatus('completed')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          paymentSimulateStatus === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Success (Paid)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentSimulateStatus('failed')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          paymentSimulateStatus === 'failed'
                            ? 'bg-rose-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Failure (Declined)
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      Dynamic UPI QR generated for ₹{redemptionResult.finalPayableAmount.toFixed(2)} (VPA: <code className="font-mono">trovelabel@icici</code>).
                    </div>
                  )}
                  {paymentMethod === 'Card' && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      POS Terminal prompt: Waiting for card tap / chip insert for ₹{redemptionResult.finalPayableAmount.toFixed(2)}.
                    </div>
                  )}
                  {paymentMethod === 'Cash' && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      Cash tender: Verify currency notes collected before finalizing.
                    </div>
                  )}
                </div>
              </div>

              {/* Step 5: Final Settlement & Confirm */}
              <div className="pt-5 border-t border-slate-200 space-y-4">
                <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal / Original Bill:</span>
                    <span className="text-white font-semibold">₹{purchaseAmount.toFixed(2)}</span>
                  </div>

                  {isRedeeming && redemptionResult.isValid && effectivePointsToRedeem > 0 && (
                    <div className="flex justify-between text-amber-300 font-semibold">
                      <span>Points Discount ({effectivePointsToRedeem} pts):</span>
                      <span>-₹{redemptionResult.discountRupees.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="font-bold text-slate-200">Payable Balance:</span>
                    <span className="text-2xl font-extrabold text-white tabular-nums">
                      ₹{redemptionResult.finalPayableAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={handleConfirmTransaction}
                  disabled={
                    !activeCustomer ||
                    purchaseAmount <= 0 ||
                    (isRedeeming && effectivePointsToRedeem > 0 && !redemptionResult.isValid) ||
                    isProcessing
                  }
                  className={`w-full py-3.5 px-6 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                    activeCustomer && purchaseAmount > 0 && (!isRedeeming || redemptionResult.isValid) && !isProcessing
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-700/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isProcessing ? 'Processing Transaction...' : 'Complete Sale & Award Loyalty Points'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK REGISTER MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Register In-Store Member</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter customer's name to register their loyalty account under mobile +91 {mobileQuery}.
            </p>

            <form onSubmit={handleQuickRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="e.g. Maya Varma"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Lookup Number</label>
                <input
                  type="text"
                  disabled
                  value={`+91 ${mobileQuery}`}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl font-mono text-slate-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Register & Proceed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
