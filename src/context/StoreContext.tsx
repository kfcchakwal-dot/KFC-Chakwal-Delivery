import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../types';
import {
  INITIAL_KFC_ITEMS,
  DEFAULT_STORE_SETTINGS,
  DEFAULT_CHAKWAL_AREAS,
  INITIAL_REVIEWS,
} from '../data/kfcMenu';

interface StoreContextType {
  // Store Settings (12% markup, Rs 399 delivery fee, etc.)
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetSettingsToDefault: () => void;

  // Pricing Helpers
  calculatePrice: (baseKfcPrice: number, customSellingPrice?: number) => number;
  getItemEffectivePrice: (item: MenuItem) => number;
  formatPKR: (amount: number) => string;

  // Custom Page Sections (Admin builder)
  updateCustomSection: (section: PageSection) => void;
  addCustomSection: (section: PageSection) => void;
  deleteCustomSection: (sectionId: string) => void;

  // Menu items
  menuItems: MenuItem[];
  updateMenuItem: (updatedItem: MenuItem) => void;
  addMenuItem: (newItem: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
  toggleItemAvailability: (itemId: string) => void;
  bulkImportProducts: (products: MenuItem[]) => void;
  resetMenuToDefault: () => void;

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

  // Order Type (Delivery vs Pickup)
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (itemId: string) => void;

  // Active / Recent Order
  activeOrder: Order | null;
  createOrder: (customer: CustomerDetails, paymentMethod: PaymentMethod) => Order;
  clearActiveOrder: () => void;

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

  // Theme (Day and Night mode)
  themeMode: ThemeMode;
  toggleTheme: () => void;

  // Reviews
  reviews: ProductReview[];
  addReview: (review: Omit<ProductReview, 'id' | 'date'>) => void;
  deleteReview: (reviewId: string) => void;

  // Customer Account & Authentication
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

  // Admin & Orders Management
  isAdmin: boolean;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  allOrders: Order[];
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  isOrdersDashboardOpen: boolean;
  setIsOrdersDashboardOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const SETTINGS_KEY = 'kfc_chakwal_settings_v2';
const MENU_KEY = 'kfc_chakwal_menu_v2';
const WISHLIST_KEY = 'kfc_chakwal_wishlist_v2';
const AREAS_KEY = 'kfc_chakwal_areas_v2';
const ACTIVE_ORDER_KEY = 'kfc_chakwal_active_order_v2';
const ALL_ORDERS_KEY = 'kfc_chakwal_all_orders_v2';
const ADMIN_AUTH_KEY = 'kfc_chakwal_admin_auth_v2';
const REVIEWS_KEY = 'kfc_chakwal_reviews_v2';
const CUSTOMER_USER_KEY = 'kfc_chakwal_user_v2';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store Settings with 12% markup and Rs 399 delivery charges default (Day theme default)
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STORE_SETTINGS,
          ...parsed,
          themeMode: parsed.themeMode === 'light' || parsed.themeMode === 'dark' ? parsed.themeMode : 'light',
          headingFont: parsed.headingFont || 'Barlow Condensed',
          bodyFont: parsed.bodyFont || 'Plus Jakarta Sans',
          descriptionWordLimit: parsed.descriptionWordLimit || 25,
          deliverySection: parsed.deliverySection || DEFAULT_STORE_SETTINGS.deliverySection,
          customSections: parsed.customSections && parsed.customSections.length > 0 
            ? parsed.customSections 
            : DEFAULT_STORE_SETTINGS.customSections,
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_STORE_SETTINGS;
  });

  // Menu items list
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(MENU_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_KFC_ITEMS;
  });

  // Chakwal areas
  const [chakwalAreas, setChakwalAreas] = useState<ChakwalArea[]>(() => {
    try {
      const saved = localStorage.getItem(AREAS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_CHAKWAL_AREAS;
  });

  const [selectedArea, setSelectedArea] = useState<ChakwalArea>(
    chakwalAreas[0] || DEFAULT_CHAKWAL_AREAS[0]
  );

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Active Order
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_ORDER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
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

  // View Navigation (Home, Product Page, Wishlist, Collection)
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'wishlist' | 'collection'>('home');
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_REVIEWS;
  });

  // Customer Account
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState(false);

  // Theme toggle
  const themeMode: ThemeMode = settings.themeMode || 'dark';

  const toggleTheme = () => {
    const nextMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    updateSettings({ themeMode: nextMode });
  };

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

  const signupUser = (data: { fullName: string; phone: string; address: string; email?: string }) => {
    const newUser: CustomerUser = {
      id: `usr-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(newUser));
    setIsCustomerAuthModalOpen(false);
  };

  const loginUser = (phone: string): boolean => {
    if (currentUser && currentUser.phone === phone) {
      setIsCustomerAuthModalOpen(false);
      return true;
    }
    const newUser: CustomerUser = {
      id: `usr-${Date.now()}`,
      fullName: 'Customer',
      phone,
      address: 'Chakwal, Punjab',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(newUser));
    setIsCustomerAuthModalOpen(false);
    return true;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem(CUSTOMER_USER_KEY);
  };

  // Persist reviews
  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  // Admin & Orders state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') return true;
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
    } catch {
      // ignore
    }
    return [];
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setAllOrders(data);
        localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(data));
      }
    } catch {
      // Fallback to local storage if API is not running
      try {
        const saved = localStorage.getItem(ALL_ORDERS_KEY);
        if (saved) setAllOrders(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {
      // ignore
    }
    // Update active order if it matches
    setActiveOrder((prev) => (prev?.id === orderId ? { ...prev, status } : prev));
  };

  const loginAdmin = (pin: string): boolean => {
    const validPin = settings.adminPin || '7860';
    if (pin.trim() === validPin) {
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
    // remove ?admin from URL if present
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url.toString());
  };

  // Poll orders when admin is logged in
  useEffect(() => {
    fetchOrders();
    if (isAdmin) {
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // Persist allOrders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(allOrders));
    } catch {
      // ignore
    }
  }, [allOrders]);

  // Persist Settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Persist Menu
  useEffect(() => {
    try {
      localStorage.setItem(MENU_KEY, JSON.stringify(menuItems));
    } catch {
      // ignore
    }
  }, [menuItems]);

  // Persist Wishlist
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  // Persist Areas
  useEffect(() => {
    try {
      localStorage.setItem(AREAS_KEY, JSON.stringify(chakwalAreas));
    } catch {
      // ignore
    }
  }, [chakwalAreas]);

  // Persist Active Order
  useEffect(() => {
    try {
      if (activeOrder) {
        localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(activeOrder));
      } else {
        localStorage.removeItem(ACTIVE_ORDER_KEY);
      }
    } catch {
      // ignore
    }
  }, [activeOrder]);

  // Price calculation helper (Custom direct price overrides markup, or base price + markup)
  const calculatePrice = (baseKfcPrice: number, customSellingPrice?: number): number => {
    if (customSellingPrice !== undefined && customSellingPrice > 0) {
      return customSellingPrice;
    }
    const markupFactor = 1 + (settings.markupPercentage / 100);
    return Math.round(baseKfcPrice * markupFactor);
  };

  const getItemEffectivePrice = (item: MenuItem): number => {
    if (item.sellingPrice !== undefined && item.sellingPrice > 0) {
      return item.sellingPrice;
    }
    return calculatePrice(item.baseKfcPrice);
  };

  const formatPKR = (amount: number): string => {
    return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettingsToDefault = () => {
    setSettings(DEFAULT_STORE_SETTINGS);
  };

  // Custom Sections Handlers for Home and Pages
  const updateCustomSection = (section: PageSection) => {
    const sections = settings.customSections || [];
    const exists = sections.some((s) => s.id === section.id);
    const newSections = exists
      ? sections.map((s) => (s.id === section.id ? section : s))
      : [...sections, section];
    updateSettings({ customSections: newSections });
  };

  const addCustomSection = (section: PageSection) => {
    const sections = settings.customSections || [];
    updateSettings({ customSections: [...sections, section] });
  };

  const deleteCustomSection = (sectionId: string) => {
    const sections = settings.customSections || [];
    updateSettings({ customSections: sections.filter((s) => s.id !== sectionId) });
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const addMenuItem = (newItem: MenuItem) => {
    setMenuItems((prev) => [newItem, ...prev]);
  };

  const bulkImportProducts = (newProducts: MenuItem[]) => {
    setMenuItems((prev) => {
      const existingMap = new Map(prev.map((p) => [p.id, p]));
      newProducts.forEach((np) => {
        existingMap.set(np.id, np);
      });
      return Array.from(existingMap.values());
    });
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
    setCart((prev) => prev.filter((item) => item.menuItem.id !== itemId));
  };

  const toggleItemAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const resetMenuToDefault = () => {
    setMenuItems(INITIAL_KFC_ITEMS);
  };

  const updateAreas = (newAreas: ChakwalArea[]) => {
    setChakwalAreas(newAreas);
  };

  // Cart operations
  const addToCart = (
    item: MenuItem,
    options: CartItemOption = { addons: [] },
    quantity: number = 1
  ) => {
    const baseEffectivePrice = getItemEffectivePrice(item);
    const addonsTotal = options.addons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = baseEffectivePrice + addonsTotal;

    // Generate unique ID based on item and custom options
    const optionsHash = JSON.stringify({
      spice: options.spiceLevel || '',
      drink: options.drink || '',
      addons: options.addons.map((a) => a.id).sort(),
      instructions: options.specialInstructions || '',
    });
    const cartItemId = `${item.id}-${btoa(optionsHash).slice(0, 10)}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [
        ...prev,
        {
          cartItemId,
          menuItem: item,
          quantity,
          unitPrice,
          options,
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
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotal = cart.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );

  // Delivery fee is Rs 399 for delivery mode, 0 for pickup mode
  const effectiveDeliveryFee = orderType === 'delivery' ? settings.deliveryFee : 0;

  const cartTotal = cartSubtotal > 0 ? cartSubtotal + effectiveDeliveryFee : 0;

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

    const newOrder: Order = {
      id: `CKW-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      orderType,
      items: [...cart],
      subtotal: cartSubtotal,
      markupAmount,
      deliveryFee: effectiveDeliveryFee,
      discount: 0,
      total: cartTotal,
      customer,
      paymentMethod,
      status: 'confirmed',
    };

    // If Shopify sync is configured, push order to Shopify Webhook / API
    if (settings.shopify?.enabled && settings.shopify.adminWebhookUrl) {
      try {
        fetch(settings.shopify.adminWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: 'orders/create',
            source: 'KFC Chakwal Delivery',
            order_id: newOrder.id,
            financial_status: newOrder.paymentMethod === 'cod' ? 'pending' : 'paid',
            total_price: newOrder.total,
            currency: 'PKR',
            customer: {
              first_name: customer.fullName,
              phone: customer.phone,
            },
            shipping_address: {
              address1: customer.address,
              city: 'Chakwal',
              province: 'Punjab',
              country: 'Pakistan',
              landmark: customer.landmark,
              area: customer.area,
            },
            line_items: newOrder.items.map((i) => ({
              title: i.menuItem.name,
              price: i.unitPrice,
              quantity: i.quantity,
              variant_title: [i.options.spiceLevel, i.options.drink, ...i.options.addons.map((a) => a.name)]
                .filter(Boolean)
                .join(' / '),
            })),
            shipping_lines: [
              {
                title: 'Chakwal Delivery Service',
                price: newOrder.deliveryFee,
              },
            ],
            note: customer.notes,
          }),
        }).catch(() => {
          // Ignore network errors in browser background sync
        });
      } catch {
        // ignore
      }
    }

    // Save order to server API for store admin dashboard
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(() => {});
    } catch {
      // ignore
    }

    // Add to allOrders state immediately
    setAllOrders((prev) => [newOrder, ...prev]);

    setActiveOrder(newOrder);
    clearCart();
    return newOrder;
  };

  const clearActiveOrder = () => {
    setActiveOrder(null);
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
        orderType,
        setOrderType,
        wishlist,
        toggleWishlist,
        activeOrder,
        createOrder,
        clearActiveOrder,
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
        isAdmin,
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
