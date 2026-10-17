import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { KFC_CATEGORIES, DEFAULT_NAVIGATION_MENU_ITEMS } from '../data/kfcMenu';
import { CategoryId, MenuItem, NavigationMenuItem, CustomPage } from '../types';
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
  Store,
  Home,
  UtensilsCrossed,
  Star,
  Gift,
  Crown,
  ExternalLink,
  Compass,
  ChevronDown,
} from 'lucide-react';
import { CustomerNotificationToggle } from './CustomerNotificationToggle';
import { BranchSelector } from './BranchSelector';

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
    currentView,
    setCurrentView,
    isAdmin,
    setIsAdmin,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDesktopSearchFocused, setIsDesktopSearchFocused] = useState(false);
  const [desktopSuggestionIndex, setDesktopSuggestionIndex] = useState(0);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDesktopMenuDropdownOpen, setIsDesktopMenuDropdownOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const [selectedCustomPage, setSelectedCustomPage] = useState<CustomPage | null>(null);

  const isDark = themeMode === 'dark';
  const isHeaderSticky = settings.isHeaderSticky !== false;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(e.target as Node)) {
        setIsDesktopMenuDropdownOpen(false);
      }
    };
    if (isDesktopMenuDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDesktopMenuDropdownOpen]);

  const handleSelectCategory = (catId: CategoryId) => {
    setActiveCategory(catId);
    setIsMobileDrawerOpen(false);
    goHome();
    const el = document.getElementById('kfc-menu-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Live instant search matches. Keep this safe for imported catalogue rows with missing fields.
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
  const activeItems = menuItems.filter((item) => item.status !== 'draft');
  const matchingItems = normalizedSearch
    ? activeItems.filter((item) =>
        String(item.name || '').toLocaleLowerCase().includes(normalizedSearch) ||
        String(item.description || '').toLocaleLowerCase().includes(normalizedSearch) ||
        String(item.categoryId || '').toLocaleLowerCase().includes(normalizedSearch)
      ).slice(0, 8)
    : [];
  const desktopSuggestions = normalizedSearch ? matchingItems : activeItems.slice(0, 5);

  const renderNavIcon = (icon?: string) => {
    switch (icon) {
      case 'home':
        return <Home className="w-4 h-4 text-[#e4002b]" />;
      case 'utensils':
        return <UtensilsCrossed className="w-4 h-4 text-[#e4002b]" />;
      case 'flame':
        return <Flame className="w-4 h-4 text-[#e4002b]" />;
      case 'star':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'gift':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'crown':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'file':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-emerald-500" />;
      default:
        return <Compass className="w-4 h-4 text-[#e4002b]" />;
    }
  };

  const handleNavigationClick = (item: NavigationMenuItem) => {
    setIsMobileDrawerOpen(false);
    setIsDesktopMenuDropdownOpen(false);
    const link = (item.link || '/').trim();
    if (link === '/' || link === '#home') {
      goHome();
      return;
    }
    if (link.startsWith('#')) {
      if (currentView !== 'home') {
        goHome();
        setTimeout(() => {
          const el = document.querySelector(link);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else {
        const el = document.querySelector(link);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    if (link.startsWith('category:')) {
      const catId = link.replace('category:', '') as CategoryId;
      handleSelectCategory(catId);
      return;
    }
    if (link === 'view:reviews') {
      setCurrentView('reviews');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (link === 'view:rewards') {
      setCurrentView('rewards');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (link === 'action:vip') {
      setIsVipModalOpen(true);
      return;
    }
    if (link === 'action:loyalty') {
      setIsLoyaltyModalOpen(true);
      return;
    }
    if (link === 'action:policies') {
      openPolicyModal();
      return;
    }
    if (link === 'action:auth') {
      setIsCustomerAuthModalOpen(true);
      return;
    }
    if (link.startsWith('page:')) {
      const slug = link.replace('page:', '');
      const page = (settings.customPages || []).find((p) => p.slug === slug || p.id === slug);
      if (page) {
        setSelectedCustomPage(page);
      }
      return;
    }
    if (link.startsWith('http') || link.startsWith('//') || link.startsWith('https://wa.me')) {
      if (item.target === '_blank') {
        window.open(link, '_blank');
      } else {
        window.location.href = link;
      }
      return;
    }
    window.location.href = link;
  };

  return (
    <>
      <header className={`${isHeaderSticky ? 'sticky top-0 z-40' : 'relative z-40'} border-b transition-colors shadow-md w-full overflow-visible ${
        isDark ? 'bg-[#121214] border-[#27272a] text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
      }`}>
        {/* ========================================================================= */}
        {/* MOBILE HEADER: Logo Middle, Menu & Signup Left, Wishlist, Search, Day/Night, Cart Right */}
        {/* Guaranteed ZERO overflow outside mobile screen! */}
        {/* ========================================================================= */}
        <div className="md:hidden max-w-full px-2 py-2">
          <div className="relative flex items-center justify-between gap-1 w-full flex-nowrap">
            
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

            {/* Centered uploaded logo only */}
            <button
              type="button"
              onClick={goHome}
              className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center cursor-pointer py-1"
              aria-label="Go to home"
            >
              <img
                src={settings.customPreloaderLogoUrl || '/logo.svg'}
                alt="KFC Chakwal Delivery"
                className="w-11 h-11 object-contain bg-transparent" style={{ backgroundColor: 'transparent', mixBlendMode: 'normal' }}
                onError={(e) => { e.currentTarget.src = '/pwa-192.png'; }}
              />
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
                data-wishlist-target="true"
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
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Uploaded logo centered; no store name or extra tagline */}
            <button
              type="button"
              onClick={goHome}
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer"
              aria-label="Go to home"
            >
              <img
                src={settings.customPreloaderLogoUrl || '/logo.svg'}
                alt="KFC Chakwal Delivery"
                className="w-14 h-14 object-contain bg-transparent mix-blend-multiply"
                onError={(e) => { e.currentTarget.src = '/pwa-192.png'; }}
              />
            </button>

            {/* Desktop Left: Navigation Menu Dropdown (Editable items) + Coverage */}
            <div ref={desktopMenuRef} className="relative flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsDesktopMenuDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                  isDark ? 'bg-[#1b1b20] border-[#2c2c34] text-white hover:bg-[#25252d]' : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
                }`}
                title="Navigation Menu Dropdown"
                aria-label="Open navigation menu dropdown"
                aria-expanded={isDesktopMenuDropdownOpen}
              >
                <Menu className="w-4 h-4 text-[#e4002b]" />
                <span>Menu</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isDesktopMenuDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Menu Dropdown Popover */}
              {isDesktopMenuDropdownOpen && (
                <div className={`absolute top-full left-0 mt-2 w-72 rounded-2xl border shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                  isDark ? 'bg-[#18181d] border-[#2a2a34] text-white shadow-black/60' : 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
                }`}>
                  <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-zinc-700/15 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Navigation Menu</span>
                    <span className="text-[10px] text-[#e4002b] font-bold">KFC Chakwal</span>
                  </div>

                  <div className="space-y-0.5 max-h-80 overflow-y-auto no-scrollbar">
                    {((settings.navigationMenuItems && settings.navigationMenuItems.length > 0)
                      ? settings.navigationMenuItems.filter((i) => i.isEnabled !== false)
                      : DEFAULT_NAVIGATION_MENU_ITEMS
                    )
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((navItem) => (
                        <button
                          key={navItem.id}
                          type="button"
                          onClick={() => handleNavigationClick(navItem)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer group ${
                            isDark ? 'hover:bg-[#22222a] text-zinc-200' : 'hover:bg-zinc-100 text-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {renderNavIcon(navItem.icon)}
                            <span className="truncate">{navItem.label}</span>
                            {navItem.badge && (
                              <span className="bg-[#e4002b] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md">
                                {navItem.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-400 group-hover:translate-x-0.5 transition-transform">
                            {navItem.target === '_blank' ? <ExternalLink className="w-3.5 h-3.5" /> : '→'}
                          </span>
                        </button>
                      ))}
                  </div>

                  {isAdmin && (
                    <div className="pt-2 mt-2 border-t border-zinc-700/15">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDesktopMenuDropdownOpen(false);
                          setIsAdmin(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-black bg-red-50 text-[#e4002b] hover:bg-red-100 flex items-center gap-2 transition cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>⚙️ Edit Navigation Menu (Admin)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <BranchSelector variant="header" className="hidden lg:block shrink-0" />
            </div>

            {/* Desktop Right Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              
              {/* Wishlist */}
              <button
                type="button"
                onClick={openWishlist}
                className="relative p-2.5 rounded-xl border transition-all cursor-pointer bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700"
                title="Wishlist"
                aria-label="Wishlist"
                data-wishlist-target="true"
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
                aria-expanded={isDesktopSearchFocused || searchQuery.trim().length > 0}
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
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          <div className={`relative w-4/5 max-w-sm h-full shadow-2xl flex flex-col justify-between overflow-y-auto ${
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

              {/* Editable Navigation Menu Items */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Navigation Menu
                </p>
                {((settings.navigationMenuItems && settings.navigationMenuItems.length > 0)
                  ? settings.navigationMenuItems.filter((i) => i.isEnabled !== false)
                  : DEFAULT_NAVIGATION_MENU_ITEMS
                )
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((navItem) => (
                    <button
                      key={navItem.id}
                      type="button"
                      onClick={() => handleNavigationClick(navItem)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer group ${
                        isDark ? 'hover:bg-[#202026] text-zinc-200' : 'hover:bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {renderNavIcon(navItem.icon)}
                        <span className="truncate">{navItem.label}</span>
                        {navItem.badge && (
                          <span className="bg-[#e4002b] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-2xs">
                            {navItem.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 group-hover:translate-x-0.5 transition-transform">
                        {navItem.target === '_blank' ? <ExternalLink className="w-3.5 h-3.5" /> : '→'}
                      </span>
                    </button>
                  ))}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      setIsAdmin(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black bg-red-50 text-[#e4002b] hover:bg-red-100 flex items-center gap-2 transition cursor-pointer mt-1"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>⚙️ Edit Navigation Menu (Admin)</span>
                  </button>
                )}
              </div>

              {/* Menu Categories Shortcuts */}
              <div className="pt-2 border-t border-zinc-700/20 space-y-1">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Food Categories
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {KFC_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`text-left px-2.5 py-2 rounded-xl text-[11px] font-bold transition truncate cursor-pointer ${
                        isDark ? 'bg-[#1b1b20] hover:bg-[#25252c] text-zinc-300' : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
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

                {/* Customer Push Notification Subscription Toggle */}
                <div className="pt-1">
                  <CustomerNotificationToggle variant="button" />
                </div>

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

      {/* Custom Page Viewer Modal */}
      {selectedCustomPage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-2xl w-full max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden ${
            isDark ? 'bg-[#18181c] border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black uppercase text-zinc-900 dark:text-white">
                  {selectedCustomPage.title}
                </h3>
                <span className="text-[11px] text-zinc-400">/{selectedCustomPage.slug}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomPage(null)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              className="p-6 overflow-y-auto max-w-none text-xs sm:text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: selectedCustomPage.content }}
            />
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomPage(null)}
                className="px-5 py-2.5 rounded-xl bg-[#e4002b] hover:bg-[#c30025] text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
