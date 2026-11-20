import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import type { AdminTab } from '../../context/LoyaltyContext';
import { OverviewDashboard } from './OverviewDashboard';
import { LoyaltyRulesConfig } from './LoyaltyRulesConfig';
import { CustomerManagement } from './CustomerManagement';
import { TransactionLedger } from './TransactionLedger';
import { AdminSettings } from './AdminSettings';
import { IntegrationsPanel } from './IntegrationsPanel';
import {
  LayoutDashboard,
  SlidersHorizontal,
  Users,
  Receipt,
  Settings,
  Plug,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { adminTab, setAdminTab, config } = useLoyalty();

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'rules', label: 'Loyalty Rules', icon: SlidersHorizontal, badge: 'Live Engine' },
    { id: 'customers', label: 'Members', icon: Users },
    { id: 'transactions', label: 'Ledger', icon: Receipt },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Subnav Tabs */}
      <div className="border-b border-slate-200 bg-white -mt-4 sm:-mt-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-2 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = adminTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setAdminTab(t.id)}
                className={`flex items-center gap-1.5 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-t-md ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                {t.badge && (
                  <span className="hidden sm:inline text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        {adminTab === 'overview' && <OverviewDashboard />}
        {adminTab === 'rules' && <LoyaltyRulesConfig key={config.updatedAt} />}
        {adminTab === 'customers' && <CustomerManagement />}
        {adminTab === 'transactions' && <TransactionLedger />}
        {adminTab === 'integrations' && <IntegrationsPanel />}
        {adminTab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
};
