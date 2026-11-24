import * as React from 'react';
import { cn } from '@/lib/cn';

export interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  id?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value = '',
  onChange,
  onComplete,
  hasError = false,
  disabled = false,
  autoFocus = false,
  className,
  id = 'otp-input',
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  const cleanValue = value.replace(/\D/g, '').slice(0, length);
  const digits = cleanValue.split('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, length);
    onChange?.(raw);
    if (raw.length === length) {
      onComplete?.(raw);
    }
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center gap-2 sm:gap-3', className)}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d*"
        maxLength={length}
        value={cleanValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={`${length}-digit verification code`}
        className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10 disabled:cursor-not-allowed"
      />

      {Array.from({ length }, (_, i) => {
        const digit = digits[i] || '';
        const isCellFocused = isFocused && (cleanValue.length === i || (cleanValue.length === length && i === length - 1));

        return (
          <div
            key={i}
            data-testid={`otp-cell-${i}`}
            className={cn(
              'w-11 h-13 sm:w-12 sm:h-14 flex items-center justify-center font-mono text-xl sm:text-2xl font-bold border transition-all select-none',
              'bg-white text-ink-900 border-sand-subtle shadow-2xs',
              isCellFocused && 'border-tide ring-2 ring-tide/20 shadow-xs scale-102',
              hasError && 'border-coral-600 text-coral-600 ring-2 ring-coral-600/20',
              disabled && 'bg-sand-subtle/50 text-charcoal-muted opacity-60 cursor-not-allowed'
            )}
          >
            {digit}
            {isCellFocused && !digit && (
              <span className="inline-block w-0.5 h-6 bg-tide animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
};
