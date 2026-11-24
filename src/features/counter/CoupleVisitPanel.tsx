import React, { useState } from 'react';
import type { CounterCustomerView } from '@/data/selectors/counter';
import { recordCoupleVisit } from '@/services/couple';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, CheckCircle2 } from 'lucide-react';

interface CoupleVisitPanelProps {
  customerView: CounterCustomerView;
  staffId: string;
  bonusPoints: number;
  onSuccess: (pointsGranted: number) => void;
}

export const CoupleVisitPanel: React.FC<CoupleVisitPanelProps> = ({
  customerView,
  staffId,
  bonusPoints,
  onSuccess,
}) => {
  const [bothPresentChecked, setBothPresentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecord = () => {
    if (!bothPresentChecked || !customerView.coupleVisitEligible) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const requestId = crypto.randomUUID();

    setTimeout(() => {
      const res = recordCoupleVisit({
        customerId: customerView.customer.id,
        staffId,
        requestId,
      });

      setLoading(false);

      if (!res.ok) {
        setError(res.error.message);
        return;
      }

      const granted = res.value.coupleVisit.bonusPoints;
      setSuccess(`Couple visit celebrated! +${granted} Trove Points granted to ${customerView.customer.name}.`);
      setBothPresentChecked(false);
      onSuccess(granted);
    }, 150);
  };

  const isEligible = customerView.coupleVisitEligible;

  return (
    <div className="bg-sand-card p-6 border border-sand-subtle shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-sand-subtle pb-3">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-terracotta" />
          <h3 className="font-serif text-lg font-semibold text-charcoal">
            In-Store Couple Visit Bonus
          </h3>
        </div>
        <span className="text-xs font-serif font-bold text-tide">
          +{bonusPoints} pts
        </span>
      </div>

      <p className="text-xs text-charcoal-muted leading-relaxed">
        Celebrate married members visiting our resortwear boutique together with a special companion points bonus.
      </p>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {isEligible ? (
        <div className="space-y-4 pt-1">
          {/* Explicit verification requirement per R5.3 */}
          <div className="flex items-start gap-2.5 p-3 bg-sand border border-sand-subtle select-none">
            <input
              id="couple-present-checkbox"
              type="checkbox"
              checked={bothPresentChecked}
              onChange={(e) => setBothPresentChecked(e.target.checked)}
              className="mt-0.5 rounded-none border-sand-muted text-tide focus:ring-tide h-4 w-4 cursor-pointer"
            />
            <label htmlFor="couple-present-checkbox" className="text-xs leading-normal cursor-pointer">
              <span className="font-semibold text-charcoal block">
                Both partners present in store
              </span>
              <span className="text-charcoal-muted text-[11px]">
                I confirm that {customerView.customer.name} and partner{' '}
                {customerView.customer.spouseFirstName ?? 'spouse'} are shopping together at the counter.
              </span>
            </label>
          </div>

          <Button
            onClick={handleRecord}
            disabled={!bothPresentChecked || loading}
            fullWidth
            className="bg-terracotta text-white hover:bg-terracotta/90"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            {loading ? 'Recording...' : `Award Couple Visit (+${bonusPoints} pts)`}
          </Button>
        </div>
      ) : (
        <div className="p-3 bg-sand border border-sand-subtle text-xs text-charcoal-muted">
          {customerView.coupleVisitIneligibilityReason ??
            'This member is currently not eligible for a couple visit bonus.'}
        </div>
      )}
    </div>
  );
};
