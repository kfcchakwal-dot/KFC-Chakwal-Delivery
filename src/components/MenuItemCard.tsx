import React, { useRef, useState } from 'react';
import { MenuItem, BadgePosition } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Plus, SlidersHorizontal, Tag, Share2, Check } from 'lucide-react';

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
    viewProduct,
    themeMode,
  } = useStore();

  const [copiedShare, setCopiedShare] = useState(false);
  const imageAreaRef = useRef<HTMLDivElement>(null);
  const [flyingImage, setFlyingImage] = useState<{ src: string; left: number; top: number; size: number; targetLeft: number; targetTop: number; phase: boolean } | null>(null);

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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `https://us-central1-gen-lang-client-0313861453.cloudfunctions.net/productShare?product=${encodeURIComponent(item.id)}`;
    const descriptionWords = (item.description || 'Fresh KFC meal from KFC Chakwal Delivery.').trim().split(/\s+/);
    const shortDescription = descriptionWords.slice(0, 28).join(' ') + (descriptionWords.length > 28 ? '...' : '');
    const imageUrl = item.image || '';
    const shareText = `${item.name}\n${shortDescription}\nSelling Price: ${formatPKR(effectivePrice)}\nOrder: ${shareUrl}${imageUrl ? `\nProduct image: ${imageUrl}` : ''}`;
    if (navigator.share) {
      try {
        if (imageUrl && navigator.canShare && navigator.canShare({ files: [new File([], 'product.jpg', { type: 'image/jpeg' })] })) {
          try {
            const response = await fetch(imageUrl, { mode: 'cors' });
            if (response.ok) {
              const blob = await response.blob();
              const file = new File([blob], `${item.name.replace(/[^a-z0-9-_]/gi, '-').slice(0, 50) || 'product'}.jpg`, { type: blob.type || 'image/jpeg' });
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({ title: item.name, text: shareText, files: [file] });
                return;
              }
            }
          } catch (imageError) {
            console.warn('Product image attachment unavailable; sharing product details instead.', imageError);
          }
        }
        await navigator.share({ title: item.name, text: shareText, url: shareUrl });
        return;
      } catch (error: any) {
        if (error?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      window.prompt('Copy product details and link:', shareText);
    }
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
      <div ref={imageAreaRef} className="relative aspect-[4/3] sm:aspect-[5/4] w-full bg-white overflow-hidden flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain p-2 sm:p-3 object-center transform group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-zinc-50">
            <div className="flex gap-1 h-6 items-center opacity-70 mb-1.5">
              <span className="w-1.5 h-6 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
              <span className="w-1.5 h-5 bg-white rounded-sm transform -skew-x-6"></span>
              <span className="w-1.5 h-6 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
            </div>
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider truncate max-w-full">
              {item.name}
            </span>
            <span className="text-[9px] text-zinc-500 mt-0.5">Add product photo in Admin</span>
          </div>
        )}

        {/* Admin-managed product labels */}
        <div className={`absolute ${positionClasses[badgePosition]} flex flex-wrap gap-1 z-10 pointer-events-none`}>
          {hasComparePrice && discountPercent > 0 && (
            <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-md tracking-wider flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5" />SAVE {discountPercent}%
            </span>
          )}
          {(Array.isArray(item.badges)
            ? item.badges
            : item.customBadgeText
              ? [item.customBadgeText]
              : [ ...(item.isPopular ? ['Popular'] : []), ...(item.isSpicy ? ['Spicy'] : []) ]
          ).filter((label) => String(label || '').trim()).map((label, index) => (
            <span key={`${label}-${index}`} className="bg-[#e4002b] text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-1 rounded-lg shadow-md tracking-wide">
              {label}
            </span>
          ))}
        </div>

        {/* Wishlist stays on the image; sharing is placed at the card footer. */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const removing = wishlist.includes(item.id);
            if (!removing && item.image && imageAreaRef.current) {
              const imageRect = imageAreaRef.current.getBoundingClientRect();
              const target = Array.from(document.querySelectorAll<HTMLElement>('[data-wishlist-target="true"]')).find((node) => node.getClientRects().length > 0);
              const targetRect = target?.getBoundingClientRect();
              if (targetRect) {
                setFlyingImage({
                  src: item.image,
                  left: imageRect.left + imageRect.width / 2 - 24,
                  top: imageRect.top + imageRect.height / 2 - 24,
                  size: 48,
                  targetLeft: targetRect.left + targetRect.width / 2 - 10,
                  targetTop: targetRect.top + targetRect.height / 2 - 10,
                  phase: false,
                });
                window.setTimeout(() => setFlyingImage((current) => current ? { ...current, phase: true } : null), 30);
                window.setTimeout(() => setFlyingImage(null), 850);
              }
            }
            toggleWishlist(item.id);
          }}
          className={`absolute top-2 right-2 z-20 p-2 rounded-full shadow-md ${isFavorite ? 'bg-[#e4002b] text-white' : 'bg-white/95 text-zinc-700'}`}
          title={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {flyingImage && (
          <div
            aria-hidden="true"
            className="fixed z-[9999] pointer-events-none rounded-xl overflow-hidden shadow-2xl border-2 border-white"
            style={{
              left: flyingImage.phase ? flyingImage.targetLeft : flyingImage.left,
              top: flyingImage.phase ? flyingImage.targetTop : flyingImage.top,
              width: flyingImage.phase ? 20 : flyingImage.size,
              height: flyingImage.phase ? 20 : flyingImage.size,
              opacity: flyingImage.phase ? 0.25 : 1,
              transform: flyingImage.phase ? 'rotate(18deg) scale(.65)' : 'rotate(0deg) scale(1)',
              transition: 'left 720ms cubic-bezier(.2,.8,.2,1), top 720ms cubic-bezier(.2,.8,.2,1), width 720ms, height 720ms, opacity 720ms, transform 720ms',
            }}
          >
            <img src={flyingImage.src} alt="" className="w-full h-full object-contain bg-white" />
          </div>
        )}
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

          {/* Simple customize, purchase, and share actions */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={handleCustomizeUpgrade}
              className="min-h-[40px] text-[11px] sm:text-xs font-bold uppercase py-2 px-3 rounded-xl flex items-center justify-center gap-2 border border-zinc-200 bg-zinc-100 text-zinc-800 cursor-pointer active:scale-95"
              title={`Customize ${item.name}`}
              aria-label={`Customize ${item.name}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#e4002b] shrink-0" />
              <span>Customize</span>
            </button>
            <button
              type="button"
              onClick={handleQuickAdd}
              className="buy-button min-h-[44px] text-[11px] sm:text-xs font-black uppercase py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
              aria-label={`Add ${item.name} to bucket`}
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span>Add to Bucket</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="min-h-[32px] w-full rounded-lg px-2 py-1.5 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-zinc-600 bg-transparent border-0"
              title={copiedShare ? 'Link copied!' : `Share ${item.name}`}
              aria-label={`Share ${item.name}`}
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? 'Link copied' : 'Share product'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
