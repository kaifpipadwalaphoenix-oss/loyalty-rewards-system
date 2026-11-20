import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { DEMO_PRODUCTS } from '../../data/seedData';
import {
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  Coins,
  ArrowRight,
  Wallet,
  X,
} from 'lucide-react';

export const OnlineShop: React.FC = () => {
  const {
    customers,
    config,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    processOnlinePurchase,
    setCurrentPortal,
    setSelectedCustomerIdForWallet,
  } = useLoyalty();

  // Active Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Shopping Bag Drawer Open
  const [isBagOpen, setIsBagOpen] = useState<boolean>(false);

  // Selected Size per product
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  // Online Checkout Customer State
  const [customerMobile, setCustomerMobile] = useState<string>('9820123456'); // Pre-filled Aarav Sharma
  const [applyPointsDiscount, setApplyPointsDiscount] = useState<boolean>(true);
  const [pointsToRedeemInput, setPointsToRedeemInput] = useState<number>(100);

  // Completed Order State
  const [completedOrder, setCompletedOrder] = useState<{
    orderRef: string;
    customerName: string;
    customerMobile: string;
    customerId: string;
    itemsCount: number;
    subtotal: number;
    discount: number;
    totalPaid: number;
    pointsEarned: number;
    pointsRedeemed: number;
    newBalance: number;
  } | null>(null);

  // Filter products
  const categories = ['All', 'Co-ords', 'Kaftans & Dresses', 'Resort Shirts', 'Skirts & Bottoms', 'Beach Cover-ups'];
  const filteredProducts = selectedCategory === 'All'
    ? DEMO_PRODUCTS
    : DEMO_PRODUCTS.filter((p) => p.category === selectedCategory);

  // Shopping bag subtotal
  const bagSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const bagItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Identify customer
  const cleanMobile = customerMobile.replace(/\D/g, '');
  const activeCustomer = customers.find(
    (c) => c.mobileNumber === cleanMobile || c.mobileNumber.endsWith(cleanMobile)
  );

  const availablePoints = activeCustomer?.currentPointsBalance || 0;

  // Max redemption calculation (e.g. 30% of order subtotal)
  const maxPercent = config.maximumRedemptionPercentage || 30;
  const maxAllowedDiscountRupees = Math.floor((bagSubtotal * maxPercent) / 100);
  const maxRedeemablePoints = Math.min(availablePoints, maxAllowedDiscountRupees);

  // Points to redeem
  const actualPointsRedeemed = applyPointsDiscount
    ? Math.min(pointsToRedeemInput, maxRedeemablePoints)
    : 0;
  const discountRupees = actualPointsRedeemed * (config.pointValue || 1.0);
  const totalPayable = Math.max(0, bagSubtotal - discountRupees);

  // Points to be earned on this order
  const earningBase = config.earnOnRedeemedAmount ? totalPayable : bagSubtotal;
  const threshold = Math.max(1, config.purchaseThreshold || 100);
  const ptsPerThreshold = config.pointsPerThreshold || 10;
  const estimatedEarnedPoints = Math.floor(earningBase / threshold) * ptsPerThreshold;

  // Handle Checkout
  const handleCompletePurchase = () => {
    if (!activeCustomer || bagSubtotal <= 0) return;

    const result = processOnlinePurchase({
      customerId: activeCustomer.id,
      subtotal: bagSubtotal,
      pointsToRedeem: actualPointsRedeemed,
      itemsSummary: cart.map((i) => `${i.product.name} (x${i.quantity})`).join(', '),
    });

    if (result.success) {
      const updatedBalance =
        activeCustomer.currentPointsBalance - actualPointsRedeemed + result.pointsEarned;

      setCompletedOrder({
        orderRef: result.orderReference,
        customerName: activeCustomer.name,
        customerMobile: activeCustomer.mobileNumber,
        customerId: activeCustomer.id,
        itemsCount: bagItemCount,
        subtotal: bagSubtotal,
        discount: discountRupees,
        totalPaid: totalPayable,
        pointsEarned: result.pointsEarned,
        pointsRedeemed: actualPointsRedeemed,
        newBalance: updatedBalance,
      });

      setIsBagOpen(false);
      setSelectedCustomerIdForWallet(activeCustomer.id);
    }
  };

  const handleSelectQuickDemoCustomer = (mobile: string) => {
    setCustomerMobile(mobile);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-fadeIn">
      {/* 1. Trove Label Brand E-commerce Storefront Header */}
      <header className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3 h-3" />
            <span>Shopify Storefront Demonstration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif tracking-widest uppercase">
            TROVE LABEL
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl">
            Contemporary resortwear, kaftans, and holiday apparel. Browse items, add to your bag,
            and demonstrate how customers earn and redeem rewards online on{' '}
            <span className="text-amber-200 underline underline-offset-2">trovelabel.com</span>.
          </p>
        </div>

        {/* Shopping Bag Trigger Button */}
        <button
          onClick={() => setIsBagOpen(true)}
          className="relative self-start md:self-center px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif font-semibold text-xs tracking-wider uppercase inline-flex items-center gap-2.5 shadow-lg transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Shopping Bag</span>
          {bagItemCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-stone-950 text-amber-300 text-[11px] font-mono font-bold flex items-center justify-center">
              {bagItemCount}
            </span>
          )}
        </button>
      </header>

      {/* 2. Completed Order Celebration Banner (If order was placed) */}
      {completedOrder && (
        <div className="bg-emerald-50 border-2 border-emerald-400/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif font-semibold text-slate-900 text-lg">
                  Demonstration Order Placed Successfully!
                </h2>
                <p className="text-xs text-slate-600">
                  Order Reference: <strong className="font-mono text-slate-900">{completedOrder.orderRef}</strong> &bull; Customer: {completedOrder.customerName} (+91 {completedOrder.customerMobile})
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCustomerIdForWallet(completedOrder.customerId);
                setCurrentPortal('wallet');
              }}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Verify in Customer Wallet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
            <div className="p-3 rounded-xl bg-white border border-emerald-200">
              <span className="text-slate-500 block">Order Total:</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                ₹{completedOrder.totalPaid.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-emerald-200">
              <span className="text-slate-500 block">Rewards Discount:</span>
              <span className="text-base font-bold text-emerald-700 font-mono">
                -₹{completedOrder.discount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-emerald-200">
              <span className="text-slate-500 block">Points Earned:</span>
              <span className="text-base font-bold text-emerald-700 font-mono">
                +{completedOrder.pointsEarned} pts
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-emerald-200">
              <span className="text-slate-500 block">Updated Balance:</span>
              <span className="text-base font-bold text-amber-900 font-mono">
                {completedOrder.newBalance} pts (₹{completedOrder.newBalance})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. Curated Resortwear Product Catalog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const currentSize = selectedSizes[product.id] || 'M';

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Visual Apparel Card Header with Colorway swatch */}
                <div
                  className="h-48 w-full relative flex items-center justify-center p-6 transition-transform group-hover:scale-[1.01]"
                  style={{ backgroundColor: product.colorHex }}
                >
                  {/* Subtle apparel backdrop pattern */}
                  <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                  
                  {product.tag && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/90 text-stone-900 shadow-xs">
                      {product.tag}
                    </span>
                  )}

                  <div className="text-center text-white/90 space-y-1 relative z-10">
                    <span className="text-[10px] uppercase tracking-widest opacity-80 block">
                      {product.fabric}
                    </span>
                    <h3 className="font-serif text-lg font-light tracking-wide text-white drop-shadow-xs">
                      {product.name}
                    </h3>
                    <span className="text-xs font-medium text-amber-200 block">
                      {product.colorName}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400 font-medium">{product.category}</span>
                    <span className="font-serif font-bold text-lg text-slate-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {product.description}
                  </p>

                  {/* Size Selector */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 mr-1">Size:</span>
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: size })}
                        className={`w-7 h-7 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                          currentSize === size
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add to Bag Action */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => addToCart(product, currentSize)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-serif font-semibold tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Shopping Bag</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Shopping Bag Slide-Over Drawer / Modal */}
      {isBagOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between animate-slideInRight">
            {/* Bag Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-slate-800" />
                <h3 className="font-serif font-semibold text-slate-900 text-lg">
                  Your Shopping Bag ({bagItemCount})
                </h3>
              </div>
              <button
                onClick={() => setIsBagOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bag Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Items List */}
              {cart.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Selected Items
                  </h4>
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}`}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-serif font-semibold text-slate-900 text-sm block">
                          {item.product.name}
                        </span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Size: {item.size}</span>
                          <span>&bull;</span>
                          <span className="font-mono text-slate-700">₹{item.product.price}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.size)}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-l-lg cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 font-mono text-xs font-semibold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.size)}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-r-lg cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, item.size)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm">Your shopping bag is empty.</p>
                </div>
              )}

              {/* Trove Rewards Integration Box (The Core Demonstration) */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <h4 className="font-serif font-semibold text-amber-950 text-sm">
                    Trove Label Rewards Member?
                  </h4>
                </div>

                <p className="text-xs text-amber-900/80 leading-relaxed">
                  Enter your registered mobile number to check available rewards points:
                </p>

                {/* Mobile input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-mono">
                      +91
                    </span>
                    <input
                      type="text"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      placeholder="9820123456"
                      className="w-full pl-9 pr-2 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Quick Demo Accounts */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-0.5">
                  <span className="text-amber-800/70">Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickDemoCustomer('9820123456')}
                    className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer font-medium"
                  >
                    Aarav (350 pts)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickDemoCustomer('9811187654')}
                    className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer font-medium"
                  >
                    Priya (820 pts)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickDemoCustomer('9833445566')}
                    className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer font-medium"
                  >
                    Maya (0 pts)
                  </button>
                </div>

                {/* Customer Points & Redemption Options */}
                {activeCustomer ? (
                  <div className="pt-2 border-t border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">
                        {activeCustomer.name}: <strong>{availablePoints} points</strong> available
                      </span>
                      <span className="text-emerald-700 font-semibold font-mono">
                        Worth ₹{availablePoints}
                      </span>
                    </div>

                    {availablePoints > 0 ? (
                      <div className="space-y-2 pt-1">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-900">
                          <input
                            type="checkbox"
                            checked={applyPointsDiscount}
                            onChange={(e) => setApplyPointsDiscount(e.target.checked)}
                            className="rounded border-amber-300 text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                          />
                          <span>Apply loyalty discount to this order</span>
                        </label>

                        {applyPointsDiscount && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-slate-500">Points to redeem:</span>
                            <div className="flex gap-1.5">
                              {[50, 100, 200].map((pts) => (
                                <button
                                  key={pts}
                                  type="button"
                                  disabled={pts > maxRedeemablePoints}
                                  onClick={() => setPointsToRedeemInput(pts)}
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border cursor-pointer ${
                                    pointsToRedeemInput === pts
                                      ? 'bg-amber-600 text-white border-amber-600'
                                      : pts > maxRedeemablePoints
                                      ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                                  }`}
                                >
                                  {pts} pts
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => setPointsToRedeemInput(maxRedeemablePoints)}
                                className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-200 hover:bg-amber-300 text-amber-900 cursor-pointer"
                              >
                                Max ({maxRedeemablePoints})
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        New member account. Points earned on this order will be credited to this mobile number.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    Enter any 10-digit mobile number above to link loyalty.
                  </p>
                )}
              </div>
            </div>

            {/* Bag Footer with Order Totals & Simulated Checkout */}
            <div className="p-5 border-t border-slate-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">₹{bagSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {applyPointsDiscount && discountRupees > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Loyalty Points Discount ({actualPointsRedeemed} pts):</span>
                    <span className="font-mono">-₹{discountRupees.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Standard Shipping:</span>
                  <span className="text-emerald-700 font-medium">Complimentary</span>
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between font-serif font-bold text-base text-slate-950">
                  <span>Total Payable:</span>
                  <span className="font-mono">₹{totalPayable.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-700 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Points you'll earn on this order:</span>
                  </span>
                  <strong className="font-mono">+{estimatedEarnedPoints} points</strong>
                </div>
              </div>

              <button
                type="button"
                disabled={cart.length === 0 || !activeCustomer}
                onClick={handleCompletePurchase}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-serif font-semibold tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Complete Demonstration Purchase</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-slate-400 text-center">
                This is a demonstration purchase. It immediately credits points to the customer's shared wallet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
