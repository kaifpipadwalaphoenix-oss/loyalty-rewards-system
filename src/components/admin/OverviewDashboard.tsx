import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { ChartEarnedVsRedeemed } from '../common/ChartEarnedVsRedeemed';
import {
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  IndianRupee,
  SlidersHorizontal,
  Store,
  Wallet,
  Globe,
  ShieldCheck,
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const {
    metrics,
    customers,
    transactions,
    config,
    setAdminTab,
    setCurrentPortal,
    setSelectedCustomerIdForWallet,
  } = useLoyalty();

  const recentTransactions = transactions.slice(0, 6);
  const recentCustomers = customers.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Executive Clean Header (Restrained, no huge dark hero banner) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Trove Label Retail Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Loyalty Programme Executive Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time rewards balances, financial liability, and unified store & Shopify activity.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAdminTab('rules')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>Configure Rules</span>
          </button>
          <button
            onClick={() => setCurrentPortal('store')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Store POS</span>
          </button>
          <button
            onClick={() => setCurrentPortal('online')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Globe className="w-3.5 h-3.5 text-white" />
            <span>Shopify Webhook Simulator</span>
          </button>
        </div>
      </div>

      {/* Guided Client Demonstration Quick-Action Strip */}
      <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Demonstration Workflow
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-900 mt-0.5">
            End-to-End Omnichannel Walkthrough
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test the complete proposed lifecycle across configuration, online e-commerce, in-store cashier checkout, and member wallet pass.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setAdminTab('rules')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>1. Set Rules</span>
          </button>

          <button
            onClick={() => setCurrentPortal('online')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Web Purchase</span>
          </button>

          <button
            onClick={() => setCurrentPortal('store')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. Store Redeem</span>
          </button>

          <button
            onClick={() => {
              setSelectedCustomerIdForWallet(customers[0]?.id || 'CUST-001');
              setCurrentPortal('wallet');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>4. View Wallet</span>
          </button>
        </div>
      </div>

      {/* 4 Crisp KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Loyalty Members</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
              {metrics.totalMembers}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{metrics.activeMembersCount} active accounts</span>
            <button
              onClick={() => setAdminTab('customers')}
              className="text-emerald-700 hover:text-emerald-800 font-bold"
            >
              Directory &rarr;
            </button>
          </div>
        </div>

        {/* Total Points Issued */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Total Points Issued</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
              {metrics.totalPointsIssued.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Lifetime rewards granted</span>
            <span className="font-bold text-slate-700">₹{(metrics.totalPointsIssued * config.pointValue).toLocaleString('en-IN')} val</span>
          </div>
        </div>

        {/* Total Points Redeemed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Total Redeemed</span>
              <ArrowDownLeft className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
              {metrics.totalPointsRedeemed.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Burn Ratio: {((metrics.totalPointsRedeemed / Math.max(1, metrics.totalPointsIssued)) * 100).toFixed(1)}%</span>
            <span className="font-bold text-amber-700">
              ₹{(metrics.totalPointsRedeemed * config.pointValue).toLocaleString('en-IN')} saved
            </span>
          </div>
        </div>

        {/* Outstanding Liability */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Outstanding Liability</span>
              <IndianRupee className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
              ₹{metrics.estimatedOutstandingRupeeValue.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{metrics.outstandingPoints.toLocaleString('en-IN')} unspent points</span>
            <span className="font-semibold text-slate-700">@ ₹{config.pointValue}/pt</span>
          </div>
        </div>
      </div>

      {/* Center Section: Chart & Omnichannel Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ChartEarnedVsRedeemed />
        </div>

        {/* Omnichannel Channel & Policy Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Active Program Policy
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Live
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between">
                <span className="text-slate-500">Spend Threshold:</span>
                <span className="font-bold text-slate-900">₹{config.purchaseThreshold} = {config.pointsPerThreshold} pts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between">
                <span className="text-slate-500">Point Value:</span>
                <span className="font-bold text-slate-900">1 pt = ₹{config.pointValue}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between">
                <span className="text-slate-500">Min. Redemption:</span>
                <span className="font-bold text-slate-900">{config.minimumRedemptionPoints} pts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between">
                <span className="text-slate-500">Bill Redemption Cap:</span>
                <span className="font-bold text-slate-900">{config.maximumRedemptionPercentage}% of bill</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex justify-between">
                <span className="text-slate-500">Points Validity:</span>
                <span className="font-bold text-slate-900">{config.expiryEnabled ? `${config.expiryMonths} mos rolling` : 'Never'}</span>
              </div>
            </div>

            {/* Omnichannel Distribution */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Store Sales</span>
                <span className="font-bold text-slate-900">{metrics.storeSalesCount} orders</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Shopify Sales</span>
                <span className="font-bold text-slate-900">{metrics.onlineSalesCount} orders</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setAdminTab('rules')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Modify Rules in Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Ledger Activity & Member Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Recent Audit Ledger Activity
              </h3>
              <p className="text-xs text-slate-500">
                Latest points accrued, redeemed, and reversed
              </p>
            </div>
            <button
              onClick={() => setAdminTab('transactions')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View all ({transactions.length}) &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentTransactions.map((txn) => {
              const isEarn = txn.type === 'earn';
              const isRedeem = txn.type === 'redeem';

              return (
                <div key={txn.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                        isEarn
                          ? 'bg-emerald-50 text-emerald-800'
                          : isRedeem
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {isEarn ? '+pts' : isRedeem ? '-pts' : 'rev'}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{txn.customerName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600">
                          {txn.source}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {txn.reference} &bull; {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold tabular-nums ${
                        txn.pointsDelta > 0 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {txn.pointsDelta > 0 ? `+${txn.pointsDelta}` : txn.pointsDelta} pts
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ₹{txn.monetaryValue.toFixed(0)} val
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Directory Preview */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Customer Members
              </h3>
              <p className="text-xs text-slate-500">
                Omnichannel balances and tier standings
              </p>
            </div>
            <button
              onClick={() => setAdminTab('customers')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Manage members &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentCustomers.map((cust) => (
              <div key={cust.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                    {cust.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>{cust.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-slate-100 text-slate-600">
                        {cust.tier}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      +91 {cust.mobileNumber}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-slate-900 tabular-nums">
                      {cust.currentPointsBalance} pts
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ₹{(cust.currentPointsBalance * config.pointValue).toFixed(0)} value
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCustomerIdForWallet(cust.id);
                      setCurrentPortal('wallet');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title={`Open ${cust.name}'s Wallet Pass`}
                  >
                    <Wallet className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
