import * as React from 'react';
import { cn } from '@/lib/cn';

export interface DayMonthValue {
  day?: number;
  month?: number;
}

export interface DayMonthPickerProps {
  value?: DayMonthValue;
  day?: number;
  month?: number;
  onChange?: (val: DayMonthValue) => void;
  hasError?: boolean;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  className?: string;
  id?: string;
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export function getMaxDaysInMonth(month?: number): number {
  if (!month) return 31;
  if (month === 2) return 29; // Allows leap year birthdays
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

export const DayMonthPicker: React.FC<DayMonthPickerProps> = ({
  value = {},
  day,
  month,
  onChange,
  hasError = false,
  disabled = false,
  label,
  helperText,
  className,
  id,
}) => {
  const effectiveValue: DayMonthValue = {
    day: day !== undefined ? day : value.day,
    month: month !== undefined ? month : value.month,
  };

  const maxDays = getMaxDaysInMonth(effectiveValue.month);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value ? parseInt(e.target.value, 10) : undefined;
    const newMaxDays = getMaxDaysInMonth(newMonth);
    let newDay = effectiveValue.day;
    if (newDay && newDay > newMaxDays) {
      newDay = newMaxDays;
    }
    onChange?.({ day: newDay, month: newMonth });
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = e.target.value ? parseInt(e.target.value, 10) : undefined;
    onChange?.({ ...effectiveValue, day: newDay });
  };

  const dayOptions = Array.from({ length: maxDays }, (_, i) => i + 1);

  const pickerNode = (
    <div className={cn('grid grid-cols-2 gap-3 w-full', className)}>
      {/* Month Selector */}
      <div className="relative">
        <select
          id={id ? `${id}-month` : undefined}
          disabled={disabled}
          value={effectiveValue.month ?? ''}
          onChange={handleMonthChange}
          aria-label="Month"
          className={cn(
            'w-full h-12 px-3 text-base font-sans text-ink-900 bg-white border rounded-none transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-tide-800 focus:ring-offset-1',
            hasError ? 'border-[#b42318]' : 'border-ink-400 focus:border-tide-800',
            disabled && 'opacity-50 cursor-not-allowed bg-sand-100'
          )}
        >
          <option value="">Month</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-500">
          &#9662;
        </span>
      </div>

      {/* Day Selector */}
      <div className="relative">
        <select
          id={id ? `${id}-day` : undefined}
          disabled={disabled}
          value={effectiveValue.day ?? ''}
          onChange={handleDayChange}
          aria-label="Day"
          className={cn(
            'w-full h-12 px-3 text-base font-sans text-ink-900 bg-white border rounded-none transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-tide-800 focus:ring-offset-1',
            hasError ? 'border-[#b42318]' : 'border-ink-400 focus:border-tide-800',
            disabled && 'opacity-50 cursor-not-allowed bg-sand-100'
          )}
        >
          <option value="">Day</option>
          {dayOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-500">
          &#9662;
        </span>
      </div>
    </div>
  );

  if (label) {
    return (
      <div className="space-y-1.5 w-full">
        <label className="block text-xs font-medium text-charcoal tracking-wide">
          {label}
        </label>
        {pickerNode}
        {helperText && <p className="text-[11px] text-charcoal-muted">{helperText}</p>}
      </div>
    );
  }

  return pickerNode;
};
