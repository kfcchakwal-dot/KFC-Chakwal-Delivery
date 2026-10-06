import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const FloatingCartBar: React.FC = () => {
  const { cartCount, cartTotal, formatPKR, setIsCartOpen, isCartOpen, isCheckoutOpen } = useStore();

  if (cartCount === 0 || isCartOpen || isCheckoutOpen) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-40 animate-in slide-in-from-bottom duration-200">
      <div className="w-full bg-black/95 text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl border border-zinc-800 flex items-center justify-between font-bold backdrop-blur-md">
        
        {/* Left: Items quantity and Total amount */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#e4002b] rounded-xl flex items-center justify-center relative shadow-sm">
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="absolute -top-1.5 -right-1.5 bg-white text-[#e4002b] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
              {cartCount}
            </span>
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-zinc-400 leading-none">
              {cartCount} {cartCount === 1 ? 'Item' : 'Items'} in Bucket
            </p>
            <p className="text-sm font-black tabular-nums text-white mt-0.5">
              {formatPKR(cartTotal)}
            </p>
          </div>
        </div>

        {/* Right: View Bucket Button */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-black uppercase px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-lg shadow-red-950/40"
        >
          <span>View Bucket</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

      </div>
    </div>
  );
};
