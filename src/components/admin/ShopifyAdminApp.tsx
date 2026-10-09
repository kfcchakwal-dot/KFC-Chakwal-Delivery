import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  Calendar,
  TrendingUp,
  BarChart2,
  Download,
  Globe,
  Crown,
  Send,
  UserCheck,
  Printer,
  UploadCloud,
  FolderPlus,
  Boxes,
  CheckCircle2,
  Activity,
  MessageCircle,
  Mail,
  CheckSquare,
  Square,
  Edit3
} from 'lucide-react';
import { DiscountsManager } from './DiscountsManager';
import { PageSectionsBuilder } from '../PageSectionsBuilder';
import { CsvProductImporter } from '../CsvProductImporter';
import { ImageUploadPicker } from '../ImageUploadPicker';
import { CustomDomainManager } from './CustomDomainManager';
import { MetaAdsManager } from './MetaAdsManager';
import { VipClubManager } from './VipClubManager';
import { OrderEditModal } from './OrderEditModal';
import { BulkProductEditor } from './BulkProductEditor';
import { CategoryId, MenuItem, StorePolicy, DeliveryMethod, DailyDealConfig, Category, ProductVariant, Order } from '../../types';
import { KFC_CATEGORIES } from '../../data/kfcMenu';
import { auth, db } from '../../lib/firebase';
import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';

type SellerTab = 
  | 'dashboard'
  | 'orders'
  | 'abandoned'
  | 'products'
  | 'daily-deals'
  | 'customers'
  | 'vip-club'
  | 'marketing'
  | 'meta'
  | 'domains'
  | 'delivery-methods'
  | 'discounts'
  | 'online-store'
  | 'policies'
  | 'reviews'
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
    setReviewVisibility,
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
    updateCustomerRecord,
    serverSyncStatus,
    syncStoreToServer,
    isAdmin,
    loginAdmin,
    logoutAdmin,
    playOrderSound,
    registerAdminPushNotifications,
    goHome,
    liveStats,
    abandonedCheckouts,
    sendAbandonedRecoveryWhatsapp,
    markAbandonedCheckoutRecovered,
    exportCustomersCSV,
    importCustomersCSV,
    marketingCampaigns,
    createMarketingBroadcast,
    sendReviewCollectionWhatsapp,
    createReviewRequest,
    categories,
    addCategory,
  } = useStore();

  const [loginError, setLoginError] = useState('');
  const [adminUsers, setAdminUsers] = useState<Array<{ uid: string; email: string; name?: string; role?: string; active?: boolean }>>([]);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminUid, setNewAdminUid] = useState('');
  const [adminUserBusy, setAdminUserBusy] = useState(false);
  const [adminUserNotice, setAdminUserNotice] = useState('');
  const [activeTab, setActiveTab] = useState<SellerTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<CategoryId | 'all'>('all');

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    getDocs(collection(db, 'reviewRequests')).then((snapshot) => {
      if (!active) return;
      setReviewRequestRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a: any, b: any) => String(b.requestedAt || '').localeCompare(String(a.requestedAt || ''))).slice(0, 50));
    }).catch((error) => console.warn('Review request history load notice:', error));
    return () => { active = false; };
  }, [isAdmin]);

  const loadAdminUsers = async () => {
    try {
      if (!auth.currentUser) return;
      const snapshot = await getDocs(collection(db, 'adminUsers'));
      setAdminUsers(snapshot.docs.map((item) => {
        const data = item.data();
        return {
          uid: item.id,
          email: String(data.email || ''),
          name: String(data.name || ''),
          role: String(data.role || 'admin'),
          active: data.active !== false,
        };
      }));
    } catch (error) {
      console.warn('Admin users load failed:', error);
      setAdminUserNotice('Admin list load nahi hui. Firestore rules aur admin access check karein.');
    }
  };

  const addAdminUserFromPanel = async () => {
    const uid = newAdminUid.trim();
    if (!uid || !newAdminEmail.trim()) {
      setAdminUserNotice('Firebase User UID aur email dono required hain.');
      return;
    }
    if (uid === auth.currentUser?.uid) {
      setAdminUserNotice('Aap pehle se admin hain.');
      return;
    }
    setAdminUserBusy(true);
    setAdminUserNotice('');
    try {
      if (!auth.currentUser) throw new Error('Admin session expired. Dobara sign in karein.');
      await setDoc(doc(db, 'adminUsers', uid), {
        uid,
        email: newAdminEmail.trim().toLowerCase(),
        name: newAdminName.trim(),
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser.uid,
      });
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminUid('');
      setAdminUserNotice(`${newAdminEmail.trim()} ko Admin access de diya gaya.`);
      await loadAdminUsers();
    } catch (error: any) {
      setAdminUserNotice(error?.message || 'Admin user add nahi ho saka.');
    } finally {
      setAdminUserBusy(false);
    }
  };

  const toggleAdminUser = async (uid: string, active: boolean) => {
    try {
      if (!auth.currentUser) throw new Error('Admin session expired.');
      await updateDoc(doc(db, 'adminUsers', uid), { active, updatedAt: new Date().toISOString() });
      await loadAdminUsers();
    } catch (error: any) {
      setAdminUserNotice(error?.message || 'Status update failed.');
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === 'settings') {
      void loadAdminUsers();
    }
  }, [isAdmin, activeTab]);

  // Products sub-tabs inside products section
  const [productSubTab, setProductSubTab] = useState<'catalog' | 'bulk-editor' | 'inventory' | 'collections' | 'bulk-csv' | 'media-pdf' | 'meta-ads'>('catalog');

  // Edit Order modal state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Add Collection Modal state
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColSubtitle, setNewColSubtitle] = useState('');
  const [newColImage, setNewColImage] = useState('/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg');

  // Customer Import / Export ref & state
  const customerCsvInputRef = React.useRef<HTMLInputElement>(null);
  const [customerImportNotice, setCustomerImportNotice] = useState<string | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Bulk Marketing Broadcast state
  const [selectedMarketingCustomerIds, setSelectedMarketingCustomerIds] = useState<string[]>([]);
  const [marketingChannel, setMarketingChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [marketingSubject, setMarketingSubject] = useState('🍗 Exclusive KFC Chakwal Offer!');
  const [marketingMessage, setMarketingMessage] = useState('Assalam o Alaikum {name}! Special crispy KFC meal box deal is now live for Chakwal. Freshly picked from Kallar Kahar Motorway and delivered to your doorstep. Order now on WhatsApp or App!');
  const [marketingStatusMessage, setMarketingStatusMessage] = useState<string | null>(null);

  // New product multiple images, inventory, variants
  const [newProdGallery, setNewProdGallery] = useState<string[]>([]);
  const [newProdTrackInventory, setNewProdTrackInventory] = useState(false);
  const [newProdStockQty, setNewProdStockQty] = useState(50);
  const [newProdHasVariants, setNewProdHasVariants] = useState(false);
  const [newProdVariants, setNewProdVariants] = useState<ProductVariant[]>([]);

  // Product Edit Modal (Fully Editable: Title, Desc, Price, Category, Image, Inventory, Variants)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Synchronize edit modal extended fields when editingItem changes
  useEffect(() => {
    if (editingItem) {
      setNewProdGallery(editingItem.galleryImages || []);
      setNewProdTrackInventory(editingItem.trackInventory || false);
      setNewProdStockQty(editingItem.stockQuantity || 50);
      setNewProdHasVariants(Boolean(editingItem.variants && editingItem.variants.length > 0));
      setNewProdVariants(editingItem.variants || []);
    }
  }, [editingItem]);

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
  const [editingCustomerRecord, setEditingCustomerRecord] = useState<any | null>(null);
  const [adminNotificationStatus, setAdminNotificationStatus] = useState<string>('');
  const [reviewRequestRecords, setReviewRequestRecords] = useState<any[]>([]);
  const [adminVapidKey, setAdminVapidKey] = useState<string>(settings.messagingVapidKey || '');
  useEffect(() => { setAdminVapidKey(settings.messagingVapidKey || ''); }, [settings.messagingVapidKey]);

  const [reviewActionNotice, setReviewActionNotice] = useState<string>('');

  useEffect(() => {
    if (!isAdmin) return;
    const reviewRequestsQuery = query(collection(db, 'reviewRequests'), orderBy('requestedAt', 'desc'));
    const unsubscribe = onSnapshot(reviewRequestsQuery, (snapshot) => {
      setReviewRequestRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => {
      console.warn('Review request history could not load:', error);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  // Policy Form state
  const [editingPolicy, setEditingPolicy] = useState<StorePolicy | null>(null);
  const [newPolicyTitle, setNewPolicyTitle] = useState('');
  const [newPolicyContent, setNewPolicyContent] = useState('');
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);

  const handleSavePolicy = async () => {
    const title = newPolicyTitle.trim();
    const content = newPolicyContent.trim();
    if (!title || !content) {
      alert('Policy title aur content dono required hain.');
      return;
    }
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    try {
      const saved = editingPolicy
        ? await updatePolicy({ ...editingPolicy, title, content, slug: editingPolicy.slug || slug })
        : await addPolicy({ title, content, slug });
      if (!saved) {
        alert('Policy save nahi hui. Admin login aur Firestore Rules check karein, phir dobara try karein.');
        return;
      }
      setEditingPolicy(null);
      setIsAddingPolicy(false);
      setNewPolicyTitle('');
      setNewPolicyContent('');
      alert(editingPolicy ? 'Policy successfully update ho gayi.' : 'New policy successfully add ho gayi.');
    } catch (error: any) {
      alert(error?.message || 'Policy save nahi ho saki.');
    }
  };

  const enableAdminNotifications = async () => {
    if (!('Notification' in window)) {
      setAdminNotificationStatus('Is browser mein notifications supported nahi hain.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setAdminNotificationStatus('Permission allow nahi hui. Browser/site settings mein notifications allow karein.');
        return;
      }
      try {
        await registerAdminPushNotifications();
        setAdminNotificationStatus('Is device ka push token register ho gaya. Background order alerts ke liye Firebase Functions deploy honi chahiye aur isi Firebase project ki VAPID key use karein.');
      } catch (pushError: any) {
        setAdminNotificationStatus(pushError?.message || 'Background push setup incomplete hai. Local notification permission enabled hai.');
      }
    } catch {
      setAdminNotificationStatus('Notification permission request nahi ho saki.');
    }
  };

  // Copied Link feedback
  const [copiedLink, setCopiedLink] = useState<'customer' | 'seller' | null>(null);

  // Date-wise sales report state (Shopify Analytics)
  const [salesDateRange, setSalesDateRange] = useState<'today' | 'yesterday' | '7days' | '30days' | 'month' | 'all' | 'custom'>('7days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [copiedSalesReport, setCopiedSalesReport] = useState(false);

  // =========================================================================
  // LOGIN SCREEN (If not authenticated as seller)
  // =========================================================================
  if (!isAdmin) {
    const handleGoogleAdminLogin = async () => {
      setLoginError('');
      const result = await loginAdmin();
      if (!result.success) setLoginError(result.error || 'Admin access nahi mila.');
    };

    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200 shadow-2xl p-8 space-y-6 text-zinc-900">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-[#e4002b] text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-red-900/30">
              <span className="font-kfc font-black text-2xl tracking-tighter">KCD</span>
            </div>
            <h1 className="font-kfc text-3xl font-black uppercase tracking-tight text-zinc-900">KCD Seller Center</h1>
            <p className="text-xs text-zinc-500">Sirf authorized Google account se access karein.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center">
              {loginError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleAdminLogin}
            className="w-full bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 font-bold text-sm py-3 px-4 rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="font-black text-base">G</span>
            <span>Continue with Google</span>
          </button>

          <p className="text-[11px] text-zinc-400 text-center">
            Admin access sirf Firebase ke <strong>adminUsers</strong> mein authorized Gmail ko milega.
          </p>

          <div className="pt-4 border-t border-zinc-100 text-center">
            <button
              type="button"
              onClick={() => { window.location.href = new URL('/', window.location.origin).toString(); }}
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

  // Dashboard calculations (All Time)
  const totalRevenue = allOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingOrders = allOrders.filter((o) => o.status === 'confirmed' || o.status === 'kitchen').length;
  const deliveredOrders = allOrders.filter((o) => o.status === 'delivered').length;

  // Date-wise Filtering (Shopify Sales Report)
  const now = new Date();
  const filteredOrdersByDate = allOrders.filter((o) => {
    const oDate = new Date(o.date);
    if (salesDateRange === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      return o.date.startsWith(todayStr);
    }
    if (salesDateRange === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      return o.date.startsWith(yStr);
    }
    if (salesDateRange === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return oDate >= sevenDaysAgo;
    }
    if (salesDateRange === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return oDate >= thirtyDaysAgo;
    }
    if (salesDateRange === 'month') {
      return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
    }
    if (salesDateRange === 'custom') {
      if (customStartDate && new Date(customStartDate) > oDate) return false;
      if (customEndDate && new Date(customEndDate + 'T23:59:59') < oDate) return false;
      return true;
    }
    return true; // 'all'
  });

  const rangeNetRevenue = filteredOrdersByDate.reduce((acc, o) => acc + (o.total || 0), 0);
  const rangeGrossSales = filteredOrdersByDate.reduce((acc, o) => acc + (o.subtotal || 0), 0);
  const rangeTotalDiscounts = filteredOrdersByDate.reduce((acc, o) => acc + (o.discount || 0) + (o.loyaltyDiscount || 0), 0);
  const rangeTotalDeliveryFees = filteredOrdersByDate.reduce((acc, o) => acc + (o.deliveryFee || 0), 0);
  const rangeAov = filteredOrdersByDate.length > 0 ? Math.round(rangeNetRevenue / filteredOrdersByDate.length) : 0;

  // Date-wise breakdown table
  interface DateReportItem {
    date: string;
    ordersCount: number;
    grossSales: number;
    discounts: number;
    deliveryFees: number;
    netTotal: number;
  }
  const dateMap = new Map<string, DateReportItem>();
  filteredOrdersByDate.forEach((ord) => {
    const dStr = ord.date.split('T')[0];
    const item = dateMap.get(dStr) || {
      date: dStr,
      ordersCount: 0,
      grossSales: 0,
      discounts: 0,
      deliveryFees: 0,
      netTotal: 0,
    };
    item.ordersCount += 1;
    item.grossSales += ord.subtotal || 0;
    item.discounts += (ord.discount || 0) + (ord.loyaltyDiscount || 0);
    item.deliveryFees += ord.deliveryFee || 0;
    item.netTotal += ord.total || 0;
    dateMap.set(dStr, item);
  });
  const dateReports = Array.from(dateMap.values()).sort((a, b) => b.date.localeCompare(a.date));

  // Top Selling Products in selected date range
  const productCountMap = new Map<string, { id: string; name: string; quantity: number; revenue: number }>();
  filteredOrdersByDate.forEach((ord) => {
    ord.items.forEach((item) => {
      const pid = item.menuItem.id;
      const existing = productCountMap.get(pid) || {
        id: pid,
        name: item.menuItem.name,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += item.unitPrice * item.quantity;
      productCountMap.set(pid, existing);
    });
  });
  const topSellingProducts = Array.from(productCountMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

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
    setNewProdGallery([]);
    setNewProdTrackInventory(false);
    setNewProdStockQty(50);
    setNewProdHasVariants(false);
    setNewProdVariants([]);
  };

  // Handle Add Collection Submit
  const handleAddCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    const slug = newColName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const newCat: Category = {
      id: slug as any,
      name: newColName.trim(),
      subtitle: newColSubtitle.trim() || 'Authentic KFC Chakwal favorites',
      image: newColImage.trim(),
    };
    addCategory(newCat);
    setIsAddingCollection(false);
    setNewColName('');
    setNewColSubtitle('');
  };

  // Products PDF Catalog Download (Print / Save as PDF)
  const handleDownloadPdfCatalog = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate the KFC Menu PDF Catalog.');
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>KFC Chakwal Delivery - Official Products Catalog</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 16px; color: #18181b; }
            .header { text-align: center; border-bottom: 3px solid #e4002b; padding-bottom: 12px; margin-bottom: 20px; }
            .title { color: #e4002b; font-size: 26px; font-weight: 900; text-transform: uppercase; margin: 0; }
            .subtitle { font-size: 13px; color: #3f3f46; margin: 4px 0; }
            .contact { font-size: 11px; font-weight: bold; color: #71717a; }
            .category-section { margin-bottom: 24px; page-break-inside: avoid; }
            .cat-title { color: #e4002b; font-size: 16px; font-weight: 800; text-transform: uppercase; border-bottom: 1.5px solid #f43f5e; padding-bottom: 4px; margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .item-card { border: 1px solid #e4e4e7; border-radius: 8px; padding: 8px; display: flex; gap: 10px; align-items: center; }
            .item-img { width: 50px; height: 50px; border-radius: 6px; object-fit: cover; background: #eee; flex-shrink: 0; }
            .item-info { flex: 1; min-width: 0; }
            .item-name { font-size: 12px; font-weight: bold; margin: 0 0 2px 0; }
            .item-desc { font-size: 10px; color: #71717a; margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .item-price { font-size: 12px; font-weight: 900; color: #e4002b; }
            .footer { margin-top: 25px; border-top: 1px solid #e4e4e7; padding-top: 8px; text-align: center; font-size: 10px; color: #a1a1aa; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">🍗 KFC Chakwal Delivery · Official Menu Catalog</h1>
            <p class="subtitle">Picked fresh from Kallar Kahar Motorway & delivered hot across Chakwal (within 3 KM)</p>
            <p class="contact">Order via WhatsApp: +92 325 2777574 · Same-Day Delivery (Order before 4 PM, Delivered by 8 PM)</p>
          </div>
          ${categories.map(cat => {
            const catItems = menuItems.filter(i => i.categoryId === cat.id);
            if (catItems.length === 0) return '';
            return `
              <div class="category-section">
                <div class="cat-title">${cat.name} (${catItems.length} Items)</div>
                <div class="grid">
                  ${catItems.map(i => `
                    <div class="item-card">
                      <img class="item-img" src="${i.image}" alt="" />
                      <div class="item-info">
                        <p class="item-name">${i.name}</p>
                        <p class="item-desc">${i.description || ''}</p>
                        <p class="item-price">Rs. ${i.sellingPrice || i.baseKfcPrice}</p>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
          <div class="footer">
            KFC Chakwal Delivery Catalog · ${new Date().toLocaleDateString('en-PK')} · 100% Halal Verified Original KFC
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Export Product Images JSON/List
  const handleExportProductImages = () => {
    const imagesData = menuItems.map(m => ({
      name: m.name,
      category: m.categoryId,
      price: m.sellingPrice || m.baseKfcPrice,
      primaryImage: m.image,
      gallery: m.galleryImages || []
    }));
    const blob = new Blob([JSON.stringify(imagesData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kfc_product_images_${Date.now()}.json`;
    link.click();
  };

  // Export Customers to CSV
  const handleExportCustomers = () => {
    const csvContent = exportCustomersCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kfc_chakwal_customers_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Import Customers File
  const handleImportCustomersFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const result = importCustomersCSV(text);
        setCustomerImportNotice(`✓ Successfully imported ${result.imported} customer records!`);
        setTimeout(() => setCustomerImportNotice(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  // Bulk Marketing Send
  const handleSendMarketingBroadcast = () => {
    if (selectedMarketingCustomerIds.length === 0) {
      alert('Please select at least one customer to broadcast message.');
      return;
    }
    const recipients = customerRecords.filter(c => selectedMarketingCustomerIds.includes(c.id));
    createMarketingBroadcast({
      title: marketingSubject,
      message: marketingMessage,
      channel: marketingChannel,
      targetAudience: `${recipients.length} Selected Customers`,
      recipientCount: recipients.length,
    });
    setMarketingStatusMessage(`✓ Broadcast recorded for ${recipients.length} customers! Launching WhatsApp...`);
    setTimeout(() => setMarketingStatusMessage(null), 4000);

    if (recipients[0]?.phone) {
      const cleanPhone = recipients[0].phone.replace(/[^0-9]/g, '');
      const intlPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;
      const personalized = encodeURIComponent(marketingMessage.replace('{name}', recipients[0].fullName));
      window.open(`https://wa.me/${intlPhone}?text=${personalized}`, '_blank');
    }
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
                { id: 'dashboard', label: 'Dashboard & Realtime', icon: LayoutDashboard },
                { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrders > 0 ? pendingOrders : undefined },
                { id: 'abandoned', label: 'Abandoned Checkouts (Manual)', icon: AlertCircle, badge: abandonedCheckouts.filter(a => a.recoveryStatus === 'pending').length > 0 ? abandonedCheckouts.filter(a => a.recoveryStatus === 'pending').length : undefined },
                { id: 'products', label: 'Products & Catalog', icon: UtensilsCrossed },
                { id: 'daily-deals', label: 'Daily 5 Deals (4% OFF)', icon: Flame },
                { id: 'customers', label: 'Customers & Loyalty', icon: Users },
                { id: 'vip-club', label: "Colonel's VIP Club", icon: Crown },
                { id: 'marketing', label: 'WhatsApp Marketing', icon: Send },
                { id: 'meta', label: 'Meta Ads & Catalog', icon: Share2 },
                { id: 'domains', label: 'Connect Custom Domain', icon: Globe },
                { id: 'delivery-methods', label: 'Delivery Methods', icon: Truck },
                { id: 'discounts', label: 'Discounts & Codes', icon: Tag },
                { id: 'online-store', label: 'Online Store & Theme', icon: Palette },
                { id: 'reviews', label: 'Reviews & Auto 12-Hr Flow', icon: Star },
                { id: 'policies', label: 'Store Policies', icon: FileText },
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
          {/* TAB 1: DASHBOARD (Shopify-Style Powerful Date-Wise Sales Analytics) */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Header & Quick Sync */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-[#e4002b]" />
                    <span>Shopify-Style Sales & Operational Analytics</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Date-wise financial reports, order metrics, and menu sales breakdown for KFC Chakwal.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      const reportText = `🍗 KFC CHAKWAL SALES REPORT (${salesDateRange.toUpperCase()})\n` +
                        `Period: ${salesDateRange === 'custom' ? `${customStartDate || 'Start'} to ${customEndDate || 'End'}` : salesDateRange}\n` +
                        `Total Orders: ${filteredOrdersByDate.length}\n` +
                        `Net Revenue: ${formatPKR(rangeNetRevenue)}\n` +
                        `Gross Sales: ${formatPKR(rangeGrossSales)}\n` +
                        `Total Discounts: ${formatPKR(rangeTotalDiscounts)}\n` +
                        `Delivery Fees: ${formatPKR(rangeTotalDeliveryFees)}\n` +
                        `Average Order Value (AOV): ${formatPKR(rangeAov)}\n` +
                        `---------------------------------\n` +
                        `DATE-WISE BREAKDOWN:\n` +
                        dateReports.map(d => `${d.date}: ${d.ordersCount} orders | Net: ${formatPKR(d.netTotal)} | Disc: ${formatPKR(d.discounts)}`).join('\n');
                      navigator.clipboard.writeText(reportText);
                      setCopiedSalesReport(true);
                      setTimeout(() => setCopiedSalesReport(false), 2500);
                    }}
                    className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {copiedSalesReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSalesReport ? 'Report Copied!' : 'Copy Report'}</span>
                  </button>

                  <button
                    onClick={() => syncStoreToServer()}
                    className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Customers</span>
                  </button>

                  <button
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-red-950/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              {/* REAL-TIME LIVE ACTIVITY BAR (Visitors, Open Carts, Checking Out) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Realtime Live Visitors</span>
                    </span>
                    <p className="text-2xl font-black text-emerald-950 font-mono mt-1">{liveStats.activeVisitors} Active</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Customers browsing KFC Chakwal app right now</p>
                  </div>
                  <Activity className="w-8 h-8 text-emerald-600 opacity-80" />
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Active Open Carts</span>
                    </span>
                    <p className="text-2xl font-black text-amber-950 font-mono mt-1">{liveStats.openCartsCount} Buckets</p>
                    <p className="text-[10px] text-amber-700 mt-0.5">Customers with hot meals in cart ({formatPKR(liveStats.openCartsValue)})</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-amber-600 opacity-80" />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Checking Out Now</span>
                    </span>
                    <p className="text-2xl font-black text-blue-950 font-mono mt-1">{liveStats.checkoutsInProgress} People</p>
                    <p className="text-[10px] text-blue-700 mt-0.5">Entering address & selecting payment</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-600 opacity-80" />
                </div>
              </div>

              {/* SHOPIFY-STYLE DATE RANGE FILTER BAR */}
              <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                    <Calendar className="w-4 h-4 text-[#e4002b]" />
                    <span>Select Reporting Date Range:</span>
                  </div>

                  <span className="text-[11px] text-zinc-500 font-medium">
                    Showing <strong>{filteredOrdersByDate.length}</strong> orders in this time period
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { id: 'today', label: 'Today' },
                    { id: 'yesterday', label: 'Yesterday' },
                    { id: '7days', label: 'Last 7 Days' },
                    { id: '30days', label: 'Last 30 Days' },
                    { id: 'month', label: 'This Month' },
                    { id: 'all', label: 'All Time' },
                    { id: 'custom', label: 'Custom Range' },
                  ].map((p) => {
                    const isSelected = salesDateRange === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSalesDateRange(p.id as any)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#e4002b] text-white shadow-sm'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Date Range Selector Inputs */}
                {salesDateRange === 'custom' && (
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">From Date:</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">To Date:</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 5 KEY FINANCIAL PERFORMANCE CARDS (FOR SELECTED PERIOD) */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">Net Sales (PKR)</span>
                  <p className="text-2xl font-black text-zinc-900 font-mono">{formatPKR(rangeNetRevenue)}</p>
                  <span className="text-[10px] text-emerald-600 font-bold">● Total collected</span>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">Total Orders</span>
                  <p className="text-2xl font-black text-blue-600 font-mono">{filteredOrdersByDate.length}</p>
                  <span className="text-[10px] text-zinc-500">In selected period</span>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">Average Order (AOV)</span>
                  <p className="text-2xl font-black text-purple-600 font-mono">{formatPKR(rangeAov)}</p>
                  <span className="text-[10px] text-zinc-500">Average bill value</span>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">Delivery Fees</span>
                  <p className="text-2xl font-black text-amber-600 font-mono">{formatPKR(rangeTotalDeliveryFees)}</p>
                  <span className="text-[10px] text-zinc-500">Riders revenue</span>
                </div>

                <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm space-y-1 col-span-2 lg:col-span-1">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">Discounts Given</span>
                  <p className="text-2xl font-black text-red-600 font-mono">{formatPKR(rangeTotalDiscounts)}</p>
                  <span className="text-[10px] text-zinc-500">Coupons & loyalty points</span>
                </div>
              </div>

              {/* DATE-WISE SALES REPORT TABLE (SHOPIFY POWERFUL REPORT) */}
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden space-y-3 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-[#e4002b]" />
                      <span>Date-Wise Sales Breakdown</span>
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Day-by-day financial performance table with orders, gross sales, discounts, and net bill.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-lg">
                    {dateReports.length} Days Recorded
                  </span>
                </div>

                {dateReports.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">
                    Iss date range mein abhi tak koi order record nahi hai.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Orders</th>
                          <th className="py-2.5 px-3">Gross Sales</th>
                          <th className="py-2.5 px-3">Discounts</th>
                          <th className="py-2.5 px-3">Delivery Fees</th>
                          <th className="py-2.5 px-3 text-right">Net Revenue (PKR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {dateReports.map((report) => (
                          <tr key={report.date} className="hover:bg-zinc-50/80 transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{report.date}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold text-[11px]">
                                {report.ordersCount} orders
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-zinc-700">{formatPKR(report.grossSales)}</td>
                            <td className="py-2.5 px-3 font-mono text-red-600">
                              {report.discounts > 0 ? `-${formatPKR(report.discounts)}` : 'Rs. 0'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-amber-700">{formatPKR(report.deliveryFees)}</td>
                            <td className="py-2.5 px-3 font-mono font-black text-[#e4002b] text-right text-sm">
                              {formatPKR(report.netTotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* TOP SELLING PRODUCTS IN SELECTED PERIOD */}
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Top Selling Menu Items (In Selected Period)</span>
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Most popular meals and combos ordered by Chakwal customers.
                    </p>
                  </div>
                </div>

                {topSellingProducts.length === 0 ? (
                  <div className="text-center py-6 text-zinc-400 text-xs">
                    Selected period mein product sales data available nahi hai.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {topSellingProducts.map((p, rank) => (
                      <div key={p.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-6 h-6 rounded-full bg-[#e4002b] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            #{rank + 1}
                          </span>
                          <span className="font-bold text-zinc-900 truncate">{p.name}</span>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="font-bold text-emerald-600 block">{p.quantity} units</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{formatPKR(p.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Management Links Banner */}
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
                    onClick={() => setActiveTab('customers')}
                    className="bg-white text-zinc-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-zinc-300 hover:border-[#e4002b]"
                  >
                    Customer Loyalty & Records
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

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 mb-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">Firebase Web Push public key (VAPID)</label>
                    <input type="text" value={adminVapidKey} onChange={(e) => setAdminVapidKey(e.target.value)} placeholder="Firebase Console se public key paste karein" className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs" autoComplete="off" />
                    <p className="text-[10px] text-zinc-500 mt-1">Firebase Console → Project settings → Cloud Messaging → Web Push certificates. Ye public key hai, private key nahi.</p>
                  </div>
                  <div className="flex items-end">
                    <button type="button" onClick={() => { if (!adminVapidKey.trim()) { setAdminNotificationStatus('Pehle Firebase Console se VAPID public key paste karein.'); return; } updateSettings({ messagingVapidKey: adminVapidKey.trim() }); setAdminNotificationStatus('VAPID public key save kar di. Ab Enable This Device Notifications dabayein.'); }} className="w-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 text-xs font-bold px-3 py-2 rounded-xl">Save Push Key</button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={enableAdminNotifications}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Enable This Device Notifications</span>
                  </button>
                  <button
                    onClick={fetchOrders}
                    className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Orders</span>
                  </button>
                </div>
                {adminNotificationStatus && <p className="text-xs text-zinc-500 mt-2">{adminNotificationStatus}</p>}
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

                        {/* Status Change Buttons & Order Edit */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingOrder(order)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 flex items-center gap-1.5 shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#e4002b]" />
                            <span>Edit Order</span>
                          </button>

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
          {/* TAB: ABANDONED CHECKOUTS & MANUAL RECOVERY */}
          {/* ========================================================================= */}
          {activeTab === 'abandoned' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#e4002b]" />
                    <span>Abandoned Checkouts & Manual Recovery ({abandonedCheckouts.length})</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Customers who added meals to bucket or entered address but dropped off. Manual WhatsApp recovery is available; automatic 10-minute recovery requires a server scheduler. Send recovery WhatsApp within 10 minutes to recover the order.
                  </p>
                </div>
              </div>

              {/* Status Alert Banner */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-900">
                      10-Minute Recovery Engine Active
                    </p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Abandoned carts within 10 minutes have an 85% conversion recovery rate when pinged with personalized bucket details.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-amber-800 text-sm">
                    {abandonedCheckouts.filter(a => a.recoveryStatus === 'pending').length} Pending Recovery
                  </span>
                </div>
              </div>

              {/* Abandoned Checkouts Table */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase">
                      <tr>
                        <th className="p-3.5">Customer & Phone</th>
                        <th className="p-3.5">Address</th>
                        <th className="p-3.5">Bucket Items</th>
                        <th className="p-3.5">Cart Total</th>
                        <th className="p-3.5">Time Dropped</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {abandonedCheckouts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-zinc-400">
                            No abandoned checkouts right now. When customers leave items in bucket, they appear here.
                          </td>
                        </tr>
                      ) : (
                        abandonedCheckouts.map((ab) => (
                          <tr key={ab.id} className="hover:bg-zinc-50">
                            <td className="p-3.5 font-bold text-zinc-900">
                              <div>{ab.customerName}</div>
                              <div className="font-mono text-zinc-500 text-[11px] font-normal">{ab.phone}</div>
                            </td>
                            <td className="p-3.5 text-zinc-600 max-w-xs truncate">{ab.address || 'Chakwal'}</td>
                            <td className="p-3.5 text-zinc-700">
                              {ab.items && ab.items.length > 0
                                ? ab.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')
                                : 'KFC Meal Box'}
                            </td>
                            <td className="p-3.5 font-mono font-bold text-[#e4002b] text-sm">
                              {formatPKR(ab.cartTotal)}
                            </td>
                            <td className="p-3.5 text-zinc-500 font-mono text-[11px]">
                              {new Date(ab.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3.5">
                              {ab.recoveryStatus === 'recovered' ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  ✓ Recovered
                                </span>
                              ) : ab.recoveryStatus === 'message_sent' ? (
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Message Sent
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                  Pending Recovery
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => sendAbandonedRecoveryWhatsapp(ab)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                                title="Send WhatsApp Recovery Message"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Recover via WhatsApp</span>
                              </button>
                              {ab.recoveryStatus !== 'recovered' && (
                                <button
                                  type="button"
                                  onClick={() => markAbandonedCheckoutRecovered(ab.id)}
                                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                                >
                                  Mark Won
                                </button>
                              )}
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
          {/* TAB 3: UNIFIED PRODUCTS CENTER (ALL TOOLS DIRECTLY INSIDE PRODUCTS TAB) */}
          {/* ========================================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Products Center Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-[#e4002b]" />
                    <span>Unified Products Center ({menuItems.length} Products)</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Manage catalog, flexible inventory tracking, add collections, bulk CSV upload/export, printable PDF catalog, and Meta Ads.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                  <button
                    onClick={() => setIsAddingCollection(true)}
                    className="bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                  >
                    <FolderPlus className="w-4 h-4 text-amber-400" />
                    <span>Add Collection</span>
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Pills Inside Products Section */}
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-zinc-100 rounded-2xl border border-zinc-200 text-xs font-bold">
                {[
                  { id: 'catalog', label: 'All Products', icon: UtensilsCrossed, count: menuItems.length },
                  { id: 'bulk-editor', label: 'Bulk Quick Editor', icon: Sparkles },
                  { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
                  { id: 'collections', label: 'Collections', icon: FolderPlus, count: categories.length },
                  { id: 'bulk-csv', label: 'Bulk CSV & Upload', icon: FileSpreadsheet },
                  { id: 'media-pdf', label: 'PDF Catalog & Media', icon: Printer },
                  { id: 'meta-ads', label: 'Facebook & Meta Ads', icon: Share2 },
                ].map((st) => {
                  const Icon = st.icon;
                  const isActive = productSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setProductSubTab(st.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                        isActive
                          ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80 font-black'
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#e4002b]' : 'text-zinc-500'}`} />
                      <span>{st.label}</span>
                      {st.count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-[#e4002b] text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                          {st.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SUBTAB 1: ALL PRODUCTS CATALOG */}
              {productSubTab === 'catalog' && (
                <div className="space-y-4">
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
                      {categories.map((c) => (
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
                              {item.galleryImages && item.galleryImages.length > 0 && (
                                <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1 rounded">
                                  +{item.galleryImages.length}
                                </span>
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
                              {item.trackInventory && (
                                <p className="text-[10px] text-zinc-400 font-mono">
                                  Stock: <strong className={Number(item.stockQuantity) <= 5 ? 'text-amber-600' : 'text-emerald-600'}>{item.stockQuantity || 0} pcs</strong>
                                </p>
                              )}
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

              {/* SUBTAB 2: INVENTORY & STOCK MANAGEMENT */}
              {productSubTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-[#e4002b]" />
                        <span>Inventory & Quantity Tracker</span>
                      </h3>
                      <p className="text-zinc-500 text-[11px] mt-0.5">
                        Track stock levels, configure low-stock warnings, and toggle flexible tracking per product.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          menuItems.forEach(i => {
                            if (!i.isAvailable) toggleItemAvailability(i.id);
                          });
                        }}
                        className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
                      >
                        ✓ Mark All In-Stock
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase">
                          <tr>
                            <th className="p-3.5">Product</th>
                            <th className="p-3.5">Category</th>
                            <th className="p-3.5">Track Inventory</th>
                            <th className="p-3.5">Available Stock</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {menuItems.map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-50">
                              <td className="p-3.5">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={item.image}
                                    alt=""
                                    className="w-10 h-10 rounded-lg object-cover bg-zinc-100 shrink-0"
                                    onError={(e) => {
                                      e.currentTarget.src = '/src/assets/images/kfc_krunch_burger_1791015834419.jpg';
                                    }}
                                  />
                                  <div>
                                    <p className="font-bold text-zinc-900">{item.name}</p>
                                    <p className="font-mono text-[#e4002b] text-[11px] font-bold">
                                      {formatPKR(calculatePrice(item.baseKfcPrice, item.sellingPrice))}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5 text-zinc-600 capitalize">
                                {item.categoryId.replace('-', ' ')}
                              </td>
                              <td className="p-3.5">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={item.trackInventory ?? false}
                                    onChange={(e) => {
                                      updateMenuItem({ ...item, trackInventory: e.target.checked });
                                    }}
                                    className="w-4 h-4 accent-[#e4002b]"
                                  />
                                  <span className="text-[11px] font-medium text-zinc-600">
                                    {item.trackInventory ? 'Tracking ON' : 'Un-tracked'}
                                  </span>
                                </label>
                              </td>
                              <td className="p-3.5">
                                {item.trackInventory ? (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const cur = Math.max(0, (item.stockQuantity || 0) - 5);
                                        updateMenuItem({ ...item, stockQuantity: cur });
                                      }}
                                      className="w-6 h-6 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold flex items-center justify-center cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      value={item.stockQuantity ?? 50}
                                      onChange={(e) => {
                                        updateMenuItem({ ...item, stockQuantity: Number(e.target.value) });
                                      }}
                                      className="w-16 bg-zinc-50 border border-zinc-200 rounded px-2 py-1 font-mono text-center font-bold"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const cur = (item.stockQuantity || 0) + 5;
                                        updateMenuItem({ ...item, stockQuantity: cur });
                                      }}
                                      className="w-6 h-6 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold flex items-center justify-center cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-zinc-400 font-mono">Unlimited</span>
                                )}
                              </td>
                              <td className="p-3.5">
                                {!item.isAvailable ? (
                                  <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Out of Stock
                                  </span>
                                ) : item.trackInventory && Number(item.stockQuantity) <= 5 ? (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                    Low Stock ({item.stockQuantity})
                                  </span>
                                ) : (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    In Stock
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => toggleItemAvailability(item.id)}
                                  className="text-xs text-[#e4002b] font-bold hover:underline cursor-pointer"
                                >
                                  {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: COLLECTIONS / CATEGORIES MANAGEMENT */}
              {productSubTab === 'collections' && (
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                        <FolderPlus className="w-4 h-4 text-[#e4002b]" />
                        <span>KFC Menu Collections ({categories.length})</span>
                      </h3>
                      <p className="text-zinc-500 text-[11px] mt-0.5">
                        Group your KFC items into dedicated meal boxes, combos, everyday value, and family buckets.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingCollection(true)}
                      className="bg-[#e4002b] hover:bg-[#c30025] text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Collection</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((c) => {
                      const count = menuItems.filter(m => m.categoryId === c.id).length;
                      return (
                        <div key={c.id} className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#e4002b] flex items-center justify-center font-bold text-lg border border-red-100">
                              🍗
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-sm text-zinc-900 truncate">{c.name}</h4>
                              <p className="text-[11px] text-zinc-500 truncate">{c.subtitle}</p>
                              <p className="text-[10px] font-mono text-[#e4002b] font-bold mt-0.5">{count} Items in Collection</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUBTAB: BULK QUICK IN-LINE EDITOR */}
              {productSubTab === 'bulk-editor' && (
                <div className="space-y-4">
                  <BulkProductEditor />
                </div>
              )}

              {/* SUBTAB 4: BULK CSV UPLOAD & IMPORT */}
              {productSubTab === 'bulk-csv' && (
                <div className="space-y-4">
                  <CsvProductImporter />
                </div>
              )}

              {/* SUBTAB 5: MEDIA & PRODUCTS PDF CATALOG DOWNLOAD */}
              {productSubTab === 'media-pdf' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* PDF Catalog Card */}
                    <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#e4002b] flex items-center justify-center border border-red-100 shadow-sm">
                        <Printer className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-zinc-900">
                          Products PDF Catalog Download
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                          Download or print a beautiful, branded KFC Menu PDF Catalog with photos, authentic descriptions, prices, and Chakwal express delivery contact details.
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleDownloadPdfCatalog}
                          className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold uppercase px-5 py-3 rounded-xl flex items-center gap-2 shadow-md cursor-pointer active:scale-95 transition"
                        >
                          <Download className="w-4 h-4 stroke-[2.5]" />
                          <span>Download KFC Menu PDF Catalog</span>
                        </button>
                      </div>
                    </div>

                    {/* Export Product Images Card */}
                    <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-zinc-900">
                          Export Product Images & Gallery
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                          Export structured JSON data containing all {menuItems.length} product photos, gallery image URLs, and product names for marketing and offline backup.
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleExportProductImages}
                          className="bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-bold uppercase px-5 py-3 rounded-xl flex items-center gap-2 shadow-md cursor-pointer active:scale-95 transition"
                        >
                          <Download className="w-4 h-4 stroke-[2.5]" />
                          <span>Export All Product Images (JSON)</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* SUBTAB 6: FACEBOOK, INSTAGRAM & META ADS */}
              {productSubTab === 'meta-ads' && (
                <div className="space-y-4">
                  <MetaAdsManager />
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: DAILY 5 DEALS (COLLECTION OR RANDOM AT 12:00 AM MIDNIGHT) */}
          {/* ========================================================================= */}
          {activeTab === 'daily-deals' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#e4002b]" />
                    <span>Daily 5 Deals Setting (Auto Midnight 12:00 AM Offer)</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Select Collection ya Random products jin par automatically har roz rat ko 12:00 baje {dailyDealConfig.discountPercentage || 4}% offer lagti rahay gi.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">Enable Daily 5 Deals Section</h3>
                    <p className="text-xs text-zinc-500">Shows the daily 5 featured deals prominently on customer home page</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dailyDealConfig.enabled}
                    onChange={(e) => updateDailyDealConfig({ enabled: e.target.checked })}
                    className="w-5 h-5 accent-[#e4002b] cursor-pointer"
                  />
                </div>

                {/* Offer Selection Mode: Random vs Specific Collection vs Manual */}
                <div className="pt-4 border-t border-zinc-100 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Product Selection Mode (Rat 12:00 Baje Ki Offer Ke Liye):
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Option 1: Random Products */}
                    <button
                      type="button"
                      onClick={() => updateDailyDealConfig({ selectionMode: 'random' })}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                        (dailyDealConfig.selectionMode === 'random' || !dailyDealConfig.selectionMode)
                          ? 'border-[#e4002b] bg-red-50/70 text-zinc-900 font-bold shadow-xs'
                          : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#e4002b]">🎲 Random Products</span>
                        {(dailyDealConfig.selectionMode === 'random' || !dailyDealConfig.selectionMode) && (
                          <Check className="w-4 h-4 text-[#e4002b]" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-normal leading-relaxed">
                        Pure KFC menu aur meal boxes se rat 12 baje automatically 5 random deals rotate hoti rahengi.
                      </p>
                    </button>

                    {/* Option 2: Specific Collection */}
                    <button
                      type="button"
                      onClick={() => updateDailyDealConfig({ selectionMode: 'collection', collectionCategory: dailyDealConfig.collectionCategory || 'everyday-value' })}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                        dailyDealConfig.selectionMode === 'collection'
                          ? 'border-[#e4002b] bg-red-50/70 text-zinc-900 font-bold shadow-xs'
                          : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#e4002b]">📂 Specific Collection</span>
                        {dailyDealConfig.selectionMode === 'collection' && (
                          <Check className="w-4 h-4 text-[#e4002b]" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-normal leading-relaxed">
                        Aapki chuni hui category (e.g. Everyday Value) se rat 12 baje automatically deals lagti rahengi.
                      </p>
                    </button>

                    {/* Option 3: Manual Selection */}
                    <button
                      type="button"
                      onClick={() => updateDailyDealConfig({ selectionMode: 'manual' })}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                        dailyDealConfig.selectionMode === 'manual'
                          ? 'border-[#e4002b] bg-red-50/70 text-zinc-900 font-bold shadow-xs'
                          : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#e4002b]">🎯 Manual Selection</span>
                        {dailyDealConfig.selectionMode === 'manual' && (
                          <Check className="w-4 h-4 text-[#e4002b]" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-normal leading-relaxed">
                        Aap khud apni pasand ke exact 5 products select kar sakte hain.
                      </p>
                    </button>
                  </div>
                </div>

                {/* If Collection is chosen: Show category selector */}
                {dailyDealConfig.selectionMode === 'collection' && (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 text-xs">
                    <label className="block font-bold text-zinc-700">
                      Select Collection / Category:
                    </label>
                    <select
                      value={dailyDealConfig.collectionCategory || 'everyday-value'}
                      onChange={(e) => updateDailyDealConfig({ collectionCategory: e.target.value as CategoryId })}
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#e4002b]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({menuItems.filter(m => m.categoryId === c.id).length} products)
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-zinc-500">
                      Iss category ke products mein se har roz raat 12:00 AM par automatically 5 featured offers chun kar 4% discount ke sath show honge.
                    </p>
                  </div>
                )}

                {/* If Manual is chosen: Product Multi-Selector */}
                {dailyDealConfig.selectionMode === 'manual' && (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-zinc-700">
                        Pick Products for Daily Deals (Selected: {(dailyDealConfig.selectedProductIds || []).length} items):
                      </label>
                      <span className="text-[11px] text-[#e4002b] font-bold">
                        Recommendation: 5 products
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 bg-white border border-zinc-200 rounded-xl">
                      {menuItems.map((item) => {
                        const isSelected = (dailyDealConfig.selectedProductIds || []).includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const current = dailyDealConfig.selectedProductIds || [];
                              const next = isSelected
                                ? current.filter((id) => id !== item.id)
                                : [...current, item.id];
                              updateDailyDealConfig({ selectedProductIds: next });
                            }}
                            className={`p-2 rounded-lg text-left text-xs border flex items-center justify-between gap-1.5 cursor-pointer transition ${
                              isSelected
                                ? 'bg-red-50 border-[#e4002b] text-[#e4002b] font-bold'
                                : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                            }`}
                          >
                            <span className="truncate">{item.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#e4002b] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Midnight Rotation & Settings Fields */}
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

                {/* Automatic Midnight Guarantee Banner */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <Clock className="w-4 h-4" />
                    <span>Automatic Rat 12:00 AM Midnight Auto-Rotate System Active</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-800">
                    Chakwal customers ke liye har roz raat 12:00 AM (00:00 midnight) par automatically system nayi 5 deals schedule aur publish karta rahay ga. Aapko daily manual update karne ki zaroorat nahi!
                  </p>
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
          {/* TAB 6: CUSTOMER RECORDS & LOYALTY */}
          {/* ========================================================================= */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#e4002b]" />
                    <span>Customer Loyalty & Records Manager ({customerRecords.length})</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Rule: Customers earn 10 points per Rs. 300 spent. Min order Rs. 500 to redeem. Not combinable with coupon codes.
                  </p>
                </div>

                {/* Import / Export Buttons */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={customerCsvInputRef}
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content) {
                          const res = importCustomersCSV(content);
                          alert(`Imported ${res.imported} customers successfully! (${res.errors} skipped/errors)`);
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => customerCsvInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-zinc-600" />
                    <span>Import Shopify/Excel CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const csv = exportCustomersCSV();
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `kfc_chakwal_customers_${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Export Customers CSV</span>
                  </button>
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

              {/* Customer search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="search"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  placeholder="Search customer name, email, phone or address..."
                  className="w-full sm:max-w-md bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900"
                />
                <p className="text-xs text-zinc-500 self-center">{customerRecords.filter((c) => [c.fullName, c.email, c.phone, c.address].some((v) => String(v || '').toLowerCase().includes(customerSearchQuery.toLowerCase()))).length} customers</p>
              </div>

              {/* Customers Table */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase">
                      <tr>
                        <th className="p-3.5">Customer Details</th>
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
                        customerRecords.filter((c) => [c.fullName, c.email, c.phone, c.address].some((v) => String(v || '').toLowerCase().includes(customerSearchQuery.toLowerCase()))).map((cust) => (
                          <tr key={cust.id} className="hover:bg-zinc-50">
                            <td className="p-3.5">
                              <div className="font-bold text-zinc-900">{cust.fullName || 'Customer'}</div>
                              <div className="text-[11px] text-zinc-500 break-all">{cust.email || 'No email saved'}</div>
                              <div className="text-[11px] text-zinc-500 max-w-[240px] truncate">{cust.address || 'No shipping address saved'}</div>
                            </td>
                            <td className="p-3.5 font-mono text-zinc-700">{cust.phone}</td>
                            <td className="p-3.5">{cust.totalOrdersCount || 0}</td>
                            <td className="p-3.5 font-mono font-bold text-emerald-600">{formatPKR(cust.totalSpent || 0)}</td>
                            <td className="p-3.5 font-mono font-black text-amber-600 text-sm">
                              {cust.loyaltyPoints || 0} pts
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex flex-col sm:flex-row justify-end gap-2">
                                <button
                                  onClick={() => setEditingCustomerRecord({ ...cust, address: cust.address || '' })}
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                >
                                  View / Edit Details
                                </button>
                                <button
                                  onClick={() => {
                                    setAdjustingCustomer(cust);
                                    setPointsAdjustmentVal(cust.loyaltyPoints || 0);
                                  }}
                                  className="bg-zinc-100 hover:bg-[#e4002b] hover:text-white text-zinc-800 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                >
                                  Adjust Points
                                </button>
                              </div>
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
          {/* TAB: VIP CLUB */}
          {/* ========================================================================= */}
          {activeTab === 'vip-club' && (
            <VipClubManager />
          )}

          {/* ========================================================================= */}
          {/* TAB: META ADS & CATALOG */}
          {/* ========================================================================= */}
          {activeTab === 'meta' && (
            <MetaAdsManager />
          )}

          {/* ========================================================================= */}
          {/* TAB: CUSTOM DOMAIN */}
          {/* ========================================================================= */}
          {activeTab === 'domains' && (
            <CustomDomainManager />
          )}

          {/* ========================================================================= */}
          {/* TAB: WHATSAPP MARKETING */}
          {/* ========================================================================= */}
          {activeTab === 'marketing' && (
            <div className="space-y-6 max-w-5xl">
              <div className="border-b border-zinc-200 pb-5">
                <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">WhatsApp Marketing</h2>
                <p className="text-xs text-zinc-500 mt-1">Campaign history is shown below. Automatic WhatsApp sending requires the WhatsApp Business Cloud API configuration.</p>
              </div>
              <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50 text-amber-800 text-sm">
                <strong>Free WhatsApp mode:</strong> WhatsApp Business API ki zaroorat nahi. Neeche diye gaye button se customer ki WhatsApp chat pre-filled message ke saath open hogi. Official WhatsApp Click-to-Chat links mobile aur WhatsApp Web dono par kaam karte hain.
              </div>
              <a
                href="https://wa.me/923252777574?text=Assalam%20o%20Alaikum%2C%20KFC%20Chakwal%20Delivery%20se%20order%20ya%20marketing%20campaign%20ke%20baray%20mein%20rabta%20karna%20hai."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow-sm"
              >
                Open KFC WhatsApp
              </a>
              <div className="space-y-3">
                {marketingCampaigns.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-zinc-300 text-center text-sm text-zinc-500">Abhi koi marketing campaign record nahi hai.</div>
                ) : marketingCampaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 rounded-2xl border border-zinc-200 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-zinc-900">{campaign.title}</h3>
                        <p className="text-xs text-zinc-500 mt-1">{campaign.message}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg bg-zinc-100 text-zinc-600">{campaign.channel}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-3">{new Date(campaign.sentAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: REVIEWS & AUTO 12-HOUR FLOW */}
          {/* ========================================================================= */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-5xl">
              <div className="border-b border-zinc-200 pb-5">
                <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Reviews & Auto 12-Hour Flow</h2>
                <p className="text-xs text-zinc-500 mt-1">Customer reviews can be submitted without OTP. Review visibility is controlled below; automatic WhatsApp requests run after the Firebase Functions scheduler is deployed and WhatsApp API credentials are configured.</p>
              </div>
              <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 text-sm space-y-1">
                <strong>Server-side review automation</strong>
                <p className="text-xs">Function har 15 minute delivered orders check karti hai aur configured delay ke baad review request queue karti hai. WhatsApp auto-send ke liye Meta WhatsApp Cloud API access token, phone-number ID, aur approved template name/language Firebase Functions ke environment mein set hona zaroori hai. Credentials ke baghair request history mein “pending config” nazar aayega; message automatically sent nahi mana jayega.</p>
              </div>
              {reviewActionNotice && <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs">{reviewActionNotice}</div>}
              <div className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-3">
                <p className="text-sm font-bold text-zinc-900">Product Reviews ({reviews.length})</p>
                {reviews.length === 0 ? <p className="text-xs text-zinc-500">Abhi koi review nahi aaya.</p> : reviews.map((review) => (
                  <div key={review.id} className="border border-zinc-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-zinc-900">{review.customerName} · {'★'.repeat(Math.max(0, Math.min(5, review.rating)))}</div>
                      <div className="text-xs text-zinc-500">{menuItems.find((item) => item.id === review.productId)?.name || review.productId} · {review.date ? new Date(review.date).toLocaleDateString() : ''}</div>
                      <p className="text-sm text-zinc-700 mt-1 whitespace-pre-wrap">{review.comment}</p>
                      <span className={`inline-block mt-2 text-[10px] font-bold uppercase rounded-full px-2 py-1 ${review.isVisible === false ? 'bg-zinc-100 text-zinc-500' : 'bg-emerald-50 text-emerald-700'}`}>{review.isVisible === false ? 'Hidden from storefront' : 'Visible on storefront'}</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button type="button" onClick={async () => { try { await setReviewVisibility(review.id, review.isVisible === false); setReviewActionNotice(review.isVisible === false ? 'Review storefront par show ho raha hai.' : 'Review storefront se hide kar diya gaya.'); } catch (e: any) { setReviewActionNotice(e?.message || 'Review visibility update failed.'); } }} className="text-xs font-bold px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">{review.isVisible === false ? 'Show' : 'Hide'}</button>
                      <button type="button" onClick={async () => { if (!window.confirm('Is review ko permanently remove karna hai?')) return; try { await deleteReview(review.id); setReviewActionNotice('Review delete kar diya gaya.'); } catch (e: any) { setReviewActionNotice(e?.message || 'Review delete nahi hua.'); } }} className="text-xs font-bold px-3 py-2 bg-red-50 text-red-700 rounded-lg">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-3">
                <h3 className="text-sm font-bold text-zinc-900">Review Requests for Delivered Orders</h3>
                <p className="text-xs text-zinc-500">Delivered orders par WhatsApp review request manually bhejein.</p>
                {allOrders.filter((order) => order.status === 'delivered' && order.customer?.phone && Boolean((order.customer as any)?.uid)).slice(0, 20).map((order) => {
                  const rawPhone = String(order.customer.phone || '').replace(/[^0-9]/g, '');
                  const phone = rawPhone.startsWith('92') ? rawPhone : rawPhone.startsWith('0') ? '92' + rawPhone.slice(1) : '92' + rawPhone;
                  const firstItem = order.items?.[0]?.menuItem;
                  const reviewUrl = firstItem?.id ? `${window.location.origin}/?product=${encodeURIComponent(firstItem.id)}` : window.location.origin;
                  const message = `Assalam o Alaikum ${order.customer.fullName || 'Customer'}! Aap ke KFC Chakwal Delivery order #${order.id} ke liye shukriya. Meherbani karke apna review share karein: ${reviewUrl}`;
                  return <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 py-2"><div><div className="text-xs font-bold text-zinc-900">#{order.id} · {order.customer.fullName}</div><div className="text-[11px] text-zinc-500">{order.customer.phone} · {new Date(order.date).toLocaleDateString()}</div></div><button type="button" onClick={async () => { const whatsappWindow = window.open('about:blank', '_blank'); try { await createReviewRequest(order, reviewUrl); setReviewRequestRecords((previous) => [{ id: order.id, orderId: order.id, customerName: order.customer.fullName || 'Customer', phone: order.customer.phone, reviewUrl, status: 'opened_whatsapp', requestedAt: new Date().toISOString() }, ...previous.filter((item) => item.id !== order.id)].slice(0, 50)); const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`; if (whatsappWindow) whatsappWindow.location.href = whatsappUrl; else window.location.href = whatsappUrl; } catch (error: any) { whatsappWindow?.close(); alert(error?.message || 'Review request record save nahi hua. Firestore Rules publish karein aur dobara try karein.'); } }} className="inline-flex justify-center bg-[#25D366] text-white font-bold text-xs px-3 py-2 rounded-lg">Send Review Request</button></div>;
                })}
                {allOrders.filter((order) => order.status === 'delivered' && order.customer?.phone && Boolean((order.customer as any)?.uid)).length === 0 && <p className="py-4 text-xs text-zinc-500">Abhi kisi registered customer ka delivered order review request ke liye available nahi.</p>}
              </div>
              <div className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-3">
                <h3 className="text-sm font-bold text-zinc-900">Review Request History ({reviewRequestRecords.length})</h3>
                {reviewRequestRecords.length === 0 ? <p className="text-xs text-zinc-500">Abhi koi review request record nahi hai.</p> : reviewRequestRecords.slice(0, 20).map((request) => (
                  <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 py-2">
                    <div><div className="text-xs font-bold text-zinc-900">Order #{request.orderId} · {request.customerName}</div><div className="text-[11px] text-zinc-500">{request.phone} · {request.requestedAt ? new Date(request.requestedAt).toLocaleString() : ''}</div></div>
                    <span className={`text-[10px] font-bold rounded-full px-2 py-1 ${request.status === 'sent' ? 'bg-emerald-50 text-emerald-700' : request.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>{String(request.status || 'sent').replace(/_/g, ' ')} · WhatsApp</span>
                  </div>
                ))}
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
                  <Palette className="w-4 h-4 text-[#e4002b]" />
                  <span>Theme Color Scheme</span>
                </h3>
                <p className="text-xs text-zinc-500">Primary aur secondary colors choose karein. Settings save hoti hain aur supported brand buttons/labels par apply hoti hain.</p>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-700">Primary <input type="color" aria-label="Store primary color" value={settings.primaryColor || '#e4002b'} onChange={(e) => updateSettings({ primaryColor: e.target.value })} className="w-12 h-10 rounded-lg border border-zinc-200 cursor-pointer bg-white p-1" /></label>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-700">Secondary <input type="color" aria-label="Store secondary color" value={settings.secondaryColor || '#c30025'} onChange={(e) => updateSettings({ secondaryColor: e.target.value })} className="w-12 h-10 rounded-lg border border-zinc-200 cursor-pointer bg-white p-1" /></label>
                  <div className="text-xs text-zinc-700"><div>Primary: <strong>{settings.primaryColor || '#e4002b'}</strong></div><div>Secondary: <strong>{settings.secondaryColor || '#c30025'}</strong></div><button type="button" onClick={() => updateSettings({ primaryColor: '#e4002b', secondaryColor: '#c30025' })} className="text-xs text-[#e4002b] font-bold underline mt-1">Reset KFC Colors</button></div>
                  <div className="rounded-xl px-4 py-2 text-white text-xs font-bold" style={{ backgroundColor: settings.primaryColor || '#e4002b' }}>Primary Preview</div>
                  <div className="rounded-xl px-4 py-2 text-white text-xs font-bold" style={{ backgroundColor: settings.secondaryColor || '#c30025' }}>Secondary Preview</div>
                </div>
              </div>

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
                  onClick={() => {
                    setEditingPolicy(null);
                    setNewPolicyTitle('');
                    setNewPolicyContent('');
                    setIsAddingPolicy(true);
                  }}
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
                          onClick={() => {
                            setEditingPolicy(pol);
                            setNewPolicyTitle(pol.title);
                            setNewPolicyContent(pol.content);
                            setIsAddingPolicy(false);
                          }}
                          className="text-xs text-zinc-600 hover:text-zinc-900 font-bold px-2 py-1 bg-zinc-100 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Delete policy "${pol.title}"?`)) return;
                            const saved = await deletePolicy(pol.id);
                            alert(saved ? 'Policy delete ho gayi.' : 'Policy delete nahi hui. Admin login aur Firestore Rules check karein.');
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete policy"
                          aria-label={`Delete policy ${pol.title}`}
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

              {/* Logo, App Icon & Hero Banner Uploads (Device File Upload Supported) */}
              <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#e4002b]" />
                  <span>Store Brand Images & Banners (Image Upload)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <ImageUploadPicker
                    label="Store / Preloader Animated Logo"
                    value={settings.customPreloaderLogoUrl || ''}
                    onChange={(newUrl) => updateSettings({ customPreloaderLogoUrl: newUrl })}
                    aspectRatio="square"
                    helperText="Upload your store or preloader logo (PNG/JPG)."
                  />

                  <ImageUploadPicker
                    label="Custom Mobile App Icon (Square 512x512)"
                    value={settings.customAppIconUrl || ''}
                    onChange={(newUrl) => updateSettings({ customAppIconUrl: newUrl })}
                    aspectRatio="square"
                    helperText="Used for Android & iPhone home screen icon."
                  />
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  <ImageUploadPicker
                    label="Hero Section Main Promotional Banner"
                    value={settings.hero?.imageUrl || ''}
                    onChange={(newUrl) => updateSettings({ hero: { ...(settings.hero || { headline: '', highlightText: '', subtext: '', ctaButtonText: '', deliveryBadgeText: '' }), imageUrl: newUrl } })}
                    aspectRatio="wide"
                    helperText="Upload custom banner image displayed at the top of the customer store."
                  />
                </div>
              </div>

              {/* Customer Login Popup Content */}
              <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">Customer Login Popup</h3>
                  <p className="text-[11px] text-zinc-500 mt-1">Customer ko nazar aane wali login/signup wording yahan se edit karein.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {([
                    ['title', 'Popup Title'],
                    ['subtitle', 'Short Message'],
                    ['googleButtonText', 'Google Button'],
                    ['emailLabel', 'Gmail / Email Label'],
                    ['emailPlaceholder', 'Gmail Placeholder'],
                    ['passwordLabel', 'Password Label'],
                    ['signInButtonText', 'Sign In Button'],
                    ['newAccountText', 'New Account Tab'],
                    ['fullNameLabel', 'Name Label'],
                    ['createAccountButtonText', 'Create Account Button'],
                    ['verificationMessage', 'Verification Message'],
                    ['helperText', 'Bottom Helper Text'],
                  ] as const).map(([key, label]) => (
                    <div key={key} className={key === 'subtitle' || key === 'verificationMessage' || key === 'helperText' ? 'sm:col-span-2' : ''}>
                      <label className="block text-zinc-700 font-bold mb-1">{label}</label>
                      <input
                        type="text"
                        value={(settings.customerAuthCopy as any)?.[key] || ''}
                        onChange={(e) => updateSettings({ customerAuthCopy: { ...(settings.customerAuthCopy || {} as any), [key]: e.target.value } as any })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Team Access */}
              <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#e4002b]" />
                    <span>Admin Team Access</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Pehle user Firebase Authentication mein Google se sign in kare. Phir uska Firebase User UID aur email yahan add karein.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="User name"
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs"
                  />
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs"
                  />
                  <input
                    value={newAdminUid}
                    onChange={(e) => setNewAdminUid(e.target.value)}
                    placeholder="Firebase User UID"
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addAdminUserFromPanel}
                    disabled={adminUserBusy}
                    className="bg-[#e4002b] hover:bg-[#c30025] disabled:opacity-50 text-white font-bold rounded-xl px-4 py-2 text-xs"
                  >
                    {adminUserBusy ? 'Adding...' : 'Give Admin Access'}
                  </button>
                </div>

                {adminUserNotice && (
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700">
                    {adminUserNotice}
                  </div>
                )}

                <div className="space-y-2">
                  {adminUsers.length === 0 ? (
                    <p className="text-xs text-zinc-400">No admin users loaded.</p>
                  ) : adminUsers.map((user) => (
                    <div key={user.uid} className="flex items-center justify-between gap-3 border border-zinc-100 rounded-xl px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">{user.name || user.email}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleAdminUser(user.uid, user.active === false)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${user.active === false ? 'bg-zinc-100 text-zinc-600' : 'bg-emerald-50 text-emerald-700'}`}
                        >
                          {user.active === false ? 'Enable' : 'Active'}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`Is admin ka access remove karna hai?\n\n${user.email}`)) return;
                            try {
                              if (!auth.currentUser) throw new Error('Admin session expired.');
                              await deleteDoc(doc(db, 'adminUsers', user.uid));
                              setAdminUserNotice(`${user.email} ka Admin access remove kar diya gaya.`);
                              await loadAdminUsers();
                            } catch (error: any) {
                              setAdminUserNotice(error?.message || 'Admin remove nahi ho saka.');
                            }
                          }}
                          className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
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
                    {categories.map((c) => (
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

              {/* Product Image Manager: Device Upload & Presets */}
              <ImageUploadPicker
                label="Product Image (Upload from Phone/PC or Presets)"
                value={editingItem.image || ''}
                onChange={(newUrl) => setEditingItem({ ...editingItem, image: newUrl })}
                aspectRatio="square"
                helperText="Upload any product photo from your device, or choose from presets."
              />

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
                    {categories.map((c) => (
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
              <ImageUploadPicker
                label="Product Image (Upload from Phone/PC or Presets)"
                value={newProdImage}
                onChange={(newUrl) => setNewProdImage(newUrl)}
                aspectRatio="square"
                helperText="Upload any product photo from your device, or choose from presets."
              />

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
      {/* ADD COLLECTION MODAL */}
      {/* ========================================================================= */}
      {isAddingCollection && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="font-black text-zinc-900 text-sm uppercase">Add New Collection</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Shopify-style category/collection for grouping products.</p>
              </div>
              <button type="button" onClick={() => setIsAddingCollection(false)} className="text-zinc-500 hover:text-zinc-900 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCollectionSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold mb-1">Collection Name *</label>
                <input
                  type="text"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Family Feast, Ramadan Deals, Burgers"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#e4002b]"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Collection Description / Subtitle</label>
                <input
                  type="text"
                  value={newColSubtitle}
                  onChange={(e) => setNewColSubtitle(e.target.value)}
                  placeholder="Short description shown under the collection"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5"
                />
              </div>

              <ImageUploadPicker
                label="Collection Image"
                value={newColImage}
                onChange={(url) => setNewColImage(url)}
                aspectRatio="wide"
                helperText="Optional collection cover image."
              />

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
                <strong>How it works:</strong> Collection banne ke baad Add/Edit Product mein isi collection ko select karein. Product us collection mein automatically show hoga.
              </div>

              <div className="pt-4 border-t border-zinc-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddingCollection(false)} className="px-4 py-2 rounded-xl text-zinc-600 bg-zinc-100 hover:bg-zinc-200">
                  Cancel
                </button>
                <button type="submit" className="bg-[#e4002b] hover:bg-[#c30025] text-white font-bold px-5 py-2 rounded-xl cursor-pointer">
                  Create Collection
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

      {/* POLICY CREATE / EDIT MODAL */}
      {(isAddingPolicy || editingPolicy) && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSavePolicy(); }} className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 space-y-4 text-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-lg font-black">{editingPolicy ? 'Edit Store Policy' : 'Add Store Policy'}</h3>
              <button type="button" onClick={() => { setEditingPolicy(null); setIsAddingPolicy(false); setNewPolicyTitle(''); setNewPolicyContent(''); }} className="p-2 rounded-lg hover:bg-zinc-100" aria-label="Close policy editor"><X className="w-4 h-4" /></button>
            </div>
            <div><label className="block text-xs font-bold mb-1">Policy Title *</label><input value={newPolicyTitle} onChange={(e) => setNewPolicyTitle(e.target.value)} required maxLength={120} className="w-full border border-zinc-300 rounded-xl p-3 text-sm" placeholder="e.g. Delivery Policy" /></div>
            <div><label className="block text-xs font-bold mb-1">Policy Content *</label><textarea value={newPolicyContent} onChange={(e) => setNewPolicyContent(e.target.value)} required rows={8} maxLength={10000} className="w-full border border-zinc-300 rounded-xl p-3 text-sm" placeholder="Write your policy here..." /></div>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => { setEditingPolicy(null); setIsAddingPolicy(false); setNewPolicyTitle(''); setNewPolicyContent(''); }} className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-sm font-bold">Cancel</button><button type="submit" className="px-4 py-2 rounded-xl bg-[#e4002b] text-white text-sm font-bold">{editingPolicy ? 'Save Changes' : 'Add Policy'}</button></div>
          </form>
        </div>
      )}

      {/* CUSTOMER DETAILS VIEW / EDIT MODAL */}
      {editingCustomerRecord && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={async (e) => { e.preventDefault(); try { await updateCustomerRecord(editingCustomerRecord.id, { fullName: editingCustomerRecord.fullName || '', phone: editingCustomerRecord.phone || '', email: editingCustomerRecord.email || '', address: editingCustomerRecord.address || '', savedAddresses: editingCustomerRecord.savedAddresses || [] }); setEditingCustomerRecord(null); alert('Customer details save ho gayi hain.'); } catch (error: any) { alert(error?.message || 'Customer details save nahi ho sakin.'); } }} className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 space-y-4 text-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3"><div><h3 className="text-lg font-black">Customer Details</h3><p className="text-xs text-zinc-500 break-all">Customer ID: {editingCustomerRecord.id}</p></div><button type="button" onClick={() => setEditingCustomerRecord(null)} className="p-2 rounded-lg hover:bg-zinc-100" aria-label="Close customer details"><X className="w-4 h-4" /></button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold mb-1">Full Name</label><input value={editingCustomerRecord.fullName || ''} onChange={(e) => setEditingCustomerRecord({ ...editingCustomerRecord, fullName: e.target.value })} required maxLength={100} className="w-full border border-zinc-300 rounded-xl p-3 text-sm" /></div>
              <div><label className="block text-xs font-bold mb-1">Phone Number</label><input value={editingCustomerRecord.phone || ''} onChange={(e) => setEditingCustomerRecord({ ...editingCustomerRecord, phone: e.target.value })} maxLength={40} className="w-full border border-zinc-300 rounded-xl p-3 text-sm" /></div>
              <div className="sm:col-span-2"><label className="block text-xs font-bold mb-1">Email Address</label><input type="email" value={editingCustomerRecord.email || ''} onChange={(e) => setEditingCustomerRecord({ ...editingCustomerRecord, email: e.target.value })} maxLength={160} className="w-full border border-zinc-300 rounded-xl p-3 text-sm" /></div>
              <div className="sm:col-span-2"><label className="block text-xs font-bold mb-1">Shipping / Delivery Address</label><textarea value={editingCustomerRecord.address || editingCustomerRecord.defaultAddress || ''} onChange={(e) => setEditingCustomerRecord({ ...editingCustomerRecord, address: e.target.value })} rows={3} maxLength={500} className="w-full border border-zinc-300 rounded-xl p-3 text-sm" /></div>
              <div className="sm:col-span-2"><label className="block text-xs font-bold mb-1">Saved Addresses (har address alag line par)</label><textarea value={(editingCustomerRecord.savedAddresses || []).map((address: any) => address.address || '').join('\n')} onChange={(e) => { const lines = e.target.value.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 20); const previous = editingCustomerRecord.savedAddresses || []; setEditingCustomerRecord({ ...editingCustomerRecord, savedAddresses: lines.map((address, index) => ({ id: previous[index]?.id || `admin-address-${index + 1}`, label: previous[index]?.label || (index === 0 ? 'Home' : `Address ${index + 1}`), address, isDefault: index === 0 })) }); }} rows={3} maxLength={5000} placeholder="House number, street, area..." className="w-full border border-zinc-300 rounded-xl p-3 text-sm" /><p className="text-[10px] text-zinc-500 mt-1">Customer ke saved delivery addresses yahan edit kar sakte hain.</p></div>
              <div className="sm:col-span-2 bg-zinc-50 rounded-xl p-3 text-xs text-zinc-600">Orders: {editingCustomerRecord.totalOrdersCount || 0} · Total spent: {formatPKR(editingCustomerRecord.totalSpent || 0)} · Loyalty points: {editingCustomerRecord.loyaltyPoints || 0}</div>
            </div>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingCustomerRecord(null)} className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-sm font-bold">Cancel</button><button type="submit" className="px-4 py-2 rounded-xl bg-[#e4002b] text-white text-sm font-bold">Save Customer</button></div>
          </form>
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

      {/* Admin Order Modification & Customization Modal */}
      {editingOrder && (
        <OrderEditModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
        />
      )}

    </div>
  );
};
