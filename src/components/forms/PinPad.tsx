import * as React from 'react';
import { Delete, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface PinPadProps {
  value?: string;
  length?: number;
  onChange?: (val: string) => void;
  onComplete?: (val: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
}

export const PinPad: React.FC<PinPadProps> = ({
  value = '',
  length = 4,
  onChange,
  onComplete,
  hasError = false,
  disabled = false,
  className,
}) => {
  const handleDigit = React.useCallback(
    (d: string) => {
      if (disabled || value.length >= length) return;
      const next = value + d;
      onChange?.(next);
      if (next.length === length) {
        onComplete?.(next);
      }
    },
    [disabled, value, length, onChange, onComplete]
  );

  const handleBackspace = React.useCallback(() => {
    if (disabled || value.length === 0) return;
    onChange?.(value.slice(0, -1));
  }, [disabled, value, onChange]);

  const handleClear = React.useCallback(() => {
    if (disabled) return;
    onChange?.('');
  }, [disabled, onChange]);

  // Allow keyboard entry
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, handleDigit, handleBackspace, handleClear]);

  return (
    <div className={cn('flex flex-col items-center gap-6 max-w-[280px] mx-auto', className)}>
      {/* PIN visual indicator */}
      <div role="group" aria-label="PIN Entry" className="flex items-center justify-center gap-4 py-2">
        {Array.from({ length }, (_, idx) => {
          const filled = idx < value.length;
          return (
            <div
              key={idx}
              className={cn(
                'w-4 h-4 rounded-full border-2 transition-all duration-150',
                filled
                  ? hasError
                    ? 'bg-[#b42318] border-[#b42318] scale-110'
                    : 'bg-tide-800 border-tide-800 scale-110'
                  : 'bg-sand-100 border-ink-400'
              )}
            />
          );
        })}
      </div>

      {/* Grid of keys */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={disabled || value.length >= length}
            onClick={() => handleDigit(digit)}
            className="h-14 min-h-[56px] text-xl font-serif font-normal bg-white border border-sand-200 text-ink-900 rounded-none hover:bg-sand-100 active:bg-blush-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tide-800 disabled:opacity-40"
          >
            {digit}
          </button>
        ))}

        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={handleClear}
          aria-label="Clear PIN"
          className="h-14 min-h-[56px] flex items-center justify-center text-xs uppercase font-sans tracking-wider font-semibold bg-sand-100 border border-sand-200 text-ink-700 hover:bg-sand-200 active:bg-sand-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tide-800 disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          type="button"
          disabled={disabled || value.length >= 4}
          onClick={() => handleDigit('0')}
          className="h-14 min-h-[56px] text-xl font-serif font-normal bg-white border border-sand-200 text-ink-900 rounded-none hover:bg-sand-100 active:bg-blush-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tide-800 disabled:opacity-40"
        >
          0
        </button>

        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={handleBackspace}
          aria-label="Backspace"
          className="h-14 min-h-[56px] flex items-center justify-center bg-sand-100 border border-sand-200 text-ink-700 hover:bg-sand-200 active:bg-sand-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tide-800 disabled:opacity-40"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
