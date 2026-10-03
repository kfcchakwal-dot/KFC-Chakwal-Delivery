import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { KFC_CATEGORIES } from '../data/kfcMenu';
import { CategoryId } from '../types';
import {
  ShoppingBag,
  Search,
  Settings2,
  MapPin,
  Heart,
  Clock,
  X,
  Menu,
  ChevronDown,
  Sun,
  Moon,
  User,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    settings,
    cartCount,
    cartTotal,
    formatPKR,
    orderType,
    setOrderType,
    selectedArea,
    setSelectedArea,
    chakwalAreas,
    setIsCartOpen,
    setIsCustomizerOpen,
    searchQuery,
    setSearchQuery,
    wishlist,
    isAdmin,
    openWishlist,
    goHome,
    setActiveCategory,
    themeMode,
    toggleTheme,
    currentUser,
    setIsCustomerAuthModalOpen,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(true);

  const isDark = themeMode === 'dark';

  const handleSelectCategory = (catId: CategoryId) => {
    setActiveCategory(catId);
    setIsMenuDropdownOpen(false);
    goHome();
    const el = document.getElementById('kfc-menu-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors shadow-lg ${
      isDark ? 'bg-[#121214] border-[#27272a] text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
    }`}>
      {/* Optional customizable announcement strip */}
      {settings.showAnnouncement && showTopBanner && (
        <div className="bg-[#e4002b] text-white text-xs sm:text-sm font-semibold py-1.5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto tracking-wide font-medium">
            <span className="animate-pulse">🍗</span>
            <span>{settings.announcementText}</span>
          </div>
          <button
            onClick={() => setShowTopBanner(false)}
            className="text-white/80 hover:text-white p-0.5 rounded cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main KFC Top Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Zone 1: Logo / Wordmark + Menu Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Logo and Store Name */}
            <button
              onClick={goHome}
              className="flex items-center gap-3 group focus:outline-none text-left cursor-pointer"
            >
              {/* If user uploaded custom logo, show it; else show iconic KFC 3 red stripes */}
              {settings.headerFooter?.logoUrl ? (
                <img
                  src={settings.headerFooter.logoUrl}
                  alt={settings.storeName}
                  className="h-10 sm:h-12 w-auto max-w-[120px] object-contain shrink-0"
                />
              ) : (
                <div className="flex gap-1 h-9 items-center shrink-0">
                  <span className="w-2.5 h-9 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
                  <span className="w-2.5 h-7 bg-white border border-zinc-300 rounded-sm transform -skew-x-6"></span>
                  <span className="w-2.5 h-9 bg-[#e4002b] rounded-sm transform -skew-x-6"></span>
                </div>
              )}
              
              <div className="flex flex-col">
                <span className={`font-kfc text-2xl sm:text-3xl font-black tracking-wider leading-none uppercase ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}>
                  {settings.headerFooter?.headerTitle || settings.storeName}
                </span>
                <span className="text-[11px] font-medium text-[#e4002b] tracking-wider uppercase flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#e4002b]" />
                  Chakwal, Punjab
                </span>
              </div>
            </button>

            {/* HEADER MENU DROPDOWN (Requested: Header mein Menu ka dropdown hona chahye) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                  isMenuDropdownOpen
                    ? 'bg-[#e4002b] text-white border-[#e4002b]'
                    : isDark
                    ? 'bg-[#1c1c1f] hover:bg-[#25252a] text-zinc-300 border-[#2e2e33]'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                }`}
                title="Browse Full Menu & Categories"
              >
                <Menu className="w-4 h-4" />
                <span className="hidden sm:inline">Menu</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Panel */}
              {isMenuDropdownOpen && (
                <div className={`absolute left-0 mt-2 w-72 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  isDark ? 'bg-[#18181c] border-[#2e2e38] text-white' : 'bg-white border-zinc-200 text-zinc-900'
                }`}>
                  <div className="p-2 border-b border-zinc-700/30 mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-[#e4002b] tracking-wider">
                      KFC Pakistan Menu
                    </span>
                    <span className="text-[10px] text-zinc-400">Chakwal Portal</span>
                  </div>

                  {/* Categories list */}
                  <div className="space-y-1">
                    {KFC_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isDark ? 'hover:bg-[#25252d] text-zinc-200' : 'hover:bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[10px] text-zinc-400">View</span>
                      </button>
                    ))}
                  </div>

                  {/* Dropdown Footer Quick Links */}
                  <div className="mt-2 pt-2 border-t border-zinc-700/30 grid grid-cols-2 gap-1.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuDropdownOpen(false);
                        openWishlist();
                      }}
                      className={`p-2 rounded-xl flex items-center gap-1.5 justify-center cursor-pointer ${
                        isDark ? 'bg-[#22222a] hover:bg-[#2b2b35] text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 text-[#e4002b]" />
                      <span>Wishlist ({wishlist.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuDropdownOpen(false);
                        setIsCustomerAuthModalOpen(true);
                      }}
                      className={`p-2 rounded-xl flex items-center gap-1.5 justify-center cursor-pointer ${
                        isDark ? 'bg-[#22222a] hover:bg-[#2b2b35] text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-[#e4002b]" />
                      <span>{currentUser ? 'My Account' : 'Sign In'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Type Toggle: Delivery vs Pickup */}
            <div className={`hidden xl:flex items-center p-1 rounded-full border ${
              isDark ? 'bg-[#1c1c1f] border-[#2e2e33]' : 'bg-zinc-100 border-zinc-300'
            }`}>
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase transition-all duration-200 cursor-pointer ${
                  orderType === 'delivery'
                    ? 'bg-[#e4002b] text-white shadow-md'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Delivery (Rs {settings.deliveryFee})
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase transition-all duration-200 cursor-pointer ${
                  orderType === 'pickup'
                    ? 'bg-[#e4002b] text-white shadow-md'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Takeaway
              </button>
            </div>
          </div>

          {/* Zone 2: Chakwal Location Selector & Search */}
          <div className="flex-1 max-w-md hidden lg:flex items-center gap-2.5">
            {/* Location Selector */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                className={`w-full flex items-center justify-between border px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isDark ? 'bg-[#1c1c1f] hover:bg-[#25252a] border-[#2e2e33]' : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 text-[#e4002b] shrink-0" />
                  <div className="truncate">
                    <p className="text-[9px] uppercase font-bold text-zinc-400 leading-tight">Delivering to</p>
                    <p className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {selectedArea.name}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 ml-1.5 shrink-0">{selectedArea.estimatedTime}</span>
              </button>

              {/* Area Dropdown */}
              {isAreaDropdownOpen && (
                <div className={`absolute left-0 right-0 mt-2 border rounded-2xl shadow-2xl p-2 z-50 max-h-72 overflow-y-auto ${
                  isDark ? 'bg-[#1c1c1f] border-[#2e2e33] text-white' : 'bg-white border-zinc-200 text-zinc-900'
                }`}>
                  <div className="p-2 border-b border-zinc-700/30 mb-1">
                    <p className="text-xs font-bold text-[#e4002b] uppercase tracking-wider">Select Chakwal Location</p>
                    <p className="text-[10px] text-zinc-400">Express delivery to your home or office</p>
                  </div>
                  {chakwalAreas.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => {
                        setSelectedArea(area);
                        setIsAreaDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedArea.id === area.id
                          ? 'bg-[#e4002b] text-white font-bold'
                          : isDark ? 'text-zinc-300 hover:bg-[#28282e]' : 'text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <span className="truncate">{area.name}</span>
                      <span className="text-[10px] opacity-80 ml-2 shrink-0">{area.estimatedTime}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Zingers, Wings..."
                className={`w-full border text-xs rounded-xl pl-8 pr-7 py-2.5 focus:outline-none focus:border-[#e4002b] transition-colors ${
                  isDark ? 'bg-[#1c1c1f] border-[#2e2e33] text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
                }`}
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-3 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2.5 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Zone 3: Day/Night Theme, Wishlist, Account, Bucket */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`lg:hidden p-2.5 border rounded-xl cursor-pointer ${
                isDark ? 'bg-[#1c1c1f] border-[#2e2e33] text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
              }`}
              aria-label="Toggle search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Day / Night Theme Toggle (Theme k both options day and night hony chahye) */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#1c1c1f] hover:bg-[#25252a] border-[#2e2e33] text-amber-400'
                  : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-amber-600'
              }`}
              title={isDark ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
              aria-label="Toggle Day/Night mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Wishlist Button (wishlist page bhi hona chahye) */}
            <button
              type="button"
              onClick={openWishlist}
              className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#1c1c1f] hover:bg-[#25252a] border-[#2e2e33] text-zinc-300 hover:text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
              }`}
              title="Saved Wishlist Items"
            >
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-[#e4002b] fill-[#e4002b]' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#e4002b] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Customer Account / Sign Up Button (Customer ka signup option bhi banao) */}
            <button
              type="button"
              onClick={() => setIsCustomerAuthModalOpen(true)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                currentUser
                  ? 'border-emerald-600/40 bg-emerald-950/30 text-emerald-400'
                  : isDark
                  ? 'bg-[#1c1c1f] hover:bg-[#25252a] border-[#2e2e33] text-zinc-300 hover:text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800'
              }`}
              title="Customer Login / Signup"
            >
              <User className="w-3.5 h-3.5 text-[#e4002b]" />
              <span className="truncate max-w-[80px]">
                {currentUser ? currentUser.fullName.split(' ')[0] : 'Sign In'}
              </span>
            </button>

            {/* Customizer / Settings Button (Only for Admin) */}
            {isAdmin && (
              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#221808] hover:bg-[#2f210a] text-amber-300 border border-amber-800/60 rounded-xl text-xs font-bold transition-all cursor-pointer group"
                title="Customize App: Markup %, Delivery charges, items & settings"
              >
                <Settings2 className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Bucket / Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 bg-[#e4002b] hover:bg-[#c30025] text-white px-3.5 sm:px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-red-900/30 cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-[#e4002b] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-red-200 leading-tight">Bucket</span>
                <span className="text-xs font-extrabold tabular-nums">
                  {cartTotal > 0 ? formatPKR(cartTotal) : 'Rs. 0'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search input expander */}
        {isSearchOpen && (
          <div className="lg:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Zingers, Krunch, Buckets, Wings..."
                className={`w-full border text-sm rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-[#e4002b] ${
                  isDark ? 'bg-[#1c1c1f] border-[#2e2e33] text-white placeholder-zinc-500' : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400'
                }`}
                autoFocus
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Mobile Area Selector Row */}
            <div className={`mt-2 flex items-center justify-between text-xs border p-2 rounded-xl ${
              isDark ? 'bg-[#1c1c1f] border-[#2e2e33]' : 'bg-zinc-100 border-zinc-200'
            }`}>
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#e4002b] shrink-0" />
                <span className="text-zinc-400">Area:</span>
                <span className={`font-medium truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{selectedArea.name}</span>
              </div>
              <button
                onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                className="text-[#e4002b] font-bold text-[11px] shrink-0 ml-2 cursor-pointer"
              >
                Change
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

