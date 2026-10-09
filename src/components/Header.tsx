import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { KFC_CATEGORIES } from '../data/kfcMenu';
import { CategoryId, MenuItem } from '../types';
import {
  ShoppingBag,
  Search,
  MapPin,
  Heart,
  X,
  Menu,
  Sun,
  Moon,
  User,
  Smartphone,
  Bike,
  Sparkles,
  Phone,
  FileText,
  Flame,
  ArrowRight,
  Store
} from 'lucide-react';

const MEAL_BOX_SUGGESTIONS = [
  'Krunch Combo',
  'Zinger Box',
  'Family Festival',
  'Hot Wings',
  'Mighty Zinger',
];

export const Header: React.FC = () => {
  const {
    settings,
    menuItems,
    cartCount,
    cartTotal,
    formatPKR,
    getItemEffectivePrice,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    wishlist,
    openWishlist,
    goHome,
    viewProduct,
    setActiveCategory,
    themeMode,
    toggleTheme,
    currentUser,
    setIsCustomerAuthModalOpen,
    openPolicyModal,
    setIsLoyaltyModalOpen,
    setIsVipModalOpen,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDesktopSearchFocused, setIsDesktopSearchFocused] = useState(false);
  const [desktopSuggestionIndex, setDesktopSuggestionIndex] = useState(0);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(true);

  const isDark = themeMode === 'dark';

  const handleSelectCategory = (catId: CategoryId) => {
    setActiveCategory(catId);
    setIsMobileDrawerOpen(false);
    goHome();
    const el = document.getElementById('kfc-menu-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Live instant search matches. Keep this safe for imported catalogue rows with missing fields.
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
  const matchingItems = normalizedSearch
    ? menuItems.filter((item) =>
        String(item.name || '').toLocaleLowerCase().includes(normalizedSearch) ||
        String(item.description || '').toLocaleLowerCase().includes(normalizedSearch) ||
        String(item.categoryId || '').toLocaleLowerCase().includes(normalizedSearch) ||
        String(item.brand || '').toLocaleLowerCase().includes(normalizedSearch)
      ).slice(0, 8)
    : [];
  const desktopSuggestions = normalizedSearch ? matchingItems : menuItems.slice(0, 5);

  return (
    <>
      <header className={`sticky top-0 z-40 border-b transition-colors shadow-md w-full overflow-visible ${
        isDark ? 'bg-[#121214] border-[#27272a] text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
      }`}>
        {/* Announcement Strip */}
        {settings.showAnnouncement && showTopBanner && (
          <div className="bg-[#e4002b] text-white text-[10px] sm:text-xs font-semibold py-1.5 px-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 mx-auto tracking-wide font-medium truncate">
              <span className="animate-pulse shrink-0">🍗</span>
              <span className="truncate">
                {settings.announcementText || 'KFC Picked from Kallar Kahar Motorway! Order before 4 PM for Delivery by 8 PM.'}
              </span>
            </div>
            <button
              onClick={() => setShowTopBanner(false)}
              className="text-white/80 hover:text-white p-0.5 rounded cursor-pointer shrink-0 ml-1.5"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MOBILE HEADER: Logo Middle, Menu & Signup Left, Wishlist, Search, Day/Night, Cart Right */}
        {/* Guaranteed ZERO overflow outside mobile screen! */}
        {/* ========================================================================= */}
        <div className="md:hidden max-w-full px-2 py-2">
          <div className="flex items-center justify-between gap-1 w-full flex-nowrap">
            
            {/* 1. LEFT SIDE: Menu (☰) + Signup (👤) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Menu (Hamburger) */}
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className={`min-w-[38px] min-h-[38px] flex items-center justify-center p-2 rounded-xl border transition-colors cursor-pointer active:scale-95 ${
                  isDark ? 'bg-[#1b1b20] border-[#2c2c34] text-white hover:bg-[#25252d]' : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
                }`}
                title="Open Navigation Menu"
                aria-label="Open navigation menu"
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Signup / Profile (With Logged-in Visual Indicator) */}
              <button
                type="button"
                onClick={() => setIsCustomerAuthModalOpen(true)}
                className={`min-w-[38px] min-h-[38px] flex items-center justify-center p-2 rounded-xl border transition-colors cursor-pointer relative active:scale-95 ${
                  currentUser
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                    : isDark ? 'bg-[#1b1b20] border-[#2c2c34] text-white hover:bg-[#25252d]' : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
                }`}
                title={currentUser ? `${currentUser.fullName} (Logged In · ${currentUser.loyaltyPoints || 0} pts)` : 'Sign In / Register'}
                aria-label="Customer account"
              >
                <User className={`w-4 h-4 ${currentUser ? 'text-emerald-400' : 'text-[#e4002b]'}`} />
                {currentUser && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1 right-1 ring-2 ring-[#121214] animate-pulse" />
                )}
              </button>
            </div>

            {/* 2. MIDDLE: Logo & Store Name (Replaced with uploaded emblem logo) */}
            <button
              onClick={goHome}
              className="flex-1 min-w-0 mx-1 flex items-center justify-center gap-2 focus:outline-none cursor-pointer overflow-hidden py-1 active:scale-98 transition-transform"
            >
              <img
                src="/logo.svg"
                alt="KFC Chakwal Delivery"
                className="w-10 h-10 object-contain rounded-full shadow-sm shrink-0 bg-white border border-zinc-200"
                onError={(e) => {
                  e.currentTarget.src = '/pwa-192.png';
                }}
              />
              <div className="flex flex-col text-left min-w-0 truncate">
                <span 
                  style={{ fontFamily: settings.headingFont || 'Barlow Condensed' }}
                  className="text-sm sm:text-base font-black uppercase tracking-tight leading-none truncate text-zinc-900"
                >
                  {settings.storeName}
                </span>
                <span className="text-[8px] text-[#e4002b] font-black uppercase tracking-wider truncate mt-0.5">
                  Chakwal Delivery · Within 3 KM
                </span>
              </div>
            </button>

            {/* 3. RIGHT SIDE: Wishlist, Search, Cart icons */}
            <div className="flex items-center gap-1.5 shrink-0">
              
              {/* Wishlist Icon */}
              <button
                type="button"
                onClick={openWishlist}
                className="min-w-[38px] min-h-[38px] flex items-center justify-center relative p-2 rounded-xl border transition-colors cursor-pointer active:scale-95 bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200"
                title="Wishlist"
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-[#e4002b] fill-[#e4002b]' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#e4002b] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Search Toggle Icon */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`min-w-[38px] min-h-[38px] flex items-center justify-center p-2 rounded-xl border transition-colors cursor-pointer active:scale-95 ${
                  isSearchOpen
                    ? 'bg-[#e4002b] text-white border-[#e4002b]'
                    : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200'
                }`}
                title="Search items"
                aria-label="Toggle search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Cart / Bucket Icon */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="min-w-[38px] min-h-[38px] flex items-center justify-center relative p-2 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white border border-[#c30025] transition-transform active:scale-90 cursor-pointer shadow-md shadow-red-950/40"
                title="Shopping Bucket"
                aria-label="View bucket"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-[#e4002b] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
              </button>

            </div>
          </div>

          {/* Slide-down Mobile Search Input with Meal Box Suggestions & Live Results */}
          {isSearchOpen && (
            <div className="pt-2 pb-1 border-t border-zinc-700/20 mt-1 space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Zingers, Krunch, Burgers..."
                  autoFocus
                  className={`w-full border text-xs rounded-xl pl-8 pr-8 py-2 focus:outline-none focus:border-[#e4002b] ${
                    isDark ? 'bg-[#18181c] border-[#292933] text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                  }`}
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2 top-2 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Suggested Meal Boxes Chips */}
              {!searchQuery && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#e4002b]" />
                    <span>Suggested Meal Boxes:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {MEAL_BOX_SUGGESTIONS.map((box) => (
                      <button
                        key={box}
                        type="button"
                        onClick={() => setSearchQuery(box)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                          isDark ? 'bg-[#1e1e24] border-zinc-700 text-zinc-300 hover:border-[#e4002b]' : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:border-[#e4002b]'
                        }`}
                      >
                        {box}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Instant Search Dropdown on Mobile */}
              {matchingItems.length > 0 && (
                <div className={`rounded-xl border divide-y overflow-hidden shadow-lg ${
                  isDark ? 'bg-[#18181f] border-zinc-800 divide-zinc-800' : 'bg-white border-zinc-200 divide-zinc-100'
                }`}>
                  {matchingItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        viewProduct(item);
                        setIsSearchOpen(false);
                      }}
                      className="p-2 flex items-center justify-between gap-2 hover:bg-zinc-500/10 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-lg object-cover bg-black/30 shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/src/assets/images/kfc_krunch_burger_1791015834419.jpg';
                          }}
                        />
                        <div className="truncate">
                          <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{item.name}</p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            {formatPKR(getItemEffectivePrice(item))}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP HEADER (MD & LG SCREENS) */}
        {/* ========================================================================= */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo and Brand (Replaced with uploaded emblem logo) */}
            <button
              onClick={goHome}
              className="flex items-center gap-3.5 group focus:outline-none text-left cursor-pointer shrink-0"
            >
              <img
                src="/logo.svg"
                alt="KFC Chakwal Delivery"
                className="w-12 h-12 object-contain rounded-full shadow-sm shrink-0 bg-white border border-zinc-200 group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.currentTarget.src = '/pwa-192.png';
                }}
              />

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span 
                    style={{ fontFamily: settings.headingFont || 'Barlow Condensed' }}
                    className="text-2xl font-black uppercase tracking-tight leading-none text-zinc-900"
                  >
                    {settings.storeName}
                  </span>
                  <span className="bg-[#e4002b] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider shrink-0">
                    Within 3 KM
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 font-semibold tracking-tight mt-0.5">
                  Fresh from Kallar Kahar Motorway · Order by 4 PM for 8 PM Delivery
                </span>
              </div>
            </button>

            {/* Desktop header keeps the brand and actions compact; search is on its own full-width row below. */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold shrink-0 bg-zinc-50 border-zinc-200 text-zinc-800">
              <MapPin className="w-3.5 h-3.5 text-[#e4002b] shrink-0" />
              <span>Coverage: Within 3 KM (Chakwal)</span>
            </div>

            {/* Desktop Right Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              
              {/* Wishlist */}
              <button
                type="button"
                onClick={openWishlist}
                className="relative p-2.5 rounded-xl border transition-all cursor-pointer bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700"
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-[#e4002b] fill-[#e4002b]' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#e4002b] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* VIP Club Pass Button (Desktop) */}
              <button
                type="button"
                onClick={() => setIsVipModalOpen(true)}
                className={`hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-black transition cursor-pointer active:scale-95 ${
                  currentUser?.vipStatus === 'active'
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50 text-amber-400'
                    : isDark ? 'bg-[#1c1c1f] hover:bg-[#25252a] border-[#2e2e33] text-amber-400' : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                }`}
                title="Colonel's VIP Club Membership"
                aria-label="VIP Club Membership"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{currentUser?.vipStatus === 'active' ? 'VIP Active' : 'VIP Pass'}</span>
              </button>

              {/* Loyalty Rewards Program (Desktop) */}
              <button
                type="button"
                onClick={() => setIsLoyaltyModalOpen(true)}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer active:scale-95 ${
                  isDark ? 'bg-[#1c1c1f] hover:bg-[#25252a] border-[#2e2e33] text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800'
                }`}
                title="KFC Loyalty Rewards"
                aria-label="Loyalty Rewards"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Rewards ({currentUser?.loyaltyPoints || 0} Pts)</span>
              </button>

              {/* Customer Account / Loyalty Points (With shortcut indicating logged-in status) */}
              <button
                type="button"
                onClick={() => setIsCustomerAuthModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  currentUser
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : isDark ? 'bg-[#1c1c1f] hover:bg-[#25252a] border-[#2e2e33] text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800'
                }`}
              >
                <div className="relative">
                  <User className={`w-4 h-4 ${currentUser ? 'text-emerald-400' : 'text-[#e4002b]'}`} />
                  {currentUser && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 border border-white" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="truncate max-w-[110px] font-bold">
                    {currentUser ? `${currentUser.fullName.split(' ')[0]} (Logged In)` : 'Sign In / Register'}
                  </span>
                  {currentUser && (
                    <span className="text-[10px] text-amber-400 font-bold">
                      {currentUser.loyaltyPoints || 0} Pts (10 / 300 Rs)
                    </span>
                  )}
                </div>
              </button>

              {/* Bucket / Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2.5 bg-[#e4002b] hover:bg-[#c30025] text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-[#e4002b] text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase font-bold text-red-200 leading-tight">Bucket</span>
                  <span className="text-xs font-extrabold tabular-nums">
                    {cartTotal > 0 ? formatPKR(cartTotal) : 'Rs. 0'}
                  </span>
                </div>
              </button>

            </div>
          </div>
        </div>

        {/* Dedicated desktop search row: stays visible on every desktop/tablet width and keeps suggestions above page content. */}
        <div className="hidden md:block border-t border-zinc-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="search"
                aria-label="Search menu products"
                role="combobox"
                aria-expanded={searchQuery.trim().length > 0}
                aria-controls="desktop-product-search-results"
                value={searchQuery}
                onFocus={() => { setIsDesktopSearchFocused(true); setDesktopSuggestionIndex(0); }}
                onBlur={() => { window.setTimeout(() => setIsDesktopSearchFocused(false), 160); }}
                onChange={(e) => { setSearchQuery(e.target.value); setDesktopSuggestionIndex(0); }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') { setSearchQuery(''); setIsDesktopSearchFocused(false); }
                  if (e.key === 'ArrowDown' && desktopSuggestions.length > 0) {
                    e.preventDefault();
                    setIsDesktopSearchFocused(true);
                    setDesktopSuggestionIndex((current) => Math.min(current + 1, desktopSuggestions.length - 1));
                  }
                  if (e.key === 'ArrowUp' && desktopSuggestions.length > 0) {
                    e.preventDefault();
                    setDesktopSuggestionIndex((current) => Math.max(current - 1, 0));
                  }
                  if (e.key === 'Enter' && desktopSuggestions[desktopSuggestionIndex]) {
                    e.preventDefault();
                    viewProduct(desktopSuggestions[desktopSuggestionIndex]);
                    setSearchQuery('');
                    setIsDesktopSearchFocused(false);
                  }
                }}
                placeholder="Search products by name, description, or category..."
                className="w-full border border-zinc-300 text-sm rounded-2xl pl-11 pr-12 py-3 focus:outline-none focus:border-[#e4002b] focus:ring-2 focus:ring-red-100 transition-colors bg-zinc-50 text-zinc-900 placeholder-zinc-400"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200" aria-label="Clear search">
                  <X className="w-4 h-4" />
                </button>
              )}
              {(isDesktopSearchFocused || normalizedSearch.length > 0) && (
                <div id="desktop-product-search-results" className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-zinc-200 shadow-2xl z-[1000] overflow-hidden bg-white max-h-[min(65vh,480px)] overflow-y-auto" role="listbox" aria-label="Product search suggestions">
                  <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    {normalizedSearch ? `Search results (${matchingItems.length})` : 'Popular menu items'}
                  </div>
                  {normalizedSearch && matchingItems.length === 0 ? (
                    <div className="p-4 text-sm text-zinc-500">No products found for “{searchQuery.trim()}”. Try another name or category.</div>
                  ) : desktopSuggestions.map((item, index) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === desktopSuggestionIndex}
                      key={item.id}
                      onMouseEnter={() => setDesktopSuggestionIndex(index)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { viewProduct(item); setSearchQuery(''); setIsDesktopSearchFocused(false); }}
                      className={`w-full p-3.5 flex items-center justify-between gap-4 text-left border-b border-zinc-100 last:border-b-0 transition ${index === desktopSuggestionIndex ? 'bg-red-50' : 'hover:bg-red-50'}`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <img src={item.image || '/pwa-192.png'} alt="" className="w-12 h-12 rounded-xl object-cover bg-zinc-100 shrink-0" onError={(e) => { e.currentTarget.src = '/pwa-192.png'; }} />
                        <span className="min-w-0">
                          <span className="block font-bold text-sm text-zinc-900 truncate">{item.name}</span>
                          <span className="block text-xs text-zinc-500 truncate">{item.description || item.categoryId}</span>
                        </span>
                      </span>
                      <span className="text-sm font-mono font-bold text-emerald-700 shrink-0">{formatPKR(getItemEffectivePrice(item))}</span>
                    </button>
                  ))}
                  {!normalizedSearch && <div className="px-4 py-2 text-[10px] text-zinc-400 border-t border-zinc-100">Type to filter instantly · Use ↑ ↓ and Enter to select</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE SLIDE-OUT DRAWER */}
      {/* ========================================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          <div className={`relative w-4/5 max-w-xs h-full shadow-2xl flex flex-col justify-between overflow-y-auto ${
            isDark ? 'bg-[#151518] text-white border-r border-[#26262e]' : 'bg-white text-zinc-900 border-r border-zinc-200'
          }`}>
            <div className="p-4 space-y-4">
              
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-700/20">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 h-5 items-center shrink-0">
                    <span className="w-1.5 h-5 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
                    <span className="w-1.5 h-4 bg-white border border-zinc-300 rounded-sm transform -skew-x-6"></span>
                    <span className="w-1.5 h-5 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
                  </div>
                  <span className="font-kfc text-lg font-black uppercase tracking-tight">
                    {settings.storeName}
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Kallar Kahar Notice & Delivery Coverage */}
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                isDark ? 'bg-[#1b1b22] border-[#292934]' : 'bg-red-50/60 border-red-200'
              }`}>
                <div className="flex items-center gap-1.5 text-[#e4002b] font-bold text-[11px] uppercase">
                  <Bike className="w-3.5 h-3.5 shrink-0" />
                  <span>Kallar Kahar ➔ Chakwal (Within 3 KM)</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  {settings.kallarKaharNotice || 'Hum Kallar Kahar Motorway wali KFC branch se KFC pick kar ky Chakwal mein daily deliver karty hein.'}
                </p>
                <p className={`text-[10px] font-bold pt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  ⏰ Order before 4:00 PM for Same-Day Delivery by 8:00 PM!
                </p>
              </div>

              {/* Loyalty Points Status (if signed in) */}
              {currentUser && (
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-amber-500/30' : 'bg-amber-50 border-amber-300'
                }`}>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-amber-500">Loyalty Rewards</span>
                    <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>{currentUser.loyaltyPoints || 0} Points</p>
                    <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Har Rs. 300 par 10 points (Worth Rs. {currentUser.loyaltyPoints || 0} discount)</p>
                  </div>
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </div>
              )}

              {/* Menu Categories */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Menu Categories
                </p>
                {KFC_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      isDark ? 'hover:bg-[#202026] text-zinc-200' : 'hover:bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-zinc-500 font-normal">→</span>
                  </button>
                ))}
              </div>

              {/* Customer Account / Policies / WhatsApp Action */}
              <div className="pt-2 border-t border-zinc-700/20 space-y-2 text-xs">
                <button
                  onClick={() => {
                    setIsCustomerAuthModalOpen(true);
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border font-bold cursor-pointer ${
                    currentUser
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                      : isDark ? 'bg-[#1a1a20] border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                  }`}
                >
                  <User className="w-4 h-4 text-[#e4002b]" />
                  <span>{currentUser ? `${currentUser.fullName} (Profile & ${currentUser.loyaltyPoints || 0} Pts)` : 'Sign In / Register'}</span>
                </button>

                <button
                  onClick={() => {
                    openPolicyModal();
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border font-bold cursor-pointer ${
                    isDark ? 'bg-[#1a1a20] border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#e4002b]" />
                  <span>Delivery & Loyalty Policies</span>
                </button>

                {/* Direct WhatsApp Contact */}
                <a
                  href={`https://wa.me/923252777574?text=${encodeURIComponent('Assalam o Alaikum KFC Chakwal Delivery, I have an order query.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp Contact</span>
                  </div>
                  <span className="text-[11px] font-mono">+92 325 2777574</span>
                </a>

                {/* Loyalty Rewards Program Button (Mobile) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsLoyaltyModalOpen(true);
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border font-bold cursor-pointer transition ${
                    isDark ? 'bg-[#1b1b22] border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Loyalty Rewards Hub</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-500 font-black">
                    {currentUser?.loyaltyPoints || 0} Pts
                  </span>
                </button>

                {/* VIP Club Pass Button (Mobile) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsVipModalOpen(true);
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border font-bold cursor-pointer transition ${
                    currentUser?.vipStatus === 'active'
                      ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50 text-amber-400'
                      : isDark ? 'bg-[#1b1b22] border-zinc-800 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Colonel's VIP Club (Lifetime)</span>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-amber-500/20 px-2 py-0.5 rounded text-amber-400">
                    {currentUser?.vipStatus === 'active' ? 'Active' : 'Get Pass'}
                  </span>
                </button>

              </div>
            </div>

            {/* Drawer Bottom */}
            <div className={`p-4 border-t text-[11px] ${
              isDark ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-500'
            }`}>
              <p className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>KFC Chakwal Delivery</p>
              <p className="text-[10px] mt-0.5">Phone: +92 325 2777574</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
