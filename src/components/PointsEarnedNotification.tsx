import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Coins, X } from 'lucide-react';

export const PointsEarnedNotification: React.FC = () => {
  const { pointsEarnedNotice, clearPointsEarnedNotice, setIsLoyaltyModalOpen } = useStore();

  useEffect(() => {
    if (pointsEarnedNotice) {
      const timer = setTimeout(() => {
        clearPointsEarnedNotice();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [pointsEarnedNotice, clearPointsEarnedNotice]);

  if (!pointsEarnedNotice) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-3 animate-in slide-in-from-top-6 duration-300">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
            <Coins className="w-6 h-6 text-amber-300 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-full">
                Loyalty Reward
              </span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            </div>
            <p className="font-bold text-sm leading-tight mt-0.5">
              You earned <strong className="text-yellow-300 font-black font-mono text-base">+{pointsEarnedNotice} KFC Points!</strong>
            </p>
            <p className="text-[10px] text-emerald-100">
              Added to your wallet for direct discounts!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              clearPointsEarnedNotice();
              setIsLoyaltyModalOpen(true);
            }}
            className="text-[11px] font-black underline uppercase hover:text-yellow-200 cursor-pointer p-1"
          >
            View
          </button>
          <button
            type="button"
            onClick={clearPointsEarnedNotice}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-black/20 cursor-pointer"
            aria-label="Dismiss points notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
