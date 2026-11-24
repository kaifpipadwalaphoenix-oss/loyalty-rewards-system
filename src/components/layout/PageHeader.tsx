import * as React from 'react';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 md:pb-8 border-b border-sand-200',
        className
      )}
    >
      <div className="space-y-1">
        {eyebrow && (
          <span className="block text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-500">
            {eyebrow}
          </span>
        )}
        <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-normal text-ink-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm md:text-base font-sans text-ink-500 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
};
