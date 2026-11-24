import React from 'react';
import type { CounterCustomerView } from '@/data/selectors/counter';
import { TierChip } from '@/components/brand/TierChip';
import { Heart, X } from 'lucide-react';

interface MemberPanelProps {
  customerView: CounterCustomerView;
  onDeselect: () => void;
}

export const MemberPanel: React.FC<MemberPanelProps> = ({
  customerView,
  onDeselect,
}) => {
  return (
    <div className="p-4 bg-sand border border-sand-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-150">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-xl font-bold text-charcoal">
            {customerView.customer.name}
          </h2>
          <TierChip tier={customerView.tier} size="sm" />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted">
          <span className="font-mono">{customerView.customer.mobile}</span>
          <span>·</span>
          <span className="font-mono">{customerView.customer.memberNo}</span>
          {customerView.customer.spouseFirstName && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1 text-tide">
                <Heart className="w-3 h-3 text-terracotta" />
                Partner: {customerView.customer.spouseFirstName}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-sand-subtle pt-3 md:pt-0 md:pl-4">
        <div className="text-left md:text-right">
          <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block">
            Available Balance
          </span>
          <span className="font-serif text-2xl font-bold text-tide block leading-tight">
            {customerView.balance.toLocaleString('en-IN')}{' '}
            <span className="text-xs text-charcoal-muted font-normal">pts</span>
          </span>
        </div>

        <button
          onClick={onDeselect}
          className="p-1.5 text-charcoal-muted hover:text-charcoal hover:bg-sand-card transition-colors"
          title="Deselect customer"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
