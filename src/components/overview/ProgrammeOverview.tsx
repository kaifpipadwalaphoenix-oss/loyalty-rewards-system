import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import {
  Sparkles,
  ShoppingBag,
  Store,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Coins,
  Layers,
  Info,
} from 'lucide-react';

export const ProgrammeOverview: React.FC = () => {
  const {
    setCurrentPortal,
    setSelectedCustomerIdForWallet,
    customers,
  } = useLoyalty();

  // Find demo customers
  const aarav = customers.find((c) => c.mobileNumber === '9820123456') || customers[0];
  const priya = customers.find((c) => c.mobileNumber === '9811187654') || customers[1];
  const maya = customers.find((c) => c.mobileNumber === '9833445566') || customers[customers.length - 1];

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerIdForWallet(customerId);
    setCurrentPortal('wallet');
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12 animate-fadeIn">
      {/* 1. Hero Introduction */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 to-slate-900 text-white rounded-2xl p-8 sm:p-12 shadow-xl border border-stone-800">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trove Label Omnichannel Concept</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-light tracking-tight leading-tight">
            One Customer. <br />
            <span className="font-normal italic text-amber-200">One Rewards Balance.</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed pt-2">
            A proprietary customer loyalty experience designed specifically for Trove Label.
            Whether your customer shops vacation resortwear online at{' '}
            <strong className="text-white">trovelabel.com</strong> or visits your physical boutiques,
            they earn and redeem rewards through a single, effortless mobile identity.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-3 text-xs text-amber-300/80">
            <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/10 font-medium">
              Illustrative Demonstration — Subject to Trove Label Approval
            </span>
          </div>
        </div>
      </section>

      {/* 2. The Core Customer Journey (Visual Storyboard) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold tracking-wider text-amber-800 uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            How The Programme Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-normal">
            The Complete Rewards Journey
          </h2>
          <p className="text-slate-600 text-sm">
            Designed to be frictionless for both your customers and your boutique staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Step 1: Shop */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm relative flex flex-col justify-between hover:border-amber-300 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-stone-100 text-slate-800 flex items-center justify-center font-serif font-semibold text-lg border border-stone-200">
                1
              </div>
              <h3 className="font-serif font-semibold text-slate-900 text-lg">
                Shop at Trove Label
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customer purchases resortwear, linen co-ords, or swimwear online on Shopify or at a physical boutique store.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
              Example: Spends <strong className="text-slate-900">₹1,000</strong>
            </div>
          </div>

          {/* Step 2: Earn */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm relative flex flex-col justify-between hover:border-amber-300 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-serif font-semibold text-lg border border-amber-200">
                2
              </div>
              <h3 className="font-serif font-semibold text-slate-900 text-lg">
                Earn Points
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Points are calculated automatically using your business rules (e.g. 10 points for every ₹100 spent).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-emerald-600 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              <span>Earns <strong className="text-emerald-700">+100 points</strong></span>
            </div>
          </div>

          {/* Step 3: Collect */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm relative flex flex-col justify-between hover:border-amber-300 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-serif font-semibold text-lg border border-blue-200">
                3
              </div>
              <h3 className="font-serif font-semibold text-slate-900 text-lg">
                Collect Rewards
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Points sit securely in the customer's loyalty wallet, accessible by mobile number across all channels.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-blue-700 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" />
              <span>Balance: <strong className="text-blue-800">350 points (₹350)</strong></span>
            </div>
          </div>

          {/* Step 4: Save */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm relative flex flex-col justify-between hover:border-amber-300 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-serif font-semibold text-lg border border-emerald-200">
                4
              </div>
              <h3 className="font-serif font-semibold text-slate-900 text-lg">
                Save Next Time
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Redeem available points as an instant discount at checkout in-store or online on trovelabel.com.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Redeem 50 pts &rarr; <strong className="text-emerald-800">Save ₹50</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Omnichannel Unification: Store + Online */}
      <section className="bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Unified Loyalty Ledger</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-slate-900 font-normal">
              Why an Omnichannel Programme Drives Value
            </h3>
          </div>
          <span className="text-xs px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-200 shadow-2xs">
            Zero Disconnection Between Web & Retail
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-serif font-semibold">
              <Store className="w-5 h-5 text-amber-600" />
              <span>Physical Boutique Stores</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a customer visits a Trove Label physical boutique, the cashier simply enters the customer's mobile number.
              The system immediately retrieves their current rewards balance, allows applying available points as a discount,
              and awards new points for the purchase.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant mobile number lookup (+91)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>One-tap redemption with bill caps enforced</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Quick registration for new customers</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-serif font-semibold">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <span>Shopify Online Storefront</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When shopping online on trovelabel.com, customers enter their mobile number in their shopping bag.
              Their points balance is recognised instantly, eligible points can be applied for an immediate Rupee discount,
              and points for the new order are credited automatically upon purchase.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Recognised directly at shopping bag & checkout</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Immediate discount applied to total payable</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Shared customer profile across web and in-store</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Interactive Experience Launchpad */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-serif text-slate-900 font-normal">
              Explore the Prototype
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Select an experience below to test the proposed workflows in action:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action 1: In-Store */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <Store className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-semibold text-slate-900 text-lg">
                In-Store Experience
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Step into the shoes of a Trove Label boutique cashier. Look up a customer by mobile, calculate earn points, apply a redemption discount, and see the receipt.
              </p>
            </div>
            <button
              onClick={() => setCurrentPortal('store')}
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Launch In-Store Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action 2: Online */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-semibold text-slate-900 text-lg">
                Online Shopping Experience
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse Trove Label resortwear, add a linen co-ord to your shopping bag, enter your mobile number to view points, and redeem rewards against your order.
              </p>
            </div>
            <button
              onClick={() => setCurrentPortal('online')}
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Browse Online Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action 3: Customer Wallet */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <Wallet className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-semibold text-slate-900 text-lg">
                Customer Rewards Wallet
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                See the clean, mobile-first rewards pass that customers see on their phones. Shows available points, Rupee value, and unified online and in-store activity.
              </p>
            </div>
            <button
              onClick={() => setCurrentPortal('wallet')}
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Open Customer Wallet</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Demonstration Personas */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-serif text-lg font-semibold text-slate-900">
              Demo Customer Accounts
            </h3>
            <p className="text-xs text-slate-500">
              Pre-seeded accounts ready to test across all screens. Click any card to view their wallet:
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400 self-start sm:self-center">
            Click to switch customer
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Persona 1: Aarav */}
          <button
            onClick={() => handleSelectCustomer(aarav.id)}
            className="text-left p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-semibold text-slate-900 group-hover:text-amber-900">
                {aarav.name}
              </span>
              <span className="text-xs font-mono text-slate-500">
                +91 {aarav.mobileNumber}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xl font-semibold text-slate-900">
                {aarav.currentPointsBalance}{' '}
                <span className="text-xs font-normal text-slate-500">pts</span>
              </span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Worth ₹{aarav.currentPointsBalance}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Frequent shopper &bull; Active points balance &bull; Mumbai
            </p>
          </button>

          {/* Persona 2: Priya */}
          <button
            onClick={() => handleSelectCustomer(priya.id)}
            className="text-left p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-semibold text-slate-900 group-hover:text-amber-900">
                {priya.name}
              </span>
              <span className="text-xs font-mono text-slate-500">
                +91 {priya.mobileNumber}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xl font-semibold text-slate-900">
                {priya.currentPointsBalance}{' '}
                <span className="text-xs font-normal text-slate-500">pts</span>
              </span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Worth ₹{priya.currentPointsBalance}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              High rewards earner &bull; Active points balance &bull; Ahmedabad
            </p>
          </button>

          {/* Persona 3: Maya */}
          <button
            onClick={() => handleSelectCustomer(maya.id)}
            className="text-left p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-semibold text-slate-900 group-hover:text-amber-900">
                {maya.name}
              </span>
              <span className="text-xs font-mono text-slate-500">
                +91 {maya.mobileNumber}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xl font-semibold text-slate-900">
                {maya.currentPointsBalance}{' '}
                <span className="text-xs font-normal text-slate-500">pts</span>
              </span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                New Customer
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              First-time member &bull; 0 points &bull; Ideal for testing first earn
            </p>
          </button>
        </div>
      </section>

      {/* 6. Clarification & Approval Note */}
      <footer className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950">
            Commercial Parameters Note — Subject to Trove Label Final Approval
          </p>
          <p className="text-amber-900/90 leading-relaxed">
            The earning ratio (₹100 spent = 10 points) and conversion value (1 point = ₹1 discount) shown in this prototype
            are illustrative examples for demonstration purposes. When commissioning the system, all ratios, minimum thresholds,
            and maximum bill percentage limits will be configured to match Trove Label's exact commercial targets.
          </p>
        </div>
      </footer>
    </div>
  );
};
