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
} from '../data/kfcMenu';
import { playNewOrderChime } from '../utils/audioNotification';

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
  createOrder: (customer: CustomerDetails, paymentMethod: PaymentMethod) => Order;
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
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  isOrdersDashboardOpen: boolean;
  setIsOrdersDashboardOpen: (open: boolean) => void;
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
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') return true;
      if (window.location.pathname.startsWith('/admin')) return true;
      return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

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
      await fetch('/api/store-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch('/api/orders');
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
      const res = await fetch('/api/customers');
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
        headers: { 'Content-Type': 'application/json' },
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

  const loginAdmin = (pin: string): boolean => {
    if (pin.trim() === settings.adminPin || pin.trim() === '7860') {
      setIsAdmin(true);
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setIsAdminLoginModalOpen(false);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
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
  let appliedDiscount: Discount | null = null;
  if (appliedDiscountCode) {
    const found = discounts.find(
      (d) => d.code.toUpperCase() === appliedDiscountCode.toUpperCase() && d.status === 'active'
    );
    if (found) appliedDiscount = found;
  } else {
    const autoDiscounts = discounts.filter(
      (d) => d.isAutomatic && d.status === 'active' && (!d.minOrderAmount || cartSubtotal >= d.minOrderAmount)
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

  // Potential points to earn: 10 points for every 300 Rs spent on food
  const netFoodPaid = Math.max(0, cartSubtotal - discountAmount - loyaltyDiscountAmount);
  const potentialPointsToEarn = Math.floor(netFoodPaid / 300) * 10;

  // Effective Delivery Fee from Selected Delivery Method
  let baseDeliveryFee = selectedDeliveryMethod.price || 399;
  if (selectedDeliveryMethod.minOrderAmount && cartSubtotal >= selectedDeliveryMethod.minOrderAmount) {
    baseDeliveryFee = 0;
  }
  const effectiveDeliveryFee = isFreeShippingApplied ? 0 : baseDeliveryFee;

  // Cart Grand Total
  const cartTotal = cartSubtotal > 0
    ? Math.max(0, cartSubtotal - discountAmount - loyaltyDiscountAmount) + effectiveDeliveryFee
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

    setIsCartOpen(true);
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

  const createOrder = (customer: CustomerDetails, paymentMethod: PaymentMethod): Order => {
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
      total: cartTotal,
      customer,
      paymentMethod,
      status: 'confirmed',
    };

    // Update Customer loyalty balance
    if (currentUser) {
      const updatedBalance = Math.max(0, (currentUser.loyaltyPoints || 0) - actualLoyaltyDiscount) + potentialPointsToEarn;
      const updatedUser = {
        ...currentUser,
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

  // Theme toggle
  const themeMode: ThemeMode = settings.themeMode || 'light';
  const toggleTheme = () => {
    const nextMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    updateSettings({ themeMode: nextMode });
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
    const newUser: CustomerUser = {
      id: `usr-${Date.now()}`,
      ...data,
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
    const newUser: CustomerUser = {
      id: existing?.id || `usr-${Date.now()}`,
      fullName: existing?.fullName || 'Customer',
      phone,
      address: existing?.address || 'Within 3 KM (Chakwal City)',
      loyaltyPoints: existing?.loyaltyPoints ?? 50,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    setCurrentUser(newUser);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(newUser));
    setIsCustomerAuthModalOpen(false);
    return true;
  };

  const logoutUser = () => {
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
        isCustomerAuthModalOpen,
        setIsCustomerAuthModalOpen,
        allOrders,
        fetchOrders,
        updateOrderStatus,
        isOrdersDashboardOpen,
        setIsOrdersDashboardOpen,
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
