import React from 'react';
import { Link } from 'react-router-dom';
import type { Reward, Tier } from '@/domain/types';
import { Gift, ArrowRight } from 'lucide-react';
import { RewardCard } from '@/components/brand/RewardCard';
import { formatPoints } from '@/lib/format';

interface RewardRailProps {
  rewards: Reward[];
  balance: number;
  tier: Tier;
  onSelectReward?: (reward: Reward) => void;
}

export const RewardRail: React.FC<RewardRailProps> = ({
  rewards,
  balance,
  tier,
  onSelectReward,
}) => {
  const activeRewards = rewards.filter((r) => r.status === 'active');

  // Partition into immediately claimable and upcoming
  const claimable = activeRewards.filter(
    (r) =>
      r.pointsCost <= balance &&
      (r.eligibleTierIds.length === 0 || r.eligibleTierIds.includes(tier.id))
  );

  const upcoming = activeRewards
    .filter((r) => r.pointsCost > balance)
    .sort((a, b) => a.pointsCost - b.pointsCost);

  // Take up to 6 items (claimable first, then closest upcoming)
  const displayRewards = [...claimable, ...upcoming].slice(0, 6);

  if (displayRewards.length === 0) return null;

  return (
    <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-sand-subtle pb-3">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-tide" />
          <h2 className="font-serif text-lg text-charcoal font-semibold">
            {claimable.length > 0 ? 'Rewards You Can Claim' : 'Available Rewards'}
          </h2>
        </div>
        <Link to="/club/rewards" className="text-xs text-tide font-semibold hover:underline flex items-center gap-1">
          <span>Browse All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayRewards.map((reward) => {
          const isEligible =
            reward.pointsCost <= balance &&
            (reward.eligibleTierIds.length === 0 || reward.eligibleTierIds.includes(tier.id));
          const pointsShort = reward.pointsCost - balance;

          let status: 'eligible' | 'points_short' | 'tier_locked' = 'eligible';
          let statusText = 'You can claim';

          if (!isEligible) {
            if (reward.eligibleTierIds.length > 0 && !reward.eligibleTierIds.includes(tier.id)) {
              status = 'tier_locked';
              statusText = 'Tier privilege';
            } else {
              status = 'points_short';
              statusText = `Need ${formatPoints(pointsShort)} more`;
            }
          }

          return (
            <RewardCard
              key={reward.id}
              id={reward.id}
              name={reward.name}
              pointsCost={reward.pointsCost}
              valueSummary={reward.value.label}
              imageSrc={reward.image.src}
              imageAlt={reward.image.alt}
              eligibilityStatus={status}
              eligibilityText={statusText}
              onClick={() => onSelectReward?.(reward)}
            />
          );
        })}
      </div>
    </div>
  );
};
