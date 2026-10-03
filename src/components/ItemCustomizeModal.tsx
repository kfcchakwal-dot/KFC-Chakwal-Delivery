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
  const [spiceLevel, setSpiceLevel] = useState<'Hot & Crispy' | 'Original Recipe'>('Hot & Crispy');
  const [drink, setDrink] = useState<string>('Pepsi Can (345ml)');
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Reset states when item changes
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSpiceLevel(item.isSpicy ? 'Hot & Crispy' : 'Original Recipe');
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
        spiceLevel: item.customizableOptions?.allowSpiceLevel ? spiceLevel : undefined,
        drink: item.customizableOptions?.allowDrinkChoice ? drink : undefined,
        addons: selectedAddons,
        specialInstructions: specialInstructions.trim() || undefined,
      },
      quantity
    );
    setSelectedItemForCustomization(null);
  };

  const drinksList = [
    'Pepsi Can (345ml)',
    '7Up Can (345ml)',
    'Mirinda Can (345ml)',
    'Mountain Dew Can (345ml)',
    'Diet Pepsi Can (345ml)',
    'Aquafina Mineral Water',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#18181c] border border-[#2e2e36] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header with Food Picture */}
        <div className="relative h-48 sm:h-56 bg-[#111113] overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#18181c] via-[#18181c]/40 to-transparent" />
          
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#e4002b] bg-black/60 px-2 py-0.5 rounded">
              KFC Chakwal Delivery (+{settings.markupPercentage}% Markup Applied)
            </span>
            <h2 className="font-kfc text-2xl sm:text-3xl font-black text-white uppercase mt-1 leading-tight">
              {item.name}
            </h2>
            <p className="text-zinc-300 text-xs line-clamp-1">{item.description}</p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          
          {/* Spice Level Selection (if allowed) */}
          {item.customizableOptions?.allowSpiceLevel && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#e4002b]" />
                  <span>Choose Flavor / Coating</span>
                </label>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Required</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSpiceLevel('Hot & Crispy')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    spiceLevel === 'Hot & Crispy'
                      ? 'border-[#e4002b] bg-[#e4002b]/10 text-white'
                      : 'border-[#2e2e36] bg-[#1c1c20] text-zinc-400 hover:text-white'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      Hot & Crispy (Spicy)
                    </p>
                    <p className="text-[10px] text-zinc-400">Signature spicy blend</p>
                  </div>
                  {spiceLevel === 'Hot & Crispy' && (
                    <div className="w-5 h-5 bg-[#e4002b] rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSpiceLevel('Original Recipe')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    spiceLevel === 'Original Recipe'
                      ? 'border-[#e4002b] bg-[#e4002b]/10 text-white'
                      : 'border-[#2e2e36] bg-[#1c1c20] text-zinc-400 hover:text-white'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">Original Recipe (Mild)</p>
                    <p className="text-[10px] text-zinc-400">Classic 11 herbs & spices</p>
                  </div>
                  {spiceLevel === 'Original Recipe' && (
                    <div className="w-5 h-5 bg-[#e4002b] rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Drink Selection (if allowed) */}
          {item.customizableOptions?.allowDrinkChoice && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Select Chilled Beverage
                </label>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Included</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {drinksList.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDrink(d)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                      drink === d
                        ? 'border-[#e4002b] bg-[#e4002b]/10 text-white font-bold'
                        : 'border-[#2e2e36] bg-[#1c1c20] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="truncate">{d}</span>
                    {drink === d && <Check className="w-3.5 h-3.5 text-[#e4002b] shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons List */}
          {item.customizableOptions?.availableAddons && item.customizableOptions.availableAddons.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Customize & Upgrade</span>
                </label>
                <span className="text-[10px] text-zinc-500 uppercase">Optional</span>
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
                          ? 'border-[#e4002b] bg-[#e4002b]/10 text-white'
                          : 'border-[#2e2e36] bg-[#1c1c20] text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                            isChecked
                              ? 'bg-[#e4002b] border-[#e4002b]'
                              : 'border-zinc-600 bg-transparent'
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
                      <span className="text-xs font-bold text-red-400 tabular-nums">
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
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Special Kitchen Instructions
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra mayo, make it extra crispy, cutlery needed..."
              className="w-full bg-[#1c1c20] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2.5 placeholder-zinc-500 focus:outline-none focus:border-[#e4002b]"
            />
          </div>
        </div>

        {/* Modal Sticky Footer with Quantity & Add Button */}
        <div className="p-4 sm:p-5 bg-[#141417] border-t border-[#2a2a32] flex items-center justify-between gap-4">
          
          {/* Quantity Stepper */}
          <div className="flex items-center bg-[#1c1c20] border border-[#2e2e36] rounded-xl p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-extrabold text-white tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2 text-zinc-400 hover:text-white cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to bucket button */}
          <button
            type="button"
            onClick={handleConfirmAddToCart}
            className="flex-1 bg-[#e4002b] hover:bg-[#c30025] text-white font-kfc uppercase text-lg sm:text-xl py-3 px-4 rounded-xl font-bold flex items-center justify-between shadow-xl shadow-red-950/40 cursor-pointer transition-all active:scale-[0.98]"
          >
            <span>ADD TO BUCKET</span>
            <span className="font-sans text-sm font-extrabold tabular-nums bg-black/25 px-2.5 py-1 rounded-lg">
              {formatPKR(totalPrice)}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
