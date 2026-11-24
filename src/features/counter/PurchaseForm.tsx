import React, { useState } from 'react';
import type { AppData } from '@/domain/types';
import type { CounterCustomerView } from '@/data/selectors/counter';
import { selectEarnPreview, type EarnPreview } from '@/data/selectors/earning';
import { recordPurchase, type RecordPurchaseResult } from '@/services/purchases';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/button';
import { ShoppingBag, AlertCircle } from 'lucide-react';

interface PurchaseFormProps {
  customerView: CounterCustomerView;
  staffId: string;
  appData: AppData;
  onPurchaseSuccess: (result: RecordPurchaseResult, preview: EarnPreview | null) => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  customerView,
  staffId,
  appData,
  onPurchaseSuccess,
}) => {
  const [purchasePaise, setPurchasePaise] = useState(0);
  const [billNo, setBillNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live calculation from R1.2 single earning selector
  const preview = selectEarnPreview(appData, customerView.customer.id, purchasePaise);

  const handleAmountChange = (paise: number) => {
    setPurchasePaise(paise);
    if (error) setError(null);
  };

  const handleBillChange = (val: string) => {
    setBillNo(val);
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billNo.trim() || purchasePaise <= 0) {
      setError('Please enter bill number and positive amount');
      return;
    }

    setLoading(true);
    setError(null);

    const requestId = crypto.randomUUID();

    setTimeout(() => {
      const res = recordPurchase({
        customerId: customerView.customer.id,
        billNo: billNo.trim(),
        amountPaise: purchasePaise,
        staffId,
        channel: 'store',
        requestId,
      });

      setLoading(false);

      if (!res.ok) {
        setError(res.error.message);
        return;
      }

      onPurchaseSuccess(res.value, preview);
    }, 150);
  };

  const minPurchasePaise = appData.config.earning.minPurchasePaise;
  const isBelowMin = purchasePaise > 0 && purchasePaise < minPurchasePaise;

  return (
    <div className="bg-sand-card p-6 border border-sand-subtle shadow-2xs space-y-5">
      <div className="flex items-center gap-2 border-b border-sand-subtle pb-3">
        <ShoppingBag className="w-5 h-5 text-tide" />
        <h3 className="font-serif text-lg font-semibold text-charcoal">
          Record Store Purchase
        </h3>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in duration-100">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Amount First (Autofocus per R5.1) */}
        <CurrencyInput
          label="Total Bill Amount (INR)"
          amountPaise={purchasePaise}
          onChangePaise={handleAmountChange}
          required
          autoFocus
          helperText={`Minimum ₹${Math.round(minPurchasePaise / 100)} required for points eligibility.`}
        />

        {/* Step 2: Store Bill Number */}
        <Field label="Store Bill / Invoice Number" required>
          <input
            type="text"
            value={billNo}
            onChange={(e) => handleBillChange(e.target.value)}
            placeholder="e.g. 4109"
            className="w-full px-3 py-2 bg-sand border border-sand-subtle focus:border-tide focus:outline-hidden text-sm text-charcoal font-mono"
            required
          />
        </Field>

        {/* Live Earning Breakdown from Domain Selector */}
        {preview && purchasePaise > 0 && (
          <div className="p-3.5 bg-sand border border-sand-subtle space-y-2 text-xs animate-in fade-in duration-100">
            {isBelowMin ? (
              <p className="text-amber-800 text-[11px] font-medium">
                Bill is below minimum threshold of ₹{Math.round(minPurchasePaise / 100)}. No points will be awarded.
              </p>
            ) : (
              <>
                <div className="flex justify-between text-charcoal-muted">
                  <span>Base Points ({preview.rateLabel}):</span>
                  <span className="font-medium text-charcoal">+{preview.basePoints} pts</span>
                </div>
                {preview.tierBonus > 0 && (
                  <div className="flex justify-between text-charcoal-muted">
                    <span>
                      {preview.tierName} Bonus (+{preview.tierPct}%):
                    </span>
                    <span className="font-medium text-charcoal">+{preview.tierBonus} pts</span>
                  </div>
                )}
                {preview.campaignBonus > 0 && (
                  <div className="flex justify-between text-charcoal-muted">
                    <span>{preview.campaignName ?? 'Promotion Bonus'}:</span>
                    <span className="font-medium text-charcoal">+{preview.campaignBonus} pts</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-sand-subtle pt-2 font-semibold text-tide">
                  <span>Total Points to Award:</span>
                  <span className="font-serif font-bold text-sm">
                    +{preview.totalPoints.toLocaleString('en-IN')} pts
                  </span>
                </div>
                <div className="flex justify-between text-charcoal-muted text-[11px] pt-0.5">
                  <span>New Balance After Bill:</span>
                  <span className="font-semibold text-charcoal">
                    {preview.newBalance.toLocaleString('en-IN')} pts
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          disabled={!billNo.trim() || purchasePaise <= 0 || loading}
        >
          {loading ? 'Recording...' : 'Record Purchase & Issue Points'}
        </Button>
      </form>
    </div>
  );
};
