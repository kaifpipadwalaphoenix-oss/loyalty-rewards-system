import React from 'react';
import { cn } from '@/lib/cn';
import { RewardImage } from './RewardImage';
import { formatPoints } from '@/lib/format';

export interface RewardCardProps {
  id: string;
  name: string;
  pointsCost: number;
  valueSummary?: string;
  imageSrc?: string;
  imageAlt?: string;
  eligibilityStatus?: 'eligible' | 'points_short' | 'tier_locked' | 'out_of_stock' | 'ended';
  eligibilityText?: string;
  onClick?: () => void;
  className?: string;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  name,
  pointsCost,
  valueSummary,
  imageSrc,
  imageAlt,
  eligibilityStatus = 'eligible',
  eligibilityText,
  onClick,
  className,
}) => {
  const chipStyles = {
    eligible: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    points_short: 'bg-sand-100 text-ink-700 border-sand-200',
    tier_locked: 'bg-blush-100 text-tide-800 border-blush-200',
    out_of_stock: 'bg-neutral-100 text-neutral-500 border-neutral-200',
    ended: 'bg-neutral-100 text-neutral-400 border-neutral-200',
  }[eligibilityStatus];

  const defaultChipText = {
    eligible: 'You can redeem',
    points_short: 'More points needed',
    tier_locked: 'Higher tier privilege',
    out_of_stock: 'Fully redeemed',
    ended: 'Reward ended',
  }[eligibilityStatus];

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
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
        'group flex flex-col bg-white border border-sand-200 text-left transition-all duration-200 overflow-hidden',
        onClick && 'cursor-pointer hover:border-ink-400 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-tide-800',
        className
      )}
    >
      <div className="relative">
        <RewardImage src={imageSrc} alt={imageAlt || name} aspectRatio="3/4" />
        <div className="absolute top-3 left-3 z-10">
          <span
            className={cn(
              'inline-block px-2.5 py-1 text-[11px] font-sans font-medium uppercase tracking-wider border rounded-full backdrop-blur-sm',
              chipStyles
            )}
          >
            {eligibilityText || defaultChipText}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg md:text-xl font-normal text-ink-900 group-hover:text-tide-800 transition-colors line-clamp-1">
            {name}
          </h3>
          {valueSummary && (
            <p className="font-sans text-xs text-ink-500 mt-1 line-clamp-2 leading-relaxed">
              {valueSummary}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-sand-100 flex items-baseline justify-between">
          <span className="font-sans text-xs uppercase tracking-wider text-ink-500">Cost</span>
          <span className="font-sans text-base font-semibold tabular-nums text-ink-900">
            {formatPoints(pointsCost)}
          </span>
        </div>
      </div>
    </div>
  );
};
