import * as React from 'react';
import { cn } from '@/lib/cn';

interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  action,
  className,
  children,
  ...props
}) => {
  return (
    <section className={cn('space-y-4 md:space-y-6', className)} {...props}>
      {(title || action) && (
        <div className="flex items-end justify-between gap-4">
          <div>
            {title && (
              <h2 className="font-serif text-xl md:text-2xl font-normal text-ink-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs md:text-sm font-sans text-ink-500 mt-1">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
};
