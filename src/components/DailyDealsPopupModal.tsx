import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Flame, Sparkles, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

export const DailyDealsPopupModal: React.FC = () => {
  const {
    isDailyDealsPopupOpen,
    setIsDailyDealsPopupOpen,
    dailyDealConfig,
    menuItems,
    addToCart,
    formatPKR,
    themeMode,
  } = useStore();

  const isDark = themeMode === 'dark';

  if (!isDailyDealsPopupOpen || !dailyDealConfig.enabled) return null;

  const handleDismiss = () => {
    setIsDailyDealsPopupOpen(false);
    try {
      sessionStorage.setItem('kfc_daily_deal_popup_dismissed', 'true');
    } catch {}
  };

  // Find daily items
  const dailyItems = menuItems.filter((i) =>
    (dailyDealConfig.selectedProductIds && dailyDealConfig.selectedProductIds.length > 0)
      ? dailyDealConfig.selectedProductIds.includes(i.id)
      : (i.isPopular || i.categoryId === 'ala-carte-combos' || i.categoryId === 'everyday-value')
  ).slice(0, dailyDealConfig.itemCount || 5);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col ${
        isDark ? 'bg-[#141418] border-[#292934] text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Banner Top */}
        <div className="relative bg-gradient-to-r from-[#e4002b] via-[#c30025] to-[#99001c] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-[#e4002b] text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                  Daily Special
                </span>
                <span className="text-[11px] font-bold text-red-200 uppercase tracking-wider">
                  Flat 4% OFF Today
                </span>
              </div>
              <h3 className="font-kfc text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none mt-1">
                {dailyDealConfig.title || "Today's Daily 5 Meal Box Specials"}
              </h3>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white p-2 rounded-full bg-black/20 hover:bg-black/40 cursor-pointer transition active:scale-95"
            aria-label="Close daily deals popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle Bar */}
        <div className={`px-5 py-2.5 border-b text-xs flex items-center justify-between ${
          isDark ? 'bg-[#1b1b22] border-zinc-800 text-zinc-400' : 'bg-red-50/60 border-red-100 text-zinc-600'
        }`}>
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#e4002b]" />
            <span>Kallar Kahar Motorway Se Freshly Picked Deals</span>
          </span>
          <span className="font-mono text-[11px] text-[#e4002b] font-bold">5 Deals Only</span>
        </div>

        {/* Deals Items List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {dailyItems.map((item, idx) => {
            const rawPrice = item.sellingPrice || item.baseKfcPrice;
            const discountedPrice = Math.round(rawPrice * (1 - (dailyDealConfig.discountPercentage || 4) / 100));

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all hover:border-[#e4002b]/60 ${
                  isDark ? 'bg-[#1b1b22] border-zinc-800' : 'bg-zinc-50 border-zinc-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-black/20 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute bottom-0 right-0 bg-[#e4002b] text-white text-[9px] font-black px-1 rounded-tl">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs sm:text-sm font-black text-[#e4002b] tabular-nums">
                        {formatPKR(discountedPrice)}
                      </span>
                      <span className="text-[10px] text-zinc-400 line-through tabular-nums">
                        {formatPKR(rawPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addToCart(item);
                    handleDismiss();
                  }}
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white text-[11px] sm:text-xs font-black uppercase py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1 shrink-0 shadow-md transition active:scale-95 cursor-pointer"
                  aria-label={`Claim deal for ${item.name}`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Claim</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 shrink-0 ${
          isDark ? 'bg-[#111114] border-zinc-800' : 'bg-zinc-100 border-zinc-200'
        }`}>
          <span className="text-[11px] text-zinc-500">
            Valid until 4:00 PM cutoff today!
          </span>

          <button
            type="button"
            onClick={handleDismiss}
            className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold uppercase px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition active:scale-95"
          >
            <span>Explore All Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
