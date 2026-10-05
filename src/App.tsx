import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { MenuItemCard } from './components/MenuItemCard';
import { ProductPage } from './components/ProductPage';
import { WishlistPage } from './components/WishlistPage';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { ItemCustomizeModal } from './components/ItemCustomizeModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { FloatingCartBar } from './components/FloatingCartBar';
import { Footer } from './components/Footer';
import { PageSectionsRenderer } from './components/PageSectionsRenderer';
import { InstallAppModal } from './components/InstallAppModal';
import { ShopifyAdminApp } from './components/admin/ShopifyAdminApp';
import { Preloader } from './components/Preloader';
import { DailyDealsSection } from './components/DailyDealsSection';
import { PoliciesModal } from './components/PoliciesModal';
import { DailyDealsPopupModal } from './components/DailyDealsPopupModal';
import { LoyaltyProgramModal } from './components/LoyaltyProgramModal';
import { VipClubModal } from './components/VipClubModal';
import { PointsEarnedNotification } from './components/PointsEarnedNotification';
import { KFC_CATEGORIES } from './data/kfcMenu';
import { CategoryId } from './types';
import { SearchX, Bike } from 'lucide-react';
import { OfflineNotice } from './components/OfflineNotice';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainShop: React.FC = () => {
  const {
    menuItems,
    searchQuery,
    setSearchQuery,
    settings,
    isAdmin,
    isSellerMode,
    currentView,
    activeCategory,
    setActiveCategory,
    themeMode,
    isCartOpen,
    setIsCartOpen,
    isCustomizerOpen,
    setIsCustomizerOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isCustomerAuthModalOpen,
    setIsCustomerAuthModalOpen,
    isAdminLoginModalOpen,
    setIsAdminLoginModalOpen,
    isPoliciesModalOpen,
    setIsPoliciesModalOpen,
    isLoyaltyModalOpen,
    setIsLoyaltyModalOpen,
    isVipModalOpen,
    setIsVipModalOpen,
    isDailyDealsPopupOpen,
    setIsDailyDealsPopupOpen,
    activeOrder,
    clearActiveOrder,
    goHome,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const isDark = themeMode === 'dark';

  // Android Back Gesture & System Back Button Handling: Close top-most modal/subview gracefully
  useEffect(() => {
    const isAnyModalOpen =
      isCartOpen ||
      isCustomizerOpen ||
      isCheckoutOpen ||
      isCustomerAuthModalOpen ||
      isAdminLoginModalOpen ||
      isPoliciesModalOpen ||
      isLoyaltyModalOpen ||
      isVipModalOpen ||
      isDailyDealsPopupOpen ||
      !!activeOrder ||
      currentView !== 'home';

    if (isAnyModalOpen) {
      window.history.pushState({ modalOpen: true }, '');
    }

    const handlePopState = () => {
      if (isDailyDealsPopupOpen) {
        setIsDailyDealsPopupOpen(false);
      } else if (isVipModalOpen) {
        setIsVipModalOpen(false);
      } else if (isLoyaltyModalOpen) {
        setIsLoyaltyModalOpen(false);
      } else if (isCheckoutOpen) {
        setIsCheckoutOpen(false);
      } else if (isCartOpen) {
        setIsCartOpen(false);
      } else if (isCustomizerOpen) {
        setIsCustomizerOpen(false);
      } else if (isCustomerAuthModalOpen) {
        setIsCustomerAuthModalOpen(false);
      } else if (isAdminLoginModalOpen) {
        setIsAdminLoginModalOpen(false);
      } else if (isPoliciesModalOpen) {
        setIsPoliciesModalOpen(false);
      } else if (activeOrder) {
        clearActiveOrder();
      } else if (currentView !== 'home') {
        goHome();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isCartOpen,
    isCustomizerOpen,
    isCheckoutOpen,
    isCustomerAuthModalOpen,
    isAdminLoginModalOpen,
    isPoliciesModalOpen,
    isLoyaltyModalOpen,
    isVipModalOpen,
    isDailyDealsPopupOpen,
    activeOrder,
    currentView,
    setIsCartOpen,
    setIsCustomizerOpen,
    setIsCheckoutOpen,
    setIsCustomerAuthModalOpen,
    setIsAdminLoginModalOpen,
    setIsPoliciesModalOpen,
    setIsLoyaltyModalOpen,
    setIsVipModalOpen,
    setIsDailyDealsPopupOpen,
    clearActiveOrder,
    goHome,
  ]);

  // If in Admin Mode or Seller Mode (?app=seller), render KCD Seller Portal
  if (isAdmin || isSellerMode) {
    return <ShopifyAdminApp />;
  }

  // Filter items based on search query
  const searchedItems = menuItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.categoryId.toLowerCase().includes(q)
    );
  });

  return (
    <div 
      style={{ fontFamily: settings.bodyFont || 'Plus Jakarta Sans' }}
      className={`min-h-screen flex flex-col transition-colors overflow-x-hidden ${
        isDark ? 'bg-[#0e0e11] text-[#f4f4f5]' : 'bg-[#f8f9fa] text-[#1a1a1f]'
      }`}
    >
      {/* Internet Connection Offline Detection & Status Bar */}
      <OfflineNotice />

      {/* Brand Animated Preloader */}
      <Preloader />

      {/* 100% Customer Facing Header (Mobile Optimized, Zero Overflow) */}
      <Header />

      {/* VIEW ROUTING: PRODUCT DETAIL PAGE */}
      {currentView === 'product' && <ProductPage />}

      {/* VIEW ROUTING: WISHLIST PAGE */}
      {currentView === 'wishlist' && <WishlistPage />}

      {/* VIEW ROUTING: HOME & CATEGORY COLLECTIONS */}
      {(currentView === 'home' || currentView === 'collection') && (
        <>
          <HeroBanner />

          {/* Daily 5 Random Meal Box Specials with Flat 4% OFF */}
          <DailyDealsSection />

          {/* Dynamic Page Sections - e.g. Image with Text placeholders placed by Admin */}
          <PageSectionsRenderer page="home" />

          {/* Main Menu Section (pb-28 on mobile avoids FloatingCartBar overlap) */}
          <section id="kfc-menu-section" className="flex-1 pb-28 sm:pb-16">
            <CategoryNav
              selectedCategoryId={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                if (catId !== 'all') setActiveCategory(catId);
              }}
            />

            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">
              
              {/* Customizable Delivery Announcement Section */}
              {(settings.deliverySection?.enabled ?? true) && (
                <div className={`mb-6 sm:mb-8 border p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  isDark ? 'bg-[#18181d] border-[#2b2b35]' : 'bg-white border-zinc-200 shadow-sm'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#e4002b]/15 text-[#e4002b] flex items-center justify-center shrink-0">
                      <Bike className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {settings.deliverySection?.badgeText || '⚡ KFC Chakwal Express Delivery'} · <span className="text-[#e4002b] font-black">{settings.deliverySection?.deliveryFeeText || `Rs. ${settings.deliveryFee}`}</span>
                      </p>
                      <p className="text-zinc-500 text-[11px] mt-0.5">
                        {settings.deliverySection?.description || 'Hot, crispy & piping fresh meals delivered straight to your doorstep across Chakwal.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Active Filter Notice */}
              {searchQuery && (
                <div className={`mb-6 flex items-center justify-between border p-3 rounded-xl ${
                  isDark ? 'bg-[#19191e] border-[#2c2c36]' : 'bg-white border-zinc-200'
                }`}>
                  <p className={`text-xs ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    Showing results for "<strong className={isDark ? 'text-white' : 'text-zinc-900'}>{searchQuery}</strong>" ({searchedItems.length} items found)
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-[#e4002b] font-bold hover:underline cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {/* If No Items match search */}
              {searchedItems.length === 0 ? (
                <div className={`py-16 text-center space-y-4 border rounded-3xl p-6 sm:p-8 max-w-md mx-auto ${
                  isDark ? 'bg-[#141417] border-[#24242b]' : 'bg-white border-zinc-200'
                }`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                    isDark ? 'bg-[#1f1f26] text-zinc-500' : 'bg-zinc-100 text-zinc-400'
                  }`}>
                    <SearchX className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-kfc text-2xl font-black uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      No Menu Items Found
                    </h3>
                    <p className="text-zinc-500 text-xs">
                      We couldn't find any items matching "{searchQuery}".
                    </p>
                  </div>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    View Full Menu
                  </button>
                </div>
              ) : (
                <>
                  {/* Category by Category View (2 items per row on mobile) */}
                  {selectedCategory === 'all' && !searchQuery ? (
                    <div className="space-y-10 sm:space-y-12">
                      {KFC_CATEGORIES.map((category) => {
                        const categoryItems = searchedItems.filter(
                          (item) => item.categoryId === category.id
                        );
                        if (categoryItems.length === 0) return null;

                        return (
                          <div key={category.id} className="space-y-3.5 sm:space-y-4">
                            {/* Category Header */}
                            <div className={`border-b pb-2.5 flex items-end justify-between ${
                              isDark ? 'border-[#25252c]' : 'border-zinc-200'
                            }`}>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#e4002b]">
                                  KFC Pakistan Collection
                                </span>
                                <h2 
                                  style={{ fontFamily: settings.headingFont || 'Barlow Condensed' }}
                                  className={`text-xl sm:text-3xl font-black uppercase tracking-tight ${
                                    isDark ? 'text-white' : 'text-zinc-900'
                                  }`}
                                >
                                  {category.name}
                                </h2>
                                <p className="text-zinc-500 text-[11px] sm:text-xs mt-0.5">
                                  {category.subtitle}
                                </p>
                              </div>

                              <span className="text-xs text-zinc-400 font-bold tabular-nums">
                                {categoryItems.length} items
                              </span>
                            </div>

                            {/* Responsive Grid: strictly 2 products per row on mobile! */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                              {categoryItems.map((item) => (
                                <MenuItemCard key={item.id} item={item} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Specific Category View (2 items per row on mobile) */
                    <div className="space-y-6">
                      {selectedCategory !== 'all' && (
                        <div className={`border-b pb-3 ${isDark ? 'border-[#25252c]' : 'border-zinc-200'}`}>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#e4002b]">
                            Category Collection
                          </span>
                          <h2 
                            style={{ fontFamily: settings.headingFont || 'Barlow Condensed' }}
                            className={`text-xl sm:text-3xl font-black uppercase tracking-tight ${
                              isDark ? 'text-white' : 'text-zinc-900'
                            }`}
                          >
                            {KFC_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                          </h2>
                          <p className="text-zinc-500 text-xs mt-0.5">
                            {KFC_CATEGORIES.find((c) => c.id === selectedCategory)?.subtitle}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                        {searchedItems
                          .filter((item) =>
                            selectedCategory === 'all' ? true : item.categoryId === selectedCategory
                          )
                          .map((item) => (
                            <MenuItemCard key={item.id} item={item} />
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </section>

          {/* Collection / Bottom Page Sections */}
          <PageSectionsRenderer page="collection" />
        </>
      )}

      {/* 100% Customer Facing Footer */}
      <Footer />

      {/* Floating Modals and Drawers */}
      <ItemCustomizeModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />
      <AdminLoginModal />
      <CustomerAuthModal />
      <PoliciesModal />
      <FloatingCartBar />
      <InstallAppModal />
      <DailyDealsPopupModal />
      <LoyaltyProgramModal />
      <VipClubModal />
      <PointsEarnedNotification />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <MainShop />
      </StoreProvider>
    </ErrorBoundary>
  );
}
