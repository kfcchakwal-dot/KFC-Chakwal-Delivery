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
  NavigationMenuItem,
  CustomPage,
  StoreBranch,
  RestaurantTenant,
  SubscriptionPlan,
  SubscriptionPaymentRecord,
  SubscriptionAuditLog,
  PlatformPaymentInstructions,
  RestaurantFeatures,
  RestaurantLimits,
} from '../types';
import {
  DEFAULT_SAAS_PLANS,
  DEFAULT_PLATFORM_PAYMENT_INSTRUCTIONS,
  DEFAULT_KFC_TENANT,
} from '../types/saas';
import { evaluateSubscription, calculateNextRenewalDate, type SubscriptionEvaluation } from '../utils/subscriptionUtils';

import {
  INITIAL_KFC_ITEMS,
  DEFAULT_STORE_SETTINGS,
  DEFAULT_CHAKWAL_AREAS,
  DEFAULT_DISCOUNTS,
  DEFAULT_STORE_POLICIES,
  DEFAULT_DELIVERY_METHODS,
  DEFAULT_DAILY_DEAL,
  DEFAULT_VIP_TIERS,
  DEFAULT_CUSTOM_DOMAIN_CONFIG,
  DEFAULT_META_COMMERCE_CONFIG,
  DEFAULT_AUTO_REVIEW_CONFIG,
  DEFAULT_NAVIGATION_MENU_ITEMS,
  DEFAULT_CUSTOM_PAGES,
  DEFAULT_BRANCHES,
  KFC_CATEGORIES,
} from '../data/kfcMenu';
import { playNewOrderChime } from '../utils/audioNotification';
import { fetchAllSourceProducts, mergeSourceProducts, type ImportStats } from '../utils/productImporter';
import { auth, app, db, firebaseConfig } from '../lib/firebase';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  runTransaction,
} from 'firebase/firestore';

let adminForegroundMessageUnsubscribe: (() => void) | null = null;

const getFriendlyAuthError = (error: any): string => {
  const code = String(error?.code || '');
  if (code === 'auth/popup-closed-by-user') return 'Google login window band ho gayi. Dobara try karein.';
  if (code === 'auth/popup-blocked') return 'Browser ne popup block kiya. Redirect login dobara try karein.';
  if (code === 'auth/unauthorized-domain') return 'Firebase Console > Authentication > Settings > Authorized domains mein kfc-chakwal-delivery.kfcchakwal.workers.dev add karein (aur agar custom app domain use ho to woh bhi).';
  if (code === 'auth/invalid-credential') return 'Google sign-in credential reject hui. Firebase mein Google provider aur Authorized domains check karein.';
  if (code === 'auth/operation-not-supported-in-this-environment') return 'Is browser environment mein popup login supported nahi. Redirect login use karein.';
  if (code === 'auth/web-storage-unsupported') return 'Browser storage/cookies block hain. Is site ke liye cookies aur site data allow karke dobara try karein.';
  if (code === 'auth/blocked') return 'Browser ya network ne sign-in block kiya. Pop-ups aur third-party sign-in cookies allow karein.';
  if (code === 'auth/credential-already-in-use') return 'Ye sign-in account pehle se doosray account ke sath linked hai.';
  if (code === 'auth/operation-not-allowed') return 'Firebase Console > Authentication > Sign-in method mein Google provider enable karein.';
  if (code === 'auth/network-request-failed') return 'Google/Firebase sign-in request network ya browser security se block hui. Internet active ho to redirect se dobara try karein; VPN/ad-blocker ya third-party cookies bhi check karein.';
  if (code === 'auth/requests-to-this-api-have-been-blocked') return 'Firebase Authentication request block ho rahi hai. Firebase API key restrictions, authorized domains aur browser extensions check karein.';
  if (code === 'auth/cancelled-popup-request') return 'Google login pehle se open hai. Us window ko complete karein.';
  if (code === 'auth/invalid-api-key') return 'Firebase API key invalid hai. Firebase app configuration check karein.';
  if (code === 'permission-denied' || code === 'firestore/permission-denied') return 'Customer profile save nahi hua. Firebase Console mein isi named Firestore database ke latest firestore.rules publish karein.';
  if (code === 'auth/too-many-requests') return 'Bohat zyada attempts hue. Kuch der baad dobara try karein.';
  if (code === 'auth/account-exists-with-different-credential') return 'Is email ka account kisi doosre sign-in method se hai. Pehle usi method se login karein.';
  return error?.message || 'Sign in nahi ho saka. Firebase Authentication settings check karein.';
};

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
  updateMenuItem: (item: MenuItem) => Promise<void> | void;
  updateProductStatus: (itemId: string, status: 'active' | 'draft') => Promise<void>;
  bulkUpdateProductStatus: (itemIds: string[], status: 'active' | 'draft') => Promise<{ success: boolean; updatedCount: number; failedIds: string[] }>;
  bulkDeleteMenuItems: (itemIds: string[]) => Promise<{ success: boolean; deletedCount: number; failedIds: string[] }>;
  importProductsFromSourceSite: () => Promise<{ success: boolean; stats: ImportStats }>;
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
  updateCustomerRecord: (customerId: string, updates: Partial<CustomerLoyaltyRecord>) => Promise<void>;

  // Store Policies
  policies: StorePolicy[];
  updatePolicy: (policy: StorePolicy) => Promise<boolean>;
  addPolicy: (policy: Omit<StorePolicy, 'id'>) => Promise<boolean>;
  deletePolicy: (policyId: string) => Promise<boolean>;
  isPoliciesModalOpen: boolean;
  setIsPoliciesModalOpen: (open: boolean) => void;
  activePolicySlug: string | null;
  openPolicyModal: (slug?: string) => void;

  // Server sync status
  serverSyncStatus: 'synced' | 'syncing' | 'offline';
  syncStoreToServer: (customPayload?: Record<string, any>) => Promise<boolean>;

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
  createOrder: (customer: CustomerDetails, paymentMethod: PaymentMethod, specialInstructions?: string) => Promise<Order>;
  repeatOrder: (order: Order) => void;
  clearActiveOrder: () => void;
  allOrders: Order[];
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updateOrderPaymentReceived: (orderId: string, amount: number) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  bulkDeleteOrders: (orderIds: string[]) => Promise<{ success: boolean; deletedCount: number; failedIds: string[] }>;
  playOrderSound: () => void;

  // Navigation & Filtering
  activeCategory: CategoryId;
  setActiveCategory: (cat: CategoryId) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentView: 'home' | 'product' | 'wishlist' | 'collection' | 'reviews' | 'rewards';
  setCurrentView: (view: 'home' | 'product' | 'wishlist' | 'collection' | 'reviews' | 'rewards') => void;
  selectedProduct: MenuItem | null;
  viewProduct: (item: MenuItem) => void;
  goHome: () => void;
  openWishlist: () => void;

  // Theme
  themeMode: ThemeMode;
  toggleTheme: () => void;

  // Reviews
  reviews: ProductReview[];
  addReview: (review: Omit<ProductReview, 'id' | 'date'>) => Promise<ProductReview>;
  deleteReview: (reviewId: string) => void;
  setReviewVisibility: (reviewId: string, visible: boolean) => Promise<void>;

  // Customer Account
  currentUser: CustomerUser | null;
  signupUser: (data: { fullName: string; email: string; password: string; emailMarketingConsent?: boolean }) => Promise<{ success: boolean; error?: string }>;
  loginUser: (email: string, password: string, emailMarketingConsent?: boolean) => Promise<{ success: boolean; error?: string }>;
  updateEmailMarketingConsent: (consent: boolean) => Promise<void>;
  resetCustomerPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
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
  loginAdmin: () => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  isOrdersDashboardOpen: boolean;
  setIsOrdersDashboardOpen: (open: boolean) => void;

  // VIP Club Program
  vipTiers: VipTier[];
  updateVipTierImage: (tierId: VipTierId, imageUrl: string) => Promise<void>;
  updateVipTier: (tierId: VipTierId, updates: Partial<VipTier>) => Promise<void>;
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
  getReviewWhatsAppUrl: (order: Order) => string;
  createReviewRequest: (order: Order, reviewUrl: string) => Promise<void>;
  sendTestReviewWhatsApp: (phone: string, customerName?: string) => string;

  // Navigation Menus & Custom Pages
  updateNavigationMenuItems: (items: NavigationMenuItem[]) => void;
  saveCustomPage: (page: CustomPage) => void;
  deleteCustomPage: (pageId: string) => void;

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
  requestVipMembershipWhatsApp: (tierId: VipTierId, customerName: string, phone: string, email?: string, amountOverride?: number) => Promise<VipMembershipRequest>;
  grantVipMembershipManual: (customerPhoneOrId: string, tierId: VipTierId) => void;

  // Admin Users
  addAdminUser: (name: string, email: string, pin: string, role?: 'Super Admin' | 'Manager') => void;
  deleteAdminUser: (adminId: string) => void;

  // Customer Push Notification Preferences
  customerNotificationAllowed: boolean;
  setCustomerNotificationAllowed: (allowed: boolean) => void;
  requestNotificationPermission: () => Promise<boolean>;
  registerAdminPushNotifications: () => Promise<boolean>;

  // Multiple Companies & Branches Architecture
  branches: StoreBranch[];
  activeBranch: StoreBranch;
  setActiveBranch: (branchId: string) => void;
  addBranch: (branch: Omit<StoreBranch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateBranch: (branchId: string, updates: Partial<StoreBranch>) => Promise<boolean>;
  deleteBranch: (branchId: string) => Promise<boolean>;

  // Real-time Multi-Device Cloud Sync
  pushAllSettingsToCloud: () => Promise<boolean>;
  lastCloudSyncTimestamp: string;

  // Multi-Restaurant SaaS Platform Architecture
  currentTenant: RestaurantTenant;
  tenantId: string;
  switchTenant: (tenantId: string) => void;
  isSuperAdmin: boolean;
  platformTenants: RestaurantTenant[];
  platformPlans: SubscriptionPlan[];
  subscriptionPayments: SubscriptionPaymentRecord[];
  platformPaymentInstructions: PlatformPaymentInstructions;
  submitSubscriptionPayment: (data: {
    amount: number;
    paymentMethod: string;
    transactionRef: string;
    paymentDate: string;
    proofUrl?: string;
    notes?: string;
  }) => Promise<boolean>;
  approveSubscriptionPayment: (paymentId: string) => Promise<boolean>;
  rejectSubscriptionPayment: (paymentId: string, reason: string) => Promise<boolean>;
  createRestaurantTenant: (tenant: Omit<RestaurantTenant, 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateRestaurantTenant: (tenantId: string, updates: Partial<RestaurantTenant>) => Promise<boolean>;
  extendRestaurantSubscription: (tenantId: string, days: number) => Promise<boolean>;
  toggleRestaurantSuspension: (tenantId: string, suspend: boolean, reason?: string) => Promise<boolean>;
  updatePlatformPaymentInstructions: (instructions: Partial<PlatformPaymentInstructions>) => Promise<boolean>;
  updatePlatformPlans: (plans: SubscriptionPlan[]) => Promise<boolean>;
  isSubscriptionSuspended: boolean;
  isSubscriptionGracePeriod: boolean;
  subscriptionEvaluation: SubscriptionEvaluation;
  checkFeatureAllowed: (featureKey: keyof RestaurantFeatures) => boolean;
  checkLimitExceeded: (limitKey: keyof RestaurantLimits, currentCount: number) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const SETTINGS_KEY = 'kfc_chakwal_settings_v5';
const MENU_KEY = 'kfc_chakwal_menu_v5';
const WISHLIST_KEY = 'kfc_chakwal_wishlist_v5';
const AREAS_KEY = 'kfc_chakwal_areas_v5';
const ACTIVE_ORDER_KEY = 'kfc_chakwal_active_order_v5';
const ALL_ORDERS_KEY = 'kfc_chakwal_all_orders_v5';
const ADMIN_AUTH_KEY = 'kcd_seller_auth_v5';
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
  // Detect Seller mode from URL (e.g. /seller, /admin, ?app=seller, ?admin=portal)
  const [isSellerMode, setIsSellerMode] = useState<boolean>(() => {
    try {
      const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
      const search = new URLSearchParams(window.location.search);
      return (
        pathname === '/seller' ||
        pathname === '/admin' ||
        search.get('app') === 'seller' ||
        search.get('app') === 'admin' ||
        search.get('admin') === 'portal' ||
        search.get('admin') === 'true' ||
        search.has('admin')
      );
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
          phone: parsed.phone || DEFAULT_STORE_SETTINGS.phone,
          whatsappNumber: parsed.whatsappNumber || DEFAULT_STORE_SETTINGS.whatsappNumber,
          deliveryRadiusText: parsed.deliveryRadiusText || DEFAULT_STORE_SETTINGS.deliveryRadiusText,
          themeMode: parsed.themeMode === 'dark' ? 'dark' : 'light',
          deliveryMethods: parsed.deliveryMethods || DEFAULT_DELIVERY_METHODS,
          dailyDeal: parsed.dailyDeal || DEFAULT_DAILY_DEAL,
          isHeaderSticky: parsed.isHeaderSticky !== false,
          navigationMenuItems: (parsed.navigationMenuItems && parsed.navigationMenuItems.length > 0) ? parsed.navigationMenuItems : DEFAULT_NAVIGATION_MENU_ITEMS,
          customPages: (parsed.customPages && parsed.customPages.length > 0) ? parsed.customPages : DEFAULT_CUSTOM_PAGES,
          companies: (parsed.companies && parsed.companies.length > 0) ? parsed.companies : DEFAULT_BRANCHES,
        };
      }
    } catch {}
    return DEFAULT_STORE_SETTINGS;
  });

  // Multiple Companies & Branches Architecture
  const [branches, setBranches] = useState<StoreBranch[]>(() => {
    try {
      const saved = localStorage.getItem('kcd_branches_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      if (settings.companies && settings.companies.length > 0) {
        return settings.companies;
      }
    } catch {}
    return DEFAULT_BRANCHES;
  });

  const [activeBranchId, setActiveBranchId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('kcd_active_branch_id_v1');
      if (saved) return saved;
    } catch {}
    return settings.activeBranchId || branches[0]?.id || 'branch-chakwal-main';
  });

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0] || DEFAULT_BRANCHES[0];
  const [lastCloudSyncTimestamp, setLastCloudSyncTimestamp] = useState<string>(() => new Date().toISOString());

  // Multi-Restaurant SaaS Platform Architecture State
  const [tenantId, setTenantId] = useState<string>(() => {
    try {
      const search = new URLSearchParams(window.location.search);
      const fromUrl = search.get('restaurant') || search.get('tenant') || search.get('r');
      if (fromUrl) return fromUrl.toLowerCase().trim();
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts[0] === 'r' && pathParts[1]) {
        return pathParts[1].toLowerCase().trim();
      }
      const saved = localStorage.getItem('kcd_active_tenant_id_v1');
      if (saved) return saved.toLowerCase().trim();
    } catch {}
    return 'kfc-chakwal';
  });

  const [currentTenant, setCurrentTenant] = useState<RestaurantTenant>(() => {
    try {
      const saved = localStorage.getItem(`kcd_tenant_profile_${tenantId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_KFC_TENANT;
  });

  const [platformTenants, setPlatformTenants] = useState<RestaurantTenant[]>([DEFAULT_KFC_TENANT]);
  const [platformPlans, setPlatformPlans] = useState<SubscriptionPlan[]>(DEFAULT_SAAS_PLANS);
  const [subscriptionPayments, setSubscriptionPayments] = useState<SubscriptionPaymentRecord[]>([]);
  const [platformPaymentInstructions, setPlatformPaymentInstructions] = useState<PlatformPaymentInstructions>(DEFAULT_PLATFORM_PAYMENT_INSTRUCTIONS);


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
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'wishlist' | 'collection' | 'reviews' | 'rewards'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let prod = params.get('product');
      if (!prod && window.location.hash.includes('product=')) {
        const hashSearch = window.location.hash.split('?')[1];
        if (hashSearch) prod = new URLSearchParams(hashSearch).get('product');
      }
      if (prod) return 'product';
      if (params.get('reviews') === 'true') return 'reviews';
      if (params.get('rewards') === 'true') return 'rewards';
      const saved = localStorage.getItem('kfc-current-view');
      return saved === 'product' || saved === 'wishlist' || saved === 'collection' || saved === 'reviews' || saved === 'rewards' ? saved : 'home';
    } catch { return 'home'; }
  });

  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let prodId = params.get('product');
      if (!prodId && window.location.hash.includes('product=')) {
        const hashSearch = window.location.hash.split('?')[1];
        if (hashSearch) prodId = new URLSearchParams(hashSearch).get('product');
      }
      if (prodId) {
        const normalized = prodId.trim().toLowerCase();
        const found = INITIAL_KFC_ITEMS.find((item) =>
          item.id.toLowerCase() === normalized ||
          encodeURIComponent(item.id).toLowerCase() === normalized ||
          item.id.toLowerCase().replace(/\s+/g, '-') === normalized
        );
        if (found) return found;
      }
      const savedId = localStorage.getItem('kfc-selected-product-id');
      if (savedId) {
        const found = INITIAL_KFC_ITEMS.find((item) => item.id === savedId);
        if (found) return found;
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    try { localStorage.setItem('kfc-current-view', currentView); } catch { /* storage can be disabled */ }
    try {
      const params = new URLSearchParams(window.location.search);
      let changed = false;
      if (currentView !== 'reviews' && params.has('reviews')) { params.delete('reviews'); changed = true; }
      if (currentView !== 'rewards' && params.has('rewards')) { params.delete('rewards'); changed = true; }
      if (changed) {
        const query = params.toString();
        window.history.replaceState({}, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
      }
    } catch { /* URL state is optional */ }
  }, [currentView]);

  // Keep selectedProduct in sync when menu items load or URL changes
  useEffect(() => {
    const handleUrlRoute = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        let prodId = params.get('product');
        if (!prodId && window.location.hash.includes('product=')) {
          const hashSearch = window.location.hash.split('?')[1];
          if (hashSearch) prodId = new URLSearchParams(hashSearch).get('product');
        }
        if (prodId && menuItems.length > 0) {
          const normalized = prodId.trim().toLowerCase();
          const found = menuItems.find((item) =>
            item.id.toLowerCase() === normalized ||
            encodeURIComponent(item.id).toLowerCase() === normalized ||
            item.id.toLowerCase().replace(/\s+/g, '-') === normalized
          );
          if (found) {
            setSelectedProduct(found);
            setCurrentView('product');
            return;
          }
        }
        if (params.get('reviews') === 'true') {
          setCurrentView('reviews');
          return;
        }
        if (params.get('rewards') === 'true') {
          setCurrentView('rewards');
          return;
        }
      } catch {}
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [menuItems]);

  useEffect(() => {
    if (currentView !== 'product' || selectedProduct) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('product');
      if (prodId) {
        const normalized = prodId.trim().toLowerCase();
        const found = menuItems.find((item) =>
          item.id.toLowerCase() === normalized ||
          encodeURIComponent(item.id).toLowerCase() === normalized ||
          item.id.toLowerCase().replace(/\s+/g, '-') === normalized
        );
        if (found) {
          setSelectedProduct(found);
          return;
        }
      }
      const savedId = localStorage.getItem('kfc-selected-product-id');
      if (savedId) {
        const savedProduct = menuItems.find((item) => item.id === savedId);
        if (savedProduct) setSelectedProduct(savedProduct);
        else if (menuItems.length) setCurrentView('home');
      }
    } catch { /* storage can be disabled */ }
  }, [currentView, selectedProduct, menuItems]);

  // Reviews
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  // Customer Account
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

  useEffect(() => {
    const handleUrlChange = () => {
      try {
        const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
        const search = new URLSearchParams(window.location.search);
        const isSeller =
          pathname === '/seller' ||
          pathname === '/admin' ||
          search.get('app') === 'seller' ||
          search.get('app') === 'admin' ||
          search.get('admin') === 'portal' ||
          search.get('admin') === 'true' ||
          search.has('admin');
        setIsSellerMode(isSeller);
      } catch {}
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Apply the administrator-selected brand accent color across supported brand utility classes.
  useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary', settings.primaryColor || '#e4002b');
    document.documentElement.style.setProperty('--brand-secondary', settings.secondaryColor || '#c30025');
    document.documentElement.style.setProperty('--store-background', settings.storeBackgroundColor || '#f8f9fa');
    document.documentElement.style.setProperty('--store-surface', settings.storeSurfaceColor || '#ffffff');
    document.documentElement.style.setProperty('--store-text', settings.storeTextColor || '#1a1a1f');
  }, [
    settings.primaryColor,
    settings.secondaryColor,
    settings.storeBackgroundColor,
    settings.storeSurfaceColor,
    settings.storeTextColor,
  ]);

  // Monitor Firebase Auth state for Admin and free Google/email Customer login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setIsAdmin(false);
        setCurrentUser(null);
        setAllOrders([]);
        setVipRequests([]);
        return;
      }

      let isAuthorizedAdmin = false;
      try {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const isSuperAdminEmail = firebaseUser.email?.toLowerCase() === 'kfcchakwal@gmail.com';
        isAuthorizedAdmin = isSuperAdminEmail || tokenResult.claims.admin === true;
        if (!isAuthorizedAdmin) {
          const adminDoc = await getDoc(doc(db, 'adminUsers', firebaseUser.uid));
          isAuthorizedAdmin =
            adminDoc.exists() &&
            adminDoc.data()?.role === 'admin' &&
            adminDoc.data()?.active !== false;
        }
        setIsAdmin(isAuthorizedAdmin);
      } catch (err) {
        console.warn('Admin status evaluation notice:', err);
        setIsAdmin(false);
      }

      // Load/create customer profile for Google or verified email accounts.
      if (!isAuthorizedAdmin) {
        try {
          const customerDocRef = doc(db, 'customers', firebaseUser.uid);
          const customerDoc = await getDoc(customerDocRef);
          const data: any = customerDoc.exists() ? customerDoc.data() : {};
          const customerProfile: CustomerUser = {
            id: firebaseUser.uid,
            fullName: data.fullName || firebaseUser.displayName || 'Customer',
            phone: data.phone || firebaseUser.phoneNumber || '',
            email: data.email || firebaseUser.email || '',
            address: data.defaultAddress || '',
            defaultAddress: data.defaultAddress || '',
            savedAddresses: data.savedAddresses || [],
            loyaltyPoints: Number(data.loyaltyPoints || 50),
            vipTier: data.vipTier,
            vipStatus: data.vipStatus,
            vipPaidAmount: Number(data.vipPaidAmount || 0),
            vipExpiresAt: data.vipExpiresAt || null,
            totalSpent: Number(data.totalSpent || 0),
            ordersCount: Number(data.totalOrdersCount || 0),
            createdAt: data.createdAt || new Date().toISOString(),
          };
          if (!customerDoc.exists()) {
            const initialCustomerRecord: Record<string, unknown> = {
              id: customerProfile.id,
              fullName: customerProfile.fullName,
              phone: data.phone || firebaseUser.phoneNumber || '',
              email: firebaseUser.email || '',
              address: customerProfile.address,
              defaultAddress: customerProfile.defaultAddress || '',
              savedAddresses: customerProfile.savedAddresses || [],
              loyaltyPoints: customerProfile.loyaltyPoints,
              totalSpent: customerProfile.totalSpent || 0,
              ordersCount: customerProfile.ordersCount || 0,
              createdAt: customerProfile.createdAt,
            };
            if (customerProfile.vipTier !== undefined) initialCustomerRecord.vipTier = customerProfile.vipTier;
            if (customerProfile.vipStatus !== undefined) initialCustomerRecord.vipStatus = customerProfile.vipStatus;
            await setDoc(customerDocRef, initialCustomerRecord, { merge: true });
          }
          setCurrentUser(customerProfile);
          localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(customerProfile));
          setIsCustomerAuthModalOpen(false);
        } catch (e) {
          // Authentication can succeed even if a temporary Firestore/rules issue blocks profile sync.
          // Keep the customer signed in locally without writing guessed profile data to Firestore.
          console.warn('Customer profile sync notice:', e);
          let cached: Partial<CustomerUser> | null = null;
          try {
            const raw = localStorage.getItem(CUSTOMER_USER_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            if (parsed?.id === firebaseUser.uid) cached = parsed;
          } catch {}
          const fallbackProfile: CustomerUser = {
            id: firebaseUser.uid,
            fullName: String(cached?.fullName || firebaseUser.displayName || 'Customer'),
            phone: String(cached?.phone || firebaseUser.phoneNumber || ''),
            email: String(cached?.email || firebaseUser.email || ''),
            address: String(cached?.address || cached?.defaultAddress || ''),
            defaultAddress: String(cached?.defaultAddress || cached?.address || ''),
            savedAddresses: Array.isArray(cached?.savedAddresses) ? cached!.savedAddresses as CustomerAddress[] : [],
            loyaltyPoints: Number(cached?.loyaltyPoints ?? 0),
            totalSpent: Number(cached?.totalSpent ?? 0),
            ordersCount: Number(cached?.ordersCount ?? 0),
            createdAt: String(cached?.createdAt || new Date().toISOString()),
            ...(cached?.vipTier !== undefined ? { vipTier: cached.vipTier } : {}),
            ...(cached?.vipStatus !== undefined ? { vipStatus: cached.vipStatus } : {}),
            ...(cached?.vipPaidAmount !== undefined ? { vipPaidAmount: cached.vipPaidAmount } : {}),
            ...(cached?.vipExpiresAt !== undefined ? { vipExpiresAt: cached.vipExpiresAt } : {}),
          };
          setCurrentUser(fallbackProfile);
          localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(fallbackProfile));
          setIsCustomerAuthModalOpen(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isOrdersDashboardOpen, setIsOrdersDashboardOpen] = useState(false);

  // Orders are loaded only from the authenticated server; local storage is never trusted for order access.
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  const previousOrderCountRef = useRef<number>(allOrders.length);
  const ordersInitializedRef = useRef(false);
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
  const [vipTiers, setVipTiers] = useState<VipTier[]>(DEFAULT_VIP_TIERS);
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'vipTiers'), (snapshot) => {
      if (snapshot.empty) return;
      const saved = new Map(snapshot.docs.map((item) => [item.id, item.data() as Partial<VipTier>]));
      setVipTiers(DEFAULT_VIP_TIERS.map((tier) => ({ ...tier, ...(saved.get(tier.id) || {}) })));
    }, (error) => console.warn('VIP pass image sync notice:', error));
    return unsubscribe;
  }, []);
  const updateVipTierImage = async (tierId: VipTierId, imageUrl: string) => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    if (imageUrl.startsWith('data:') && imageUrl.length > 850000) {
      throw new Error('Image bohat bari hai. 600 KB se chhoti/compressed image upload karein.');
    }
    const tier = vipTiers.find((item) => item.id === tierId) || DEFAULT_VIP_TIERS.find((item) => item.id === tierId);
    if (!tier) throw new Error('VIP pass nahi mila.');
    await setDoc(doc(db, 'vipTiers', tierId), { ...tier, imageUrl, updatedAt: new Date().toISOString() }, { merge: true });
    setVipTiers((prev) => prev.map((item) => item.id === tierId ? { ...item, imageUrl } : item));
  };
  const updateVipTier = async (tierId: VipTierId, updates: Partial<VipTier>) => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    const tier = vipTiers.find((item) => item.id === tierId) || DEFAULT_VIP_TIERS.find((item) => item.id === tierId);
    if (!tier) throw new Error('VIP tier not found.');
    const updated = { ...tier, ...updates, id: tierId, updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'vipTiers', tierId), updated, { merge: true });
    setVipTiers((previous) => previous.map((item) => item.id === tierId ? updated : item));
  };
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



  // Marketing Campaigns
  const [marketingCampaigns, setMarketingCampaigns] = useState<MarketingCampaign[]>(() => {
    try {
      const saved = localStorage.getItem(MARKETING_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Live Firestore listener avoids repeatedly downloading the full catalogue on a timer.
  // Live Firestore listener for real-time synchronization across all devices and browsers
  useEffect(() => {
    let active = true;
    const applyStoreSnapshot = (snapshot: any) => {
      if (!active || !snapshot.exists()) return;
      const data: any = snapshot.data() || {};
      if (data.settings) {
        setSettings((prev) => {
          const next = {
            ...prev,
            ...data.settings,
            phone: data.settings.phone || prev.phone,
            whatsappNumber: data.settings.whatsappNumber || prev.whatsappNumber,
            deliveryRadiusText: data.settings.deliveryRadiusText || prev.deliveryRadiusText,
          };
          try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });

        // Immediately update CSS brand variables across all active tabs and screens
        if (data.settings.primaryColor) {
          document.documentElement.style.setProperty('--brand-primary', data.settings.primaryColor);
        }
        if (data.settings.secondaryColor) {
          document.documentElement.style.setProperty('--brand-secondary', data.settings.secondaryColor);
        }
        if (data.settings.storeBackgroundColor) {
          document.documentElement.style.setProperty('--store-background', data.settings.storeBackgroundColor);
        }
        if (data.settings.storeSurfaceColor) {
          document.documentElement.style.setProperty('--store-surface', data.settings.storeSurfaceColor);
        }
        if (data.settings.storeTextColor) {
          document.documentElement.style.setProperty('--store-text', data.settings.storeTextColor);
        }

        if (Array.isArray(data.settings.deliveryMethods)) {
          setDeliveryMethods(data.settings.deliveryMethods);
          try {
            localStorage.setItem(DELIVERY_METHODS_KEY, JSON.stringify(data.settings.deliveryMethods));
          } catch {}
        }
        if (Array.isArray(data.settings.companies) && data.settings.companies.length > 0) {
          setBranches(data.settings.companies);
          try {
            localStorage.setItem('kcd_branches_v1', JSON.stringify(data.settings.companies));
          } catch {}
        }
      }
      if (Array.isArray(data.companies) && data.companies.length > 0) {
        setBranches(data.companies);
        try {
          localStorage.setItem('kcd_branches_v1', JSON.stringify(data.companies));
        } catch {}
      }
      if (Array.isArray(data.menuItems) && data.menuItems.length) {
        setMenuItems(data.menuItems);
        try {
          localStorage.setItem(MENU_KEY, JSON.stringify(data.menuItems));
        } catch {}
      }
      if (Array.isArray(data.discounts) && data.discounts.length) {
        setDiscounts(data.discounts);
        try {
          localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(data.discounts));
        } catch {}
      }
      if (Array.isArray(data.policies)) {
        setPolicies(data.policies);
        try {
          localStorage.setItem(POLICIES_KEY, JSON.stringify(data.policies));
        } catch {}
      }
      if (Array.isArray(data.chakwalAreas) && data.chakwalAreas.length) {
        setChakwalAreas(data.chakwalAreas);
        try {
          localStorage.setItem(AREAS_KEY, JSON.stringify(data.chakwalAreas));
        } catch {}
      }
      if (data.updatedAt) setLastCloudSyncTimestamp(data.updatedAt);
      setServerSyncStatus('synced');
    };

    // 1. Listen to storePublic for active tenant (and global for kfc-chakwal)
    const targetDocId = tenantId === 'kfc-chakwal' ? 'global' : tenantId;
    const unsubscribeStore = onSnapshot(doc(db, 'storePublic', targetDocId), async (snapshot) => {
      try {
        if (!snapshot.exists() && isAdmin && tenantId === 'kfc-chakwal') {
          const legacy = await getDoc(doc(db, 'storeSettings', 'global'));
          if (legacy.exists()) {
            const legacyData: any = legacy.data() || {};
            const publicData: Record<string, any> = { ...legacyData };
            if (publicData.settings) {
              publicData.settings = { ...publicData.settings };
              delete publicData.settings.adminUsers;
              delete publicData.settings.adminPin;
            }
            await setDoc(doc(db, 'storePublic', 'global'), publicData, { merge: true });
            return;
          }
        }
        applyStoreSnapshot(snapshot);
      } catch (error) {
        console.warn('Store data Firestore sync notice:', error);
        if (active) setServerSyncStatus('offline');
      }
    }, (error) => {
      console.warn('Store data Firestore read notice:', error);
      if (active) setServerSyncStatus('offline');
    });

    // 2. Real-time Subscription & Tenant Profile Listener
    const unsubscribeTenant = onSnapshot(doc(db, 'tenants', tenantId), async (docSnap) => {
      if (docSnap.exists()) {
        const tData = docSnap.data() as RestaurantTenant;
        setCurrentTenant(tData);
        try {
          localStorage.setItem(`kcd_tenant_profile_${tenantId}`, JSON.stringify(tData));
        } catch {}
      } else if (tenantId === 'kfc-chakwal') {
        // Auto-seed KFC Chakwal as the primary platform tenant
        try {
          await setDoc(doc(db, 'tenants', 'kfc-chakwal'), DEFAULT_KFC_TENANT, { merge: true });
          setCurrentTenant(DEFAULT_KFC_TENANT);
        } catch (e) {
          console.warn('Failed to seed KFC tenant:', e);
        }
      }
    }, (err) => console.warn('Tenant sync warning:', err));

    // 3. Platform Settings Listener
    const unsubscribePlatform = onSnapshot(doc(db, 'platformSettings', 'global'), (snap) => {
      if (snap.exists()) {
        const pData: any = snap.data();
        if (pData.paymentInstructions) {
          setPlatformPaymentInstructions(pData.paymentInstructions);
        }
      }
    }, (e) => console.warn('Platform settings notice:', e));

    // 4. Super Admin Platform Collections Listeners
    let unsubscribeTenantsList: (() => void) | undefined;
    let unsubscribePayments: (() => void) | undefined;

    if (isAdmin) {
      unsubscribeTenantsList = onSnapshot(collection(db, 'tenants'), (snap) => {
        const list: RestaurantTenant[] = [];
        snap.forEach((d) => list.push(d.data() as RestaurantTenant));
        if (list.length > 0) {
          setPlatformTenants(list);
        }
      }, (e) => console.warn('Tenants list notice:', e));

      unsubscribePayments = onSnapshot(collection(db, 'subscriptionPayments'), (snap) => {
        const pList: SubscriptionPaymentRecord[] = [];
        snap.forEach((d) => pList.push(d.data() as SubscriptionPaymentRecord));
        pList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setSubscriptionPayments(pList);
      }, (e) => console.warn('Payments notice:', e));
    }

    return () => {
      active = false;
      unsubscribeStore();
      unsubscribeTenant();
      unsubscribePlatform();
      if (unsubscribeTenantsList) unsubscribeTenantsList();
      if (unsubscribePayments) unsubscribePayments();
    };
  }, [isAdmin, tenantId]);

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

  // Hardware and gesture back-button handling is centrally managed in App.tsx
  // to prevent race conditions, duplicate popstate triggers, and accidental exit popups on cart updates.

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const syncStoreToServer = async (customPayload?: Record<string, any>) => {
    try {
      setServerSyncStatus('syncing');
      const safeSettings = {
        ...settings, deliveryMethods,
        metaCommerce: settings.metaCommerce
          ? { ...settings.metaCommerce, conversionsApiToken: undefined }
          : settings.metaCommerce,
      };
      const payload = customPayload || { settings: safeSettings, menuItems, discounts, policies, chakwalAreas, companies: branches };
      const publicPayload: Record<string, any> = { ...payload };
      if (publicPayload.settings) {
        publicPayload.settings = { ...publicPayload.settings };
        delete publicPayload.settings.adminUsers;
        delete publicPayload.settings.adminPin;
        if (publicPayload.settings.shopify) {
          publicPayload.settings.shopify = { ...publicPayload.settings.shopify };
          delete publicPayload.settings.shopify.storefrontAccessToken;
          delete publicPayload.settings.shopify.adminWebhookUrl;
        }
        if (publicPayload.settings.metaCommerce) {
          publicPayload.settings.metaCommerce = { ...publicPayload.settings.metaCommerce };
          delete publicPayload.settings.metaCommerce.conversionsApiToken;
        }
      }
      if (publicPayload.metaCommerce) {
        publicPayload.metaCommerce = { ...publicPayload.metaCommerce };
        delete publicPayload.metaCommerce.conversionsApiToken;
      }
      const timestamp = new Date().toISOString();

      // Write to tenant-specific, global, and default kfc-chakwal documents
      const docsToWrite = [
        setDoc(doc(db, 'storePublic', tenantId), { ...publicPayload, updatedAt: timestamp }, { merge: true }),
        setDoc(doc(db, 'storeSettings', tenantId), { ...payload, lastUpdated: timestamp }, { merge: true }),
        setDoc(doc(db, 'storePublic', 'global'), { ...publicPayload, updatedAt: timestamp }, { merge: true }),
        setDoc(doc(db, 'storeSettings', 'global'), { ...payload, lastUpdated: timestamp }, { merge: true }),
      ];

      if (tenantId !== 'kfc-chakwal') {
        docsToWrite.push(
          setDoc(doc(db, 'storePublic', 'kfc-chakwal'), { ...publicPayload, updatedAt: timestamp }, { merge: true }),
          setDoc(doc(db, 'storeSettings', 'kfc-chakwal'), { ...payload, lastUpdated: timestamp }, { merge: true })
        );
      }

      await Promise.allSettled(docsToWrite);

      // Server backup sync
      try {
        fetch(`/api/store-data?restaurant=${encodeURIComponent(tenantId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(publicPayload),
        }).catch(() => {});
      } catch {}

      // Cross-tab broadcast
      try {
        const channel = new BroadcastChannel('kfc_settings_sync');
        channel.postMessage({ type: 'SYNC_SETTINGS', payload: publicPayload, timestamp });
        channel.close();
      } catch {}

      setLastCloudSyncTimestamp(timestamp);
      setServerSyncStatus('synced');
      return true;
    } catch (error) {
      console.warn('Store data Firestore sync notice:', error);
      setServerSyncStatus('offline');
      return false;
    }
  };

  // Branch management operations
  const setActiveBranch = (branchId: string) => {
    setActiveBranchId(branchId);
    try {
      localStorage.setItem('kcd_active_branch_id_v1', branchId);
    } catch {}
  };

  const addBranch = async (newBranchData: Omit<StoreBranch, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    const timestamp = new Date().toISOString();
    const id = `branch-${Date.now()}`;
    const newBranch: StoreBranch = {
      ...newBranchData,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const updated = [...branches, newBranch];
    setBranches(updated);
    try {
      localStorage.setItem('kcd_branches_v1', JSON.stringify(updated));
    } catch {}
    return await syncStoreToServer({
      settings: { ...settings, companies: updated },
      menuItems,
      discounts,
      policies,
      chakwalAreas,
    });
  };

  const updateBranch = async (branchId: string, updates: Partial<StoreBranch>): Promise<boolean> => {
    const timestamp = new Date().toISOString();
    const updated = branches.map((b) => (b.id === branchId ? { ...b, ...updates, updatedAt: timestamp } : b));
    setBranches(updated);
    try {
      localStorage.setItem('kcd_branches_v1', JSON.stringify(updated));
    } catch {}
    return await syncStoreToServer({
      settings: { ...settings, companies: updated },
      menuItems,
      discounts,
      policies,
      chakwalAreas,
    });
  };

  const deleteBranch = async (branchId: string): Promise<boolean> => {
    if (branches.length <= 1) return false;
    const updated = branches.filter((b) => b.id !== branchId);
    setBranches(updated);
    if (activeBranchId === branchId) {
      setActiveBranchId(updated[0]?.id || 'branch-chakwal-main');
    }
    try {
      localStorage.setItem('kcd_branches_v1', JSON.stringify(updated));
    } catch {}
    return await syncStoreToServer({
      settings: { ...settings, companies: updated },
      menuItems,
      discounts,
      policies,
      chakwalAreas,
    });
  };

  const pushAllSettingsToCloud = async (): Promise<boolean> => {
    try {
      setServerSyncStatus('syncing');
      const timestamp = new Date().toISOString();
      const version = Date.now();
      const updatedSettings = {
        ...settings,
        companies: branches,
        activeBranchId,
        deliveryMethods,
        settingsVersion: version,
        lastSyncedAt: timestamp,
      };
      setSettings(updatedSettings);
      setLastCloudSyncTimestamp(timestamp);

      // Immediately apply updated CSS variables on current screen
      if (updatedSettings.primaryColor) {
        document.documentElement.style.setProperty('--brand-primary', updatedSettings.primaryColor);
      }
      if (updatedSettings.secondaryColor) {
        document.documentElement.style.setProperty('--brand-secondary', updatedSettings.secondaryColor);
      }
      if (updatedSettings.storeBackgroundColor) {
        document.documentElement.style.setProperty('--store-background', updatedSettings.storeBackgroundColor);
      }
      if (updatedSettings.storeSurfaceColor) {
        document.documentElement.style.setProperty('--store-surface', updatedSettings.storeSurfaceColor);
      }
      if (updatedSettings.storeTextColor) {
        document.documentElement.style.setProperty('--store-text', updatedSettings.storeTextColor);
      }

      // Update local storage caches
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
        localStorage.setItem('kcd_branches_v1', JSON.stringify(branches));
        localStorage.setItem(MENU_KEY, JSON.stringify(menuItems));
        localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(discounts));
        localStorage.setItem(POLICIES_KEY, JSON.stringify(policies));
        localStorage.setItem(AREAS_KEY, JSON.stringify(chakwalAreas));
      } catch {}

      const payload = {
        settings: updatedSettings,
        companies: branches,
        menuItems,
        discounts,
        policies,
        chakwalAreas,
        updatedAt: timestamp,
        version,
      };

      // Push to all relevant Firestore documents simultaneously
      const pushOperations = [
        setDoc(doc(db, 'storePublic', tenantId), payload, { merge: true }),
        setDoc(doc(db, 'storeSettings', tenantId), payload, { merge: true }),
        setDoc(doc(db, 'storePublic', 'global'), payload, { merge: true }),
        setDoc(doc(db, 'storeSettings', 'global'), payload, { merge: true }),
        setDoc(doc(db, 'storePublic', 'kfc-chakwal'), payload, { merge: true }),
        setDoc(doc(db, 'storeSettings', 'kfc-chakwal'), payload, { merge: true }),
      ];

      await Promise.allSettled(pushOperations);

      // Server backup endpoint push
      try {
        await fetch(`/api/store-data?restaurant=${encodeURIComponent(tenantId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.warn('Backup server sync notice:', e);
      }

      // Cross-tab broadcast so any open customer or admin tabs sync immediately
      try {
        const channel = new BroadcastChannel('kfc_settings_sync');
        channel.postMessage({ type: 'FORCE_SETTINGS_UPDATE', version, payload });
        channel.close();
      } catch {}

      setServerSyncStatus('synced');
      return true;
    } catch (err) {
      console.warn('pushAllSettingsToCloud warning:', err);
      setServerSyncStatus('offline');
      return false;
    }
  };

  // Super Admin Check
  const currentAdminEmail = (auth.currentUser?.email || currentUser?.email || '').toLowerCase();
  const isSuperAdmin = Boolean(
    currentAdminEmail === 'kfcchakwal@gmail.com' ||
    (settings.adminUsers || []).some(
      (u) => u.email?.toLowerCase() === currentAdminEmail && u.role === 'Super Admin'
    )
  );

  // Subscription Lifecycle Evaluation
  const subscriptionEvaluation = evaluateSubscription(currentTenant);
  const isSubscriptionSuspended = subscriptionEvaluation.isSuspended;
  const isSubscriptionGracePeriod = subscriptionEvaluation.isInGracePeriod;

  // Feature Entitlements & Plan Limits Helpers
  const checkFeatureAllowed = (featureKey: keyof RestaurantFeatures): boolean => {
    if (isSuperAdmin) return true;
    if (!currentTenant?.features) return true;
    return Boolean(currentTenant.features[featureKey]);
  };

  const checkLimitExceeded = (limitKey: keyof RestaurantLimits, currentCount: number): boolean => {
    if (isSuperAdmin) return false;
    const max = currentTenant?.limits?.[limitKey];
    if (typeof max !== 'number' || max <= 0) return false;
    return currentCount >= max;
  };

  // SaaS Tenant operations
  const switchTenant = (newTenantId: string) => {
    const tid = newTenantId.toLowerCase().trim();
    setTenantId(tid);
    try {
      localStorage.setItem('kcd_active_tenant_id_v1', tid);
      const url = new URL(window.location.href);
      url.searchParams.set('restaurant', tid);
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  const submitSubscriptionPayment = async (data: {
    amount: number;
    paymentMethod: string;
    transactionRef: string;
    paymentDate: string;
    proofUrl?: string;
    notes?: string;
  }): Promise<boolean> => {
    try {
      const id = `pay-${Date.now()}`;
      const record: SubscriptionPaymentRecord = {
        id,
        restaurantId: currentTenant.id,
        restaurantName: currentTenant.name,
        planId: currentTenant.planId,
        planName: currentTenant.planName,
        billingCycle: currentTenant.billingCycle,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionRef: data.transactionRef,
        paymentDate: data.paymentDate,
        proofUrl: data.proofUrl,
        notes: data.notes,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'subscriptionPayments', id), record);
      await setDoc(doc(db, 'subscriptionAuditLogs', `log-${Date.now()}`), {
        id: `log-${Date.now()}`,
        restaurantId: currentTenant.id,
        restaurantName: currentTenant.name,
        action: 'payment_submitted',
        details: `Submitted payment proof of PKR ${data.amount} via ${data.paymentMethod} (Ref: ${data.transactionRef})`,
        performedBy: currentTenant.ownerEmail || 'Restaurant Owner',
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.error('submitSubscriptionPayment error:', err);
      return false;
    }
  };

  const approveSubscriptionPayment = async (paymentId: string): Promise<boolean> => {
    try {
      const payment = subscriptionPayments.find((p) => p.id === paymentId);
      if (!payment || payment.status === 'approved') return false;

      const now = new Date().toISOString();
      const approver = auth.currentUser?.email || 'kfcchakwal@gmail.com';

      // 1. Mark payment as approved
      await updateDoc(doc(db, 'subscriptionPayments', paymentId), {
        status: 'approved',
        reviewedAt: now,
        reviewedBy: approver,
      });

      // 2. Find target tenant
      const targetTenant = platformTenants.find((t) => t.id === payment.restaurantId) || currentTenant;
      const nextDue = calculateNextRenewalDate(targetTenant.dueDate, targetTenant.billingCycle);

      // 3. Reactivate & extend target tenant
      await updateDoc(doc(db, 'tenants', targetTenant.id), {
        status: 'active',
        dueDate: nextDue,
        nextRenewalDate: nextDue,
        suspendedAt: null,
        statusReason: null,
        updatedAt: now,
      });

      // 4. Record in audit log
      await setDoc(doc(db, 'subscriptionAuditLogs', `log-${Date.now()}`), {
        id: `log-${Date.now()}`,
        restaurantId: targetTenant.id,
        restaurantName: targetTenant.name,
        action: 'payment_approved',
        previousStatus: targetTenant.status,
        newStatus: 'active',
        details: `Payment #${payment.transactionRef} (PKR ${payment.amount}) approved. Due date renewed to ${nextDue}.`,
        performedBy: approver,
        timestamp: now,
      });

      return true;
    } catch (err) {
      console.error('approveSubscriptionPayment error:', err);
      return false;
    }
  };

  const rejectSubscriptionPayment = async (paymentId: string, reason: string): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const approver = auth.currentUser?.email || 'kfcchakwal@gmail.com';
      await updateDoc(doc(db, 'subscriptionPayments', paymentId), {
        status: 'rejected',
        reviewedAt: now,
        reviewedBy: approver,
        rejectionReason: reason,
      });
      await setDoc(doc(db, 'subscriptionAuditLogs', `log-${Date.now()}`), {
        id: `log-${Date.now()}`,
        restaurantId: 'platform',
        restaurantName: 'Platform',
        action: 'payment_rejected',
        details: `Payment #${paymentId} rejected: ${reason}`,
        performedBy: approver,
        timestamp: now,
      });
      return true;
    } catch (err) {
      console.error('rejectSubscriptionPayment error:', err);
      return false;
    }
  };

  const createRestaurantTenant = async (tenantData: Omit<RestaurantTenant, 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const newTenant: RestaurantTenant = {
        ...tenantData,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'tenants', newTenant.id), newTenant);
      await setDoc(doc(db, 'subscriptionAuditLogs', `log-${Date.now()}`), {
        id: `log-${Date.now()}`,
        restaurantId: newTenant.id,
        restaurantName: newTenant.name,
        action: 'restaurant_created',
        newStatus: newTenant.status,
        details: `New restaurant tenant created on plan: ${newTenant.planName} (${newTenant.billingCycle})`,
        performedBy: auth.currentUser?.email || 'kfcchakwal@gmail.com',
        timestamp: now,
      });
      return true;
    } catch (err) {
      console.error('createRestaurantTenant error:', err);
      return false;
    }
  };

  const updateRestaurantTenant = async (targetId: string, updates: Partial<RestaurantTenant>): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'tenants', targetId), { ...updates, updatedAt: now });
      await setDoc(doc(db, 'subscriptionAuditLogs', `log-${Date.now()}`), {
        id: `log-${Date.now()}`,
        restaurantId: targetId,
        restaurantName: updates.name || targetId,
        action: 'restaurant_updated',
        details: `Restaurant tenant details updated`,
        performedBy: auth.currentUser?.email || 'kfcchakwal@gmail.com',
        timestamp: now,
      });
      return true;
    } catch (err) {
      console.error('updateRestaurantTenant error:', err);
      return false;
    }
  };

  const extendRestaurantSubscription = async (targetId: string, days: number): Promise<boolean> => {
    try {
      const target = platformTenants.find((t) => t.id === targetId) || currentTenant;
      const base = new Date(target.dueDate).getTime() > Date.now() ? new Date(target.dueDate) : new Date();
      const newDue = new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
      const now = new Date().toISOString();

      await updateDoc(doc(db, 'tenants', targetId), {
        dueDate: newDue,
        nextRenewalDate: newDue,
        status: 'active',
        suspendedAt: null,
        statusReason: null,
        updatedAt: now,
      });

      await setDoc(doc(db, 'subscriptionAuditLogs', `log-${Date.now()}`), {
        id: `log-${Date.now()}`,
        restaurantId: targetId,
        restaurantName: target.name,
        action: 'subscription_extended',
        details: `Subscription manually extended by ${days} days to ${newDue}`,
        performedBy: auth.currentUser?.email || 'kfcchakwal@gmail.com',
        timestamp: now,
      });

      return true;
    } catch (err) {
      console.error('extendRestaurantSubscription error:', err);
      return false;
    }
  };

  const toggleRestaurantSuspension = async (targetId: string, suspend: boolean, reason?: string): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'tenants', targetId), {
        status: suspend ? 'suspended' : 'active',
        suspendedAt: suspend ? now : null,
        statusReason: reason || null,
        updatedAt: now,
      });
      await setDoc(doc(db, 'subscriptionAuditLogs', `log-${Date.now()}`), {
        id: `log-${Date.now()}`,
        restaurantId: targetId,
        restaurantName: targetId,
        action: 'status_changed',
        newStatus: suspend ? 'suspended' : 'active',
        details: suspend ? `Account suspended: ${reason || 'Admin action'}` : 'Account reactivated by admin',
        performedBy: auth.currentUser?.email || 'kfcchakwal@gmail.com',
        timestamp: now,
      });
      return true;
    } catch (err) {
      console.error('toggleRestaurantSuspension error:', err);
      return false;
    }
  };

  const updatePlatformPaymentInstructions = async (instructions: Partial<PlatformPaymentInstructions>): Promise<boolean> => {
    try {
      const updated = { ...platformPaymentInstructions, ...instructions, updatedAt: new Date().toISOString() };
      setPlatformPaymentInstructions(updated);
      await setDoc(doc(db, 'platformSettings', 'global'), { paymentInstructions: updated }, { merge: true });
      return true;
    } catch (err) {
      console.error('updatePlatformPaymentInstructions error:', err);
      return false;
    }
  };

  const updatePlatformPlans = async (plans: SubscriptionPlan[]): Promise<boolean> => {
    try {
      setPlatformPlans(plans);
      await setDoc(doc(db, 'platformSettings', 'plans'), { plans }, { merge: true });
      return true;
    } catch (err) {
      console.error('updatePlatformPlans error:', err);
      return false;
    }
  };


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const data = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<ProductReview, 'id'>) }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setReviews(data);
    }, (error) => {
      console.warn('Reviews Firestore read notice:', error);
    });
    return () => unsubscribe();
  }, []);

  // Orders Fetch & Sound Trigger
  const fetchOrders = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setAllOrders([]);
        return;
      }
      const snap = isAdmin
        ? await getDocs(query(collection(db, 'orders'), orderBy('date', 'desc')))
        : await getDocs(query(
            collection(db, 'orders'),
            where('customer.uid', '==', user.uid)
          ));
      const data: Order[] = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (isAdmin && ordersInitializedRef.current && data.length > previousOrderCountRef.current) {
        if (settings.orderNotificationSound !== false) playNewOrderChime();
        if ('Notification' in window && Notification.permission === 'granted') {
          const title = '🍗 New KFC Chakwal Order';
          const options: NotificationOptions = {
            body: 'New order #' + (data[0]?.id || '') + ' received. Tap to open Seller Center.',
            icon: '/pwa-192.png',
            tag: 'kfc-new-order-' + (data[0]?.id || ''),
            data: { url: '/seller' },
          };
          if ('serviceWorker' in navigator) {
            void navigator.serviceWorker.ready
              .then((registration) => registration.showNotification(title, options))
              .catch(() => {
                const notification = new Notification(title, options);
                notification.onclick = () => { window.focus(); window.location.href = '/seller'; };
              });
          } else {
            const notification = new Notification(title, options);
            notification.onclick = () => { window.focus(); window.location.href = '/seller'; };
          }
        }
      }
      previousOrderCountRef.current = data.length;
      ordersInitializedRef.current = true;
      setAllOrders(data);
    } catch (error) {
      console.warn('Orders Firestore sync notice:', error);
    }
  };

  useEffect(() => {
    // Real-time Firestore onSnapshot listener for instant orders synchronization across all admin & customer devices
    ordersInitializedRef.current = false;
    previousOrderCountRef.current = 0;

    const user = auth.currentUser;
    if (!user) {
      setAllOrders([]);
      return;
    }

    const ordersQuery = isAdmin
      ? query(collection(db, 'orders'), orderBy('date', 'desc'))
      : query(collection(db, 'orders'), where('customer.uid', '==', user.uid), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const data: Order[] = snapshot.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (isAdmin && ordersInitializedRef.current && data.length > previousOrderCountRef.current) {
        if (settings.orderNotificationSound !== false) playNewOrderChime();
        if ('Notification' in window && Notification.permission === 'granted') {
          const title = '🍗 New KFC Chakwal Order';
          const options: NotificationOptions = {
            body: 'New order #' + (data[0]?.id || '') + ' received. Tap to open Seller Center.',
            icon: '/pwa-192.png',
            tag: 'kfc-new-order-' + (data[0]?.id || ''),
            data: { url: '/seller' },
          };
          if ('serviceWorker' in navigator) {
            void navigator.serviceWorker.ready
              .then((registration) => registration.showNotification(title, options))
              .catch(() => {
                const notification = new Notification(title, options);
                notification.onclick = () => { window.focus(); window.location.href = '/seller'; };
              });
          } else {
            const notification = new Notification(title, options);
            notification.onclick = () => { window.focus(); window.location.href = '/seller'; };
          }
        }
      }
      previousOrderCountRef.current = data.length;
      ordersInitializedRef.current = true;
      setAllOrders(data);
    }, (error) => {
      console.warn('Orders Firestore real-time onSnapshot notice:', error);
    });

    return () => unsubscribe();
  }, [settings.orderNotificationSound, isAdmin]);

  // Manual refresh helper retained for the admin UI; the live listener below keeps this current automatically.
  const fetchCustomers = async () => {
    if (!auth.currentUser || !isAdmin) return;
    try {
      const snapshot = await getDocs(collection(db, 'customers'));
      const data = snapshot.docs.map((item) => {
        const record = item.data() as Omit<CustomerLoyaltyRecord, 'id'>;
        return {
          id: item.id,
          ...record,
          email: record.email || '',
          phone: record.phone || '',
          address: record.address || record.defaultAddress || '',
          defaultAddress: record.defaultAddress || record.address || '',
          savedAddresses: record.savedAddresses || [],
        };
      });
      setCustomerRecords(data);
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Customers Firestore refresh notice:', error);
    }
  };

  // Keep the customer admin list synced live so new Google-account profiles appear without a refresh.
  useEffect(() => {
    if (!isAdmin || !auth.currentUser) return;
    const unsubscribe = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const data = snapshot.docs.map((item) => {
        const record = item.data() as Omit<CustomerLoyaltyRecord, 'id'>;
        return {
          id: item.id,
          ...record,
          email: record.email || '',
          phone: record.phone || '',
          address: record.address || record.defaultAddress || '',
          defaultAddress: record.defaultAddress || record.address || '',
          savedAddresses: record.savedAddresses || [],
        };
      });
      setCustomerRecords(data);
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(data));
    }, (error) => {
      console.warn('Customers Firestore live sync notice:', error);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !auth.currentUser) return;
    const loadVipRequests = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'vipRequests'));
        const data = snapshot.docs
          .map((item) => ({ id: item.id, ...(item.data() as Omit<VipMembershipRequest, 'id'>) }))
          .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        setVipRequests(data);
        localStorage.setItem(VIP_REQUESTS_KEY, JSON.stringify(data));
      } catch (error) {
        console.warn('VIP requests Firestore read notice:', error);
      }
    };
    void loadVipRequests();
  }, [isAdmin]);

  const updateCustomerPoints = async (phoneOrId: string, newPoints: number) => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    const target = customerRecords.find((c) => c.phone === phoneOrId || c.id === phoneOrId);
    if (!target) throw new Error('Customer not found.');
    const loyaltyPoints = Math.max(0, Math.floor(newPoints));
    await setDoc(doc(db, 'customers', target.id), { loyaltyPoints, updatedAt: new Date().toISOString() }, { merge: true });
    setCustomerRecords((prev) => prev.map((c) => c.id === target.id ? { ...c, loyaltyPoints } : c));
    if (currentUser && (currentUser.phone === target.phone || currentUser.id === target.id)) {
      setCurrentUser((prev) => prev ? { ...prev, loyaltyPoints } : prev);
    }
  };

  const updateCustomerRecord = async (customerId: string, updates: Partial<CustomerLoyaltyRecord>) => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    const target = customerRecords.find((c) => c.id === customerId);
    if (!target) throw new Error('Customer not found.');
    const cleanUpdates = {
      ...(updates.fullName !== undefined ? { fullName: updates.fullName.trim().slice(0, 100) } : {}),
      ...(updates.phone !== undefined ? { phone: updates.phone.trim().slice(0, 40) } : {}),
      ...(updates.email !== undefined ? { email: updates.email.trim().slice(0, 160) } : {}),
      ...(updates.address !== undefined ? { address: updates.address.trim().slice(0, 500), defaultAddress: updates.address.trim().slice(0, 500) } : {}),
      ...(updates.savedAddresses !== undefined ? { savedAddresses: updates.savedAddresses.filter((address) => address && address.address.trim()).slice(0, 20).map((address) => ({ id: String(address.id || `addr-${Date.now()}`), label: String(address.label || 'Address').slice(0, 40), address: String(address.address).trim().slice(0, 500), isDefault: Boolean(address.isDefault) })) } : {}),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'customers', customerId), cleanUpdates, { merge: true });
    setCustomerRecords((prev) => prev.map((customer) => customer.id === customerId ? { ...customer, ...updates } : customer));
    if (currentUser?.id === customerId) {
      const updatedUser = {
        ...currentUser,
        ...(updates.fullName !== undefined ? { fullName: String(updates.fullName) } : {}),
        ...(updates.phone !== undefined ? { phone: String(updates.phone) } : {}),
        ...(updates.email !== undefined ? { email: String(updates.email) } : {}),
        ...(updates.address !== undefined ? { address: String(updates.address), defaultAddress: String(updates.address) } : {}),
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    await setDoc(doc(db, 'orders', orderId), { status, updatedAt: new Date().toISOString() }, { merge: true });
    setAllOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const updateOrderPaymentReceived = async (orderId: string, amount: number) => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Received amount Rs 0 se zyada hona chahiye.');
    const orderRef = doc(db, 'orders', orderId);
    let nextReceived = 0;
    let nextStatus: Order['paymentStatus'] = 'unpaid';
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(orderRef);
      if (!snapshot.exists()) throw new Error('Order record nahi mila.');
      const data = snapshot.data() as Order;
      const total = Math.max(0, Number(data.total || 0));
      const alreadyReceived = Math.max(0, Number(data.paymentReceived || 0));
      if (alreadyReceived >= total) throw new Error('Is order ki full payment pehle hi receive ho chuki hai.');
      if (amount > total - alreadyReceived) throw new Error('Received amount remaining balance se zyada nahi ho sakti.');
      nextReceived = Math.round((alreadyReceived + amount) * 100) / 100;
      nextStatus = nextReceived >= total ? 'paid' : 'partial';
      transaction.set(orderRef, {
        paymentReceived: nextReceived,
        paymentStatus: nextStatus,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    });
    setAllOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, paymentReceived: nextReceived, paymentStatus: nextStatus } : o));
    if (activeOrder?.id === orderId) setActiveOrder((prev) => prev ? { ...prev, paymentReceived: nextReceived, paymentStatus: nextStatus } : null);
  };

  const deleteOrder = async (orderId: string): Promise<void> => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    await deleteDoc(doc(db, 'orders', orderId));
    setAllOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (activeOrder?.id === orderId) setActiveOrder(null);
  };

  const bulkDeleteOrders = async (
    orderIds: string[]
  ): Promise<{ success: boolean; deletedCount: number; failedIds: string[] }> => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    const failedIds: string[] = [];
    let deletedCount = 0;

    await Promise.allSettled(
      orderIds.map(async (id) => {
        try {
          await deleteDoc(doc(db, 'orders', id));
          deletedCount++;
        } catch {
          failedIds.push(id);
        }
      })
    );

    const successfullyDeleted = new Set(orderIds.filter((id) => !failedIds.includes(id)));
    setAllOrders((prev) => prev.filter((o) => !successfullyDeleted.has(o.id)));
    if (activeOrder && successfullyDeleted.has(activeOrder.id)) {
      setActiveOrder(null);
    }
    return {
      success: failedIds.length === 0,
      deletedCount,
      failedIds,
    };
  };

  const loginAdmin = async (): Promise<{ success: boolean; error?: string }> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;
      const tokenResult = await user.getIdTokenResult();
      const adminDoc = await getDoc(doc(db, 'adminUsers', user.uid));
      const isSuperAdminEmail = user.email?.toLowerCase() === 'kfcchakwal@gmail.com';
      const isAuthorizedAdmin = isSuperAdminEmail || tokenResult.claims.admin === true || (
        adminDoc.exists() &&
        adminDoc.data()?.role === 'admin' &&
        adminDoc.data()?.active !== false
      );

      if (!isAuthorizedAdmin) {
        await signOut(auth);
        setIsAdmin(false);
        return { success: false, error: 'Ye Gmail Admin access ke liye authorize nahi hai.' };
      }

      if (isSuperAdminEmail && (!adminDoc.exists() || !adminDoc.data()?.role)) {
        await setDoc(doc(db, 'adminUsers', user.uid), {
          uid: user.uid,
          email: 'kfcchakwal@gmail.com',
          name: user.displayName || 'KFC Chakwal Super Admin',
          role: 'admin',
          active: true,
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch((err) => console.warn('Failed to ensure adminUsers doc:', err));
      }

      setIsAdmin(true);
      setIsAdminLoginModalOpen(false);
      return { success: true };
    } catch (err: any) {
      console.error('Admin Google authentication failure:', err);
      if ((['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported'].includes(err?.code) || (err?.code === 'auth/network-request-failed' && typeof window !== 'undefined' && window.navigator.onLine))) {
        try {
          await signInWithRedirect(auth, provider);
          return { success: true };
        } catch (redirectError: any) {
          console.error('Admin Google redirect sign-in failure:', redirectError);
          return { success: false, error: getFriendlyAuthError(redirectError) };
        }
      }
      return { success: false, error: getFriendlyAuthError(err) };
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
  const updateMenuItem = async (updatedItem: MenuItem) => {
    const nextMenu = menuItems.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setMenuItems(nextMenu);
    if (updatedItem.status === 'draft') {
      setCart((prev) => prev.filter((item) => item.menuItem.id !== updatedItem.id));
    }
    await syncStoreToServer({ menuItems: nextMenu });
    try {
      await setDoc(doc(db, 'products', updatedItem.id), { ...updatedItem, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Individual product doc sync notice:', e);
    }
  };

  const updateProductStatus = async (itemId: string, status: 'active' | 'draft') => {
    const nextMenu = menuItems.map((item) =>
      item.id === itemId ? { ...item, status } : item
    );
    setMenuItems(nextMenu);
    if (status === 'draft') {
      setCart((prev) => prev.filter((item) => item.menuItem.id !== itemId));
    }
    await syncStoreToServer({ menuItems: nextMenu });
    try {
      await setDoc(doc(db, 'products', itemId), { status, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Product status doc sync notice:', e);
    }
  };

  const bulkUpdateProductStatus = async (
    itemIds: string[],
    status: 'active' | 'draft'
  ): Promise<{ success: boolean; updatedCount: number; failedIds: string[] }> => {
    try {
      const idSet = new Set(itemIds);
      const nextMenu = menuItems.map((item) =>
        idSet.has(item.id) ? { ...item, status } : item
      );
      setMenuItems(nextMenu);
      if (status === 'draft') {
        setCart((prev) => prev.filter((item) => !idSet.has(item.menuItem.id)));
      }
      await syncStoreToServer({ menuItems: nextMenu });
      return { success: true, updatedCount: itemIds.length, failedIds: [] };
    } catch (err) {
      console.error('Failed bulk update product status:', err);
      return { success: false, updatedCount: 0, failedIds: itemIds };
    }
  };

  const bulkDeleteMenuItems = async (
    itemIds: string[]
  ): Promise<{ success: boolean; deletedCount: number; failedIds: string[] }> => {
    try {
      const idSet = new Set(itemIds);
      const nextMenu = menuItems.filter((item) => !idSet.has(item.id));
      setMenuItems(nextMenu);
      setCart((prev) => prev.filter((item) => !idSet.has(item.menuItem.id)));
      setWishlist((prev) => prev.filter((id) => !idSet.has(id)));
      if (selectedProduct && idSet.has(selectedProduct.id)) {
        setSelectedProduct(null);
        setCurrentView('home');
      }
      await syncStoreToServer({ menuItems: nextMenu });
      return { success: true, deletedCount: itemIds.length, failedIds: [] };
    } catch (err) {
      console.error('Failed bulk delete menu items:', err);
      return { success: false, deletedCount: 0, failedIds: itemIds };
    }
  };

  const importProductsFromSourceSite = async (): Promise<{ success: boolean; stats: ImportStats }> => {
    try {
      const headers = await getAuthHeaders();
      if (headers.Authorization) {
        try {
          const resp = await fetch('/api/admin/import-source-products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.success && data.stats) {
              const sourceProducts = await fetchAllSourceProducts('https://kfcchk.kintrends.com');
              const { updatedMenu } = mergeSourceProducts(sourceProducts, menuItems);
              setMenuItems(updatedMenu);
              return { success: true, stats: data.stats };
            }
          }
        } catch (serverErr) {
          console.warn('Server endpoint notice, using direct client sync:', serverErr);
        }
      }

      const sourceProducts = await fetchAllSourceProducts('https://kfcchk.kintrends.com');
      const { updatedMenu, stats } = mergeSourceProducts(sourceProducts, menuItems);
      setMenuItems(updatedMenu);
      await syncStoreToServer({ menuItems: updatedMenu });
      return { success: true, stats };
    } catch (err: any) {
      console.error('Failed to import products from source:', err);
      return {
        success: false,
        stats: {
          totalProcessed: 0,
          updatedCount: 0,
          newCount: 0,
          failedCount: 1,
          failedProducts: [err?.message || 'Failed to connect to source website or parse catalogue'],
        },
      };
    }
  };

  const addMenuItem = (newItem: MenuItem) => {
    const itemWithCreatedAt = { ...newItem, createdAt: newItem.createdAt || new Date().toISOString() };
    const nextMenu = [itemWithCreatedAt, ...menuItems];
    setMenuItems(nextMenu);
    syncStoreToServer({ menuItems: nextMenu });
  };

  const bulkImportProducts = (newProducts: MenuItem[]) => {
    const existingHandles = new Set(menuItems.map((m) => m.id));
    const combined = [...menuItems];
    for (const p of newProducts) {
      if (existingHandles.has(p.id)) {
        const idx = combined.findIndex((m) => m.id === p.id);
        combined[idx] = { ...p, createdAt: p.createdAt || combined[idx].createdAt || new Date().toISOString() };
      } else {
        combined.push({ ...p, createdAt: p.createdAt || new Date().toISOString() });
      }
    }
    setMenuItems(combined);
    syncStoreToServer({ menuItems: combined });
  };

  const deleteMenuItem = (itemId: string) => {
    const nextMenu = menuItems.filter((item) => item.id !== itemId);
    setMenuItems(nextMenu);
    setCart((prev) => prev.filter((item) => item.menuItem.id !== itemId));
    setWishlist((prev) => prev.filter((id) => id !== itemId));
    if (selectedProduct?.id === itemId) {
      setSelectedProduct(null);
      setCurrentView('home');
    }
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

  // Coupon/loyalty combination is controlled by the editable loyalty settings.
  const hasActiveDiscountCoupon = Boolean(
    appliedDiscountCode || (appliedDiscount && appliedDiscount.type !== 'free_shipping' && discountAmount > 0)
  );

  const applyDiscountCode = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, message: 'Please enter a discount code' };

    // If user is currently redeeming loyalty points, inform them or disable points
    if (isRedeemingPoints && settings.loyaltyConfig?.combineWithCoupons !== true) {
      setIsRedeemingPoints(false); // Coupon and points are mutually exclusive unless admin enables combining.
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
    return { success: true, message: settings.loyaltyConfig?.combineWithCoupons === true ? `Discount code "${clean}" applied! Loyalty points can also be redeemed.` : `Discount code "${clean}" applied! (Note: Loyalty points cannot be combined)` };
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
  const minPointsRedemptionAmount = Math.max(0, Number(settings.loyaltyConfig?.minRedemptionAmount ?? 500));
  const userPoints = currentUser?.loyaltyPoints || 0;
  const canRedeemPoints = userPoints > 0 && cartSubtotal >= minPointsRedemptionAmount && (settings.loyaltyConfig?.combineWithCoupons === true || !hasActiveDiscountCoupon);

  // Conversion: 2 reward points = Rs 1 discount. Keep point balance and rupee discount separate.
  const subtotalAfterCoupon = Math.max(0, cartSubtotal - discountAmount);
  const pointsPerRupee = Math.max(1, Number(settings.loyaltyConfig?.pointsPerRupee ?? 2));
  const maxRedeemablePoints = canRedeemPoints ? Math.min(userPoints, subtotalAfterCoupon * pointsPerRupee) : 0;
  const loyaltyDiscountAmount = isRedeemingPoints && canRedeemPoints ? Math.floor(maxRedeemablePoints / pointsPerRupee) : 0;

  // VIP Membership Lifetime Discount Engine (Flat 3%, 6%, or 8% OFF for approved VIPs)
  const activeVipTier = vipTiers.find((t) => t.id === currentUser?.vipTier) || DEFAULT_VIP_TIERS.find((t) => t.id === currentUser?.vipTier);
  const isVipActive = Boolean(currentUser?.vipStatus === 'active' && activeVipTier && (!currentUser.vipExpiresAt || new Date(currentUser.vipExpiresAt).getTime() > Date.now()));
  const vipDiscountAmount = isVipActive && cartSubtotal > 0 && activeVipTier
    ? Math.round((cartSubtotal * activeVipTier.discountPercentage) / 100)
    : 0;

  // Potential points to earn: 10 points for every 300 Rs spent on food
  const netFoodPaid = Math.max(0, cartSubtotal - discountAmount - loyaltyDiscountAmount - vipDiscountAmount);
  const potentialPointsToEarn = Math.floor(netFoodPaid / Math.max(1, Number(settings.loyaltyConfig?.spendThreshold ?? 300))) * Math.max(0, Number(settings.loyaltyConfig?.pointsPerSpend ?? 10));

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

  // Real-time live store statistics
  const unrecoveredCheckouts = abandonedCheckouts.filter((c) => c.recoveryStatus !== 'recovered');
  const liveStats: LiveStoreStats = {
    activeVisitors: Math.max(1, unrecoveredCheckouts.length + (cart.length > 0 ? 1 : 0) + (currentUser ? 1 : 0)),
    openCartsCount: unrecoveredCheckouts.length + (cart.length > 0 ? 1 : 0),
    openCartsValue: unrecoveredCheckouts.reduce((sum, c) => sum + (c.cartTotal || 0), 0) + (cartSubtotal > 0 ? cartTotal : 0),
    checkoutsInProgress: isCheckoutOpen ? 1 : (unrecoveredCheckouts.length > 0 ? 1 : 0),
  };

  // Cart operations
  const addToCart = (item: MenuItem, options?: CartItemOption, quantity: number = 1) => {
    // Draft products are hidden from customers and cannot be ordered
    if (item.status === 'draft') {
      return;
    }

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

  const createOrder = async (
    customer: CustomerDetails,
    paymentMethod: PaymentMethod,
    specialInstructions?: string
  ): Promise<Order> => {
    // Quick user check without blocking network ready call
    const user = auth.currentUser;

    if (paymentMethod !== 'cod') {
      throw new Error('Online payment gateway is not configured yet. Please use Cash on Delivery.');
    }
    if (cart.length === 0) {
      throw new Error('Your cart is empty.');
    }

    const rawKfcSubtotal = cart.reduce((acc, ci) => {
      const baseRaw = Number(ci.menuItem.baseKfcPrice || 0);
      const addons = (ci.options?.addons || []).reduce((sum, addon) => sum + Number(addon.price || 0), 0);
      return acc + (baseRaw + addons) * ci.quantity;
    }, 0);

    const markupAmount = Math.max(0, cartSubtotal - rawKfcSubtotal);
    const requestedLoyaltyDiscount = isRedeemingPoints && canRedeemPoints ? loyaltyDiscountAmount : 0;
    const requestedLoyaltyPoints = requestedLoyaltyDiscount * Math.max(1, Number(settings.loyaltyConfig?.pointsPerRupee ?? 2));

    const draftOrder: Order = {
      id: `CKW-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      orderType: 'delivery',
      items: [...cart],
      subtotal: cartSubtotal,
      markupAmount,
      deliveryFee: effectiveDeliveryFee,
      discount: discountAmount,
      loyaltyPointsEarned: potentialPointsToEarn,
      loyaltyPointsRedeemed: requestedLoyaltyPoints,
      loyaltyDiscount: requestedLoyaltyDiscount,
      vipDiscount: vipDiscountAmount,
      vipTierApplied: isVipActive && currentUser?.vipTier ? currentUser.vipTier : undefined,
      total: cartTotal,
      customerOrderNumber: currentUser ? Number(currentUser.ordersCount || 0) + 1 : undefined,
      customerOrderLabel: currentUser ? (Number(currentUser.ordersCount || 0) + 1 === 1 ? '1st Order' : Number(currentUser.ordersCount || 0) + 1 === 2 ? '2nd Order' : Number(currentUser.ordersCount || 0) + 1 === 3 ? '3rd Order' : `${Number(currentUser.ordersCount || 0) + 1}th Order`) : undefined,
      customer: {
        ...customer,
        notes: specialInstructions || customer.notes,
      },
      specialInstructions: specialInstructions || customer.notes,
      paymentMethod: 'cod',
      status: 'confirmed',
    };

    const savedOrder: Order = {
      ...draftOrder,
      customer: {
        ...draftOrder.customer,
        ...(user ? { uid: user.uid } : {}),
      } as CustomerDetails & { uid?: string },
    } as Order;

    const firestoreOrder = JSON.parse(JSON.stringify({
      ...savedOrder,
      createdAt: new Date().toISOString(),
      deliveryMethodId: selectedDeliveryMethodId,
      discountCode: appliedDiscountCode || null,
      redeemLoyaltyPoints: requestedLoyaltyDiscount > 0,
      loyaltyPointsRedeemed: requestedLoyaltyPoints,
    }));

    // Check tracked products for stock decrement
    const quantitiesByProduct = new Map<string, number>();
    cart.forEach((cartItem) => {
      if (cartItem.menuItem.trackInventory) {
        quantitiesByProduct.set(cartItem.menuItem.id, (quantitiesByProduct.get(cartItem.menuItem.id) || 0) + cartItem.quantity);
      }
    });

    let isQuotaFallback = false;
    try {
      if (quantitiesByProduct.size === 0) {
        // Fast-path: instant write when no items have tracked inventory
        await setDoc(doc(db, 'orders', savedOrder.id), firestoreOrder);
      } else {
        // Transactional path only for tracked items
        await runTransaction(db, async (transaction) => {
          const stockEntries = Array.from(quantitiesByProduct.entries());
          const productRefs = stockEntries.map(([productId]) => doc(db, 'products', productId));
          const productSnapshots = [];
          for (const productRef of productRefs) productSnapshots.push(await transaction.get(productRef));
          productSnapshots.forEach((snapshot, index) => {
            const [productId, quantity] = stockEntries[index];
            const cartProduct = cart.find((item) => item.menuItem.id === productId)?.menuItem;
            const data = snapshot.exists() ? snapshot.data() : (cartProduct as any);
            if (data?.trackInventory === true) {
              const available = Math.max(0, Number(data.stockQuantity || 0));
              if (available < quantity) throw new Error(`${cartProduct?.name || 'Product'} ka stock sirf ${available} available hai.`);
              if (snapshot.exists()) transaction.update(productRefs[index], { stockQuantity: available - quantity, updatedAt: new Date().toISOString() });
              else transaction.set(productRefs[index], { ...cartProduct, stockQuantity: available - quantity, updatedAt: new Date().toISOString() }, { merge: true });
            }
          });
          transaction.set(doc(db, 'orders', savedOrder.id), firestoreOrder);
        });
      }
    } catch (dbError: any) {
      const errMessage = String(dbError?.message || dbError?.code || dbError || '').toLowerCase();
      if (errMessage.includes('quota') || errMessage.includes('resource_exhausted') || errMessage.includes('limit exceeded')) {
        console.warn('Firestore daily write quota reached (Free tier). Order saved locally and confirmed via WhatsApp fallback:', dbError);
        isQuotaFallback = true;
        savedOrder.isQuotaFallback = true;
      } else {
        throw dbError;
      }
    }

    // Save profile/address in the background so the successful order confirmation is not delayed.
    if (user) {
      void (async () => {
      if (user) {
        const phone = String(customer.phone || currentUser?.phone || user.phoneNumber || '').trim();
        const address = String(customer.address || currentUser?.defaultAddress || currentUser?.address || '').trim();
        const fullName = String(customer.fullName || currentUser?.fullName || user.displayName || 'Customer').trim();
        const email = String(user.email || currentUser?.email || '').trim();
        const customerProfileRef = doc(db, 'customers', user.uid);
        const existingCustomerProfile = await getDoc(customerProfileRef);
        const savedProfile: Record<string, any> = existingCustomerProfile.exists() ? existingCustomerProfile.data() : {};
        const existingAddresses = Array.isArray(savedProfile.savedAddresses)
          ? savedProfile.savedAddresses as CustomerAddress[]
          : (currentUser?.savedAddresses || []);
        const addressExists = address && existingAddresses.some((saved) => String(saved.address || '').trim().toLowerCase() === address.toLowerCase());
        const savedAddresses = address && !addressExists
          ? [...existingAddresses, { id: `addr-${Date.now()}`, label: 'Recent Order', address }]
          : existingAddresses;
        const profileUpdate = {
          fullName,
          email,
          phone,
          address,
          defaultAddress: address,
          savedAddresses,
          updatedAt: new Date().toISOString(),
        };
        if (existingCustomerProfile.exists()) {
          await setDoc(customerProfileRef, profileUpdate, { merge: true });
        } else {
          await setDoc(customerProfileRef, {
            id: user.uid,
            ...profileUpdate,
            loyaltyPoints: Math.max(0, Number(settings.loyaltyConfig?.signupBonus ?? 50)),
            totalSpent: 0,
            ordersCount: 0,
            createdAt: new Date().toISOString(),
          }, { merge: true });
        }
        const updatedProfile: CustomerUser = {
          id: user.uid,
          fullName,
          email,
          phone,
          address,
          defaultAddress: address,
          savedAddresses,
          loyaltyPoints: Number(currentUser?.loyaltyPoints || 0),
          createdAt: currentUser?.createdAt || new Date().toISOString(),
          totalSpent: Number(currentUser?.totalSpent || 0),
          ordersCount: Number(currentUser?.ordersCount || 0),
          ...(currentUser?.vipTier ? { vipTier: currentUser.vipTier } : {}),
          ...(currentUser?.vipStatus ? { vipStatus: currentUser.vipStatus } : {}),
        };
        setCurrentUser(updatedProfile);
        localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedProfile));
      }
  
  
      })().catch((error) => console.warn('Customer profile background save notice:', error));
    }

    // Only update local customer/order state after the server has accepted the order.
    const earnedPoints = Number(savedOrder.loyaltyPointsEarned || 0);
    const redeemedPoints = Number(savedOrder.loyaltyPointsRedeemed || 0);

    if (user && earnedPoints > 0) {
      setPointsEarnedNotice(earnedPoints);
      const earnTx: LoyaltyTransaction = {
        id: `tx-${Date.now()}-earn`,
        customerId: user.uid,
        type: 'earned',
        points: earnedPoints,
        description: `Earned on Order #${savedOrder.id}`,
        orderId: savedOrder.id,
        date: new Date().toISOString(),
      };
      setLoyaltyTransactions((prev) => {
        const next = [earnTx, ...prev];
        localStorage.setItem(LOYALTY_TX_KEY, JSON.stringify(next));
        return next;
      });
    }

    if (user && redeemedPoints > 0) {
      const redeemTx: LoyaltyTransaction = {
        id: `tx-${Date.now()}-redeem`,
        customerId: user.uid,
        type: 'redeemed',
        points: redeemedPoints,
        description: `Redeemed on Order #${savedOrder.id}`,
        orderId: savedOrder.id,
        date: new Date().toISOString(),
      };
      setLoyaltyTransactions((prev) => {
        const next = [redeemTx, ...prev];
        localStorage.setItem(LOYALTY_TX_KEY, JSON.stringify(next));
        return next;
      });
    }

    if (currentUser) {
      const existingAddresses = currentUser.savedAddresses || [];
      const hasAddr = existingAddresses.some(
        (saved) => saved.address.toLowerCase().trim() === customer.address.toLowerCase().trim()
      );
      const updatedAddresses = hasAddr
        ? existingAddresses
        : [...existingAddresses, { id: `addr-${Date.now()}`, label: 'Recent Order', address: customer.address.trim() }];

      const updatedUser: CustomerUser = {
        ...currentUser,
        fullName: customer.fullName || currentUser.fullName,
        phone: customer.phone || currentUser.phone,
        address: customer.address || currentUser.address,
        defaultAddress: customer.address || currentUser.defaultAddress || currentUser.address,
        email: auth.currentUser?.email || currentUser.email,
        savedAddresses: updatedAddresses,
        loyaltyPoints: Math.max(0, (currentUser.loyaltyPoints || 0) - redeemedPoints) + earnedPoints,
        totalSpent: Number(currentUser.totalSpent || 0) + Number(savedOrder.total || 0),
        ordersCount: Number(currentUser.ordersCount || 0) + 1,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
    }

    setAllOrders((prev) => [savedOrder, ...prev.filter((order) => order.id !== savedOrder.id)]);
    setActiveOrder(savedOrder);
    clearCart();

    if (settings.orderNotificationSound !== false) {
      playNewOrderChime();
    }

    return savedOrder;
  };

  const clearActiveOrder = () => setActiveOrder(null);

  // Theme toggle: Permanently light/day theme as requested by user
  const themeMode: ThemeMode = 'light';
  const toggleTheme = () => {
    updateSettings({ themeMode: 'light' });
  };

  // Product View
  const viewProduct = (item: MenuItem) => {
    if (!isAdmin && item.status === 'draft') {
      return;
    }
    setSelectedProduct(item);
    try { localStorage.setItem('kfc-selected-product-id', item.id); } catch { /* storage can be disabled */ }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('product', item.id);
      window.history.replaceState({ ...(window.history.state || {}), kfcProduct: item.id }, '', url.toString());
    } catch {}
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('product');
      window.history.replaceState({ ...(window.history.state || {}), kfcProduct: null }, '', url.toString());
    } catch {}
    setCurrentView('home');
    try { localStorage.removeItem('kfc-selected-product-id'); } catch { /* storage can be disabled */ }
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWishlist = () => {
    setCurrentView('wishlist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reviews
  const addReview = async (reviewData: Omit<ProductReview, 'id' | 'date'>): Promise<ProductReview> => {
    const user = auth.currentUser;
    const id = `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const savedReview = {
      ...reviewData,
      id,
      date: new Date().toISOString(),
      customerUid: user?.uid || null,
      isVisible: true,
    } as ProductReview;
    await setDoc(doc(db, 'reviews', id), savedReview);
    setReviews((prev) => [savedReview, ...prev.filter((review) => review.id !== id)]);
    return savedReview;
  };
  const deleteReview = async (reviewId: string) => {
    if (!auth.currentUser) throw new Error('Please sign in to delete a review.');
    await deleteDoc(doc(db, 'reviews', reviewId));
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
  };

  const setReviewVisibility = async (reviewId: string, visible: boolean) => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    await setDoc(doc(db, 'reviews', reviewId), { isVisible: visible, moderatedAt: new Date().toISOString() }, { merge: true });
    setReviews((prev) => prev.map((review) => review.id === reviewId ? { ...review, isVisible: visible } : review));
  };

  // Customer User Auth — free Google Sign-In + Email/Password
  const buildCustomerProfile = async (firebaseUser: any, overrides?: { fullName?: string }): Promise<CustomerUser> => {
    const userDocRef = doc(db, 'customers', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    const data: any = userDoc.exists() ? userDoc.data() : {};
    const profile: CustomerUser = {
      id: firebaseUser.uid,
      fullName: overrides?.fullName || data.fullName || firebaseUser.displayName || 'Customer',
      phone: data.phone || firebaseUser.phoneNumber || '',
      email: data.email || firebaseUser.email || '',
      address: data.defaultAddress || '',
      defaultAddress: data.defaultAddress || '',
      savedAddresses: data.savedAddresses || [],
      loyaltyPoints: Number(data.loyaltyPoints ?? settings.loyaltyConfig?.signupBonus ?? 50),
      ...(data.vipTier !== undefined ? { vipTier: data.vipTier } : {}),
      ...(data.vipStatus !== undefined ? { vipStatus: data.vipStatus } : {}),
      ...(data.vipPaidAmount !== undefined ? { vipPaidAmount: data.vipPaidAmount } : {}),
      ...(data.vipExpiresAt !== undefined ? { vipExpiresAt: data.vipExpiresAt } : {}),
      totalSpent: Number(data.totalSpent || 0),
      ordersCount: Number(data.totalOrdersCount || 0),
      ...(typeof data.emailMarketingConsent === 'boolean' ? { emailMarketingConsent: data.emailMarketingConsent } : {}),
      ...(data.emailMarketingConsentAt ? { emailMarketingConsentAt: data.emailMarketingConsentAt } : {}),
      ...(data.emailMarketingConsentSource ? { emailMarketingConsentSource: data.emailMarketingConsentSource } : {}),
      createdAt: data.createdAt || new Date().toISOString(),
    };
    // New Google users need a valid initial customer record; existing users
    // may only sync editable profile fields, never loyalty totals or order counts.
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        id: firebaseUser.uid,
        fullName: profile.fullName,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        defaultAddress: profile.defaultAddress,
        savedAddresses: profile.savedAddresses,
        loyaltyPoints: Math.max(0, Number(settings.loyaltyConfig?.signupBonus ?? 50)),
        totalSpent: 0,
        totalOrdersCount: 0,
        emailMarketingConsent: false,
        createdAt: profile.createdAt,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(userDocRef, {
        fullName: profile.fullName,
        email: firebaseUser.email || data.email || '',
        address: profile.address,
        defaultAddress: profile.defaultAddress,
        savedAddresses: profile.savedAddresses,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
    setCurrentUser(profile);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(profile));
    return profile;
  };

  const resetCustomerPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Pehle apni valid email/Gmail ID enter karein.' };
      await sendPasswordResetEmail(auth, cleanEmail);
      return { success: true };
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') return { success: false, error: 'Is email par koi account nahi mila.' };
      if (err?.code === 'auth/invalid-email') return { success: false, error: 'Email address valid nahi hai.' };
      return { success: false, error: getFriendlyAuthError(err) || 'Password reset email send nahi ho saki.' };
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const cred = await signInWithPopup(auth, provider);
      try {
        await buildCustomerProfile(cred.user);
      } catch (profileError) {
        // Do not report Google authentication as failed when only profile sync is unavailable.
        // The auth-state listener keeps a local session profile and retries on the next app load.
        console.warn('Google sign-in succeeded; customer profile sync will need a retry:', profileError);
        let cached: Partial<CustomerUser> | null = null;
        try {
          const raw = localStorage.getItem(CUSTOMER_USER_KEY);
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed?.id === cred.user.uid) cached = parsed;
        } catch {}
        const fallbackProfile: CustomerUser = {
          id: cred.user.uid,
          fullName: String(cached?.fullName || cred.user.displayName || 'Customer'),
          phone: String(cached?.phone || cred.user.phoneNumber || ''),
          email: String(cached?.email || cred.user.email || ''),
          address: String(cached?.address || cached?.defaultAddress || ''),
          defaultAddress: String(cached?.defaultAddress || cached?.address || ''),
          savedAddresses: Array.isArray(cached?.savedAddresses) ? cached!.savedAddresses as CustomerAddress[] : [],
          loyaltyPoints: Number(cached?.loyaltyPoints ?? 0),
          totalSpent: Number(cached?.totalSpent ?? 0),
          ordersCount: Number(cached?.ordersCount ?? 0),
          createdAt: String(cached?.createdAt || new Date().toISOString()),
          ...(cached?.vipTier !== undefined ? { vipTier: cached.vipTier } : {}),
          ...(cached?.vipStatus !== undefined ? { vipStatus: cached.vipStatus } : {}),
        };
        setCurrentUser(fallbackProfile);
        localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(fallbackProfile));
      }
      setIsCustomerAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      console.error('Customer Google sign-in failure:', err);
      if ((['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported'].includes(err?.code) || (err?.code === 'auth/network-request-failed' && typeof window !== 'undefined' && window.navigator.onLine))) {
        try {
          await signInWithRedirect(auth, provider);
          return { success: true };
        } catch (redirectError: any) {
          console.error('Customer Google redirect sign-in failure:', redirectError);
          return { success: false, error: getFriendlyAuthError(redirectError) };
        }
      }
      return { success: false, error: getFriendlyAuthError(err) };
    }
  };

  const signupUser = async (data: { fullName: string; email: string; password: string; emailMarketingConsent?: boolean }): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = data.email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Apni valid Gmail ID / Email enter karein.' };
      if (data.password.length < 6) return { success: false, error: 'Password kam az kam 6 characters ka hona chahiye.' };
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
      if (data.fullName.trim()) {
        await updateProfile(cred.user, { displayName: data.fullName.trim().slice(0, 100) });
      }
      await setDoc(doc(db, 'customers', cred.user.uid), {
        id: cred.user.uid,
        fullName: data.fullName.trim().slice(0, 100) || 'Customer',
        email: cleanEmail,
        phone: '',
        defaultAddress: '',
        savedAddresses: [],
        loyaltyPoints: Math.max(0, Number(settings.loyaltyConfig?.signupBonus ?? 50)),
        totalSpent: 0,
        totalOrdersCount: 0,
        emailMarketingConsent: data.emailMarketingConsent === true,
        ...(data.emailMarketingConsent === true ? { emailMarketingConsentAt: new Date().toISOString(), emailMarketingConsentSource: 'signup' } : {}),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      await sendEmailVerification(cred.user);
      await signOut(auth);
      return {
        success: true,
        error: 'ACCOUNT_CREATED_VERIFY',
      };
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') return { success: false, error: 'Ye Gmail pehle se account ke saath registered hai. Sign In karein.' };
      if (err?.code === 'auth/weak-password') return { success: false, error: 'Password zyada strong rakhein, kam az kam 6 characters.' };
      if (err?.code === 'auth/operation-not-allowed') return { success: false, error: 'Email/Password login Firebase Authentication mein enable nahi hai.' };
      return { success: false, error: getFriendlyAuthError(err) || 'Account create nahi ho saka.' };
    }
  };

  const loginUser = async (email: string, password: string, emailMarketingConsent = false): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      if (!cred.user.emailVerified) {
        await sendEmailVerification(cred.user);
        await signOut(auth);
        return { success: false, error: 'Pehle apni Gmail par bheji gayi verification email se account verify karein. Zaroorat ho to dobara Sign In karein.' };
      }
      await buildCustomerProfile(cred.user);
      if (emailMarketingConsent) {
        const consentAt = new Date().toISOString();
        await setDoc(doc(db, 'customers', cred.user.uid), { emailMarketingConsent: true, emailMarketingConsentAt: consentAt, emailMarketingConsentSource: 'signin', updatedAt: consentAt }, { merge: true });
        setCurrentUser((prev) => prev ? { ...prev, emailMarketingConsent: true, emailMarketingConsentAt: consentAt, emailMarketingConsentSource: 'signin' } : prev);
      }
      setIsCustomerAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        return { success: false, error: 'Gmail ID ya password ghalat hai.' };
      }
      if (err?.code === 'auth/operation-not-allowed') return { success: false, error: 'Email/Password login Firebase mein enable nahi hai.' };
      return { success: false, error: getFriendlyAuthError(err) || 'Sign In nahi ho saka.' };
    }
  };

  const updateEmailMarketingConsent = async (consent: boolean) => {
    if (!currentUser) throw new Error('Pehle customer account mein sign in karein.');
    const updatedAt = new Date().toISOString();
    const updates = { emailMarketingConsent: consent, emailMarketingConsentAt: updatedAt, emailMarketingConsentSource: 'account-settings' as const, updatedAt };
    await setDoc(doc(db, 'customers', currentUser.id), updates, { merge: true });
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
    setCustomerRecords((prev) => prev.map((customer) => customer.id === currentUser.id ? { ...customer, ...updates } : customer));
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch {}
    setCurrentUser(null);
    localStorage.removeItem(CUSTOMER_USER_KEY);
    setIsRedeemingPoints(false);
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

    void setDoc(doc(db, 'customers', currentUser.id), {
      fullName: updatedUser.fullName,
      email: updatedUser.email || '',
      phone: updatedUser.phone || '',
      address: updatedUser.address,
      defaultAddress: updatedUser.address,
      savedAddresses: updatedUser.savedAddresses,
      updatedAt: new Date().toISOString(),
    }, { merge: true }).catch((error) => console.warn('Saved address sync failed:', error));
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
    void setDoc(doc(db, 'customers', currentUser.id), {
      defaultAddress: updatedUser.address, savedAddresses: updatedUser.savedAddresses,
      updatedAt: new Date().toISOString(),
    }, { merge: true }).catch((error) => console.warn('Address deletion sync failed:', error));
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

  const openPolicyModal = (slug?: string) => {
    if (slug) setActivePolicySlug(slug);
    setIsPoliciesModalOpen(true);
  };

  const updatePolicy = async (policy: StorePolicy): Promise<boolean> => {
    const previous = policies;
    const next = policies.map((p) => (p.id === policy.id ? policy : p));
    setPolicies(next);
    const saved = await syncStoreToServer({ policies: next });
    if (!saved) setPolicies(previous);
    return saved;
  };

  const addPolicy = async (policy: Omit<StorePolicy, 'id'>): Promise<boolean> => {
    const newPol: StorePolicy = { ...policy, id: `pol-${Date.now()}` };
    const previous = policies;
    const next = [...policies, newPol];
    setPolicies(next);
    const saved = await syncStoreToServer({ policies: next });
    if (!saved) setPolicies(previous);
    return saved;
  };

  const deletePolicy = async (policyId: string): Promise<boolean> => {
    const previous = policies;
    const next = policies.filter((p) => p.id !== policyId);
    setPolicies(next);
    const saved = await syncStoreToServer({ policies: next });
    if (!saved) setPolicies(previous);
    return saved;
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
    const firebaseUser = auth.currentUser;
    if (!currentUser || !firebaseUser) throw new Error('Please sign in before requesting VIP membership.');
    const tier = DEFAULT_VIP_TIERS.find((t) => t.id === tierId) || DEFAULT_VIP_TIERS[0];
    const newReq: VipMembershipRequest & { uid: string } = {
      id: `vip-req-${Date.now()}`, customerId: currentUser.id, uid: firebaseUser.uid,
      customerName: currentUser.fullName || 'VIP Customer', phone: currentUser.phone || '',
      tierId, amount: tier.price, paymentMethod, transactionId,
      requestedAt: new Date().toISOString(), status: 'pending',
    };
    void setDoc(doc(db, 'vipRequests', newReq.id), newReq).then(() => {
      setVipRequests((prev) => [newReq, ...prev.filter((r) => r.id !== newReq.id)]);
      localStorage.setItem(VIP_REQUESTS_KEY, JSON.stringify([newReq, ...vipRequests]));
    }).catch((error) => console.warn('VIP request save failed:', error));
    const updatedUser = { ...currentUser, vipTier: tierId, vipStatus: 'pending' as const };
    setCurrentUser(updatedUser);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
  };

  const setVipRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    const request = vipRequests.find((item) => item.id === requestId);
    if (!request) throw new Error('VIP request not found.');
    const updated = { ...request, status };
    await setDoc(doc(db, 'vipRequests', requestId), { status, reviewedAt: new Date().toISOString() }, { merge: true });
    const currentTier = vipTiers.find((item) => item.id === request.tierId) || DEFAULT_VIP_TIERS.find((item) => item.id === request.tierId);
    const restoredTier = status === 'rejected' ? request.previousTierId : undefined;
    const restoredStatus = status === 'rejected' ? request.previousVipStatus : undefined;
    const expiresAt = currentTier?.durationDays && currentTier.durationDays > 0 ? new Date(Date.now() + currentTier.durationDays * 86400000).toISOString() : null;
    await setDoc(doc(db, 'customers', request.customerId), {
      vipTier: status === 'approved' ? request.tierId : (restoredTier || null),
      vipStatus: status === 'approved' ? 'active' : (restoredStatus || 'rejected'),
      vipPaidAmount: status === 'approved' ? Number(currentTier?.price || request.amount) : (request.previousPaidAmount ?? null),
      vipExpiresAt: status === 'approved' ? expiresAt : (request.previousVipExpiresAt ?? null),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    setVipRequests((prev) => prev.map((item) => item.id === requestId ? updated : item));
    if (currentUser?.id === request.customerId) {
      setCurrentUser((prev) => prev ? {
        ...prev, vipStatus: status === 'approved' ? 'active' : 'rejected',
        ...(status === 'approved' ? { vipTier: request.tierId, vipPaidAmount: Number(currentTier?.price || request.amount), vipExpiresAt: expiresAt } : { vipTier: request.previousTierId, vipPaidAmount: request.previousPaidAmount, vipExpiresAt: request.previousVipExpiresAt }),
      } : prev);
    }
  };
  const approveVipRequest = async (requestId: string) => setVipRequestStatus(requestId, 'approved');
  const rejectVipRequest = async (requestId: string) => setVipRequestStatus(requestId, 'rejected');

  const requestVipMembershipWhatsApp = async (
    tierId: VipTierId, customerName: string, phone: string, email?: string, amountOverride?: number
  ): Promise<VipMembershipRequest> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Customer authentication required for VIP request.');
    const tier = vipTiers.find((t) => t.id === tierId) || DEFAULT_VIP_TIERS.find((t) => t.id === tierId) || DEFAULT_VIP_TIERS[0];
    const saved: VipMembershipRequest & { uid: string } = {
      id: `vip-req-${Date.now()}`, customerId: user.uid, uid: user.uid,
      previousTierId: currentUser?.vipTier, previousVipStatus: currentUser?.vipStatus, previousPaidAmount: currentUser?.vipPaidAmount, previousVipExpiresAt: currentUser?.vipExpiresAt,
      customerName: customerName.trim(), phone: phone.trim(), email: email?.trim() || '',
      tierId, amount: Math.max(0, Number(amountOverride ?? tier.price)), paymentMethod: 'whatsapp', transactionId: '',
      requestedAt: new Date().toISOString(), status: 'pending',
    };
    await setDoc(doc(db, 'vipRequests', saved.id), saved);
    setVipRequests((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
    if (currentUser && currentUser.vipStatus !== 'active') {
      const updatedUser = { ...currentUser, vipTier: tierId, vipStatus: 'pending' as const };
      setCurrentUser(updatedUser); localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
    }
    return saved;
  };

  const grantVipMembershipManual = async (customerPhoneOrId: string, tierId: VipTierId) => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    const target = customerRecords.find((customer) => customer.id === customerPhoneOrId || customer.phone === customerPhoneOrId);
    if (!target) throw new Error('Customer not found.');
    let request = vipRequests.find((item) => item.customerId === target.id);
    if (!request) {
      const tier = DEFAULT_VIP_TIERS.find((t) => t.id === tierId) || DEFAULT_VIP_TIERS[0];
      request = {
        id: `vip-req-${Date.now()}`, customerId: target.id, customerName: target.fullName,
        phone: target.phone, tierId, amount: tier.price, paymentMethod: 'bank_transfer',
        transactionId: '', requestedAt: new Date().toISOString(), status: 'pending',
      };
      await setDoc(doc(db, 'vipRequests', request.id), request);
    }
    await setDoc(doc(db, 'vipRequests', request.id), { status: 'approved', reviewedAt: new Date().toISOString(), tierId }, { merge: true });
    const grantedTier = vipTiers.find((tier) => tier.id === tierId) || DEFAULT_VIP_TIERS.find((tier) => tier.id === tierId);
    const vipExpiresAt = grantedTier?.durationDays && grantedTier.durationDays > 0 ? new Date(Date.now() + grantedTier.durationDays * 86400000).toISOString() : null;
    await setDoc(doc(db, 'customers', target.id), { vipTier: tierId, vipStatus: 'active', vipPaidAmount: grantedTier?.price || 0, vipExpiresAt, updatedAt: new Date().toISOString() }, { merge: true });
    setVipRequests((prev) => [{ ...request!, status: 'approved', tierId }, ...prev.filter((item) => item.id !== request!.id)]);
    setCustomerRecords((prev) => prev.map((customer) => customer.id === target.id ? { ...customer, vipTier: tierId } : customer));
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
      if (target && auth.currentUser) {
        const safeTarget = JSON.parse(JSON.stringify(target));
        setDoc(doc(db, 'orders', target.id), {
          ...safeTarget,
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => {});
      }
      return next;
    });
  };

  // Single Customer Manual Add, Edit, Delete
  const addCustomer = async (customerData: Partial<CustomerLoyaltyRecord>) => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    const payload: CustomerLoyaltyRecord = {
      id: `cust-${Date.now()}`, fullName: customerData.fullName || 'Customer',
      phone: customerData.phone || '', email: customerData.email || '',
      address: customerData.address || 'Chakwal City', loyaltyPoints: customerData.loyaltyPoints ?? 50,
      vipTier: customerData.vipTier, totalOrdersCount: customerData.totalOrdersCount ?? 0,
      totalSpent: customerData.totalSpent ?? 0, createdAt: new Date().toISOString(),
    };
    if (!payload.phone.trim()) throw new Error('Customer phone is required.');
    await setDoc(doc(db, 'customers', payload.id), payload);
    setCustomerRecords((prev) => [payload, ...prev.filter((c) => c.id !== payload.id && c.phone !== payload.phone)]);
  };
  const updateCustomer = async (customerId: string, updatedData: Partial<CustomerLoyaltyRecord>) => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    const target = customerRecords.find((c) => c.id === customerId || c.phone === customerId);
    if (!target) throw new Error('Customer not found.');
    const saved = { ...target, ...updatedData, id: target.id, phone: target.phone };
    await setDoc(doc(db, 'customers', target.id), saved, { merge: true });
    setCustomerRecords((prev) => prev.map((c) => c.id === target.id ? saved : c));
  };
  const deleteCustomer = async (customerId: string) => {
    if (!auth.currentUser || !isAdmin) throw new Error('Admin authentication required.');
    const target = customerRecords.find((c) => c.id === customerId || c.phone === customerId);
    if (!target) throw new Error('Customer not found.');
    await deleteDoc(doc(db, 'customers', target.id));
    setCustomerRecords((prev) => prev.filter((c) => c.id !== target.id));
  };

  // Admin user authorization is managed server-side in Firestore via the Admin Team Access panel.
  const addAdminUser = (_name: string, _email: string, _pin: string, _role: 'Super Admin' | 'Manager' = 'Manager') => {
    console.warn('Admin users are managed through the secure server API.');
  };

  const deleteAdminUser = (_adminId: string) => {
    console.warn('Admin users are managed through the secure server API.');
  };

  // Push / Web Notification Permission
  const [customerNotificationAllowed, setCustomerNotificationAllowed] = useState<boolean>(() => {
    return localStorage.getItem('kfc_notifications_allowed') === 'true';
  });

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      setCustomerNotificationAllowed(false);
      localStorage.setItem('kfc_notifications_allowed', 'false');
      return false;
    }
    try {
      const res = await Notification.requestPermission();
      const granted = res === 'granted';
      setCustomerNotificationAllowed(granted);
      localStorage.setItem('kfc_notifications_allowed', granted ? 'true' : 'false');
      return granted;
    } catch {
      setCustomerNotificationAllowed(false);
      localStorage.setItem('kfc_notifications_allowed', 'false');
      return false;
    }
  };

  // Custom Domain Integration
  // Register this authenticated admin device for background push notifications.
  const registerAdminPushNotifications = async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user || !isAdmin) throw new Error('Pehle authorized Admin account se login karein.');
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      throw new Error('Is browser mein PWA push notifications supported nahi hain.');
    }
    const supported = await isSupported();
    if (!supported) throw new Error('Firebase Cloud Messaging is browser/device par supported nahi hai.');
    let locallySavedVapidKey = '';
    try {
      const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      locallySavedVapidKey = String(savedSettings.messagingVapidKey || '');
    } catch {}
    const vapidKey = String(settings.messagingVapidKey || locallySavedVapidKey || (firebaseConfig as any).messagingVapidKey || '').trim();
    if (!vapidKey) throw new Error('Push setup ka ek step baqi hai: Firebase Console > Project Settings > Cloud Messaging > Web Push certificates se public key copy karke Admin panel ke VAPID field mein paste karein.');
    // Register the app's root-scoped service worker explicitly. Waiting only for
    // navigator.serviceWorker.ready can hang forever on devices where it was never registered.
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    const messaging = getMessaging(app);

    // FCM does not automatically show a system notification while the page is in
    // the foreground, so surface it through the active service worker as well.
    if (adminForegroundMessageUnsubscribe) adminForegroundMessageUnsubscribe();
    adminForegroundMessageUnsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title || '🍗 New KFC Chakwal Order';
      const body = payload.notification?.body || 'A new order has arrived.';
      const orderId = String(payload.data?.orderId || '');
      const targetUrl = String(payload.data?.url || '/seller');
      void registration.showNotification(title, {
        body,
        icon: '/pwa-192.png',
        badge: '/pwa-192.png',
        tag: orderId ? 'kfc-order-' + orderId : 'kfc-new-order',
        requireInteraction: true,
        data: { url: targetUrl },
      });
    });

    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    if (!token) throw new Error('Is device ka push token nahi bana. Browser notifications allow karke dobara try karein.');
    await setDoc(doc(db, 'adminPushTokens', token), {
      uid: user.uid,
      token,
      active: true,
      deviceLabel: /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  };

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

  const createReviewRequest = async (order: Order, reviewUrl: string): Promise<void> => {
    try {
      if (!auth.currentUser || !isAdmin) return;
      await setDoc(doc(db, 'reviewRequests', order.id), {
        orderId: order.id,
        customerUid: (order.customer as CustomerDetails & { uid?: string }).uid || null,
        customerName: order.customer.fullName || 'Customer',
        phone: order.customer.phone || '',
        reviewUrl,
        channel: 'whatsapp',
        status: 'opened_whatsapp',
        requestedAt: new Date().toISOString(),
        requestedBy: auth.currentUser?.uid || 'admin',
      }, { merge: true });
    } catch (err) {
      console.warn('createReviewRequest warning:', err);
    }
  };

  const getCleanReviewUrl = (orderId?: string, customerName?: string): string => {
    const origin = window.location.origin;
    const path = window.location.pathname.replace(/\/index\.html$/i, '').replace(/\/+$/, '');
    const base = `${origin}${path || ''}/?reviews=true`;
    const params = new URLSearchParams();
    if (orderId) params.set('order', orderId);
    if (customerName) params.set('customer', customerName);
    const qs = params.toString();
    return qs ? `${base}&${qs}` : base;
  };

  const getReviewWhatsAppUrl = (order: Order): string => {
    let cleanPhone = (order.customer?.phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '92' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('92') && cleanPhone.length > 0) cleanPhone = '92' + cleanPhone;
    const reviewUrl = getCleanReviewUrl(order.id, order.customer?.fullName);
    const template = String(
      settings.whatsappTemplates?.reviewRequest ||
      settings.autoReview?.whatsappTemplate ||
      'Assalam o Alaikum {customer_name}! Umeed hai aap ka KFC meal bohot crispy aur piping hot tha. Baraye mehrbani 1 minute nikaal kar apna star rating aur review dein: {review_link}. Review submit karny par aapko 20 FREE Loyalty Points milenge!'
    );
    const bonus = String(Math.max(0, Number(settings.loyaltyConfig?.reviewBonus ?? settings.autoReview?.rewardPoints ?? 20)));
    const message = template
      .replace(/\{name\}/g, order.customer?.fullName || 'Customer')
      .replace(/\{customer_name\}/g, order.customer?.fullName || 'Customer')
      .replace(/\{orderId\}/g, order.id)
      .replace(/\{order_id\}/g, order.id)
      .replace(/\{reviewUrl\}/g, reviewUrl)
      .replace(/\{review_link\}/g, reviewUrl)
      .replace(/\{phone\}/g, order.customer?.phone || '')
      .replace(/\{points\}/g, bonus);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const sendReviewCollectionWhatsapp = (order: Order) => {
    const url = getReviewWhatsAppUrl(order);
    try {
      const reviewUrl = getCleanReviewUrl(order.id, order.customer?.fullName);
      createReviewRequest(order, reviewUrl).catch((err) => {
        console.warn('Review request log notice:', err);
      });
    } catch {}
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const sendTestReviewWhatsApp = (phone: string, customerName = 'Valued Customer'): string => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '92' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('92') && cleanPhone.length > 0) cleanPhone = '92' + cleanPhone;
    const reviewUrl = getCleanReviewUrl('TEST-ORDER', customerName);
    const template = String(
      settings.whatsappTemplates?.reviewRequest ||
      settings.autoReview?.whatsappTemplate ||
      'Assalam o Alaikum {customer_name}! Umeed hai aap ka KFC meal bohot crispy aur piping hot tha. Baraye mehrbani 1 minute nikaal kar apna star rating aur review dein: {review_link}. Review submit karny par aapko 20 FREE Loyalty Points milenge!'
    );
    const bonus = String(Math.max(0, Number(settings.loyaltyConfig?.reviewBonus ?? settings.autoReview?.rewardPoints ?? 20)));
    const message = template
      .replace(/\{name\}/g, customerName)
      .replace(/\{customer_name\}/g, customerName)
      .replace(/\{orderId\}/g, 'TEST-ORDER')
      .replace(/\{order_id\}/g, 'TEST-ORDER')
      .replace(/\{reviewUrl\}/g, reviewUrl)
      .replace(/\{review_link\}/g, reviewUrl)
      .replace(/\{phone\}/g, phone)
      .replace(/\{points\}/g, bonus);
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    return url;
  };

  // Navigation Menus & Custom Pages
  const updateNavigationMenuItems = (items: NavigationMenuItem[]) => {
    updateSettings({ navigationMenuItems: items });
  };

  const saveCustomPage = (page: CustomPage) => {
    const currentPages = settings.customPages || DEFAULT_CUSTOM_PAGES;
    const exists = currentPages.some((p) => p.id === page.id);
    const updated = exists ? currentPages.map((p) => (p.id === page.id ? page : p)) : [...currentPages, page];
    updateSettings({ customPages: updated });
  };

  const deleteCustomPage = (pageId: string) => {
    const currentPages = settings.customPages || DEFAULT_CUSTOM_PAGES;
    const updated = currentPages.filter((p) => p.id !== pageId);
    updateSettings({ customPages: updated });
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
    const template = String(settings.whatsappTemplates?.abandonedRecovery || 'Assalam o Alaikum {name}! Aap ka cart ready hai ({items}) Total: {total}.');
    const message = template.replace(/\{name\}/g, checkout.customerName || 'Customer').replace(/\{items\}/g, itemsSummary).replace(/\{total\}/g, formatPKR(checkout.cartTotal));
    const text = encodeURIComponent(message);
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
        updateProductStatus,
        bulkUpdateProductStatus,
        bulkDeleteMenuItems,
        importProductsFromSourceSite,
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
        updateCustomerRecord,
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
        setReviewVisibility,
        currentUser,
        signupUser,
        loginUser,
        updateEmailMarketingConsent,
        resetCustomerPassword,
        signInWithGoogle,
        logoutUser,
        addSavedAddress,
        deleteSavedAddress,
        repeatOrder,
        isCustomerAuthModalOpen,
        setIsCustomerAuthModalOpen,
        allOrders,
        fetchOrders,
        updateOrderStatus,
        updateOrderPaymentReceived,
        deleteOrder,
        bulkDeleteOrders,
        isOrdersDashboardOpen,
        setIsOrdersDashboardOpen,
        vipTiers,
        updateVipTierImage,
        updateVipTier,
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
        getReviewWhatsAppUrl,
        createReviewRequest,
        sendTestReviewWhatsApp,
        updateNavigationMenuItems,
        saveCustomPage,
        deleteCustomPage,
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
        registerAdminPushNotifications,
        // Multiple Companies & Branches Architecture
        branches,
        activeBranch,
        setActiveBranch,
        addBranch,
        updateBranch,
        deleteBranch,
        pushAllSettingsToCloud,
        lastCloudSyncTimestamp,
        // Multi-Restaurant SaaS Platform Architecture
        currentTenant,
        tenantId,
        switchTenant,
        isSuperAdmin,
        platformTenants,
        platformPlans,
        subscriptionPayments,
        platformPaymentInstructions,
        submitSubscriptionPayment,
        approveSubscriptionPayment,
        rejectSubscriptionPayment,
        createRestaurantTenant,
        updateRestaurantTenant,
        extendRestaurantSubscription,
        toggleRestaurantSuspension,
        updatePlatformPaymentInstructions,
        updatePlatformPlans,
        isSubscriptionSuspended,
        isSubscriptionGracePeriod,
        subscriptionEvaluation,
        checkFeatureAllowed,
        checkLimitExceeded,
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
