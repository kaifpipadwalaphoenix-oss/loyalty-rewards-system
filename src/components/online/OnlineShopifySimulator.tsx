import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import type { PaymentStatus } from '../../types/loyalty';
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Wallet,
  FileCode,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const OnlineShopifySimulator: React.FC = () => {
  const {
    customers,
    config,
    webhookEvents,
    transactions,
    simulateShopifyOrderPaid,
    simulateShopifyRefund,
    setCurrentPortal,
    setSelectedCustomerIdForWallet,
  } = useLoyalty();

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[1]?.id || 'CUST-002'); // Default to Priya Patel
  const [orderReference, setOrderReference] = useState<string>(() => `WEB-ORD-${Math.floor(Math.random() * 89999 + 10000)}`);
  const [orderAmount, setOrderAmount] = useState<number>(3200);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('completed');
  const [gateway] = useState<string>('Razorpay (UPI / Cards)');

  // Expand payload toggle
  const [expandedPayloadId, setExpandedPayloadId] = useState<string | null>(null);

  // Selected customer object
  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const handleGenerateNewRef = () => {
    setOrderReference(`WEB-ORD-${Math.floor(Math.random() * 89999 + 10000)}`);
  };

  const handleDispatchWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer || orderAmount <= 0) return;

    simulateShopifyOrderPaid({
      customerId: activeCustomer.id,
      orderReference,
      amount: orderAmount,
      paymentStatus,
      paymentGateway: gateway,
    });
  };

  const handleRefundOrder = (ref: string) => {
    simulateShopifyRefund({
      orderReference: ref,
      reason: 'Online customer returned item within 14-day policy',
    });
  };

  // Recent online transactions that can be refunded
  const onlineEarnTxns = transactions.filter(
    (t) => t.source === 'Online' && t.type === 'earn' && t.status === 'completed'
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Architecture Integration Simulation</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Shopify Storefront & Razorpay Webhook Simulator
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Simulate online e-commerce checkouts. In production, Shopify emits server-side webhooks to Trove Label's loyalty engine upon verified Razorpay payment confirmation.
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right shrink-0">
          <div className="text-[10px] uppercase font-bold text-slate-400">
            Active Earning Rule
          </div>
          <div className="text-xs font-bold text-slate-900 mt-0.5">
            ₹{config.purchaseThreshold} spend = {config.pointsPerThreshold} pts
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            Online Earning: {config.onlineEarningEnabled ? 'Enabled' : 'Paused'}
          </div>
        </div>
      </div>

      {/* Conceptual Architecture Flow Diagram */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Omnichannel Integration Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
            <div className="font-bold text-white">1. Shopify Cart</div>
            <div className="text-slate-400 text-[11px] mt-1">Customer checks out on storefront</div>
          </div>

          <div className="hidden md:flex justify-center text-slate-500">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
            <div className="font-bold text-blue-300">2. Razorpay Gateway</div>
            <div className="text-slate-400 text-[11px] mt-1">Collects UPI/Card payment</div>
          </div>

          <div className="hidden md:flex justify-center text-slate-500">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-emerald-500/40 text-center">
            <div className="font-bold text-emerald-400">3. Trove Loyalty Engine</div>
            <div className="text-slate-400 text-[11px] mt-1">Receives webhook & awards points</div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-4 leading-relaxed pt-3 border-t border-slate-800">
          <strong>Security Boundary:</strong> No direct database connection to Shopify. Communication occurs over authenticated HTTPS webhooks. Payments are verified through Razorpay's server signature before loyalty ledger credits are written.
        </p>
      </div>

      {/* Simulator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Webhook Event Dispatcher (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Dispatch Simulated Order Webhook
              </h2>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                POST /api/webhooks/shopify/orders-paid
              </span>
            </div>

            <form onSubmit={handleDispatchWebhook} className="space-y-4 text-xs">
              {/* Customer Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer / Shopify Account *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (+91 {c.mobileNumber}) — Current Balance: {c.currentPointsBalance} pts
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Reference */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Shopify Order Reference *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateNewRef}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Generate New ID
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={orderReference}
                  onChange={(e) => setOrderReference(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Try submitting the same order ID twice to demonstrate idempotency duplicate rejection.
                </p>
              </div>

              {/* Order Amount */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Order Total Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="50"
                    required
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl font-bold text-base text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {[1500, 2500, 3200, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setOrderAmount(amt)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                        orderAmount === amt
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Status Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gateway Payment Confirmation Status *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'completed', label: 'Paid (Success)', desc: 'Razorpay captured' },
                    { id: 'pending', label: 'Pending Auth', desc: 'Awaiting webhook' },
                    { id: 'failed', label: 'Failed / Void', desc: 'Dropped payment' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setPaymentStatus(s.id as PaymentStatus)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        paymentStatus === s.id
                          ? s.id === 'completed'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                            : 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">{s.label}</div>
                      <div className="text-[10px] font-normal opacity-80">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Calculation Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Calculated Loyalty Award:
                  </span>
                  <span className="text-lg font-extrabold text-emerald-700 tabular-nums">
                    {paymentStatus === 'completed'
                      ? `+${Math.floor(orderAmount / config.purchaseThreshold) * config.pointsPerThreshold} points`
                      : '0 points (Unconfirmed)'}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span>Current balance: {activeCustomer.currentPointsBalance} pts</span>
                  <div className="font-semibold text-slate-900">
                    Est. after event:{' '}
                    {paymentStatus === 'completed'
                      ? activeCustomer.currentPointsBalance +
                        Math.floor(orderAmount / config.purchaseThreshold) * config.pointsPerThreshold
                      : activeCustomer.currentPointsBalance}{' '}
                    pts
                  </div>
                </div>
              </div>

              {/* Submit Webhook Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" />
                <span>Simulate Shopify Webhook Trigger</span>
              </button>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="text-slate-500">Need to check customer balance?</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomerIdForWallet(activeCustomer.id);
                    setCurrentPortal('wallet');
                  }}
                  className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Open {activeCustomer.name.split(' ')[0]}'s Wallet Pass &rarr;</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Webhook Logs & Online Refunds (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Online Refund Simulation Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Online Refund / Reversal Simulator
              </h3>
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </div>

            <p className="text-xs text-slate-500">
              When a customer returns an online order in Shopify, an incoming refund event automatically reverses the previously credited points.
            </p>

            {onlineEarnTxns.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl">
                No online earning transactions available to refund.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {onlineEarnTxns.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-900">{t.reference}</div>
                      <div className="text-[11px] text-slate-500">
                        {t.customerName} &bull; +{t.pointsDelta} pts
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRefundOrder(t.reference)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] transition-colors"
                    >
                      Trigger Refund
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Webhook Event Stream Log */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Simulated Webhook Event Log
                </h3>
                <span className="text-[11px] text-slate-400">
                  {webhookEvents.length} events recorded in memory
                </span>
              </div>
              <FileCode className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
              {webhookEvents.map((evt) => {
                const isProcessed = evt.status === 'processed';
                const isDuplicate = evt.status === 'rejected_duplicate';
                const isExpanded = expandedPayloadId === evt.id;

                return (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isProcessed
                              ? 'bg-emerald-500'
                              : isDuplicate
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className="font-mono font-bold text-slate-800">
                          {evt.orderReference}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isProcessed
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDuplicate
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {evt.status === 'processed' ? '200 OK' : evt.status === 'rejected_duplicate' ? '409 DUPLICATE' : '400 FAILED'}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Topic: {evt.topic}</span>
                      <span>
                        {evt.pointsAwarded ? `+${evt.pointsAwarded} pts` : evt.pointsReversed ? `-${evt.pointsReversed} pts` : '0 pts'}
                      </span>
                    </div>

                    {/* Toggle raw JSON payload */}
                    <button
                      type="button"
                      onClick={() => setExpandedPayloadId(isExpanded ? null : evt.id)}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Raw Payload' : 'View Raw Webhook JSON'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isExpanded && (
                      <pre className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto">
                        {JSON.stringify(evt, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
