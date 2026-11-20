import React, { useState, useMemo } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import type { Customer, CustomerTier } from '../../types/loyalty';
import {
  Search,
  UserPlus,
  Edit2,
  Wallet,
  Store,
  ChevronRight,
  X,
  Sliders,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Filter,
} from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const {
    customers,
    transactions,
    config,
    addCustomer,
    updateCustomer,
    adjustCustomerPoints,
    setCurrentPortal,
    setSelectedCustomerIdForWallet,
  } = useLoyalty();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    tier: 'Classic' as CustomerTier,
    city: 'Mumbai',
    status: 'active' as const,
  });

  // Edit Customer Modal
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Manual Adjust Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustPointsValue, setAdjustPointsValue] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState<string>('Customer service goodwill');

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.mobileNumber.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);

      const matchesTier = tierFilter === 'all' || c.tier.toLowerCase() === tierFilter.toLowerCase();
      return matchesSearch && matchesTier;
    });
  }, [customers, searchQuery, tierFilter]);

  // Customer transactions for the detail view
  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    return transactions.filter((t) => t.customerId === selectedCustomer.id);
  }, [selectedCustomer, transactions]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim() || !newCustomerForm.mobileNumber.trim()) return;

    // Clean phone number (strip whitespace / dashes)
    const cleanPhone = newCustomerForm.mobileNumber.replace(/\D/g, '');

    addCustomer({
      name: newCustomerForm.name.trim(),
      mobileNumber: cleanPhone,
      email: newCustomerForm.email.trim() || `${newCustomerForm.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      tier: newCustomerForm.tier,
      city: newCustomerForm.city,
      status: 'active',
    });

    setShowAddModal(false);
    setNewCustomerForm({
      name: '',
      mobileNumber: '',
      email: '',
      tier: 'Classic',
      city: 'Mumbai',
      status: 'active',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    updateCustomer(editingCustomer.id, {
      name: editingCustomer.name,
      email: editingCustomer.email,
      mobileNumber: editingCustomer.mobileNumber.replace(/\D/g, ''),
      tier: editingCustomer.tier,
      city: editingCustomer.city,
    });

    if (selectedCustomer?.id === editingCustomer.id) {
      setSelectedCustomer(editingCustomer);
    }
    setEditingCustomer(null);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const ok = adjustCustomerPoints(selectedCustomer.id, adjustPointsValue, adjustReason);
    if (ok) {
      setShowAdjustModal(false);
      // update selected customer state to reflect new points
      const updated = customers.find((c) => c.id === selectedCustomer.id);
      if (updated) setSelectedCustomer(updated);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Customer Loyalty Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Searchable member ledger with real-time points balances and historical receipts
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Demo Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile (+91 98...), or ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Tier:</span>
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Tiers ({customers.length})</option>
            <option value="Classic">Classic</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Customer & Contact</th>
                <th className="px-4 py-3.5">Member Tier</th>
                <th className="px-4 py-3.5 text-right">Available Points</th>
                <th className="px-4 py-3.5 text-right">Rupee Value</th>
                <th className="px-4 py-3.5">Member Since</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No customers found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const rupeeVal = cust.currentPointsBalance * (config.pointValue || 1);

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCustomer(cust)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                              <span>{cust.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono font-normal">
                                {cust.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              +91 {cust.mobileNumber} &bull; {cust.city || 'India'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            cust.tier === 'Platinum'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : cust.tier === 'Gold'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : cust.tier === 'Silver'
                              ? 'bg-slate-100 text-slate-700 border border-slate-300'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {cust.tier}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="font-extrabold text-slate-900 tabular-nums text-sm">
                          {cust.currentPointsBalance.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1">pts</span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-emerald-700 tabular-nums">
                          ₹{rupeeVal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-500 text-[11px]">
                        {new Date(cust.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedCustomerIdForWallet(cust.id);
                              setCurrentPortal('wallet');
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Open Customer Wallet Pass"
                          >
                            <Wallet className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingCustomer(cust)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit customer details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedCustomer(cust)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="View member ledger & details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER DETAIL DRAWER / MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Drawer Header */}
            <div>
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>{selectedCustomer.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white border border-slate-200 text-slate-700">
                        {selectedCustomer.tier}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">
                      ID: {selectedCustomer.id} &bull; +91 {selectedCustomer.mobileNumber}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Balance & Value Spotlight */}
              <div className="p-6 grid grid-cols-2 gap-4 border-b border-slate-800 bg-slate-900 text-white">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Available Balance
                  </div>
                  <div className="text-3xl font-extrabold mt-1 tabular-nums">
                    {selectedCustomer.currentPointsBalance}{' '}
                    <span className="text-xs font-normal text-slate-300">pts</span>
                  </div>
                  <div className="text-xs text-emerald-400 mt-0.5">
                    Equivalent Value: ₹{(selectedCustomer.currentPointsBalance * (config.pointValue || 1)).toFixed(2)}
                  </div>
                </div>

                <div className="border-l border-slate-800 pl-4 flex flex-col justify-center gap-1.5 text-xs text-slate-300">
                  <div>
                    Lifetime Earned:{' '}
                    <span className="font-bold text-white">
                      {selectedCustomer.lifetimePointsEarned} pts
                    </span>
                  </div>
                  <div>
                    Lifetime Redeemed:{' '}
                    <span className="font-bold text-white">
                      {selectedCustomer.lifetimePointsRedeemed} pts
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAdjustModal(true)}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-2"
                  >
                    <Sliders className="w-3 h-3" />
                    Manual Points Adjustment
                  </button>
                </div>
              </div>

              {/* Customer Info Pills */}
              <div className="p-6 border-b border-slate-100 grid grid-cols-2 gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{selectedCustomer.city || 'Mumbai, India'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>+91 {selectedCustomer.mobileNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Registered {new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Customer Transaction Ledger */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Activity & Audit Ledger ({customerTransactions.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">Chronological history</span>
                </div>

                {customerTransactions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl">
                    No transactions recorded for this customer yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerTransactions.map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                                t.type === 'earn'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : t.type === 'redeem'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : t.type === 'refund'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              {t.type}
                            </span>
                            <span className="font-mono text-slate-500">{t.reference}</span>
                          </div>
                          <span
                            className={`font-bold tabular-nums text-sm ${
                              t.pointsDelta > 0 ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {t.pointsDelta > 0 ? `+${t.pointsDelta}` : t.pointsDelta} pts
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span>{t.notes || `${t.source} interaction`}</span>
                          <span>
                            Balance after: <strong className="text-slate-800">{t.balanceAfter} pts</strong>
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between">
                          <span>Rule: 1 pt = ₹{t.pointValueSnapshot}</span>
                          <span>{new Date(t.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedCustomerIdForWallet(selectedCustomer.id);
                  setCurrentPortal('wallet');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span>Open in Customer Wallet</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setCurrentPortal('store');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Store className="w-4 h-4" />
                <span>Process POS Purchase</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DEMO CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Register New Demo Customer
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  placeholder="e.g. Diya Sengupta"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number (Lookup Key) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-semibold">+91</span>
                  <input
                    type="tel"
                    required
                    value={newCustomerForm.mobileNumber}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, mobileNumber: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-11 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                  placeholder="diya@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Tier
                  </label>
                  <select
                    value={newCustomerForm.tier}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, tier: e.target.value as CustomerTier })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Classic">Classic</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newCustomerForm.city}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Edit Member Details ({editingCustomer.id})
              </h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={editingCustomer.mobileNumber}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, mobileNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingCustomer.email}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tier
                  </label>
                  <select
                    value={editingCustomer.tier}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, tier: e.target.value as CustomerTier })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Classic">Classic</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.city || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL ADJUST MODAL */}
      {showAdjustModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Manual Points Adjustment
              </h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Add or deduct points directly for {selectedCustomer.name}. A permanent audit ledger entry will be created.
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Points Delta (+ for credit, - for debit)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={adjustPointsValue}
                  onChange={(e) => setAdjustPointsValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none font-bold text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  New balance will become: {selectedCustomer.currentPointsBalance + adjustPointsValue} pts
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Adjustment Reason / Notes *
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. VIP birthday bonus, billing discrepancy goodwill"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
