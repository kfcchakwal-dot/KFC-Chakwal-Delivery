import React, { useState } from 'react';
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
import { CustomizerModal } from './components/CustomizerModal';
import { AdminBar } from './components/AdminBar';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminOrdersModal } from './components/AdminOrdersModal';
import { FloatingCartBar } from './components/FloatingCartBar';
import { Footer } from './components/Footer';
import { PageSectionsRenderer } from './components/PageSectionsRenderer';
import { KFC_CATEGORIES } from './data/kfcMenu';
import { CategoryId } from './types';
import { SearchX, Percent, Bike, Sparkles, Clock } from 'lucide-react';

const MainShop: React.FC = () => {
  const {
    menuItems,
    searchQuery,
    setSearchQuery,
    settings,
    setIsCustomizerOpen,
    isAdmin,
    currentView,
    activeCategory,
    setActiveCategory,
    themeMode,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const isDark = themeMode === 'dark';

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
      className={`min-h-screen flex flex-col transition-colors ${
        isDark ? 'bg-[#0e0e11] text-[#f4f4f5]' : 'bg-[#f8f9fa] text-[#1a1a1f]'
      }`}
    >
      {/* Admin Quick Control Bar (Only visible when logged into Admin) */}
      <AdminBar />

      {/* Persistent KFC Top Header */}
      <Header />

      {/* VIEW ROUTING: PRODUCT PAGE */}
      {currentView === 'product' && <ProductPage />}

      {/* VIEW ROUTING: WISHLIST PAGE */}
      {currentView === 'wishlist' && <WishlistPage />}

      {/* VIEW ROUTING: HOME & CATEGORY COLLECTIONS */}
      {(currentView === 'home' || currentView === 'collection') && (
        <>
          <HeroBanner />

          {/* Dynamic Page Sections - e.g. Image with Text placeholders placed by Admin */}
          <PageSectionsRenderer page="home" />

          {/* Main Menu Section */}
          <section id="kfc-menu-section" className="flex-1 pb-16">
            <CategoryNav
              selectedCategoryId={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                if (catId !== 'all') setActiveCategory(catId);
              }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              
              {/* Customizable Delivery Announcement Section */}
              {(settings.deliverySection?.enabled ?? true) && (
                <div className={`mb-8 border p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  isDark ? 'bg-[#18181d] border-[#2b2b35]' : 'bg-white border-zinc-200 shadow-sm'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#e4002b]/15 text-[#e4002b] flex items-center justify-center shrink-0">
                      {isAdmin ? <Percent className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
                    </div>
                    <div>
                      {isAdmin ? (
                        <>
                          <p className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            Admin Portal: <span className="text-[#e4002b]">+{settings.markupPercentage}% Markup Active</span> · Delivery <span className="font-bold">Rs. {settings.deliveryFee}</span>
                          </p>
                          <p className="text-zinc-500 text-[11px]">
                            {settings.deliverySection?.headline || 'KFC Chakwal Delivery Active'} · ETA: {settings.deliverySection?.estimatedTime || '30-40 Mins'}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {settings.deliverySection?.badgeText || '⚡ KFC Chakwal Express Delivery'} · <span className="text-[#e4002b] font-black">{settings.deliverySection?.deliveryFeeText || `Rs. ${settings.deliveryFee}`}</span>
                          </p>
                          <p className="text-zinc-500 text-[11px]">
                            {settings.deliverySection?.description || 'Hot, crispy & piping fresh meals delivered straight to your doorstep across Chakwal.'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setIsCustomizerOpen(true)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors ${
                        isDark ? 'bg-[#23232b] hover:bg-[#2c2c36] text-zinc-300 hover:text-white border-[#373744]' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Customize Store</span>
                    </button>
                  )}
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
                <div className={`py-20 text-center space-y-4 border rounded-3xl p-8 max-w-md mx-auto ${
                  isDark ? 'bg-[#141417] border-[#24242b]' : 'bg-white border-zinc-200'
                }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                    isDark ? 'bg-[#1f1f26] text-zinc-500' : 'bg-zinc-100 text-zinc-400'
                  }`}>
                    <SearchX className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-kfc text-2xl font-black uppercase ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      No Menu Items Found
                    </h3>
                    <p className="text-zinc-500 text-xs">
                      We couldn't find any items matching "{searchQuery}". Try searching for Zingers, Krunch, or Wings.
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
                  {/* If "All Items" is selected AND no search query is active, render category by category */}
                  {selectedCategory === 'all' && !searchQuery ? (
                    <div className="space-y-12">
                      {KFC_CATEGORIES.map((category) => {
                        const categoryItems = searchedItems.filter(
                          (item) => item.categoryId === category.id
                        );
                        if (categoryItems.length === 0) return null;

                        return (
                          <div key={category.id} className="space-y-4">
                            {/* Category Section Header */}
                            <div className={`border-b pb-3 flex items-end justify-between ${
                              isDark ? 'border-[#25252c]' : 'border-zinc-200'
                            }`}>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#e4002b]">
                                  KFC Pakistan Collection
                                </span>
                                <h2 
                                  style={{ fontFamily: settings.headingFont || 'Barlow Condensed' }}
                                  className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${
                                    isDark ? 'text-white' : 'text-zinc-900'
                                  }`}
                                >
                                  {category.name}
                                </h2>
                                <p className="text-zinc-500 text-xs mt-0.5">
                                  {category.subtitle}
                                </p>
                              </div>

                              <span className="text-xs text-zinc-400 font-bold tabular-nums">
                                {categoryItems.length} items
                              </span>
                            </div>

                            {/* Responsive Items Grid: 2 items per row on mobile as requested! */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                              {categoryItems.map((item) => (
                                <MenuItemCard key={item.id} item={item} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Specific Category or Search Filtered View */
                    <div className="space-y-6">
                      {selectedCategory !== 'all' && (
                        <div className={`border-b pb-3 ${isDark ? 'border-[#25252c]' : 'border-zinc-200'}`}>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#e4002b]">
                            Category Collection
                          </span>
                          <h2 
                            style={{ fontFamily: settings.headingFont || 'Barlow Condensed' }}
                            className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${
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

                      {/* Responsive Items Grid: 2 items per row on mobile as requested! */}
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
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

      <Footer />

      {/* Floating Modals and Drawers */}
      <ProductPage />
      <ItemCustomizeModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />
      <CustomizerModal />
      <AdminOrdersModal />
      <AdminLoginModal />
      <CustomerAuthModal />
      <FloatingCartBar />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainShop />
    </StoreProvider>
  );
}
