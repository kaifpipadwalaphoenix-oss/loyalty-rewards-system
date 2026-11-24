import React from 'react';
import type { Purchase, PointsTransaction } from '@/domain/types';
import type { EarnPreview } from '@/data/selectors/earning';
import type { CounterCustomerView } from '@/data/selectors/counter';
import { TierChip } from '@/components/brand/TierChip';
import { Button } from '@/components/ui/button';
import { CheckCircle2, UserCheck, ArrowRight, RotateCcw } from 'lucide-react';

interface ReceiptPanelProps {
  purchase: Purchase;
  transaction?: PointsTransaction;
  preview: EarnPreview | null;
  customerView: CounterCustomerView;
  onNextCustomer: () => void;
  onRecordAnother: () => void;
}

export const ReceiptPanel: React.FC<ReceiptPanelProps> = ({
  purchase,
  transaction,
  preview,
  customerView,
  onNextCustomer,
  onRecordAnother,
}) => {
  const pointsEarned = transaction?.points ?? 0;
  const billAmountRupees = Math.round(purchase.amountPaise / 100);

  return (
    <div className="bg-sand-card p-6 border-2 border-emerald-600/30 shadow-md space-y-6 animate-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-sand-subtle pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 block">
              Purchase Recorded Successfully
            </span>
            <h3 className="font-serif text-xl font-bold text-charcoal">
              Store Bill #{purchase.billNo}
            </h3>
          </div>
        </div>
        <TierChip tier={customerView.tier} size="sm" />
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-sand border border-sand-subtle text-xs">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-charcoal-muted block">
            Member
          </span>
          <span className="font-semibold text-charcoal block mt-0.5">
            {customerView.customer.name}
          </span>
          <span className="font-mono text-charcoal-muted text-[11px]">
            {customerView.customer.memberNo}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-charcoal-muted block">
            Bill Amount
          </span>
          <span className="font-serif text-lg font-bold text-charcoal block mt-0.5">
            ₹{billAmountRupees.toLocaleString('en-IN')}
          </span>
          <span className="text-charcoal-muted text-[10px]">In-store purchase</span>
        </div>

        <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-sand-subtle pt-2 sm:pt-0 sm:pl-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
            Points Awarded
          </span>
          <span className="font-serif text-2xl font-bold text-emerald-700 block leading-tight">
            +{pointsEarned.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal">pts</span>
          </span>
          <span className="text-charcoal-muted text-[10px]">
            New Balance:{' '}
            <strong className="text-charcoal font-semibold">
              {(customerView.balance).toLocaleString('en-IN')} pts
            </strong>
          </span>
        </div>
      </div>

      {/* Breakdown if preview exists */}
      {preview && preview.totalPoints > 0 && (
        <div className="p-3 bg-sand-card border border-sand-subtle space-y-1.5 text-xs text-charcoal-muted">
          <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal block mb-1">
            Points Breakdown
          </span>
          <div className="flex justify-between">
            <span>Base points ({preview.rateLabel}):</span>
            <span className="font-medium text-charcoal">+{preview.basePoints} pts</span>
          </div>
          {preview.tierBonus > 0 && (
            <div className="flex justify-between">
              <span>{preview.tierName} bonus (+{preview.tierPct}%):</span>
              <span className="font-medium text-charcoal">+{preview.tierBonus} pts</span>
            </div>
          )}
          {preview.campaignBonus > 0 && (
            <div className="flex justify-between">
              <span>{preview.campaignName ?? 'Promotion bonus'}:</span>
              <span className="font-medium text-charcoal">+{preview.campaignBonus} pts</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={onNextCustomer}
          fullWidth
          className="bg-charcoal text-white hover:bg-charcoal/90"
          type="button"
        >
          <UserCheck className="w-4 h-4 mr-1.5" />
          Next Customer (Clear &amp; Search)
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
        <Button
          onClick={onRecordAnother}
          variant="outline"
          fullWidth
          type="button"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Another Bill for this Member
        </Button>
      </div>
    </div>
  );
};
