import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '@/hooks/useAppData';
import { selectAdminDashboard, type AdminDateRangePreset } from '@/data/selectors/dashboard';
import { Button } from '@/components/ui/button';
import { formatRupees } from '@/lib/format';
import { Calendar, AlertTriangle, Clock, Gift, Users } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const PRESET_OPTIONS: { id: AdminDateRangePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
  { id: '12m', label: '12 Months' },
];

export const AdminDashboardPage: React.FC = () => {
  const appData = useAppData();
  const [preset, setPreset] = useState<AdminDateRangePreset>('30d');
  const dashboard = selectAdminDashboard(appData, preset);

  const { kpis, needsAttention, tierBreakdown, popularRewards, recentTransactions } = dashboard;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-subtle pb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-tide">
            Programme Analytics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-semibold mt-1">
            Executive Overview
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Real-time commercial metrics, member tier distribution, and loyalty liability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/counter">
            <Button variant="secondary" size="sm">
              Open Store Counter
            </Button>
          </Link>
          <Link to="/admin/customers">
            <Button size="sm">View Customers</Button>
          </Link>
        </div>
      </div>

      {/* Date Range Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-sand p-3 border border-sand-subtle">
        <span className="text-xs font-semibold text-charcoal">Reporting Period:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPreset(opt.id)}
              className={`px-3 py-1 text-xs font-semibold border transition-colors ${
                preset === opt.id
                  ? 'bg-tide text-white border-tide'
                  : 'bg-sand-card text-charcoal-muted border-sand-subtle hover:border-sand-focus hover:text-charcoal'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero KPI + 4 Secondary KPIs (NX-109 / NX-016) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Hero KPI: Active Members */}
        <div className="md:col-span-2 p-6 bg-sand-card border border-sand-subtle shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-widest text-tide">
                Active Members ({preset})
              </span>
              <Users className="w-4 h-4 text-tide" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-tide">
                {kpis.activeMembers}
              </span>
              <span className="text-xs text-charcoal-muted">
                of {kpis.totalMembers} total members
              </span>
            </div>
          </div>
          <p className="text-[11px] text-charcoal-muted mt-4">
            Members who enrolled or made an in-store purchase within the selected {preset} period.
          </p>
        </div>

        {/* 4 Secondary KPIs in 2x2 grid */}
        <div className="md:col-span-3 grid grid-cols-2 gap-3">
          <div className="p-4 bg-sand-card border border-sand-subtle shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block">
              Total Sales ({preset})
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-charcoal block">
              {formatRupees(kpis.totalSalesPaise, false)}
            </span>
            <span className="text-[10px] text-charcoal-muted">Loyalty recorded spend</span>
          </div>

          <div className="p-4 bg-sand-card border border-sand-subtle shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block">
              Points Issued ({preset})
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-emerald-700 block">
              +{kpis.pointsIssued.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-charcoal-muted">Awarded in period</span>
          </div>

          <div className="p-4 bg-sand-card border border-sand-subtle shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block">
              Points Redeemed ({preset})
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-charcoal block">
              {kpis.pointsRedeemed.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-charcoal-muted">Exchanged for rewards</span>
          </div>

          <div className="p-4 bg-sand-card border border-sand-subtle shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block">
              Points Liability (Outstanding)
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-terracotta block">
              {kpis.pointsLiability.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-charcoal-muted">
              Est. value: {formatRupees(kpis.liabilityRupees * 100, false)}
            </span>
          </div>
        </div>
      </div>

      {/* Points Activity Trends Recharts Chart (NX-109: ink/coral) */}
      <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-subtle pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-tide">
              Commercial Dynamics
            </span>
            <h2 className="font-serif text-lg font-semibold text-charcoal">
              Points Issued vs. Redeemed (6-Month Trend)
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-charcoal">
              <span className="w-3 h-3 bg-[#1B3B36] inline-block" />
              <span>Points Issued (Ink)</span>
            </span>
            <span className="flex items-center gap-1.5 text-charcoal">
              <span className="w-3 h-3 bg-[#E26D5C] inline-block" />
              <span>Points Redeemed (Coral)</span>
            </span>
          </div>
        </div>

        <div
          className="h-64 w-full pt-2"
          tabIndex={0}
          role="region"
          aria-label="Points Issued vs. Redeemed 6-Month Trend Chart"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboard.trendSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E0D6" vertical={false} />
              <XAxis dataKey="period" stroke="#5C5854" fontSize={11} tickLine={false} />
              <YAxis stroke="#5C5854" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FAF7F2',
                  borderColor: '#E6E0D6',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="issued" name="Points Issued" fill="#1B3B36" radius={[2, 2, 0, 0]} />
              <Bar dataKey="redeemed" name="Points Redeemed" fill="#E26D5C" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Middle Row: Stacked Day Bar Tier Distribution & Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Distribution Stacked "Day" Bar (NX-109) */}
        <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-sand-subtle pb-3">
            <h2 className="font-serif text-lg font-semibold text-charcoal">
              Membership Tier Distribution
            </h2>
            <Link to="/admin/programme" className="text-xs text-tide font-semibold hover:underline">
              Adjust Thresholds
            </Link>
          </div>

          <div className="space-y-4">
            <div className="w-full h-6 flex overflow-hidden border border-sand-subtle">
              {tierBreakdown.map((item) => (
                <div
                  key={item.tier.id}
                  style={{ width: `${Math.max(item.pct, 4)}%` }}
                  title={`${item.tier.name}: ${item.count} members (${item.pct}%)`}
                  className={`h-full transition-all ${
                    item.tier.accent === 'shore'
                      ? 'bg-sand-muted'
                      : item.tier.accent === 'tide'
                      ? 'bg-tide'
                      : item.tier.accent === 'golden'
                      ? 'bg-terracotta'
                      : 'bg-charcoal'
                  }`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {tierBreakdown.map((item) => (
                <div key={item.tier.id} className="p-2 bg-sand border border-sand-subtle space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        item.tier.accent === 'shore'
                          ? 'bg-sand-muted border border-sand-focus'
                          : item.tier.accent === 'tide'
                          ? 'bg-tide'
                          : item.tier.accent === 'golden'
                          ? 'bg-terracotta'
                          : 'bg-charcoal'
                      }`}
                    />
                    <span className="font-semibold text-charcoal truncate">{item.tier.name}</span>
                  </div>
                  <span className="text-[11px] text-charcoal-muted block">
                    {item.count} members ({item.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Needs Attention List (NX-109) */}
        <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-sand-subtle pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-terracotta" />
              <h2 className="font-serif text-lg font-semibold text-charcoal">
                Needs Attention
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* 1. Expiring points */}
            <div className="p-3 bg-sand border border-sand-subtle space-y-1">
              <div className="flex items-center justify-between font-semibold text-charcoal">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-terracotta" />
                  Points Expiring in ≤ 30 Days
                </span>
                <span className="text-terracotta font-serif font-bold">
                  {needsAttention.expiringPoints.totalPoints} pts ({needsAttention.expiringPoints.memberCount} members)
                </span>
              </div>
              <p className="text-[11px] text-charcoal-muted">
                {needsAttention.expiringPoints.members.length > 0
                  ? needsAttention.expiringPoints.members
                      .slice(0, 3)
                      .map((m) => `${m.name} (${m.points} pts)`)
                      .join(', ') + (needsAttention.expiringPoints.members.length > 3 ? '...' : '')
                  : 'No member points due to expire within 30 days.'}
              </p>
            </div>

            {/* 2. Upcoming celebrations */}
            <div className="p-3 bg-sand border border-sand-subtle space-y-1">
              <div className="flex items-center justify-between font-semibold text-charcoal">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-tide" />
                  Celebrations in Next 14 Days
                </span>
                <span className="text-tide font-serif font-bold">
                  {needsAttention.celebrations.length} upcoming
                </span>
              </div>
              <p className="text-[11px] text-charcoal-muted">
                {needsAttention.celebrations.length > 0
                  ? needsAttention.celebrations
                      .slice(0, 3)
                      .map((c) => `${c.customer.name} (${c.occasion === 'birthday' ? 'Birthday' : 'Anniversary'})`)
                      .join(', ')
                  : 'No celebrations in the next 14 days.'}
              </p>
            </div>

            {/* 3. Unused vouchers expiring */}
            <div className="p-3 bg-sand border border-sand-subtle space-y-1">
              <div className="flex items-center justify-between font-semibold text-charcoal">
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-700" />
                  Unused Vouchers Expiring in ≤ 7 Days
                </span>
                <span className="text-amber-700 font-serif font-bold">
                  {needsAttention.expiringVouchers.length} vouchers
                </span>
              </div>
              <p className="text-[11px] text-charcoal-muted">
                {needsAttention.expiringVouchers.length > 0
                  ? needsAttention.expiringVouchers
                      .slice(0, 2)
                      .map((v) => `${v.customerName}: ${v.title}`)
                      .join(', ')
                  : 'No unused vouchers expiring soon.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Popular Rewards & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Rewards Ranking */}
        <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-sand-subtle pb-3">
            <h2 className="font-serif text-lg font-semibold text-charcoal">
              Top Claimed Rewards
            </h2>
            <Link to="/admin/rewards" className="text-xs text-tide font-semibold hover:underline">
              Manage Rewards
            </Link>
          </div>

          {popularRewards.length > 0 ? (
            <div className="divide-y divide-sand-subtle text-xs">
              {popularRewards.map((item) => (
                <div key={item.reward.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-charcoal block">{item.reward.name}</span>
                    <span className="text-[10px] text-charcoal-muted font-serif">
                      {item.reward.pointsCost} pts · {item.reward.value.label}
                      {item.stockRemaining !== undefined && (
                        <span className="ml-2 font-mono text-[9px] text-tide">
                          ({item.stockRemaining} left in stock)
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="font-serif font-bold text-tide">
                    {item.redeemedCount} claimed
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-charcoal-muted py-4 text-center">
              No rewards claimed yet.
            </p>
          )}
        </div>

        {/* Recent Ledger Activity */}
        <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-sand-subtle pb-3">
            <h2 className="font-serif text-lg font-semibold text-charcoal">
              Recent Points Transactions
            </h2>
            <Link to="/admin/audit" className="text-xs text-tide font-semibold hover:underline">
              Audit Trail
            </Link>
          </div>

          <div className="divide-y divide-sand-subtle text-xs max-h-72 overflow-y-auto">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-medium text-charcoal block truncate max-w-xs">
                    {tx.description}
                  </span>
                  <span className="text-[10px] text-charcoal-muted font-mono">
                    {tx.ref} · {new Date(tx.at).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <span
                  className={`font-serif font-bold text-xs shrink-0 ${
                    tx.points > 0 ? 'text-emerald-700' : 'text-charcoal'
                  }`}
                >
                  {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
