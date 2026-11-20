import React, { useState, useMemo } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import type { LoyaltyTransaction } from '../../types/loyalty';
import {
  Search,
  Store,
  Globe,
  ShieldCheck,
  X,
  ChevronRight,
  Info,
} from 'lucide-react';

export const TransactionLedger: React.FC = () => {
  const { transactions } = useLoyalty();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedTxn, setSelectedTxn] = useState<LoyaltyTransaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        t.reference.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerMobile.includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q));

      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesSource = sourceFilter === 'all' || t.source === sourceFilter;

      return matchesSearch && matchesType && matchesSource;
    });
  }, [transactions, searchQuery, typeFilter, sourceFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Loyalty Audit Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of points earned, redeemed, and adjusted across store & online channels
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Total Ledger Records: <strong className="text-slate-900">{transactions.length}</strong></span>
          </div>

          <button
            onClick={() => {
              const csvHeaders = 'ID,Reference,Date,Customer,Mobile,Channel,Type,PurchaseAmount,PointsDelta,MonetaryValue,BalanceAfter,Notes\n';
              const csvRows = filteredTransactions
                .map((t) =>
                  [
                    t.id,
                    t.reference,
                    t.createdAt,
                    `"${t.customerName}"`,
                    t.customerMobile,
                    t.source,
                    t.type,
                    t.purchaseAmount || 0,
                    t.pointsDelta,
                    t.monetaryValue,
                    t.balanceAfter,
                    `"${(t.notes || '').replace(/"/g, '""')}"`,
                  ].join(',')
                )
                .join('\n');

              const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `trove-ledger-${Date.now()}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            title="Download filtered transactions as CSV"
          >
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference (POS-...), customer, mobile..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="earn">Earned (+pts)</option>
              <option value="redeem">Redeemed (-pts)</option>
              <option value="refund">Refund / Reversal (-pts)</option>
              <option value="adjust">Adjusted (Manual)</option>
              <option value="expire">Expired (-pts)</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Channels</option>
              <option value="Store">Physical Store</option>
              <option value="Online">Online Web</option>
              <option value="Admin">Admin Manual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Reference & Date</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Channel</th>
                <th className="px-4 py-3.5">Transaction Type</th>
                <th className="px-4 py-3.5 text-right">Bill / Base (₹)</th>
                <th className="px-4 py-3.5 text-right">Points Delta</th>
                <th className="px-4 py-3.5 text-right">Monetary Value</th>
                <th className="px-6 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const isEarn = t.type === 'earn';
                  const isRedeem = t.type === 'redeem';
                  const isAdjust = t.type === 'adjust';

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => setSelectedTxn(t)}
                    >
                      <td className="px-6 py-3.5">
                        <div className="font-mono font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {t.reference}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(t.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{t.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">+91 {t.customerMobile}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                          {t.source === 'Store' && <Store className="w-3.5 h-3.5 text-slate-400" />}
                          {t.source === 'Online' && <Globe className="w-3.5 h-3.5 text-slate-400" />}
                          {t.source === 'Admin' && <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{t.source}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isEarn
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isRedeem
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : t.type === 'refund'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isAdjust
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium text-slate-700 tabular-nums">
                        {t.purchaseAmount ? `₹${t.purchaseAmount.toLocaleString('en-IN')}` : '—'}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={`font-extrabold text-sm tabular-nums ${
                            t.pointsDelta > 0 ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {t.pointsDelta > 0 ? `+${t.pointsDelta}` : t.pointsDelta}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">pts</span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-bold text-slate-900 tabular-nums">
                        ₹{t.monetaryValue.toFixed(2)}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTxn(t);
                          }}
                          className="p-1 rounded-md text-slate-400 group-hover:text-slate-800 transition-colors"
                          title="View complete transaction snapshot"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRANSACTION SNAPSHOT DETAIL MODAL */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedTxn.type} Transaction
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 font-mono">
                  {selectedTxn.reference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Overview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 text-[11px]">Points Effect:</span>
                <div
                  className={`text-xl font-extrabold mt-0.5 ${
                    selectedTxn.pointsDelta > 0 ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {selectedTxn.pointsDelta > 0 ? `+${selectedTxn.pointsDelta}` : selectedTxn.pointsDelta} pts
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px]">Monetary Value:</span>
                <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                  ₹{selectedTxn.monetaryValue.toFixed(2)}
                </div>
              </div>
            </div>

            {/* General Info */}
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">
                  {selectedTxn.customerName} ({selectedTxn.customerMobile})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Channel / Source:</span>
                <span className="font-semibold text-slate-800">{selectedTxn.source}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Purchase Amount:</span>
                <span className="font-semibold text-slate-800">
                  {selectedTxn.purchaseAmount ? `₹${selectedTxn.purchaseAmount.toFixed(2)}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Customer Balance After:</span>
                <span className="font-bold text-slate-900">{selectedTxn.balanceAfter} pts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-700">{new Date(selectedTxn.createdAt).toLocaleString()}</span>
              </div>
              {selectedTxn.notes && (
                <div className="py-1">
                  <span className="text-slate-500 block mb-0.5">Notes:</span>
                  <span className="text-slate-700 bg-slate-50 p-2 rounded block border border-slate-100">
                    {selectedTxn.notes}
                  </span>
                </div>
              )}
            </div>

            {/* RULE SNAPSHOT (Crucial architectural demonstration) */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Rule Snapshot Applied at Execution Time:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-amber-950">
                <div>
                  Threshold: <strong>₹{selectedTxn.earningRuleSnapshot?.purchaseThreshold || 100}</strong>
                </div>
                <div>
                  Pts per threshold: <strong>{selectedTxn.earningRuleSnapshot?.pointsPerThreshold || 10} pts</strong>
                </div>
                <div>
                  Point value: <strong>1 pt = ₹{selectedTxn.pointValueSnapshot || 1.0}</strong>
                </div>
                <div>
                  Max redemption: <strong>{selectedTxn.earningRuleSnapshot?.maximumRedemptionPercentage || 30}%</strong>
                </div>
              </div>
              <p className="text-[10px] text-amber-800/80 italic mt-1">
                Notice: This snapshot proves this transaction preserves its original rule terms even if current program rules are modified.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
