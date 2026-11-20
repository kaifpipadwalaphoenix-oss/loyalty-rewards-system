import React, { useMemo } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';

interface MonthData {
  monthKey: string;
  label: string;
  earned: number;
  redeemed: number;
}

export const ChartEarnedVsRedeemed: React.FC = () => {
  const { transactions } = useLoyalty();

  const monthlyData = useMemo<MonthData[]>(() => {
    // Cover the realistic seed data range: Oct 2023 – Apr 2024
    const months: MonthData[] = [
      { monthKey: '2023-10', label: 'Oct', earned: 0, redeemed: 0 },
      { monthKey: '2023-11', label: 'Nov', earned: 0, redeemed: 0 },
      { monthKey: '2024-01', label: 'Jan', earned: 0, redeemed: 0 },
      { monthKey: '2024-02', label: 'Feb', earned: 0, redeemed: 0 },
      { monthKey: '2024-03', label: 'Mar', earned: 0, redeemed: 0 },
      { monthKey: '2024-04', label: 'Apr', earned: 0, redeemed: 0 },
    ];

    transactions.forEach((txn) => {
      if (txn.status !== 'completed') return;
      const date = new Date(txn.createdAt);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const targetMonth = months.find((m) => m.monthKey === yearMonth);
      if (targetMonth) {
        if (txn.type === 'earn') {
          targetMonth.earned += txn.pointsDelta;
        } else if (txn.type === 'redeem') {
          targetMonth.redeemed += Math.abs(txn.pointsDelta);
        } else if (txn.type === 'adjust') {
          if (txn.pointsDelta > 0) targetMonth.earned += txn.pointsDelta;
          else targetMonth.redeemed += Math.abs(txn.pointsDelta);
        }
      }
      // ignore out-of-range transactions for a clean chart
    });

    return months;
  }, [transactions]);

  const maxVal = useMemo(() => {
    const highest = Math.max(
      ...monthlyData.map((d) => Math.max(d.earned, d.redeemed)),
      500
    );
    return Math.ceil(highest / 1000) * 1000;
  }, [monthlyData]);

  const chartHeight = 160;
  const chartWidth = 520;
  const paddingX = 44;
  const paddingY = 20;
  const availableWidth = chartWidth - paddingX * 2;
  const availableHeight = chartHeight - paddingY * 2;

  const barGroupWidth = availableWidth / monthlyData.length;
  const barWidth = Math.min(18, barGroupWidth * 0.35);

  const totalEarned = monthlyData.reduce((s, m) => s + m.earned, 0);
  const totalRedeemed = monthlyData.reduce((s, m) => s + m.redeemed, 0);
  const burnRatio = totalEarned > 0 ? ((totalRedeemed / totalEarned) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Points Flow — Earned vs. Redeemed
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated from live transaction ledger across Store &amp; Shopify
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
            <span className="text-slate-600">Earned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
            <span className="text-slate-600">Redeemed</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 select-none font-sans"
          aria-label="Bar chart showing points earned versus redeemed per month"
        >
          {/* Horizontal gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = paddingY + availableHeight * (1 - pct);
            const val = Math.round(maxVal * pct);
            return (
              <g key={pct}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke={pct === 0 ? '#e2e8f0' : '#f1f5f9'}
                  strokeWidth="1"
                  strokeDasharray={pct === 0 ? '' : '3 3'}
                />
                {pct > 0 && (
                  <text
                    x={paddingX - 6}
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="8"
                    fill="#94a3b8"
                  >
                    {val >= 1000 ? `${val / 1000}k` : val}
                  </text>
                )}
              </g>
            );
          })}

          {/* Bars */}
          {monthlyData.map((d, i) => {
            const groupCenterX = paddingX + i * barGroupWidth + barGroupWidth / 2;
            const earnedHeight = maxVal > 0 ? Math.max(2, (d.earned / maxVal) * availableHeight) : 2;
            const redeemedHeight = maxVal > 0 ? Math.max(2, (d.redeemed / maxVal) * availableHeight) : 2;

            const earnedX = groupCenterX - barWidth - 2;
            const redeemedX = groupCenterX + 2;

            const earnedY = paddingY + availableHeight - earnedHeight;
            const redeemedY = paddingY + availableHeight - redeemedHeight;

            return (
              <g key={d.monthKey}>
                <rect
                  x={earnedX}
                  y={earnedY}
                  width={barWidth}
                  height={earnedHeight}
                  rx="3"
                  fill="#059669"
                  opacity="0.9"
                >
                  <title>{`${d.label}: +${d.earned.toLocaleString()} pts earned`}</title>
                </rect>

                {d.redeemed > 0 && (
                  <rect
                    x={redeemedX}
                    y={redeemedY}
                    width={barWidth}
                    height={redeemedHeight}
                    rx="3"
                    fill="#f59e0b"
                    opacity="0.85"
                  >
                    <title>{`${d.label}: ${d.redeemed.toLocaleString()} pts redeemed`}</title>
                  </rect>
                )}

                <text
                  x={groupCenterX}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill="#94a3b8"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 pt-3 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-xs font-bold text-emerald-700 tabular-nums">+{totalEarned.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">Total Earned</div>
        </div>
        <div>
          <div className="text-xs font-bold text-amber-700 tabular-nums">{totalRedeemed.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">Total Redeemed</div>
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900 tabular-nums">{burnRatio}%</div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">Burn Ratio</div>
        </div>
      </div>
    </div>
  );
};
