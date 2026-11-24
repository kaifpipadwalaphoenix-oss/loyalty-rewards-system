import React from 'react';
import { cn } from '@/lib/cn';
import { Wordmark } from './Wordmark';
import { WaveLine } from './WaveLine';
import { PointsValue } from './PointsValue';
import type { TierAccent } from './TierChip';
import type { Customer, Tier } from '@/domain/types';

interface MembershipCardProps {
  name?: string;
  memberNo?: string;
  tierName?: string;
  tierRank?: number; // 0..3
  totalTiers?: number; // default 4
  points?: number;
  accent?: TierAccent;
  customer?: Customer;
  tier?: Tier;
  balance?: number;
  pointValuePaise?: number;
  onClick?: () => void;
  className?: string;
  animatePoints?: boolean;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({
  name,
  memberNo,
  tierName,
  tierRank = 0,
  totalTiers = 4,
  points,
  accent,
  customer,
  tier,
  balance,
  onClick,
  className,
  animatePoints = false,
}) => {
  const effectiveName = customer?.name ?? name ?? 'Trove Member';
  const effectiveMemberNo = customer?.memberNo ?? memberNo ?? 'TC000000';
  const effectiveTierName = tier?.name ?? tierName ?? 'Shore';
  const effectivePoints = balance !== undefined ? balance : points ?? 0;
  const effectiveAccent: TierAccent =
    accent ??
    (effectiveTierName.toLowerCase().includes('endless')
      ? 'endless'
      : effectiveTierName.toLowerCase().includes('golden')
      ? 'golden'
      : effectiveTierName.toLowerCase().includes('tide')
      ? 'tide'
      : 'shore');

  const formattedMemberNo = effectiveMemberNo.startsWith('TC')
    ? `TC ${effectiveMemberNo.slice(2, 5)} ${effectiveMemberNo.slice(5)}`.trim()
    : effectiveMemberNo;

  const cardStyles: Record<TierAccent, { gradient: string; textClass: string; isDark: boolean; waveColor: string; borderColor?: string }> = {
    shore: {
      gradient: 'linear-gradient(135deg, #F6D9CF 0%, #E9EEF0 100%)',
      textClass: 'text-[#141414]',
      isDark: false,
      waveColor: 'text-[#141414]/30',
      borderColor: 'border-[#E6DDD0]',
    },
    tide: {
      gradient: 'linear-gradient(135deg, #0F3D4A 0%, #1F7A86 100%)',
      textClass: 'text-white',
      isDark: true,
      waveColor: 'text-[#F1DDD6]/40',
    },
    golden: {
      gradient: 'linear-gradient(135deg, #C9862E 0%, #E9B949 100%)',
      textClass: 'text-[#141414]',
      isDark: false,
      waveColor: 'text-[#141414]/25',
      borderColor: 'border-[#E9B949]/40',
    },
    endless: {
      gradient: 'linear-gradient(135deg, #2B2350 0%, #C2546B 100%)',
      textClass: 'text-white',
      isDark: true,
      waveColor: 'text-[#F1DDD6]/50',
    },
  };

  const style = cardStyles[effectiveAccent] || cardStyles.shore;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ background: style.gradient }}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'relative w-full max-w-[420px] aspect-[1.586/1] rounded-xl p-5 md:p-6 flex flex-col justify-between overflow-hidden shadow-lg transition-all duration-300 select-none border',
        style.textClass,
        style.borderColor ?? 'border-transparent',
        onClick && 'cursor-pointer hover:scale-[1.01] hover:shadow-xl focus-visible:ring-2 focus-visible:ring-tide-800',
        className
      )}
      aria-label={`Trove Club Card for ${effectiveName}, ${effectiveTierName} tier, ${effectivePoints} points`}
    >
      {/* Decorative Wave Background */}
      <div className="absolute right-0 bottom-4 pointer-events-none opacity-20 scale-150 transform translate-x-4">
        <WaveLine className={cn('w-64 h-12', style.waveColor)} strokeWidth={2} />
      </div>

      {/* Top Header: Wordmark + Tier Eyebrow */}
      <div className="flex items-start justify-between gap-2 z-10">
        <Wordmark size="sm" inverse={style.isDark} />
        <div className="text-right">
          <span
            className={cn(
              'block text-[10px] md:text-[11px] font-sans font-semibold uppercase tracking-[0.16em]',
              style.isDark ? 'text-blush-200' : 'text-ink-500'
            )}
          >
            Tier {tierRank + 1} of {totalTiers} · {effectiveTierName}
          </span>
        </div>
      </div>

      {/* Middle: Points Display */}
      <div className="my-auto z-10 pt-2">
        <span
          className={cn(
            'block text-[11px] font-sans uppercase font-medium tracking-[0.18em] mb-1',
            style.isDark ? 'text-blush-200/80' : 'text-ink-500'
          )}
        >
          Available Points
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-4xl md:text-[44px] leading-none font-normal tracking-tight tabular-nums">
            <PointsValue points={effectivePoints} animate={animatePoints} />
          </span>
        </div>
      </div>

      {/* Bottom Footer: Member Name + Card Number */}
      <div className="flex items-end justify-between gap-4 z-10 pt-2 border-t border-current/15">
        <div className="min-w-0 flex-1">
          <p
            className="font-sans font-medium text-sm md:text-base tracking-wide truncate"
            title={effectiveName}
          >
            {effectiveName}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="font-sans font-mono text-xs md:text-sm tracking-wider opacity-90">
            {formattedMemberNo}
          </span>
        </div>
      </div>
    </div>
  );
};
