import React from 'react';
import { useStore } from '../context/StoreContext';
import { MenuItem, DailyDealConfig } from '../types';
import { Sparkles, Flame, Clock, Percent } from 'lucide-react';

// Deterministic daily picker: picks collection, random, or manual products that auto-rotates at 12:00 AM midnight
function getDailyDealItems(items: MenuItem[], config: DailyDealConfig): MenuItem[] {
  const count = config.itemCount || 5;

  // 1. Manual Selection Mode
  if (config.selectionMode === 'manual' && config.selectedProductIds && config.selectedProductIds.length > 0) {
    const selected = items.filter((it) => config.selectedProductIds!.includes(it.id));
    if (selected.length > 0) return selected.slice(0, count);
  }

  // 2. Collection Selection Mode
  let pool = items;
  if (config.selectionMode === 'collection' && config.collectionCategory && config.collectionCategory !== 'all') {
    const collectionItems = items.filter((it) => it.categoryId === config.collectionCategory);
    if (collectionItems.length > 0) {
      pool = collectionItems;
    }
  } else if (!config.selectionMode || config.selectionMode === 'random') {
    // Random meal boxes mode
    const mealBoxes = items.filter(
      (item) =>
        item.categoryId === 'ala-carte-combos' ||
        item.categoryId === 'everyday-value' ||
        item.categoryId === 'family-sharing' ||
        item.categoryId === 'midnight-deals' ||
        item.name.toLowerCase().includes('box') ||
        item.name.toLowerCase().includes('combo') ||
        item.name.toLowerCase().includes('meal') ||
        item.name.toLowerCase().includes('deal')
    );
    if (mealBoxes.length >= count) {
      pool = mealBoxes;
    }
  }

  if (pool.length <= count) return pool;

  // Date seed based on today's calendar date string YYYY-MM-DD (changes automatically at 12:00 AM midnight)
  const today = new Date().toISOString().split('T')[0];
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = (seed * 31 + today.charCodeAt(i)) >>> 0;
  }

  // Shuffle copy using deterministic seeded PRNG
  const poolCopy = [...pool];
  for (let i = poolCopy.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    const j = Math.floor(rnd * (i + 1));
    [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
  }

  return poolCopy.slice(0, count);
}

export const DailyDealsSection: React.FC = () => {
  const {
    settings,
    menuItems,
    getItemEffectivePrice,
    formatPKR,
    addToCart,
    viewProduct,
    themeMode,
  } = useStore();

  const isDark = themeMode === 'dark';
  const dealConfig = settings.dailyDeal || {
    enabled: false,
    title: 'Daily 5 Deals',
    subtitle: 'Manual daily offers — automatic midnight rotation requires a server scheduler.',
    discountPercentage: 4,
    itemCount: 5,
    selectionMode: 'manual',
    selectedProductIds: [],
    autoMidnightRotate: false,
  };

  if (!dealConfig.enabled) return null;

  const dailyItems = getDailyDealItems(menuItems, dealConfig);
  if (dailyItems.length === 0) return null;

  const discountPercent = dealConfig.discountPercentage || 4;

  const handleAddDailyDeal = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const regularEffectivePrice = getItemEffectivePrice(item);
    const discountedPrice = Math.round(regularEffectivePrice * (1 - discountPercent / 100));

    // Create custom item copy with 4% off
    const dealItem: MenuItem = {
      ...item,
      name: `${item.name} (Daily Deal -${discountPercent}%)`,
      sellingPrice: discountedPrice,
      compareAtPrice: regularEffectivePrice,
      customBadgeText: `DAILY DEAL -${discountPercent}%`,
    };

    addToCart(dealItem);
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className={`p-5 sm:p-6 rounded-3xl border relative overflow-hidden shadow-lg ${
        isDark 
          ? 'bg-gradient-to-r from-red-950/40 via-[#18181f] to-amber-950/30 border-red-900/40' 
          : 'bg-gradient-to-r from-red-50 via-white to-amber-50 border-red-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#e4002b] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>Daily Featured 5</span>
              </span>
              <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                <Percent className="w-3 h-3" />
                <span>Flat {discountPercent}% OFF</span>
              </span>
            </div>

            <h2 className={`font-kfc text-2xl sm:text-3xl font-black uppercase tracking-tight ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>
              {dealConfig.title}
            </h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {dealConfig.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0 font-bold text-[#e4002b] bg-white/10 dark:bg-black/20 p-2.5 rounded-2xl border border-red-500/20">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Today Only · Special Price</span>
          </div>
        </div>

        {/* 5 Deals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mt-6">
          {dailyItems.map((item) => {
            const regularPrice = getItemEffectivePrice(item);
            const discountedPrice = Math.round(regularPrice * (1 - discountPercent / 100));

            return (
              <div
                key={`daily-${item.id}`}
                onClick={() => viewProduct(item)}
                className={`group rounded-2xl border p-3 flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer ${
                  isDark
                    ? 'bg-[#15151a] border-[#292934] hover:border-[#e4002b]'
                    : 'bg-white border-zinc-200 hover:border-[#e4002b] shadow-sm'
                }`}
              >
                {/* Image & Discount Badge */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/40 mb-2.5">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/src/assets/images/kfc_krunch_burger_1791015834419.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-[10px] text-zinc-400 text-center p-2">
                      {item.name}
                    </div>
                  )}

                  {/* 4% OFF Badge */}
                  <span className="absolute top-2 left-2 bg-[#e4002b] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow flex items-center gap-0.5">
                    -{discountPercent}% OFF
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`font-bold text-xs line-clamp-1 group-hover:text-[#e4002b] transition-colors ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}>
                      {item.name}
                    </h3>
                    <p className={`text-[10px] line-clamp-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="pt-2 border-t border-zinc-700/20">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-emerald-500 font-mono">
                        {formatPKR(discountedPrice)}
                      </span>
                      <span className="text-[10px] text-zinc-500 line-through font-mono">
                        {formatPKR(regularPrice)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleAddDailyDeal(item, e)}
                      className="buy-button w-full mt-2 min-h-[40px] bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-black uppercase py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-red-950/40 cursor-pointer"
                      aria-label={`Add deal ${item.name} to bucket`}
                    >
                      <span>Add to Bucket</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
