import React from 'react';
import { useStore } from '../context/StoreContext';
import { KFC_CATEGORIES } from '../data/kfcMenu';
import { CategoryId } from '../types';
import { Sparkles, UtensilsCrossed } from 'lucide-react';

interface CategoryNavProps {
  selectedCategoryId: CategoryId | 'all';
  onSelectCategory: (id: CategoryId | 'all') => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { menuItems } = useStore();

  const getCategoryCount = (id: CategoryId | 'all') => {
    if (id === 'all') return menuItems.length;
    return menuItems.filter((item) => item.categoryId === id).length;
  };

  return (
    <div className="sticky top-20 z-30 bg-[#141417]/95 backdrop-blur-md border-b border-[#26262c] shadow-md py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
          
          {/* "All Items" button */}
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedCategoryId === 'all'
                ? 'bg-[#e4002b] text-white shadow-md shadow-red-950/40'
                : 'bg-[#1c1c20] text-zinc-300 hover:text-white hover:bg-[#25252b] border border-[#2d2d35]'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>All Items</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategoryId === 'all' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
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
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#e4002b] text-white shadow-md shadow-red-950/40'
                    : 'bg-[#1c1c20] text-zinc-300 hover:text-white hover:bg-[#25252b] border border-[#2d2d35]'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
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
