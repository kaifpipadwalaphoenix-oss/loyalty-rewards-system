import React, { useState } from 'react';
import { useMemberSession } from '@/hooks/useMemberSession';
import { WaveLine } from '@/components/brand/WaveLine';
import { Clock, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { deriveLedger } from '@/domain/ledger';
import { formatPoints } from '@/lib/format';

export const CustomerActivityPage: React.FC = () => {
  const { details } = useMemberSession();
  const [filterType, setFilterType] = useState<'all' | 'earn' | 'redeem' | 'expire'>('all');
  const [now] = useState(() => Date.now());

  if (!details) return null;

  const derived = deriveLedger(details.transactions, details.customer.id);
  const runningBalances = derived.runningBalances;

  // Chronologically sort (at desc, ref desc) per TC-035 & R3.3
  const sortedTransactions = [...details.transactions]
    .sort((a, b) => {
      if (a.at !== b.at) return b.at.localeCompare(a.at);
      return (b.ref || b.id).localeCompare(a.ref || a.id);
    })
    .filter((tx) => {
      if (filterType === 'earn') return tx.points > 0;
      if (filterType === 'redeem') return tx.type === 'REDEEM' || tx.type === 'ADJUST_DEBIT';
      if (filterType === 'expire') return tx.type === 'EXPIRE';
      return true;
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-tide">
          Points Ledger
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">
          Points Activity
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
          Every point earned, redeemed, or adjusted is tracked transparently with running balances.
        </p>
        <div className="flex justify-center pt-2">
          <WaveLine className="w-20 text-terracotta" />
        </div>
      </div>

      {/* Summary KPI Band */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="p-5 bg-sand-card border border-sand-subtle shadow-2xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block">
            Current Balance
          </span>
          <span className="font-serif text-2xl font-bold text-tide">
            {details.balance.toLocaleString('en-IN')} pts
          </span>
        </div>

        <div className="p-5 bg-sand-card border border-sand-subtle shadow-2xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block">
            12-Month Qualifying Spend
          </span>
          <span className="font-serif text-2xl font-bold text-charcoal">
            ₹{(details.qualifyingSpendPaise / 100).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-5 bg-sand-card border border-sand-subtle shadow-2xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block">
            Expiring Within 30 Days
          </span>
          <span
            className={`font-serif text-2xl font-bold ${
              details.expiringSoonPoints > 0 ? 'text-terracotta' : 'text-charcoal'
            }`}
          >
            {details.expiringSoonPoints.toLocaleString('en-IN')} pts
          </span>
        </div>
      </div>

      {/* Expiry Schedule Card */}
      {derived.schedule.length > 0 && (
        <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-2 border-b border-sand-subtle pb-3">
            <Calendar className="w-4 h-4 text-tide" />
            <h2 className="font-serif text-base font-semibold text-charcoal">
              Upcoming Expiry Schedule
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {derived.schedule.slice(0, 3).map((item, idx) => (
              <div key={idx} className="p-3 bg-sand border border-sand-subtle space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-charcoal-muted block">
                  {new Date(item.date).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="font-serif text-lg font-bold text-charcoal block">
                  {item.points.toLocaleString('en-IN')} pts
                </span>
                <span className="text-[10px] text-charcoal-muted">
                  {Math.max(0, Math.ceil((new Date(item.date).getTime() - now) / (1000 * 60 * 60 * 24)))} days remaining
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Ledger */}
      <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-subtle pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-tide" />
            <h2 className="font-serif text-lg font-semibold text-charcoal">
              Transaction History
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1 text-xs">
            {(['all', 'earn', 'redeem', 'expire'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-3 py-1 text-xs capitalize transition-colors border ${
                  filterType === filter
                    ? 'border-tide bg-tide text-white font-semibold'
                    : 'border-sand-subtle bg-sand text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {filter === 'all'
                  ? 'All'
                  : filter === 'earn'
                  ? 'Earned'
                  : filter === 'redeem'
                  ? 'Redeemed'
                  : 'Expired'}
              </button>
            ))}
          </div>
        </div>

        {sortedTransactions.length > 0 ? (
          <div className="divide-y divide-sand-subtle">
            {sortedTransactions.map((tx) => {
              const isCredit = tx.points > 0;
              const runningBalance = runningBalances[tx.id];

              return (
                <div key={tx.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 shrink-0 border mt-0.5 ${
                        isCredit
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : tx.type === 'EXPIRE'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-sand border-sand-subtle text-charcoal'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <span className="font-serif text-sm font-semibold text-charcoal block">
                        {tx.description}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-charcoal-muted mt-0.5">
                        <span>
                          {new Date(tx.at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span>·</span>
                        <span className="font-mono">{tx.ref}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-serif text-base font-bold block tabular-nums ${
                        isCredit ? 'text-emerald-700' : 'text-charcoal'
                      }`}
                    >
                      {isCredit ? `+${formatPoints(tx.points)}` : formatPoints(tx.points)}
                    </span>
                    {runningBalance !== undefined && (
                      <span className="text-[10px] text-charcoal-muted tabular-nums">
                        Bal: {formatPoints(runningBalance)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-charcoal-muted text-center py-8">
            No transactions match this filter.
          </p>
        )}
      </div>
    </div>
  );
};
