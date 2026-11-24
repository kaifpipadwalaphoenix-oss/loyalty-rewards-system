import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'We encountered an unexpected issue. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 bg-white border border-[#f7c2be]',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#fdecea] flex items-center justify-center text-[#b42318] mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-xl md:text-2xl font-normal text-ink-900 mb-2">
        {title}
      </h3>
      <p className="font-sans text-sm text-ink-500 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
