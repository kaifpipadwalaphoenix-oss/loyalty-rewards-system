import React from 'react';
import { cn } from '@/lib/cn';

interface WaveLineProps {
  className?: string;
  strokeWidth?: number;
}

export const WaveLine: React.FC<WaveLineProps> = ({ className, strokeWidth = 1.5 }) => {
  return (
    <svg
      viewBox="0 0 120 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('w-24 h-3 shrink-0 text-current opacity-70', className)}
      aria-hidden="true"
    >
      <path d="M2 8c12-8 18-8 30 0s18 8 30 0 18-8 30 0 16 8 26 0" />
    </svg>
  );
};
