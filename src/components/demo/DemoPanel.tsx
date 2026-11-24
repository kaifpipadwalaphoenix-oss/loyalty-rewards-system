import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_PERSONAS, resetDemoData, switchPersona } from '@/services/demo';
import { Button } from '@/components/ui/button';
import { useMemberSession } from '@/hooks/useMemberSession';
import { useStaffSession } from '@/hooks/useStaffSession';
import { Users, BookOpen, RotateCcw, X, Check, ShieldAlert } from 'lucide-react';

interface DemoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoPanel: React.FC<DemoPanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'personas' | 'guide' | 'reset'>('personas');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const { details: memberDetails } = useMemberSession();
  const { staff } = useStaffSession();

  if (!isOpen) return null;

  const handleSelectPersona = (key: string) => {
    const targetRoute = switchPersona(key);
    onClose();
    window.location.assign(targetRoute);
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setResetConfirmOpen(false);
    onClose();
    navigate('/');
    window.location.reload();
  };

  const currentActorName = staff?.name ?? memberDetails?.customer.name ?? 'Guest Visitor';
  const currentActorBadge = staff
    ? `Staff · ${staff.role}`
    : memberDetails
    ? `Member · ${memberDetails.tier.name} (${memberDetails.balance} pts)`
    : 'Not logged in';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-sand-card h-full shadow-2xl flex flex-col border-l border-sand-subtle">
        {/* Header */}
        <div className="px-6 py-4 border-b border-sand-subtle flex items-center justify-between bg-sand">
          <div>
            <h2 className="font-serif text-lg text-charcoal">Trove Club Demo Navigator</h2>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Active: <strong className="text-tide">{currentActorName}</strong> ({currentActorBadge})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-charcoal-muted hover:text-charcoal hover:bg-sand-card transition-colors rounded-none"
            aria-label="Close demo panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-sand-subtle bg-sand-card text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('personas')}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'personas'
                ? 'border-tide text-tide bg-sand/30 font-bold'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Personas
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'guide'
                ? 'border-tide text-tide bg-sand/30 font-bold'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Scenarios A–J
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'reset'
                ? 'border-tide text-tide bg-sand/30 font-bold'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'personas' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-charcoal-muted font-bold mb-3">
                  Customer Personas
                </h3>
                <div className="space-y-2">
                  {DEMO_PERSONAS.filter((p) => p.type === 'member').map((p) => {
                    const isCurrent = memberDetails?.customer.id === p.id;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => handleSelectPersona(p.key)}
                        className={`w-full text-left p-3.5 border transition-all cursor-pointer flex items-start justify-between ${
                          isCurrent
                            ? 'border-tide bg-tide/5 shadow-xs'
                            : 'border-sand-subtle hover:border-sand-muted bg-sand-card hover:bg-sand/20'
                        }`}
                      >
                        <div className="pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-sm font-semibold text-charcoal">
                              {p.name}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-sand text-tide border border-sand-subtle">
                              {p.badge}
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                            {p.description}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="p-1 bg-tide text-white rounded-none shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-xs uppercase tracking-widest text-charcoal-muted font-bold mb-3">
                  Store Counter & Admin Staff
                </h3>
                <div className="space-y-2">
                  {DEMO_PERSONAS.filter((p) => p.type === 'staff').map((p) => {
                    const isCurrent = staff?.id === p.id;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => handleSelectPersona(p.key)}
                        className={`w-full text-left p-3.5 border transition-all cursor-pointer flex items-start justify-between ${
                          isCurrent
                            ? 'border-tide bg-tide/5 shadow-xs'
                            : 'border-sand-subtle hover:border-sand-muted bg-sand-card hover:bg-sand/20'
                        }`}
                      >
                        <div className="pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-sm font-semibold text-charcoal">
                              {p.name}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-sand text-charcoal border border-sand-subtle">
                              {p.badge}
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                            {p.description}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="p-1 bg-tide text-white rounded-none shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-sand border border-sand-subtle">
                <p className="font-serif text-sm text-charcoal font-semibold mb-1">
                  Client Presenter Walkthrough Guide
                </p>
                <p className="text-charcoal-muted leading-relaxed">
                  Demonstrate the core retail loyalty journey using the approved test scenarios:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 border border-sand-subtle bg-sand-card">
                  <strong className="text-tide block font-serif text-sm mb-1">
                    Scenario A · Onboarding Tour (Meera)
                  </strong>
                  <p className="text-charcoal-muted leading-relaxed">
                    Switch to Meera. View the clean 0-point state, complete onboarding carousel, and explore initial tier milestones.
                  </p>
                </div>

                <div className="p-3 border border-sand-subtle bg-sand-card">
                  <strong className="text-tide block font-serif text-sm mb-1">
                    Scenario B · Tier Upgrade & Rewards (Tara)
                  </strong>
                  <p className="text-charcoal-muted leading-relaxed">
                    Switch to Tara (Tide tier). Head to Store Counter as Pooja, record purchase of ₹4,000, and watch her upgrade to Golden Hour with unlocked perks.
                  </p>
                </div>

                <div className="p-3 border border-sand-subtle bg-sand-card">
                  <strong className="text-tide block font-serif text-sm mb-1">
                    Scenario C · Canonical Points Journey (Kabir)
                  </strong>
                  <p className="text-charcoal-muted leading-relaxed">
                    Kabir begins at 1,000 pts. Record ₹2,000 bill (+100 pts -&gt; 1,100 pts), redeem ₹250 voucher (-500 pts -&gt; 600 pts), and verify voucher at counter checkout.
                  </p>
                </div>

                <div className="p-3 border border-sand-subtle bg-sand-card">
                  <strong className="text-tide block font-serif text-sm mb-1">
                    Scenario D · Birthday VIP Celebration (Zoya)
                  </strong>
                  <p className="text-charcoal-muted leading-relaxed">
                    Zoya (Golden Hour VIP) has her birthday 5 days away. Observe the unlocked 15% birthday voucher with celebration banner.
                  </p>
                </div>

                <div className="p-3 border border-sand-subtle bg-sand-card">
                  <strong className="text-tide block font-serif text-sm mb-1">
                    Scenario E · Couple Visit & Anniversary (Aditi)
                  </strong>
                  <p className="text-charcoal-muted leading-relaxed">
                    Aditi is married with anniversary in 9 days. In counter workspace, tap "Record Couple Visit" to award the exclusive in-store celebration bonus.
                  </p>
                </div>

                <div className="p-3 border border-sand-subtle bg-sand-card">
                  <strong className="text-tide block font-serif text-sm mb-1">
                    Scenario F · Expiry Urgency Alert (Farhan)
                  </strong>
                  <p className="text-charcoal-muted leading-relaxed">
                    Farhan has 450 points expiring in 7 days. Inspect the prominent amber urgency alert and recommended quick-spend rewards.
                  </p>
                </div>

                <div className="p-3 border border-sand-subtle bg-sand-card">
                  <strong className="text-tide block font-serif text-sm mb-1">
                    Scenario G &amp; H · Counter &amp; Manager Controls
                  </strong>
                  <p className="text-charcoal-muted leading-relaxed">
                    Sign in as Pooja (Cashier, PIN 1234) or Rahul (Manager, PIN 2345). Test quick mobile lookup, purchase voids with reason, and customer search.
                  </p>
                </div>

                <div className="p-3 border border-sand-subtle bg-sand-card">
                  <strong className="text-tide block font-serif text-sm mb-1">
                    Scenario I &amp; J · Owner Admin &amp; Cross-Tab Sync
                  </strong>
                  <p className="text-charcoal-muted leading-relaxed">
                    Sign in as Ananya (Admin, PIN 3456). Open two browser tabs side-by-side: record purchase in counter tab and watch member tab update instantly without reload.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reset' && (
            <div className="space-y-4">
              <div className="p-4 bg-terracotta/10 border border-terracotta/30 text-charcoal">
                <div className="flex items-center gap-2 text-terracotta font-semibold mb-2">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Reset Demo Environment</span>
                </div>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  This action restores all customer accounts, points transactions, vouchers, purchases, and settings back to their pristine seed state.
                </p>
              </div>

              {!resetConfirmOpen ? (
                <Button
                  variant="destructive"
                  fullWidth
                  onClick={() => setResetConfirmOpen(true)}
                >
                  Reset Demo to Seed State
                </Button>
              ) : (
                <div className="p-4 border border-terracotta bg-sand-card space-y-3">
                  <p className="text-xs font-semibold text-charcoal">
                    Are you sure you want to reset all test data?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      fullWidth
                      onClick={handleConfirmReset}
                    >
                      Yes, Reset Everything
                    </Button>
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => setResetConfirmOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
