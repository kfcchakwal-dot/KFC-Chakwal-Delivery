import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export const Preloader: React.FC = () => {
  const { settings, themeMode } = useStore();
  const [loading, setLoading] = useState(true);

  const isDark = themeMode === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700); // Quick, snappy 700ms preloader
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  const customLogo = settings.customPreloaderLogoUrl || settings.headerFooter?.logoUrl;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 transition-opacity duration-300 ${
      isDark ? 'bg-[#0e0e11] text-white' : 'bg-white text-zinc-900'
    }`}>
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-90 duration-300 text-center">
        {/* Animated Brand Logo */}
        <div className="relative">
          {customLogo ? (
            <img
              src={customLogo}
              alt="KFC Chakwal"
              className="w-24 h-24 object-contain animate-pulse drop-shadow-2xl"
            />
          ) : (
            <div className={`w-20 h-20 rounded-3xl p-3 flex items-center justify-center shadow-2xl border-2 border-[#e4002b] animate-bounce ${
              isDark ? 'bg-[#18181f] shadow-red-900/40' : 'bg-white shadow-red-500/20'
            }`}>
              <div className="flex gap-1.5 h-12 items-center">
                <span className="w-2.5 h-12 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
                <span className="w-2.5 h-10 bg-white border border-zinc-300 rounded-sm transform -skew-x-6"></span>
                <span className="w-2.5 h-12 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
              </div>
            </div>
          )}

          {/* Pulse Ripple */}
          <div className="absolute -inset-3 rounded-full border-2 border-[#e4002b]/40 animate-ping pointer-events-none" />
        </div>

        <div className="space-y-1">
          <h2 className={`font-kfc text-2xl font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {settings.storeName || 'KFC Chakwal Delivery'}
          </h2>
          <p className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Fresh from Kallar Kahar Motorway · Delivered in Chakwal
          </p>
        </div>

        {/* Loading Spinner Bar */}
        <div className={`w-36 h-1 rounded-full overflow-hidden mt-2 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <div className="w-full h-full bg-[#e4002b] animate-pulse" />
        </div>
      </div>
    </div>
  );
};
