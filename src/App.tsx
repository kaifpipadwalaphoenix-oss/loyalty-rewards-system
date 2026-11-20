import React from 'react';
import { LoyaltyProvider, useLoyalty } from './context/LoyaltyContext';
import { Header } from './components/layout/Header';
import { NotificationToast } from './components/layout/NotificationToast';
import { AdminLayout } from './components/admin/AdminLayout';
import { StoreCashier } from './components/store/StoreCashier';
import { OnlineShopifySimulator } from './components/online/OnlineShopifySimulator';
import { CustomerWallet } from './components/wallet/CustomerWallet';

const MainContent: React.FC = () => {
  const { currentPortal } = useLoyalty();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        {currentPortal === 'admin' && <AdminLayout />}
        {currentPortal === 'store' && <StoreCashier />}
        {currentPortal === 'online' && <OnlineShopifySimulator />}
        {currentPortal === 'wallet' && <CustomerWallet />}
      </main>

      {/* Accessible Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-slate-800 tracking-wider">
              TROVE LABEL
            </span>
            <span className="text-slate-300">|</span>
            <span>Custom Omnichannel Loyalty Platform Prototype</span>
          </div>

          <div className="text-slate-400 text-center sm:text-right">
            Dynamic Rules Engine &bull; Store POS &bull; Shopify Webhooks &bull; Unified Wallet
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
