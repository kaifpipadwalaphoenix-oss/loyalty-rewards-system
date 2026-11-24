import React, { useState } from 'react';
import type { AppData } from '@/domain/types';
import type { CounterCustomerView } from '@/data/selectors/counter';
import { verifyCode, markVoucherUsed, type VerifyCodeResult } from '@/services/redemptions';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/button';
import { Ticket, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface VoucherPanelProps {
  customerView: CounterCustomerView;
  appData: AppData;
  staffId: string;
  billNo?: string;
  billAmountPaise?: number;
  onSwitchCustomer: (customerId: string) => void;
  onRedeemSuccess: (message: string) => void;
}

export const VoucherPanel: React.FC<VoucherPanelProps> = ({
  customerView,
  appData,
  staffId,
  billNo,
  billAmountPaise,
  onSwitchCustomer,
  onRedeemSuccess,
}) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<VerifyCodeResult | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    setSuccessBanner(null);
    const res = verifyCode(voucherCode.trim(), appData);
    setVerifyResult(res);
  };

  const isOwnerMismatch =
    verifyResult?.voucher &&
    verifyResult.voucher.customerId !== customerView.customer.id;

  const minPurchasePaise = verifyResult?.reward?.minPurchasePaise;
  const isBelowMinBill =
    minPurchasePaise !== undefined &&
    billAmountPaise !== undefined &&
    billAmountPaise > 0 &&
    billAmountPaise < minPurchasePaise;

  const handleRedeem = () => {
    if (!verifyResult?.voucher || isOwnerMismatch || isBelowMinBill) return;
    setRedeemLoading(true);

    const requestId = crypto.randomUUID();

    setTimeout(() => {
      const res = markVoucherUsed({
        voucherCode: verifyResult.voucher!.code,
        staffId,
        billNo: billNo?.trim() || undefined,
        billAmountPaise,
        requestId,
      });

      setRedeemLoading(false);

      if (!res.ok) {
        setVerifyResult({
          ...verifyResult,
          valid: false,
          message: res.error.message,
        });
        return;
      }

      const msg = `Voucher ${res.value.code} applied successfully! (Redeemed for ${customerView.customer.name})`;
      setSuccessBanner(msg);
      setVoucherCode('');
      setVerifyResult(null);
      onRedeemSuccess(msg);
    }, 150);
  };

  return (
    <div className="bg-sand-card p-6 border border-sand-subtle shadow-2xs space-y-5">
      <div className="flex items-center gap-2 border-b border-sand-subtle pb-3">
        <Ticket className="w-5 h-5 text-tide" />
        <h3 className="font-serif text-lg font-semibold text-charcoal">
          Redeem Reward Voucher
        </h3>
      </div>

      {successBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Quick Active Voucher Selector (if customer already has active vouchers) */}
      {customerView.activeVouchers.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted block">
            Active Vouchers on Member Account ({customerView.activeVouchers.length})
          </span>
          <div className="space-y-1.5">
            {customerView.activeVouchers.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setVoucherCode(v.code);
                  setSuccessBanner(null);
                  const res = verifyCode(v.code, appData);
                  setVerifyResult(res);
                }}
                className="w-full text-left p-2.5 bg-sand hover:bg-sand-subtle/50 border border-sand-subtle flex items-center justify-between text-xs cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-semibold text-charcoal block">{v.title}</span>
                  <span className="font-mono text-charcoal-muted">{v.code}</span>
                </div>
                <span className="text-tide font-semibold">Select &rarr;</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <Field label="Voucher Code" helperText="Format TC-XXXX-XXXX">
          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => {
                setVoucherCode(e.target.value.toUpperCase());
                if (verifyResult) setVerifyResult(null);
              }}
              placeholder="TC-XXXX-XXXX"
              className="flex-1 px-3 py-2 bg-sand border border-sand-subtle focus:border-tide focus:outline-hidden text-sm text-charcoal font-mono uppercase"
            />
            <Button type="submit" variant="secondary" disabled={!voucherCode.trim()}>
              Verify
            </Button>
          </div>
        </Field>
      </form>

      {/* Verification Result Card */}
      {verifyResult && (
        <div
          className={`p-4 border text-xs space-y-3 animate-in fade-in duration-100 ${
            verifyResult.valid && !isOwnerMismatch && !isBelowMinBill
              ? 'bg-emerald-50/50 border-emerald-200 text-charcoal'
              : 'bg-rose-50/50 border-rose-200 text-charcoal'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm">
              {verifyResult.voucher?.title ?? 'Voucher Verification'}
            </span>
            <span
              className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 border ${
                verifyResult.valid && !isOwnerMismatch && !isBelowMinBill
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}
            >
              {isOwnerMismatch ? 'Owner Mismatch' : verifyResult.status}
            </span>
          </div>

          <p className="text-xs text-charcoal-muted">{verifyResult.message}</p>

          {/* TC-021 Ownership Check Warning */}
          {isOwnerMismatch && verifyResult.customer && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Ownership Mismatch:</strong> This voucher belongs to{' '}
                  <span className="font-semibold">{verifyResult.customer.name}</span> (
                  <span className="font-mono">{verifyResult.customer.memberNo}</span>), not the
                  currently selected customer.
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => onSwitchCustomer(verifyResult.customer!.id)}
                className="bg-white text-xs border-amber-300 hover:bg-amber-100/50"
              >
                Switch to {verifyResult.customer.name}
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}

          {/* TC-021 Minimum Bill Condition Warning */}
          {isBelowMinBill && minPurchasePaise && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
              <strong>Minimum Bill Required:</strong> This voucher requires a minimum purchase of ₹
              {Math.round(minPurchasePaise / 100).toLocaleString('en-IN')}. (Current bill:{' '}
              {billAmountPaise ? `₹${Math.round(billAmountPaise / 100).toLocaleString('en-IN')}` : '₹0'})
            </div>
          )}

          {verifyResult.valid && !isOwnerMismatch && !isBelowMinBill && (
            <Button
              onClick={handleRedeem}
              fullWidth
              disabled={redeemLoading}
            >
              {redeemLoading ? 'Applying...' : 'Apply Voucher & Mark Redeemed'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
