import React from 'react';
import { cn } from '@/lib/cn';
import type { Tier } from '@/domain/types';

export type TierAccent = 'shore' | 'tide' | 'golden' | 'endless';

interface TierChipProps {
  tier?: Tier;
  tierName?: string;
  accent?: TierAccent;
  size?: 'sm' | 'md';
  className?: string;
}

export const TierChip: React.FC<TierChipProps> = ({
  tier,
  tierName,
  accent,
  size = 'md',
  className,
}) => {
  const name = tier?.name ?? tierName ?? 'Shore';
  const resolvedAccent: TierAccent =
    accent ??
    (name.toLowerCase().includes('endless')
      ? 'endless'
      : name.toLowerCase().includes('golden')
      ? 'golden'
      : name.toLowerCase().includes('tide')
      ? 'tide'
      : 'shore');

  const accentClasses: Record<TierAccent, string> = {
    shore: 'bg-blush-200 text-charcoal border border-blush-200/60',
    tide: 'bg-tide text-white font-semibold',
    golden: 'bg-sun-400 text-charcoal font-semibold',
    endless: 'bg-charcoal text-white font-semibold',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider uppercase font-semibold',
    md: 'text-xs px-2.5 py-1 tracking-wider uppercase font-semibold',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-sans select-none whitespace-nowrap rounded-none',
        accentClasses[resolvedAccent],
        sizeClasses,
        className
      )}
    >
      {name}
    </span>
  );
};
