import * as React from 'react';
import { cn } from '@/lib/cn';

export interface KpiItemProps {
  label: string;
  value: React.ReactNode;
  context?: string;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
  className?: string;
}

export const KpiItem: React.FC<KpiItemProps> = ({
  label,
  value,
  context,
  onClick,
  className,
}) => {
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
        'p-4 md:p-5 flex flex-col justify-between transition-colors',
        onClick && 'cursor-pointer hover:bg-sand-50 focus-visible:ring-2 focus-visible:ring-tide-800 focus-visible:outline-none',
        className
      )}
    >
      <span className="text-[11px] md:text-xs font-sans font-semibold uppercase tracking-[0.14em] text-ink-500 mb-1">
        {label}
      </span>
      <div className="font-serif text-2xl md:text-3xl lg:text-4xl font-normal text-ink-900 tracking-tight my-1 tabular-nums">
        {value}
      </div>
      {context && (
        <span className="text-xs font-sans text-ink-500 truncate mt-0.5">
          {context}
        </span>
      )}
    </div>
  );
};

export interface KpiBandProps {
  columns?: 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

export const KpiBand: React.FC<KpiBandProps> = ({ columns = 6, children, className }) => {
  const colClass = {
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  }[columns];

  return (
    <div
      className={cn(
        'grid bg-white border border-sand-200 divide-y sm:divide-y-0 sm:divide-x divide-sand-200 shadow-none',
        colClass,
        className
      )}
    >
      {children}
    </div>
  );
};
