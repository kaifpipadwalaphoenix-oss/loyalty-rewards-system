import React, { useState, useMemo } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ShoppingBag,
  Store,
  Layers,
  CheckCircle2,
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-fadeIn">
      {/* 1. Header & Member Switcher */}
      <header className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Customer View
          </span>
          <h1 className="text-lg sm:text-xl font-serif text-slate-900 font-semibold pt-1">
            Trove Rewards Member Pass
          </h1>
        </div>

        {/* Member Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium shrink-0">Switch Account:</label>
          <select
            value={currentCustomer.id}
            onChange={(e) => setSelectedCustomerIdForWallet(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (+91 {c.mobileNumber}) — {c.currentPointsBalance} pts
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* 2. Mobile-First Customer Rewards Pass Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-700/80">
        {/* Subtle decorative background watermarks */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Brand & Mobile */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold tracking-widest text-amber-300 uppercase block">
                TROVE LABEL &bull; REWARDS PASS
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-light text-white">
                {currentCustomer.name}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-stone-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                +91 {currentCustomer.mobileNumber}
              </span>
            </div>
          </div>

          {/* Points Balance & Rupee Value */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-white/10">
            <div className="space-y-1">
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">
                Available Rewards Points
              </span>
              <div className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight">
                {availablePoints.toLocaleString('en-IN')}{' '}
                <span className="text-base sm:text-lg font-normal text-amber-300 font-sans">
                  points
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-right sm:text-right">
              <span className="text-[11px] text-stone-300 block">Current Savings Value:</span>
              <span className="text-lg font-serif font-bold text-amber-200">
                Worth ₹{rupeeValue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Omnichannel Tagline */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-300">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>One account valid online on trovelabel.com &amp; at all boutique stores</span>
            </span>
            <span className="text-stone-400">
              City: {currentCustomer.city || 'Mumbai'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Simple Guidance Cards: How You Earn & Redeem */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-serif font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>How Points Are Earned</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Earn <strong className="text-slate-900">10 points for every ₹100 spent</strong> across all resortwear,
            kaftans, and holiday apparel. Points are added automatically upon store checkout or online payment confirmation.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-serif font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>How Points Are Redeemed</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Redeem points at checkout online at <strong className="text-slate-900">trovelabel.com</strong> or by sharing
            your mobile number in-store. 1 point = ₹1 discount (up to 30% of your bill).
          </p>
        </div>
      </div>

      {/* 4. Fast Action Shortcuts */}
      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-slate-600">
          Ready to test this customer in an experience?
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setCurrentPortal('online')}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shop Online</span>
          </button>
          <button
            onClick={() => setCurrentPortal('store')}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Visit In-Store</span>
          </button>
        </div>
      </div>

      {/* 5. Unified Activity Ledger (The Proof of Omnichannel) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-serif font-semibold text-slate-900 text-base">
              Unified Rewards Activity
            </h3>
            <p className="text-xs text-slate-500">
              Complete history of points earned and redeemed across online &amp; in-store purchases:
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                channelFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Channels
            </button>
            <button
              onClick={() => setChannelFilter('Store')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                channelFilter === 'Store'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Boutique Stores
            </button>
            <button
              onClick={() => setChannelFilter('Online')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                channelFilter === 'Online'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shopify Online
            </button>
          </div>
        </div>

        {/* Transactions List */}
        {customerTxns.length > 0 ? (
          <div className="space-y-3">
            {customerTxns.map((txn) => {
              const isEarn = txn.pointsDelta > 0;
              return (
                <div
                  key={txn.id}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isEarn
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isEarn ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-semibold text-slate-900 text-sm">
                          {isEarn ? 'Points Earned' : 'Points Redeemed'}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            txn.source === 'Online'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          {txn.source === 'Online' ? 'Shopify Online' : 'Boutique Store'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {txn.notes || (isEarn ? `Purchase at ${txn.source}` : 'Redeemed at checkout')}
                      </p>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-base font-bold font-mono ${
                        isEarn ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isEarn ? `+${txn.pointsDelta}` : txn.pointsDelta} pts
                    </div>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Balance: {txn.balanceAfter} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 space-y-2">
            <Wallet className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">No points activity recorded for this filter yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
