import React from 'react';
import { LoyaltyProvider, useLoyalty } from './context/LoyaltyContext';
import { Header } from './components/layout/Header';
import { NotificationToast } from './components/layout/NotificationToast';
import { ProgrammeOverview } from './components/overview/ProgrammeOverview';
import { StoreCashier } from './components/store/StoreCashier';
import { OnlineShop } from './components/online/OnlineShop';
import { CustomerWallet } from './components/wallet/CustomerWallet';
import { AdminLayout } from './components/admin/AdminLayout';

const MainContent: React.FC = () => {
  const { currentPortal } = useLoyalty();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        {currentPortal === 'overview' && <ProgrammeOverview />}
        {currentPortal === 'store' && <StoreCashier />}
        {currentPortal === 'online' && <OnlineShop />}
        {currentPortal === 'wallet' && <CustomerWallet />}
        {currentPortal === 'admin' && <AdminLayout />}
      </main>

      {/* Accessible Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-slate-800 tracking-wider">
              TROVE LABEL
            </span>
            <span className="text-slate-300">|</span>
            <span>Unified Customer Rewards Programme Concept</span>
          </div>

          <div className="text-slate-400 text-center sm:text-right">
            Omnichannel Loyalty &bull; Colaba Boutique &bull; Shopify Online Storefront &bull; Shared Member Wallet
          </div>
        </div>
      </footer>

      {/* Toast Notification Container */}
      <NotificationToast />
    </div>
  );
};

export function App() {
  return (
    <LoyaltyProvider>
      <MainContent />
    </LoyaltyProvider>
  );
}

export default App;
