import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Bike, 
  ArrowRight, 
  ShieldCheck, 
  Tag, 
  Sparkles, 
  Award, 
  AlertCircle,
  Truck
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartSubtotal,
    effectiveDeliveryFee,
    cartTotal,
    discountAmount,
    appliedDiscount,
    appliedDiscountCode,
    applyDiscountCode,
    removeDiscountCode,
    formatPKR,
    selectedArea,
    setIsCheckoutOpen,
    settings,
    currentUser,
    isRedeemingPoints,
    setIsRedeemingPoints,
    canRedeemPoints,
    hasActiveDiscountCoupon,
    loyaltyDiscountAmount,
    potentialPointsToEarn,
    maxRedeemablePoints,
    minPointsRedemptionAmount,
    setIsCustomerAuthModalOpen,
    deliveryMethods,
    selectedDeliveryMethodId,
    setSelectedDeliveryMethodId,
    selectedDeliveryMethod,
    themeMode,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isCartOpen) return null;

  const isDark = themeMode === 'dark';

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyDiscountCode(couponInput);
    if (res.success) {
      setCouponMessage({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setCouponMessage(null), 4000);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className={`w-screen max-w-md shadow-2xl flex flex-col border-l ${
          isDark ? 'bg-[#141418] border-[#292934] text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}>
          
          {/* Header */}
          <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            isDark ? 'bg-[#101014] border-[#25252e]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#e4002b] rounded-xl flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`font-kfc text-2xl font-black uppercase tracking-tight leading-none ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}>
                  Your Bucket
                </h2>
                <p className="text-zinc-400 text-xs mt-0.5">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} ready for Chakwal delivery
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-zinc-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                  title="Clear entire bucket"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className={`p-2 rounded-xl cursor-pointer ${
                  isDark ? 'text-zinc-400 hover:text-white bg-[#1c1c22]' : 'text-zinc-500 hover:text-zinc-900 bg-zinc-200'
                }`}
                aria-label="Close bucket"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery Method Selection (Shopify Style - Pickup removed) */}
          <div className={`px-4 py-2.5 border-b space-y-1.5 ${
            isDark ? 'bg-[#181820] border-[#25252e]' : 'bg-zinc-100/70 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#e4002b] flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>Delivery Option (Chakwal)</span>
              </span>
              <span className="text-[10px] text-zinc-400">Within 3 KM</span>
            </div>

            <select
              value={selectedDeliveryMethodId}
              onChange={(e) => setSelectedDeliveryMethodId(e.target.value)}
              className={`w-full text-xs font-semibold rounded-xl px-3 py-2 border focus:outline-none focus:border-[#e4002b] cursor-pointer ${
                isDark ? 'bg-[#111116] border-[#2b2b35] text-white' : 'bg-white border-zinc-300 text-zinc-900'
              }`}
            >
              {deliveryMethods.filter((m) => m.enabled).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.minOrderAmount && cartSubtotal >= m.minOrderAmount ? 'FREE' : formatPKR(m.price)}
                </option>
              ))}
            </select>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-[#1c1c22] text-zinc-600' : 'bg-zinc-100 text-zinc-400'
                }`}>
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className={`font-kfc text-2xl font-black uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    Your Bucket is Empty
                  </h3>
                  <p className="text-zinc-400 text-xs max-w-xs">
                    Treat yourself to authentic KFC hot & crispy chicken, Zingers, and family feasts!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold uppercase px-6 py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className={`rounded-2xl p-3 flex gap-3 relative border transition-colors ${
                    isDark ? 'bg-[#191920] border-[#292934]' : 'bg-white border-zinc-200 shadow-sm'
                  }`}
                >
                  {/* Thumbnail */}
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-16 h-16 rounded-xl object-cover bg-black/20 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = '/src/assets/images/kfc_krunch_burger_1791015834419.jpg';
                    }}
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className={`font-bold text-sm truncate leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {item.menuItem.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Options list */}
                    <div className="text-[11px] text-zinc-400 mt-1 space-y-0.5">
                      {item.options.spiceLevel && (
                        <p className="text-amber-500 font-medium">· {item.options.spiceLevel}</p>
                      )}
                      {item.options.drink && (
                        <p>· {item.options.drink}</p>
                      )}
                      {item.options.addons.length > 0 && (
                        <p className="text-red-400">
                          · {item.options.addons.map((a) => a.name).join(', ')}
                        </p>
                      )}
                      {item.options.specialInstructions && (
                        <p className="italic text-zinc-400">"{item.options.specialInstructions}"</p>
                      )}
                    </div>

                    {/* Price and Quantity Stepper */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-700/20">
                      <span className={`font-black text-sm tabular-nums ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {formatPKR(item.unitPrice * item.quantity)}
                      </span>

                      <div className={`flex items-center rounded-xl p-0.5 border ${
                        isDark ? 'bg-[#121215] border-zinc-800' : 'bg-zinc-100 border-zinc-300'
                      }`}>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                          className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-red-500 active:scale-90 transition cursor-pointer"
                          aria-label={`Decrease quantity of ${item.menuItem.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className={`w-7 text-center text-xs font-black tabular-nums ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                          className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-emerald-500 active:scale-90 transition cursor-pointer"
                          aria-label={`Increase quantity of ${item.menuItem.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer Summary */}
          {cart.length > 0 && (
            <div className={`p-4 sm:p-5 border-t space-y-3 ${
              isDark ? 'bg-[#101014] border-[#25252e]' : 'bg-zinc-50 border-zinc-200'
            }`}>
              
              {/* Coupon / Discount Code Form */}
              <div className={`p-2.5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#16161d] border-[#262632]' : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                {appliedDiscount ? (
                  <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl text-emerald-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <Tag className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-bold truncate">
                        {appliedDiscount.code || 'Automatic'}: {appliedDiscount.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeDiscountCode}
                      className="text-zinc-400 hover:text-white p-1 ml-2 text-[11px] underline cursor-pointer shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Discount coupon code"
                        className={`w-full text-xs rounded-xl pl-8 pr-2 py-2 focus:outline-none focus:border-[#e4002b] uppercase font-mono border ${
                          isDark ? 'bg-[#121216] border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#e4002b] hover:bg-[#c30025] text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer shrink-0 shadow-sm"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <p className={`text-[11px] ${
                    couponMessage.type === 'success' ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Loyalty Points Redemption Box (10 pts per 300 Rs, Mutual Exclusivity) */}
              <div className={`p-3 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#181820] border-amber-500/30' : 'bg-amber-50/60 border-amber-300/60'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                    <Award className="w-4 h-4" />
                    <span>Loyalty Points Rewards</span>
                  </div>

                  {currentUser ? (
                    <span className="text-[11px] font-mono text-zinc-400">
                      Balance: <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{currentUser.loyaltyPoints || 0}</strong> pts
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCartOpen(false);
                        setIsCustomerAuthModalOpen(true);
                      }}
                      className="text-[10px] text-[#e4002b] font-bold underline cursor-pointer"
                    >
                      Login to Redeem
                    </button>
                  )}
                </div>

                {currentUser && (currentUser.loyaltyPoints || 0) > 0 ? (
                  hasActiveDiscountCoupon ? (
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 text-[11px] flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Loyalty points kisi doosray discount coupon ke sath combine nahi ho saktay.</span>
                    </div>
                  ) : cartSubtotal < minPointsRedemptionAmount ? (
                    <div className="flex items-start gap-1.5 text-[11px] text-amber-600 bg-amber-500/10 p-2 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                      <span>
                        Points cannot be redeemed alone. <strong>Minimum Rs. {minPointsRedemptionAmount}</strong> order required (Add Rs. {minPointsRedemptionAmount - cartSubtotal} more).
                      </span>
                    </div>
                  ) : (
                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs ${
                      isDark ? 'bg-black/30 border-zinc-800' : 'bg-white border-amber-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isRedeemingPoints}
                          onChange={(e) => setIsRedeemingPoints(e.target.checked)}
                          className="w-4 h-4 accent-[#e4002b] rounded cursor-pointer"
                        />
                        <span className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>
                          Redeem <strong>{maxRedeemablePoints} Points</strong>
                        </span>
                      </div>
                      <span className="font-bold text-emerald-500 font-mono">
                        -{formatPKR(maxRedeemablePoints)}
                      </span>
                    </label>
                  )
                ) : (
                  <p className="text-[10px] text-zinc-500">
                    Earn 10 points for every Rs. 300 spent. Redeemable on orders Rs. 500+ (alone redeem nahi hotay).
                  </p>
                )}

                {/* Potential points to earn on this order */}
                {potentialPointsToEarn > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium pt-0.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Is order par aapko <strong>+{potentialPointsToEarn} loyalty points</strong> milenge!</span>
                  </div>
                )}
              </div>

              {/* Bill Breakdown */}
              <div className={`space-y-1.5 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className={`font-bold tabular-nums ${isDark ? 'text-white' : 'text-zinc-900'}`}>{formatPKR(cartSubtotal)}</span>
                </div>

                {/* Coupon Discount */}
                {(discountAmount > 0 || (appliedDiscount && appliedDiscount.type === 'free_shipping')) && (
                  <div className="flex justify-between text-emerald-500 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Discount ({appliedDiscount?.code || 'Auto Deal'})</span>
                    </span>
                    <span className="tabular-nums font-mono">
                      -{discountAmount > 0 ? formatPKR(discountAmount) : 'Free Delivery'}
                    </span>
                  </div>
                )}

                {/* Loyalty Discount */}
                {loyaltyDiscountAmount > 0 && (
                  <div className="flex justify-between text-amber-500 font-bold">
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>Loyalty Points Discount</span>
                    </span>
                    <span className="tabular-nums font-mono">
                      -{formatPKR(loyaltyDiscountAmount)}
                    </span>
                  </div>
                )}

                {/* Delivery Fee */}
                <div className="flex justify-between items-center">
                  <span>{selectedDeliveryMethod.name}</span>
                  <span className={`font-bold tabular-nums ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {effectiveDeliveryFee > 0 ? formatPKR(effectiveDeliveryFee) : 'FREE'}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold pt-2 border-t border-zinc-700/20">
                  <span className={isDark ? 'text-white' : 'text-zinc-900'}>Total (PKR)</span>
                  <span className="text-xl text-[#e4002b] font-black tabular-nums">
                    {formatPKR(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-xl py-3.5 rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-red-950/40 cursor-pointer transition-all active:scale-[0.98]"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cash on Delivery (COD) & JazzCash / Easypaisa available</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
