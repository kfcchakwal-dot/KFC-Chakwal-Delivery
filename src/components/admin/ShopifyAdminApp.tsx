import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Tag, 
  Palette, 
  Truck, 
  CreditCard, 
  Star, 
  FileSpreadsheet, 
  Link2, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Cloud,
  CheckCircle,
  Search, 
  Plus, 
  Check, 
  ShieldCheck, 
  RefreshCw, 
  Eye, 
  Sliders, 
  Sparkles, 
  Phone, 
  Clock, 
  MapPin, 
  Percent, 
  Copy, 
  Trash2,
  FileText,
  Image as ImageIcon,
  Share2,
  Volume2,
  VolumeX,
  Bell,
  Award,
  Flame,
  Users,
  AlertCircle,
  DollarSign,
  Lock,
  ArrowRight
} from 'lucide-react';
import { DiscountsManager } from './DiscountsManager';
import { PageSectionsBuilder } from '../PageSectionsBuilder';
import { CsvProductImporter } from '../CsvProductImporter';
import { CategoryId, MenuItem, StorePolicy, DeliveryMethod, DailyDealConfig } from '../../types';
import { KFC_CATEGORIES } from '../../data/kfcMenu';

type SellerTab = 
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'daily-deals'
  | 'delivery-methods'
  | 'loyalty'
  | 'discounts'
  | 'online-store'
  | 'policies'
  | 'reviews'
  | 'csv-import'
  | 'links'
  | 'settings';

const KFC_IMAGE_PRESETS = [
  { label: 'Krunch Burger', url: '/src/assets/images/kfc_krunch_burger_1791015834419.jpg' },
  { label: 'Zinger Combo', url: '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg' },
  { label: 'Chicken Bucket', url: '/src/assets/images/kfc_bucket_crispy_chicken_1791015820219.jpg' },
  { label: 'Hot Wings Platter', url: '/src/assets/images/kfc_hot_wings_platter_1791015846233.jpg' },
];

export const ShopifyAdminApp: React.FC = () => {
  const {
    settings,
    updateSettings,
    menuItems,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    formatPKR,
    calculatePrice,
    allOrders,
    updateOrderStatus,
    fetchOrders,
    reviews,
    addReview,
    deleteReview,
    policies,
    updatePolicy,
    addPolicy,
    deletePolicy,
    deliveryMethods,
    updateDeliveryMethods,
    dailyDealConfig,
    updateDailyDealConfig,
    customerRecords,
    updateCustomerPoints,
    serverSyncStatus,
    syncStoreToServer,
    isAdmin,
    loginAdmin,
    logoutAdmin,
    playOrderSound,
    goHome,
  } = useStore();

  const [sellerPinInput, setSellerPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<SellerTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<CategoryId | 'all'>('all');

  // Product Edit Modal (Fully Editable: Title, Desc, Price, Category, Image)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // New Product Form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState<CategoryId>('everyday-value');
  const [newProdBasePrice, setNewProdBasePrice] = useState(400);
  const [newProdSellingPrice, setNewProdSellingPrice] = useState<number | ''>('');
  const [newProdComparePrice, setNewProdComparePrice] = useState<number | ''>('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('/src/assets/images/kfc_krunch_burger_1791015834419.jpg');
  const [newProdBadge, setNewProdBadge] = useState('');

  // Orders Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'confirmed' | 'kitchen' | 'dispatched' | 'delivered'>('all');

  // Delivery Method Form state
  const [editingDeliveryMethod, setEditingDeliveryMethod] = useState<DeliveryMethod | null>(null);
  const [isAddingDeliveryMethod, setIsAddingDeliveryMethod] = useState(false);
  const [newDmName, setNewDmName] = useState('');
  const [newDmDesc, setNewDmDesc] = useState('');
  const [newDmPrice, setNewDmPrice] = useState<number>(399);
  const [newDmMinOrder, setNewDmMinOrder] = useState<number | ''>('');
  const [newDmTime, setNewDmTime] = useState('Delivered by 8:00 PM');
  const [newDmDefault, setNewDmDefault] = useState(false);

  // Customer Loyalty Adjustment Modal
  const [adjustingCustomer, setAdjustingCustomer] = useState<any | null>(null);
  const [pointsAdjustmentVal, setPointsAdjustmentVal] = useState<number>(0);

  // Policy Form state
  const [editingPolicy, setEditingPolicy] = useState<StorePolicy | null>(null);
  const [newPolicyTitle, setNewPolicyTitle] = useState('');
  const [newPolicyContent, setNewPolicyContent] = useState('');
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);

  // Copied Link feedback
  const [copiedLink, setCopiedLink] = useState<'customer' | 'seller' | null>(null);

  // =========================================================================
  // LOGIN SCREEN (If not authenticated as seller)
  // =========================================================================
  if (!isAdmin) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const success = loginAdmin(sellerPinInput);
      if (!success) {
        setLoginError('Invalid Seller PIN. (Default PIN: 7860)');
      } else {
        setLoginError('');
      }
    };

    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200 shadow-2xl p-8 space-y-6 text-zinc-900">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-[#e4002b] text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-red-900/30">
              <span className="font-kfc font-black text-2xl tracking-tighter">KCD</span>
            </div>
            <h1 className="font-kfc text-3xl font-black uppercase tracking-tight text-zinc-900">
              KCD Seller Center
            </h1>
            <p className="text-xs text-zinc-500">
              KFC Chakwal Delivery Management Portal
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                Seller Access PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={sellerPinInput}
                  onChange={(e) => setSellerPinInput(e.target.value)}
                  placeholder="Enter 4-digit PIN (e.g. 7860)"
                  className="w-full text-center tracking-widest text-lg font-black border border-zinc-300 rounded-xl py-3 px-4 focus:outline-none focus:border-[#e4002b] focus:ring-2 focus:ring-red-100"
                  autoFocus
                  required
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-4 pointer-events-none" />
              </div>
              <p className="text-[11px] text-zinc-400 text-center mt-1.5">
                Default PIN: <strong className="text-zinc-700">7860</strong>
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#e4002b] hover:bg-[#c30025] text-white font-bold text-sm py-3 px-4 rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              Sign In to KCD Seller
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-100 text-center">
            <button
              type="button"
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('app');
                url.searchParams.delete('admin');
                window.location.href = url.origin + url.pathname;
              }}
              className="text-xs font-bold text-zinc-500 hover:text-[#e4002b] transition flex items-center justify-center gap-1 mx-auto"
            >
              <span>View Customer Storefront</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard calculations
  const totalRevenue = allOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingOrders = allOrders.filter((o) => o.status === 'confirmed' || o.status === 'kitchen').length;
  const deliveredOrders = allOrders.filter((o) => o.status === 'delivered').length;

  const filteredProducts = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCategoryFilter === 'all' || item.categoryId === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredOrders = allOrders.filter((order) => {
    if (orderStatusFilter === 'all') return true;
    return order.status === orderStatusFilter;
  });

  // Handle Add Product Submit
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const newItem: MenuItem = {
      id: `kfc-${Date.now()}`,
      name: newProdName.trim(),
      categoryId: newProdCat,
      description: newProdDesc.trim() || 'Fresh crispy KFC favorite delivered hot in Chakwal.',
      baseKfcPrice: Number(newProdBasePrice) || 300,
      sellingPrice: newProdSellingPrice ? Number(newProdSellingPrice) : undefined,
      compareAtPrice: newProdComparePrice ? Number(newProdComparePrice) : undefined,
      image: newProdImage.trim(), // Can be empty or URL
      isAvailable: true,
      customBadgeText: newProdBadge.trim() || undefined,
    };

    addMenuItem(newItem);
    setIsAddingProduct(false);
    setNewProdName('');
    setNewProdDesc('');
    setNewProdSellingPrice('');
    setNewProdComparePrice('');
    setNewProdBadge('');
  };

  // Handle Add Delivery Method Submit
  const handleAddDeliveryMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDmName.trim()) return;

    const newMethod: DeliveryMethod = {
      id: `dm-${Date.now()}`,
      name: newDmName.trim(),
      description: newDmDesc.trim() || 'Direct motorcycle delivery across Chakwal within 3 KM.',
      price: Number(newDmPrice) || 0,
      minOrderAmount: newDmMinOrder ? Number(newDmMinOrder) : undefined,
      estimatedTime: newDmTime.trim() || 'Delivered by 8:00 PM',
      enabled: true,
      isDefault: newDmDefault,
    };

    let updated = [...deliveryMethods];
    if (newDmDefault) {
      updated = updated.map((m) => ({ ...m, isDefault: false }));
    }
    updated.push(newMethod);
    updateDeliveryMethods(updated);
    setIsAddingDeliveryMethod(false);
    setNewDmName('');
    setNewDmDesc('');
    setNewDmPrice(399);
    setNewDmMinOrder('');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-zinc-900 flex flex-col font-sans">
      
      {/* ========================================================================= */}
      {/* KCD SELLER TOP NAVIGATION (Day Theme: White with Clean Borders) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-sm px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-zinc-600 hover:text-zinc-900 bg-zinc-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#e4002b] text-white flex items-center justify-center font-kfc font-black text-xl shadow-md">
              KCD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-kfc text-xl font-black uppercase tracking-tight text-zinc-900">
                  KCD Seller
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Live Hub
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">
                KFC Chakwal Delivery · Operations Center
              </p>
            </div>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Order Sound Notification Button & Test */}
          <div className="flex items-center bg-zinc-100 rounded-xl p-1 border border-zinc-200 text-xs">
            <button
              type="button"
              onClick={playOrderSound}
              className="px-2.5 py-1 text-zinc-700 hover:text-[#e4002b] font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Test Order Chime"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
              <span className="hidden sm:inline">Test Sound</span>
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ orderNotificationSound: !settings.orderNotificationSound })}
              className={`p-1 rounded-lg transition ${
                settings.orderNotificationSound !== false ? 'bg-white text-emerald-600 shadow-sm font-bold' : 'text-zinc-400'
              }`}
              title="Toggle Sound Notifications"
            >
              {settings.orderNotificationSound !== false ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Sync Button */}
          <button
            onClick={() => syncStoreToServer()}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50"
            title="Sync all data to customers"
          >
            <Cloud className={`w-3.5 h-3.5 ${serverSyncStatus === 'syncing' ? 'animate-spin text-[#e4002b]' : 'text-emerald-500'}`} />
            <span>{serverSyncStatus === 'syncing' ? 'Syncing...' : 'Synced'}</span>
          </button>

          {/* View Storefront */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-[#e4002b] bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-xl transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Storefront</span>
          </a>

          {/* Logout */}
          <button
            onClick={logoutAdmin}
            className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SELLER APP MAIN LAYOUT: Sidebar + Content */}
      {/* ========================================================================= */}
      <div className="flex-1 flex max-w-full overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-zinc-200 flex flex-col justify-between transition-transform duration-200 shadow-sm ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="p-4 space-y-6 overflow-y-auto">
            
            {/* Quick Status Pill */}
            <div className="p-3 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-[11px] font-bold text-[#e4002b] uppercase tracking-wider">
                Store Operations
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">
                Orders Cutoff: <strong className="text-zinc-900">4:00 PM</strong> · Delivery by: <strong className="text-zinc-900">8:00 PM</strong>
              </p>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrders > 0 ? pendingOrders : undefined },
                { id: 'products', label: 'Products & Menu', icon: UtensilsCrossed },
                { id: 'daily-deals', label: 'Daily 5 Deals (4% OFF)', icon: Flame },
                { id: 'delivery-methods', label: 'Delivery Methods', icon: Truck },
                { id: 'loyalty', label: 'Loyalty & Customers', icon: Award },
                { id: 'discounts', label: 'Discounts & Codes', icon: Tag },
                { id: 'online-store', label: 'Online Store & Sections', icon: Palette },
                { id: 'policies', label: 'Store Policies', icon: FileText },
                { id: 'csv-import', label: 'Shopify CSV Import', icon: FileSpreadsheet },
                { id: 'links', label: 'Share & App Links', icon: Link2 },
                { id: 'settings', label: 'Settings & Logos', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as SellerTab);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#e4002b] text-white shadow-md'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-white text-[#e4002b] text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-zinc-200 text-xs text-zinc-500 space-y-1">
            <p className="font-bold text-zinc-900">KCD Seller v5.0</p>
            <p className="text-[11px]">Phone: +92 325 2777574</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          
          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">
                    Seller Overview
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Live operational metrics for KFC Chakwal Delivery service
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => syncStoreToServer()}
                    className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Customers</span>
                  </button>
                  <button
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-red-950/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm space-y-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Total Sales</span>
                  <p className="text-2xl font-black text-zinc-900 font-mono">{formatPKR(totalRevenue)}</p>
                  <span className="text-[11px] text-emerald-600 font-bold">● {allOrders.length} orders total</span>
                </div>

                <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm space-y-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Pending Orders</span>
                  <p className="text-2xl font-black text-amber-500 font-mono">{pendingOrders}</p>
                  <span className="text-[11px] text-zinc-500">Needs processing</span>
                </div>

                <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm space-y-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Delivered</span>
                  <p className="text-2xl font-black text-emerald-600 font-mono">{deliveredOrders}</p>
                  <span className="text-[11px] text-zinc-500">Completed in Chakwal</span>
                </div>

                <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm space-y-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Registered Customers</span>
                  <p className="text-2xl font-black text-blue-600 font-mono">{customerRecords.length}</p>
                  <span className="text-[11px] text-zinc-500">Loyalty points accounts</span>
                </div>
              </div>

              {/* Quick Links Banner */}
              <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#e4002b]" />
                    <span>Quick Management Links</span>
                  </h3>
                  <p className="text-xs text-zinc-600">
                    Manage your daily 5 meal boxes, delivery rates, or loyalty reward records.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('daily-deals')}
                    className="bg-white text-zinc-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-zinc-300 hover:border-[#e4002b]"
                  >
                    Daily 5 Deals
                  </button>
                  <button
                    onClick={() => setActiveTab('delivery-methods')}
                    className="bg-white text-zinc-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-zinc-300 hover:border-[#e4002b]"
                  >
                    Delivery Methods
                  </button>
                  <button
                    onClick={() => setActiveTab('loyalty')}
                    className="bg-white text-zinc-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-zinc-300 hover:border-[#e4002b]"
                  >
                    Customer Loyalty
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ORDERS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#e4002b]" />
                    <span>Customer Orders ({allOrders.length})</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Track incoming orders, change statuses, and review delivery addresses.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchOrders}
                    className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Orders</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'confirmed', label: 'Confirmed' },
                  { id: 'kitchen', label: 'Kitchen / Cooking' },
                  { id: 'dispatched', label: 'On Bike Rider' },
                  { id: 'delivered', label: 'Delivered' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setOrderStatusFilter(st.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                      orderStatusFilter === st.id
                        ? 'bg-[#e4002b] text-white border-[#e4002b]'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-500">
                    <ShoppingBag className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                    <p className="font-bold text-zinc-800 text-sm">No orders found in this filter</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-zinc-200 p-5 rounded-2xl space-y-4 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#e4002b]">#{order.id}</span>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                              order.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'kitchen' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono">
                              {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-700 font-bold mt-1">
                            Customer: {order.customer.fullName} · <span className="font-mono text-zinc-900">{order.customer.phone}</span>
                          </p>
                          <p className="text-xs text-zinc-500">
                            Delivery Address (Within 3 KM): {order.customer.address}
                          </p>
                        </div>

                        {/* Status Change Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'kitchen')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              order.status === 'kitchen' ? 'bg-amber-500 text-white' : 'border border-amber-300 text-amber-600 hover:bg-amber-50'
                            }`}
                          >
                            Kitchen
                          </button>

                          <button
                            onClick={() => updateOrderStatus(order.id, 'dispatched')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              order.status === 'dispatched' ? 'bg-blue-600 text-white' : 'border border-blue-300 text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            On Bike
                          </button>

                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              order.status === 'delivered' ? 'bg-emerald-600 text-white' : 'border border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            Delivered
                          </button>
                        </div>
                      </div>

                      {/* Items Ordered */}
                      <div className="space-y-1.5 text-xs text-zinc-700">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span>
                              <strong>{item.quantity}x</strong> {item.menuItem.name}
                              {item.options.addons && item.options.addons.length > 0 && (
                                <span className="text-zinc-500 text-[11px] block">
                                  + {item.options.addons.map((a) => a.name).join(', ')}
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-zinc-900 font-bold">{formatPKR(item.unitPrice * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="border-t border-zinc-100 pt-3 flex flex-wrap justify-between items-center text-xs gap-2">
                        <div className="text-zinc-500">
                          Payment: <strong className="text-zinc-800 uppercase">{order.paymentMethod}</strong> · Delivery Fee: {formatPKR(order.deliveryFee)}
                        </div>
                        <span className="text-base font-black text-emerald-600 font-mono">
                          Total: {formatPKR(order.total)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PRODUCTS & MENU CATALOG (FULLY EDITABLE: TITLE, DESC, PRICE, IMAGES) */}
          {/* ========================================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-[#e4002b]" />
                    <span>Product Catalog ({menuItems.length})</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Edit title, descriptions, direct selling prices, strike-through compare prices, and add or remove product images.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-zinc-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by product name..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#e4002b]"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value as any)}
                  className="bg-zinc-50 border border-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                >
                  <option value="all">All Categories ({menuItems.length})</option>
                  {KFC_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((item) => {
                  const effective = calculatePrice(item.baseKfcPrice, item.sellingPrice);
                  const isCustom = item.sellingPrice !== undefined && item.sellingPrice > 0;

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex gap-3">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/src/assets/images/kfc_krunch_burger_1791015834419.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-1 text-[9px] text-zinc-400 text-center font-bold">
                              <span>No Image</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="font-bold text-sm text-zinc-900 truncate">{item.name}</h4>
                          <p className="text-[11px] text-zinc-500 line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="font-mono font-bold text-sm text-[#e4002b]">{formatPKR(effective)}</span>
                            {item.compareAtPrice && (
                              <span className="text-xs text-zinc-400 line-through font-mono">{formatPKR(item.compareAtPrice)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="border-t border-zinc-100 pt-3 flex items-center justify-between gap-2">
                        <button
                          onClick={() => toggleItemAvailability(item.id)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                            item.isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-500'
                          }`}
                        >
                          {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Edit All</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete ${item.name}?`)) deleteMenuItem(item.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: DAILY 5 DEALS (4% OFF) */}
          {/* ========================================================================= */}
          {activeTab === 'daily-deals' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#e4002b]" />
                    <span>Daily 5 Meal Boxes Deal Setting</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Automatically picks 5 meal box items every day and applies a 4% discount for customers.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">Enable Daily 5 Deals Section</h3>
                    <p className="text-xs text-zinc-500">Shows the daily 5 featured meal boxes prominently on customer home page</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dailyDealConfig.enabled}
                    onChange={(e) => updateDailyDealConfig({ enabled: e.target.checked })}
                    className="w-5 h-5 accent-[#e4002b] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-zinc-100">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Section Title</label>
                    <input
                      type="text"
                      value={dailyDealConfig.title}
                      onChange={(e) => updateDailyDealConfig({ title: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Discount Percentage (%)</label>
                    <input
                      type="number"
                      value={dailyDealConfig.discountPercentage}
                      onChange={(e) => updateDailyDealConfig({ discountPercentage: Number(e.target.value) })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-zinc-700 font-bold mb-1">Subtitle / Notice</label>
                    <input
                      type="text"
                      value={dailyDealConfig.subtitle}
                      onChange={(e) => updateDailyDealConfig({ subtitle: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  ✓ Automatically selects 5 meal box specials every day based on the calendar date, applies flat {dailyDealConfig.discountPercentage}% OFF, and lets customers add them directly to bucket!
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: DELIVERY METHODS (Shopify-Style Editable) */}
          {/* ========================================================================= */}
          {activeTab === 'delivery-methods' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#e4002b]" />
                    <span>Delivery Methods & Rates ({deliveryMethods.length})</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Manage delivery options, flat charges, free delivery thresholds, and delivery timeframes. Self pickup has been disabled.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingDeliveryMethod(true)}
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Delivery Method</span>
                </button>
              </div>

              {/* Delivery Methods List */}
              <div className="space-y-3">
                {deliveryMethods.map((method) => (
                  <div
                    key={method.id}
                    className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-900">{method.name}</h4>
                        {method.isDefault && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                        {!method.enabled && (
                          <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">{method.description}</p>
                      <div className="flex items-center gap-3 text-xs pt-1">
                        <span className="font-mono font-bold text-emerald-600">
                          Rate: {method.price === 0 ? 'FREE' : formatPKR(method.price)}
                        </span>
                        {method.minOrderAmount && (
                          <span className="text-zinc-500">
                            (Free on orders Rs. {method.minOrderAmount}+)
                          </span>
                        )}
                        <span className="text-zinc-400">· {method.estimatedTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const updated = deliveryMethods.map((m) =>
                            m.id === method.id ? { ...m, enabled: !m.enabled } : m
                          );
                          updateDeliveryMethods(updated);
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                          method.enabled ? 'bg-zinc-100 text-zinc-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {method.enabled ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        onClick={() => {
                          if (deliveryMethods.length <= 1) {
                            alert('At least one delivery method is required.');
                            return;
                          }
                          const updated = deliveryMethods.filter((m) => m.id !== method.id);
                          updateDeliveryMethods(updated);
                        }}
                        className="text-red-500 hover:text-red-700 p-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: LOYALTY & CUSTOMER RECORDS */}
          {/* ========================================================================= */}
          {activeTab === 'loyalty' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#e4002b]" />
                    <span>Customer Loyalty & Points Manager ({customerRecords.length})</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Rule: Customers earn 10 points per Rs. 300 spent. Min order Rs. 500 to redeem. Not combinable with coupon codes.
                  </p>
                </div>
              </div>

              {/* Policy Summary Card */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs space-y-1 text-amber-900">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Active Loyalty System Rules:</span>
                </p>
                <ul className="list-disc pl-5 text-[11px] space-y-0.5 text-amber-800">
                  <li>Har Rs. 300 ki shopping par customer ko 10 points miltay hain (1 Point = Rs. 1 Flat Discount).</li>
                  <li>Points akele redeem nahi hotay, kam az kam Rs. 500 ki shopping lazmi hai.</li>
                  <li>Loyalty points kisi doosray discount coupon code ke sath combine nahi ho saktay.</li>
                </ul>
              </div>

              {/* Customers Table */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase">
                      <tr>
                        <th className="p-3.5">Customer Name</th>
                        <th className="p-3.5">Phone Number</th>
                        <th className="p-3.5">Orders</th>
                        <th className="p-3.5">Total Spent</th>
                        <th className="p-3.5">Loyalty Points</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {customerRecords.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-zinc-400">
                            No registered customers yet. When customers sign up or order, they appear here.
                          </td>
                        </tr>
                      ) : (
                        customerRecords.map((cust) => (
                          <tr key={cust.id} className="hover:bg-zinc-50">
                            <td className="p-3.5 font-bold text-zinc-900">{cust.fullName}</td>
                            <td className="p-3.5 font-mono text-zinc-700">{cust.phone}</td>
                            <td className="p-3.5">{cust.totalOrdersCount || 0}</td>
                            <td className="p-3.5 font-mono font-bold text-emerald-600">{formatPKR(cust.totalSpent || 0)}</td>
                            <td className="p-3.5 font-mono font-black text-amber-600 text-sm">
                              {cust.loyaltyPoints || 0} pts
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => {
                                  setAdjustingCustomer(cust);
                                  setPointsAdjustmentVal(cust.loyaltyPoints || 0);
                                }}
                                className="bg-zinc-100 hover:bg-[#e4002b] hover:text-white text-zinc-800 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                              >
                                Adjust Points
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: DISCOUNTS */}
          {/* ========================================================================= */}
          {activeTab === 'discounts' && (
            <DiscountsManager />
          )}

          {/* ========================================================================= */}
          {/* TAB 8: ONLINE STORE & SECTIONS */}
          {/* ========================================================================= */}
          {activeTab === 'online-store' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#e4002b]" />
                    <span>Store Sections & Visuals</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Manage announcement banner, fonts, description limits, and custom page sections.
                  </p>
                </div>
              </div>

              {/* Typography */}
              <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#e4002b]" />
                  <span>Typography & Layout Settings</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Headings Font</label>
                    <select
                      value={settings.headingFont || 'Barlow Condensed'}
                      onChange={(e) => updateSettings({ headingFont: e.target.value as any })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Barlow Condensed">Barlow Condensed (Official Bold KFC)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Geometric)</option>
                      <option value="Oswald">Oswald (Tall Impact)</option>
                      <option value="Inter">Inter (Clean UI)</option>
                      <option value="Roboto">Roboto (Classic)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Body Text Font</label>
                    <select
                      value={settings.bodyFont || 'Plus Jakarta Sans'}
                      onChange={(e) => updateSettings({ bodyFont: e.target.value as any })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Barlow Condensed">Barlow Condensed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">
                      Description Limit: {settings.descriptionWordLimit || 25} Words
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={settings.descriptionWordLimit || 25}
                      onChange={(e) => updateSettings({ descriptionWordLimit: Number(e.target.value) })}
                      className="w-full accent-[#e4002b] mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Sections Builder */}
              <PageSectionsBuilder />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: POLICIES */}
          {/* ========================================================================= */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#e4002b]" />
                    <span>Store Policies ({policies.length})</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Manage service statements, cutoff rules, and customer trust guarantees.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingPolicy(true)}
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Policy</span>
                </button>
              </div>

              <div className="space-y-3">
                {policies.map((pol) => (
                  <div key={pol.id} className="bg-white border border-zinc-200 p-5 rounded-2xl space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-zinc-900">{pol.title}</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingPolicy(pol)}
                          className="text-xs text-zinc-600 hover:text-zinc-900 font-bold px-2 py-1 bg-zinc-100 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deletePolicy(pol.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">{pol.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 10: CSV IMPORT/EXPORT */}
          {/* ========================================================================= */}
          {activeTab === 'csv-import' && (
            <CsvProductImporter />
          )}

          {/* ========================================================================= */}
          {/* TAB 11: SHARING & DIRECT LINKS */}
          {/* ========================================================================= */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-200 pb-5">
                <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-[#e4002b]" />
                  <span>App URLs & Links</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Separate links for Customer App and Seller Center.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer App Link */}
                <div className="bg-white border border-zinc-200 p-5 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#e4002b]" />
                    <h4 className="font-bold text-sm text-zinc-900">KFC Chakwal Delivery (Customer App)</h4>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Share this URL with customers on WhatsApp, Facebook, Instagram, and SMS.
                  </p>
                  <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl font-mono text-xs text-zinc-800 break-all select-all">
                    {window.location.origin}/
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + '/');
                      setCopiedLink('customer');
                      setTimeout(() => setCopiedLink(null), 2000);
                    }}
                    className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedLink === 'customer' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink === 'customer' ? 'Copied Link!' : 'Copy Customer Link'}</span>
                  </button>
                </div>

                {/* Seller Center Link */}
                <div className="bg-white border border-zinc-200 p-5 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#e4002b]" />
                    <h4 className="font-bold text-sm text-zinc-900">KCD Seller (Operations Portal)</h4>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Use this link on your phone/laptop to manage orders, products, and rates.
                  </p>
                  <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl font-mono text-xs text-zinc-800 break-all select-all">
                    {window.location.origin}/?app=seller
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + '/?app=seller');
                      setCopiedLink('seller');
                      setTimeout(() => setCopiedLink(null), 2000);
                    }}
                    className="w-full bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition shadow"
                  >
                    {copiedLink === 'seller' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink === 'seller' ? 'Copied Link!' : 'Copy Seller Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 12: SETTINGS & LOGOS */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-200 pb-5">
                <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#e4002b]" />
                  <span>Store Settings & Brand Assets</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Upload your preloader logo, app icon URL, WhatsApp contact, and social links.
                </p>
              </div>

              {/* Logo & App Icon URLs */}
              <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#e4002b]" />
                  <span>Preloader Logo & App Icon URL</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Preloader Screen Logo URL</label>
                    <input
                      type="text"
                      value={settings.customPreloaderLogoUrl || ''}
                      onChange={(e) => updateSettings({ customPreloaderLogoUrl: e.target.value })}
                      placeholder="Paste logo image URL (PNG / JPG)"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#e4002b]"
                    />
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Shows on the initial animated loading screen.
                    </p>
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Custom App Icon URL</label>
                    <input
                      type="text"
                      value={settings.customAppIconUrl || ''}
                      onChange={(e) => updateSettings({ customAppIconUrl: e.target.value })}
                      placeholder="Paste app icon URL (Square 512x512)"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#e4002b]"
                    />
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Used for phone home screen installation icon.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact & Social Links */}
              <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#e4002b]" />
                  <span>Contact Helpline & Social Media</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">WhatsApp Helpline Number</label>
                    <input
                      type="text"
                      value={settings.whatsappNumber}
                      onChange={(e) => updateSettings({ whatsappNumber: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Facebook URL</label>
                    <input
                      type="text"
                      value={settings.socialLinks?.facebook || ''}
                      onChange={(e) => updateSettings({ socialLinks: { ...settings.socialLinks, facebook: e.target.value } })}
                      placeholder="https://facebook.com/..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Instagram URL</label>
                    <input
                      type="text"
                      value={settings.socialLinks?.instagram || ''}
                      onChange={(e) => updateSettings({ socialLinks: { ...settings.socialLinks, instagram: e.target.value } })}
                      placeholder="https://instagram.com/..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">TikTok URL</label>
                    <input
                      type="text"
                      value={settings.socialLinks?.tiktok || ''}
                      onChange={(e) => updateSettings({ socialLinks: { ...settings.socialLinks, tiktok: e.target.value } })}
                      placeholder="https://tiktok.com/@..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* EDIT PRODUCT MODAL (FULLY EDITABLE: TITLE, DESC, PRICE, IMAGES) */}
      {/* ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 text-sm uppercase">
                Edit Product: {editingItem.name}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-zinc-500 hover:text-zinc-900 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold mb-1">Product Title</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Category</label>
                  <select
                    value={editingItem.categoryId}
                    onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value as CategoryId })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2"
                  >
                    {KFC_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Direct Selling Price (PKR)</label>
                  <input
                    type="number"
                    value={editingItem.sellingPrice || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, sellingPrice: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Auto markup if empty"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-emerald-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Base KFC Price (PKR)</label>
                  <input
                    type="number"
                    value={editingItem.baseKfcPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, baseKfcPrice: Number(e.target.value) })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Compare-At Strike Price (PKR)</label>
                  <input
                    type="number"
                    value={editingItem.compareAtPrice || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, compareAtPrice: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g. 1200 (strike through)"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-amber-700"
                  />
                </div>
              </div>

              {/* Product Image Manager: ADD / REMOVE IMAGES */}
              <div className="space-y-2 border border-zinc-200 bg-zinc-50 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="block text-zinc-800 font-bold">
                    Product Image (Add / Remove)
                  </label>
                  {editingItem.image && (
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, image: '' })}
                      className="text-red-600 hover:text-red-700 text-[11px] font-bold underline cursor-pointer"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                {editingItem.image ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={editingItem.image}
                      alt={editingItem.name}
                      className="w-14 h-14 rounded-xl object-cover border border-zinc-300 bg-white"
                      onError={(e) => {
                        e.currentTarget.src = '/src/assets/images/kfc_krunch_burger_1791015834419.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editingItem.image}
                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                        className="w-full bg-white border border-zinc-300 text-xs rounded-xl px-3 py-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-zinc-500 italic">No image currently set. Paste image URL below or select preset:</p>
                    <input
                      type="text"
                      value={editingItem.image}
                      onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                      placeholder="Paste image URL here"
                      className="w-full bg-white border border-zinc-300 text-xs rounded-xl px-3 py-2"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-zinc-500">KFC Presets:</span>
                  {KFC_IMAGE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, image: p.url })}
                      className="bg-white border border-zinc-300 text-[10px] font-bold text-zinc-700 px-2 py-0.5 rounded-lg hover:border-[#e4002b]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="pt-4 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-zinc-600 bg-zinc-100 hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateMenuItem(editingItem);
                    setEditingItem(null);
                  }}
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW PRODUCT MODAL */}
      {/* ========================================================================= */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 text-sm uppercase">Add New Product to Menu</h3>
              <button onClick={() => setIsAddingProduct(false)} className="text-zinc-500 hover:text-zinc-900 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold mb-1">Product Title *</label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Zinger Stacker Combo"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#e4002b]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Category *</label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value as CategoryId)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2"
                  >
                    {KFC_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Base KFC Price (PKR) *</label>
                  <input
                    type="number"
                    value={newProdBasePrice}
                    onChange={(e) => setNewProdBasePrice(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2"
                    required
                  />
                </div>
              </div>

              {/* Product Image Input */}
              <div className="border border-zinc-200 bg-zinc-50 p-3.5 rounded-2xl space-y-2">
                <label className="block text-zinc-800 font-bold">Product Image URL (Optional - Can leave blank)</label>
                <input
                  type="text"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  placeholder="Paste image URL (Leave blank to add image later)"
                  className="w-full bg-white border border-zinc-300 text-xs rounded-xl px-3 py-2"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-zinc-500">Quick presets:</span>
                  {KFC_IMAGE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setNewProdImage(p.url)}
                      className="text-[10px] bg-white border border-zinc-300 text-zinc-700 px-2 py-0.5 rounded hover:border-[#e4002b]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-700 font-bold mb-1">Custom Selling Price (PKR)</label>
                  <input
                    type="number"
                    value={newProdSellingPrice}
                    onChange={(e) => setNewProdSellingPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Blank = auto markup"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-emerald-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-amber-700 font-bold mb-1">Compare-At Strike Price (PKR)</label>
                  <input
                    type="number"
                    value={newProdComparePrice}
                    onChange={(e) => setNewProdComparePrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 1200"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Ingredients and description..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="pt-4 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 bg-zinc-100 hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD DELIVERY METHOD MODAL */}
      {/* ========================================================================= */}
      {isAddingDeliveryMethod && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 text-sm uppercase">Add New Delivery Method</h3>
              <button onClick={() => setIsAddingDeliveryMethod(false)} className="text-zinc-500 hover:text-zinc-900 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDeliveryMethodSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold mb-1">Method Name *</label>
                <input
                  type="text"
                  value={newDmName}
                  onChange={(e) => setNewDmName(e.target.value)}
                  placeholder="e.g. Standard Chakwal Delivery (Within 3 KM)"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    value={newDmPrice}
                    onChange={(e) => setNewDmPrice(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Free on Orders Above (PKR)</label>
                  <input
                    type="number"
                    value={newDmMinOrder}
                    onChange={(e) => setNewDmMinOrder(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 3500 (Blank = no free tier)"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Estimated Delivery Timeframe</label>
                <input
                  type="text"
                  value={newDmTime}
                  onChange={(e) => setNewDmTime(e.target.value)}
                  placeholder="e.g. Delivered by 8:00 PM (Order before 4 PM)"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDmDesc}
                  onChange={(e) => setNewDmDesc(e.target.value)}
                  placeholder="Fresh KFC picked from Kallar Kahar Motorway and delivered hot..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="dm-default-check"
                  checked={newDmDefault}
                  onChange={(e) => setNewDmDefault(e.target.checked)}
                  className="w-4 h-4 accent-[#e4002b]"
                />
                <label htmlFor="dm-default-check" className="text-zinc-800 font-bold">
                  Set as default delivery option for customer checkout
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDeliveryMethod(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 bg-zinc-100 hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#e4002b] hover:bg-[#c30025] text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  Save Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADJUST CUSTOMER LOYALTY POINTS MODAL */}
      {/* ========================================================================= */}
      {adjustingCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">Adjust Loyalty Points</h3>
                <p className="text-xs text-zinc-500">{adjustingCustomer.fullName} ({adjustingCustomer.phone})</p>
              </div>
              <button onClick={() => setAdjustingCustomer(null)} className="text-zinc-400 hover:text-zinc-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold mb-1">New Loyalty Points Balance</label>
                <input
                  type="number"
                  value={pointsAdjustmentVal}
                  onChange={(e) => setPointsAdjustmentVal(Number(e.target.value))}
                  className="w-full bg-zinc-50 border border-zinc-300 text-lg font-mono font-black text-amber-600 rounded-xl px-4 py-2 text-center"
                />
                <p className="text-[11px] text-zinc-400 text-center mt-1">
                  1 Point = Rs. 1 Flat discount value for this customer
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPointsAdjustmentVal(pointsAdjustmentVal + 50)}
                  className="flex-1 bg-amber-50 text-amber-800 border border-amber-200 font-bold py-1.5 rounded-lg"
                >
                  +50 Pts
                </button>
                <button
                  type="button"
                  onClick={() => setPointsAdjustmentVal(pointsAdjustmentVal + 100)}
                  className="flex-1 bg-amber-50 text-amber-800 border border-amber-200 font-bold py-1.5 rounded-lg"
                >
                  +100 Pts
                </button>
                <button
                  type="button"
                  onClick={() => setPointsAdjustmentVal(Math.max(0, pointsAdjustmentVal - 50))}
                  className="flex-1 bg-zinc-100 text-zinc-700 font-bold py-1.5 rounded-lg"
                >
                  -50 Pts
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setAdjustingCustomer(null)}
                className="px-4 py-2 rounded-xl text-zinc-600 bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await updateCustomerPoints(adjustingCustomer.phone || adjustingCustomer.id, pointsAdjustmentVal);
                  setAdjustingCustomer(null);
                }}
                className="bg-[#e4002b] hover:bg-[#c30025] text-white font-bold px-5 py-2 rounded-xl"
              >
                Save Points
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
