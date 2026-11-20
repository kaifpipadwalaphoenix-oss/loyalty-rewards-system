import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import {
  Globe,
  Store,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  ShieldCheck,
  RefreshCw,
  Database,
  Layers,
  HelpCircle,
  FileText,
  CreditCard,
  Key,
} from 'lucide-react';

// --- Flow Step type for animated simulators ---
interface FlowStep {
  id: number;
  label: string;
  sublabel: string;
  status: 'idle' | 'active' | 'done' | 'error';
  duration: number; // ms
}

const SHOPIFY_FLOW_STEPS: Omit<FlowStep, 'status'>[] = [
  { id: 1, label: 'Customer Checkout', sublabel: 'Cart finalised on Shopify storefront', duration: 400 },
  { id: 2, label: 'Razorpay Gateway', sublabel: 'Payment authorisation request sent to gateway', duration: 600 },
  { id: 3, label: 'Payment Verified', sublabel: 'Razorpay confirms capture → emits callback to Shopify', duration: 700 },
  { id: 4, label: 'Shopify Webhook', sublabel: 'orders/paid HMAC-signed event dispatched to loyalty endpoint', duration: 500 },
  { id: 5, label: 'Idempotency Check', sublabel: 'Loyalty engine verifies orderReference not already processed', duration: 300 },
  { id: 6, label: 'Points Calculated', sublabel: 'Engine reads active rule → computes qualifying award', duration: 350 },
  { id: 7, label: 'Ledger Updated', sublabel: 'Transaction written with rule snapshot, customer balance incremented', duration: 400 },
  { id: 8, label: 'Confirmation', sublabel: 'Customer wallet updated; ready for in-store or online redemption', duration: 300 },
];

const POS_FLOW_STEPS: Omit<FlowStep, 'status'>[] = [
  { id: 1, label: 'Mobile Lookup', sublabel: 'Cashier enters customer mobile in web terminal → record retrieved', duration: 300 },
  { id: 2, label: 'Bill Entry', sublabel: 'Cashier enters purchase amount in POS interface', duration: 300 },
  { id: 3, label: 'Redemption (Optional)', sublabel: 'Customer requests point redemption; engine validates policy cap', duration: 500 },
  { id: 4, label: 'Payment Tender', sublabel: 'Customer pays via Cash, UPI QR, Card POS, or Razorpay link', duration: 700 },
  { id: 5, label: 'Cashier Confirmation', sublabel: 'Cashier verifies payment collected → confirms transaction in app', duration: 400 },
  { id: 6, label: 'Points Awarded', sublabel: 'Engine calculates earn on bill; points credited to shared balance', duration: 350 },
  { id: 7, label: 'Receipt Printed', sublabel: 'Thermal receipt printed showing points earned + updated balance', duration: 300 },
];

function FlowSimulator({
  title,
  steps: baseSteps,
  accentColor,
}: {
  title: string;
  steps: Omit<FlowStep, 'status'>[];
  accentColor: 'emerald' | 'blue';
}) {
  const [steps, setSteps] = useState<FlowStep[]>(
    baseSteps.map((s) => ({ ...s, status: 'idle' }))
  );
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const accent = accentColor === 'emerald'
    ? { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', btn: 'bg-emerald-600 hover:bg-emerald-700', active: 'border-emerald-500 bg-emerald-50/50', done: 'border-emerald-200 bg-white', dot: 'bg-emerald-600' }
    : { badge: 'bg-blue-50 text-blue-800 border-blue-200', btn: 'bg-blue-600 hover:bg-blue-700', active: 'border-blue-500 bg-blue-50/50', done: 'border-blue-200 bg-white', dot: 'bg-blue-600' };

  const runFlow = async () => {
    if (running) return;
    setRunning(true);
    setDone(false);
    setSteps(baseSteps.map((s) => ({ ...s, status: 'idle' })));

    for (let i = 0; i < baseSteps.length; i++) {
      setSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status: idx === i ? 'active' : idx < i ? 'done' : 'idle',
        }))
      );
      await new Promise((r) => setTimeout(r, baseSteps[i].duration));
    }

    setSteps((prev) => prev.map((s) => ({ ...s, status: 'done' })));
    setRunning(false);
    setDone(true);
  };

  const reset = () => {
    setSteps(baseSteps.map((s) => ({ ...s, status: 'idle' })));
    setRunning(false);
    setDone(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${accent.badge} mb-2`}>
            <Zap className="w-3 h-3" />
            Interactive Simulation
          </span>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {done && (
            <button onClick={reset} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Reset flow">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={runFlow}
            disabled={running}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${accent.btn} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {running ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Simulating…
              </>
            ) : done ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Run Step-by-Step
              </>
            )}
          </button>
        </div>
      </div>

      {/* Flow Steps */}
      <div className="relative">
        <div className="absolute left-4 top-3 bottom-3 w-px bg-slate-200" />
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={`relative flex items-start gap-3.5 pl-9 pr-3.5 py-2.5 rounded-xl border transition-all duration-300 ${
                step.status === 'active'
                  ? accent.active
                  : step.status === 'done'
                  ? accent.done
                  : 'border-transparent bg-transparent'
              }`}
            >
              {/* Step indicator dot */}
              <div
                className={`absolute left-2.5 w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                  step.status === 'done'
                    ? `${accent.dot} border-transparent`
                    : step.status === 'active'
                    ? `${accent.dot} border-white ring-2 ring-emerald-400 animate-pulse`
                    : 'bg-white border-slate-300'
                }`}
                style={{ top: '13px' }}
              />
              <div className="flex-1 min-w-0">
                <div className={`flex items-center gap-2 text-xs font-bold ${step.status === 'idle' ? 'text-slate-400' : 'text-slate-900'}`}>
                  <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold shrink-0 ${
                    step.status === 'done' ? `${accent.dot} text-white` : 'bg-slate-100 text-slate-500'
                  }`}>
                    {i + 1}
                  </span>
                  <span>{step.label}</span>
                  {step.status === 'active' && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Executing…
                    </span>
                  )}
                  {step.status === 'done' && (
                    <CheckCircle2 className="ml-auto w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </div>
                <div className={`text-[11px] mt-0.5 pl-6 ${step.status === 'idle' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {step.sublabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Integration Card Component ---
interface IntegrationCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  status: 'existing' | 'proposed' | 'to_confirm';
  statusLabel: string;
  details: { label: string; value: string }[];
  events?: string[];
  notes?: string;
  color: 'emerald' | 'blue' | 'violet' | 'amber';
}

function IntegrationCard({
  icon: Icon,
  title,
  subtitle,
  status: _status,
  statusLabel,
  details,
  events,
  notes,
  color,
}: IntegrationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const colorMap = {
    emerald: { icon: 'bg-emerald-50 text-emerald-700 border-emerald-200', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    blue: { icon: 'bg-blue-50 text-blue-700 border-blue-200', badge: 'bg-blue-50 text-blue-800 border-blue-300' },
    violet: { icon: 'bg-violet-50 text-violet-700 border-violet-200', badge: 'bg-violet-50 text-violet-800 border-violet-300' },
    amber: { icon: 'bg-amber-50 text-amber-700 border-amber-200', badge: 'bg-amber-50 text-amber-800 border-amber-300' },
  };

  const c = colorMap[color];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${c.icon}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${c.badge} shrink-0`}>
            {statusLabel}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {details.map((d) => (
            <div key={d.label} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{d.label}</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">{d.value}</div>
            </div>
          ))}
        </div>

        {notes && (
          <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
            {notes}
          </p>
        )}

        {events && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <span>Supported Events ({events.length})</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expanded && (
              <div className="mt-2 space-y-1">
                {events.map((e) => (
                  <div key={e} className="flex items-center gap-2 text-xs py-1 px-2.5 bg-slate-50 rounded-md font-mono text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {e}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Integrations Panel ---
export const IntegrationsPanel: React.FC = () => {
  const { webhookEvents, transactions, customers } = useLoyalty();

  const processedWebhooks = webhookEvents.filter((e) => e.status === 'processed').length;
  const onlineTxns = transactions.filter((t) => t.source === 'Online').length;
  const storeTxns = transactions.filter((t) => t.source === 'Store').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">

      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Technical Solution Architecture</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Proposed Omnichannel Architecture &amp; Integrations
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              This document outlines the proposed custom loyalty architecture for Trove Label. 
              The system connects Trove Label's existing Shopify store and physical retail stores under 
              <strong> one customer account and one unified points balance</strong>.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2 text-center">
              <div className="text-xs font-bold text-slate-900 tabular-nums">{customers.length}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Linked Members</div>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2 text-center">
              <div className="text-xs font-bold text-slate-900 tabular-nums">{onlineTxns}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Online Orders</div>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2 text-center">
              <div className="text-xs font-bold text-slate-900 tabular-nums">{storeTxns}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Store Sales</div>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2 text-center">
              <div className="text-xs font-bold text-slate-900 tabular-nums">{processedWebhooks}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Webhooks Ingested</div>
            </div>
          </div>
        </div>

        {/* Fundamental Technical Distinction Banner */}
        <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Core System Boundary:</strong> Shopify powers e-commerce. Razorpay processes payments. 
              The proposed Trove Loyalty Engine independently owns programme rules, customer balances, and the immutable audit ledger.
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium shrink-0">
            Zero third-party SaaS loyalty subscription fees
          </span>
        </div>
      </div>

      {/* SECTION 1: PROPOSED SYSTEM ARCHITECTURE DIAGRAM */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-800 text-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              System Blueprint
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Omnichannel Architecture — 4-Tier Component Topology
            </h2>
          </div>
          {/* Visual Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
              Existing Client Infrastructure
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              Proposed Loyalty Microservice
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
              Integration Point to Confirm
            </span>
          </div>
        </div>

        {/* Tier Diagram Grid */}
        <div className="space-y-4 text-xs">
          {/* Tier 1: Channels */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
              Tier 1 — Customer Purchasing Channels
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-800 border-2 border-blue-500/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Trove Shopify Storefront</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300">Existing</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Online product catalog, customer cart, and checkout at trovelabel.com</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800 border-2 border-emerald-500/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Store Cashier Web Terminal</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">Proposed</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Browser-based POS for store staff. Fast mobile lookup, tender selection, receipt issuance</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800 border-2 border-emerald-500/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Customer Rewards Web Wallet</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">Proposed</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Mobile-optimized member pass showing points balance, ₹ value, and in-store QR pass</p>
              </div>
            </div>
          </div>

          {/* Connection Arrows */}
          <div className="flex justify-around text-slate-600 text-[10px] font-mono">
            <span>↓ orders/paid Webhooks (HTTPS HMAC)</span>
            <span>↓ REST / GraphQL API</span>
            <span>↓ Token Authenticated Query</span>
          </div>

          {/* Tier 2: Core Loyalty Backend Service */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
              Tier 2 — Proprietary Loyalty Backend Service (Proposed Private Microservice)
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/40 border-2 border-emerald-500/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-300 text-sm">Trove Label Loyalty Rules &amp; Ledger Engine</span>
                  <span className="ml-2 text-[10px] font-mono text-emerald-400 font-semibold">Node.js / Go / Spring Boot Microservice</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Proposed Core
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700">
                  <div className="font-bold text-white">Dynamic Rules Engine</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Spend-to-points ratio, rupee valuation, redemption caps</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700">
                  <div className="font-bold text-white">Idempotency Guard</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Deduplication table ensuring webhooks never double-credit</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700">
                  <div className="font-bold text-white">Redemption Validator</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Enforces minimum barrier &amp; bill % cap strictly</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700">
                  <div className="font-bold text-white">Reversal &amp; Expiry Worker</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Automated refund reversal &amp; rolling expiration tracking</div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Arrows */}
          <div className="flex justify-around text-slate-600 text-[10px] font-mono">
            <span>↓ ACID Database Transactions</span>
            <span>↕ Payment Verification Handshake</span>
          </div>

          {/* Tier 3: Payment & Persistence Infrastructure */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
              Tier 3 — Payment Infrastructure &amp; Data Storage
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-800 border-2 border-blue-500/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-300">Razorpay Payment Gateway</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300">Existing</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Processes UPI, cards, and netbanking for Shopify checkout. Verifies payment capture before loyalty points are credited.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800 border-2 border-emerald-500/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300">Central PostgreSQL Database</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">Proposed</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Immutable double-entry transaction ledger, customer accounts, immutable rule execution snapshots, and webhook logs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: HOW WE PROPOSE TO BUILD THIS (SECTION 10 REQUIREMENT) */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Implementation Blueprint</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            How We Propose to Build This for Trove Label
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear, honest technical explanation of how each subsystem will connect in production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Card 1: Core Loyalty Backend */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Custom Loyalty Backend Service</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              We propose deploying an independent, private backend service (e.g. Node.js/TypeScript on AWS or GCP). 
              This service acts as the single source of truth for loyalty rules, member accounts, and the immutable transaction ledger.
            </p>
            <ul className="list-disc list-inside text-slate-500 space-y-1 pl-1">
              <li>Stateless calculation engine running floor arithmetic.</li>
              <li>Every transaction captures an immutable snapshot of the active rules at that exact moment.</li>
              <li>Future rule changes apply strictly prospectively; historical ledger entries never change.</li>
            </ul>
          </div>

          {/* Card 2: Shopify Storefront Connection */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Connecting Trove Label's Shopify Store</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              We do <strong>not</strong> replace Shopify. Shopify continues managing product catalog, cart, customer authentication, and orders.
            </p>
            <ul className="list-disc list-inside text-slate-500 space-y-1 pl-1">
              <li><strong>Earning:</strong> Shopify dispatches an HTTPS webhook (<code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">orders/paid</code>) to our endpoint upon confirmed payment.</li>
              <li><strong>Security:</strong> All incoming payloads are verified using Shopify's HMAC-SHA256 signature header.</li>
              <li><strong>Idempotency:</strong> Duplicate webhook retries are rejected automatically via unique orderReference checks.</li>
              <li><strong>Refunds:</strong> Webhook <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">refunds/create</code> triggers proportional reversal of credited points.</li>
            </ul>
          </div>

          {/* Card 3: Razorpay's Role */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-800 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Razorpay Payment Processing</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Razorpay is the payment provider, <strong>not</strong> the loyalty database. Installing Razorpay does not create loyalty balances.
            </p>
            <ul className="list-disc list-inside text-slate-500 space-y-1 pl-1">
              <li><strong>Online:</strong> Razorpay captures payments through Shopify's standard payment gateway adapter.</li>
              <li><strong>Payment vs Loyalty:</strong> Points are only credited once Razorpay confirms payment capture. Unpaid, pending, or abandoned carts earn zero points.</li>
              <li><strong>No Double Dipping:</strong> Loyalty redemption discounts are separated from Razorpay bank offers to prevent accidental discount stacking.</li>
            </ul>
          </div>

          {/* Card 4: Physical Store Cashier Application */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Standalone Physical Store Cashier Terminal</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Trove Label does not have an established POS system. We provide an independent, browser-based Cashier Web Terminal that runs on any tablet, iPad, or desktop.
            </p>
            <ul className="list-disc list-inside text-slate-500 space-y-1 pl-1">
              <li>Cashier identifies customer using their 10-digit mobile number (+91).</li>
              <li>Enter purchase amount → system displays real-time points to be earned.</li>
              <li>Apply available points redemption (capped at configured policy max, e.g. 30%).</li>
              <li>Accepts Cash, Card, UPI QR, or Razorpay payment links.</li>
              <li>Instantly prints thermal receipts and updates the central customer balance.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 3: ITEMS TO CONFIRM WITH TROVE LABEL (SECTION 10 REQUIREMENT) */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>Consulting Decisions</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Items to Confirm with Trove Label Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            These are business and architectural decisions requiring Trove Label's stakeholder sign-off prior to production deployment.
          </p>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {/* Decision 1 */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-400">01</span>
                <span className="font-bold text-slate-900">Physical Store Payment Methods &amp; Hardware</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Pending Decision</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Will store staff use an integrated Razorpay Smart POS card terminal, standalone bank EDC swipe machines, static UPI QR codes, or cash? 
                (Our proposed web terminal supports all methods; integrated EDC automatically passes payment confirmation).
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 font-semibold">Demo Default:</span>
              <div className="font-bold text-slate-800">Cashier Tender Selector (UPI/Card/Cash)</div>
            </div>
          </div>

          {/* Decision 2 */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-400">02</span>
                <span className="font-bold text-slate-900">Points Earning Base: Gross Bill vs. Net Paid Amount</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Pending Decision</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                When a customer redeems ₹300 worth of points on a ₹1,000 purchase (paying ₹700 net), should they earn points on ₹1,000 (gross bill) or ₹700 (net cash paid)?
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 font-semibold">Demo Default:</span>
              <div className="font-bold text-slate-800">Gross Bill (Admin Configurable)</div>
            </div>
          </div>

          {/* Decision 3 */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-400">03</span>
                <span className="font-bold text-slate-900">Online Checkout Redemption Workflow</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Pending Decision</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Does Trove Label subscribe to Shopify Plus (which unlocks Checkout Extensibility app blocks), or standard Shopify (requiring automated draft order / discount code generation via Admin API)?
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 font-semibold">Demo Default:</span>
              <div className="font-bold text-slate-800">Verified Webhook + Discount Voucher API</div>
            </div>
          </div>

          {/* Decision 4 */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-400">04</span>
                <span className="font-bold text-slate-900">Return &amp; Refund Point Handling</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Pending Decision</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                When a customer returns an online purchase, are points fully reversed? If the customer already spent those points on a subsequent store visit, does their balance go negative?
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 font-semibold">Demo Default:</span>
              <div className="font-bold text-slate-800">Automatic Reversal on refunds/create</div>
            </div>
          </div>

          {/* Decision 5 */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-400">05</span>
                <span className="font-bold text-slate-900">Redemption Thresholds &amp; Bill Cap</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Pending Decision</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                What should the barrier to redemption be? Trove Label must decide the minimum points needed to unlock discounts (e.g. 50 points = ₹50) and the maximum percentage of bill payable via points (e.g. 30%).
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 font-semibold">Demo Default:</span>
              <div className="font-bold text-slate-800">Min 50 pts · Max 30% Bill Cap</div>
            </div>
          </div>

          {/* Decision 6 */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-400">06</span>
                <span className="font-bold text-slate-900">Points Validity &amp; Expiration Policy</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Pending Decision</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Should points expire on a 12-month rolling basis from the date earned, expire on a fixed calendar date (e.g. 31st March), or never expire?
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 font-semibold">Demo Default:</span>
              <div className="font-bold text-slate-800">12 Months Rolling Expiry</div>
            </div>
          </div>

          {/* Decision 7 */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-400">07</span>
                <span className="font-bold text-slate-900">Customer Communication Channels</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Pending Decision</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                How should customers be notified when points are earned or nearing expiry? (Options: SMS via DLT-approved provider like MSG91, WhatsApp Business API, or Shopify Transactional Email).
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 font-semibold">Demo Default:</span>
              <div className="font-bold text-slate-800">In-App Wallet + SMS Stub</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: CONNECTED INTEGRATIONS DETAIL CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Integration Specifications</h2>
            <p className="text-xs text-slate-500">Technical details for each interconnected system component</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IntegrationCard
            icon={Globe}
            title="Shopify E-Commerce Storefront"
            subtitle="trovelabel.myshopify.com"
            status="existing"
            statusLabel="Existing Platform"
            color="blue"
            details={[
              { label: 'Integration Type', value: 'REST Webhooks + Admin API' },
              { label: 'Auth Method', value: 'HMAC-SHA256 Header' },
              { label: 'Earning Trigger', value: 'orders/paid event' },
              { label: 'Reversal Trigger', value: 'refunds/create event' },
            ]}
            notes="Shopify processes storefront checkout. Our backend listens to verified webhooks to credit points. Customer identity is matched via customer phone number or email."
            events={['orders/paid', 'orders/cancelled', 'refunds/create', 'customers/create']}
          />

          <IntegrationCard
            icon={CreditCard}
            title="Razorpay Payment Gateway"
            subtitle="Online Checkout &amp; Store Terminal"
            status="existing"
            statusLabel="Payment Processor"
            color="violet"
            details={[
              { label: 'Online Flow', value: 'Razorpay Checkout SDK' },
              { label: 'Offline Flow', value: 'Smart POS / Dynamic QR' },
              { label: 'Verification', value: 'payment.captured callback' },
              { label: 'Settlement', value: 'T+1 Bank Settlement' },
            ]}
            notes="Processes currency transactions. Does not store loyalty balances. Points are awarded only when Razorpay confirms full payment capture."
            events={['payment.captured', 'payment.failed', 'refund.processed', 'order.paid']}
          />

          <IntegrationCard
            icon={Store}
            title="Physical Store Cashier Terminal"
            subtitle="Independent Web-Based POS"
            status="proposed"
            statusLabel="Proposed Component"
            color="emerald"
            details={[
              { label: 'Deployment', value: 'Any Browser / Tablet' },
              { label: 'Lookup Method', value: '10-digit Mobile (+91)' },
              { label: 'Payment Tenders', value: 'Cash, UPI, Card, Link' },
              { label: 'Hardware Required', value: 'Thermal Printer (80mm)' },
            ]}
            notes="Operates independently without requiring Trove Label to invest in an enterprise retail POS system. Store staff access via secure web login."
          />

          <IntegrationCard
            icon={Database}
            title="Proprietary Loyalty Engine API"
            subtitle="Central Calculation &amp; Ledger Core"
            status="proposed"
            statusLabel="Proposed Core"
            color="amber"
            details={[
              { label: 'Architecture', value: 'Stateless Pure Functions' },
              { label: 'Persistence', value: 'PostgreSQL ACID Ledger' },
              { label: 'Idempotency', value: 'Unique Order Constraint' },
              { label: 'Execution Mode', value: 'Synchronous Calculation' },
            ]}
            notes="Calculates points according to administrator-managed rules. Generates immutable audit snapshots for every earn, redeem, and adjustment transaction."
          />
        </div>
      </div>

      {/* SECTION 5: INTERACTIVE STEP-BY-STEP FLOW SIMULATORS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Interactive Workflow Simulators</h2>
            <p className="text-xs text-slate-500">Run through the automated lifecycle to verify the proposed business logic</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FlowSimulator
            title="Flow A: Shopify Online Order → Razorpay Capture → Point Award"
            steps={SHOPIFY_FLOW_STEPS}
            accentColor="blue"
          />
          <FlowSimulator
            title="Flow B: Physical Store Cashier Checkout → Point Redemption"
            steps={POS_FLOW_STEPS}
            accentColor="emerald"
          />
        </div>
      </div>

      {/* SECTION 6: WEBHOOK EVENT LOG & AUDIT LOG */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Simulated Webhook Audit Log</h3>
            <p className="text-xs text-slate-500">
              Live record of incoming Shopify webhook payloads processed by the prototype engine
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {webhookEvents.length} recorded events
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {webhookEvents.map((evt) => (
            <div key={evt.id} className="py-3.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  evt.status === 'processed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : evt.status === 'rejected_duplicate'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-rose-50 text-rose-700'
                }`}>
                  {evt.status === 'processed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : evt.status === 'rejected_duplicate' ? (
                    <RefreshCw className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{evt.orderReference}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-600">
                      {evt.topic}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Received: {new Date(evt.processedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} &bull; Customer: {customers.find(c => c.id === evt.customerId)?.name || evt.customerId}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-bold text-slate-900">₹{evt.amount.toLocaleString('en-IN')}</div>
                <div className={`text-[11px] font-semibold mt-0.5 ${(evt.pointsAwarded ?? 0) > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {(evt.pointsAwarded ?? 0) > 0 ? `+${evt.pointsAwarded ?? 0}` : (evt.pointsAwarded ?? 0)} pts
                </div>
                <span className={`inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold mt-1 ${
                  evt.status === 'processed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : evt.status === 'rejected_duplicate'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {evt.status === 'processed' ? '200 PROCESSED' : evt.status === 'rejected_duplicate' ? '409 DUPLICATE' : '400 FAILED'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-slate-400" />
            Verified via HMAC-SHA256 signature against Shopify Shared Secret
          </span>
          <span>Idempotent deduplication active</span>
        </div>
      </div>

    </div>
  );
};
