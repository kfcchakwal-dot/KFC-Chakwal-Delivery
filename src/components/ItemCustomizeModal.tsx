import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { MenuItem, MenuItemAddon } from '../types';
import { X, Plus, Minus, Flame, Check, Sparkles } from 'lucide-react';

export const ItemCustomizeModal: React.FC = () => {
  const {
    selectedItemForCustomization,
    setSelectedItemForCustomization,
    addToCart,
    getItemEffectivePrice,
    formatPKR,
    settings,
    themeMode,
  } = useStore();

  const isDark = themeMode === 'dark';
  const item = selectedItemForCustomization;

  const [quantity, setQuantity] = useState(1);
  const [drink, setDrink] = useState<string>('Pepsi Can (345ml)');
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Reset states when item changes
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setDrink('Pepsi Can (345ml)');
      setSelectedAddons([]);
      setSpecialInstructions('');
    }
  }, [item]);

  if (!item) return null;

  const baseEffectivePrice = getItemEffectivePrice(item);
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = baseEffectivePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addon: MenuItemAddon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons((prev) => prev.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons((prev) => [...prev, addon]);
    }
  };

  const handleConfirmAddToCart = () => {
    addToCart(
      item,
      {
        drink: item.customizableOptions?.allowDrinkChoice ? drink : undefined,
        addons: selectedAddons,
        specialInstructions: specialInstructions.trim() || undefined,
      },
      quantity
    );
    setSelectedItemForCustomization(null);
  };

  const drinksList = [
    { name: 'Pepsi Can (345ml)', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=120&q=80' },
    { name: '7Up Can (345ml)', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=120&q=80' },
    { name: 'Mirinda Can (345ml)', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=120&q=80' },
    { name: 'Mountain Dew Can (345ml)', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=120&q=80' },
    { name: 'Diet Pepsi Can (345ml)', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=120&q=80' },
    { name: 'Aquafina Mineral Water', image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=120&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
        isDark ? 'bg-[#18181c] border-[#2e2e36] text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Modal Header with Food Picture */}
        <div className="relative h-48 sm:h-56 bg-zinc-900 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-contain object-center bg-zinc-50 p-2"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white font-bold text-sm">
              {item.name}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={() => setSelectedItemForCustomization(null)}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-2 rounded-full cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Price Header */}
          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#e4002b] bg-black/70 px-2 py-0.5 rounded">
              KFC Chakwal Delivery · (+{settings.markupPercentage}% Markup Applied)
            </span>
            <h2 className="font-kfc text-2xl sm:text-3xl font-black text-white uppercase mt-1 leading-tight drop-shadow-md">
              {item.name}
            </h2>
            <p className="text-zinc-200 text-xs line-clamp-1 drop-shadow">{item.description}</p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          


          {/* Drink Selection with Thumbnails (if allowed) */}
          {item.customizableOptions?.allowDrinkChoice && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  Select Chilled Beverage (Included)
                </label>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">
                  Included Free
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {drinksList.map((d) => {
                  const isSelected = drink === d.name;
                  return (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => setDrink(d.name)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? "border-[#e4002b] bg-red-50 text-zinc-950 font-bold shadow-xs"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300"
                      }`}
                    >
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0 border border-zinc-200 shadow-2xs"
                      />
                      <div className="truncate flex-1 min-w-0">
                        <span className="truncate block font-bold text-xs">{d.name}</span>
                        <span className="text-[10px] text-zinc-500 font-medium">Chilled Can (345ml)</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#e4002b] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons List */}
          {item.customizableOptions?.availableAddons && item.customizableOptions.availableAddons.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Customize & Upgrade</span>
                </label>
                <span className="text-[10px] text-zinc-400 uppercase">Optional</span>
              </div>

              <div className="space-y-2">
                {item.customizableOptions.availableAddons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon)}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                        isChecked
                          ? isDark 
                            ? 'border-[#e4002b] bg-[#e4002b]/15 text-white' 
                            : 'border-[#e4002b] bg-red-50 text-zinc-900 font-bold'
                          : isDark ? 'border-[#2e2e36] bg-[#1c1c20] text-zinc-300 hover:border-zinc-700' : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                            isChecked
                              ? 'bg-[#e4002b] border-[#e4002b]'
                              : isDark ? 'border-zinc-600 bg-transparent' : 'border-zinc-400 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {addon.image && (
                          <img
                            src={addon.image}
                            alt={addon.name}
                            className="w-10 h-10 rounded-lg object-cover border border-zinc-700/40 shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                        <span className="text-xs font-semibold">{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#e4002b] tabular-nums">
                        +{formatPKR(addon.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special instructions */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Special Kitchen Instructions
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra mayo, make it extra crispy, cutlery needed..."
              className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b] border ${
                isDark ? 'bg-[#1c1c20] border-[#2e2e36] text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
              }`}
            />
          </div>
        </div>

        {/* Modal Sticky Footer with Quantity & Add Button */}
        <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-4 ${
          isDark ? 'bg-[#141417] border-[#2a2a32]' : 'bg-zinc-50 border-zinc-200'
        }`}>
          
          {/* Quantity Stepper */}
          <div className={`flex items-center rounded-xl p-1 border ${
            isDark ? 'bg-[#1c1c20] border-[#2e2e36]' : 'bg-white border-zinc-300'
          }`}>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition ${
                isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className={`w-8 text-center text-sm font-extrabold tabular-nums ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer active:scale-90 transition ${
                isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to bucket button */}
          <button
            type="button"
            onClick={handleConfirmAddToCart}
            className="buy-button flex-1 min-h-[48px] bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-lg sm:text-xl py-3 px-4 rounded-xl font-bold flex items-center justify-between shadow-xl shadow-red-950/40 cursor-pointer transition-all active:scale-[0.98]"
            aria-label="Confirm and add to bucket"
          >
            <span>ADD TO BUCKET</span>
            <span className="font-sans text-sm font-extrabold tabular-nums">
              {formatPKR(totalPrice)}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
