import * as React from 'react';
import { cn } from '@/lib/cn';

interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  action,
  noPadding = false,
  className,
  children,
  ...props
}) => {
  const hasHeader = Boolean(title || action);

  return (
    <div
      className={cn('bg-white border border-sand-200 rounded-none shadow-none', className)}
      {...props}
    >
      {hasHeader && (
        <div className="flex items-center justify-between px-4 py-3.5 md:px-6 md:py-4 border-b border-sand-200">
          <div>
            {title && (
              <h3 className="font-serif text-lg md:text-xl font-normal text-ink-900 leading-snug">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-ink-500 font-sans mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0 ml-4">{action}</div>}
        </div>
      )}
      <div className={cn(!noPadding && 'p-4 md:p-6')}>{children}</div>
    </div>
  );
};
