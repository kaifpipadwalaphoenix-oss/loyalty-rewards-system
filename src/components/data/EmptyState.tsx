import * as React from 'react';
import { WaveLine } from '@/components/brand/WaveLine';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 bg-white border border-sand-200',
        className
      )}
    >
      <div className="mb-4 text-coral-600">
        {icon || <WaveLine className="w-20 h-4 opacity-70" />}
      </div>
      <h3 className="font-serif text-xl md:text-2xl font-normal text-ink-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="font-sans text-sm text-ink-500 max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
