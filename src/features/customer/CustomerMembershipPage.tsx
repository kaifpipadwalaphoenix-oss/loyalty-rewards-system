import React from 'react';
import { useMemberSession } from '@/hooks/useMemberSession';
import { useAppData } from '@/hooks/useAppData';
import { TierChip } from '@/components/brand/TierChip';
import { WaveLine } from '@/components/brand/WaveLine';
import { ManagedImage } from '@/components/brand/ManagedImage';
import { getTierImage } from '@/assets/brand/images';
import { Check } from 'lucide-react';

export const CustomerMembershipPage: React.FC = () => {
  const { details } = useMemberSession();
  const tiers = useAppData((d) => d.tiers);

  if (!details) return null;

  const currentTier = details.tier;
  const nextTier = details.nextTier;
  const progress = details.tierProgress;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-tide">
          Trove Club Privileges
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">
          The Membership Ladder
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
          Tiers reflect your cumulative qualifying purchases over the rolling 12 months. Your tier is based on qualifying spend in the last 12 months, unlocking elevated bonus earn multipliers and curated gifts.
        </p>
        <div className="flex justify-center pt-2">
          <WaveLine className="w-20 text-terracotta" />
        </div>
      </div>

      {/* Current Standing Card */}
      <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs max-w-3xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sand-subtle pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block">
              Current Membership Level
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-serif text-2xl font-semibold text-charcoal">
                {currentTier.name}
              </span>
              <TierChip tier={currentTier} size="md" />
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block">
              12-Month Qualifying Spend
            </span>
            <span className="font-serif text-xl font-bold text-tide">
              ₹{(details.qualifyingSpendPaise / 100).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {nextTier ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-charcoal-muted">
                Next level: <strong className="text-charcoal">{nextTier.name}</strong> (₹{(nextTier.thresholdPaise / 100).toLocaleString('en-IN')})
              </span>
              <span className="font-semibold text-tide">
                ₹{(progress.remainingPaise / 100).toLocaleString('en-IN')} spend needed
              </span>
            </div>
            <div className="w-full h-3 bg-sand rounded-none overflow-hidden border border-sand-subtle">
              <div
                className="h-full bg-tide transition-all duration-500"
                style={{ width: `${progress.progressPct}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="p-3 bg-sand border border-sand-subtle text-xs text-center text-charcoal font-medium">
            ✨ You have reached <strong>{currentTier.name}</strong>, our highest resortwear tier!
          </div>
        )}
      </div>

      {/* 4 Tiers Comparison Ladder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {tiers.map((tier) => {
          const isCurrent = tier.id === currentTier.id;
          const isAttained = tier.thresholdPaise <= details.qualifyingSpendPaise;

          return (
            <div
              key={tier.id}
              className={`p-6 bg-sand-card border flex flex-col justify-between transition-all space-y-6 ${
                isCurrent
                  ? 'border-tide shadow-md ring-2 ring-tide/20 relative'
                  : 'border-sand-subtle shadow-2xs'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-tide text-white text-[10px] uppercase font-bold tracking-widest shadow-xs z-10">
                  Your Tier
                </div>
              )}

              <div className="space-y-4">
                <div className="relative h-24 -mx-6 -mt-6 mb-2 overflow-hidden bg-sand border-b border-sand-subtle">
                  <ManagedImage
                    src={getTierImage(tier.accent).src}
                    alt={getTierImage(tier.accent).alt}
                    className="w-full h-full object-cover"
                    fallbackGradient="linear-gradient(135deg, var(--sand-200), var(--blush-100))"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-charcoal/50 to-transparent" />
                  <div className="absolute bottom-2 left-4 text-white font-serif text-lg font-semibold drop-shadow-xs">
                    {tier.name}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-widest text-tide">Tier Privileges</span>
                  <TierChip tier={tier} size="sm" />
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block">
                    Spend Requirement
                  </span>
                  <span className="font-serif text-lg font-bold text-tide">
                    {tier.thresholdPaise === 0
                      ? 'Entry Level'
                      : `₹${(tier.thresholdPaise / 100).toLocaleString('en-IN')}`}
                  </span>
                  <span className="text-[10px] text-charcoal-muted block mt-0.5">
                    Rolling 12 months
                  </span>
                </div>

                <div className="p-3 bg-sand border border-sand-subtle text-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted block">
                    Earn Rate
                  </span>
                  <span className="font-semibold text-charcoal block mt-0.5">
                    +{tier.earnBonusPct}% points multiplier
                  </span>
                  <span className="text-[10px] text-charcoal-muted">
                    {(5 * (1 + tier.earnBonusPct / 100)).toFixed(1)} pts per ₹100
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-sand-subtle">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted block">
                    Tier Privileges
                  </span>
                  <ul className="space-y-2 text-xs text-charcoal-muted">
                    {tier.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-sand-subtle text-center">
                {isAttained ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <Check className="w-3.5 h-3.5" /> Attained
                  </span>
                ) : (
                  <span className="text-xs text-charcoal-muted">
                    ₹{((tier.thresholdPaise - details.qualifyingSpendPaise) / 100).toLocaleString('en-IN')} remaining
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Policy Explanation Note */}
      <div className="max-w-3xl mx-auto p-4 bg-sand border border-sand-subtle text-xs text-charcoal-muted space-y-1">
        <span className="font-semibold text-charcoal block">Qualification Rules:</span>
        <p className="leading-relaxed">
          Tier standing is calculated continuously from non-voided purchases recorded at the Trove store made within the last 365 calendar days. Upgrades occur immediately upon purchase recording.
        </p>
      </div>
    </div>
  );
};
