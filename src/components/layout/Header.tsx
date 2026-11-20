import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import type { PortalView } from '../../context/LoyaltyContext';
import {
  Sparkles,
  Store,
  ShoppingBag,
  Wallet,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Menu,
  X,
  Settings,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentPortal,
    setCurrentPortal,
    setAdminTab,
    config,
    resetDemoData,
  } = useLoyalty();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard shortcut listener for presentation switching (keys 1-5)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === '1') setCurrentPortal('overview');
      if (e.key === '2') setCurrentPortal('store');
      if (e.key === '3') setCurrentPortal('online');
      if (e.key === '4') setCurrentPortal('wallet');
      if (e.key === '5') {
        setCurrentPortal('admin');
        setAdminTab('rules');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentPortal, setAdminTab]);

  const portals: Array<{
    id: PortalView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }> = [
    {
      id: 'overview',
      label: 'Programme Overview',
      icon: Sparkles,
      description: 'Introduction & Customer Journey',
    },
    {
      id: 'store',
      label: 'In-Store Experience',
      icon: Store,
      description: 'Boutique Staff Loyalty Assistant',
    },
    {
      id: 'online',
      label: 'Online Shopping',
      icon: ShoppingBag,
      description: 'Shopify Storefront & Bag Checkout',
    },
    {
      id: 'wallet',
      label: 'Customer Wallet',
      icon: Wallet,
      description: 'Mobile-First Member Rewards Pass',
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
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Client Concept Demo
            </span>
            <span className="hidden sm:inline text-slate-400">
              Trove Label Omnichannel Loyalty &amp; Rewards Platform
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleJumpToRules}
              className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors focus-visible:outline-hidden rounded px-1.5 py-0.5 cursor-pointer"
              title="Click to inspect or change dynamic loyalty rules"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                Active Rules: ₹{config.purchaseThreshold} = {config.pointsPerThreshold} pts (1 pt = ₹{config.pointValue})
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" aria-hidden="true" />
            </button>

            <span className="text-slate-700 hidden md:inline">|</span>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-300 transition-colors text-xs focus-visible:outline-hidden rounded px-1 py-0.5 cursor-pointer"
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
            <button
              onClick={() => setCurrentPortal('overview')}
              className="flex items-center gap-3 text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-serif text-lg tracking-wider font-bold shadow-2xs">
                TL
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base tracking-tight font-bold text-slate-900">
                    TROVE LABEL
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Rewards
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Unified Customer Loyalty Programme
                </p>
              </div>
            </button>

            {/* Desktop Portal Switcher (Clean Pill Selector) */}
            <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/90 shadow-2xs" aria-label="Portal Navigation">
              {portals.map((p) => {
                const Icon = p.icon;
                const isActive = currentPortal === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePortalSwitch(p.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-slate-500'}`} aria-hidden="true" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Meta / Controls */}
            <div className="hidden lg:flex items-center gap-3 text-right">
              <button
                onClick={handleJumpToRules}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Business Rules Configuration"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Admin Rules</span>
              </button>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset all demo accounts and transactions"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Demo</span>
              </button>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-fadeIn">
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
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
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
                className="text-xs text-amber-800 font-semibold flex items-center gap-1.5 py-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Admin Rules</span>
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(true);
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-rose-600 font-semibold flex items-center gap-1 py-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-slate-900">
                Reset Demonstration Data?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This will reset all customer balances, cart items, transactions, and rules back to their pristine demonstration initial state.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 text-xs pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
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
