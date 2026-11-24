import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Wordmark } from './Wordmark';
import { WaveLine } from './WaveLine';
import { PointsValue } from './PointsValue';
import { computeSunArc } from './sun-arc';
import type { TierAccent } from './TierChip';
import type { Customer, Tier } from '@/domain/types';
import { QrCode } from 'lucide-react';

export interface MembershipCardProps {
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
  progressPct?: number;
  nextTierName?: string;
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
  progressPct,
  nextTierName,
  onClick,
  className,
  animatePoints = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const effectiveName = customer?.name ?? name ?? 'Trove Member';
  const effectiveMemberNo = customer?.memberNo ?? memberNo ?? 'TC000000';
  const effectiveTierName = tier?.name ?? tierName ?? 'Shore';
  const effectivePoints = balance !== undefined ? balance : points ?? 0;
  const isTopTier = tierRank >= totalTiers - 1;
  const effectiveProgress = progressPct !== undefined ? progressPct : isTopTier ? 100 : 0;

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

  const cardStyles: Record<
    TierAccent,
    {
      gradient: string;
      textClass: string;
      isDark: boolean;
      waveColor: string;
      borderColor: string;
      arcTrack: string;
      arcActive: string;
      dotFill: string;
    }
  > = {
    shore: {
      gradient: 'linear-gradient(135deg, #F6D9CF 0%, #E9EEF0 100%)',
      textClass: 'text-[#141414]',
      isDark: false,
      waveColor: 'text-[#141414]/25',
      borderColor: 'border-[#E6DDD0]',
      arcTrack: 'stroke-[#141414]/20',
      arcActive: 'stroke-[#141414]/70',
      dotFill: '#141414',
    },
    tide: {
      gradient: 'linear-gradient(135deg, #0F3D4A 0%, #1F7A86 100%)',
      textClass: 'text-white',
      isDark: true,
      waveColor: 'text-[#F1DDD6]/30',
      borderColor: 'border-[#1F7A86]/30',
      arcTrack: 'stroke-white/20',
      arcActive: 'stroke-[#F1DDD6]',
      dotFill: '#F1DDD6',
    },
    golden: {
      gradient: 'linear-gradient(135deg, #C9862E 0%, #E9B949 100%)',
      textClass: 'text-[#141414]',
      isDark: false,
      waveColor: 'text-[#141414]/25',
      borderColor: 'border-[#E9B949]/40',
      arcTrack: 'stroke-[#141414]/25',
      arcActive: 'stroke-[#141414]/80',
      dotFill: '#141414',
    },
    endless: {
      gradient: 'linear-gradient(135deg, #2B2350 0%, #C2546B 100%)',
      textClass: 'text-white',
      isDark: true,
      waveColor: 'text-[#F1DDD6]/40',
      borderColor: 'border-[#C2546B]/30',
      arcTrack: 'stroke-white/20',
      arcActive: 'stroke-[#F1DDD6]',
      dotFill: '#F1DDD6',
    },
  };

  const style = cardStyles[effectiveAccent] || cardStyles.shore;

  // Sun-arc geometry
  const arc = computeSunArc(effectiveProgress, {
    cx: 200,
    cy: 411.26,
    radius: 399.26,
    startAngleDeg: 115.2,
    endAngleDeg: 64.8,
  });

  const handleToggleFlip = () => {
    setIsFlipped((prev) => !prev);
    onClick?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleToggleFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggleFlip();
        }
      }}
      style={{ background: style.gradient }}
      className={cn(
        'group relative w-full aspect-[1.586/1] rounded-xl p-5 md:p-6 flex flex-col justify-between overflow-hidden shadow-lg transition-all duration-300 select-none border cursor-pointer hover:shadow-xl focus-visible:ring-2 focus-visible:ring-tide-800',
        style.textClass,
        style.borderColor,
        className
      )}
      aria-label={`Trove Club Card for ${effectiveName}, ${effectiveTierName} tier, ${effectivePoints} points. Click to flip.`}
    >
      {/* Sun Arc Progression across top */}
      <div className="absolute top-0 left-0 right-0 h-14 overflow-hidden pointer-events-none z-10 opacity-75">
        <svg viewBox="0 0 400 60" className="w-full h-full" preserveAspectRatio="none">
          {/* Background track arc */}
          <path
            d={arc.pathD}
            fill="none"
            className={style.arcTrack}
            strokeWidth="1.5"
            strokeDasharray="2 3"
          />
          {/* Active progress arc */}
          <path
            d={arc.activePathD}
            fill="none"
            className={style.arcActive}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Sun dot */}
          <circle
            cx={arc.dot.x}
            cy={arc.dot.y}
            r="4.5"
            fill={style.dotFill}
            className="drop-shadow-xs"
          />
          <circle cx={arc.dot.x} cy={arc.dot.y} r="2" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Decorative Wave Line at bottom */}
      <div className="absolute right-0 bottom-4 pointer-events-none opacity-20 scale-150 transform translate-x-4">
        <WaveLine className={cn('w-64 h-12', style.waveColor)} strokeWidth={2} />
      </div>

      {/* FRONT FACE */}
      {!isFlipped ? (
        <>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 z-10 pt-1">
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
              {nextTierName && !isTopTier && (
                <span
                  className={cn(
                    'block text-[9px] font-sans tracking-wider mt-0.5 opacity-80',
                    style.isDark ? 'text-blush-100' : 'text-ink-400'
                  )}
                >
                  {effectiveProgress}% to {nextTierName}
                </span>
              )}
            </div>
          </div>

          {/* Middle: Available Points Display */}
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
              <PointsValue
                points={effectivePoints}
                animate={animatePoints}
                size="card"
                className="font-serif text-4xl md:text-[44px] leading-none font-normal tracking-tight tabular-nums"
              />
            </div>
          </div>

          {/* Footer: Member Name & Card Number */}
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
        </>
      ) : (
        /* BACK FACE (NX-200 Card Flip for Store Counter) */
        <div className="flex flex-col justify-between h-full z-10 py-1 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <Wordmark size="sm" inverse={style.isDark} />
            <span
              className={cn(
                'text-[10px] uppercase tracking-widest font-mono font-medium',
                style.isDark ? 'text-blush-200/80' : 'text-ink-500'
              )}
            >
              Counter Scan
            </span>
          </div>

          <div className="my-auto text-center space-y-2">
            <span
              className={cn(
                'text-[10px] uppercase tracking-[0.2em] font-medium block',
                style.isDark ? 'text-blush-200' : 'text-ink-500'
              )}
            >
              Member Identifier
            </span>
            <div className="font-mono text-2xl md:text-3xl font-bold tracking-[0.2em] py-1 border-y border-current/20">
              {formattedMemberNo}
            </div>
            <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] opacity-80">
              <QrCode className="w-3.5 h-3.5" />
              <span>Present at store counter for points</span>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-current/15">
            <span className="text-[10px] uppercase tracking-wider opacity-70">
              Click anywhere to flip card
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
