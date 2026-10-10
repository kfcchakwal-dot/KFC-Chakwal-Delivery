import React from 'react';
import { useStore } from '../context/StoreContext';
import { MenuItemCard } from './MenuItemCard';
import { Heart, ArrowLeft, ShoppingBag, UtensilsCrossed } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, menuItems, goHome, themeMode } = useStore();

  const favoriteItems = menuItems.filter((item) => wishlist.includes(item.id) && item.status !== 'draft');
  const isDark = themeMode === 'dark';

  return (
    <div className={`min-h-screen pb-20 ${isDark ? 'bg-[#0e0e11] text-[#f4f4f5]' : 'bg-[#f8f9fa] text-[#1a1a1f]'}`}>
      
      {/* Top Breadcrumb */}
      <div className={`border-b ${isDark ? 'bg-[#141417] border-[#26262d]' : 'bg-white border-zinc-200'} py-3 px-4 sm:px-8`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
          <button
            onClick={goHome}
            className="flex items-center gap-2 text-zinc-400 hover:text-[#e4002b] font-bold uppercase transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </button>
          <span className="font-bold text-[#e4002b]">My Saved Items</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <div className="border-b pb-4 mb-8 border-zinc-700/30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#e4002b] text-white flex items-center justify-center">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <h1 className="font-kfc text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none">
                My Saved Wishlist
              </h1>
            </div>
            <p className="text-zinc-400 text-xs mt-1">
              Your favorite KFC meals saved for fast ordering across Chakwal
            </p>
          </div>
          <span className="text-xs font-bold text-zinc-400 tabular-nums">
            {favoriteItems.length} {favoriteItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Items Grid or Empty State */}
        {favoriteItems.length === 0 ? (
          <div className={`py-20 text-center space-y-4 rounded-3xl border p-8 max-w-md mx-auto ${
            isDark ? 'bg-[#141417] border-[#26262e]' : 'bg-white border-zinc-200'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              isDark ? 'bg-[#1f1f26] text-zinc-500' : 'bg-zinc-100 text-zinc-400'
            }`}>
              <Heart className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-kfc text-2xl font-black uppercase">
                Your Wishlist is Empty
              </h3>
              <p className="text-zinc-400 text-xs">
                Click the heart icon on any Zinger, Krunch burger, or bucket to save it here for fast ordering.
              </p>
            </div>
            <button
              onClick={goHome}
              className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold uppercase px-6 py-3 rounded-xl cursor-pointer shadow-lg"
            >
              Explore Full Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {favoriteItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
