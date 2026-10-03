import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const FloatingCartBar: React.FC = () => {
  const { cartCount, cartTotal, formatPKR, setIsCartOpen, isCartOpen, isCheckoutOpen } = useStore();

  if (cartCount === 0 || isCartOpen || isCheckoutOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden">
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="w-full bg-[#e4002b] text-white p-3.5 rounded-2xl shadow-2xl shadow-red-950/80 flex items-center justify-between font-bold cursor-pointer active:scale-98 transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black/25 rounded-xl flex items-center justify-center relative">
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="absolute -top-1.5 -right-1.5 bg-white text-[#e4002b] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-red-200 leading-none">View Bucket</p>
            <p className="text-xs font-black tabular-nums">{formatPKR(cartTotal)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs uppercase font-kfc font-black tracking-wider bg-white text-[#e4002b] px-3.5 py-2 rounded-xl">
          <span>Checkout</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      </button>
    </div>
  );
};
