export type CategoryId = 
  | 'everyday-value'
  | 'ala-carte-combos'
  | 'family-sharing'
  | 'midnight-deals'
  | 'snacks-sides'
  | 'beverages-desserts';

export interface Category {
  id: CategoryId;
  name: string;
  subtitle: string;
  image?: string;
}

export interface MenuItemAddon {
  id: string;
  name: string;
  price: number; // in PKR
  image?: string; // Add-on product thumbnail image
}

export type BadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface MenuItem {
  id: string;
  name: string;
  categoryId: CategoryId;
  description: string;
  baseKfcPrice: number; // Authentic KFC Pakistan original price in PKR
  sellingPrice?: number; // Custom direct selling price (overrides base price + markup if provided)
  compareAtPrice?: number; // Original strike-through price (e.g. Rs 1200)
  image: string;
  isSpicy?: boolean;
  isPopular?: boolean;
  isAvailable: boolean;
  customBadgeText?: string;
  customBadgePosition?: BadgePosition;
  customizableOptions?: {
    allowSpiceLevel?: boolean;
    allowDrinkChoice?: boolean;
    availableAddons?: MenuItemAddon[];
  };
}

export interface CartItemOption {
  spiceLevel?: 'Hot & Crispy' | 'Original Recipe';
  drink?: string;
  addons: MenuItemAddon[];
  specialInstructions?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number; // Effective price with markup + addons
  options: CartItemOption;
}

export interface ChakwalArea {
  id: string;
  name: string;
  estimatedTime: string;
  isAvailable: boolean;
}

export interface ShopifyConfig {
  enabled: boolean;
  storeDomain: string;
  storefrontAccessToken: string;
  adminWebhookUrl: string;
  autoSyncOrders: boolean;
}

export type ThemeMode = 'dark' | 'light';

export interface PaymentMethodConfig {
  id: 'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer';
  name: string;
  enabled: boolean;
  accountNumber?: string;
  accountTitle?: string;
  instructions?: string;
}

export interface HeroConfig {
  imageUrl: string;
  headline: string;
  highlightText: string;
  subtext: string;
  ctaButtonText: string;
  deliveryBadgeText: string;
}

export interface HeaderFooterConfig {
  logoUrl?: string; // Uploaded custom logo
  headerTitle: string;
  footerAboutText: string;
  footerCopyrightText: string;
}

export type SectionType = 
  | 'image-with-text' 
  | 'delivery-info' 
  | 'banner' 
  | 'features' 
  | 'custom-notice';

export interface PageSection {
  id: string;
  type: SectionType;
  page: 'home' | 'collection' | 'product' | 'wishlist' | 'all';
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  imagePosition?: 'left' | 'right';
  badgeText?: string;
  buttonText?: string;
  buttonLink?: string;
  estimatedTime?: string;
  deliveryFeeText?: string;
  deliveryAreaText?: string;
  isVisible: boolean;
  order: number;
}

export interface DeliverySectionConfig {
  enabled: boolean;
  badgeText: string;
  headline: string;
  estimatedTime: string;
  description: string;
  deliveryFeeText: string;
  buttonText: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  markupPercentage: number; // Default 12%
  deliveryFee: number; // Default 399 PKR
  minOrderAmount: number;
  phone: string;
  whatsappNumber: string;
  storeAddress: string;
  openingHours: string;
  isStoreOpen: boolean;
  announcementText: string;
  showAnnouncement: boolean;
  adminPin: string;
  themeMode: ThemeMode;
  headingFont: 'Barlow Condensed' | 'Plus Jakarta Sans' | 'Oswald' | 'Inter' | 'Roboto';
  bodyFont: 'Plus Jakarta Sans' | 'Inter' | 'Roboto' | 'Barlow Condensed';
  descriptionWordLimit: number; // 10 to 300 words (default: 25)
  deliverySection: DeliverySectionConfig;
  customSections: PageSection[];
  headerFooter: HeaderFooterConfig;
  hero: HeroConfig;
  paymentMethods: PaymentMethodConfig[];
  defaultBadgePosition: BadgePosition;
  shopify?: ShopifyConfig;
}

export type OrderType = 'delivery' | 'pickup';

export type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer';

// Simplified checkout fields: ONLY name, address, and phone number
export interface CustomerDetails {
  fullName: string;
  phone: string;
  address: string;
  area?: string;
  landmark?: string;
  notes?: string;
}

export interface Order {
  id: string;
  date: string;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  markupAmount: number;
  deliveryFee: number;
  discount: number;
  total: number;
  customer: CustomerDetails;
  paymentMethod: PaymentMethod;
  status: 'confirmed' | 'kitchen' | 'dispatched' | 'delivered';
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface CustomerUser {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  email?: string;
  createdAt: string;
}
