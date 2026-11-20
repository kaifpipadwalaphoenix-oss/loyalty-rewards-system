import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import type { Customer, LoyaltyTransaction, SaleOrder } from '../../types/loyalty';
import {
  Store,
  UserCheck,
  UserX,
  Coins,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Printer,
  RotateCcw,
  Plus,
  ArrowRight,
  Sparkles,
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
  const [mobileQuery, setMobileQuery] = useState('9820123456'); // Pre-fill Aarav Sharma for quick presentation
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(() => {
    return customers.find((c) => c.mobileNumber === '9820123456') || customers[0] || null;
  });

  // Store Boutique Location
  const [storeLocation, setStoreLocation] = useState('Colaba Flagship Boutique, Mumbai');

  // Purchase Details
  const [purchaseAmount, setPurchaseAmount] = useState<number>(2500);

  // Redemption Details
  const [isRedeeming, setIsRedeeming] = useState<boolean>(true);
  const [pointsToRedeemInput, setPointsToRedeemInput] = useState<number>(100);

  // Completed Receipt State
  const [completedReceipt, setCompletedReceipt] = useState<{
    customer: Customer;
    sale: SaleOrder;
    originalBill: number;
    pointsRedeemed: number;
    discountRupees: number;
    finalPayable: number;
    pointsEarned: number;
    newBalance: number;
    earningTxn?: LoyaltyTransaction;
    redemptionTxn?: LoyaltyTransaction;
    timestamp: string;
  } | null>(null);

  // Quick Register Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustCity, setNewCustCity] = useState('Mumbai');

  // Handle Search
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = mobileQuery.replace(/\D/g, '');
    const found = customers.find(
      (c) =>
        c.mobileNumber === clean ||
        c.mobileNumber.endsWith(clean) ||
        c.name.toLowerCase().includes(mobileQuery.toLowerCase())
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

  // Calculations
  const customerAvailablePoints = activeCustomer?.currentPointsBalance || 0;
  const redemptionPoints = isRedeeming ? Number(pointsToRedeemInput) || 0 : 0;

  const redemptionValidation = validateRedemption(
    purchaseAmount,
    redemptionPoints,
    customerAvailablePoints
  );

  const earningBase = config.earnOnRedeemedAmount
    ? redemptionValidation.finalPayableAmount
    : purchaseAmount;

  const earningCalc = calculatePoints(earningBase, 'Store');

  // Confirm Loyalty Transaction
  const handleConfirmTransaction = () => {
    if (!activeCustomer) return;

    const result = processStoreTransaction({
      customerId: activeCustomer.id,
      purchaseAmount,
      pointsToRedeem: redemptionValidation.pointsToRedeem,
      paymentMethod: 'Card', // Staff processes payment separately
      paymentSimulateStatus: 'completed',
      billReference: `POS-${storeLocation.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      notes: `In-store checkout at ${storeLocation}`,
    });

    if (result.success && result.sale) {
      const updatedCust = customers.find((c) => c.id === activeCustomer.id) || activeCustomer;
      const expectedBalance =
        activeCustomer.currentPointsBalance -
        redemptionValidation.pointsToRedeem +
        earningCalc.pointsEarned;

      setCompletedReceipt({
        customer: updatedCust,
        sale: result.sale,
        originalBill: purchaseAmount,
        pointsRedeemed: redemptionValidation.pointsToRedeem,
        discountRupees: redemptionValidation.discountRupees,
        finalPayable: redemptionValidation.finalPayableAmount,
        pointsEarned: earningCalc.pointsEarned,
        newBalance: expectedBalance,
        earningTxn: result.earningTxn,
        redemptionTxn: result.redemptionTxn,
        timestamp: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      });

      // Keep wallet pre-selected on this customer
      setSelectedCustomerIdForWallet(activeCustomer.id);
    }
  };

  // Register New Customer
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustMobile) return;

    const cleanMobile = newCustMobile.replace(/\D/g, '');
    const newCust = addCustomer({
      name: newCustName.trim(),
      mobileNumber: cleanMobile,
      email: `${newCustName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      tier: 'Member',
      status: 'active',
      city: newCustCity,
    });

    setActiveCustomer(newCust);
    setMobileQuery(newCust.mobileNumber);
    setShowRegisterModal(false);
    setNewCustName('');
    setNewCustMobile('');
  };

  // Recent customer activity
  const customerRecentTxns = transactions
    .filter((t) => t.customerId === activeCustomer?.id)
    .slice(0, 3);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fadeIn">
      {/* 1. Header Bar */}
      <header className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
            <Store className="w-3.5 h-3.5" />
            <span>Physical Boutique Assistant</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif text-slate-900 font-normal">
            Boutique Staff Loyalty Assistant
          </h1>
          <p className="text-xs text-slate-500">
            Search customer by mobile, calculate earn points, and apply loyalty redemption discounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-500 font-medium">Boutique:</label>
          <select
            value={storeLocation}
            onChange={(e) => setStoreLocation(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="Colaba Flagship Boutique, Mumbai">Colaba Flagship, Mumbai</option>
            <option value="Khan Market Boutique, Delhi">Khan Market, Delhi</option>
            <option value="Indiranagar Concept Store, Bengaluru">Indiranagar, Bengaluru</option>
            <option value="Ashwem Beach Resort Store, Goa">Ashwem Beach, Goa</option>
          </select>
        </div>
      </header>

      {/* Main Grid: Staff Form on Left, Receipt / Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 4-Step Loyalty Flow */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Customer Lookup */}
          <section className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-serif font-semibold text-slate-900 text-base">
                  Identify Customer
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">Lookup via mobile number</span>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">
                  +91
                </span>
                <input
                  type="text"
                  value={mobileQuery}
                  onChange={(e) => setMobileQuery(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full pl-11 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500/20 text-slate-900 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Quick Demo Customer Selector */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Demo Presets:</span>
              {customers.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectQuickCustomer(c)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeCustomer?.id === c.id
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {c.name.split(' ')[0]} ({c.currentPointsBalance} pts)
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="px-2 py-1 rounded-md text-xs text-amber-800 hover:text-amber-950 font-medium inline-flex items-center gap-1 cursor-pointer ml-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Customer</span>
              </button>
            </div>

            {/* Customer Found Card */}
            {activeCustomer ? (
              <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-serif font-semibold text-slate-900 text-sm">
                      {activeCustomer.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      +91 {activeCustomer.mobileNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    City: {activeCustomer.city || 'Mumbai'} &bull; Status: Active Member
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-semibold text-slate-900 font-mono">
                    {activeCustomer.currentPointsBalance}{' '}
                    <span className="text-xs font-normal text-slate-500">pts</span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Worth ₹{activeCustomer.currentPointsBalance * (config.pointValue || 1)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                  <UserX className="w-4 h-4 text-slate-400" />
                  <span>No customer found matching "{mobileQuery}"</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="text-xs text-amber-800 font-medium hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register this mobile number as a new member</span>
                </button>
              </div>
            )}
          </section>

          {/* STEP 2: Enter Purchase Amount */}
          <section className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-serif font-semibold text-slate-900 text-base">
                  Purchase Amount
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">Gross bill before loyalty</span>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-serif text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={purchaseAmount || ''}
                  onChange={(e) => setPurchaseAmount(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 text-base font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500/20 font-mono"
                />
              </div>

              {/* Quick Bill Amount Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 text-[11px]">Example Bills:</span>
                {[1500, 2500, 4200, 7500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPurchaseAmount(amt)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                      purchaseAmount === amt
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {/* Points to be Earned Callout */}
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>
                    Points to be earned from this bill:
                  </span>
                </div>
                <span className="font-bold text-emerald-800 text-sm font-mono">
                  +{earningCalc.pointsEarned} pts
                </span>
              </div>
            </div>
          </section>

          {/* STEP 3: Redeem Points */}
          <section className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
                  3
                </span>
                <h2 className="font-serif font-semibold text-slate-900 text-base">
                  Redeem Rewards Points
                </h2>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRedeeming}
                  onChange={(e) => setIsRedeeming(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700">Apply Points</span>
              </label>
            </div>

            {isRedeeming ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Available to redeem: <strong>{customerAvailablePoints} pts</strong> (₹{customerAvailablePoints})</span>
                  <span>Max allowable: <strong>{redemptionValidation.maxAllowedPoints} pts</strong> (30% cap)</span>
                </div>

                {/* Preset Redemption Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 200].map((pts) => {
                    const isDisabled = pts > customerAvailablePoints || pts > redemptionValidation.maxAllowedPoints;
                    return (
                      <button
                        key={pts}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setPointsToRedeemInput(pts)}
                        className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                          pointsToRedeemInput === pts
                            ? 'bg-amber-100 border-amber-400 text-amber-900'
                            : isDisabled
                            ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {pts} pts (-₹{pts})
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      const maxPossible = Math.min(
                        customerAvailablePoints,
                        redemptionValidation.maxAllowedPoints
                      );
                      setPointsToRedeemInput(maxPossible);
                    }}
                    className="py-2 px-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 transition-colors cursor-pointer"
                  >
                    Max Allowed
                  </button>
                </div>

                {/* Points Input */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-500 font-medium">Custom Points:</label>
                    <input
                      type="number"
                      min="0"
                      max={customerAvailablePoints}
                      value={pointsToRedeemInput || ''}
                      onChange={(e) => setPointsToRedeemInput(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:bg-white text-slate-900 font-mono"
                    />
                  </div>

                  <div className="flex-1 text-right">
                    <label className="text-[11px] text-slate-500 font-medium">Discount Value:</label>
                    <div className="text-lg font-bold text-emerald-700 font-mono pt-1">
                      -₹{redemptionValidation.discountRupees.toFixed(2)}
                    </div>
                  </div>
                </div>

                {!redemptionValidation.isValid && redemptionPoints > 0 && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{redemptionValidation.errorMessage}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No points being redeemed. Customer will pay the full purchase amount and accumulate points.
              </p>
            )}
          </section>

          {/* STEP 4: Confirm Loyalty Transaction */}
          <section className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
                  4
                </span>
                <h2 className="font-serif font-semibold text-slate-900 text-base">
                  Confirm Transaction
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">Record to unified ledger</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Purchase Amount:</span>
                <span className="font-mono font-medium">₹{purchaseAmount.toLocaleString('en-IN')}</span>
              </div>

              {isRedeeming && redemptionValidation.pointsToRedeem > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Loyalty Discount ({redemptionValidation.pointsToRedeem} pts):</span>
                  <span className="font-mono">-₹{redemptionValidation.discountRupees.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Net Payable at Store Register:</span>
                <span className="font-mono text-base text-slate-950">
                  ₹{redemptionValidation.finalPayableAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={!activeCustomer || (!redemptionValidation.isValid && redemptionPoints > 0) || purchaseAmount <= 0}
              onClick={handleConfirmTransaction}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Confirm Loyalty Transaction</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Payment is collected separately via store register. This updates the customer rewards balance.
            </p>
          </section>
        </div>

        {/* Right Column: Transaction Outcome / Receipt or Member Summary */}
        <div className="lg:col-span-5 space-y-6">
          {completedReceipt ? (
            /* Completed Transaction Receipt */
            <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500/30 shadow-lg space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-slate-900 text-base">
                      Transaction Completed
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {completedReceipt.timestamp} &bull; {storeLocation.split(',')[0]}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors cursor-pointer"
                  title="Print Thermal Receipt"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              {/* Receipt Summary */}
              <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <strong className="text-slate-900">{completedReceipt.customer.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile:</span>
                  <span className="font-mono text-slate-800">+91 {completedReceipt.customer.mobileNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Original Bill:</span>
                  <span className="font-mono">₹{completedReceipt.originalBill.toLocaleString('en-IN')}</span>
                </div>

                {completedReceipt.pointsRedeemed > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Points Redeemed:</span>
                    <span className="font-mono">-{completedReceipt.pointsRedeemed} pts (-₹{completedReceipt.discountRupees})</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Net Paid at Store:</span>
                  <span className="font-mono text-sm">₹{completedReceipt.finalPayable.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-emerald-700 font-medium border-t border-slate-200 pt-2">
                  <span>Points Earned on Bill:</span>
                  <span className="font-mono">+{completedReceipt.pointsEarned} pts</span>
                </div>

                <div className="flex justify-between font-bold text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <span>New Points Balance:</span>
                  <span className="font-mono text-sm">{completedReceipt.newBalance} pts (₹{completedReceipt.newBalance})</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomerIdForWallet(completedReceipt.customer.id);
                    setCurrentPortal('wallet');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>View in Customer Wallet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCompletedReceipt(null);
                    setPurchaseAmount(2500);
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Next Customer</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Transaction Preview & Recent Activity */
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h3 className="font-serif font-semibold text-slate-900 text-sm">
                    Live Calculation Preview
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Customer Available Points:</span>
                    <span className="font-mono font-medium">{customerAvailablePoints} pts</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Purchase Amount:</span>
                    <span className="font-mono font-medium">₹{purchaseAmount.toLocaleString('en-IN')}</span>
                  </div>

                  {isRedeeming && redemptionPoints > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Redemption Discount:</span>
                      <span className="font-mono">-₹{redemptionValidation.discountRupees.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-emerald-700">
                    <span>Estimated Points Earned:</span>
                    <span className="font-mono font-bold">+{earningCalc.pointsEarned} pts</span>
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                    <span>Estimated New Balance:</span>
                    <span className="font-mono text-amber-900">
                      {Math.max(0, customerAvailablePoints - (isRedeeming ? redemptionValidation.pointsToRedeem : 0) + earningCalc.pointsEarned)} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Recent Activity */}
              {activeCustomer && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-serif font-semibold text-slate-900 text-sm">
                    Recent Customer Activity
                  </h3>
                  {customerRecentTxns.length > 0 ? (
                    <div className="space-y-2">
                      {customerRecentTxns.map((txn) => (
                        <div
                          key={txn.id}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-medium text-slate-800">
                              {txn.source === 'Online' ? 'Online Store' : 'Boutique Store'}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {new Date(txn.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          <span
                            className={`font-mono font-bold ${
                              txn.pointsDelta > 0 ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {txn.pointsDelta > 0 ? `+${txn.pointsDelta}` : txn.pointsDelta} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No recent transactions recorded yet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-semibold text-slate-900 text-base">
                Register New Customer
              </h3>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Customer Name:</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Maya Sen"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Mobile Number (+91):</label>
                <input
                  type="text"
                  required
                  value={newCustMobile}
                  onChange={(e) => setNewCustMobile(e.target.value)}
                  placeholder="e.g. 9833445566"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">City:</label>
                <input
                  type="text"
                  value={newCustCity}
                  onChange={(e) => setNewCustCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 cursor-pointer"
                >
                  Save &amp; Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
