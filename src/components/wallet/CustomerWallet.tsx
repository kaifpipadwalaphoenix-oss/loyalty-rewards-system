import React, { useState, useMemo } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import {
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Info,
  Store,
  X,
} from 'lucide-react';

export const CustomerWallet: React.FC = () => {
  const {
    customers,
    selectedCustomerIdForWallet,
    setSelectedCustomerIdForWallet,
    transactions,
    config,
    setCurrentPortal,
  } = useLoyalty();

  const [channelFilter, setChannelFilter] = useState<'all' | 'Store' | 'Online'>('all');
  const [showQRModal, setShowQRModal] = useState<boolean>(false);

  // Selected customer
  const currentCustomer = useMemo(() => {
    return (
      customers.find((c) => c.id === selectedCustomerIdForWallet) ||
      customers[0] ||
      null
    );
  }, [customers, selectedCustomerIdForWallet]);

  // Customer transactions
  const customerTxns = useMemo(() => {
    if (!currentCustomer) return [];
    return transactions
      .filter((t) => t.customerId === currentCustomer.id)
      .filter((t) => channelFilter === 'all' || t.source === channelFilter);
  }, [currentCustomer, transactions, channelFilter]);

  if (!currentCustomer) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
        <p className="text-sm text-slate-500">No customer selected.</p>
      </div>
    );
  }

  const availablePoints = currentCustomer.currentPointsBalance;
  const rupeeValue = availablePoints * (config.pointValue || 1.0);

  // Tier calculation & progress
  const tiers = [
    { name: 'Classic', min: 0, next: 500, nextName: 'Silver' },
    { name: 'Silver', min: 500, next: 1000, nextName: 'Gold' },
    { name: 'Gold', min: 1000, next: 2500, nextName: 'Platinum' },
    { name: 'Platinum', min: 2500, next: 10000, nextName: 'Diamond' },
  ];
  const currentTierInfo = tiers.find((t) => t.name === currentCustomer.tier) || tiers[0];
  const progressPercent = Math.min(
    100,
    Math.round(
      ((currentCustomer.lifetimePointsEarned - currentTierInfo.min) /
        Math.max(1, currentTierInfo.next - currentTierInfo.min)) *
        100
    )
  );

  // Find nearest upcoming expiring points (if any)
  const nearestExpiringTxn = customerTxns.find(
    (t) => t.type === 'earn' && t.expiryAt && new Date(t.expiryAt) > new Date()
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Customer Switcher Strip */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Customer Rewards Experience
          </span>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Trove Member Rewards Wallet
          </h1>
        </div>

        {/* Member Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Switch Member:</span>
          <select
            value={currentCustomer.id}
            onChange={(e) => setSelectedCustomerIdForWallet(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (+91 {c.mobileNumber}) — {c.currentPointsBalance} pts ({c.tier})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* REFINED DIGITAL MEMBERSHIP CARD (Restrained, elegant, non-busy) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 text-white p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="flex flex-col justify-between space-y-6">
          {/* Card Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg tracking-wider font-bold text-white">
                  TROVE LABEL
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-white/20">
                  {currentCustomer.tier} Member
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Unified Omnichannel Wardrobe Rewards
              </p>
            </div>

            <button
              onClick={() => setShowQRModal(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Show In-Store Cashier QR Code"
            >
              <QrCode className="w-5 h-5 opacity-90" />
              <span className="hidden sm:inline">Show Member QR</span>
            </button>
          </div>

          {/* Points & Rupee Equivalent Spotlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Available Reward Points
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold mt-0.5 tabular-nums text-white">
                {availablePoints.toLocaleString('en-IN')}{' '}
                <span className="text-sm font-normal text-slate-300">points</span>
              </div>
            </div>

            <div className="sm:border-l sm:border-white/10 sm:pl-6">
              <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                Equivalent Cash Discount Value
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold mt-0.5 tabular-nums text-emerald-300">
                ₹{rupeeValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Calculated at 1 pt = ₹{config.pointValue} &bull; Redeemable at checkout
              </div>
            </div>
          </div>

          {/* Tier Progress Bar */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">
                Tier Progression: <strong className="text-white">{currentCustomer.tier}</strong>
              </span>
              <span className="text-emerald-300 text-[11px] font-semibold">
                {currentCustomer.lifetimePointsEarned.toLocaleString('en-IN')} / {currentTierInfo.next.toLocaleString('en-IN')} pts to {currentTierInfo.nextName}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Card Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-white/10 text-xs text-slate-400">
            <div>
              <span className="text-white font-bold block">{currentCustomer.name}</span>
              <span className="font-mono text-[11px]">+91 {currentCustomer.mobileNumber} &bull; ID: {currentCustomer.id}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPortal('store')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Simulate In-Store Redemption</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Answers to Customer Questions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-slate-900">
            Your Trove Rewards Guide
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-500 font-medium block">How do I earn points?</span>
            <span className="font-bold text-slate-900 mt-1 block">
              Earn {config.pointsPerThreshold} pts per ₹{config.purchaseThreshold} spent
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Valid on physical store and Shopify web purchases.
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-500 font-medium block">How do I redeem points?</span>
            <span className="font-bold text-slate-900 mt-1 block">
              Up to {config.maximumRedemptionPercentage}% off your bill
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Unlock discounts once you have {config.minimumRedemptionPoints} points (1 pt = ₹{config.pointValue}).
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-500 font-medium block">When do my points expire?</span>
            <span className="font-bold text-slate-900 mt-1 block">
              {config.expiryEnabled ? `${config.expiryMonths} Months Rolling` : 'Never'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {nearestExpiringTxn?.expiryAt
                ? `Next expiry: ${new Date(nearestExpiringTxn.expiryAt).toLocaleDateString()}`
                : 'Points currently held do not have immediate expiry.'}
            </span>
          </div>
        </div>
      </div>

      {/* Lifetime Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Lifetime Earned
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block tabular-nums">
            {currentCustomer.lifetimePointsEarned.toLocaleString('en-IN')} pts
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            ₹{(currentCustomer.lifetimePointsEarned * config.pointValue).toFixed(0)} total rewards accrued
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Lifetime Redeemed
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block tabular-nums">
            {currentCustomer.lifetimePointsRedeemed.toLocaleString('en-IN')} pts
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            ₹{(currentCustomer.lifetimePointsRedeemed * config.pointValue).toFixed(0)} saved at checkout
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Purchasing Channels
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            Store &amp; Shopify
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            One unified wallet across all channels
          </span>
        </div>
      </div>

      {/* Customer's Historical Activity Ledger */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Rewards Activity &amp; Audit History
            </h3>
            <p className="text-xs text-slate-500">
              Chronological log of points credited and debited across store and Shopify
            </p>
          </div>

          {/* Channel Filters */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['all', 'Store', 'Online'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  channelFilter === ch
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ch === 'all' ? 'All Channels' : ch === 'Store' ? 'In-Store POS' : 'Shopify Online'}
              </button>
            ))}
          </div>
        </div>

        {customerTxns.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No activity recorded under this filter for this member.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {customerTxns.map((t) => {
              const isEarn = t.type === 'earn';
              const isRedeem = t.type === 'redeem';
              const isRefund = t.type === 'refund';

              return (
                <div key={t.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${
                        isEarn
                          ? 'bg-emerald-50 text-emerald-800'
                          : isRedeem
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {isEarn ? <ArrowUpRight className="w-4 h-4" /> : isRedeem ? <ArrowDownLeft className="w-4 h-4" /> : 'REV'}
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>
                          {isEarn
                            ? `Points Earned (${t.source})`
                            : isRedeem
                            ? `Points Redeemed (${t.source})`
                            : isRefund
                            ? `Points Reversed (${t.source})`
                            : t.notes || 'Point Adjustment'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600">
                          {t.source}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Ref: {t.reference} &bull; {new Date(t.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        {t.expiryAt && (
                          <span className="ml-1 text-slate-500">
                            &bull; Valid till {new Date(t.expiryAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-extrabold text-sm tabular-nums ${
                        t.pointsDelta > 0 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {t.pointsDelta > 0 ? `+${t.pointsDelta}` : t.pointsDelta} pts
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Balance after: <strong className="text-slate-700">{t.balanceAfter} pts</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Member QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Storefront Member Pass
              </span>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
              {/* Simulated QR Code matrix */}
              <div className="w-44 h-44 bg-slate-900 rounded-xl p-3 flex flex-col justify-between items-center text-white">
                <div className="w-full flex justify-between">
                  <div className="w-10 h-10 border-4 border-white rounded-md bg-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-slate-900" />
                  </div>
                  <div className="w-10 h-10 border-4 border-white rounded-md bg-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-slate-900" />
                  </div>
                </div>
                <div className="font-mono text-[9px] tracking-widest text-emerald-300 font-bold">
                  TROVE-ID:{currentCustomer.id}
                </div>
                <div className="w-full flex justify-between">
                  <div className="w-10 h-10 border-4 border-white rounded-md bg-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-slate-900" />
                  </div>
                  <div className="w-10 h-10 border-2 border-dashed border-slate-400 flex items-center justify-center text-[8px]">
                    SCAN
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">{currentCustomer.name}</h3>
              <p className="font-mono text-xs text-slate-500 mt-0.5">+91 {currentCustomer.mobileNumber}</p>
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Balance: {availablePoints} pts (₹{rupeeValue})</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Scan this at any Trove Label physical store POS terminal to identify member and redeem points.
            </p>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
