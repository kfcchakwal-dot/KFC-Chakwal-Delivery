import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  MenuItem,
  CartItem,
  CartItemOption,
  CategoryId,
  StoreSettings,
  ChakwalArea,
  OrderType,
  Order,
  CustomerDetails,
  PaymentMethod,
  ThemeMode,
  ProductReview,
  CustomerUser,
  PageSection,
  Discount,
  StorePolicy,
  DeliveryMethod,
  DailyDealConfig,
  CustomerLoyaltyRecord,
  CustomerAddress,
  VipTierId,
  VipTier,
  VipMembershipRequest,
  CustomDomainConfig,
  MetaCommerceConfig,
  LoyaltyTransaction,
  AbandonedCheckout,
  LiveStoreStats,
  AutoReviewConfig,
  MarketingCampaign,
  Category,
  ProductVariant,
} from '../types';
import {
  INITIAL_KFC_ITEMS,
  DEFAULT_STORE_SETTINGS,
  DEFAULT_CHAKWAL_AREAS,
  INITIAL_REVIEWS,
  DEFAULT_DISCOUNTS,
  DEFAULT_STORE_POLICIES,
  DEFAULT_DELIVERY_METHODS,
  DEFAULT_DAILY_DEAL,
  DEFAULT_VIP_TIERS,
  DEFAULT_CUSTOM_DOMAIN_CONFIG,
  DEFAULT_META_COMMERCE_CONFIG,
  DEFAULT_AUTO_REVIEW_CONFIG,
  KFC_CATEGORIES,
} from '../data/kfcMenu';
import { playNewOrderChime } from '../utils/audioNotification';
import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

interface StoreContextType {
  // Store Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetSettingsToDefault: () => void;

  // Pricing Helpers
  calculatePrice: (baseKfcPrice: number, customSellingPrice?: number) => number;
  getItemEffectivePrice: (item: MenuItem) => number;
  formatPKR: (amount: number) => string;

  // Custom Page Sections
  updateCustomSection: (section: PageSection) => void;
  addCustomSection: (section: PageSection) => void;
  deleteCustomSection: (sectionId: string) => void;

  // Menu Catalog (Fully editable)
  menuItems: MenuItem[];
  updateMenuItem: (item: MenuItem) => void;
  addMenuItem: (item: MenuItem) => void;
  bulkImportProducts: (newProducts: MenuItem[]) => void;
  deleteMenuItem: (itemId: string) => void;
  toggleItemAvailability: (itemId: string) => void;
  resetMenuToDefault: () => void;

  // Delivery Methods (Shopify-Style Editable)
  deliveryMethods: DeliveryMethod[];
  selectedDeliveryMethodId: string;
  setSelectedDeliveryMethodId: (id: string) => void;
  selectedDeliveryMethod: DeliveryMethod;
  updateDeliveryMethods: (methods: DeliveryMethod[]) => void;

  // Daily Deals
  dailyDealConfig: DailyDealConfig;
  updateDailyDealConfig: (config: Partial<DailyDealConfig>) => void;

  // Discounts & Promotions
  discounts: Discount[];
  appliedDiscountCode: string;
  appliedDiscount: Discount | null;
  discountAmount: number;
  applyDiscountCode: (code: string) => { success: boolean; message: string };
  removeDiscountCode: () => void;
  addDiscount: (discount: Omit<Discount, 'id' | 'usedCount'>) => void;
  updateDiscount: (id: string, updates: Partial<Discount>) => void;
  deleteDiscount: (id: string) => void;

  // Loyalty Points (10 points per Rs 300 spent, Min order Rs 500, NOT combinable with other discounts)
  isRedeemingPoints: boolean;
  setIsRedeemingPoints: (val: boolean) => void;
  canRedeemPoints: boolean;
  hasActiveDiscountCoupon: boolean;
  minPointsRedemptionAmount: number;
  maxRedeemablePoints: number;
  loyaltyDiscountAmount: number;
  potentialPointsToEarn: number;

  // Customer Loyalty Records (For KCD Seller)
  customerRecords: CustomerLoyaltyRecord[];
  fetchCustomers: () => Promise<void>;
  updateCustomerPoints: (phoneOrId: string, newPoints: number) => Promise<void>;

  // Store Policies
  policies: StorePolicy[];
  updatePolicy: (policy: StorePolicy) => void;
  addPolicy: (policy: Omit<StorePolicy, 'id'>) => void;
  deletePolicy: (policyId: string) => void;
  isPoliciesModalOpen: boolean;
  setIsPoliciesModalOpen: (open: boolean) => void;
  activePolicySlug: string | null;
  openPolicyModal: (slug?: string) => void;

  // Server sync status
  serverSyncStatus: 'synced' | 'syncing' | 'offline';
  syncStoreToServer: (customPayload?: Record<string, any>) => Promise<void>;

  // Chakwal Delivery Areas
  chakwalAreas: ChakwalArea[];
  selectedArea: ChakwalArea;
  setSelectedArea: (area: ChakwalArea) => void;
  updateAreas: (areas: ChakwalArea[]) => void;

  // Cart / Bucket State
  cart: CartItem[];
  addToCart: (item: MenuItem, options?: CartItemOption, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  effectiveDeliveryFee: number;
  cartTotal: number;

  // Order Type (Self pickup removed)
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (itemId: string) => void;

  // Orders Management & Sound
  activeOrder: Order | null;
  createOrder: (customer: CustomerDetails, paymentMethod: PaymentMethod, specialInstructions?: string) => Order;
  repeatOrder: (order: Order) => void;
  clearActiveOrder: () => void;
  allOrders: Order[];
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  playOrderSound: () => void;

  // Navigation & Filtering
  activeCategory: CategoryId;
  setActiveCategory: (cat: CategoryId) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentView: 'home' | 'product' | 'wishlist' | 'collection';
  setCurrentView: (view: 'home' | 'product' | 'wishlist' | 'collection') => void;
  selectedProduct: MenuItem | null;
  viewProduct: (item: MenuItem) => void;
  goHome: () => void;
  openWishlist: () => void;

  // Theme
  themeMode: ThemeMode;
  toggleTheme: () => void;

  // Reviews
  reviews: ProductReview[];
  addReview: (review: Omit<ProductReview, 'id' | 'date'>) => void;
  deleteReview: (reviewId: string) => void;

  // Customer Account
  currentUser: CustomerUser | null;
  signupUser: (data: { fullName: string; phone: string; address: string; email?: string }) => void;
  loginUser: (phone: string) => boolean;
  logoutUser: () => void;
  sendPhoneOtp: (phoneNumber: string, recaptchaContainerId: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneOtp: (otpCode: string, profileDetails?: { fullName: string; defaultAddress?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  isOtpSent: boolean;
  setIsOtpSent: (sent: boolean) => void;
  addSavedAddress: (label: string, address: string) => void;
  deleteSavedAddress: (addressId: string) => void;
  isCustomerAuthModalOpen: boolean;
  setIsCustomerAuthModalOpen: (open: boolean) => void;

  // UI Modals
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  selectedItemForCustomization: MenuItem | null;
  setSelectedItemForCustomization: (item: MenuItem | null) => void;

  // Seller App State (KCD Seller)
  isSellerMode: boolean;
  setIsSellerMode: (mode: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  loginAdmin: (emailOrPin: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  isOrdersDashboardOpen: boolean;
  setIsOrdersDashboardOpen: (open: boolean) => void;

  // VIP Club Program
  vipTiers: VipTier[];
  vipRequests: VipMembershipRequest[];
  isVipModalOpen: boolean;
  setIsVipModalOpen: (open: boolean) => void;
  requestVipMembership: (tierId: VipTierId, paymentMethod: 'jazzcash' | 'easypaisa' | 'bank_transfer', transactionId: string) => void;
  approveVipRequest: (requestId: string) => void;
  rejectVipRequest: (requestId: string) => void;
  vipDiscountAmount: number;

  // Complete Loyalty Program Section
  loyaltyTransactions: LoyaltyTransaction[];
  isLoyaltyModalOpen: boolean;
  setIsLoyaltyModalOpen: (open: boolean) => void;
  pointsEarnedNotice: number | null;
  clearPointsEarnedNotice: () => void;

  // Daily Deals Open Popup
  isDailyDealsPopupOpen: boolean;
  setIsDailyDealsPopupOpen: (open: boolean) => void;

  // Custom Domain Integration
  updateCustomDomain: (config: Partial<CustomDomainConfig>) => void;

  // Facebook & Instagram Meta Ads Manager
  updateMetaCommerce: (config: Partial<MetaCommerceConfig>) => void;

  // Real-time Visitors & Abandoned Checkout
  liveStats: LiveStoreStats;
  abandonedCheckouts: AbandonedCheckout[];
  recordAbandonedCheckout: (customer: CustomerDetails) => void;
  markAbandonedCheckoutRecovered: (id: string) => void;
  sendAbandonedRecoveryWhatsapp: (checkout: AbandonedCheckout) => void;

  // Automated 12-Hour Review Collection Flow
  updateAutoReview: (config: Partial<AutoReviewConfig>) => void;
  sendReviewCollectionWhatsapp: (order: Order) => void;

  // Bulk Marketing Broadcast Center
  marketingCampaigns: MarketingCampaign[];
  createMarketingBroadcast: (campaign: Omit<MarketingCampaign, 'id' | 'sentAt'>) => void;

  // Customers Import & Export
  exportCustomersCSV: () => string;
  importCustomersCSV: (csvText: string) => { imported: number; errors: number };

  // Categories / Collections Management
  categories: Category[];
  addCategory: (cat: Category) => void;

  // Order Editing (Shopify Style)
  editOrder: (orderId: string, updatedFields: Partial<Order>) => void;

  // Single Customer Management
  addCustomer: (customer: Partial<CustomerLoyaltyRecord>) => void;
  updateCustomer: (customerId: string, updated: Partial<CustomerLoyaltyRecord>) => void;
  deleteCustomer: (customerId: string) => void;

  // Lifetime VIP Pass actions
  requestVipMembershipWhatsApp: (tierId: VipTierId, customerName: string, phone: string, email?: string) => VipMembershipRequest;
  grantVipMembershipManual: (customerPhoneOrId: string, tierId: VipTierId) => void;

  // Admin Users
  addAdminUser: (name: string, email: string, pin: string, role?: 'Super Admin' | 'Manager') => void;
  deleteAdminUser: (adminId: string) => void;

  // Customer Push Notification Preferences
  customerNotificationAllowed: boolean;
  setCustomerNotificationAllowed: (allowed: boolean) => void;
  requestNotificationPermission: () => Promise<boolean>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const SETTINGS_KEY = 'kfc_chakwal_settings_v5';
const MENU_KEY = 'kfc_chakwal_menu_v5';
const WISHLIST_KEY = 'kfc_chakwal_wishlist_v5';
const AREAS_KEY = 'kfc_chakwal_areas_v5';
const ACTIVE_ORDER_KEY = 'kfc_chakwal_active_order_v5';
const ALL_ORDERS_KEY = 'kfc_chakwal_all_orders_v5';
const ADMIN_AUTH_KEY = 'kcd_seller_auth_v5';
const REVIEWS_KEY = 'kfc_chakwal_reviews_v5';
const CUSTOMER_USER_KEY = 'kfc_chakwal_user_v5';
const DISCOUNTS_KEY = 'kfc_chakwal_discounts_v5';
const POLICIES_KEY = 'kfc_chakwal_policies_v5';
const DELIVERY_METHODS_KEY = 'kfc_chakwal_delivery_methods_v5';
const CUSTOMERS_KEY = 'kfc_chakwal_customers_v5';
const VIP_REQUESTS_KEY = 'kfc_chakwal_vip_requests_v5';
const LOYALTY_TX_KEY = 'kfc_chakwal_loyalty_tx_v5';
const ABANDONED_CHECKOUTS_KEY = 'kfc_chakwal_abandoned_checkouts_v5';
const MARKETING_KEY = 'kfc_chakwal_marketing_v5';
const CATEGORIES_KEY = 'kfc_chakwal_categories_v5';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detect Seller mode from URL (e.g. ?app=seller or /seller)
  const [isSellerMode, setIsSellerMode] = useState<boolean>(() => {
    try {
      const url = new URL(window.location.href);
      return url.searchParams.get('app') === 'seller' || url.pathname.startsWith('/seller');
    } catch {
      return false;
    }
  });

  // Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STORE_SETTINGS,
          ...parsed,
          phone: '+92 325 2777574',
          whatsappNumber: '+92 325 2777574',
          deliveryRadiusText: 'Within 3 KM of Chakwal City',
          themeMode: parsed.themeMode === 'dark' ? 'dark' : 'light',
          deliveryMethods: parsed.deliveryMethods || DEFAULT_DELIVERY_METHODS,
          dailyDeal: parsed.dailyDeal || DEFAULT_DAILY_DEAL,
        };
      }
    } catch {}
    return DEFAULT_STORE_SETTINGS;
  });

  // Delivery Methods
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>(() => {
    try {
      const saved = localStorage.getItem(DELIVERY_METHODS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return settings.deliveryMethods || DEFAULT_DELIVERY_METHODS;
  });

  const [selectedDeliveryMethodId, setSelectedDeliveryMethodId] = useState<string>(() => {
    const defaultMethod = deliveryMethods.find((m) => m.isDefault && m.enabled) || deliveryMethods[0];
    return defaultMethod?.id || 'dm-standard';
  });

  const selectedDeliveryMethod = deliveryMethods.find((m) => m.id === selectedDeliveryMethodId) || deliveryMethods[0] || {
    id: 'dm-standard',
    name: 'Standard Chakwal Delivery (Within 3 KM)',
    description: 'Fresh KFC from Kallar Kahar Motorway',
    price: 399,
    estimatedTime: 'Delivered by 8:00 PM',
    enabled: true,
  };

  // Menu items
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(MENU_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_KFC_ITEMS;
  });

  // Discounts
  const [discounts, setDiscounts] = useState<Discount[]>(() => {
    try {
      const saved = localStorage.getItem(DISCOUNTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_DISCOUNTS;
  });

  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string>('');

  // Policies
  const [policies, setPolicies] = useState<StorePolicy[]>(() => {
    try {
      const saved = localStorage.getItem(POLICIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STORE_POLICIES;
  });

  const [isPoliciesModalOpen, setIsPoliciesModalOpen] = useState(false);
  const [activePolicySlug, setActivePolicySlug] = useState<string | null>(null);

  // Chakwal areas
  const [chakwalAreas, setChakwalAreas] = useState<ChakwalArea[]>(() => {
    try {
      const saved = localStorage.getItem(AREAS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CHAKWAL_AREAS;
  });

  const [selectedArea, setSelectedArea] = useState<ChakwalArea>(chakwalAreas[0] || DEFAULT_CHAKWAL_AREAS[0]);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isRedeemingPoints, setIsRedeemingPoints] = useState<boolean>(false);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Active Order
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_ORDER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // UI state
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('everyday-value');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState<MenuItem | null>(null);

  // Navigation
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'wishlist' | 'collection'>('home');
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_REVIEWS;
  });

  // Customer Account
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.loyaltyPoints !== 'number') parsed.loyaltyPoints = 50;
        return parsed;
      }
    } catch {}
    return null;
  });

  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState(false);

  // Customers Records for KCD Seller
  const [customerRecords, setCustomerRecords] = useState<CustomerLoyaltyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Admin / Seller Auth
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [phoneConfirmationResult, setPhoneConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);

  // Monitor Firebase Auth state change for Admin and Phone Customer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setIsAdmin(false);
        return;
      }

      // Check Admin permissions
      try {
        const tokenResult = await firebaseUser.getIdTokenResult();
        let isAuthorizedAdmin = false;
        if (tokenResult.claims.admin === true || firebaseUser.email === 'kfcchakwal@gmail.com') {
          isAuthorizedAdmin = true;
        } else {
          const adminDoc = await getDoc(doc(db, 'adminUsers', firebaseUser.uid));
          if (adminDoc.exists() && adminDoc.data()?.role === 'admin') {
            isAuthorizedAdmin = true;
          }
        }
        setIsAdmin(isAuthorizedAdmin);
      } catch (err) {
        console.warn('Admin status evaluation notice:', err);
      }

      // Sync customer profile if phone authenticated
      if (firebaseUser.phoneNumber) {
        try {
          const customerDocRef = doc(db, 'customers', firebaseUser.uid);
          const customerDoc = await getDoc(customerDocRef);
          if (customerDoc.exists()) {
            const data = customerDoc.data() as any;
            setCurrentUser({
              id: firebaseUser.uid,
              fullName: data.fullName || 'Customer',
              phone: firebaseUser.phoneNumber,
              email: data.email,
              address: data.defaultAddress || '',
              defaultAddress: data.defaultAddress || '',
              savedAddresses: data.savedAddresses || [],
              loyaltyPoints: data.loyaltyPoints || 0,
              vipTier: data.vipTier,
              totalSpent: data.totalSpent || 0,
              ordersCount: data.totalOrdersCount || 0,
              createdAt: data.createdAt || new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn('Customer profile sync notice:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isOrdersDashboardOpen, setIsOrdersDashboardOpen] = useState(false);

  const [allOrders, setAllOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ALL_ORDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const previousOrderCountRef = useRef<number>(allOrders.length);
  const [serverSyncStatus, setServerSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // Categories / Collections
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return KFC_CATEGORIES;
  });

  const addCategory = (cat: Category) => {
    const next = [...categories, cat];
    setCategories(next);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(next));
  };

  // VIP Club
  const [vipTiers] = useState<VipTier[]>(DEFAULT_VIP_TIERS);
  const [vipRequests, setVipRequests] = useState<VipMembershipRequest[]>(() => {
    try {
      const saved = localStorage.getItem(VIP_REQUESTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'vip-req-sample-1',
        customerId: 'cust-demo-1',
        customerName: 'Chaudhry Bilal (Civil Lines)',
        phone: '03001234567',
        tierId: 'platinum',
        amount: 999,
        paymentMethod: 'jazzcash',
        transactionId: 'JC-8829104',
        requestedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'approved',
        approvedAt: new Date().toISOString(),
      },
    ];
  });
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  // Loyalty Program Full Section
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOYALTY_TX_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'tx-welcome-bonus',
        customerId: 'all',
        type: 'bonus',
        points: 50,
        description: 'KFC Chakwal Welcome Loyalty Bonus',
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ];
  });
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const [pointsEarnedNotice, setPointsEarnedNotice] = useState<number | null>(null);
  const clearPointsEarnedNotice = () => setPointsEarnedNotice(null);

  // Daily Deals Open Popup (auto open once per session unless dismissed)
  const [isDailyDealsPopupOpen, setIsDailyDealsPopupOpen] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('kfc_daily_deal_popup_dismissed');
    } catch {
      return true;
    }
  });

  // Abandoned Checkouts & Real-time Live Stats
  const [abandonedCheckouts, setAbandonedCheckouts] = useState<AbandonedCheckout[]>(() => {
    try {
      const saved = localStorage.getItem(ABANDONED_CHECKOUTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'ab-sample-1',
        customerName: 'Kamran Haider',
        phone: '03215551234',
        address: 'Talagang Road, Chakwal',
        items: [],
        cartTotal: 1850,
        createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        recoveryStatus: 'pending',
      },
      {
        id: 'ab-sample-2',
        customerName: 'Zainab Bibi',
        phone: '03335559876',
        address: 'Bhaun Chowk, Chakwal',
        items: [],
        cartTotal: 2490,
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        recoveryStatus: 'message_sent',
        lastMessageSentAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
    ];
  });

  const [liveStats] = useState<LiveStoreStats>({
    activeVisitors: 34,
    openCartsCount: 8,
    openCartsValue: 18450,
    checkoutsInProgress: 3,
  });

  // Marketing Campaigns
  const [marketingCampaigns, setMarketingCampaigns] = useState<MarketingCampaign[]>(() => {
    try {
      const saved = localStorage.getItem(MARKETING_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'camp-1',
        title: 'Friday Mega Bucket Weekend Blast',
        channel: 'whatsapp',
        audience: 'all',
        message: 'Assalam o Alaikum! Aaj Friday Special: Flat 4% OFF on Daily 5 Meal Boxes. Kallar Kahar se fresh KFC Chakwal deliver karein!',
        sentCount: 142,
        sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];
  });

  // SERVER SYNC
  useEffect(() => {
    const loadServerData = async () => {
      try {
        const res = await fetch('/api/store-data');
        if (res.ok) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            if (data.settings) {
              setSettings((prev) => ({
                ...prev,
                ...data.settings,
                phone: '+92 325 2777574',
                whatsappNumber: '+92 325 2777574',
                deliveryRadiusText: 'Within 3 KM of Chakwal City',
              }));
              if (data.settings.deliveryMethods) {
                setDeliveryMethods(data.settings.deliveryMethods);
              }
            }
            if (data.menuItems && Array.isArray(data.menuItems) && data.menuItems.length > 0) {
              setMenuItems(data.menuItems);
            }
            if (data.discounts && Array.isArray(data.discounts) && data.discounts.length > 0) {
              setDiscounts(data.discounts);
            }
            if (data.policies && Array.isArray(data.policies)) {
              setPolicies(data.policies);
            }
            if (data.chakwalAreas && Array.isArray(data.chakwalAreas) && data.chakwalAreas.length > 0) {
              setChakwalAreas(data.chakwalAreas);
            }
          }
        }
      } catch {}
    };

    loadServerData();
    const interval = setInterval(loadServerData, 12000);
    return () => clearInterval(interval);
  }, []);

  // =========================================================================
  // ANDROID & MOBILE HARDWARE / GESTURE BACK BUTTON HANDLING
  // Ensures hardware back button closes the top-most modal/drawer rather than
  // abruptly exiting the application.
  // =========================================================================
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const prodId = urlParams.get('product');
      if (prodId) {
        const found = menuItems.find((m) => m.id === prodId);
        if (found) {
          setSelectedProduct(found);
          setCurrentView('product');
        }
      }
    } catch {}
  }, [menuItems]);

  const hasModalOrSubpageOpen = Boolean(
    selectedItemForCustomization ||
    isCheckoutOpen ||
    isCartOpen ||
    isCustomerAuthModalOpen ||
    isPoliciesModalOpen ||
    isAdminLoginModalOpen ||
    activeOrder ||
    currentView !== 'home'
  );

  const prevModalOpenStateRef = useRef(false);

  useEffect(() => {
    if (hasModalOrSubpageOpen && !prevModalOpenStateRef.current) {
      window.history.pushState({ kfcModalLayer: true }, '');
    } else if (!hasModalOrSubpageOpen && prevModalOpenStateRef.current) {
      if (window.history.state?.kfcModalLayer) {
        window.history.back();
      }
    }
    prevModalOpenStateRef.current = hasModalOrSubpageOpen;
  }, [hasModalOrSubpageOpen]);

  useEffect(() => {
    const handleAndroidBack = () => {
      // Close top-most modal layer first
      if (selectedItemForCustomization) {
        setSelectedItemForCustomization(null);
        return;
      }
      if (isCheckoutOpen) {
        setIsCheckoutOpen(false);
        return;
      }
      if (isCartOpen) {
        setIsCartOpen(false);
        return;
      }
      if (isCustomerAuthModalOpen) {
        setIsCustomerAuthModalOpen(false);
        return;
      }
      if (isPoliciesModalOpen) {
        setIsPoliciesModalOpen(false);
        return;
      }
      if (isAdminLoginModalOpen) {
        setIsAdminLoginModalOpen(false);
        return;
      }
      if (activeOrder) {
        setActiveOrder(null);
        return;
      }
      if (currentView !== 'home') {
        setCurrentView('home');
        setSelectedProduct(null);
        return;
      }
    };

    window.addEventListener('popstate', handleAndroidBack);
    return () => window.removeEventListener('popstate', handleAndroidBack);
  }, [
    selectedItemForCustomization,
    isCheckoutOpen,
    isCartOpen,
    isCustomerAuthModalOpen,
    isPoliciesModalOpen,
    isAdminLoginModalOpen,
    activeOrder,
    currentView
  ]);

  const getAuthHeaders = async () => {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const syncStoreToServer = async (customPayload?: Record<string, any>) => {
    try {
      setServerSyncStatus('syncing');
      const payload = customPayload || {
        settings: {
          ...settings,
          deliveryMethods,
        },
        menuItems,
        discounts,
        policies,
        chakwalAreas,
      };
      const authHeaders = await getAuthHeaders();
      if (!authHeaders.Authorization) throw new Error('Admin authentication required');
      await fetch('/api/store-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload),
      });
      setServerSyncStatus('synced');
    } catch {
      setServerSyncStatus('offline');
    }
  };

  // Orders Fetch & Sound Trigger
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { headers: await getAuthHeaders() });
      if (res.ok) {
        const data: Order[] = await res.json();
        // If new orders arrived while on seller page, play sound!
        if (data.length > previousOrderCountRef.current && previousOrderCountRef.current > 0) {
          if (settings.orderNotificationSound !== false) {
            playNewOrderChime();
          }
        }
        previousOrderCountRef.current = data.length;
        setAllOrders(data);
        localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(data));
      }
    } catch {}
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [settings.orderNotificationSound]);

  // Customers Fetch
  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers', { headers: await getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCustomerRecords(data);
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(data));
      }
    } catch {}
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const updateCustomerPoints = async (phoneOrId: string, newPoints: number) => {
    const updated = customerRecords.map((c) =>
      c.phone === phoneOrId || c.id === phoneOrId ? { ...c, loyaltyPoints: newPoints } : c
    );
    setCustomerRecords(updated);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated));

    if (currentUser && (currentUser.phone === phoneOrId || currentUser.id === phoneOrId)) {
      const updatedUser = { ...currentUser, loyaltyPoints: newPoints };
      setCurrentUser(updatedUser);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
    }

    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneOrId, loyaltyPoints: newPoints }),
      });
    } catch {}
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAllOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
        );
        if (activeOrder && activeOrder.id === orderId) {
          setActiveOrder((prev) => (prev ? { ...prev, status } : null));
        }
      }
    } catch {
      setAllOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }
  };

  const loginAdmin = async (emailOrPin: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const email = emailOrPin.includes('@') ? emailOrPin.trim() : `${emailOrPin.trim()}@kfcchakwaldelivery.app`;
      const pwd = password || emailOrPin;
      const cred = await signInWithEmailAndPassword(auth, email, pwd);
      const user = cred.user;
      const tokenResult = await user.getIdTokenResult();

      let isAuthorizedAdmin = false;
      if (tokenResult.claims.admin === true || user.email === 'kfcchakwal@gmail.com') {
        isAuthorizedAdmin = true;
      } else {
        const adminDoc = await getDoc(doc(db, 'adminUsers', user.uid));
        if (adminDoc.exists() && adminDoc.data()?.role === 'admin') {
          isAuthorizedAdmin = true;
        }
      }

      if (isAuthorizedAdmin) {
        setIsAdmin(true);
        setIsAdminLoginModalOpen(false);
        return { success: true };
      } else {
        await signOut(auth);
        setIsAdmin(false);
        return { success: false, error: 'Access denied: You do not have administrator permissions.' };
      }
    } catch (err: any) {
      console.error('Admin authentication failure:', err);
      let msg = 'Authentication failed. Please verify your administrator credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid administrator email or password.';
      }
      return { success: false, error: msg };
    }
  };

  const logoutAdmin = async () => {
    try {
      await signOut(auth);
    } catch {}
    setIsAdmin(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    url.searchParams.delete('app');
    window.history.replaceState({}, '', url.pathname);
  };

  // Local Storage Syncs
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(MENU_KEY, JSON.stringify(menuItems));
    } catch {}
  }, [menuItems]);

  useEffect(() => {
    try {
      localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(discounts));
    } catch {}
  }, [discounts]);

  useEffect(() => {
    try {
      localStorage.setItem(DELIVERY_METHODS_KEY, JSON.stringify(deliveryMethods));
    } catch {}
  }, [deliveryMethods]);

  useEffect(() => {
    try {
      localStorage.setItem(POLICIES_KEY, JSON.stringify(policies));
    } catch {}
  }, [policies]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  // Helpers
  const calculatePrice = (baseKfcPrice: number, customSellingPrice?: number): number => {
    if (customSellingPrice !== undefined && customSellingPrice > 0) {
      return customSellingPrice;
    }
    const markupFactor = 1 + (settings.markupPercentage || 12) / 100;
    return Math.round(baseKfcPrice * markupFactor);
  };

  const getItemEffectivePrice = (item: MenuItem): number => {
    return calculatePrice(item.baseKfcPrice, item.sellingPrice);
  };

  const formatPKR = (amount: number): string => {
    return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      syncStoreToServer({ settings: updated });
      return updated;
    });
  };

  const resetSettingsToDefault = () => {
    setSettings(DEFAULT_STORE_SETTINGS);
    setDeliveryMethods(DEFAULT_DELIVERY_METHODS);
    syncStoreToServer({ settings: DEFAULT_STORE_SETTINGS });
  };

  const updateDeliveryMethods = (methods: DeliveryMethod[]) => {
    setDeliveryMethods(methods);
    localStorage.setItem(DELIVERY_METHODS_KEY, JSON.stringify(methods));
    updateSettings({ deliveryMethods: methods });
  };

  const updateDailyDealConfig = (config: Partial<DailyDealConfig>) => {
    const updated = { ...(settings.dailyDeal || DEFAULT_DAILY_DEAL), ...config };
    updateSettings({ dailyDeal: updated });
  };

  // Menu item operations (Fully editable: Title, description, price, compareAt, image, etc.)
  const updateMenuItem = (updatedItem: MenuItem) => {
    const nextMenu = menuItems.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setMenuItems(nextMenu);
    syncStoreToServer({ menuItems: nextMenu });
  };

  const addMenuItem = (newItem: MenuItem) => {
    const nextMenu = [newItem, ...menuItems];
    setMenuItems(nextMenu);
    syncStoreToServer({ menuItems: nextMenu });
  };

  const bulkImportProducts = (newProducts: MenuItem[]) => {
    const existingHandles = new Set(menuItems.map((m) => m.id));
    const combined = [...menuItems];
    for (const p of newProducts) {
      if (existingHandles.has(p.id)) {
        const idx = combined.findIndex((m) => m.id === p.id);
        combined[idx] = p;
      } else {
        combined.push(p);
      }
    }
    setMenuItems(combined);
    syncStoreToServer({ menuItems: combined });
  };

  const deleteMenuItem = (itemId: string) => {
    const nextMenu = menuItems.filter((item) => item.id !== itemId);
    setMenuItems(nextMenu);
    setCart((prev) => prev.filter((item) => item.menuItem.id !== itemId));
    syncStoreToServer({ menuItems: nextMenu });
  };

  const toggleItemAvailability = (itemId: string) => {
    const nextMenu = menuItems.map((item) =>
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    );
    setMenuItems(nextMenu);
    syncStoreToServer({ menuItems: nextMenu });
  };

  const resetMenuToDefault = () => {
    setMenuItems(INITIAL_KFC_ITEMS);
    syncStoreToServer({ menuItems: INITIAL_KFC_ITEMS });
  };

  const updateAreas = (newAreas: ChakwalArea[]) => {
    setChakwalAreas(newAreas);
    syncStoreToServer({ chakwalAreas: newAreas });
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );

  // DISCOUNTS ENGINE
  const now = new Date();
  const isDiscountDateValid = (d: Discount) => {
    if (d.startDate && new Date(d.startDate) > now) return false;
    if (d.endDate && new Date(d.endDate) < now) return false;
    return true;
  };

  let appliedDiscount: Discount | null = null;
  if (appliedDiscountCode) {
    const found = discounts.find(
      (d) => d.code.toUpperCase() === appliedDiscountCode.toUpperCase() && d.status === 'active' && isDiscountDateValid(d)
    );
    if (found) appliedDiscount = found;
  } else {
    const autoDiscounts = discounts.filter(
      (d) => d.isAutomatic && d.status === 'active' && isDiscountDateValid(d) && (!d.minOrderAmount || cartSubtotal >= d.minOrderAmount)
    );
    if (autoDiscounts.length > 0) appliedDiscount = autoDiscounts[0];
  }

  let discountAmount = 0;
  let isFreeShippingApplied = false;

  if (appliedDiscount && cartSubtotal > 0) {
    if (!appliedDiscount.minOrderAmount || cartSubtotal >= appliedDiscount.minOrderAmount) {
      if (appliedDiscount.type === 'percentage') {
        discountAmount = Math.round((cartSubtotal * appliedDiscount.value) / 100);
      } else if (appliedDiscount.type === 'fixed_amount') {
        discountAmount = Math.min(cartSubtotal, appliedDiscount.value);
      } else if (appliedDiscount.type === 'free_shipping') {
        isFreeShippingApplied = true;
      }
    }
  }

  // MUTUAL EXCLUSIVITY RULE:
  // Loyalty points cannot be combined with other discount codes!
  const hasActiveDiscountCoupon = Boolean(
    appliedDiscountCode || (appliedDiscount && appliedDiscount.type !== 'free_shipping' && discountAmount > 0)
  );

  const applyDiscountCode = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, message: 'Please enter a discount code' };

    // If user is currently redeeming loyalty points, inform them or disable points
    if (isRedeemingPoints) {
      setIsRedeemingPoints(false); // Uncheck loyalty points to apply code
    }

    const disc = discounts.find((d) => d.code.toUpperCase() === clean);
    if (!disc) return { success: false, message: `Discount code "${clean}" not found` };
    if (disc.status !== 'active') return { success: false, message: `Discount code "${clean}" is not active` };
    
    // Check start and end date/time
    const currentNow = new Date();
    if (disc.startDate && new Date(disc.startDate) > currentNow) {
      return {
        success: false,
        message: `Discount code "${clean}" starts on ${new Date(disc.startDate).toLocaleDateString()} at ${new Date(disc.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      };
    }
    if (disc.endDate && new Date(disc.endDate) < currentNow) {
      return {
        success: false,
        message: `Discount code "${clean}" expired on ${new Date(disc.endDate).toLocaleDateString()}`,
      };
    }

    if (disc.minOrderAmount && cartSubtotal < disc.minOrderAmount) {
      return {
        success: false,
        message: `Minimum order of Rs. ${disc.minOrderAmount} required for this code`,
      };
    }

    setAppliedDiscountCode(clean);
    return { success: true, message: `Discount code "${clean}" applied! (Note: Loyalty points cannot be combined)` };
  };

  const removeDiscountCode = () => {
    setAppliedDiscountCode('');
  };

  // Discount Admin management
  const addDiscount = (newDisc: Omit<Discount, 'id' | 'usedCount'>) => {
    const disc: Discount = {
      ...newDisc,
      id: `disc-${Date.now()}`,
      usedCount: 0,
      code: newDisc.code.trim().toUpperCase(),
    };
    const next = [disc, ...discounts];
    setDiscounts(next);
    syncStoreToServer({ discounts: next });
  };

  const updateDiscount = (id: string, updates: Partial<Discount>) => {
    const next = discounts.map((d) => (d.id === id ? { ...d, ...updates } : d));
    setDiscounts(next);
    syncStoreToServer({ discounts: next });
  };

  const deleteDiscount = (id: string) => {
    const next = discounts.filter((d) => d.id !== id);
    setDiscounts(next);
    if (appliedDiscount?.id === id) setAppliedDiscountCode('');
    syncStoreToServer({ discounts: next });
  };

  // LOYALTY POINTS ENGINE:
  // Rule: Users earn 10 points for every 300 Rs spent!
  // Rule: Points CANNOT be redeemed alone! Minimum Rs 500 cart order is required.
  // Rule: Points CANNOT be combined with any other discount coupon!
  const minPointsRedemptionAmount = 500;
  const userPoints = currentUser?.loyaltyPoints || 0;
  const canRedeemPoints = userPoints > 0 && cartSubtotal >= minPointsRedemptionAmount && !hasActiveDiscountCoupon;

  // 1 Point = 1 PKR
  const subtotalAfterCoupon = Math.max(0, cartSubtotal - discountAmount);
  const maxRedeemablePoints = canRedeemPoints ? Math.min(userPoints, subtotalAfterCoupon) : 0;
  const loyaltyDiscountAmount = isRedeemingPoints && canRedeemPoints ? maxRedeemablePoints : 0;

  // VIP Membership Lifetime Discount Engine (Flat 3%, 6%, or 8% OFF for approved VIPs)
  const activeVipTier = DEFAULT_VIP_TIERS.find((t) => t.id === currentUser?.vipTier);
  const isVipActive = Boolean(currentUser?.vipStatus === 'active' && activeVipTier);
  const vipDiscountAmount = isVipActive && cartSubtotal > 0 && activeVipTier
    ? Math.round((cartSubtotal * activeVipTier.discountPercentage) / 100)
    : 0;

  // Potential points to earn: 10 points for every 300 Rs spent on food
  const netFoodPaid = Math.max(0, cartSubtotal - discountAmount - loyaltyDiscountAmount - vipDiscountAmount);
  const potentialPointsToEarn = Math.floor(netFoodPaid / 300) * 10;

  // Effective Delivery Fee from Selected Delivery Method
  let baseDeliveryFee = selectedDeliveryMethod.price || 399;
  if (selectedDeliveryMethod.minOrderAmount && cartSubtotal >= selectedDeliveryMethod.minOrderAmount) {
    baseDeliveryFee = 0;
  }
  const effectiveDeliveryFee = isFreeShippingApplied ? 0 : baseDeliveryFee;

  // Cart Grand Total
  const cartTotal = cartSubtotal > 0
    ? Math.max(0, cartSubtotal - discountAmount - loyaltyDiscountAmount - vipDiscountAmount) + effectiveDeliveryFee
    : 0;

  // Cart operations
  const addToCart = (item: MenuItem, options?: CartItemOption, quantity: number = 1) => {
    const effectiveUnitPrice = getItemEffectivePrice(item);
    const addonsTotal = options?.addons?.reduce((sum, a) => sum + a.price, 0) || 0;
    const finalUnitPrice = effectiveUnitPrice + addonsTotal;

    const cartItemId = `${item.id}-${options?.spiceLevel || 'regular'}-${options?.drink || 'none'}-${
      options?.addons?.map((a) => a.id).sort().join(',') || 'no-addons'
    }`;

    setCart((prev) => {
      const existing = prev.find((ci) => ci.cartItemId === cartItemId);
      if (existing) {
        return prev.map((ci) =>
          ci.cartItemId === cartItemId ? { ...ci, quantity: ci.quantity + quantity } : ci
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          menuItem: item,
          quantity,
          unitPrice: finalUnitPrice,
          options: options || { addons: [] },
        },
      ];
    });

    // Do not force open modal on add, sticky bottom cart bar appears cleanly
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((ci) => (ci.cartItemId === cartItemId ? { ...ci, quantity: newQty } : ci))
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedDiscountCode('');
    setIsRedeemingPoints(false);
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const toggleWishlist = (itemId: string) => {
    setWishlist((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const createOrder = (
    customer: CustomerDetails, 
    paymentMethod: PaymentMethod,
    specialInstructions?: string
  ): Order => {
    const rawKfcSubtotal = cart.reduce((acc, ci) => {
      const baseRaw = ci.menuItem.baseKfcPrice;
      const addons = ci.options.addons.reduce((a, b) => a + b.price, 0);
      return acc + (baseRaw + addons) * ci.quantity;
    }, 0);

    const markupAmount = Math.max(0, cartSubtotal - rawKfcSubtotal);
    const actualLoyaltyDiscount = isRedeemingPoints && canRedeemPoints ? loyaltyDiscountAmount : 0;

    const newOrder: Order = {
      id: `CKW-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      orderType: 'delivery',
      items: [...cart],
      subtotal: cartSubtotal,
      markupAmount,
      deliveryFee: effectiveDeliveryFee,
      discount: discountAmount,
      loyaltyPointsEarned: potentialPointsToEarn,
      loyaltyPointsRedeemed: actualLoyaltyDiscount,
      loyaltyDiscount: actualLoyaltyDiscount,
      vipDiscount: vipDiscountAmount,
      vipTierApplied: isVipActive && currentUser?.vipTier ? currentUser.vipTier : undefined,
      total: cartTotal,
      customer: {
        ...customer,
        notes: specialInstructions || customer.notes,
      },
      specialInstructions: specialInstructions || customer.notes,
      paymentMethod,
      status: 'confirmed',
    };

    // Loyalty Points notification and transaction history recording
    if (potentialPointsToEarn > 0) {
      setPointsEarnedNotice(potentialPointsToEarn);
      const earnTx: LoyaltyTransaction = {
        id: `tx-${Date.now()}-earn`,
        customerId: currentUser?.id || 'guest',
        type: 'earned',
        points: potentialPointsToEarn,
        description: `Earned on Order #${newOrder.id.slice(-6)}`,
        orderId: newOrder.id,
        date: new Date().toISOString(),
      };
      setLoyaltyTransactions((prev) => {
        const next = [earnTx, ...prev];
        localStorage.setItem(LOYALTY_TX_KEY, JSON.stringify(next));
        return next;
      });
    }

    if (actualLoyaltyDiscount > 0) {
      const redeemTx: LoyaltyTransaction = {
        id: `tx-${Date.now()}-redeem`,
        customerId: currentUser?.id || 'guest',
        type: 'redeemed',
        points: actualLoyaltyDiscount,
        description: `Redeemed on Order #${newOrder.id.slice(-6)}`,
        orderId: newOrder.id,
        date: new Date().toISOString(),
      };
      setLoyaltyTransactions((prev) => {
        const next = [redeemTx, ...prev];
        localStorage.setItem(LOYALTY_TX_KEY, JSON.stringify(next));
        return next;
      });
    }

    // Update Customer loyalty balance & address book
    if (currentUser) {
      const existingAddresses = currentUser.savedAddresses || [];
      const hasAddr = existingAddresses.some(
        (a) => a.address.toLowerCase().trim() === customer.address.toLowerCase().trim()
      );
      const updatedAddresses = hasAddr
        ? existingAddresses
        : [...existingAddresses, { id: `addr-${Date.now()}`, label: 'Recent Order', address: customer.address.trim() }];

      const updatedBalance = Math.max(0, (currentUser.loyaltyPoints || 0) - actualLoyaltyDiscount) + potentialPointsToEarn;
      const updatedUser: CustomerUser = {
        ...currentUser,
        fullName: customer.fullName || currentUser.fullName,
        phone: customer.phone || currentUser.phone,
        address: customer.address || currentUser.address,
        savedAddresses: updatedAddresses,
        loyaltyPoints: updatedBalance,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));

      // Sync customer record to server
      const existingRecord = customerRecords.find((c) => c.phone === currentUser.phone);
      const recordPayload: CustomerLoyaltyRecord = {
        id: currentUser.id,
        fullName: customer.fullName || currentUser.fullName,
        phone: customer.phone || currentUser.phone,
        address: customer.address || currentUser.address,
        email: currentUser.email,
        loyaltyPoints: updatedBalance,
        totalOrdersCount: (existingRecord?.totalOrdersCount || 0) + 1,
        totalSpent: (existingRecord?.totalSpent || 0) + cartTotal,
        createdAt: currentUser.createdAt,
        lastOrderDate: new Date().toISOString(),
      };

      fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordPayload),
      }).catch(() => {});
    }

    // If discount was used, increment usage count
    if (appliedDiscount) {
      updateDiscount(appliedDiscount.id, { usedCount: appliedDiscount.usedCount + 1 });
    }

    // Save order
    setAllOrders((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    clearCart();
    setIsCheckoutOpen(false);

    // Save to server
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(() => {});

    // Play chime sound
    if (settings.orderNotificationSound !== false) {
      playNewOrderChime();
    }

    return newOrder;
  };

  const clearActiveOrder = () => setActiveOrder(null);

  // Theme toggle: Permanently light/day theme as requested by user
  const themeMode: ThemeMode = 'light';
  const toggleTheme = () => {
    updateSettings({ themeMode: 'light' });
  };

  // Product View
  const viewProduct = (item: MenuItem) => {
    setSelectedProduct(item);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setCurrentView('home');
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWishlist = () => {
    setCurrentView('wishlist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reviews
  const addReview = (reviewData: Omit<ProductReview, 'id' | 'date'>) => {
    const newRev: ProductReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  // Customer User Auth
  const signupUser = (data: { fullName: string; phone: string; address: string; email?: string }) => {
    const initialAddresses: CustomerAddress[] = [
      {
        id: `addr-${Date.now()}`,
        label: 'Home',
        address: data.address.trim(),
        isDefault: true,
      },
    ];
    const newUser: CustomerUser = {
      id: `usr-${Date.now()}`,
      ...data,
      savedAddresses: initialAddresses,
      loyaltyPoints: 50, // 50 Welcome bonus loyalty points!
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(newUser));
    setIsCustomerAuthModalOpen(false);

    // Sync to server customers
    const recordPayload: CustomerLoyaltyRecord = {
      id: newUser.id,
      fullName: newUser.fullName,
      phone: newUser.phone,
      address: newUser.address,
      email: newUser.email,
      loyaltyPoints: 50,
      totalOrdersCount: 0,
      totalSpent: 0,
      createdAt: newUser.createdAt,
    };
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recordPayload),
    }).catch(() => {});
  };

  const loginUser = (phone: string): boolean => {
    if (currentUser && currentUser.phone === phone) {
      setIsCustomerAuthModalOpen(false);
      return true;
    }
    const existing = customerRecords.find((c) => c.phone === phone);
    const existingAddr = existing?.address || 'Within 3 KM (Chakwal City)';
    const newUser: CustomerUser = {
      id: existing?.id || `usr-${Date.now()}`,
      fullName: existing?.fullName || 'Customer',
      phone,
      address: existingAddr,
      savedAddresses: [
        {
          id: `addr-${Date.now()}`,
          label: 'Default Address',
          address: existingAddr,
          isDefault: true,
        },
      ],
      loyaltyPoints: existing?.loyaltyPoints ?? 50,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    setCurrentUser(newUser);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(newUser));
    setIsCustomerAuthModalOpen(false);
    return true;
  };

  const addSavedAddress = (label: string, address: string) => {
    if (!currentUser) return;
    const newAddr: CustomerAddress = {
      id: `addr-${Date.now()}`,
      label: label.trim() || 'Address',
      address: address.trim(),
    };
    const currentList = currentUser.savedAddresses || [];
    const updatedUser: CustomerUser = {
      ...currentUser,
      address: address.trim(),
      savedAddresses: [...currentList, newAddr],
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));

    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser),
    }).catch(() => {});
  };

  const deleteSavedAddress = (addressId: string) => {
    if (!currentUser) return;
    const currentList = currentUser.savedAddresses || [];
    const filtered = currentList.filter((a) => a.id !== addressId);
    const updatedUser: CustomerUser = {
      ...currentUser,
      address: filtered[0]?.address || currentUser.address,
      savedAddresses: filtered,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
  };

  const repeatOrder = (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    setCart(
      order.items.map((ci) => ({
        ...ci,
        cartItemId: `${ci.menuItem.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      }))
    );
    setIsCartOpen(true);
  };

  const sendPhoneOtp = async (phoneNumber: string, recaptchaContainerId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      let clean = phoneNumber.trim().replace(/[\s-]/g, '');
      if (clean.startsWith('03')) {
        clean = '+92' + clean.slice(1);
      } else if (!clean.startsWith('+')) {
        clean = '+92' + clean;
      }

      const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: 'invisible',
      });

      const confirmation = await signInWithPhoneNumber(auth, clean, verifier);
      setPhoneConfirmationResult(confirmation);
      setIsOtpSent(true);
      return { success: true };
    } catch (err: any) {
      console.error('sendPhoneOtp error:', err);
      return { success: false, error: err.message || 'Failed to send SMS OTP code. Please check your phone number.' };
    }
  };

  const verifyPhoneOtp = async (
    otpCode: string,
    profileDetails?: { fullName: string; defaultAddress?: string; email?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!phoneConfirmationResult) {
        return { success: false, error: 'OTP session expired. Please request a new code.' };
      }
      const cred = await phoneConfirmationResult.confirm(otpCode.trim());
      const user = cred.user;

      const userDocRef = doc(db, 'customers', user.uid);
      const userDoc = await getDoc(userDocRef);

      let customerProfile: CustomerUser;
      if (userDoc.exists()) {
        const data = userDoc.data() as any;
        customerProfile = {
          id: user.uid,
          fullName: profileDetails?.fullName || data.fullName || 'Customer',
          phone: user.phoneNumber || data.phone || '',
          email: profileDetails?.email || data.email,
          address: profileDetails?.defaultAddress || data.defaultAddress || '',
          defaultAddress: profileDetails?.defaultAddress || data.defaultAddress || '',
          savedAddresses: data.savedAddresses || [],
          loyaltyPoints: data.loyaltyPoints || 0,
          vipTier: data.vipTier,
          totalSpent: data.totalSpent || 0,
          ordersCount: data.totalOrdersCount || 0,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        if (profileDetails?.fullName && profileDetails.fullName !== data.fullName) {
          await updateDoc(userDocRef, { fullName: profileDetails.fullName });
        }
      } else {
        customerProfile = {
          id: user.uid,
          fullName: profileDetails?.fullName || 'Customer',
          phone: user.phoneNumber || '',
          email: profileDetails?.email,
          address: profileDetails?.defaultAddress || '',
          defaultAddress: profileDetails?.defaultAddress || '',
          savedAddresses: profileDetails?.defaultAddress
            ? [{ id: `addr-${Date.now()}`, label: 'Home', address: profileDetails.defaultAddress, isDefault: true }]
            : [],
          loyaltyPoints: 50,
          totalSpent: 0,
          ordersCount: 0,
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, customerProfile);
      }

      setCurrentUser(customerProfile);
      setIsCustomerAuthModalOpen(false);
      setIsOtpSent(false);
      return { success: true };
    } catch (err: any) {
      console.error('verifyPhoneOtp error:', err);
      return { success: false, error: err.message || 'Invalid or expired OTP code' };
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch {}
    setCurrentUser(null);
    localStorage.removeItem(CUSTOMER_USER_KEY);
    setIsRedeemingPoints(false);
  };

  const openPolicyModal = (slug?: string) => {
    if (slug) setActivePolicySlug(slug);
    setIsPoliciesModalOpen(true);
  };

  const updatePolicy = (policy: StorePolicy) => {
    const next = policies.map((p) => (p.id === policy.id ? policy : p));
    setPolicies(next);
    syncStoreToServer({ policies: next });
  };

  const addPolicy = (policy: Omit<StorePolicy, 'id'>) => {
    const newPol: StorePolicy = {
      ...policy,
      id: `pol-${Date.now()}`,
    };
    const next = [...policies, newPol];
    setPolicies(next);
    syncStoreToServer({ policies: next });
  };

  const deletePolicy = (policyId: string) => {
    const next = policies.filter((p) => p.id !== policyId);
    setPolicies(next);
    syncStoreToServer({ policies: next });
  };

  const updateCustomSection = (section: PageSection) => {
    const current = settings.customSections || [];
    const next = current.map((s) => (s.id === section.id ? section : s));
    updateSettings({ customSections: next });
  };

  const addCustomSection = (section: PageSection) => {
    const current = settings.customSections || [];
    updateSettings({ customSections: [...current, section] });
  };

  const deleteCustomSection = (sectionId: string) => {
    const current = settings.customSections || [];
    updateSettings({ customSections: current.filter((s) => s.id !== sectionId) });
  };

  // VIP Membership Actions
  const requestVipMembership = (
    tierId: VipTierId,
    paymentMethod: 'jazzcash' | 'easypaisa' | 'bank_transfer',
    transactionId: string
  ) => {
    const tier = DEFAULT_VIP_TIERS.find((t) => t.id === tierId) || DEFAULT_VIP_TIERS[0];
    const newReq: VipMembershipRequest = {
      id: `vip-req-${Date.now()}`,
      customerId: currentUser?.id || `cust-${Date.now()}`,
      customerName: currentUser?.fullName || 'VIP Customer',
      phone: currentUser?.phone || '03252777574',
      tierId,
      amount: tier.price,
      paymentMethod,
      transactionId,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    const nextReqs = [newReq, ...vipRequests];
    setVipRequests(nextReqs);
    localStorage.setItem(VIP_REQUESTS_KEY, JSON.stringify(nextReqs));

    if (currentUser) {
      const updatedUser: CustomerUser = {
        ...currentUser,
        vipTier: tierId,
        vipStatus: 'pending',
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const approveVipRequest = (requestId: string) => {
    const req = vipRequests.find((r) => r.id === requestId);
    if (!req) return;
    const nextReqs = vipRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'approved' as const, approvedAt: new Date().toISOString() } : r
    );
    setVipRequests(nextReqs);
    localStorage.setItem(VIP_REQUESTS_KEY, JSON.stringify(nextReqs));

    if (currentUser && (currentUser.id === req.customerId || currentUser.phone === req.phone)) {
      const updatedUser: CustomerUser = {
        ...currentUser,
        vipTier: req.tierId,
        vipStatus: 'active',
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
    }

    setCustomerRecords((prev) =>
      prev.map((c) => (c.phone === req.phone ? { ...c, vipTier: req.tierId } : c))
    );
  };

  const rejectVipRequest = (requestId: string) => {
    const nextReqs = vipRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'rejected' as const } : r
    );
    setVipRequests(nextReqs);
    localStorage.setItem(VIP_REQUESTS_KEY, JSON.stringify(nextReqs));
  };

  // WhatsApp-First Lifetime VIP Pass Order (No TID required)
  const requestVipMembershipWhatsApp = (
    tierId: VipTierId,
    customerName: string,
    phone: string,
    email?: string
  ): VipMembershipRequest => {
    const tier = DEFAULT_VIP_TIERS.find((t) => t.id === tierId) || DEFAULT_VIP_TIERS[0];
    const newReq: VipMembershipRequest = {
      id: `vip-req-${Date.now()}`,
      customerId: currentUser?.id || `cust-${Date.now()}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      tierId,
      amount: tier.price,
      paymentMethod: 'whatsapp',
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    const nextReqs = [newReq, ...vipRequests.filter((r) => r.phone !== phone.trim() || r.status === 'approved')];
    setVipRequests(nextReqs);
    localStorage.setItem(VIP_REQUESTS_KEY, JSON.stringify(nextReqs));

    if (currentUser) {
      const updatedUser: CustomerUser = {
        ...currentUser,
        vipTier: tierId,
        vipStatus: 'pending',
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
    }
    return newReq;
  };

  // Manually grant Lifetime VIP Pass by admin
  const grantVipMembershipManual = (customerPhoneOrId: string, tierId: VipTierId) => {
    const tier = DEFAULT_VIP_TIERS.find((t) => t.id === tierId) || DEFAULT_VIP_TIERS[0];
    const newReq: VipMembershipRequest = {
      id: `vip-grant-${Date.now()}`,
      customerId: customerPhoneOrId,
      customerName: 'VIP Customer',
      phone: customerPhoneOrId,
      tierId,
      amount: tier.price,
      paymentMethod: 'bank_transfer',
      requestedAt: new Date().toISOString(),
      status: 'approved',
      approvedAt: new Date().toISOString(),
      notes: 'Manually granted by admin',
    };
    const nextReqs = [newReq, ...vipRequests];
    setVipRequests(nextReqs);
    localStorage.setItem(VIP_REQUESTS_KEY, JSON.stringify(nextReqs));

    setCustomerRecords((prev) =>
      prev.map((c) =>
        c.phone === customerPhoneOrId || c.id === customerPhoneOrId ? { ...c, vipTier: tierId } : c
      )
    );

    if (currentUser && (currentUser.phone === customerPhoneOrId || currentUser.id === customerPhoneOrId)) {
      const updatedUser: CustomerUser = {
        ...currentUser,
        vipTier: tierId,
        vipStatus: 'active',
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
    }
  };

  // Order Editing (Shopify-style: add/remove items, adjust quantities, discount, shipping, customer details)
  const editOrder = (orderId: string, updatedFields: Partial<Order>) => {
    setAllOrders((prev) => {
      const next = prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const merged: Order = { ...ord, ...updatedFields };
        if (updatedFields.items) {
          const sub = updatedFields.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
          merged.subtotal = sub;
          merged.total = Math.max(
            0,
            sub +
              (merged.deliveryFee || 0) -
              (merged.discount || 0) -
              (merged.loyaltyDiscount || 0) -
              (merged.vipDiscount || 0)
          );
        }
        return merged;
      });
      localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(next));
      const target = next.find((o) => o.id === orderId);
      if (target) {
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target),
        }).catch(() => {});
      }
      return next;
    });
  };

  // Single Customer Manual Add, Edit, Delete
  const addCustomer = (customerData: Partial<CustomerLoyaltyRecord>) => {
    const newCust: CustomerLoyaltyRecord = {
      id: `cust-${Date.now()}`,
      fullName: customerData.fullName || 'Customer',
      phone: customerData.phone || '03001234567',
      email: customerData.email || '',
      address: customerData.address || 'Chakwal City',
      loyaltyPoints: customerData.loyaltyPoints ?? 50,
      vipTier: customerData.vipTier,
      totalOrdersCount: customerData.totalOrdersCount ?? 0,
      totalSpent: customerData.totalSpent ?? 0,
      createdAt: new Date().toISOString(),
    };
    setCustomerRecords((prev) => {
      const next = [newCust, ...prev];
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(next));
      return next;
    });
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCust),
    }).catch(() => {});
  };

  const updateCustomer = (customerId: string, updatedData: Partial<CustomerLoyaltyRecord>) => {
    setCustomerRecords((prev) => {
      const next = prev.map((c) =>
        c.id === customerId || c.phone === customerId ? { ...c, ...updatedData } : c
      );
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const deleteCustomer = (customerId: string) => {
    setCustomerRecords((prev) => {
      const next = prev.filter((c) => c.id !== customerId && c.phone !== customerId);
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Admin User Authorization Management
  const addAdminUser = (
    name: string,
    email: string,
    pin: string,
    role: 'Super Admin' | 'Manager' = 'Manager'
  ) => {
    const cur = settings.adminUsers || [
      {
        id: 'admin-1',
        name: 'Master Admin',
        email: 'kfcchakwal@gmail.com',
        role: 'Super Admin',
        addedAt: '2026-09-01',
      },
    ];
    const newAdmin = {
      id: `admin-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      addedAt: new Date().toISOString(),
    };
    updateSettings({ adminUsers: [...cur, newAdmin] });
  };

  const deleteAdminUser = (adminId: string) => {
    const cur = settings.adminUsers || [];
    if (cur.length <= 1) {
      alert('At least one admin user must be maintained in the system.');
      return;
    }
    updateSettings({ adminUsers: cur.filter((a) => a.id !== adminId) });
  };

  // Push / Web Notification Permission
  const [customerNotificationAllowed, setCustomerNotificationAllowed] = useState<boolean>(() => {
    return localStorage.getItem('kfc_notifications_allowed') === 'true';
  });

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      setCustomerNotificationAllowed(true);
      localStorage.setItem('kfc_notifications_allowed', 'true');
      return true;
    }
    try {
      const res = await Notification.requestPermission();
      const granted = res === 'granted';
      setCustomerNotificationAllowed(granted);
      localStorage.setItem('kfc_notifications_allowed', granted ? 'true' : 'false');
      return granted;
    } catch {
      setCustomerNotificationAllowed(true);
      localStorage.setItem('kfc_notifications_allowed', 'true');
      return true;
    }
  };

  // Custom Domain Integration
  const updateCustomDomain = (newConfig: Partial<CustomDomainConfig>) => {
    const updated = { ...(settings.customDomain || DEFAULT_CUSTOM_DOMAIN_CONFIG), ...newConfig };
    updateSettings({ customDomain: updated });
  };

  // Meta Commerce (Facebook & Instagram Ads Manager)
  const updateMetaCommerce = (newConfig: Partial<MetaCommerceConfig>) => {
    const updated = { ...(settings.metaCommerce || DEFAULT_META_COMMERCE_CONFIG), ...newConfig };
    updateSettings({ metaCommerce: updated });
  };

  // Automated 12-Hour Review Collection Flow
  const updateAutoReview = (newConfig: Partial<AutoReviewConfig>) => {
    const updated = { ...(settings.autoReview || DEFAULT_AUTO_REVIEW_CONFIG), ...newConfig };
    updateSettings({ autoReview: updated });
  };

  const sendReviewCollectionWhatsapp = (order: Order) => {
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;
    const text = encodeURIComponent(
      `Assalam o Alaikum ${order.customer.fullName}! Umeed hai aap ka KFC meal bohot crispy aur lazeez tha. Baraye meherbani 1 minute nikaal kar apna review submit karein: ${window.location.origin}/#reviews - Review par aapko 20 FREE KFC Loyalty Points milenge!`
    );
    window.open(`https://wa.me/${intlPhone}?text=${text}`, '_blank');
  };

  // Abandoned Checkouts
  const recordAbandonedCheckout = (customer: CustomerDetails) => {
    if (!customer.phone || cart.length === 0) return;
    const existing = abandonedCheckouts.find((c) => c.phone === customer.phone && c.recoveryStatus === 'pending');
    if (existing) return;

    const newAb: AbandonedCheckout = {
      id: `ab-${Date.now()}`,
      customerName: customer.fullName || 'Guest',
      phone: customer.phone,
      address: customer.address,
      items: [...cart],
      cartTotal,
      createdAt: new Date().toISOString(),
      recoveryStatus: 'pending',
    };
    const next = [newAb, ...abandonedCheckouts];
    setAbandonedCheckouts(next);
    localStorage.setItem(ABANDONED_CHECKOUTS_KEY, JSON.stringify(next));
  };

  const markAbandonedCheckoutRecovered = (id: string) => {
    const next = abandonedCheckouts.map((a) => (a.id === id ? { ...a, recoveryStatus: 'recovered' as const } : a));
    setAbandonedCheckouts(next);
    localStorage.setItem(ABANDONED_CHECKOUTS_KEY, JSON.stringify(next));
  };

  const sendAbandonedRecoveryWhatsapp = (checkout: AbandonedCheckout) => {
    const cleanPhone = checkout.phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;
    const itemsSummary = checkout.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ') || 'KFC Meal';
    const text = encodeURIComponent(
      `Assalam o Alaikum ${checkout.customerName}! Aap ka KFC Chakwal Delivery bucket ready hai (${itemsSummary}) Total: Rs. ${checkout.cartTotal}. Kya aap abhi order confirm karna chahte hain? Hum Kallar Kahar se fresh KFC lekar aa rahe hain!`
    );
    window.open(`https://wa.me/${intlPhone}?text=${text}`, '_blank');

    const next = abandonedCheckouts.map((a) =>
      a.id === checkout.id ? { ...a, recoveryStatus: 'message_sent' as const, lastMessageSentAt: new Date().toISOString() } : a
    );
    setAbandonedCheckouts(next);
    localStorage.setItem(ABANDONED_CHECKOUTS_KEY, JSON.stringify(next));
  };

  // Bulk Marketing Campaigns
  const createMarketingBroadcast = (campaign: Omit<MarketingCampaign, 'id' | 'sentAt'>) => {
    const newCamp: MarketingCampaign = {
      ...campaign,
      id: `camp-${Date.now()}`,
      sentAt: new Date().toISOString(),
    };
    const next = [newCamp, ...marketingCampaigns];
    setMarketingCampaigns(next);
    localStorage.setItem(MARKETING_KEY, JSON.stringify(next));
  };

  // Customers Import & Export
  const exportCustomersCSV = () => {
    const headers = ['ID', 'Full Name', 'Phone', 'Email', 'Address', 'Loyalty Points', 'VIP Tier', 'Total Orders', 'Total Spent (PKR)', 'Joined Date'];
    const rows = customerRecords.map((c) => [
      c.id,
      `"${(c.fullName || '').replace(/"/g, '""')}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      c.loyaltyPoints || 0,
      c.vipTier || 'None',
      c.totalOrdersCount || 0,
      c.totalSpent || 0,
      c.createdAt || '',
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const importCustomersCSV = (csvText: string) => {
    try {
      const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length < 2) return { imported: 0, errors: 1 };
      
      const newRecords: CustomerLoyaltyRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 2) {
          const name = parts[1] || parts[0];
          const phone = parts[2] || parts[1];
          const email = parts[3] || '';
          const address = parts[4] || '';
          const points = parseInt(parts[5], 10) || 50;
          if (phone) {
            newRecords.push({
              id: `cust-imp-${Date.now()}-${i}`,
              fullName: name || 'Customer',
              phone: phone,
              email: email,
              address: address || 'Chakwal',
              loyaltyPoints: points,
              totalOrdersCount: 1,
              totalSpent: 1200,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
      if (newRecords.length > 0) {
        setCustomerRecords((prev) => {
          const merged = [...newRecords, ...prev.filter((p) => !newRecords.some((n) => n.phone === p.phone))];
          localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(merged));
          return merged;
        });
        return { imported: newRecords.length, errors: 0 };
      }
      return { imported: 0, errors: 1 };
    } catch {
      return { imported: 0, errors: 1 };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettingsToDefault,
        calculatePrice,
        getItemEffectivePrice,
        formatPKR,
        updateCustomSection,
        addCustomSection,
        deleteCustomSection,
        bulkImportProducts,
        menuItems,
        updateMenuItem,
        addMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        resetMenuToDefault,
        deliveryMethods,
        selectedDeliveryMethodId,
        setSelectedDeliveryMethodId,
        selectedDeliveryMethod,
        updateDeliveryMethods,
        dailyDealConfig: settings.dailyDeal || DEFAULT_DAILY_DEAL,
        updateDailyDealConfig,
        discounts,
        appliedDiscountCode,
        appliedDiscount,
        discountAmount,
        applyDiscountCode,
        removeDiscountCode,
        addDiscount,
        updateDiscount,
        deleteDiscount,
        isRedeemingPoints,
        setIsRedeemingPoints,
        canRedeemPoints,
        hasActiveDiscountCoupon,
        minPointsRedemptionAmount,
        maxRedeemablePoints,
        loyaltyDiscountAmount,
        potentialPointsToEarn,
        customerRecords,
        fetchCustomers,
        updateCustomerPoints,
        policies,
        updatePolicy,
        addPolicy,
        deletePolicy,
        isPoliciesModalOpen,
        setIsPoliciesModalOpen,
        activePolicySlug,
        openPolicyModal,
        serverSyncStatus,
        syncStoreToServer,
        chakwalAreas,
        selectedArea,
        setSelectedArea,
        updateAreas,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        effectiveDeliveryFee,
        cartTotal,
        orderType: 'delivery',
        setOrderType,
        wishlist,
        toggleWishlist,
        activeOrder,
        createOrder,
        clearActiveOrder,
        playOrderSound: playNewOrderChime,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        isCartOpen,
        setIsCartOpen,
        isCustomizerOpen,
        setIsCustomizerOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        selectedItemForCustomization,
        setSelectedItemForCustomization,
        isSellerMode,
        setIsSellerMode,
        isAdmin,
        setIsAdmin,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        loginAdmin,
        logoutAdmin,
        currentView,
        setCurrentView,
        selectedProduct,
        viewProduct,
        goHome,
        openWishlist,
        themeMode,
        toggleTheme,
        reviews,
        addReview,
        deleteReview,
        currentUser,
        signupUser,
        loginUser,
        logoutUser,
        addSavedAddress,
        deleteSavedAddress,
        repeatOrder,
        isCustomerAuthModalOpen,
        setIsCustomerAuthModalOpen,
        allOrders,
        fetchOrders,
        updateOrderStatus,
        isOrdersDashboardOpen,
        setIsOrdersDashboardOpen,
        vipTiers,
        vipRequests,
        isVipModalOpen,
        setIsVipModalOpen,
        requestVipMembership,
        approveVipRequest,
        rejectVipRequest,
        vipDiscountAmount,
        loyaltyTransactions,
        isLoyaltyModalOpen,
        setIsLoyaltyModalOpen,
        pointsEarnedNotice,
        clearPointsEarnedNotice,
        isDailyDealsPopupOpen,
        setIsDailyDealsPopupOpen,
        updateCustomDomain,
        updateMetaCommerce,
        liveStats,
        abandonedCheckouts,
        recordAbandonedCheckout,
        markAbandonedCheckoutRecovered,
        sendAbandonedRecoveryWhatsapp,
        updateAutoReview,
        sendReviewCollectionWhatsapp,
        marketingCampaigns,
        createMarketingBroadcast,
        exportCustomersCSV,
        importCustomersCSV,
        categories,
        addCategory,
        editOrder,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        requestVipMembershipWhatsApp,
        grantVipMembershipManual,
        addAdminUser,
        deleteAdminUser,
        customerNotificationAllowed,
        setCustomerNotificationAllowed,
        requestNotificationPermission,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
