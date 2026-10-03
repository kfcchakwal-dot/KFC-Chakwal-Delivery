import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MenuItem, MenuItemAddon } from '../types';
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
  ShoppingBag,
} from 'lucide-react';

export const ProductPage: React.FC = () => {
  const {
    selectedProduct,
    goHome,
    addToCart,
    getItemEffectivePrice,
    formatPKR,
    wishlist,
    toggleWishlist,
    reviews,
    addReview,
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
  const [spiceLevel, setSpiceLevel] = useState<'Hot & Crispy' | 'Original Recipe'>(
    item.isSpicy ? 'Hot & Crispy' : 'Original Recipe'
  );
  const [drink, setDrink] = useState<string>('Pepsi Can (345ml)');
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [instructions, setInstructions] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);

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
        spiceLevel: item.customizableOptions?.allowSpiceLevel ? spiceLevel : undefined,
        drink: item.customizableOptions?.allowDrinkChoice ? drink : undefined,
        addons: selectedAddons,
        specialInstructions: instructions.trim() || undefined,
      },
      quantity
    );
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    addReview({
      productId: item.id,
      customerName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
    });

    setReviewName('');
    setReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const productReviews = reviews.filter((r) => r.productId === item.id);
  const avgRating =
    productReviews.length > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      : '5.0';

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
            className="flex items-center gap-2 text-zinc-400 hover:text-[#e4002b] font-bold uppercase transition-colors cursor-pointer"
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
            <div className={`relative aspect-square rounded-3xl overflow-hidden border shadow-2xl ${
              isDark ? 'bg-[#161619] border-[#292932]' : 'bg-white border-zinc-200'
            }`}>
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />

              {/* Customizable Badge */}
              <div className={`absolute ${badgeClasses} z-10 flex gap-2`}>
                {item.customBadgeText ? (
                  <span className="bg-[#e4002b] text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-lg">
                    {item.customBadgeText}
                  </span>
                ) : (
                  <>
                    {item.isPopular && (
                      <span className="bg-[#e4002b] text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-lg">
                        Popular in Chakwal
                      </span>
                    )}
                    {item.isSpicy && (
                      <span className="bg-amber-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        Spicy
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Wishlist toggle */}
              <button
                type="button"
                onClick={() => toggleWishlist(item.id)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-lg z-10 ${
                  isFavorite
                    ? 'bg-[#e4002b] text-white'
                    : isDark ? 'bg-black/60 text-white hover:bg-black/90' : 'bg-white/80 text-zinc-700 hover:bg-white'
                }`}
                title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Quick Guarantees Strip */}
            <div className={`p-4 rounded-2xl border grid grid-cols-3 gap-2 text-center text-xs ${
              isDark ? 'bg-[#16161a] border-[#26262e] text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'
            }`}>
              <div className="space-y-0.5">
                <Bike className="w-4 h-4 text-[#e4002b] mx-auto mb-1" />
                <p className="font-bold">Rs. {settings.deliveryFee}</p>
                <p className="text-[10px] text-zinc-400">Flat Chakwal Delivery</p>
              </div>
              <div className="space-y-0.5 border-x border-zinc-700/40">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <p className="font-bold">100% Halal</p>
                <p className="text-[10px] text-zinc-400">Fried to Order</p>
              </div>
              <div className="space-y-0.5">
                <Star className="w-4 h-4 text-amber-400 mx-auto mb-1 fill-amber-400" />
                <p className="font-bold">{avgRating} / 5.0</p>
                <p className="text-[10px] text-zinc-400">{productReviews.length} Reviews</p>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Pricing, Customize & Upgrade */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header info */}
            <div className="space-y-2 border-b pb-5 border-zinc-700/30">
              <span className="text-xs font-bold uppercase tracking-widest text-[#e4002b]">
                KFC Chakwal Official Menu
              </span>
              <h1 className="font-kfc text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-none">
                {item.name}
              </h1>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
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
                  <span className="text-xs font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Save {discountPercent}%
                  </span>
                )}
                <span className="text-xs text-zinc-400">
                  (Single Unit Price in PKR)
                </span>
              </div>
            </div>

            {/* CUSTOMIZE & UPGRADE SECTION */}
            <div className={`p-5 rounded-2xl border space-y-5 ${
              isDark ? 'bg-[#161619] border-[#292932]' : 'bg-white border-zinc-200'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-zinc-700/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-kfc text-xl font-black uppercase tracking-wider">
                    Customize & Upgrade Meal
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#e4002b]">
                  Chakwal Special
                </span>
              </div>

              {/* 1. Spice / Coating Level */}
              {item.customizableOptions?.allowSpiceLevel && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                    Choose Flavor / Coating:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSpiceLevel('Hot & Crispy')}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        spiceLevel === 'Hot & Crispy'
                          ? 'border-[#e4002b] bg-[#e4002b]/15 text-white'
                          : isDark ? 'border-[#2d2d38] bg-[#121214] text-zinc-400' : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        Hot & Crispy (Spicy)
                      </span>
                      {spiceLevel === 'Hot & Crispy' && <Check className="w-4 h-4 text-[#e4002b]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSpiceLevel('Original Recipe')}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        spiceLevel === 'Original Recipe'
                          ? 'border-[#e4002b] bg-[#e4002b]/15 text-white'
                          : isDark ? 'border-[#2d2d38] bg-[#121214] text-zinc-400' : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                      }`}
                    >
                      <span>Original Recipe (Mild)</span>
                      {spiceLevel === 'Original Recipe' && <Check className="w-4 h-4 text-[#e4002b]" />}
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Drink Choice */}
              {item.customizableOptions?.allowDrinkChoice && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                    Select Beverage (Included):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {drinksList.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDrink(d)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                          drink === d
                            ? 'border-[#e4002b] bg-[#e4002b]/15 text-white font-bold'
                            : isDark ? 'border-[#2d2d38] bg-[#121214] text-zinc-400' : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                        }`}
                      >
                        <span className="truncate">{d}</span>
                        {drink === d && <Check className="w-3.5 h-3.5 text-[#e4002b] shrink-0" />}
                      </button>
                    ))}
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
                              ? 'border-[#e4002b] bg-[#e4002b]/10 text-white font-bold'
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
              <div className={`flex items-center border rounded-2xl p-1.5 shrink-0 ${
                isDark ? 'bg-[#161619] border-[#2d2d38]' : 'bg-white border-zinc-300'
              }`}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-black text-base tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full flex-1 bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-xl py-4 px-6 rounded-2xl font-black flex items-center justify-between shadow-2xl shadow-red-950/50 cursor-pointer transition-all active:scale-[0.98]"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  {addedAnimation ? 'ADDED TO BUCKET!' : 'ADD TO BUCKET'}
                </span>
                <span className="font-sans text-base font-extrabold bg-black/25 px-3 py-1 rounded-xl tabular-nums">
                  {formatPKR(totalPrice)}
                </span>
              </button>
            </div>

          </div>

        </div>

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
                  Your Name (e.g. Ali - Saddar Bazar) *
                </label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="Enter your name"
                  className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:border-[#e4002b] ${
                    isDark ? 'bg-[#121214] border-[#2e2e38] text-white' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                  required
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
                className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold uppercase px-5 py-2.5 rounded-xl cursor-pointer shadow"
              >
                Submit Review
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
