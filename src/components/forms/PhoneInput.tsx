import * as React from 'react';
import { cn } from '@/lib/cn';

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  hasError?: boolean;
  label?: string;
  helperText?: string;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, hasError = false, label, helperText, className, disabled, id, ...props }, ref) => {
    // Extract 10 digits
    const digitsOnly = (value || '').replace(/\D/g, '');
    const cleanDigits = digitsOnly.startsWith('91') && digitsOnly.length === 12
      ? digitsOnly.slice(2)
      : digitsOnly.slice(0, 10);

    // Format for display: "98765 43210"
    const displayValue = cleanDigits.length > 5
      ? `${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`
      : cleanDigits;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
      onChange?.(raw);
    };

    const inputNode = (
      <div
        className={cn(
          'flex items-center h-12 w-full border bg-white rounded-none transition-colors focus-within:ring-2 focus-within:ring-tide-800 focus-within:ring-offset-1',
          hasError ? 'border-[#b42318]' : 'border-ink-400 focus-within:border-tide-800',
          disabled && 'opacity-50 cursor-not-allowed bg-sand-100',
          className
        )}
      >
        <span className="h-full flex items-center px-3.5 bg-sand-100 text-ink-700 font-sans text-sm font-medium border-r border-sand-200 select-none">
          +91
        </span>
        <input
          id={id}
          ref={ref}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          placeholder="98765 43210"
          className="flex-1 h-full px-3 text-base font-sans text-ink-900 bg-transparent placeholder:text-ink-300 focus:outline-none"
          {...props}
        />
      </div>
    );

    if (label) {
      return (
        <div className="space-y-1.5 w-full">
          <label htmlFor={id} className="block text-xs font-medium text-charcoal tracking-wide">
            {label}
            {props.required && <span className="text-terracotta ml-0.5">*</span>}
          </label>
          {inputNode}
          {helperText && <p className="text-[11px] text-charcoal-muted">{helperText}</p>}
        </div>
      );
    }

    return inputNode;
  }
);
PhoneInput.displayName = 'PhoneInput';
