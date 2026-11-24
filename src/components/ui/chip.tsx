import * as React from 'react';
import { cn } from '@/lib/cn';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Chip: React.FC<ChipProps> = ({
  className,
  variant = 'neutral',
  size = 'sm',
  children,
  ...props
}) => {
  const variantClasses = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-tide/10 text-tide border-tide/20',
    neutral: 'bg-sand text-charcoal-muted border-sand-subtle',
  }[variant];

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-medium tracking-wider uppercase',
    md: 'text-xs px-2.5 py-1 font-medium tracking-wider uppercase',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center border font-sans select-none whitespace-nowrap rounded-none',
        variantClasses,
        sizeClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
