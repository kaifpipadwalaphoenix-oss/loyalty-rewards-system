import React from 'react';
import { cn } from '@/lib/cn';
import type { Tier } from '@/domain/types';

export type TierAccent = 'shore' | 'tide' | 'golden' | 'endless';

export interface TierBadgeProps {
  tier?: Tier;
  tierName?: string;
  accent?: TierAccent;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const resolveTierAccent = (nameOrTier?: Tier | string, explicitAccent?: TierAccent): TierAccent => {
  if (explicitAccent) return explicitAccent;
  const name = typeof nameOrTier === 'string' ? nameOrTier : nameOrTier?.name ?? '';
  const lower = name.toLowerCase();
  if (lower.includes('endless')) return 'endless';
  if (lower.includes('golden')) return 'golden';
  if (lower.includes('tide')) return 'tide';
  return 'shore';
};

const tierLightStyles: Record<
  TierAccent,
  { dot: string; container: string; text: string; border: string }
> = {
  shore: {
    dot: 'bg-linear-to-r from-[#F6D9CF] to-[#E9EEF0]',
    container: 'bg-[#F6D9CF]/35',
    text: 'text-[#141414]',
    border: 'border-[#E6DDD0]',
  },
  tide: {
    dot: 'bg-linear-to-r from-[#0F3D4A] to-[#1F7A86]',
    container: 'bg-[#0F3D4A]/10',
    text: 'text-[#0F3D4A]',
    border: 'border-[#0F3D4A]/25',
  },
  golden: {
    dot: 'bg-linear-to-r from-[#C9862E] to-[#E9B949]',
    container: 'bg-[#C9862E]/15',
    text: 'text-[#141414]',
    border: 'border-[#C9862E]/30',
  },
  endless: {
    dot: 'bg-linear-to-r from-[#2B2350] to-[#C2546B]',
    container: 'bg-[#2B2350]/10',
    text: 'text-[#2B2350]',
    border: 'border-[#2B2350]/25',
  },
};

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  tierName,
  accent,
  size = 'md',
  className,
}) => {
  const name = tier?.name ?? tierName ?? 'Shore';
  const resolvedAccent = resolveTierAccent(tier ?? name, accent);
  const theme = tierLightStyles[resolvedAccent];

  const sizeClasses = {
    sm: {
      wrap: 'text-[10px] px-2 py-0.5 gap-1.5 leading-none',
      dot: 'w-2 h-2',
    },
    md: {
      wrap: 'text-xs px-2.5 py-1 gap-2 leading-none',
      dot: 'w-2.5 h-2.5',
    },
    lg: {
      wrap: 'text-sm px-3 py-1.5 gap-2.5 leading-none',
      dot: 'w-3 h-3',
    },
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center font-sans font-medium tracking-wider uppercase rounded-full border select-none whitespace-nowrap shadow-2xs',
        theme.container,
        theme.text,
        theme.border,
        sizeClasses.wrap,
        className
      )}
    >
      <span
        className={cn('rounded-full shrink-0 shadow-xs border border-white/60', theme.dot, sizeClasses.dot)}
        aria-hidden="true"
      />
      <span>{name}</span>
    </span>
  );
};
