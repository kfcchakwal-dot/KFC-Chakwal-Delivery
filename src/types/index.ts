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

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Regular", "Large", "3 Pcs Feast"
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stockQuantity?: number;
  trackInventory?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: CategoryId;
  description: string;
  baseKfcPrice: number; // Authentic KFC Pakistan original price in PKR
  sellingPrice?: number; // Custom direct selling price (overrides base price + markup if provided)
  compareAtPrice?: number; // Original strike-through price (e.g. Rs 1200)
  image: string;
  galleryImages?: string[]; // Multiple product images
  isSpicy?: boolean;
  isPopular?: boolean;
  isAvailable: boolean;
  trackInventory?: boolean; // Flexible inventory toggle: track or un-tracked
  stockQuantity?: number; // Quantity in stock
  lowStockThreshold?: number;
  variants?: ProductVariant[]; // Flexible product variants
  customBadgeText?: string;
  /** Admin-managed labels shown on this product image, e.g. Popular, Special, New. */
  badges?: string[];
  customBadgePosition?: BadgePosition;
  allowedBeverageIds?: string[];
  allowedAddonIds?: string[];
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
  endingText?: string;
  subtext: string;
  ctaButtonText: string;
  deliveryBadgeText: string;
  enabled?: boolean; // Can be toggled on or hidden / removed completely
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

export interface StorePolicy {
  id: string;
  title: string;
  slug: string;
  content: string;
}

export interface AnnouncementBarConfig {
  id: string;
  text: string;
  enabled: boolean;
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
  /** Multiple independently editable announcement bars; legacy single-bar fields remain supported. */
  announcementBars?: AnnouncementBarConfig[];
  /** Homepage collection navigation visibility/order and scroll-up sticky behaviour. */
  collectionNavOrder?: string[];
  collectionNavHidden?: string[];
  collectionNavStickyOnScrollUp?: boolean;
  adminPin?: string;
  themeMode: ThemeMode;
  primaryColor?: string;
  secondaryColor?: string;
  storeBackgroundColor?: string;
  storeSurfaceColor?: string;
  storeTextColor?: string;
  messagingVapidKey?: string;
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
  deliveryRadiusText?: string; // e.g. "Within 3 KM of Chakwal City"
  kallarKaharNotice?: string; // Delivery from Kallar Kahar Motorway branch
  sameDayOrderCutoff?: string; // "4:00 PM"
  sameDayDeliveryBy?: string; // "8:00 PM"
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  policies?: StorePolicy[];
  deliveryMethods?: DeliveryMethod[];
  dailyDeal?: DailyDealConfig;
  customAppIconUrl?: string;
  customPreloaderLogoUrl?: string;
  orderNotificationSound?: boolean;
  customDomain?: CustomDomainConfig;
  metaCommerce?: MetaCommerceConfig;
  autoReview?: AutoReviewConfig;
  adminUsers?: { id: string; name: string; email: string; role: 'Super Admin' | 'Manager'; addedAt: string }[];
  homepageVideo?: { enabled: boolean; videoUrl: string; title: string; subtitle: string; position: 'top' | 'middle' | 'bottom' };
  sectionColorSchemes?: Record<string, { background: string; text: string; button: string; buttonText: string; border: string }>;
  customerAuthCopy?: {
    title: string;
    subtitle: string;
    googleButtonText: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    signInButtonText: string;
    newAccountText: string;
    fullNameLabel: string;
    createAccountButtonText: string;
    verificationMessage: string;
    helperText: string;
  };
}

export interface CustomDomainConfig {
  domain: string;
  status: 'connected' | 'pending_verification' | 'unconfigured';
  aRecord: string; // e.g., 34.120.54.21
  cnameRecord: string; // e.g., app.kfcchakwaldelivery.com
  txtVerification: string; // e.g., kfc-verify=c794408e
  sslActive: boolean;
  connectedAt?: string;
}

export interface MetaCommerceConfig {
  pixelId: string;
  conversionsApiToken?: string;
  catalogFeedUrl: string;
  testEventCode?: string;
  instagramShoppingEnabled: boolean;
  facebookShopEnabled: boolean;
  trackAddToCart: boolean;
  trackInitiateCheckout: boolean;
  trackPurchase: boolean;
}

export type VipTierId = 'silver' | 'gold' | 'platinum';

export interface VipTier {
  id: VipTierId;
  name: string;
  discountPercentage: number; // 3%, 6%, 8%
  price: number; // 499, 899, 999
  description: string;
  badgeColor: string;
  perks: string[];
  imageUrl?: string;
}

export interface VipMembershipRequest {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  email?: string;
  tierId: VipTierId;
  amount: number;
  paymentMethod?: 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'whatsapp';
  transactionId?: string;
  screenshot?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  notes?: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'adjusted';
  points: number;
  description: string;
  orderId?: string;
  date: string;
}

export interface AbandonedCheckout {
  id: string;
  customerName: string;
  phone: string;
  address?: string;
  items: CartItem[];
  cartTotal: number;
  createdAt: string;
  recoveryStatus: 'pending' | 'recovered' | 'message_sent';
  lastMessageSentAt?: string;
}

export interface LiveStoreStats {
  activeVisitors: number;
  openCartsCount: number;
  openCartsValue: number;
  checkoutsInProgress: number;
}

export interface AutoReviewConfig {
  enabled: boolean;
  delayHours: number; // default 12 hours
  rewardPoints: number; // default 20 bonus points
  whatsappTemplate: string;
  autoSendWhatsapp: boolean;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  channel: 'whatsapp' | 'email';
  audience?: 'all' | 'vip' | 'inactive' | 'high_spenders' | string;
  targetAudience?: string;
  message: string;
  includedProduct?: MenuItem;
  sentCount?: number;
  recipientCount?: number;
  sentAt: string;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  price: number; // PKR
  estimatedTime: string;
  minOrderAmount?: number;
  enabled: boolean;
  isDefault?: boolean;
}

export interface DailyDealConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  discountPercentage: number; // default 4%
  itemCount: number; // 5
  selectionMode?: 'random' | 'collection' | 'manual'; // Auto daily random at 12:00 AM, collection, or manual products
  selectedProductIds?: string[];
  collectionCategory?: CategoryId | 'all';
  autoMidnightRotate?: boolean;
}

export interface CustomerLoyaltyRecord {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  defaultAddress?: string;
  savedAddresses?: CustomerAddress[];
  email?: string;
  /** Explicit opt-in for promotional emails; only true means subscribed. */
  emailMarketingConsent?: boolean;
  emailMarketingConsentAt?: string;
  emailMarketingConsentSource?: 'signup' | 'signin' | 'google' | 'account-settings';
  loyaltyPoints: number;
  vipTier?: VipTierId;
  totalOrdersCount: number;
  totalSpent: number;
  createdAt: string;
  lastOrderDate?: string;
}

export type OrderType = 'delivery' | 'self_pickup';

export type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer';

// Simplified checkout fields: ONLY name, address, and phone number
export interface CustomerDetails {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  area?: string;
  landmark?: string;
  notes?: string;
}

export interface CustomerAddress {
  id: string;
  label: string; // e.g. "Home", "Office", "Shop"
  address: string;
  isDefault?: boolean;
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
  taxPercentage?: number;
  taxAmount?: number;
  serviceChargePercentage?: number;
  serviceChargeAmount?: number;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  loyaltyDiscount?: number;
  vipDiscount?: number;
  vipTierApplied?: VipTierId;
  total: number;
  customer: CustomerDetails;
  specialInstructions?: string; // Kitchen notes
  paymentMethod: PaymentMethod;
  status: 'confirmed' | 'kitchen' | 'dispatched' | 'delivered' | 'cancelled';
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  customerUid?: string | null;
  isVisible?: boolean;
}

export interface CustomerUser {
  id: string;
  emailMarketingConsent?: boolean;
  emailMarketingConsentAt?: string;
  emailMarketingConsentSource?: 'signup' | 'signin' | 'google' | 'account-settings';
  fullName: string;
  phone: string;
  address: string;
  defaultAddress?: string;
  savedAddresses?: CustomerAddress[];
  email?: string;
  loyaltyPoints: number; // 10 points per Rs 300 spent
  vipTier?: VipTierId;
  vipStatus?: 'active' | 'pending' | 'none' | 'rejected';
  createdAt: string;
  totalSpent?: number;
  ordersCount?: number;
}

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';

export interface Discount {
  id: string;
  code: string; // e.g. "KFC10" or empty for automatic
  title: string; // Description e.g. "10% Off Orders Above Rs. 1500"
  type: DiscountType;
  value: number; // e.g. 10 (%) or 200 (PKR)
  minOrderAmount?: number;
  isAutomatic: boolean; // if true, auto-applied to eligible carts
  usageLimit?: number;
  usedCount: number;
  status: 'active' | 'scheduled' | 'expired';
  startDate: string;
  endDate?: string;
}

