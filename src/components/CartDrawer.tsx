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
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isCartOpen) return null;

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
        <div className="w-screen max-w-md shadow-2xl flex flex-col border-l border-zinc-300 bg-[#f8f9fa] text-black">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#e4002b] rounded-xl flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-kfc text-2xl font-black uppercase tracking-tight leading-none text-black">
                  Your Bucket
                </h2>
                <p className="text-zinc-600 text-xs mt-0.5 font-bold">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} ready for Chakwal delivery
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-zinc-500 hover:text-red-600 font-bold p-1.5 transition-colors cursor-pointer"
                  title="Clear entire bucket"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-zinc-600 hover:text-black bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
                aria-label="Close bucket"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery Method Selection */}
          <div className="px-4 py-2.5 border-b border-zinc-200 bg-zinc-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#e4002b] flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>Delivery Option (Chakwal)</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-bold">Within 3 KM</span>
            </div>

            <select
              value={selectedDeliveryMethodId}
              onChange={(e) => setSelectedDeliveryMethodId(e.target.value)}
              className="w-full text-xs font-bold rounded-xl px-3 py-2 border border-zinc-300 bg-white text-black focus:outline-none focus:border-[#e4002b] cursor-pointer"
            >
              {deliveryMethods.filter((m) => m.enabled).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.minOrderAmount && cartSubtotal >= m.minOrderAmount ? 'FREE' : formatPKR(m.price)}
                </option>
              ))}
            </select>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f9fa]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-kfc text-2xl font-black uppercase text-black">
                    Your Bucket is Empty
                  </h3>
                  <p className="text-zinc-600 text-xs max-w-xs font-medium">
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
                  className="rounded-2xl p-3 flex gap-3 relative border border-zinc-200 bg-white shadow-sm"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-16 h-16 rounded-xl object-cover bg-zinc-100 shrink-0 border border-zinc-100"
                    onError={(e) => {
                      e.currentTarget.src = '/src/assets/images/kfc_krunch_burger_1791015834419.jpg';
                    }}
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-black text-sm truncate leading-tight text-black">
                        {item.menuItem.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-zinc-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Options list */}
                    <div className="text-[11px] text-zinc-600 mt-1 space-y-0.5">
                      {item.options.spiceLevel && (
                        <p className="text-amber-700 font-bold">· {item.options.spiceLevel}</p>
                      )}
                      {item.options.drink && (
                        <p className="font-medium">· {item.options.drink}</p>
                      )}
                      {item.options.addons.length > 0 && (
                        <p className="text-[#e4002b] font-bold">
                          · {item.options.addons.map((a) => a.name).join(', ')}
                        </p>
                      )}
                      {item.options.specialInstructions && (
                        <p className="italic text-zinc-500 font-medium">"{item.options.specialInstructions}"</p>
                      )}
                    </div>

                    {/* Price and Quantity Stepper */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                      <span className="font-black text-sm font-mono text-black">
                        {formatPKR(item.unitPrice * item.quantity)}
                      </span>

                      <div className="flex items-center rounded-xl p-0.5 border border-zinc-300 bg-zinc-50">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-700 hover:text-red-600 active:scale-90 transition cursor-pointer font-bold"
                          aria-label={`Decrease quantity of ${item.menuItem.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-black font-mono text-black">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-700 hover:text-emerald-700 active:scale-90 transition cursor-pointer font-bold"
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

          {/* Cart Footer Summary with Sticky Bar styling */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-200 bg-white space-y-3">
              
              {/* Coupon / Discount Code Form */}
              <div className="p-2.5 rounded-2xl border border-zinc-200 bg-zinc-50 space-y-2">
                {appliedDiscount ? (
                  <div className="flex items-center justify-between text-xs bg-emerald-100 border border-emerald-300 p-2 rounded-xl text-emerald-900 font-bold">
                    <div className="flex items-center gap-1.5 truncate">
                      <Tag className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {appliedDiscount.code || 'Automatic'}: {appliedDiscount.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeDiscountCode}
                      className="text-red-600 hover:text-red-800 p-1 ml-2 text-[11px] underline cursor-pointer shrink-0 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Discount coupon code"
                        className="w-full text-xs font-bold rounded-xl pl-8 pr-2 py-2 focus:outline-none focus:border-[#e4002b] uppercase font-mono border border-zinc-300 bg-white text-black"
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
                  <p className={`text-[11px] font-bold ${
                    couponMessage.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Loyalty Points Redemption Box */}
              <div className="p-3 rounded-2xl border border-amber-300 bg-amber-50/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-amber-900 font-black">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Loyalty Points Rewards</span>
                  </div>

                  {currentUser ? (
                    <span className="text-[11px] font-mono text-zinc-600 font-bold">
                      Balance: <strong className="text-black font-black">{currentUser.loyaltyPoints || 0}</strong> pts
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

                {currentUser && (
                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-black">
                        Redeem up to {maxRedeemablePoints} points
                      </p>
                      <p className="text-[10px] text-zinc-600">
                        1 Point = Rs. 1 Flat Discount. Min order Rs. {minPointsRedemptionAmount}.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!canRedeemPoints && !isRedeemingPoints}
                      onClick={() => setIsRedeemingPoints(!isRedeemingPoints)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        isRedeemingPoints
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-white border border-amber-400 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      {isRedeemingPoints ? 'Points Applied ✓' : 'Redeem Points'}
                    </button>
                  </div>
                )}
              </div>

              {/* Bill Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-700 font-bold">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-black">{formatPKR(cartSubtotal)}</span>
                </div>

                {/* Coupon Discount */}
                {(discountAmount > 0 || (appliedDiscount && appliedDiscount.type === 'free_shipping')) && (
                  <div className="flex justify-between text-emerald-700 font-black">
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
                  <div className="flex justify-between text-amber-800 font-black">
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-600" />
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
                  <span className="font-mono text-black">
                    {effectiveDeliveryFee > 0 ? formatPKR(effectiveDeliveryFee) : 'FREE'}
                  </span>
                </div>
              </div>

              {/* Sticky Bar / Checkout Button on Bottom */}
              <div className="pt-2 border-t border-zinc-200">
                <div className="bg-black text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400 leading-none">
                      {cartCount} {cartCount === 1 ? 'Item' : 'Items'}
                    </p>
                    <p className="text-base font-black font-mono text-white mt-0.5">
                      {formatPKR(cartTotal)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-lg px-5 py-2.5 rounded-xl font-black flex items-center gap-2 cursor-pointer transition-transform active:scale-95 shadow-md"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
