import React from 'react';
import { useStore } from '../context/StoreContext';
import { KFC_CATEGORIES } from '../data/kfcMenu';
import { CategoryId } from '../types';
import { UtensilsCrossed } from 'lucide-react';

interface CategoryNavProps {
  selectedCategoryId: CategoryId | 'all';
  onSelectCategory: (id: CategoryId | 'all') => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { menuItems, themeMode } = useStore();
  const isDark = themeMode === 'dark';

  const getCategoryCount = (id: CategoryId | 'all') => {
    if (id === 'all') return menuItems.length;
    return menuItems.filter((item) => item.categoryId === id).length;
  };

  return (
    <div className={`sticky top-14 md:top-20 z-30 backdrop-blur-md border-b shadow-sm py-2.5 transition-colors ${
      isDark ? 'bg-[#121215]/95 border-[#26262d]' : 'bg-white/95 border-zinc-200'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
          
          {/* "All Items" button */}
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`min-h-[40px] whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-150 cursor-pointer flex items-center gap-2 shrink-0 active:scale-95 ${
              selectedCategoryId === 'all'
                ? 'bg-[#e4002b] text-white shadow-md shadow-red-950/40'
                : isDark 
                  ? 'bg-[#1c1c22] text-zinc-300 hover:text-white hover:bg-[#25252c] border border-[#2d2d35]'
                  : 'bg-zinc-100 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200 border border-zinc-300'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>All Items</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              selectedCategoryId === 'all' 
                ? 'bg-white/20 text-white' 
                : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600'
            }`}>
              {getCategoryCount('all')}
            </span>
          </button>

          {/* Each KFC Category */}
          {KFC_CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat.id);
            const isSelected = selectedCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`min-h-[40px] whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-150 cursor-pointer flex items-center gap-2 shrink-0 active:scale-95 ${
                  isSelected
                    ? 'bg-[#e4002b] text-white shadow-md shadow-red-950/40'
                    : isDark 
                      ? 'bg-[#1c1c22] text-zinc-300 hover:text-white hover:bg-[#25252c] border border-[#2d2d35]'
                      : 'bg-zinc-100 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200 border border-zinc-300'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isSelected 
                    ? 'bg-white/20 text-white' 
                    : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
