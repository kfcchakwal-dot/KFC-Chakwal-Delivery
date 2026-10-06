import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const StickyCartBar: React.FC = () => {
  const {
    cartCount,
    cartTotal,
    formatPKR,
    isCartOpen,
    isCheckoutOpen,
    setIsCartOpen,
  } = useStore();

  if (cartCount === 0 || isCartOpen || isCheckoutOpen) {
    return null;
  }

  return (
    <aside 
      aria-label="Current order bucket summary"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-black/10 shadow-[0_-8px_25px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom duration-200"
    >
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Left Side: Items Count & Total Bill */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm relative">
            <ShoppingBag className="w-5 h-5 text-white" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#e4002b] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
              {cartCount}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
                {cartCount} {cartCount === 1 ? 'Meal' : 'Meals'}
              </span>
              <span className="text-zinc-300">·</span>
              <span className="text-[10px] bg-red-50 text-[#e4002b] font-black px-1.5 py-0.5 rounded border border-red-100">
                Chakwal Hot
              </span>
            </div>
            <p className="text-lg sm:text-xl font-black text-black font-mono leading-none mt-0.5">
              {formatPKR(cartTotal)}
            </p>
          </div>
        </div>

        {/* Right Side: View Bucket Button */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-base sm:text-lg font-black px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl shadow-lg shadow-red-950/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <span>View Bucket</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </aside>
  );
};
