import React from 'react';
import { cn } from '@/lib/cn';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  inverse?: boolean;
  className?: string;
}

export const Wordmark: React.FC<WordmarkProps> = ({
  size = 'md',
  inverse = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  const subSizeClasses = {
    sm: 'text-[9px] tracking-[0.25em]',
    md: 'text-[11px] tracking-[0.3em]',
    lg: 'text-[13px] tracking-[0.32em]',
    xl: 'text-[15px] tracking-[0.35em]',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1.5 select-none font-normal',
        inverse ? 'text-white' : 'text-neutral-900',
        className
      )}
      aria-label="Trove Club"
    >
      <span className={cn('font-serif italic lowercase tracking-tight', sizeClasses)}>
        trove
      </span>
      <span
        className={cn(
          'font-sans uppercase font-medium',
          inverse ? 'text-blush-200' : 'text-neutral-600',
          subSizeClasses
        )}
      >
        club
      </span>
    </span>
  );
};
