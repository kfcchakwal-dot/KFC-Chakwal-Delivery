import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ShoppingBag, Bike, ArrowRight, ShieldCheck } from 'lucide-react';

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
    formatPKR,
    orderType,
    setOrderType,
    selectedArea,
    setIsCheckoutOpen,
    settings,
  } = useStore();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#161619] border-l border-[#292930] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#292930] flex items-center justify-between bg-[#121214]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#e4002b] rounded-xl flex items-center justify-center text-white shadow-md shadow-red-950/40">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-kfc text-2xl font-black text-white uppercase tracking-tight leading-none">
                  Your Bucket
                </h2>
                <p className="text-zinc-400 text-xs mt-0.5">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} ready for order
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-zinc-400 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                  title="Clear entire bucket"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="text-zinc-400 hover:text-white p-2 rounded-lg bg-[#1c1c20] cursor-pointer"
                aria-label="Close bucket"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery vs Pickup Selector inside cart */}
          <div className="px-4 py-3 bg-[#1a1a1e] border-b border-[#292930] flex items-center justify-between gap-3">
            <div className="flex-1 bg-[#121214] p-1 rounded-lg border border-[#2e2e36] flex">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold uppercase transition-all cursor-pointer ${
                  orderType === 'delivery'
                    ? 'bg-[#e4002b] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Delivery (Rs {settings.deliveryFee})
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold uppercase transition-all cursor-pointer ${
                  orderType === 'pickup'
                    ? 'bg-[#e4002b] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Takeaway (Rs 0)
              </button>
            </div>
          </div>

          {/* Order Destination Bar */}
          <div className="px-4 py-2 bg-[#121214] text-xs text-zinc-400 flex items-center justify-between border-b border-[#25252b]">
            <div className="flex items-center gap-1.5 truncate">
              <Bike className="w-3.5 h-3.5 text-[#e4002b] shrink-0" />
              <span className="truncate">Destination: <strong className="text-white">{selectedArea.name}</strong></span>
            </div>
            <span className="text-[11px] text-zinc-500 shrink-0">{selectedArea.estimatedTime}</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 bg-[#202025] rounded-full flex items-center justify-center text-zinc-600">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-kfc text-2xl font-black text-white uppercase">
                    Your Bucket is Empty
                  </h3>
                  <p className="text-zinc-400 text-xs max-w-xs">
                    Satisfy your hunger with delicious hot & crispy fried chicken, zingers, and burgers!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold uppercase px-6 py-2.5 rounded-xl cursor-pointer transition-all"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-[#1c1c20] border border-[#2b2b34] rounded-xl p-3 flex gap-3 relative group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-16 h-16 rounded-lg object-cover bg-black/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-white text-sm truncate leading-tight">
                        {item.menuItem.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Options list */}
                    <div className="text-[11px] text-zinc-400 mt-1 space-y-0.5">
                      {item.options.spiceLevel && (
                        <p className="text-amber-400/90 font-medium">· {item.options.spiceLevel}</p>
                      )}
                      {item.options.drink && (
                        <p>· {item.options.drink}</p>
                      )}
                      {item.options.addons.length > 0 && (
                        <p className="text-red-300">
                          · {item.options.addons.map((a) => a.name).join(', ')}
                        </p>
                      )}
                      {item.options.specialInstructions && (
                        <p className="italic text-zinc-500">"{item.options.specialInstructions}"</p>
                      )}
                    </div>

                    {/* Price and Quantity Stepper */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#26262e]">
                      <span className="font-black text-white text-sm tabular-nums">
                        {formatPKR(item.unitPrice * item.quantity)}
                      </span>

                      <div className="flex items-center bg-[#141416] border border-[#33333d] rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1 text-zinc-400 hover:text-white cursor-pointer"
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
            <div className="p-4 sm:p-5 bg-[#121214] border-t border-[#292930] space-y-3">
              
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-bold tabular-nums">{formatPKR(cartSubtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>Delivery Charges (Chakwal)</span>
                    {orderType === 'pickup' && (
                      <span className="text-[10px] text-emerald-400 uppercase font-bold">(Pickup)</span>
                    )}
                  </span>
                  <span className="text-white font-bold tabular-nums">
                    {orderType === 'delivery' ? formatPKR(effectiveDeliveryFee) : 'FREE'}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-zinc-500 pt-1 border-t border-[#222228]">
                  <span>Applied Store Markup</span>
                  <span className="tabular-nums">+{settings.markupPercentage}% (Included)</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-[#2a2a33]">
                  <span>Total (PKR)</span>
                  <span className="text-xl text-[#e4002b] font-black tabular-nums">
                    {formatPKR(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-xl py-3.5 rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-red-950/50 cursor-pointer transition-all active:scale-[0.98]"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cash on Delivery (COD) & JazzCash / Easypaisa available</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
