import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemberSession } from '@/hooks/useMemberSession';
import { useAppData } from '@/hooks/useAppData';
import { MembershipCard } from '@/components/brand/MembershipCard';
import { TierChip } from '@/components/brand/TierChip';
import { WaveLine } from '@/components/brand/WaveLine';
import { Button } from '@/components/ui/button';
import { OccasionCard } from '@/components/domain/OccasionCard';
import { RewardRail } from '@/components/domain/RewardRail';
import { formatPoints } from '@/lib/format';
import { Sparkles, Gift, Clock, AlertCircle, ArrowRight, CheckCircle2, Megaphone } from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { details } = useMemberSession();
  const data = useAppData();
  const navigate = useNavigate();

  if (!details) return null;

  const {
    customer,
    tier,
    nextTier,
    tierProgress,
    balance,
    activeVouchers,
    expiringSoonPoints,
    expiringLots,
    transactions,
  } = details;

  const isZeroState = balance === 0 && transactions.length <= 1;
  const activeTiersCount = data.tiers.filter((t) => t.active).length;

  // Active campaigns marked to show to members and eligible for member's tier (NX-006)
  const memberCampaigns = data.campaigns.filter(
    (c) =>
      c.active &&
      c.showToMembers &&
      (!c.eligibleTierIds || c.eligibleTierIds.length === 0 || c.eligibleTierIds.includes(tier.id))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* 1. Membership Card Hero */}
      <div className="max-w-xl mx-auto">
        <MembershipCard
          customer={customer}
          tier={tier}
          tierRank={tier.rank}
          totalTiers={activeTiersCount}
          balance={balance}
          pointValuePaise={50}
        />
      </div>

      {/* 2. Expiring Soon Alert Banner (if points expiring within 30 days) */}
      {expiringSoonPoints > 0 && expiringLots[0] && (
        <div className="p-4 bg-terracotta/10 border-l-4 border-terracotta flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-serif text-sm font-semibold text-charcoal">
              Points Expiring Soon
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5 leading-relaxed">
              <strong>{formatPoints(expiringSoonPoints)} points</strong> will expire on{' '}
              {new Date(expiringLots[0].expiresAt!).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              . Redeem them today for atelier rewards or store discounts.
            </p>
          </div>
          <Link to="/club/rewards">
            <Button size="sm" variant="outline" className="shrink-0 text-xs">
              Redeem Now
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Occasion Celebration Card (Birthday / Anniversary treat or countdown) */}
      <OccasionCard
        customer={customer}
        rules={data.config.occasions}
        grants={data.occasionGrants}
        vouchers={data.vouchers}
      />

      {/* 4. New Member Onboarding Banner (Zero State / Meera) */}
      {isZeroState && (
        <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-tide">
            <Sparkles className="w-5 h-5 text-terracotta" />
            <span className="text-xs uppercase font-bold tracking-widest">
              Welcome to Trove Club
            </span>
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-2xl text-charcoal">
              Start Your Resort Journey
            </h2>
            <p className="text-xs text-charcoal-muted leading-relaxed max-w-lg">
              Present your mobile number <strong>{customer.mobile}</strong> or Member ID{' '}
              <strong>{customer.memberNo}</strong> at the Trove store checkout to begin earning points.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-sand border border-sand-subtle text-xs space-y-1">
              <span className="font-semibold text-charcoal block">1. Earn Points</span>
              <p className="text-charcoal-muted">5 Trove Points per ₹100 on every resortwear piece.</p>
            </div>
            <div className="p-3 bg-sand border border-sand-subtle text-xs space-y-1">
              <span className="font-semibold text-charcoal block">2. Level Up</span>
              <p className="text-charcoal-muted">Spend ₹15,000 to reach Tide tier with +10% bonus points.</p>
            </div>
            <div className="p-3 bg-sand border border-sand-subtle text-xs space-y-1">
              <span className="font-semibold text-charcoal block">3. Celebrate</span>
              <p className="text-charcoal-muted">Birthday &amp; anniversary rewards delivered automatically.</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tier Milestone Progress Bar */}
      <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-subtle pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block">
              Tier Milestone
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-serif text-lg font-semibold text-charcoal">
                {tier.name} Tier
              </span>
              <TierChip tier={tier} size="sm" />
            </div>
          </div>

          {nextTier ? (
            <div className="text-left sm:text-right">
              <span className="text-xs text-charcoal-muted block">
                Spend <strong>₹{(tierProgress.remainingPaise / 100).toLocaleString('en-IN')}</strong> more to reach{' '}
                <strong className="text-tide">{nextTier.name}</strong>
              </span>
              <span className="text-[10px] text-charcoal-muted">
                12-Month Qualifying Spend: ₹{(tierProgress.spendPaise / 100).toLocaleString('en-IN')} / ₹{(nextTier.thresholdPaise / 100).toLocaleString('en-IN')}
              </span>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-xs font-semibold text-tide flex items-center gap-1 justify-end">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Highest Tier Attained
              </span>
              <span className="text-[10px] text-charcoal-muted">
                Enjoying maximum +{tier.earnBonusPct}% points bonus
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {nextTier && (
          <div className="space-y-1.5">
            <div className="w-full h-2.5 bg-sand-subtle rounded-none overflow-hidden border border-sand-subtle">
              <div
                className="h-full bg-tide transition-all duration-500"
                style={{ width: `${tierProgress.progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-charcoal-muted">
              <span>{tier.name}</span>
              <span>{tierProgress.progressPct}% toward {nextTier.name}</span>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-between items-center text-xs">
          <Link
            to="/club/membership"
            className="text-tide font-semibold hover:underline flex items-center gap-1"
          >
            <span>Explore all tier privileges</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 6. Reward Rail (Claimable rewards or closest goal) */}
      <RewardRail
        rewards={data.rewards}
        balance={balance}
        tier={tier}
        onSelectReward={() => navigate('/club/rewards')}
      />

      {/* 7. Active Vouchers Preview (if any) */}
      {activeVouchers.length > 0 && (
        <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-sand-subtle pb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-tide" />
              <h2 className="font-serif text-lg text-charcoal font-semibold">
                Your Active Vouchers ({activeVouchers.length})
              </h2>
            </div>
            <Link to="/club/rewards" className="text-xs text-tide font-semibold hover:underline">
              Browse More
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeVouchers.map((v) => (
              <div
                key={v.id}
                className="p-4 bg-sand border border-sand-subtle flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-tide block">
                    {v.source === 'occasion' ? 'Milestone Treat' : 'Catalogue Reward'}
                  </span>
                  <h3 className="font-serif text-sm font-semibold text-charcoal mt-0.5">
                    {v.title}
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-1">{v.valueLabel}</p>
                </div>

                <div className="pt-3 border-t border-sand-subtle flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-charcoal-muted block">
                      Code at Counter
                    </span>
                    <span className="font-mono text-xs font-bold text-charcoal tracking-wide bg-sand-card px-2 py-0.5 border border-sand-subtle">
                      {v.code}
                    </span>
                  </div>
                  <span className="text-[10px] text-charcoal-muted text-right">
                    Expires {new Date(v.expiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Recent Activity Preview */}
      <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-sand-subtle pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-tide" />
            <h2 className="font-serif text-lg text-charcoal font-semibold">
              Recent Points Activity
            </h2>
          </div>
          <Link to="/club/activity" className="text-xs text-tide font-semibold hover:underline">
            View Full Ledger
          </Link>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-sand-subtle">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-charcoal block">{tx.description}</span>
                  <span className="text-[10px] text-charcoal-muted">
                    {new Date(tx.at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-serif text-sm font-bold block tabular-nums ${
                      tx.points > 0 ? 'text-emerald-700' : 'text-charcoal'
                    }`}
                  >
                    {tx.points > 0 ? `+${formatPoints(tx.points)}` : formatPoints(tx.points)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-charcoal-muted py-4 text-center">
            No activity yet. Your transactions will appear here.
          </p>
        )}
      </div>

      {/* 9. Campaign Announcements (if any active member campaigns) */}
      {memberCampaigns.length > 0 && (
        <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-tide">
            <Megaphone className="w-4 h-4 text-terracotta" />
            <span className="text-xs uppercase font-bold tracking-widest">Store Promotions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {memberCampaigns.map((c) => (
              <div key={c.id} className="p-3 bg-sand border border-sand-subtle space-y-1">
                <span className="font-semibold text-charcoal text-xs block">{c.name}</span>
                <p className="text-[11px] text-charcoal-muted leading-relaxed">
                  {c.customerDescription || `Earn ${(c.multiplierTenths ?? 20) / 10}x points on eligible resort purchases.`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center pt-4">
        <WaveLine className="w-20 text-terracotta" />
      </div>
    </div>
  );
};
