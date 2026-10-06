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
  // Customer identity is sourced only from Firebase Auth. Local storage is never trusted as authentication.
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(null);

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
        setCurrentUser(null);
        localStorage.removeItem(CUSTOMER_USER_KEY);
        return;
      }

      // Never retain a stale customer profile while Firebase is resolving the active identity.
      setCurrentUser(null);
      localStorage.removeItem(CUSTOMER_USER_KEY);

      // Check Admin permissions
      try {
        const tokenResult = await firebaseUser.getIdTokenResult();
        let isAuthorizedAdmin = false;
        if (tokenResult.claims.admin === true) {
          isAuthorizedAdmin = true;
        } else {
          const adminDoc = await getDoc(doc(db, 'adminUsers', firebaseUser.uid));
          if (adminDoc.exists() && adminDoc.data()?.role === 'admin' && adminDoc.data()?.active !== false) {
            isAuthorizedAdmin = true;
          }
        }
        setIsAdmin(isAuthorizedAdmin);
      } catch (err) {
        setIsAdmin(false);
        console.warn('Admin status evaluation notice:', err);
      }

      // Sync customer profile only for Firebase phone-authenticated customers.
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
          } else {
            // Authenticated phone user without a profile is still a valid Firebase identity,
            // but must not inherit a stale local profile.
            setCurrentUser(null);
          }
        } catch (e) {
          setCurrentUser(null);
          console.warn('Customer profile sync notice:', e);
        }
      } else {
        setCurrentUser(null);
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
    return [];
  });
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  // Loyalty Program Full Section
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOYALTY_TX_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
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
    return [];
  });

  const [liveStats] = useState<LiveStoreStats>({
    activeVisitors: 0,
    openCartsCount: 0,
    openCartsValue: 0,
    checkoutsInProgress: 0,
  });

  const [marketingCampaigns, setMarketingCampaigns] = useState<MarketingCampaign[]>(() => {
    try {
      const saved = localStorage.getItem(MARKETING_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });


