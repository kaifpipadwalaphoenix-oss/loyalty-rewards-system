import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import {
  RotateCcw,
  Download,
  ShieldAlert,
  SlidersHorizontal,
  Database,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { config, customers, transactions, resetDemoData, setAdminTab, showNotification } = useLoyalty();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleExportData = () => {
    const exportBundle = {
      brand: 'Trove Label',
      system: 'Custom Loyalty Management System',
      exportedAt: new Date().toISOString(),
      config,
      customerCount: customers.length,
      customers,
      transactionCount: transactions.length,
      transactions,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `trove-loyalty-export-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showNotification('Program data and ledger exported as JSON.', 'success');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System & Demonstration Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review active program policies, manage sandbox persistence, and export demo records
        </p>
      </div>

      {/* Program Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Active Program Parameters
              </h2>
              <p className="text-xs text-slate-500">
                Currently running in memory and local storage
              </p>
            </div>
          </div>

          <button
            onClick={() => setAdminTab('rules')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Modify in Rules Engine &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-500 block">Earning Ratio:</span>
            <span className="font-bold text-slate-900 text-sm">
              ₹{config.purchaseThreshold} spend = {config.pointsPerThreshold} pts
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-500 block">Point Rupee Value:</span>
            <span className="font-bold text-slate-900 text-sm">
              1 point = ₹{config.pointValue}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-500 block">Max Bill Redemption Cap:</span>
            <span className="font-bold text-slate-900 text-sm">
              {config.maximumRedemptionPercentage}% of bill
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-500 block">Min Points for Redemption:</span>
            <span className="font-bold text-slate-900 text-sm">
              {config.minimumRedemptionPoints} points
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-500 block">Expiry Policy:</span>
            <span className="font-bold text-slate-900 text-sm">
              {config.expiryEnabled ? `${config.expiryMonths} months rolling` : 'Disabled'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-500 block">Calculation Method:</span>
            <span className="font-bold text-slate-900 text-sm capitalize">
              {config.earningMethod === 'threshold_floor' ? 'Floor (Standard)' : 'Proportional'}
            </span>
          </div>
        </div>
      </div>

      {/* Sandbox & Persistence Management */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Demo Sandbox Controls
            </h2>
            <p className="text-xs text-slate-500">
              Browser LocalStorage sandbox maintains your edits across page reloads
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900">
                Export Complete Program State
              </div>
              <div className="text-slate-500 mt-0.5">
                Download current loyalty rules, customer balances, and all transaction audit receipts as a JSON file.
              </div>
            </div>
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-rose-600">
                Reset Demo Data to Initial Pristine State
              </div>
              <div className="text-slate-500 mt-0.5">
                Restores original 9 seed customers (Aarav, Priya, Rohan, Ananya, Vikram, Sanya, Dev, Meera, Rahul), default rule values (₹100 = 10 pts, ₹1/pt, 30%), and seed transactions.
              </div>
            </div>
            <button
              onClick={() => setShowConfirmReset(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl transition-colors shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scope and Technical Architecture Notice */}
      <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 border border-slate-800 space-y-3 text-xs leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Client Prototype Architecture Notes</span>
        </div>
        <p>
          This frontend application is an interactive prototype demonstrating Trove Label's proprietary loyalty system. All calculation logic runs dynamically in client memory and persists via browser storage.
        </p>
        <p className="text-slate-400">
          In production, this architecture maps directly to Trove Label's private cloud microservice, syncing in real-time with POS checkout terminals and e-commerce webhooks without depending on third-party SaaS subscription fees.
        </p>
      </div>

      {/* Reset Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Confirm Demo Data Reset
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure? This will clear any created transactions or rule changes and return the prototype to its default seeded state.
            </p>
            <div className="mt-5 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowConfirmReset(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
