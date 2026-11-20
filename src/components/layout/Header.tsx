import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import type { PortalView } from '../../context/LoyaltyContext';
import {
  ShieldCheck,
  Store,
  Wallet,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Menu,
  X,
  Globe,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentPortal,
    setCurrentPortal,
    setAdminTab,
    config,
    resetDemoData,
    metrics,
  } = useLoyalty();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard shortcut listener for slick presentation switching (keys 1-4)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === '1') setCurrentPortal('admin');
      if (e.key === '2') setCurrentPortal('store');
      if (e.key === '3') setCurrentPortal('online');
      if (e.key === '4') setCurrentPortal('wallet');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentPortal]);

  const portals: Array<{ id: PortalView; label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = [
    {
      id: 'admin',
      label: 'Admin Portal',
      icon: ShieldCheck,
      description: 'Program Rules & Dashboard',
    },
    {
      id: 'store',
      label: 'Store POS',
      icon: Store,
      description: 'In-Store Checkout & Lookup',
    },
    {
      id: 'online',
      label: 'Online Simulator',
      icon: Globe,
      description: 'Shopify & Razorpay Webhooks',
    },
    {
      id: 'wallet',
      label: 'Customer Wallet',
      icon: Wallet,
      description: 'Member Pass & Activity',
    },
  ];

  const handlePortalSwitch = (portal: PortalView) => {
    setCurrentPortal(portal);
    setMobileMenuOpen(false);
  };

  const handleJumpToRules = () => {
    setCurrentPortal('admin');
    setAdminTab('rules');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 no-print">
        {/* Top Operational Status Bar */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Interactive Prototype
            </span>
            <span className="hidden sm:inline text-slate-400">
              Trove Label Omnichannel Loyalty & Rewards Platform
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleJumpToRules}
              className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded px-1.5 py-0.5"
              title="Click to configure loyalty rules"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                Active: ₹{config.purchaseThreshold} = {config.pointsPerThreshold} pts (1 pt = ₹{config.pointValue})
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" aria-hidden="true" />
            </button>

            <span className="text-slate-700 hidden md:inline">|</span>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-300 transition-colors text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400 rounded px-1 py-0.5"
              title="Reset all demo data back to pristine initial state"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Main Navigation Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Trove Label Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-serif text-lg tracking-wider font-bold shadow-xs">
                TL
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base tracking-tight font-bold text-slate-900">
                    TROVE LABEL
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Omnichannel Loyalty
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Unified Member Rewards across Store & Shopify
                </p>
              </div>
            </div>

            {/* Desktop Portal Switcher (Clean Pill Selector) */}
            <nav className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 shadow-inner" aria-label="Portal Navigation">
              {portals.map((p) => {
                const Icon = p.icon;
                const isActive = currentPortal === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePortalSwitch(p.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} aria-hidden="true" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Meta / Outstanding Liability */}
            <div className="hidden lg:flex items-center gap-6 text-right">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Active Members
                </div>
                <div className="text-xs font-bold text-slate-900 tabular-nums">
                  {metrics.totalMembers} <span className="text-[11px] font-normal text-slate-500">accounts</span>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-200" />

              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Outstanding Liability
                </div>
                <div className="text-xs font-bold text-slate-900 tabular-nums">
                  {metrics.outstandingPoints.toLocaleString('en-IN')} pts
                  <span className="text-[11px] font-normal text-slate-500 ml-1">
                    (₹{metrics.estimatedOutstandingRupeeValue.toLocaleString('en-IN')})
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
              Select Experience
            </div>
            {portals.map((p) => {
              const Icon = p.icon;
              const isActive = currentPortal === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePortalSwitch(p.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="text-left">
                      <div>{p.label}</div>
                      <div className={`text-[11px] font-normal ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                        {p.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-2">
              <button
                onClick={handleJumpToRules}
                className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 py-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Configure Rules
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(true);
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-rose-600 font-semibold flex items-center gap-1 py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Data
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Reset Demo Data to Initial State?
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              This will restore the 5 original seed customer records, default loyalty rules (₹100 = 10 pts, 1 pt = ₹1, 30% max redemption), initial transaction ledger, and sales history.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3 text-xs">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
