import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import type { LoyaltyConfig } from '../../types/loyalty';
import {
  SlidersHorizontal,
  Coins,
  ShieldAlert,
  RotateCcw,
  Save,
  Store,
  Globe,
  Info,
} from 'lucide-react';

export const LoyaltyRulesConfig: React.FC = () => {
  const { config, updateConfig, resetConfigToDefaults } = useLoyalty();

  // Local form state for draft changes
  const [formData, setFormData] = useState<LoyaltyConfig>(() => ({ ...config }));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Live calculator test state
  const [testPurchaseAmount, setTestPurchaseAmount] = useState<number>(2000);

  // Check if form differs from active config
  const handleChange = <K extends keyof LoyaltyConfig>(key: K, value: LoyaltyConfig[K]) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      const changed = JSON.stringify(next) !== JSON.stringify(config);
      setHasUnsavedChanges(changed);
      return next;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    setFormData({ ...config });
    setHasUnsavedChanges(false);
  };

  // Live calculator calculations based on CURRENT DRAFT values
  const threshold = Math.max(1, Number(formData.purchaseThreshold) || 100);
  const pointsPerThreshold = Math.max(0, Number(formData.pointsPerThreshold) || 0);
  const pointVal = Math.max(0.01, Number(formData.pointValue) || 1);
  const maxRedeemPct = Math.max(1, Math.min(100, Number(formData.maximumRedemptionPercentage) || 30));

  let calcPoints = 0;
  if (formData.earningEnabled) {
    if (formData.earningMethod === 'proportional') {
      calcPoints = Math.round((testPurchaseAmount / threshold) * pointsPerThreshold);
    } else {
      calcPoints = Math.floor(testPurchaseAmount / threshold) * pointsPerThreshold;
    }
  }

  const calcRupeeValue = calcPoints * pointVal;
  const modulo = testPurchaseAmount % threshold;
  const remainingTowardsNext = modulo === 0 ? 0 : threshold - modulo;

  const maxRedeemRupees = (testPurchaseAmount * maxRedeemPct) / 100;
  const maxRedeemPoints = Math.floor(maxRedeemRupees / pointVal);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
              <span>Dynamic Rules Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Loyalty Programme Configuration
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Configure Trove Label's earning rates, rupee value per point, and redemption boundaries dynamically. All new transactions across Store POS and Shopify storefront execute against these active parameters.
            </p>
          </div>

          {/* Save & Reset Actions Bar */}
          <div className="flex items-center gap-3 shrink-0">
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
              >
                Discard Edits
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                hasUnsavedChanges
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20 cursor-pointer animate-pulse'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{hasUnsavedChanges ? 'Save Changes Now' : 'Configuration Active'}</span>
            </button>
          </div>
        </div>

        {/* Status Callout */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span className="font-medium">Active Policy Snapshot:</span>
            <span className="font-bold text-slate-900">
              ₹{config.purchaseThreshold} spend = {config.pointsPerThreshold} pts (₹{config.pointsPerThreshold * config.pointValue} value)
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">
              Max Redemption: {config.maximumRedemptionPercentage}% of bill
            </span>
          </div>

          <div className="text-slate-500 text-[11px]">
            Historical transactions remain immutable &bull; Last updated {new Date(config.updatedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sections A through E (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION A: Points Earning Rules */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  A
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Points Earning Rules
                  </h2>
                  <p className="text-xs text-slate-500">
                    Define spend-to-points accrual ratio and minimum qualifying criteria
                  </p>
                </div>
              </div>

              {/* Master Earning Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">
                  {formData.earningEnabled ? 'Earning Enabled' : 'Earning Paused'}
                </span>
                <input
                  type="checkbox"
                  checked={formData.earningEnabled}
                  onChange={(e) => handleChange('earningEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
              {/* Threshold */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Purchase Threshold Amount (₹)
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.purchaseThreshold}
                    onChange={(e) => handleChange('purchaseThreshold', Math.max(1, Number(e.target.value)))}
                    className="block w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    placeholder="100"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Spend unit required to earn points (Default: ₹100)
                </p>
              </div>

              {/* Points per threshold */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Points Awarded per Threshold
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.pointsPerThreshold}
                    onChange={(e) => handleChange('pointsPerThreshold', Math.max(0, Number(e.target.value)))}
                    className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    placeholder="10"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 font-semibold text-xs">
                    points
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Points added per threshold met (e.g. 10 or 20)
                </p>
              </div>

              {/* Minimum qualifying purchase */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Minimum Qualifying Purchase (₹)
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={formData.minimumPurchase}
                    onChange={(e) => handleChange('minimumPurchase', Math.max(0, Number(e.target.value)))}
                    className="block w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Bills below this amount earn 0 points
                </p>
              </div>

              {/* Calculation Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Calculation Method
                </label>
                <select
                  value={formData.earningMethod}
                  onChange={(e) => handleChange('earningMethod', e.target.value as 'threshold_floor' | 'proportional')}
                  className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                >
                  <option value="threshold_floor">Floor (Default: Standard Retail)</option>
                  <option value="proportional">Proportional (Rounded)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Floor: FLOOR(Spend / Threshold) × Points
                </p>
              </div>
            </div>

            {/* Formula Explanation Callout */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Active Formula:</span>{' '}
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-mono text-[11px]">
                  FLOOR(Purchase / ₹{formData.purchaseThreshold}) × {formData.pointsPerThreshold} points
                </code>
                . On a ₹2,550 purchase with ₹100 threshold, customer earns{' '}
                <span className="font-bold text-emerald-700">
                  {Math.floor(2550 / Math.max(1, formData.purchaseThreshold)) * formData.pointsPerThreshold} points
                </span>
                .
              </div>
            </div>
          </div>

          {/* SECTION B: Point Monetary Value */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                B
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Point Monetary Value
                </h2>
                <p className="text-xs text-slate-500">
                  Configure the financial exchange rate of 1 loyalty point in Indian Rupees
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Monetary Value of 1 Point (₹)
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0.05"
                    step="0.05"
                    value={formData.pointValue}
                    onChange={(e) => handleChange('pointValue', Math.max(0.01, Number(e.target.value)))}
                    className="block w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    placeholder="1.0"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Recommended: ₹1.00 (1 pt = ₹1) or ₹0.25 (4 pts = ₹1)
                </p>
              </div>

              {/* Conversion Visual Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                    Exchange Preview
                  </div>
                  <div className="text-base font-bold text-amber-950 mt-0.5">
                    100 Points = ₹{(100 * formData.pointValue).toFixed(2)}
                  </div>
                  <div className="text-xs text-amber-700 mt-0.5">
                    250 Points = ₹{(250 * formData.pointValue).toFixed(2)} discount
                  </div>
                </div>
                <Coins className="w-8 h-8 text-amber-500 opacity-80" />
              </div>
            </div>
          </div>

          {/* SECTION C: Redemption Rules */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  C
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Redemption Policy & Limits
                  </h2>
                  <p className="text-xs text-slate-500">
                    Control burn rules, bill caps, and cashier redemption permissions
                  </p>
                </div>
              </div>

              {/* Master Redemption Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">
                  {formData.redemptionEnabled ? 'Redemption Enabled' : 'Redemption Disabled'}
                </span>
                <input
                  type="checkbox"
                  checked={formData.redemptionEnabled}
                  onChange={(e) => handleChange('redemptionEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
              {/* Minimum points required for redemption */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Minimum Points Required for Redemption
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="number"
                    min="1"
                    step="5"
                    value={formData.minimumRedemptionPoints}
                    onChange={(e) => handleChange('minimumRedemptionPoints', Math.max(1, Number(e.target.value)))}
                    className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                    placeholder="50"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 font-semibold text-xs">
                    points
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Threshold to unlock redemption (Default: 50 points)
                </p>
              </div>

              {/* Maximum percentage of eligible bill */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Maximum Bill Percentage Payable via Points (%)
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={formData.maximumRedemptionPercentage}
                    onChange={(e) => handleChange('maximumRedemptionPercentage', Math.min(100, Math.max(1, Number(e.target.value))))}
                    className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                    placeholder="30"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 font-semibold text-xs">
                    %
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Protects margin: max bill discount allowed (Default: 30%)
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800">
                  Allow Partial Redemption
                </div>
                <p className="text-[11px] text-slate-500">
                  Customer can choose to redeem fewer points than the maximum cap
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.partialRedemptionAllowed}
                onChange={(e) => handleChange('partialRedemptionAllowed', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* SECTION D: Expiry Rules */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  D
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Points Expiry Policy
                  </h2>
                  <p className="text-xs text-slate-500">
                    Set expiration period to manage balance sheet liability
                  </p>
                </div>
              </div>

              {/* Expiry Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">
                  {formData.expiryEnabled ? 'Expiry Active' : 'Points Never Expire'}
                </span>
                <input
                  type="checkbox"
                  checked={formData.expiryEnabled}
                  onChange={(e) => handleChange('expiryEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {formData.expiryEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Expiry Validity Period (Months)
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={formData.expiryMonths}
                      onChange={(e) => handleChange('expiryMonths', Math.max(1, Number(e.target.value)))}
                      className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                      placeholder="12"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 font-semibold text-xs">
                      months
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Rolling expiry from date of transaction
                  </p>
                </div>

                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200/50 text-xs text-purple-900 leading-relaxed">
                  <span className="font-semibold">Policy summary:</span> Points earned today will expire in exactly{' '}
                  <span className="font-bold">{formData.expiryMonths} months</span> on a FIFO (First-In, First-Out) basis. Customers receive automated notifications 30 days prior.
                </div>
              </div>
            )}
          </div>

          {/* SECTION E: Additional Earning Conditions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                E
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Channel & Earning Conditions
                </h2>
                <p className="text-xs text-slate-500">
                  Configure specific scenarios for discounts, net calculations, and sales channels
                </p>
              </div>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              {/* Toggle 1: Earn on discounted items */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Earn Points on Discounted / Sale Merchandise
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Allow customers to accumulate points on marked-down or promotional items
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.earnOnDiscountedPurchases}
                  onChange={(e) => handleChange('earnOnDiscountedPurchases', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Toggle 2: Earn points on amount paid after redemption */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Earn Points on Net Paid Amount (After Points Redemption)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    If checked, points are calculated on net cash paid (e.g. ₹1,950). If unchecked, points are calculated on original bill (₹2,000).
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.earnOnRedeemedAmount}
                  onChange={(e) => handleChange('earnOnRedeemedAmount', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Toggle 3: Physical store purchases */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      Physical Store Purchases (POS)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Cashier terminal earning enabled across retail locations
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.storeEarningEnabled}
                  onChange={(e) => handleChange('storeEarningEnabled', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Toggle 4: Online purchases */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      Online Purchases (E-Commerce Storefront)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Award points for digital web purchases and checkout orders
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.onlineEarningEnabled}
                  onChange={(e) => handleChange('onlineEarningEnabled', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SECTION F - Live Example Calculator & Active Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 bg-white rounded-2xl p-6 border-2 border-emerald-600/30 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  F
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Live Rule Simulator
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Interactive
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Test your draft rules against simulated purchase amounts in real-time.
            </p>

            {/* Test Purchase Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Test Purchase Amount (₹)
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={testPurchaseAmount}
                    onChange={(e) => setTestPurchaseAmount(Math.max(0, Number(e.target.value)))}
                    className="block w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-base font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                {/* Quick preset chips */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[1000, 2000, 2550, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTestPurchaseAmount(amt)}
                      className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                        testPurchaseAmount === amt
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Calculation Output Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Spend Threshold:</span>
                  <span className="font-semibold text-slate-900">₹{formData.purchaseThreshold}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Points per Threshold:</span>
                  <span className="font-semibold text-slate-900">{formData.pointsPerThreshold} pts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Point Value:</span>
                  <span className="font-semibold text-slate-900">1 pt = ₹{formData.pointValue}</span>
                </div>

                <div className="pt-2 border-t border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Points Awarded:</span>
                    <span className="text-lg font-extrabold text-emerald-700 tabular-nums">
                      {calcPoints} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-slate-500">Monetary Reward Value:</span>
                    <span className="text-xs font-bold text-slate-900 tabular-nums">
                      ₹{calcRupeeValue.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Remaining towards next threshold */}
                {remainingTowardsNext > 0 && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                      <span>To next {formData.pointsPerThreshold} pts:</span>
                      <span className="font-semibold text-slate-800">₹{remainingTowardsNext} more spend</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${((formData.purchaseThreshold - remainingTowardsNext) / formData.purchaseThreshold) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Redemption Limits for this bill */}
                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Max Redemption Cap ({formData.maximumRedemptionPercentage}%):</span>
                    <span className="font-semibold text-slate-800">₹{maxRedeemRupees.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Max Points Redeemable:</span>
                    <span className="font-semibold text-slate-800">{maxRedeemPoints} points</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                    hasUnsavedChanges
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Apply New Rules</span>
                </button>

                <button
                  type="button"
                  onClick={resetConfigToDefaults}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Factory Defaults</span>
                </button>
              </div>

              {/* Guardrail Note */}
              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-1.5 leading-snug">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Safety Guarantee:</strong> Changing rules modifies calculations only for future purchases. Existing customer balances and transaction receipts remain strictly preserved.
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
