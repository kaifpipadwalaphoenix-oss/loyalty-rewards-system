import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * Pure helper to parse string rupee input into integer paise without floating point errors.
 * e.g. "4,990.50" -> 499050, "500" -> 50000.
 */
export function parseRupeesToPaise(input: string): number | null {
  if (!input || typeof input !== 'string') return null;
  const cleaned = input.trim().replace(/,/g, '');
  if (!cleaned) return null;

  // Reject negative or invalid chars
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }

  const [rupeesStr, paiseStr = ''] = cleaned.split('.');
  if (!rupeesStr) return null;

  const rupees = parseInt(rupeesStr, 10);
  if (isNaN(rupees) || rupees < 0 || rupees > 10000000) {
    return null; // Sanity cap ₹1,00,00,000
  }

  const paddedPaise = (paiseStr + '00').slice(0, 2);
  const fraction = parseInt(paddedPaise, 10);

  return rupees * 100 + fraction;
}

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  valuePaise?: number;
  amountPaise?: number;
  onChangePaise?: (paise: number) => void;
  hasError?: boolean;
  label?: string;
  helperText?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ valuePaise, amountPaise, onChangePaise, hasError = false, label, helperText, className, disabled, id, ...props }, ref) => {
    const effectivePaise = amountPaise ?? valuePaise;

    const formatFromPaise = React.useCallback((p?: number) => {
      if (p === undefined || p === null) return '';
      const r = Math.floor(p / 100);
      const remainder = p % 100;
      return remainder > 0 ? `${r}.${remainder.toString().padStart(2, '0')}` : `${r}`;
    }, []);

    const [rawText, setRawText] = React.useState<string>(() => formatFromPaise(effectivePaise));

    React.useEffect(() => {
      const parsedCurrent = parseRupeesToPaise(rawText);
      if (effectivePaise !== undefined && parsedCurrent !== effectivePaise) {
        setRawText(formatFromPaise(effectivePaise));
      }
    }, [effectivePaise, formatFromPaise, rawText]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^\d.]/g, '');
      const parts = val.split('.');
      let sanitized = parts[0] || '';
      if (parts.length > 1) {
        sanitized += '.' + (parts[1]?.slice(0, 2) || '');
      }
      setRawText(sanitized);

      const parsed = parseRupeesToPaise(sanitized);
      if (parsed !== null) {
        onChangePaise?.(parsed);
      } else if (sanitized === '') {
        onChangePaise?.(0);
      }
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
          ₹
        </span>
        <input
          id={id}
          ref={ref}
          type="text"
          inputMode="decimal"
          disabled={disabled}
          value={rawText}
          onChange={handleChange}
          placeholder="0"
          className="flex-1 h-full px-3 text-base font-sans text-ink-900 bg-transparent placeholder:text-ink-300 focus:outline-none tabular-nums"
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
CurrencyInput.displayName = 'CurrencyInput';
