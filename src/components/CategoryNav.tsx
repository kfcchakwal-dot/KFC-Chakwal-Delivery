import React, { useEffect, useMemo, useState } from 'react';
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
  const { menuItems, themeMode, settings } = useStore();
  const isDark = themeMode === 'dark';
  const [scrollingUp, setScrollingUp] = useState(true);
  const stickyOnScrollUp = settings.collectionNavStickyOnScrollUp !== false;
  useEffect(() => {
    let previousY = window.scrollY;
    let lastUpdate = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const now = Date.now();
      if (now - lastUpdate > 40) {
        if (Math.abs(y - previousY) > 4) setScrollingUp(y < previousY);
        previousY = y;
        lastUpdate = now;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const categories = useMemo(() => {
    const knownIds = new Set(KFC_CATEGORIES.map((category) => category.id as string));
    const extraIds = Array.from(new Set(menuItems.map((item) => String(item.categoryId)).filter((id) => id && !knownIds.has(id))));
    const extras = extraIds.map((id) => ({ id: id as CategoryId, name: id.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()), subtitle: '' }));
    const all = [...KFC_CATEGORIES, ...extras];
    const order = settings.collectionNavOrder || [];
    const hidden = settings.collectionNavHidden || [];
    return all.filter((category) => !hidden.includes(category.id)).sort((a, b) => {
      const ai = order.indexOf(a.id); const bi = order.indexOf(b.id);
      if (ai < 0 && bi < 0) return 0;
      if (ai < 0) return 1;
      if (bi < 0) return -1;
      return ai - bi;
    });
  }, [menuItems, settings.collectionNavOrder, settings.collectionNavHidden]);

  const getCategoryCount = (id: CategoryId | 'all') => {
    if (id === 'all') return menuItems.length;
    return menuItems.filter((item) => item.categoryId === id).length;
  };

  return (
    <div className={`${stickyOnScrollUp ? 'sticky top-14 md:top-20 z-30 ' + (scrollingUp ? 'translate-y-0' : '-translate-y-[115%]') : 'relative'} backdrop-blur-md border-b shadow-sm py-2.5 transition-all duration-200 ${
      isDark ? 'bg-[#121215]/95 border-[#26262d]' : 'bg-white/95 border-zinc-200'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
          
          {/* "All Items" button */}
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`min-h-[40px] whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-150 cursor-pointer flex items-center gap-2 shrink-0 active:scale-95 ${selectedCategoryId === 'all' ? 'buy-button' : ''} ${
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
          {categories.map((cat) => {
            const count = getCategoryCount(cat.id);
            const isSelected = selectedCategoryId === cat.id;
            const isFeaturedShortcut = false;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`min-h-[40px] whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-150 cursor-pointer flex items-center gap-2 shrink-0 active:scale-95 ${(isSelected || isFeaturedShortcut) ? 'buy-button' : ''} ${
                  isSelected || isFeaturedShortcut
                    ? 'bg-[#e4002b] text-white shadow-md shadow-red-950/20'
                    : isDark 
                      ? 'bg-[#1c1c22] text-zinc-300 hover:text-white hover:bg-[#25252c] border border-[#2d2d35]'
                      : 'bg-zinc-100 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200 border border-zinc-300'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isSelected || isFeaturedShortcut
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
