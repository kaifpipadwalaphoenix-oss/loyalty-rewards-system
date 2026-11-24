import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppData } from '@/hooks/useAppData';
import { useStaffSession } from '@/hooks/useStaffSession';
import { selectMemberDetails } from '@/data/selectors/member';
import { adjustPoints } from '@/services/points';
import { voidPurchase } from '@/services/purchases';
import { cancelVoucher } from '@/services/redemptions';
import { remainingForLot } from '@/domain/ledger';
import { TierChip } from '@/components/brand/TierChip';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import {
  ArrowLeft,
  Coins,
  X,
} from 'lucide-react';

export const AdminCustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const appData = useAppData();
  const { staff } = useStaffSession();

  const [activeTab, setActiveTab] = useState<'purchases' | 'ledger' | 'vouchers' | 'occasions'>('purchases');

  // Adjust Points Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'ADJUST_CREDIT' | 'ADJUST_DEBIT'>('ADJUST_CREDIT');
  const [adjustPointsValue, setAdjustPointsValue] = useState(100);
  const [adjustCategory, setAdjustCategory] = useState('Customer Goodwill');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Void Purchase Modal
  const [voidPurchaseId, setVoidPurchaseId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidLoading, setVoidLoading] = useState(false);
  const [voidError, setVoidError] = useState<string | null>(null);

  // Cancel Voucher Modal
  const [cancelVoucherId, setCancelVoucherId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Customer requested voucher cancellation');
  const [cancelLoading, setCancelLoading] = useState(false);

  const memberDetails = id ? selectMemberDetails(appData, id) : null;

  if (!memberDetails) {
    return (
      <div className="p-8 text-center bg-sand-card border border-sand-subtle">
        <p className="font-serif text-lg text-charcoal">Customer Not Found</p>
        <Link to="/admin/customers" className="text-xs text-tide underline mt-2 inline-block">
          &larr; Back to customer directory
        </Link>
      </div>
    );
  }

  const { customer, tier, balance, qualifyingSpendPaise, transactions, vouchers } = memberDetails;

  const customerPurchases = appData.purchases
    .filter((p) => p.customerId === customer.id)
    .sort((a, b) => b.at.localeCompare(a.at));

  // Plain-language void calculation per R6.2
  const selectedVoidPurchase = voidPurchaseId
    ? appData.purchases.find((p) => p.id === voidPurchaseId)
    : null;
  const voidEarnTxn = selectedVoidPurchase?.earnTxnId
    ? appData.transactions.find((t) => t.id === selectedVoidPurchase.earnTxnId)
    : null;
  const voidOriginalPoints = voidEarnTxn?.points ?? 0;
  const voidRemaining = voidEarnTxn
    ? remainingForLot(appData.transactions, customer.id, voidEarnTxn.id, new Date())
    : 0;
  const voidReversable = Math.min(voidOriginalPoints, voidRemaining);
  const voidShortfall = voidOriginalPoints - voidReversable;
  const voidSpendRupees = selectedVoidPurchase
    ? Math.round(selectedVoidPurchase.amountPaise / 100)
    : 0;

  const handleCloseAdjustModal = () => {
    setAdjustModalOpen(false);
    setAdjustPointsValue(100);
    setAdjustNote('');
    setAdjustError(null);
  };

  const handleCloseVoidModal = () => {
    setVoidPurchaseId(null);
    setVoidReason('');
    setVoidError(null);
  };

  const handleCloseCancelModal = () => {
    setCancelVoucherId(null);
    setCancelReason('Customer requested voucher cancellation');
  };

  const handleAdjustPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    if (adjustPointsValue <= 0) {
      setAdjustError('Please specify positive points to adjust');
      return;
    }
    if (adjustNote.trim().length < 5) {
      setAdjustError('Explanation note must be at least 5 characters');
      return;
    }
    if (adjustType === 'ADJUST_DEBIT' && adjustPointsValue > balance) {
      setAdjustError(`Cannot debit ${adjustPointsValue} points. Maximum allowed is current balance of ${balance} points.`);
      return;
    }

    setAdjustLoading(true);
    setAdjustError(null);

    setTimeout(() => {
      const res = adjustPoints({
        customerId: customer.id,
        type: adjustType,
        points: adjustPointsValue,
        category: adjustCategory,
        note: adjustNote.trim(),
        staffId: staff.id,
      });
      setAdjustLoading(false);

      if (!res.ok) {
        setAdjustError(res.error.message);
        return;
      }

      handleCloseAdjustModal();
    }, 150);
  };

  const handleVoidPurchase = () => {
    if (!voidPurchaseId || !staff) return;
    setVoidLoading(true);
    setVoidError(null);

    setTimeout(() => {
      const res = voidPurchase({
        purchaseId: voidPurchaseId,
        reason: voidReason.trim(),
        staffId: staff.id,
      });
      setVoidLoading(false);

      if (!res.ok) {
        setVoidError(res.error.message);
        return;
      }

      handleCloseVoidModal();
    }, 150);
  };

  const handleCancelVoucher = () => {
    if (!cancelVoucherId || !staff) return;
    setCancelLoading(true);

    setTimeout(() => {
      cancelVoucher({
        voucherId: cancelVoucherId,
        reason: cancelReason.trim(),
        staffId: staff.id,
      });
      setCancelLoading(false);
      handleCloseCancelModal();
    }, 150);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back link */}
      <div>
        <Link
          to="/admin/customers"
          className="text-xs text-charcoal-muted hover:text-charcoal flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customers</span>
        </Link>
      </div>

      {/* Member Profile Overview Header */}
      <div className="bg-sand-card p-6 border border-sand-subtle shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl font-bold text-charcoal">{customer.name}</h1>
              <TierChip tier={tier} size="md" />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted">
              <span className="font-mono">{customer.memberNo}</span>
              <span>·</span>
              <span className="font-mono">{customer.mobile}</span>
              {customer.email && (
                <>
                  <span>·</span>
                  <span>{customer.email}</span>
                </>
              )}
              <span>·</span>
              <span>Enrolled: {customer.enrolledAt.slice(0, 10)} via {customer.enrolledVia}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-left md:text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block">
                Points Balance
              </span>
              <span className="font-serif text-3xl font-bold text-tide block leading-tight">
                {balance.toLocaleString('en-IN')}{' '}
                <span className="text-xs text-charcoal-muted font-normal">pts</span>
              </span>
              <span className="text-[10px] text-charcoal-muted">
                12M Spend: ₹{(qualifyingSpendPaise / 100).toLocaleString('en-IN')}
              </span>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setAdjustError(null);
                setAdjustModalOpen(true);
              }}
            >
              <Coins className="w-3.5 h-3.5 mr-1.5" />
              Adjust Points
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-sand-subtle text-xs font-semibold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'purchases'
              ? 'border-tide text-tide font-bold bg-sand-card'
              : 'border-transparent text-charcoal-muted hover:text-charcoal'
          }`}
        >
          Purchases ({customerPurchases.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'ledger'
              ? 'border-tide text-tide font-bold bg-sand-card'
              : 'border-transparent text-charcoal-muted hover:text-charcoal'
          }`}
        >
          Points Ledger ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'vouchers'
              ? 'border-tide text-tide font-bold bg-sand-card'
              : 'border-transparent text-charcoal-muted hover:text-charcoal'
          }`}
        >
          Vouchers ({vouchers.length})
        </button>
        <button
          onClick={() => setActiveTab('occasions')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'occasions'
              ? 'border-tide text-tide font-bold bg-sand-card'
              : 'border-transparent text-charcoal-muted hover:text-charcoal'
          }`}
        >
          Milestones &amp; Profile
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'purchases' && (
        <div className="bg-sand-card border border-sand-subtle shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand/60 border-b border-sand-subtle uppercase text-[10px] tracking-wider text-charcoal-muted font-bold">
              <tr>
                <th className="p-3.5 pl-4">Date</th>
                <th className="p-3.5">Bill No</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Channel</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-subtle">
              {customerPurchases.map((p) => (
                <tr key={p.id} className="hover:bg-sand/40">
                  <td className="p-3.5 pl-4">{p.at.slice(0, 10)}</td>
                  <td className="p-3.5 font-mono font-semibold text-charcoal">{p.billNo}</td>
                  <td className="p-3.5 font-semibold text-charcoal">
                    ₹{(p.amountPaise / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 capitalize">{p.channel}</td>
                  <td className="p-3.5">
                    {p.voided ? (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200">
                        Voided
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 pr-4 text-right">
                    {!p.voided && (
                      <button
                        onClick={() => {
                          setVoidPurchaseId(p.id);
                          setVoidError(null);
                        }}
                        className="text-xs text-terracotta hover:underline font-semibold"
                      >
                        Void Bill
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {customerPurchases.length === 0 && (
            <p className="p-8 text-center text-xs text-charcoal-muted">
              No purchases recorded for this customer.
            </p>
          )}
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="bg-sand-card border border-sand-subtle shadow-2xs divide-y divide-sand-subtle text-xs">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between">
              <div>
                <span className="font-semibold text-charcoal block">{tx.description}</span>
                <span className="text-[10px] text-charcoal-muted font-mono">
                  {tx.ref} · {tx.at.slice(0, 10)} · Actor: {tx.actor.kind}
                </span>
              </div>
              <span
                className={`font-serif font-bold text-sm ${
                  tx.points > 0 ? 'text-emerald-700' : 'text-charcoal'
                }`}
              >
                {tx.points > 0 ? `+${tx.points}` : tx.points} pts
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'vouchers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vouchers.map((v) => (
            <div key={v.id} className="p-4 bg-sand-card border border-sand-subtle space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-serif font-semibold text-charcoal">{v.title}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border bg-sand">
                  {v.status}
                </span>
              </div>
              <div className="p-2.5 bg-sand font-mono text-sm font-bold text-center tracking-wide">
                {v.code}
              </div>
              <div className="flex justify-between items-center text-[11px] text-charcoal-muted pt-2 border-t border-sand-subtle">
                <span>Expires: {v.expiresAt.slice(0, 10)}</span>
                {v.status === 'issued' && (
                  <button
                    onClick={() => setCancelVoucherId(v.id)}
                    className="text-terracotta hover:underline font-semibold"
                  >
                    Cancel &amp; Refund
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'occasions' && (
        <div className="bg-sand-card p-6 border border-sand-subtle space-y-4 max-w-xl text-xs">
          <h3 className="font-serif text-base font-semibold text-charcoal">
            Milestone Dates &amp; Anti-Abuse Locks
          </h3>

          <div className="p-3 bg-sand border border-sand-subtle space-y-1">
            <span className="text-charcoal-muted block">Date of Birth:</span>
            <span className="font-serif text-sm font-bold text-charcoal">
              {customer.birthday
                ? `${customer.birthday.day}/${customer.birthday.month}`
                : 'Not recorded'}
            </span>
            <span className="text-[10px] text-charcoal-muted block">
              Edits made: {customer.occasionDates.birthdayEdits}/1
            </span>
          </div>

          <div className="p-3 bg-sand border border-sand-subtle space-y-1">
            <span className="text-charcoal-muted block">Marital Status &amp; Anniversary:</span>
            <span className="font-serif text-sm font-bold text-charcoal capitalize">
              {customer.maritalStatus ?? 'Undisclosed'}{' '}
              {customer.spouseFirstName ? `(Partner: ${customer.spouseFirstName})` : ''}
            </span>
            {customer.anniversary && (
              <span className="text-[10px] text-charcoal-muted block">
                Anniversary: {customer.anniversary.day}/{customer.anniversary.month}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Adjust Points Modal */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-sand-card p-6 border border-sand-subtle shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-sand-subtle pb-3">
              <h3 className="font-serif text-lg font-semibold text-charcoal">
                Adjust Points for {customer.name}
              </h3>
              <button
                onClick={handleCloseAdjustModal}
                className="p-1 text-charcoal-muted hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adjustError && (
              <div className="p-3 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs">
                {adjustError}
              </div>
            )}

            {adjustType === 'ADJUST_DEBIT' && adjustPointsValue > balance && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                Cannot debit {adjustPointsValue} points. Member current balance is only {balance} points.
              </div>
            )}

            <form onSubmit={handleAdjustPoints} className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-charcoal block">Adjustment Direction</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADJUST_CREDIT')}
                    className={`py-2 px-3 text-xs font-semibold border transition-colors ${
                      adjustType === 'ADJUST_CREDIT'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
                        : 'border-sand-subtle bg-sand text-charcoal-muted'
                    }`}
                  >
                    + Credit Points
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADJUST_DEBIT')}
                    className={`py-2 px-3 text-xs font-semibold border transition-colors ${
                      adjustType === 'ADJUST_DEBIT'
                        ? 'border-rose-700 bg-rose-50 text-rose-800'
                        : 'border-sand-subtle bg-sand text-charcoal-muted'
                    }`}
                  >
                    - Debit Points
                  </button>
                </div>
              </div>

              <Field label="Points to Adjust" required>
                <input
                  type="number"
                  min="1"
                  value={adjustPointsValue}
                  onChange={(e) => setAdjustPointsValue(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-sand border border-sand-subtle focus:border-tide focus:outline-hidden text-sm text-charcoal font-serif font-bold"
                  required
                />
              </Field>

              <Field label="Adjustment Category">
                <select
                  value={adjustCategory}
                  onChange={(e) => setAdjustCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-sand border border-sand-subtle text-xs text-charcoal focus:outline-hidden"
                >
                  <option value="Customer Goodwill">Customer Goodwill</option>
                  <option value="Service Recovery">Service Recovery</option>
                  <option value="Billing Correction">Billing Correction</option>
                  <option value="Promotional Gift">Promotional Gift</option>
                </select>
              </Field>

              <Field label="Reason & Explanation (Mandatory Audit Trail)" required>
                <textarea
                  rows={3}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Explain why this manual adjustment was authorized..."
                  className="w-full px-3 py-2 bg-sand border border-sand-subtle focus:border-tide focus:outline-hidden text-xs text-charcoal"
                  required
                />
              </Field>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  fullWidth
                  disabled={
                    adjustLoading ||
                    adjustPointsValue <= 0 ||
                    adjustNote.trim().length < 5 ||
                    (adjustType === 'ADJUST_DEBIT' && adjustPointsValue > balance)
                  }
                >
                  {adjustLoading ? 'Executing...' : 'Authorize Adjustment'}
                </Button>
                <Button variant="secondary" fullWidth type="button" onClick={handleCloseAdjustModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Void Purchase Modal */}
      {voidPurchaseId && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-sand-card p-6 border border-sand-subtle shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-sand-subtle pb-3">
              <h3 className="font-serif text-lg font-semibold text-charcoal">
                Confirm Purchase Void
              </h3>
              <button
                onClick={handleCloseVoidModal}
                className="p-1 text-charcoal-muted hover:text-charcoal"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-sand border border-sand-subtle space-y-2 text-xs">
              <span className="font-semibold text-charcoal block">Reversal Impact Preview:</span>
              <p className="text-charcoal-muted leading-relaxed">
                <strong className="text-charcoal">₹{voidSpendRupees.toLocaleString('en-IN')}</strong> will be removed from qualifying spend.
              </p>
              <p className="text-charcoal-muted leading-relaxed">
                <strong className="text-charcoal">{voidReversable} of {voidOriginalPoints}</strong> points will be reversed{' '}
                {voidShortfall > 0 ? (
                  <span className="text-terracotta font-medium">
                    ({voidShortfall} were already redeemed or expired and cannot be deducted)
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium">
                    (full points will be deducted from balance)
                  </span>
                )}
                .
              </p>
            </div>

            {voidError && (
              <div className="p-3 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs">
                {voidError}
              </div>
            )}

            <Field label="Void Reason (Mandatory)" required>
              <input
                type="text"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Customer return of merchandise"
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-xs text-charcoal focus:border-tide focus:outline-hidden"
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'Customer return of merchandise',
                  'Billing error on transaction',
                  'Duplicate transaction entered',
                  'Manager override for service recovery',
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setVoidReason(sug)}
                    className="text-[11px] px-2 py-0.5 bg-sand-card border border-sand-subtle hover:border-sand-focus text-charcoal-muted hover:text-charcoal transition-colors rounded-xs"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </Field>

            <div className="flex gap-2">
              <Button
                variant="destructive"
                fullWidth
                onClick={handleVoidPurchase}
                disabled={voidLoading || voidReason.trim().length < 5}
              >
                {voidLoading ? 'Voiding...' : 'Confirm Void'}
              </Button>
              <Button variant="secondary" fullWidth type="button" onClick={handleCloseVoidModal}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Voucher Modal */}
      {cancelVoucherId && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-sand-card p-6 border border-sand-subtle shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-sand-subtle pb-3">
              <h3 className="font-serif text-lg font-semibold text-charcoal">
                Cancel Voucher &amp; Refund Points
              </h3>
              <button
                onClick={handleCloseCancelModal}
                className="p-1 text-charcoal-muted hover:text-charcoal"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              Cancelling this voucher will restore any redeemed points back to the member's account.
            </p>

            <Field label="Cancellation Reason" required>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-xs text-charcoal"
                required
              />
            </Field>

            <div className="flex gap-2">
              <Button
                variant="destructive"
                fullWidth
                onClick={handleCancelVoucher}
                disabled={cancelLoading || cancelReason.trim().length < 3}
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel & Refund'}
              </Button>
              <Button variant="secondary" fullWidth type="button" onClick={handleCloseCancelModal}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
