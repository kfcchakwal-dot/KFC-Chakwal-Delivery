import React from 'react';
import { MenuItem, BadgePosition } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Plus, Flame, SlidersHorizontal, Tag } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const {
    getItemEffectivePrice,
    formatPKR,
    addToCart,
    setSelectedItemForCustomization,
    wishlist,
    toggleWishlist,
    settings,
    isAdmin,
    viewProduct,
    themeMode,
  } = useStore();

  const isDark = themeMode === 'dark';
  const isFavorite = wishlist.includes(item.id);
  const effectivePrice = getItemEffectivePrice(item);
  const hasComparePrice = Boolean(item.compareAtPrice && item.compareAtPrice > effectivePrice);
  const discountPercent = hasComparePrice && item.compareAtPrice
    ? Math.round(((item.compareAtPrice - effectivePrice) / item.compareAtPrice) * 100)
    : 0;

  // Position classes for customizable badges
  const badgePosition: BadgePosition =
    item.customBadgePosition || settings.defaultBadgePosition || 'top-left';

  const positionClasses: Record<BadgePosition, string> = {
    'top-left': 'top-2 left-2 sm:top-2.5 sm:left-2.5',
    'top-right': 'top-2 right-10 sm:top-2.5 sm:right-12',
    'bottom-left': 'bottom-2 left-2 sm:bottom-2.5 sm:left-2.5',
    'bottom-right': 'bottom-2 right-2 sm:bottom-2.5 sm:right-2.5',
  };

  // Truncate description according to controllable word limit (max 300 words)
  const formatDescription = (text: string, limit: number = 25) => {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    const safeLimit = Math.min(Math.max(limit || 25, 5), 300);
    if (words.length <= safeLimit) return text;
    return words.slice(0, safeLimit).join(' ') + '...';
  };

  const handleCardClick = () => {
    viewProduct(item);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      item.customizableOptions?.allowSpiceLevel ||
      item.customizableOptions?.allowDrinkChoice ||
      (item.customizableOptions?.availableAddons && item.customizableOptions.availableAddons.length > 0)
    ) {
      setSelectedItemForCustomization(item);
    } else {
      addToCart(item);
    }
  };

  const handleCustomizeUpgrade = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItemForCustomization(item);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-xl group cursor-pointer border ${
        isDark
          ? 'bg-[#18181c] border-[#27272e] hover:border-[#e4002b]/60 shadow-lg shadow-black/40'
          : 'bg-white border-zinc-200 hover:border-[#e4002b]/60 shadow-sm'
      }`}
    >
      {/* Card Top: Image & Badges */}
      <div className="relative aspect-[4/3] w-full bg-[#111113] overflow-hidden flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#1c1c24] to-[#121216] border-b border-zinc-800">
            <div className="flex gap-1 h-6 items-center opacity-70 mb-1.5">
              <span className="w-1.5 h-6 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
              <span className="w-1.5 h-5 bg-white rounded-sm transform -skew-x-6"></span>
              <span className="w-1.5 h-6 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
            </div>
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider truncate max-w-full">
              {item.name}
            </span>
            <span className="text-[9px] text-zinc-500 mt-0.5">No image · Add in Admin</span>
          </div>
        )}

        {/* Gradient shadow for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Customizable Badges container with dynamic position */}
        <div className={`absolute ${positionClasses[badgePosition]} flex flex-wrap gap-1 z-10 pointer-events-none`}>
          {hasComparePrice && discountPercent > 0 && (
            <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-md tracking-wider flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5" />
              SAVE {discountPercent}%
            </span>
          )}

          {item.customBadgeText ? (
            <span className="bg-[#e4002b] text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-md tracking-wide">
              {item.customBadgeText}
            </span>
          ) : (
            <>
              {item.isPopular && (
                <span className="bg-[#e4002b] text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                  Popular
                </span>
              )}
              {item.isSpicy && (
                <span className="bg-amber-600 text-white text-[9px] sm:text-[10px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1 shadow">
                  <Flame className="w-2.5 h-2.5" />
                  Spicy
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(item.id);
          }}
          className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all cursor-pointer z-20 ${
            isFavorite
              ? 'bg-[#e4002b] text-white shadow-md'
              : 'bg-black/50 text-zinc-300 hover:text-white hover:bg-black/80'
          }`}
          title={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Image bottom badge */}
        <div className="absolute bottom-1.5 right-2 text-[9px] sm:text-[10px] text-zinc-300 bg-black/75 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded border border-white/10 font-mono tabular-nums">
          {isAdmin ? (
            item.sellingPrice ? (
              <span className="text-emerald-400 font-bold">Custom Price</span>
            ) : (
              `+${settings.markupPercentage}% Markup`
            )
          ) : (
            'Chakwal Express'
          )}
        </div>
      </div>

      {/* Card Content - Responsive for 2 Columns on Mobile */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            style={{ fontFamily: settings.headingFont || 'Barlow Condensed' }}
            className={`text-lg sm:text-2xl font-black uppercase tracking-tight group-hover:text-[#e4002b] transition-colors leading-tight line-clamp-2 ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}
          >
            {item.name}
          </h3>
          <p 
            style={{ fontFamily: settings.bodyFont || 'Plus Jakarta Sans' }}
            className={`text-[11px] sm:text-xs mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            {formatDescription(item.description, settings.descriptionWordLimit || 25)}
          </p>
        </div>

        {/* Price & Action Buttons */}
        <div className={`mt-3 pt-2.5 sm:mt-4 sm:pt-3 border-t flex flex-col gap-2 ${
          isDark ? 'border-[#26262e]' : 'border-zinc-200'
        }`}>
          {/* Price Line with Compare-at Price */}
          <div className="flex items-baseline justify-between flex-wrap gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-base sm:text-xl font-black tabular-nums ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}>
                {formatPKR(effectivePrice)}
              </span>

              {hasComparePrice && (
                <span className="text-[10px] sm:text-xs text-zinc-400 line-through tabular-nums font-medium">
                  {formatPKR(item.compareAtPrice!)}
                </span>
              )}
            </div>

            {hasComparePrice && discountPercent > 0 && (
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Action Buttons: Customize & Add to Bucket */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleCustomizeUpgrade}
              className={`text-[10px] sm:text-[11px] font-bold uppercase py-1.5 sm:py-2 px-1 rounded-xl flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                isDark
                  ? 'border-[#3a3a46] bg-[#22222a] hover:bg-[#2b2b35] text-zinc-200 hover:text-white'
                  : 'border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
              }`}
              title="Customize items, spice & add-ons"
            >
              <SlidersHorizontal className="w-3 h-3 text-[#e4002b] shrink-0" />
              <span className="truncate">Customize</span>
            </button>

            <button
              type="button"
              onClick={handleQuickAdd}
              className="bg-[#e4002b] hover:bg-[#c30025] text-white text-[10px] sm:text-[11px] font-black uppercase py-1.5 sm:py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all shadow-md shadow-red-950/40 hover:shadow-red-900/60 cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-3 h-3 stroke-[3] shrink-0" />
              <span className="truncate">Add</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
