import React, { lazy, Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { AnnouncementBars } from './components/AnnouncementBars';
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
const ShopifyAdminApp = lazy(() => import('./components/admin/ShopifyAdminApp').then((module) => ({ default: module.ShopifyAdminApp })));
import { Preloader } from './components/Preloader';
import { DailyDealsSection } from './components/DailyDealsSection';
import { LoyaltyPointsBanner } from './components/LoyaltyPointsBanner';
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
    viewProduct,
  } = useStore();

  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const allowExitRef = useRef(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [navSelectedCategory, setNavSelectedCategory] = useState<CategoryId | 'all'>('all');
  const initialProductHandled = useRef(false);
  const isDark = themeMode === 'dark';
  const storefrontCategories = useMemo(() => {
    const knownIds = new Set(KFC_CATEGORIES.map((category) => String(category.id)));
    const extraIds = Array.from(new Set(menuItems.filter((item) => item.status !== 'draft').map((item) => String(item.categoryId)).filter((id) => id && !knownIds.has(id))));
    return [...KFC_CATEGORIES, ...extraIds.map((id) => ({ id: id as CategoryId, name: id.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()), subtitle: '' }))];
  }, [menuItems]);
  const sectionColorCss = Object.entries(settings.sectionColorSchemes || {}).map(([key, scheme]) => {
    const selectors: Record<string, string> = {
      header: 'header',
      announcement: '[data-color-section="announcement"]',
      hero: '[data-color-section="hero"]',
      menu: '#kfc-menu-section',
      product: '[data-color-section="product"]',
      cart: '[data-color-section="cart"]',
      vip: '[data-color-section="vip"]',
      footer: '[data-color-section="footer"]',
    };
    const selector = selectors[key];
    if (!selector || !scheme) return '';
    return selector + ' { background-color: ' + scheme.background + ' !important; color: ' + scheme.text + ' !important; border-color: ' + scheme.border + ' !important; }\\n' +
      selector + ' button[class*="bg-[#e4002b]"], ' + selector + ' .section-color-button { background-color: ' + scheme.button + ' !important; color: ' + scheme.buttonText + ' !important; }\\n' +
      selector + ' button, ' + selector + ' a { border-color: ' + scheme.border + ' !important; }';
  }).join('\n');

  // Open a product directly when a shared product link is opened.
  useEffect(() => {
    if (initialProductHandled.current) return;
    const productId = new URLSearchParams(window.location.search).get('product');
    if (!productId) {
      initialProductHandled.current = true;
      return;
    }
    if (menuItems.length === 0) return;
    const sharedProduct = menuItems.find((item) => item.id === productId);
    if (sharedProduct) {
      if (sharedProduct.status === 'draft') {
        initialProductHandled.current = true;
        return;
      }
      viewProduct(sharedProduct);
      initialProductHandled.current = true;
    }
  }, [menuItems, viewProduct]);

  // Keep the sticky collection bar in sync with the category currently visible while browsing all products.
  useEffect(() => {
    if (currentView !== 'home' && currentView !== 'collection') return;
    if (selectedCategory !== 'all' || searchQuery) return;
    const visibleCategories = storefrontCategories.filter((category) => !(settings.collectionNavHidden || []).includes(category.id));
    const nodes = visibleCategories
      .map((category) => document.getElementById(`category-section-${category.id}`))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const categoryId = (visible.target as HTMLElement).dataset.categoryId as CategoryId | undefined;
      if (categoryId) {
        setNavSelectedCategory(categoryId);
        setActiveCategory(categoryId);
      }
    }, { root: null, rootMargin: '-125px 0px -58% 0px', threshold: [0.05, 0.2, 0.4] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [currentView, selectedCategory, searchQuery, storefrontCategories, settings.collectionNavHidden, menuItems, setActiveCategory]);

  // Keep one history entry inside the app so the first Back action can be handled gracefully.
  useEffect(() => {
    window.history.pushState({ kfcExitGuard: true }, '');
  }, []);

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
      if (allowExitRef.current) return;
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
      } else {
        setIsExitConfirmOpen(true);
        window.history.pushState({ kfcExitGuard: true }, '');
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
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">Loading admin panel…</div>}>
        <ShopifyAdminApp />
      </Suspense>
    );
  }

  // Filter items based on search query (Draft products are strictly hidden from customers)
  const searchedItems = menuItems.filter((item) => {
    if (item.status === 'draft') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      String(item.description || '').toLowerCase().includes(q) ||
      item.categoryId.toLowerCase().includes(q)
    );
  });

  return (
    <div
      data-store-theme={isDark ? 'dark' : 'light'}
      style={{
        fontFamily: settings.bodyFont || 'Plus Jakarta Sans',
        backgroundColor: isDark ? '#0e0e11' : (settings.storeBackgroundColor || '#f8f9fa'),
        color: isDark ? '#f4f4f5' : (settings.storeTextColor || '#1a1a1f'),
      }}
      className={`min-h-screen flex flex-col transition-colors overflow-x-hidden ${
        isDark ? 'bg-[#0e0e11] text-[#f4f4f5]' : 'bg-[#f8f9fa] text-[#1a1a1f]'
      }`}
    >
      <style>{sectionColorCss}</style>
      {/* Internet Connection Offline Detection & Status Bar */}
      <OfflineNotice />

      {/* Brand Animated Preloader */}
      <Preloader />

      {/* Admin-managed announcement bars sit above the sticky header. */}
      <div data-color-section="announcement"><AnnouncementBars /></div>

      {/* 100% Customer Facing Header (Mobile Optimized, Zero Overflow) */}
      <div data-color-section="header"><Header /></div>

      {/* VIEW ROUTING: PRODUCT DETAIL PAGE */}
      {currentView === 'product' && <div data-color-section="product"><ProductPage /></div>}

      {/* VIEW ROUTING: WISHLIST PAGE */}
      {currentView === 'wishlist' && <WishlistPage />}

      {/* VIEW ROUTING: HOME & CATEGORY COLLECTIONS */}
      {(currentView === 'home' || currentView === 'collection') && (
        <>
          <div data-color-section="hero"><HeroBanner /></div>

          {/* Loyalty Points Balance & Quick Redeem Callout Banner */}
          <LoyaltyPointsBanner />

          {/* Daily 5 Random Meal Box Specials with Flat 4% OFF */}
          <DailyDealsSection />

          {/* Dynamic Page Sections - e.g. Image with Text placeholders placed by Admin */}
          <PageSectionsRenderer page="home" />

          {/* Main Menu Section (pb-28 on mobile avoids FloatingCartBar overlap) */}
          <section id="kfc-menu-section" className="flex-1 pb-28 sm:pb-16">
            <CategoryNav
              selectedCategoryId={navSelectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory('all');
                setNavSelectedCategory(catId);
                if (catId !== 'all') {
                  setActiveCategory(catId);
                  window.setTimeout(() => document.getElementById(`category-section-${catId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                } else {
                  window.setTimeout(() => document.getElementById('kfc-menu-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                }
              }}
            />

            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">
              
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
                      {storefrontCategories.map((category) => {
                        const categoryItems = searchedItems.filter(
                          (item) => item.categoryId === category.id
                        );
                        if (categoryItems.length === 0) return null;

                        return (
                          <div id={`category-section-${category.id}`} data-category-id={category.id} key={category.id} className="space-y-3.5 sm:space-y-4 scroll-mt-32">
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
      <div data-color-section="footer"><Footer /></div>

      {/* Floating Modals and Drawers */}
      <ItemCustomizeModal />
      <div data-color-section="cart"><CartDrawer /></div>
      <div data-color-section="cart"><CheckoutModal /></div>
      <OrderConfirmationModal />
      <AdminLoginModal />
      {isExitConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-labelledby="exit-confirm-title">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-2xl">
            <h2 id="exit-confirm-title" className="text-lg font-black">Exit KFC Chakwal Delivery?</h2>
            <p className="mt-2 text-sm text-zinc-600">Kya aap app se exit karna chahte hain?</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setIsExitConfirmOpen(false)} className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-bold text-zinc-700">Nahi, yahin rahen</button>
              <button type="button" onClick={() => { allowExitRef.current = true; setIsExitConfirmOpen(false); window.close(); window.location.replace('about:blank'); }} className="rounded-xl bg-[#e4002b] px-4 py-3 text-sm font-black text-white">Haan, Exit</button>
            </div>
          </div>
        </div>
      )}
      <CustomerAuthModal />
      <PoliciesModal />
      <FloatingCartBar />
      <InstallAppModal />
      <DailyDealsPopupModal />
      <LoyaltyProgramModal />
      <div data-color-section="vip"><VipClubModal /></div>
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
