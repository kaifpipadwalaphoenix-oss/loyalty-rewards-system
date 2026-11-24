import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

interface FieldProps {
  id?: string;
  label?: string;
  optional?: boolean;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  id,
  label,
  optional = false,
  required = false,
  helperText,
  error,
  className,
  children,
}) => {
  const errorId = id && error ? `${id}-error` : undefined;
  const helperId = id && helperText && !error ? `${id}-helper` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="text-xs md:text-sm font-sans font-medium text-ink-900 select-none"
          >
            {label}
            {required && <span className="text-[#b42318] ml-0.5">*</span>}
            {optional && !required && (
              <span className="ml-1 text-ink-500 font-normal text-xs">(optional)</span>
            )}
          </label>
        </div>
      )}

      {children}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-[#b42318] font-sans mt-0.5"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-ink-500 font-sans mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
