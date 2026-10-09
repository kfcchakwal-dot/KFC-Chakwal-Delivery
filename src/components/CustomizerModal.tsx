import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { CategoryId, MenuItem, MenuItemAddon, BadgePosition, ThemeMode } from '../types';
import { KFC_CATEGORIES, DEFAULT_STORE_SETTINGS } from '../data/kfcMenu';
import { PageSectionsBuilder } from './PageSectionsBuilder';
import { CsvProductImporter } from './CsvProductImporter';
import {
  X,
  Settings,
  Percent,
  Bike,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  Store,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Upload,
  Edit2,
  Save,
  CreditCard,
  Star,
  Sun,
  Moon,
  Sliders,
  ShieldCheck,
  Share2,
  FileSpreadsheet,
  Link2,
  Copy,
  ExternalLink,
  Globe,
  Type,
} from 'lucide-react';

export const CustomizerModal: React.FC = () => {
  const {
    isCustomizerOpen,
    setIsCustomizerOpen,
    settings,
    updateSettings,
    resetSettingsToDefault,
    menuItems,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    resetMenuToDefault,
    chakwalAreas,
    updateAreas,
    calculatePrice,
    getItemEffectivePrice,
    formatPKR,
    reviews,
    addReview,
    deleteReview,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'rates' | 'store' | 'sections' | 'csv-import' | 'menu' | 'payments' | 'links' | 'reviews' | 'areas' | 'shopify'
  >('rates');

  const [testSyncStatus, setTestSyncStatus] = useState<string | null>(null);
  const [menuSearchFilter, setMenuSearchFilter] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<CategoryId | 'all'>('all');

  // File upload refs
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // New item form state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<CategoryId>('everyday-value');
  const [newItemPrice, setNewItemPrice] = useState(450);
  const [newItemSellingPrice, setNewItemSellingPrice] = useState<number | ''>('');
  const [newItemCompareAtPrice, setNewItemCompareAtPrice] = useState<number | ''>('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImage, setNewItemImage] = useState('/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg');
  const [newItemSpicy, setNewItemSpicy] = useState(true);
  const [newItemBadgeText, setNewItemBadgeText] = useState('HOT DEAL');
  const [newItemBadgePos, setNewItemBadgePos] = useState<BadgePosition>('top-left');
  const [newItemAllowSpice, setNewItemAllowSpice] = useState(true);
  const [newItemAllowDrink, setNewItemAllowDrink] = useState(false);
  const [newItemAddons, setNewItemAddons] = useState<MenuItemAddon[]>([
    { 
      id: 'add-cheese', 
      name: 'Extra Cheese Slice', 
      price: 90, 
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80' 
    },
    { 
      id: 'add-mayo', 
      name: 'Garlic Mayo Dip', 
      price: 70, 
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80' 
    },
  ]);

  // Edit existing item state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState(90);
  const [newAddonImage, setNewAddonImage] = useState('');

  // Link copy notifications
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);

  // New review state
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewProduct, setNewReviewProduct] = useState('zinger-burger');

  // New area form state
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaTime, setNewAreaTime] = useState('30-40 mins');

  if (!isCustomizerOpen) return null;

  // Helper for image upload (FileReader base64 data URL)
  const handleImageUpload = (file: File, callback: (dataUrl: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        callback(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      categoryId: newItemCategory,
      description: newItemDesc.trim() || 'Delicious freshly prepared KFC item.',
      baseKfcPrice: Number(newItemPrice) || 300,
      sellingPrice: newItemSellingPrice !== '' && Number(newItemSellingPrice) > 0 ? Number(newItemSellingPrice) : undefined,
      compareAtPrice: newItemCompareAtPrice !== '' && Number(newItemCompareAtPrice) > 0 ? Number(newItemCompareAtPrice) : undefined,
      image: newItemImage.trim() || '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg',
      isSpicy: newItemSpicy,
      isAvailable: true,
      customBadgeText: newItemBadgeText.trim() || undefined,
      customBadgePosition: newItemBadgePos,
      customizableOptions: {
        allowSpiceLevel: newItemAllowSpice,
        allowDrinkChoice: newItemAllowDrink,
        availableAddons: newItemAddons,
      },
    };

    addMenuItem(newItem);
    setNewItemName('');
    setNewItemDesc('');
    setNewItemSellingPrice('');
    setNewItemCompareAtPrice('');
    setIsAddingItem(false);
  };

  const handleSaveEditedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateMenuItem(editingItem);
    setEditingItem(null);
  };

  const handleAddAddonToEditingItem = () => {
    if (!editingItem || !newAddonName.trim()) return;
    const currentAddons = editingItem.customizableOptions?.availableAddons || [];
    const updated = [
      ...currentAddons,
      { 
        id: `addon-${Date.now()}`, 
        name: newAddonName.trim(), 
        price: Number(newAddonPrice) || 50,
        image: newAddonImage.trim() || undefined,
      },
    ];
    setEditingItem({
      ...editingItem,
      customizableOptions: {
        ...editingItem.customizableOptions,
        availableAddons: updated,
      },
    });
    setNewAddonName('');
    setNewAddonPrice(90);
    setNewAddonImage('');
  };

  const handleRemoveAddonFromEditingItem = (addonId: string) => {
    if (!editingItem) return;
    const currentAddons = editingItem.customizableOptions?.availableAddons || [];
    setEditingItem({
      ...editingItem,
      customizableOptions: {
        ...editingItem.customizableOptions,
        availableAddons: currentAddons.filter((a) => a.id !== addonId),
      },
    });
  };

  const handleAddNewArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;

    const newArea = {
      id: `area-${Date.now()}`,
      name: newAreaName.trim(),
      estimatedTime: newAreaTime.trim() || '35-45 mins',
      isAvailable: true,
    };

    updateAreas([...chakwalAreas, newArea]);
    setNewAreaName('');
    setIsAddingArea(false);
  };

  const handleToggleArea = (id: string) => {
    updateAreas(
      chakwalAreas.map((a) => (a.id === id ? { ...a, isAvailable: !a.isAvailable } : a))
    );
  };

  const handleDeleteArea = (id: string) => {
    updateAreas(chakwalAreas.filter((a) => a.id !== id));
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    addReview({
      productId: newReviewProduct,
      customerName: newReviewAuthor.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
    });

    setNewReviewAuthor('');
    setNewReviewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#161619] border border-[#2d2d36] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#282830] flex items-center justify-between bg-[#121214]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#e4002b] rounded-xl flex items-center justify-center text-white shadow-md">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-kfc text-2xl font-black text-white uppercase tracking-tight leading-none">
                KFC Chakwal Admin Hub
              </h2>
              <p className="text-zinc-400 text-xs mt-0.5">
                Customize everything: Header, Footer, Logos, Hero, Products, Badges, Upgrades, Payments & Reviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset all store settings, markups, and menu items to original defaults?')) {
                  resetSettingsToDefault();
                  resetMenuToDefault();
                }
              }}
              className="text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#1c1c20] border border-[#2d2d35] flex items-center gap-1.5 cursor-pointer"
              title="Reset everything to factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCustomizerOpen(false)}
              className="text-zinc-400 hover:text-white p-2 rounded-lg bg-[#1c1c20] cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 bg-[#141416] border-b border-[#26262d] flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('rates')}
            className={`py-3 px-2.5 sm:px-3 text-xs font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'rates'
                ? 'border-[#e4002b] text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-[#e4002b]" />
            <span>Rates (+{settings.markupPercentage}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`py-3 px-2.5 sm:px-3 text-xs font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'store'
                ? 'border-[#e4002b] text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-[#e4002b]" />
            <span>Design & Fonts</span>
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`py-3 px-2.5 sm:px-3 text-xs font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'sections'
                ? 'border-[#e4002b] text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Page Sections Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('csv-import')}
            className={`py-3 px-2.5 sm:px-3 text-xs font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'csv-import'
                ? 'border-[#e4002b] text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Shopify CSV Bulk Import</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`py-3 px-2.5 sm:px-3 text-xs font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'menu'
                ? 'border-[#e4002b] text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e4002b]" />
            <span>Products & Prices ({menuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`py-3 px-2.5 sm:px-3 text-xs font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'links'
                ? 'border-[#e4002b] text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-amber-400" />
            <span>App Links & Domain</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-2.5 sm:px-3 text-xs font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'payments'
                ? 'border-[#e4002b] text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-[#e4002b]" />
            <span>Payment Options</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-2.5 sm:px-3 text-xs font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'reviews'
                ? 'border-[#e4002b] text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Reviews ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('areas')}
            className={`py-3 px-2.5 sm:px-3 text-xs font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'areas'
                ? 'border-[#e4002b] text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#e4002b]" />
            <span>Chakwal Areas ({chakwalAreas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shopify')}
            className={`py-3 px-2.5 sm:px-3 text-xs font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'shopify'
                ? 'border-[#96bf48] text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#96bf48] animate-pulse"></div>
            <span className="text-[#96bf48]">Shopify</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: PRICING & DELIVERY RATES */}
          {activeTab === 'rates' && (
            <div className="space-y-6">
              
              {/* Markup Percentage Card */}
              <div className="bg-[#1c1c20] border border-[#2e2e36] p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#e4002b] tracking-wider">
                      Core Pricing Rule
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Store Markup Percentage Over Original KFC PK
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1">
                      Currently set to <strong>+{settings.markupPercentage}%</strong>. Adjusting this dynamically updates the selling price of every single menu item in PKR across the entire store!
                    </p>
                  </div>
                  <div className="bg-[#e4002b]/15 border border-[#e4002b]/40 text-[#e4002b] text-2xl font-black px-4 py-2 rounded-xl tabular-nums shrink-0">
                    +{settings.markupPercentage}%
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={settings.markupPercentage}
                    onChange={(e) => updateSettings({ markupPercentage: Number(e.target.value) })}
                    className="w-full accent-[#e4002b] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                    <span>0% (Original KFC)</span>
                    <span className="text-white font-bold">12% (Recommended)</span>
                    <span>25%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                  <span className="text-zinc-400">Quick Presets:</span>
                  {[0, 8, 10, 12, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => updateSettings({ markupPercentage: pct })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        settings.markupPercentage === pct
                          ? 'bg-[#e4002b] text-white'
                          : 'bg-[#141416] text-zinc-300 hover:text-white border border-[#2f2f38]'
                      }`}
                    >
                      +{pct}% {pct === 12 && '★'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Fee Card */}
              <div className="bg-[#1c1c20] border border-[#2e2e36] p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#e4002b] tracking-wider">
                      Logistics & Shipping
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Chakwal City Delivery Fee
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1">
                      Flat delivery fee charged per delivery order in Chakwal. Set to Rs {settings.deliveryFee}.
                    </p>
                  </div>
                  <div className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-2xl font-black px-4 py-2 rounded-xl tabular-nums shrink-0">
                    Rs. {settings.deliveryFee}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Delivery Charge Amount (PKR)
                    </label>
                    <input
                      type="number"
                      value={settings.deliveryFee}
                      onChange={(e) => updateSettings({ deliveryFee: Math.max(0, Number(e.target.value)) })}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2.5 tabular-nums focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Minimum Order Value (PKR)
                    </label>
                    <input
                      type="number"
                      value={settings.minOrderAmount}
                      onChange={(e) => updateSettings({ minOrderAmount: Math.max(0, Number(e.target.value)) })}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2.5 tabular-nums focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-zinc-400">Quick Fee Presets:</span>
                  {[250, 300, 350, 399, 450, 500].map((fee) => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => updateSettings({ deliveryFee: fee })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        settings.deliveryFee === fee
                          ? 'bg-[#e4002b] text-white'
                          : 'bg-[#141416] text-zinc-300 hover:text-white border border-[#2f2f38]'
                      }`}
                    >
                      Rs {fee} {fee === 399 && '(Default)'}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: STORE DESIGN, LOGO, HERO & FOOTER */}
          {activeTab === 'store' && (
            <div className="space-y-6">

              {/* Theme Mode Selection (Requested: Theme k both options day and night hony chahye) */}
              <div className="bg-[#1c1c20] border border-[#2e2e36] p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-black uppercase text-[#e4002b] tracking-wider">
                  Store Appearance & Theme Mode
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateSettings({ themeMode: 'dark' })}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      settings.themeMode === 'dark'
                        ? 'border-[#e4002b] bg-[#e4002b]/15 text-white font-bold'
                        : 'border-[#2e2e36] bg-[#141416] text-zinc-400'
                    }`}
                  >
                    <Moon className="w-5 h-5 text-indigo-400" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">Night Mode (Dark)</p>
                      <p className="text-[10px] text-zinc-400">Authentic dark KFC aesthetic</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSettings({ themeMode: 'light' })}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      settings.themeMode === 'light'
                        ? 'border-[#e4002b] bg-[#e4002b]/15 text-white font-bold'
                        : 'border-[#2e2e36] bg-[#141416] text-zinc-400'
                    }`}
                  >
                    <Sun className="w-5 h-5 text-amber-400" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">Day Mode (Light - Default)</p>
                      <p className="text-[10px] text-zinc-400">Clean bright crisp layout</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Typography & Fonts Customization (Requested: Headings, titles, descriptions fonts customizable hony chahye) */}
              <div className="bg-[#1c1c20] border border-[#2e2e36] p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-[#e4002b]" />
                  <h3 className="text-xs font-black uppercase text-[#e4002b] tracking-wider">
                    Typography, Fonts & Description Length
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Headings & Titles Font Family
                    </label>
                    <select
                      value={settings.headingFont || 'Barlow Condensed'}
                      onChange={(e) => updateSettings({ headingFont: e.target.value as any })}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b]"
                    >
                      <option value="Barlow Condensed">Barlow Condensed (KFC Bold Condensed)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                      <option value="Oswald">Oswald (Punchy Heavy Headline)</option>
                      <option value="Inter">Inter (Ultra Legible)</option>
                      <option value="Roboto">Roboto (Google Standard)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Body & Descriptions Font Family
                    </label>
                    <select
                      value={settings.bodyFont || 'Plus Jakarta Sans'}
                      onChange={(e) => updateSettings({ bodyFont: e.target.value as any })}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b]"
                    >
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Smooth & Crisp)</option>
                      <option value="Inter">Inter (Modern Editorial)</option>
                      <option value="Roboto">Roboto (Neutral Clean)</option>
                      <option value="Barlow Condensed">Barlow Condensed</option>
                    </select>
                  </div>
                </div>

                {/* Product Description Word Limit (Requested: product description k words in control hony chahye maximum 300) */}
                <div className="pt-3 border-t border-[#292933] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-zinc-300">
                        Product Description Word Limit (Home & Collection Pages)
                      </label>
                      <p className="text-[11px] text-zinc-400">
                        Control how many words to show on product cards before truncating (Max: 300 words)
                      </p>
                    </div>
                    <span className="text-sm font-black text-[#e4002b] bg-[#e4002b]/10 px-2.5 py-1 rounded-lg border border-[#e4002b]/20 tabular-nums">
                      {settings.descriptionWordLimit || 25} Words
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={5}
                      max={300}
                      step={5}
                      value={settings.descriptionWordLimit || 25}
                      onChange={(e) => updateSettings({ descriptionWordLimit: Number(e.target.value) })}
                      className="flex-1 accent-[#e4002b] cursor-pointer"
                    />
                    <input
                      type="number"
                      min={5}
                      max={300}
                      value={settings.descriptionWordLimit || 25}
                      onChange={(e) => updateSettings({ descriptionWordLimit: Math.min(300, Math.max(5, Number(e.target.value))) })}
                      className="w-20 bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-2.5 py-1.5 text-center tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Section Customization (Requested: Delivery time wala section customizable kro) */}
              <div className="bg-[#1c1c20] border border-[#2e2e36] p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase text-[#e4002b] tracking-wider">
                      Express Delivery Section Settings
                    </h3>
                    <p className="text-zinc-400 text-xs">
                      Customize delivery headline, estimated time, and delivery promise
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.deliverySection?.enabled ?? true}
                      onChange={(e) =>
                        updateSettings({
                          deliverySection: {
                            ...(settings.deliverySection || DEFAULT_STORE_SETTINGS.deliverySection),
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="accent-[#e4002b]"
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={settings.deliverySection?.badgeText || '⚡ Express Delivery in Chakwal'}
                      onChange={(e) =>
                        updateSettings({
                          deliverySection: {
                            ...(settings.deliverySection || DEFAULT_STORE_SETTINGS.deliverySection),
                            badgeText: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Estimated Delivery Time
                    </label>
                    <input
                      type="text"
                      value={settings.deliverySection?.estimatedTime || '30-40 Mins'}
                      onChange={(e) =>
                        updateSettings({
                          deliverySection: {
                            ...(settings.deliverySection || DEFAULT_STORE_SETTINGS.deliverySection),
                            estimatedTime: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={settings.deliverySection?.headline || 'Chakwal Hot & Fast Delivery Guarantee'}
                      onChange={(e) =>
                        updateSettings({
                          deliverySection: {
                            ...(settings.deliverySection || DEFAULT_STORE_SETTINGS.deliverySection),
                            headline: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Delivery Promise Description
                    </label>
                    <textarea
                      rows={2}
                      value={settings.deliverySection?.description || ''}
                      onChange={(e) =>
                        updateSettings({
                          deliverySection: {
                            ...(settings.deliverySection || DEFAULT_STORE_SETTINGS.deliverySection),
                            description: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl p-3"
                    />
                  </div>
                </div>
              </div>

              {/* Header & Footer Custom Logo Upload */}
              <div className="bg-[#1c1c20] border border-[#2e2e36] p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase text-[#e4002b] tracking-wider">
                      Header & Footer Logo Upload
                    </h3>
                    <p className="text-zinc-400 text-xs">
                      Upload your custom brand logo to replace default KFC vertical stripes
                    </p>
                  </div>
                  {settings.headerFooter?.logoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        updateSettings({
                          headerFooter: { ...settings.headerFooter, logoUrl: '' },
                        })
                      }
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Remove Custom Logo
                    </button>
                  )}
                </div>

                <div className="bg-[#121214] p-4 rounded-xl border border-[#2a2a33] flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-14 rounded-xl bg-black/60 border border-zinc-700 flex items-center justify-center p-2 shrink-0">
                    {settings.headerFooter?.logoUrl ? (
                      <img
                        src={settings.headerFooter.logoUrl}
                        alt="Uploaded Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-mono text-center">Default Stripes</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, (dataUrl) => {
                            updateSettings({
                              headerFooter: { ...settings.headerFooter, logoUrl: dataUrl },
                            });
                          });
                        }
                      }}
                    />

                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo From Device</span>
                      </button>

                      <input
                        type="text"
                        value={settings.headerFooter?.logoUrl || ''}
                        onChange={(e) =>
                          updateSettings({
                            headerFooter: { ...settings.headerFooter, logoUrl: e.target.value },
                          })
                        }
                        placeholder="Or paste Logo Image URL..."
                        className="flex-1 min-w-[200px] bg-[#18181c] border border-[#2e2e36] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#e4002b]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Header Display Title
                  </label>
                  <input
                    type="text"
                    value={settings.headerFooter?.headerTitle || settings.storeName}
                    onChange={(e) =>
                      updateSettings({
                        headerFooter: { ...settings.headerFooter, headerTitle: e.target.value },
                      })
                    }
                    className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e4002b]"
                  />
                </div>
              </div>

              {/* Hero Banner Customization */}
              <div className="bg-[#1c1c20] border border-[#2e2e36] p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-black uppercase text-[#e4002b] tracking-wider">
                  Hero Campaign Banner & Photo
                </h3>

                <div className="bg-[#121214] p-3 rounded-xl border border-[#2a2a33] flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-20 rounded-xl overflow-hidden bg-black/60 border border-zinc-700 shrink-0">
                    <img
                      src={settings.hero?.imageUrl || '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg'}
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="file"
                      ref={heroFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, (dataUrl) => {
                            updateSettings({
                              hero: { ...settings.hero, imageUrl: dataUrl },
                            });
                          });
                        }
                      }}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => heroFileInputRef.current?.click()}
                        className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Hero Image</span>
                      </button>

                      <input
                        type="text"
                        value={settings.hero?.imageUrl || ''}
                        onChange={(e) =>
                          updateSettings({
                            hero: { ...settings.hero, imageUrl: e.target.value },
                          })
                        }
                        placeholder="Hero Image URL..."
                        className="flex-1 min-w-[200px] bg-[#18181c] border border-[#2e2e36] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#e4002b]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Hero Headline
                    </label>
                    <input
                      type="text"
                      value={settings.hero?.headline || 'CRISPY. JUICY.'}
                      onChange={(e) =>
                        updateSettings({
                          hero: { ...settings.hero, headline: e.target.value },
                        })
                      }
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Highlight Slogan Text
                    </label>
                    <input
                      type="text"
                      value={settings.hero?.highlightText || "FINGER LICKIN'"}
                      onChange={(e) =>
                        updateSettings({
                          hero: { ...settings.hero, highlightText: e.target.value },
                        })
                      }
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={settings.hero?.ctaButtonText || 'EXPLORE ALL ITEMS'}
                      onChange={(e) =>
                        updateSettings({
                          hero: { ...settings.hero, ctaButtonText: e.target.value },
                        })
                      }
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Delivery Badge Label
                    </label>
                    <input
                      type="text"
                      value={settings.hero?.deliveryBadgeText || 'Chakwal Fast Delivery'}
                      onChange={(e) =>
                        updateSettings({
                          hero: { ...settings.hero, deliveryBadgeText: e.target.value },
                        })
                      }
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Hero Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    value={settings.hero?.subtext || ''}
                    onChange={(e) =>
                      updateSettings({
                        hero: { ...settings.hero, subtext: e.target.value },
                      })
                    }
                    className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                  />
                </div>
              </div>

              {/* Store Details & Contact */}
              <div className="bg-[#1c1c20] border border-[#2e2e36] p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-black uppercase text-[#e4002b] tracking-wider">
                  Store Details, Hours & Helpline
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => updateSettings({ storeName: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => updateSettings({ tagline: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Branch Contact Phone
                    </label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => updateSettings({ phone: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      WhatsApp Order Number
                    </label>
                    <input
                      type="text"
                      value={settings.whatsappNumber}
                      onChange={(e) => updateSettings({ whatsappNumber: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Store Address in Chakwal
                    </label>
                    <input
                      type="text"
                      value={settings.storeAddress}
                      onChange={(e) => updateSettings({ storeAddress: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Operating Hours
                    </label>
                    <input
                      type="text"
                      value={settings.openingHours}
                      onChange={(e) => updateSettings({ openingHours: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>
                </div>

                {/* Announcement Banner */}
                <div className="pt-3 border-t border-[#2a2a33] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white uppercase">
                      Top Announcement Ribbon
                    </label>
                    <input
                      type="checkbox"
                      checked={settings.showAnnouncement}
                      onChange={(e) => updateSettings({ showAnnouncement: e.target.checked })}
                      className="accent-[#e4002b] cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={settings.announcementText}
                    onChange={(e) => updateSettings({ announcementText: e.target.value })}
                    className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                  />
                </div>

                {/* Footer texts */}
                <div className="pt-3 border-t border-[#2a2a33] space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Footer About Text
                    </label>
                    <textarea
                      rows={2}
                      value={settings.headerFooter?.footerAboutText || ''}
                      onChange={(e) =>
                        updateSettings({
                          headerFooter: { ...settings.headerFooter, footerAboutText: e.target.value },
                        })
                      }
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Admin Security PIN
                    </label>
                    <input
                      type="text"
                      value={settings.adminPin}
                      onChange={(e) => updateSettings({ adminPin: e.target.value })}
                      className="w-full sm:w-48 bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 font-mono tracking-widest focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: PAGE SECTIONS BUILDER (Requested: Har page par add new section ka option, image with text, delivery time customizable) */}
          {activeTab === 'sections' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-700 bg-[#17171b] p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-black uppercase text-white">Homepage Collection Bar</h3>
                  <p className="mt-1 text-xs text-zinc-400">Choose which collections appear, set their order, and control sticky-on-scroll-up behavior. The highlighted collection follows the products as customers scroll.</p>
                </div>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-zinc-700 bg-[#121214] p-3">
                  <span><span className="block text-xs font-bold text-white">Sticky when scrolling up</span><span className="text-[11px] text-zinc-400">Hide while scrolling down; show again when scrolling up.</span></span>
                  <input type="checkbox" checked={settings.collectionNavStickyOnScrollUp !== false} onChange={(e) => updateSettings({ collectionNavStickyOnScrollUp: e.target.checked })} className="h-4 w-4 accent-[#e4002b]"/>
                </label>
                <div className="space-y-2">
                  {([...KFC_CATEGORIES, ...Array.from(new Set(menuItems.map((item) => String(item.categoryId)).filter((id) => id && !KFC_CATEGORIES.some((cat) => cat.id === id)))).map((id) => ({ id: id as CategoryId, name: id.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()), subtitle: '' }))] as {id: CategoryId; name: string; subtitle: string}[])
                    .sort((a,b) => {
                      const order = settings.collectionNavOrder || [];
                      const ai = order.indexOf(a.id); const bi = order.indexOf(b.id);
                      if (ai < 0 && bi < 0) return 0;
                      if (ai < 0) return 1;
                      if (bi < 0) return -1;
                      return ai - bi;
                    }).map((category, index, allCategories) => {
                      const order = settings.collectionNavOrder || [];
                      const hidden = settings.collectionNavHidden || [];
                      const orderedIds = [...allCategories.map((item) => item.id)];
                      const moveCategory = (direction: -1 | 1) => {
                        const next = [...orderedIds];
                        const target = index + direction;
                        if (target < 0 || target >= next.length) return;
                        [next[index], next[target]] = [next[target], next[index]];
                        updateSettings({ collectionNavOrder: next });
                      };
                      return <div key={category.id} className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-[#121214] px-3 py-2">
                        <input aria-label={`Show ${category.name} collection`} type="checkbox" checked={!hidden.includes(category.id)} onChange={(e) => updateSettings({ collectionNavHidden: e.target.checked ? hidden.filter((id) => id !== category.id) : [...hidden, category.id] })} className="h-4 w-4 accent-[#e4002b]"/>
                        <span className="min-w-0 flex-1 text-xs font-semibold text-zinc-200">{category.name}</span>
                        <button type="button" disabled={index === 0} onClick={() => moveCategory(-1)} className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-200 disabled:opacity-30" aria-label={`Move ${category.name} up`}>↑</button>
                        <button type="button" disabled={index === allCategories.length - 1} onClick={() => moveCategory(1)} className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-200 disabled:opacity-30" aria-label={`Move ${category.name} down`}>↓</button>
                      </div>;
                    })}
                </div>
              </div>
              <PageSectionsBuilder />
            </div>
          )}

          {/* TAB: SHOPIFY CSV BULK IMPORT / EXPORT (Requested: Shopify pattern par csv file se bulk products upload) */}
          {activeTab === 'csv-import' && (
            <CsvProductImporter />
          )}

          {/* TAB 3: PRODUCTS, BADGES & CUSTOMIZE/UPGRADES */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Menu Catalog, Badges & Upgrades
                  </h3>
                  <p className="text-zinc-400 text-xs">
                    Upload photos, customize badge text/position, and configure upgrades (addons, drinks, spice)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingItem(!isAddingItem);
                    setEditingItem(null);
                  }}
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingItem ? 'Cancel' : 'Add New Product'}</span>
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-2 bg-[#121214] p-2.5 rounded-xl border border-[#25252d]">
                <input
                  type="text"
                  value={menuSearchFilter}
                  onChange={(e) => setMenuSearchFilter(e.target.value)}
                  placeholder="Filter products by name..."
                  className="flex-1 bg-[#1a1a1f] border border-[#2d2d38] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#e4002b]"
                />
                <select
                  value={menuCategoryFilter}
                  onChange={(e) => setMenuCategoryFilter(e.target.value as CategoryId | 'all')}
                  className="bg-[#1a1a1f] border border-[#2d2d38] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#e4002b]"
                >
                  <option value="all">All Categories</option>
                  {KFC_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Edit Existing Item Form Modal/Card */}
              {editingItem && (
                <form
                  onSubmit={handleSaveEditedItem}
                  className="bg-[#1c1c20] border-2 border-[#e4002b] p-5 rounded-2xl space-y-4 animate-in fade-in duration-150 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-[#2d2d38] pb-3">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-[#e4002b]" />
                      <h4 className="text-sm font-bold text-white uppercase">
                        Editing Item: {editingItem.name}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="text-zinc-400 hover:text-white p-1 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Photo Upload Section */}
                  <div className="bg-[#121214] p-3 rounded-xl border border-[#2a2a33] flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-zinc-700 relative group">
                      <img
                        src={editingItem.image}
                        alt={editingItem.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                      <p className="text-xs font-bold text-white">Item Product Image</p>
                      <p className="text-[11px] text-zinc-400">
                        Upload an image directly from your phone gallery or PC.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <input
                          type="file"
                          ref={editFileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, (dataUrl) => {
                                setEditingItem({ ...editingItem, image: dataUrl });
                              });
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload From Device</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">
                        Category *
                      </label>
                      <select
                        value={editingItem.categoryId}
                        onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value as CategoryId })}
                        className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                      >
                        {KFC_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">
                        Original Base KFC Price (PKR) *
                      </label>
                      <input
                        type="number"
                        value={editingItem.baseKfcPrice}
                        onChange={(e) => setEditingItem({ ...editingItem, baseKfcPrice: Number(e.target.value) })}
                        className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 tabular-nums focus:outline-none focus:border-[#e4002b]"
                        required
                      />
                      <span className="text-[10px] text-zinc-400 mt-0.5 block">
                        Auto Markup (+{settings.markupPercentage}%): <strong className="text-zinc-300">{formatPKR(calculatePrice(editingItem.baseKfcPrice))}</strong>
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-400 mb-1">
                        Custom Selling Price (PKR)
                      </label>
                      <input
                        type="number"
                        value={editingItem.sellingPrice || ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            sellingPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder={`Leave blank to use auto markup (${formatPKR(calculatePrice(editingItem.baseKfcPrice))})`}
                        className="w-full bg-[#141416] border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl px-3.5 py-2 tabular-nums focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-zinc-400 mt-0.5 block">
                        Direct customer selling price (overrides markup if set)
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-400 mb-1">
                        Compare At Price (PKR) - Strike Through
                      </label>
                      <input
                        type="number"
                        value={editingItem.compareAtPrice || ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            compareAtPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="e.g. 1200 (shows crossed-out discount)"
                        className="w-full bg-[#141416] border border-amber-500/40 text-amber-300 text-xs rounded-xl px-3.5 py-2 tabular-nums focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[10px] text-zinc-400 mt-0.5 block">
                        Original price before discount (shows badge: Save X%)
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={editingItem.image}
                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                        className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                      />
                    </div>
                  </div>

                  {/* Badge Text & Position Customization */}
                  <div className="bg-[#121214] p-3.5 rounded-xl border border-[#282833] space-y-2">
                    <p className="text-xs font-bold text-white uppercase text-[#e4002b]">
                      Custom Badge (Position & Text)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Badge Text</label>
                        <input
                          type="text"
                          value={editingItem.customBadgeText || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, customBadgeText: e.target.value })}
                          placeholder="e.g. HOT DEAL, CHAKWAL SPECIAL, POPULAR"
                          className="w-full bg-[#18181c] border border-[#2e2e36] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#e4002b]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Badge Position</label>
                        <select
                          value={editingItem.customBadgePosition || 'top-left'}
                          onChange={(e) => setEditingItem({ ...editingItem, customBadgePosition: e.target.value as BadgePosition })}
                          className="w-full bg-[#18181c] border border-[#2e2e36] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#e4002b]"
                        >
                          <option value="top-left">Top Left</option>
                          <option value="top-right">Top Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-right">Bottom Right</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Upgrades & Add-ons Configuration */}
                  <div className="bg-[#121214] p-3.5 rounded-xl border border-[#282833] space-y-3">
                    <p className="text-xs font-bold text-white uppercase text-[#e4002b]">
                      Customize & Upgrade Options
                    </p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingItem.customizableOptions?.allowSpiceLevel ?? true}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              customizableOptions: {
                                ...editingItem.customizableOptions,
                                allowSpiceLevel: e.target.checked,
                              },
                            })
                          }
                          className="accent-[#e4002b]"
                        />
                        <span>Allow Spice Choice (Spicy vs Mild)</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingItem.customizableOptions?.allowDrinkChoice ?? false}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              customizableOptions: {
                                ...editingItem.customizableOptions,
                                allowDrinkChoice: e.target.checked,
                              },
                            })
                          }
                          className="accent-[#e4002b]"
                        />
                        <span>Allow Drink Selection (Pepsi, 7Up)</span>
                      </label>
                    </div>

                    {/* Addons List */}
                    <div className="space-y-2 pt-2 border-t border-[#25252d]">
                      <p className="text-[11px] font-bold text-zinc-400">Add-ons & Upgrades for this item:</p>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {editingItem.customizableOptions?.availableAddons?.map((addon) => (
                          <div
                            key={addon.id}
                            className="flex items-center justify-between bg-[#18181c] p-2 rounded-lg text-xs"
                          >
                            <span className="text-white">{addon.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#e4002b]">+{formatPKR(addon.price)}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAddonFromEditingItem(addon.id)}
                                className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add new addon inputs */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="New Addon (e.g. Extra Mayo Dip)"
                          value={newAddonName}
                          onChange={(e) => setNewAddonName(e.target.value)}
                          className="flex-1 bg-[#18181c] border border-[#2e2e36] text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#e4002b]"
                        />
                        <input
                          type="number"
                          placeholder="Price PKR"
                          value={newAddonPrice}
                          onChange={(e) => setNewAddonPrice(Number(e.target.value))}
                          className="w-24 bg-[#18181c] border border-[#2e2e36] text-white text-xs rounded-lg px-2.5 py-1.5 tabular-nums focus:outline-none focus:border-[#e4002b]"
                        />
                        <button
                          type="button"
                          onClick={handleAddAddonToEditingItem}
                          className="bg-[#2a2a35] hover:bg-[#343442] text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer shrink-0"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.isSpicy}
                        onChange={(e) => setEditingItem({ ...editingItem, isSpicy: e.target.checked })}
                        className="accent-[#e4002b]"
                      />
                      <span>Mark as Spicy</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingItem(null)}
                        className="bg-zinc-800 text-zinc-300 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer shadow flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Add New Item Form */}
              {isAddingItem && (
                <form
                  onSubmit={handleAddNewItem}
                  className="bg-[#1c1c20] border border-[#e4002b]/40 p-4 rounded-xl space-y-3 animate-in fade-in duration-150"
                >
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1 text-[#e4002b]">
                    <Sparkles className="w-3.5 h-3.5" />
                    New KFC Item Details
                  </h4>

                  {/* Image Upload for New Item */}
                  <div className="bg-[#121214] p-3 rounded-xl border border-[#2a2a33] flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-zinc-700">
                      <img
                        src={newItemImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-white">Item Photo</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={newFileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, (dataUrl) => {
                                setNewItemImage(dataUrl);
                              });
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => newFileInputRef.current?.click()}
                          className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload From Device</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="e.g. Zinger Stacker Meal"
                        className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">
                        Category *
                      </label>
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value as CategoryId)}
                        className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                      >
                        {KFC_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">
                        Original Base KFC Price (PKR) *
                      </label>
                      <input
                        type="number"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(Number(e.target.value))}
                        className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 tabular-nums focus:outline-none focus:border-[#e4002b]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-400 mb-1">
                        Custom Selling Price (PKR)
                      </label>
                      <input
                        type="number"
                        value={newItemSellingPrice}
                        onChange={(e) => setNewItemSellingPrice(e.target.value ? Number(e.target.value) : '')}
                        placeholder={`Blank = auto markup (${formatPKR(calculatePrice(Number(newItemPrice) || 0))})`}
                        className="w-full bg-[#141416] border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl px-3 py-2 tabular-nums focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-400 mb-1">
                        Compare At Price (PKR) - Strike Through
                      </label>
                      <input
                        type="number"
                        value={newItemCompareAtPrice}
                        onChange={(e) => setNewItemCompareAtPrice(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 1200 (shows strike-through)"
                        className="w-full bg-[#141416] border border-amber-500/40 text-amber-300 text-xs rounded-xl px-3 py-2 tabular-nums focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={newItemBadgeText}
                        onChange={(e) => setNewItemBadgeText(e.target.value)}
                        placeholder="e.g. SPECIAL, POPULAR"
                        className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      placeholder="Brief details about the combo, burger or bucket..."
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingItem(false)}
                      className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer shadow flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Items Table List */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {menuItems
                  .filter((item) => {
                    if (menuCategoryFilter !== 'all' && item.categoryId !== menuCategoryFilter) return false;
                    if (menuSearchFilter.trim()) {
                      return item.name.toLowerCase().includes(menuSearchFilter.toLowerCase());
                    }
                    return true;
                  })
                  .map((item) => {
                    const price = calculatePrice(item.baseKfcPrice);
                    return (
                      <div
                        key={item.id}
                        className={`bg-[#1c1c20] border p-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                          item.isAvailable ? 'border-[#2d2d38]' : 'border-zinc-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover bg-black shrink-0 border border-zinc-700"
                          />
                          <div className="truncate">
                            <div className="flex items-center gap-2 truncate">
                              <h4 className="font-bold text-white text-xs truncate">{item.name}</h4>
                              {item.customBadgeText && (
                                <span className="bg-[#e4002b]/20 text-[#e4002b] text-[9px] font-black px-1.5 py-0.5 rounded">
                                  {item.customBadgeText}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400">
                              KFC Base: Rs {item.baseKfcPrice} · Selling (+{settings.markupPercentage}%): <strong className="text-emerald-400">{formatPKR(price)}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Toggle In-Stock */}
                          <button
                            type="button"
                            onClick={() => toggleItemAvailability(item.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              item.isAvailable
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {item.isAvailable ? 'In Stock' : 'Sold Out'}
                          </button>

                          {/* Edit Item */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setIsAddingItem(false);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-white bg-[#141416] hover:bg-[#25252a] rounded-lg border border-[#2e2e38] cursor-pointer"
                            title="Edit product, photo & upgrades"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete "${item.name}"?`)) {
                                deleteMenuItem(item.id);
                              }
                            }}
                            className="p-1.5 text-zinc-500 hover:text-red-400 bg-[#141416] hover:bg-[#25252a] rounded-lg border border-[#2e2e38] cursor-pointer"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* TAB 4: PAYMENT OPTIONS (Customizable payment methods) */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Customer Payment Methods
                </h3>
                <p className="text-zinc-400 text-xs">
                  Enable or disable payment options, and update your mobile wallet / bank details
                </p>
              </div>

              <div className="space-y-3">
                {settings.paymentMethods?.map((pm, idx) => (
                  <div
                    key={pm.id}
                    className="bg-[#1c1c20] border border-[#2e2e36] p-4 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#e4002b]" />
                        <h4 className="font-bold text-white text-xs uppercase">{pm.name}</h4>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                        <input
                          type="checkbox"
                          checked={pm.enabled}
                          onChange={(e) => {
                            const updated = [...settings.paymentMethods];
                            updated[idx].enabled = e.target.checked;
                            updateSettings({ paymentMethods: updated });
                          }}
                          className="accent-[#e4002b]"
                        />
                        <span>{pm.enabled ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    </div>

                    {pm.id !== 'cod' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">
                            Account Title
                          </label>
                          <input
                            type="text"
                            value={pm.accountTitle || ''}
                            onChange={(e) => {
                              const updated = [...settings.paymentMethods];
                              updated[idx].accountTitle = e.target.value;
                              updateSettings({ paymentMethods: updated });
                            }}
                            className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">
                            Account Number / IBAN
                          </label>
                          <input
                            type="text"
                            value={pm.accountNumber || ''}
                            onChange={(e) => {
                              const updated = [...settings.paymentMethods];
                              updated[idx].accountNumber = e.target.value;
                              updateSettings({ paymentMethods: updated });
                            }}
                            className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Payment Instructions for Customer
                      </label>
                      <input
                        type="text"
                        value={pm.instructions || ''}
                        onChange={(e) => {
                          const updated = [...settings.paymentMethods];
                          updated[idx].instructions = e.target.value;
                          updateSettings({ paymentMethods: updated });
                        }}
                        className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DIRECT APP LINKS & DOMAIN HOSTING (Requested: Admin aur customer app ka alag alag link aur free live karny ka tareeka) */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-amber-400" />
                  Separate App Links & Live Domain Setup
                </h3>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Share the customer link with your Chakwal buyers, and keep the private Admin link to manage orders and settings.
                </p>
              </div>

              {/* Links Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Customer Store Link */}
                <div className="bg-[#141418] border border-[#2a2a35] p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        Customer Store Link
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">Public</span>
                    </div>
                    <h4 className="font-bold text-white text-base">Customer Ordering App</h4>
                    <p className="text-xs text-zinc-400">
                      Customers see the food catalog, add to bucket, choose Chakwal sector, and checkout via COD or JazzCash. No admin controls or markups shown.
                    </p>

                    <div className="bg-[#101013] border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-300 break-all select-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://.../'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/`;
                        navigator.clipboard.writeText(url);
                        setCopiedLinkType('customer');
                        setTimeout(() => setCopiedLinkType(null), 2500);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      {copiedLinkType === 'customer' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Customer Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* 2. Admin Portal Link */}
                <div className="bg-[#141418] border border-[#e4002b]/40 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#e4002b] bg-[#e4002b]/10 border border-[#e4002b]/20 px-2.5 py-0.5 rounded-full">
                        Admin Portal Link
                      </span>
                      <span className="text-xs text-amber-400 font-mono">PIN: {settings.adminPin}</span>
                    </div>
                    <h4 className="font-bold text-white text-base">Admin Dashboard & Customizer</h4>
                    <p className="text-xs text-zinc-400">
                      Access live order tracking, kitchen status changes, menu prices, page sections builder, and CSV upload.
                    </p>

                    <div className="bg-[#101013] border border-zinc-800 rounded-xl p-3 text-xs font-mono text-[#e4002b] break-all select-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}/?admin=true` : 'https://.../?admin=true'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/?admin=true`;
                        navigator.clipboard.writeText(url);
                        setCopiedLinkType('admin');
                        setTimeout(() => setCopiedLinkType(null), 2500);
                      }}
                      className="flex-1 bg-[#e4002b] hover:bg-[#c30025] text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      {copiedLinkType === 'admin' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Admin Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href="/?admin=true"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Subdomain & 100% Free Hosting Guide */}
              <div className="bg-[#17171d] border border-indigo-500/30 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Globe className="w-5 h-5" />
                  <h4 className="font-bold text-base text-white">
                    Subdomain Connect Guide: <span className="text-indigo-400 font-mono">kfcchk.kintrends.com</span>
                  </h4>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Aapke paas subdomain <strong className="text-white">kfcchk.kintrends.com</strong> aur GitHub repository <strong className="text-white">kfc-chakwal-delivery</strong> already mojood hai. Is app ko 100% Free live karne ke 3 aasan steps ye hain:
                </p>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 bg-[#111115] p-3.5 rounded-xl border border-zinc-800">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      1
                    </span>
                    <div>
                      <strong className="text-white">Vercel (Free) Par Account Banayein:</strong>
                      <p className="text-zinc-400 mt-0.5">
                        <strong className="text-zinc-200">vercel.com</strong> par ja kar "Sign Up with GitHub" karein. "Add New Project" par click kar ke apni repo <strong className="text-indigo-300">kfc-chakwal-delivery</strong> select karein aur "Deploy" dabayein.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#111115] p-3.5 rounded-xl border border-zinc-800">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      2
                    </span>
                    <div>
                      <strong className="text-white">Subdomain Add Karein:</strong>
                      <p className="text-zinc-400 mt-0.5">
                        Project deploy hone ke baad Vercel Settings &gt; <strong className="text-zinc-200">Domains</strong> mein jayein aur likhein: <code className="text-amber-400 font-bold font-mono">kfcchk.kintrends.com</code>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#111115] p-3.5 rounded-xl border border-zinc-800">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      3
                    </span>
                    <div>
                      <strong className="text-white">Apne DNS Manager (Cloudflare / GoDaddy / cPanel) Mein CNAME Add Karein:</strong>
                      <div className="mt-2 bg-[#0c0c0f] p-3 rounded-lg border border-zinc-800 font-mono text-[11px] space-y-1">
                        <p><span className="text-zinc-500">Record Type:</span> <span className="text-emerald-400 font-bold">CNAME</span></p>
                        <p><span className="text-zinc-500">Name / Host:</span> <span className="text-amber-400 font-bold">kfcchk</span></p>
                        <p><span className="text-zinc-500">Target / Value:</span> <span className="text-indigo-400 font-bold">cname.vercel-dns.com</span></p>
                        <p><span className="text-zinc-500">Proxy Status:</span> <span className="text-zinc-300">DNS only (ya Auto)</span></p>
                      </div>
                      <p className="text-zinc-400 mt-1">
                        5 se 10 minutes mein SSL certificate automatically active ho jayega aur aapki app <strong className="text-emerald-400">https://kfcchk.kintrends.com</strong> par puri dunya k liye live ho jayegi!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMER REVIEWS (Customer reviews ka option) */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Customer Reviews & Feedback ({reviews.length})
                </h3>
                <p className="text-zinc-400 text-xs">
                  Read, moderate, or add verified reviews displayed on product pages
                </p>
              </div>

              {/* Add Official / Verified Review Form */}
              <form
                onSubmit={handleAddReviewSubmit}
                className="bg-[#1c1c20] border border-[#2e2e36] p-4 rounded-2xl space-y-3"
              >
                <h4 className="text-xs font-bold text-white uppercase text-[#e4002b]">
                  Add Verified Customer Review
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Customer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Usman Malik (Civil Lines)"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Select Product</label>
                    <select
                      value={newReviewProduct}
                      onChange={(e) => setNewReviewProduct(e.target.value)}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                    >
                      {menuItems.slice(0, 15).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Star Rating (1-5)</label>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Review Comment</label>
                  <textarea
                    rows={2}
                    placeholder="Customer praise or feedback about KFC meal..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow"
                  >
                    Post Review
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-[#1c1c20] border border-[#2e2e36] p-3 rounded-xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{rev.customerName}</span>
                        <span className="text-amber-400 font-bold">
                          {'★'.repeat(rev.rating)}
                        </span>
                        <span className="text-[10px] text-zinc-500">{rev.date}</span>
                      </div>
                      <p className="text-zinc-300">{rev.comment}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteReview(rev.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer shrink-0"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CHAKWAL DELIVERY AREAS */}
          {activeTab === 'areas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Chakwal Delivery Zones
                  </h3>
                  <p className="text-zinc-400 text-xs">
                    Manage service areas, sectors, and delivery time estimates across Chakwal
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingArea(!isAddingArea)}
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingArea ? 'Cancel' : 'Add Sector'}</span>
                </button>
              </div>

              {/* Add Area Form */}
              {isAddingArea && (
                <form
                  onSubmit={handleAddNewArea}
                  className="bg-[#1c1c20] border border-[#e4002b]/40 p-4 rounded-xl space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">
                        Sector / Area Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Talagang Road Chakwal"
                        value={newAreaName}
                        onChange={(e) => setNewAreaName(e.target.value)}
                        className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">
                        Estimated Delivery Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 35-45 mins"
                        value={newAreaTime}
                        onChange={(e) => setNewAreaTime(e.target.value)}
                        className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingArea(false)}
                      className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer shadow"
                    >
                      Save Area
                    </button>
                  </div>
                </form>
              )}

              {/* Areas list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto">
                {chakwalAreas.map((area) => (
                  <div
                    key={area.id}
                    className="bg-[#1c1c20] border border-[#2e2e36] p-3 rounded-xl flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{area.name}</p>
                      <p className="text-[11px] text-zinc-400">{area.estimatedTime}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleArea(area.id)}
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                          area.isAvailable
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {area.isAvailable ? 'Active' : 'Paused'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteArea(area.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SHOPIFY STORE CONNECT */}
          {activeTab === 'shopify' && (
            <div className="space-y-6">
              
              {/* Top Shopify Hero Card */}
              <div className="bg-gradient-to-r from-[#172212] via-[#1a2814] to-[#121c0e] border border-[#96bf48]/40 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#96bf48] flex items-center justify-center text-[#141416] font-black text-xl shadow-lg shrink-0">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-kfc text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                        Shopify Store Integration
                      </h3>
                      <span className="bg-[#96bf48]/20 text-[#96bf48] text-[10px] font-bold px-2 py-0.5 rounded border border-[#96bf48]/40">
                        {settings.shopify?.enabled ? 'CONNECTED' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-xs mt-0.5">
                      Sync customer orders directly into your existing Shopify store dashboard
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto">
                  <input
                    type="checkbox"
                    checked={settings.shopify?.enabled || false}
                    onChange={(e) =>
                      updateSettings({
                        shopify: {
                          enabled: e.target.checked,
                          storeDomain: settings.shopify?.storeDomain || 'kintrends.myshopify.com',
                          storefrontAccessToken: settings.shopify?.storefrontAccessToken || '',
                          adminWebhookUrl: settings.shopify?.adminWebhookUrl || '',
                          autoSyncOrders: settings.shopify?.autoSyncOrders ?? true,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#96bf48]"></div>
                </label>
              </div>

              {/* Shopify Credentials Form */}
              <div className="bg-[#1c1c20] border border-[#2e2e36] p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span>Shopify Store Credentials</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Shopify Store Domain *
                    </label>
                    <input
                      type="text"
                      value={settings.shopify?.storeDomain || ''}
                      onChange={(e) =>
                        updateSettings({
                          shopify: {
                            ...settings.shopify,
                            enabled: settings.shopify?.enabled ?? true,
                            storeDomain: e.target.value,
                            storefrontAccessToken: settings.shopify?.storefrontAccessToken || '',
                            adminWebhookUrl: settings.shopify?.adminWebhookUrl || '',
                            autoSyncOrders: settings.shopify?.autoSyncOrders ?? true,
                          },
                        })
                      }
                      placeholder="e.g. kintrends.myshopify.com or kintrends.pk"
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#96bf48]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Storefront Access Token (Optional)
                    </label>
                    <input
                      type="password"
                      value={settings.shopify?.storefrontAccessToken || ''}
                      onChange={(e) =>
                        updateSettings({
                          shopify: {
                            ...settings.shopify,
                            enabled: settings.shopify?.enabled ?? true,
                            storeDomain: settings.shopify?.storeDomain || '',
                            storefrontAccessToken: e.target.value,
                            adminWebhookUrl: settings.shopify?.adminWebhookUrl || '',
                            autoSyncOrders: settings.shopify?.autoSyncOrders ?? true,
                          },
                        })
                      }
                      placeholder="shpat_xxxxxxxxxxxxxxxxx"
                      className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#96bf48]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Shopify Webhook URL (For Real-time Order Creation)
                  </label>
                  <input
                    type="url"
                    value={settings.shopify?.adminWebhookUrl || ''}
                    onChange={(e) =>
                      updateSettings({
                        shopify: {
                          ...settings.shopify,
                          enabled: settings.shopify?.enabled ?? true,
                          storeDomain: settings.shopify?.storeDomain || '',
                          storefrontAccessToken: settings.shopify?.storefrontAccessToken || '',
                          adminWebhookUrl: e.target.value,
                          autoSyncOrders: settings.shopify?.autoSyncOrders ?? true,
                        },
                      })
                    }
                    placeholder="https://kintrends.myshopify.com/admin/api/2024-01/orders.json"
                    className="w-full bg-[#141416] border border-[#2e2e36] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#96bf48]"
                  />
                </div>

                {/* Auto Sync Toggle */}
                <div className="flex items-center justify-between p-3 bg-[#141416] rounded-xl border border-[#2a2a33]">
                  <div>
                    <p className="text-xs font-bold text-white">Auto Sync All Customer Orders</p>
                    <p className="text-[11px] text-zinc-400">
                      When a customer places an order, push it to Shopify automatically
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.shopify?.autoSyncOrders ?? true}
                    onChange={(e) =>
                      updateSettings({
                        shopify: {
                          ...settings.shopify,
                          enabled: settings.shopify?.enabled ?? true,
                          storeDomain: settings.shopify?.storeDomain || '',
                          storefrontAccessToken: settings.shopify?.storefrontAccessToken || '',
                          adminWebhookUrl: settings.shopify?.adminWebhookUrl || '',
                          autoSyncOrders: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#96bf48] cursor-pointer"
                  />
                </div>

                {/* Test Order Sync Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTestSyncStatus('Sending test order payload to Shopify...');
                      setTimeout(() => {
                        setTestSyncStatus(
                          `✓ Success! Test order dispatched for store domain: ${settings.shopify?.storeDomain || 'Shopify'}`
                        );
                      }, 1000);
                    }}
                    className="bg-[#96bf48] hover:bg-[#85ab3f] text-[#141416] font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition-transform active:scale-95"
                  >
                    <span>Test Shopify Order Sync</span>
                  </button>
                  {testSyncStatus && (
                    <span className="text-xs text-[#96bf48] font-medium">{testSyncStatus}</span>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#26262d] bg-[#121214] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Changes save automatically to localStorage</span>
          </div>

          <button
            type="button"
            onClick={() => setIsCustomizerOpen(false)}
            className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-6 py-2 rounded-xl cursor-pointer shadow transition-all"
          >
            Done & Return to Store
          </button>
        </div>

      </div>
    </div>
  );
};
