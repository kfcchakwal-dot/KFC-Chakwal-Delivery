import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { MenuItem, MenuItemAddon } from '../types';
import { MenuItemCard } from './MenuItemCard';
import {
  ArrowLeft,
  Heart,
  Plus,
  Minus,
  Flame,
  Check,
  Star,
  MessageSquare,
  ShieldCheck,
  Bike,
  Sparkles,
  Share2,
} from 'lucide-react';

const BEVERAGE_INFO: Record<string, { image: string; tag: string; bg: string }> = {
  'Pepsi Can (345ml)': {
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=150&q=80',
    tag: 'Pepsi',
    bg: 'from-blue-600 to-blue-800'
  },
  '7Up Can (345ml)': {
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&q=80',
    tag: '7Up',
    bg: 'from-emerald-500 to-green-700'
  },
  'Mirinda Can (345ml)': {
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=150&q=80',
    tag: 'Mirinda',
    bg: 'from-orange-500 to-amber-600'
  },
  'Mountain Dew Can (345ml)': {
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&q=80',
    tag: 'Dew',
    bg: 'from-lime-500 to-green-700'
  },
  'Diet Pepsi Can (345ml)': {
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=150&q=80',
    tag: 'Diet',
    bg: 'from-zinc-700 to-zinc-900'
  },
  'Aquafina Mineral Water': {
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=150&q=80',
    tag: 'Water',
    bg: 'from-cyan-500 to-blue-600'
  },
};

export const ProductPage: React.FC = () => {
  const {
    selectedProduct,
    menuItems,
    viewProduct,
    goHome,
    addToCart,
    getItemEffectivePrice,
    formatPKR,
    wishlist,
    toggleWishlist,
    reviews,
    addReview,
    currentUser,
    settings,
    themeMode,
  } = useStore();

  const item = selectedProduct;

  if (!item) return null;

  const isFavorite = wishlist.includes(item.id);
  const basePrice = getItemEffectivePrice(item);
  const hasComparePrice = Boolean(item.compareAtPrice && item.compareAtPrice > basePrice);
  const discountPercent = hasComparePrice && item.compareAtPrice
    ? Math.round(((item.compareAtPrice - basePrice) / item.compareAtPrice) * 100)
    : 0;

  // Customization state
  const [quantity, setQuantity] = useState(1);
  const [drink, setDrink] = useState<string>('Pepsi Can (345ml)');
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [instructions, setInstructions] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeImage, setActiveImage] = useState(item.image || '');
  const productImageAreaRef = useRef<HTMLDivElement>(null);
  const [flyingImage, setFlyingImage] = useState<{ src: string; left: number; top: number; size: number; targetLeft: number; targetTop: number; phase: boolean } | null>(null);
  useEffect(() => { setActiveImage(item.image || ''); setSelectedAddons([]); }, [item.id, item.image]);

  // Review Form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const toggleAddon = (addon: MenuItemAddon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons((prev) => prev.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons((prev) => [...prev, addon]);
    }
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(
      item,
      {
        drink: item.customizableOptions?.allowDrinkChoice ? drink : undefined,
        addons: selectedAddons,
        specialInstructions: instructions.trim() || undefined,
      },
      quantity
    );
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleShare = async () => {
    const shareUrl = `https://us-central1-gen-lang-client-0313861453.cloudfunctions.net/productShare?product=${encodeURIComponent(item.id)}`;
    const descriptionWords = (item.description || 'Fresh KFC meal from KFC Chakwal Delivery.').trim().split(/\s+/);
    const shortDescription = descriptionWords.slice(0, 28).join(' ') + (descriptionWords.length > 28 ? '...' : '');
    const imageUrl = item.image || '';
    const shareText = `${item.name}\n${shortDescription}\nSelling Price: ${formatPKR(basePrice)}\nOrder: ${shareUrl}${imageUrl ? `\nProduct image: ${imageUrl}` : ''}`;
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerName = (currentUser?.fullName || reviewName).trim();
    if (!customerName || !reviewComment.trim()) {
      alert('Please enter your name and review comment.');
      return;
    }

    try {
      await addReview({
        productId: item.id,
        customerName,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewName('');
      setReviewComment('');
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 3000);
    } catch (error: any) {
      setReviewSubmitted(false);
      alert(error?.message || 'Review submit nahi ho saka.');
    }
  };

  const productReviews = reviews.filter((r) => r.productId === item.id && r.isVisible !== false);
  const avgRating =
    productReviews.length > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      : '0.0';

  const drinksList = [
    'Pepsi Can (345ml)',
    '7Up Can (345ml)',
    'Mirinda Can (345ml)',
    'Mountain Dew Can (345ml)',
    'Diet Pepsi Can (345ml)',
    'Aquafina Mineral Water',
  ];

  // Badge position styling
  const badgePos = item.customBadgePosition || settings.defaultBadgePosition || 'top-left';
  const badgeClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-14',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }[badgePos];

  const isDark = themeMode === 'dark';

  return (
    <div className={`min-h-screen pb-20 ${isDark ? 'bg-[#0e0e11] text-[#f4f4f5]' : 'bg-[#f8f9fa] text-[#1a1a1f]'}`}>
      
      {/* Top Breadcrumb & Back bar */}
      <div className={`border-b ${isDark ? 'bg-[#141417] border-[#26262d]' : 'bg-white border-zinc-200'} py-3 px-4 sm:px-8`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
          <button
            onClick={goHome}
            className="flex items-center gap-2 text-zinc-400 hover:text-[#e4002b] font-bold uppercase transition-colors cursor-pointer min-h-[44px] py-2 px-1 active:scale-95"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </button>

          <div className="flex items-center gap-1.5 text-zinc-500 truncate">
            <span onClick={goHome} className="cursor-pointer hover:underline">Home</span>
            <span>/</span>
            <span className="capitalize">{item.categoryId.replace(/-/g, ' ')}</span>
            <span>/</span>
            <span className="font-bold text-[#e4002b] truncate">{item.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Product Photography & Badges */}
          <div className="lg:col-span-6 space-y-4">
            <div ref={productImageAreaRef} className={`relative aspect-square rounded-3xl overflow-hidden border shadow-2xl ${
              isDark ? 'bg-[#161619] border-[#292932]' : 'bg-white border-zinc-200'
            }`}>
              {item.image ? (
                <img
                  src={activeImage || item.image}
                  alt={item.name}
                  className="w-full h-full object-contain object-center bg-white p-2 sm:p-4"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#1c1c24] to-[#121216]">
                  <div className="flex gap-1.5 h-10 items-center opacity-80 mb-3">
                    <span className="w-2.5 h-10 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
                    <span className="w-2.5 h-8 bg-white rounded-sm transform -skew-x-6"></span>
                    <span className="w-2.5 h-10 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
                  </div>
                  <span className="text-base font-bold text-white uppercase tracking-wider">
                    {item.name}
                  </span>
                  <span className="text-xs text-zinc-400 mt-1">
                    No image uploaded · Admin can add product image anytime
                  </span>
                </div>
              )}

              {/* Admin-managed product labels */}
              <div className={`absolute ${badgeClasses} z-10 flex flex-wrap gap-2`}>
                {(Array.isArray(item.badges)
                  ? item.badges
                  : item.customBadgeText
                    ? [item.customBadgeText]
                    : [ ...(item.isPopular ? ['Popular'] : []), ...(item.isSpicy ? ['Spicy'] : []) ]
                ).filter((label) => String(label || '').trim()).map((label, index) => (
                  <span key={`${label}-${index}`} className="bg-[#e4002b] text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-lg">
                    {label}
                  </span>
                ))}
              </div>

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

              {/* Wishlist action only; sharing sits with the product details below. */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  type="button"
                  onClick={() => {
                    const removing = wishlist.includes(item.id);
                    if (!removing && item.image && productImageAreaRef.current) {
                      const imageRect = productImageAreaRef.current.getBoundingClientRect();
                      const target = Array.from(document.querySelectorAll<HTMLElement>('[data-wishlist-target="true"]')).find((node) => node.getClientRects().length > 0);
                      const targetRect = target?.getBoundingClientRect();
                      if (targetRect) {
                        setFlyingImage({
                          src: activeImage || item.image,
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
                  className={`p-3 rounded-full shadow-lg ${isFavorite ? 'bg-[#e4002b] text-white' : 'bg-white/95 text-zinc-800'}`}
                  title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  aria-label="Add to wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {(item.galleryImages || []).filter((image) => image && image !== item.image).length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[item.image, ...(item.galleryImages || [])].filter((image, index, list) => Boolean(image) && list.indexOf(image) === index).map((image, index) => (
                  <button key={image} type="button" onClick={() => setActiveImage(image)} className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 ${activeImage === image ? 'border-[#e4002b]' : 'border-zinc-200'}`} aria-label={`View product photo ${index + 1}`}>
                    <img src={image} alt={`${item.name} photo ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}


            <div className="p-4 rounded-2xl border bg-white border-zinc-200 text-zinc-700 grid grid-cols-3 gap-2 text-center text-xs shadow-2xs">
              <div className="space-y-0.5">
                <Bike className="w-4 h-4 text-[#e4002b] mx-auto mb-1" />
                <p className="font-bold text-zinc-900">Rs. {settings.deliveryFee}</p>
                <p className="text-[10px] text-zinc-500">Flat Chakwal Delivery</p>
              </div>
              <div className="space-y-0.5 border-x border-zinc-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="font-bold text-zinc-900">100% Halal</p>
                <p className="text-[10px] text-zinc-500">Fried to Order</p>
              </div>
              <div className="space-y-0.5">
                <Star className="w-4 h-4 text-amber-500 mx-auto mb-1 fill-amber-500" />
                <p className="font-bold text-zinc-900">{avgRating} / 5.0</p>
                <p className="text-[10px] text-zinc-500">{productReviews.length} Reviews</p>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Pricing, Customize & Upgrade */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header info */}
            <div className="space-y-2 border-b pb-5 border-zinc-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-[#e4002b]">
                  KFC Chakwal Delivery Menu
                </span>
                <button type="button" onClick={handleShare} className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-700 text-xs font-bold flex items-center gap-1.5" aria-label="Share product">
                  <Share2 className="w-3.5 h-3.5" />{copiedShare ? 'Link copied' : 'Share product'}
                </button>
              </div>
              <h1 className="font-kfc text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-none text-zinc-950">
                {item.name}
              </h1>
              <p className="text-sm leading-relaxed text-zinc-600">
                {item.description}
              </p>

              {/* Dynamic Price Display */}
              <div className="pt-3 flex items-baseline flex-wrap gap-3">
                <span className="text-3xl font-black text-[#e4002b] tabular-nums">
                  {formatPKR(unitPrice)}
                </span>
                {hasComparePrice && (
                  <span className="text-lg text-zinc-400 line-through tabular-nums font-semibold">
                    {formatPKR(item.compareAtPrice!)}
                  </span>
                )}
                {hasComparePrice && discountPercent > 0 && (
                  <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    Save {discountPercent}%
                  </span>
                )}
                <span className="text-xs text-zinc-500 font-medium">
                  (Single Unit Price in PKR)
                </span>
              </div>
            </div>

            {/* CUSTOMIZE & UPGRADE SECTION */}
            <div className="p-5 rounded-2xl border bg-white border-zinc-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b pb-3 border-zinc-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="font-kfc text-xl font-black uppercase tracking-wider text-zinc-900">
                    Customize & Upgrade Meal
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#e4002b]">
                  Chakwal Special
                </span>
              </div>



              {/* Beverage Choice with Image Thumbnails */}
              {item.customizableOptions?.allowDrinkChoice && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                      Select Chilled Beverage (Included):
                    </label>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                      Included Free
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {drinksList.map((d) => {
                      const bev = BEVERAGE_INFO[d];
                      const isSelected = drink === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDrink(d)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'border-[#e4002b] bg-red-50 text-zinc-950 font-bold shadow-xs'
                              : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300'
                          }`}
                        >
                          {bev?.image ? (
                            <img
                              src={bev.image}
                              alt={d}
                              className="w-9 h-9 rounded-lg object-cover shrink-0 border border-zinc-200 shadow-xs"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-zinc-200 flex items-center justify-center text-xs font-bold shrink-0">
                              🥤
                            </div>
                          )}
                          <div className="truncate flex-1 min-w-0">
                            <span className="truncate block text-xs font-bold">{d}</span>
                            <span className="text-[10px] text-zinc-500 font-medium">Chilled Can (345ml)</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#e4002b] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Add-ons & Upgrades */}
              {item.customizableOptions?.availableAddons && item.customizableOptions.availableAddons.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                    Available Add-ons & Upgrades:
                  </label>
                  <div className="space-y-2">
                    {item.customizableOptions.availableAddons.map((addon) => {
                      const isChecked = selectedAddons.some((a) => a.id === addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => toggleAddon(addon)}
                          className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left text-xs ${
                            isChecked
                              ? isDark ? 'border-[#e4002b] bg-[#e4002b]/10 text-white font-bold' : 'border-[#e4002b] bg-red-50 text-zinc-900 font-bold'
                              : isDark ? 'border-[#2d2d38] bg-[#121214] text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                              isChecked ? 'bg-[#e4002b] border-[#e4002b]' : 'border-zinc-600'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 text-white" />}
                            </div>
                            {addon.image && (
                              <img
                                src={addon.image}
                                alt={addon.name}
                                className="w-10 h-10 rounded-lg object-cover border border-zinc-700/40 shrink-0"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                            )}
                            <span className="font-semibold">{addon.name}</span>
                          </div>
                          <span className="font-bold text-[#e4002b] tabular-nums">
                            +{formatPKR(addon.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Special Kitchen instructions */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 block">
                  Cooking Instructions (Optional):
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Extra mayo, make it extra crispy..."
                  className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                    isDark ? 'bg-[#121214] border-[#2e2e38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                />
              </div>
            </div>

            {/* Quantity Stepper & Add to Bucket Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <div className={`flex items-center border rounded-2xl p-1 shrink-0 ${
                isDark ? 'bg-[#161619] border-[#2d2d38]' : 'bg-white border-zinc-300'
              }`}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-black text-base tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="buy-button w-full flex-1 min-h-[52px] bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-xl py-3.5 px-6 rounded-2xl font-black flex items-center justify-between shadow-2xl shadow-red-950/50 cursor-pointer transition-all active:scale-[0.98]"
                aria-label="Add to bucket"
              >
                <span className="flex items-center gap-2">
                  {addedAnimation ? 'ADDED TO BUCKET!' : 'ADD TO BUCKET'}
                </span>
                <span className="font-sans text-base font-extrabold bg-black/25 px-3 py-1 rounded-xl tabular-nums">
                  {formatPKR(totalPrice)}
                </span>
              </button>
            </div>

          </div>

        </div>

        {/* Product recommendations */}
        {(() => {
          const sameCategory = menuItems.filter((product) => product.id !== item.id && product.categoryId === item.categoryId);
          const recommendations = [...sameCategory, ...menuItems.filter((product) => product.id !== item.id && product.categoryId !== item.categoryId && !sameCategory.some((same) => same.id === product.id))].slice(0, 4);
          return recommendations.length ? (
            <section className="mt-14 space-y-4">
              <div className="border-b border-zinc-200 pb-3">
                <p className="text-[10px] uppercase font-black tracking-widest text-[#e4002b]">More to enjoy</p>
                <h2 className="font-kfc text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">You May Also Like</h2>
                <p className="text-xs text-zinc-500 mt-1">Similar favourites picked for your next bucket.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {recommendations.map((product) => <MenuItemCard key={product.id} item={product} />)}
              </div>
            </section>
          ) : null;
        })()}

        {/* CUSTOMER REVIEWS & RATINGS SECTION */}
        <div className={`mt-16 p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDark ? 'bg-[#141417] border-[#26262e]' : 'bg-white border-zinc-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-zinc-700/30">
            <div>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                <h2 className="font-kfc text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  Customer Reviews & Feedback ({productReviews.length})
                </h2>
              </div>
              <p className="text-zinc-400 text-xs mt-1">
                Verified reviews from customers across Chakwal, Punjab
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-amber-400">{avgRating}</span>
              <div className="text-left text-xs">
                <div className="flex text-amber-400">
                  {'★'.repeat(Math.round(Number(avgRating)))}
                </div>
                <span className="text-zinc-400 text-[11px]">{productReviews.length} Ratings</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productReviews.length === 0 ? (
              <p className="text-zinc-400 text-xs col-span-2">
                No reviews yet for this item. Be the first customer in Chakwal to review it!
              </p>
            ) : (
              productReviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isDark ? 'bg-[#19191d] border-[#292933]' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{rev.customerName}</span>
                    <span className="text-[11px] text-zinc-500">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-400 text-xs">
                    {'★'.repeat(rev.rating)}
                  </div>
                  <p className="text-xs text-zinc-300 italic">"{rev.comment}"</p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Form */}
          <form onSubmit={handleReviewSubmit} className={`p-5 rounded-2xl border space-y-3 ${
            isDark ? 'bg-[#18181c] border-[#2d2d38]' : 'bg-zinc-100 border-zinc-300'
          }`}>
            <h3 className="font-kfc text-lg font-black uppercase flex items-center gap-1.5 text-[#e4002b]">
              <MessageSquare className="w-4 h-4" />
              Write a Review
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={currentUser?.fullName || reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={Boolean(currentUser)}
                  required
                  maxLength={80}
                  className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                    isDark ? 'bg-[#121214] border-[#2e2e38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Star Rating (1 - 5)
                </label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className={`w-full text-xs rounded-xl px-3 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                    isDark ? 'bg-[#121214] border-[#2e2e38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                >
                  <option value={5}>★★★★★ (5 Stars - Excellent)</option>
                  <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                  <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                  <option value={2}>★★☆☆☆ (2 Stars - Poor)</option>
                  <option value={1}>★☆☆☆☆ (1 Star - Bad)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Your Comments & Experience *
              </label>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                maxLength={1000}
                placeholder="How was the taste, packaging, and rider delivery?"
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                  isDark ? 'bg-[#121214] border-[#2e2e38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                }`}
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {reviewSubmitted ? (
                <span className="text-xs text-emerald-400 font-bold">
                  ✓ Thank you! Your review has been added.
                </span>
              ) : <span />}

              <button
                type="submit"
                disabled={!((currentUser?.fullName || reviewName).trim()) || !reviewComment.trim()}
                className="bg-[#e4002b] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#c30025] text-white text-xs font-bold uppercase px-5 py-2.5 rounded-xl cursor-pointer shadow"
              >
                Submit Review
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">Phone OTP ya sign-in ki zaroorat nahi. Please apna genuine review share karein.</p>
          </form>

        </div>

      </div>
    </div>
  );
};
