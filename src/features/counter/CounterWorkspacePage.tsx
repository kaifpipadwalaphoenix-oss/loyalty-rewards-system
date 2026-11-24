import React, { useState } from 'react';
import { useStaffSession } from '@/hooks/useStaffSession';
import { useAppData } from '@/hooks/useAppData';
import {
  searchCounterCustomers,
  selectCounterCustomerDetails,
  type CounterCustomerView,
} from '@/data/selectors/counter';
import type { EarnPreview } from '@/data/selectors/earning';
import type { Purchase, PointsTransaction } from '@/domain/types';
import type { RecordPurchaseResult } from '@/services/purchases';
import { registerMember, type RegisterMemberInput } from '@/services/members';
import { MemberSearch } from './MemberSearch';
import { MemberPanel } from './MemberPanel';
import { PurchaseForm } from './PurchaseForm';
import { ReceiptPanel } from './ReceiptPanel';
import { VoucherPanel } from './VoucherPanel';
import { CoupleVisitPanel } from './CoupleVisitPanel';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { UserPlus, History, X } from 'lucide-react';

export const CounterWorkspacePage: React.FC = () => {
  const { staff } = useStaffSession();
  const appData = useAppData();

  // Search & customer selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Completed purchase receipt state
  const [recordedReceipt, setRecordedReceipt] = useState<{
    purchase: Purchase;
    transaction?: PointsTransaction;
    preview: EarnPreview | null;
  } | null>(null);

  // Quick Enrol modal state
  const [enrolModalOpen, setEnrolModalOpen] = useState(false);
  const [enrolName, setEnrolName] = useState('');
  const [enrolMobile, setEnrolMobile] = useState('');
  const [enrolLoading, setEnrolLoading] = useState(false);
  const [enrolError, setEnrolError] = useState<string | null>(null);

  // History Drawer state
  const [historyOpen, setHistoryOpen] = useState(false);

  const searchResults =
    searchQuery.trim().length >= 2
      ? searchCounterCustomers(appData, searchQuery)
      : [];

  const customerView: CounterCustomerView | null = selectedCustomerId
    ? selectCounterCustomerDetails(appData, selectedCustomerId)
    : null;

  // Cashier history
  const cashierPurchases = appData.purchases
    .filter((p) => p.staffId === staff?.id)
    .sort((a, b) => b.at.localeCompare(a.at));

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setSearchQuery('');
    setRecordedReceipt(null);
  };

  const handleDeselectCustomer = () => {
    setSelectedCustomerId(null);
    setSearchQuery('');
    setRecordedReceipt(null);
  };

  const handlePurchaseSuccess = (
    result: RecordPurchaseResult,
    preview: EarnPreview | null
  ) => {
    setRecordedReceipt({
      purchase: result.purchase,
      transaction: result.transaction,
      preview,
    });
  };

  const handleQuickEnrol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    const cleanMobile = enrolMobile.replace(/\D/g, '').slice(-10);
    if (!enrolName.trim() || cleanMobile.length !== 10) {
      setEnrolError('Please enter full name and valid 10-digit mobile number');
      return;
    }

    setEnrolLoading(true);
    setEnrolError(null);

    const payload: RegisterMemberInput = {
      name: enrolName.trim(),
      mobile: `+91${cleanMobile}`,
      consentTerms: true,
      consentUpdates: true,
    };

    setTimeout(() => {
      const res = registerMember(payload, {
        enrolledVia: 'counter',
        enrolledByStaffId: staff.id,
      });
      setEnrolLoading(false);

      if (!res.ok) {
        setEnrolError(res.error.message);
        return;
      }

      setEnrolModalOpen(false);
      setEnrolName('');
      setEnrolMobile('');
      setSelectedCustomerId(res.value.id);
      setRecordedReceipt(null);
    }, 150);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Search & Actions Bar */}
      <div className="bg-sand-card p-4 sm:p-6 border border-sand-subtle shadow-2xs space-y-4">
        <MemberSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          onSelectCustomer={handleSelectCustomer}
          onOpenEnrol={() => {
            setEnrolMobile(searchQuery.replace(/\D/g, ''));
            setEnrolModalOpen(true);
          }}
          onOpenHistory={() => setHistoryOpen(true)}
          historyCount={cashierPurchases.length}
        />

        {/* Selected Member Header Card */}
        {customerView ? (
          <MemberPanel
            customerView={customerView}
            onDeselect={handleDeselectCustomer}
          />
        ) : (
          <div className="p-8 text-center bg-sand border border-dashed border-sand-subtle text-charcoal-muted text-xs">
            <p className="font-serif text-sm font-semibold text-charcoal mb-1">
              No Member Selected
            </p>
            <p>
              Search for a customer above by mobile number or tap "New Member" to enrol a shopper.
            </p>
          </div>
        )}
      </div>

      {/* Main Action Grids (Only shown when customer is selected) */}
      {customerView && staff && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1: Purchase Recording or Receipt */}
          <div>
            {recordedReceipt ? (
              <ReceiptPanel
                purchase={recordedReceipt.purchase}
                transaction={recordedReceipt.transaction}
                preview={recordedReceipt.preview}
                customerView={customerView}
                onNextCustomer={handleDeselectCustomer}
                onRecordAnother={() => setRecordedReceipt(null)}
              />
            ) : (
              <PurchaseForm
                customerView={customerView}
                staffId={staff.id}
                appData={appData}
                onPurchaseSuccess={handlePurchaseSuccess}
              />
            )}
          </div>

          {/* Column 2: Voucher Redemption & Couple Visit */}
          <div className="space-y-6">
            <VoucherPanel
              customerView={customerView}
              appData={appData}
              staffId={staff.id}
              billNo={recordedReceipt?.purchase.billNo}
              billAmountPaise={recordedReceipt?.purchase.amountPaise}
              onSwitchCustomer={handleSelectCustomer}
              onRedeemSuccess={() => {}}
            />

            <CoupleVisitPanel
              customerView={customerView}
              staffId={staff.id}
              bonusPoints={appData.config.couple.bonusPoints}
              onSuccess={() => {}}
            />
          </div>
        </div>
      )}

      {/* Quick Enrol Member Modal */}
      {enrolModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-sand-card p-6 border border-sand-subtle shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-sand-subtle pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-tide" />
                <h3 className="font-serif text-lg font-semibold text-charcoal">
                  Quick Enrol Member
                </h3>
              </div>
              <button
                onClick={() => setEnrolModalOpen(false)}
                className="p-1 text-charcoal-muted hover:text-charcoal"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {enrolError && (
              <div className="p-3 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs">
                {enrolError}
              </div>
            )}

            <form onSubmit={handleQuickEnrol} className="space-y-4">
              <Field label="Full Name" required>
                <input
                  type="text"
                  value={enrolName}
                  onChange={(e) => setEnrolName(e.target.value)}
                  placeholder="e.g. Riya Sen"
                  className="w-full px-3 py-2 bg-sand border border-sand-subtle focus:border-tide focus:outline-hidden text-sm text-charcoal"
                  required
                  autoFocus
                />
              </Field>

              <PhoneInput
                label="Mobile Number"
                value={enrolMobile}
                onChange={setEnrolMobile}
                placeholder="98201 12345"
                required
              />

              <div className="p-3 bg-sand border border-sand-subtle text-xs text-charcoal-muted">
                Member will be enrolled immediately on Shore Tier.
              </div>

              <div className="flex gap-2">
                <Button type="submit" fullWidth disabled={enrolLoading}>
                  {enrolLoading ? 'Enrolling...' : 'Enrol & Select'}
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  type="button"
                  onClick={() => setEnrolModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cashier History Drawer */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-sand-card h-full shadow-2xl flex flex-col border-l border-sand-subtle animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-sand-subtle flex items-center justify-between bg-sand">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-tide" />
                <h3 className="font-serif text-base font-semibold text-charcoal">
                  My Recorded Purchases ({cashierPurchases.length})
                </h3>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="p-1 text-charcoal-muted hover:text-charcoal"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cashierPurchases.length > 0 ? (
                cashierPurchases.map((p) => {
                  const cust = appData.customers.find((c) => c.id === p.customerId);
                  return (
                    <div
                      key={p.id}
                      className={`p-3 bg-sand border border-sand-subtle text-xs space-y-1 ${
                        p.voided ? 'opacity-50 line-through' : ''
                      }`}
                    >
                      <div className="flex justify-between font-semibold text-charcoal">
                        <span>Bill #{p.billNo}</span>
                        <span>₹{(p.amountPaise / 100).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-charcoal-muted text-[11px]">
                        <span>{cust?.name ?? 'Customer'} ({cust?.memberNo})</span>
                        <span>{new Date(p.at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {p.voided && (
                        <span className="text-[10px] text-terracotta uppercase font-bold tracking-wider block pt-1">
                          Voided: {p.voided.reason}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-xs text-charcoal-muted py-8">
                  No purchases recorded in this session.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
