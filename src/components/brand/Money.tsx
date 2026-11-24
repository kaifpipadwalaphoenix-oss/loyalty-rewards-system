import React from 'react';
import { formatRupees } from '@/lib/format';
import { cn } from '@/lib/cn';

interface MoneyProps {
  paise: number;
  className?: string;
}

export const Money: React.FC<MoneyProps> = ({ paise, className }) => {
  return (
    <span className={cn('tabular-nums font-medium', className)}>
      {formatRupees(paise)}
    </span>
  );
};
