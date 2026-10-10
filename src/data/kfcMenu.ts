import {
  Category,
  MenuItem,
  MenuItemAddon,
  ChakwalArea,
  StoreSettings,
  PaymentMethodConfig,
  HeroConfig,
  HeaderFooterConfig,
  ProductReview,
  PageSection,
  Discount,
  StorePolicy,
  DeliveryMethod,
  DailyDealConfig,
  VipTier,
  CustomDomainConfig,
  MetaCommerceConfig,
  AutoReviewConfig,
} from '../types';

export const KFC_CATEGORIES: Category[] = [
  { id: 'everyday-value', name: 'Everyday Value', subtitle: 'Unbeatable daily deals & value combos' },
  { id: 'ala-carte-combos', name: 'Ala-Carte & Combos', subtitle: 'Signature Zingers, burgers & box meals' },
  { id: 'family-sharing', name: 'Family Sharing', subtitle: 'Iconic buckets, platters & feast deals' },
  { id: 'midnight-deals', name: 'Midnight Deals', subtitle: 'Late night cravings loaded with flavor' },
  { id: 'snacks-sides', name: 'Snacks & Sides', subtitle: 'Hot wings, crispy fries & signature dips' },
  { id: 'beverages-desserts', name: 'Beverages & Desserts', subtitle: 'Chilled drinks & warm sweet treats' },
];

export const DEFAULT_CHAKWAL_AREAS: ChakwalArea[] = [
  { id: 'cw-within-3km', name: 'Within 3 KM (Chakwal City)', estimatedTime: 'Before 8:00 PM (Order before 4 PM)', isAvailable: true },
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'cod',
    name: 'Cash on Delivery (COD)',
    enabled: true,
    instructions: 'Pay cash to rider upon delivery in Chakwal.',
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    enabled: false,
    accountNumber: '+92 325 2777574',
    accountTitle: 'KFC Chakwal Delivery',
    instructions: 'Online payment gateway is not configured yet.',
  },
  {
    id: 'easypaisa',
    name: 'Easypaisa',
    enabled: true,
    accountNumber: '+92 325 2777574',
    accountTitle: 'KFC Chakwal Delivery',
    instructions: 'Send payment to +92 325 2777574 & share screenshot/TID to WhatsApp.',
  },
  {
    id: 'bank_transfer',
    name: 'Direct Bank Transfer / Card',
    enabled: false,
    accountNumber: 'PK92 MEZN 0001 2345 6789 0101',
    accountTitle: 'KFC Chakwal Delivery',
    instructions: 'Meezan Bank Chakwal Branch.',
  },
];

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  imageUrl: '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg',
  headline: 'CRISPY. JUICY.',
  highlightText: "FINGER LICKIN'",
  endingText: "GOOD.",
  subtext: 'Order your favorite KFC Pakistan Zingers, Krunch Combos, Hot Wings, and Mega Buckets delivered piping hot right to your doorstep anywhere in Chakwal.',
  ctaButtonText: 'EXPLORE ALL ITEMS',
  deliveryBadgeText: 'Chakwal Fast Delivery',
  enabled: true,
};

export const DEFAULT_VIP_TIERS: VipTier[] = [
  {
    id: 'silver',
    name: 'Silver Lifetime VIP Pass',
    discountPercentage: 3,
    price: 499,
    description: 'Flat 3% Lifetime Discount on all orders across Chakwal. Valid forever with one-time payment.',
    badgeColor: 'from-slate-400 to-zinc-600',
    perks: ['Flat 3% Lifetime Discount on all orders', 'Priority Express Cooking', 'Silver VIP Badge', 'Valid forever with one-time payment'],
  },
  {
    id: 'gold',
    name: 'Gold Lifetime VIP Pass',
    discountPercentage: 6,
    price: 899,
    description: 'Flat 6% Lifetime Discount on all orders across Chakwal. Valid forever with one-time payment.',
    badgeColor: 'from-amber-400 to-yellow-600',
    perks: ['Flat 6% Lifetime Discount on all orders', 'Zero packaging charges', 'Gold VIP Badge', 'Valid forever with one-time payment'],
  },
  {
    id: 'platinum',
    name: 'Platinum Lifetime VIP Pass',
    discountPercentage: 8,
    price: 999,
    description: 'Flat 8% Lifetime Discount on all orders across Chakwal. Top Priority Kallar Kahar Dispatch.',
    badgeColor: 'from-rose-500 via-red-600 to-amber-600',
    perks: ['Flat 8% Lifetime Discount on all orders', 'Top Priority Kallar Kahar Dispatch', 'VIP Platinum Hot Badge', 'Personal Dedicated Rider fleet priority'],
  },
];

export const DEFAULT_CUSTOM_DOMAIN_CONFIG: CustomDomainConfig = {
  domain: 'kfcchk.kintrends.com',
  status: 'pending_verification',
  aRecord: '',
  cnameRecord: '',
  txtVerification: '',
  sslActive: false,
};

export const DEFAULT_META_COMMERCE_CONFIG: MetaCommerceConfig = {
  pixelId: '',
  conversionsApiToken: '',
  catalogFeedUrl: '',
  testEventCode: '',
  instagramShoppingEnabled: false,
  facebookShopEnabled: false,
  trackAddToCart: true,
  trackInitiateCheckout: true,
  trackPurchase: true,
};

export const DEFAULT_AUTO_REVIEW_CONFIG: AutoReviewConfig = {
  enabled: false,
  delayHours: 12,
  rewardPoints: 20,
  whatsappTemplate: 'Assalam o Alaikum {customer_name}! Umeed hai aap ka KFC meal bohot crispy aur piping hot tha. Baraye mehrbani 1 minute nikaal kar apna star rating aur review dein: {review_link}. Review submit karny par aapko 20 FREE Loyalty Points milenge!',
  autoSendWhatsapp: true,
};

export const DEFAULT_HEADER_FOOTER_CONFIG: HeaderFooterConfig = {
  logoUrl: '',
  headerTitle: 'KFC CHAKWAL',
  footerAboutText: 'Bringing authentic KFC Pakistan crispy chicken, Zingers, Krunch burgers, and family sharing meals straight to homes and workplaces across Chakwal.',
  footerCopyrightText: '© 2026 KFC Chakwal Delivery. All rights reserved.',
};

export const INITIAL_REVIEWS: ProductReview[] = [];

export const DEFAULT_CUSTOM_SECTIONS: PageSection[] = [
  {
    id: 'sec-custom-placeholder-1',
    type: 'image-with-text',
    page: 'home',
    title: 'Craving Authentic KFC Crispy Chicken in Chakwal?',
    subtitle: 'Hot, Juicy & Made Fresh on Order',
    description: 'We bring KFC Pakistan favorite recipes right to your doorstep across Chakwal. Insulated delivery ensures every bite stays piping hot and intensely crispy.',
    imageUrl: '/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg',
    imagePosition: 'right',
    badgeText: 'Chakwal Special',
    buttonText: 'Order Everyday Value',
    buttonLink: '#kfc-menu-section',
    isVisible: true,
    order: 1,
  },
  {
    id: 'sec-delivery-guarantee',
    type: 'delivery-info',
    page: 'home',
    title: 'KFC Chakwal Delivery Service',
    subtitle: 'Picked from Kallar Kahar Motorway & Delivered to Chakwal',
    description: 'Ye KFC Chakwal Delivery ek alag se delivery service hai hamari, Hum Kallar Kahar Motorway wali KFC branch se KFC pick kar ky Chakwal mein daily deliver karty hein. Delivery Area: Within 3 KM of Chakwal City. Agar customer daily 4:00 PM se pehly order kary to ussy same day delivery sham 8:00 PM se pehly pehly mil jati hai.',
    estimatedTime: 'Delivered by 8:00 PM (Order before 4 PM)',
    deliveryFeeText: 'Flat Rs. 399 Delivery Fee',
    deliveryAreaText: 'Delivery Area: Within 3 KM',
    badgeText: 'Chakwal Delivery Service',
    isVisible: true,
    order: 2,
  },
  {
    id: 'sec-custom-placeholder-2',
    type: 'image-with-text',
    page: 'home',
    title: 'Family Feast & Weekend Buckets',
    subtitle: 'Best Value for Family Gatherings',
    description: 'Treat your family to our iconic 9 pcs chicken buckets, crispy hot wings, dinner rolls, and chilled drinks. Instant happiness delivered in minutes.',
    imageUrl: '/src/assets/images/kfc_bucket_crispy_chicken_1791015820219.jpg',
    imagePosition: 'left',
    badgeText: 'Family Deals',
    buttonText: 'Explore Buckets',
    buttonLink: '#kfc-menu-section',
    isVisible: true,
    order: 3,
  },
];

export const DEFAULT_STORE_POLICIES: StorePolicy[] = [
  {
    id: 'pol-kallar-kahar',
    title: 'KFC Kallar Kahar Motorway Pick & Delivery Service',
    slug: 'kallar-kahar-service',
    content: 'Ye KFC Chakwal Delivery ek alag se delivery service hai hamari. Hum Kallar Kahar Motorway wali KFC branch se taza, certified aur authentic KFC pick kar ky Chakwal mein daily deliver karty hein.',
  },
  {
    id: 'pol-timings',
    title: 'Same-Day Delivery Timing Policy (Order Before 4:00 PM)',
    slug: 'delivery-timings',
    content: 'Agar customer daily shaam 4:00 PM se pehly order place karey to ussy same-day delivery sham 8:00 PM se pehly pehly mil jati hai. 4:00 PM ke baad aney walay orders aglay din ki schedule mein deliver kiye jatay hain.',
  },
  {
    id: 'pol-coverage',
    title: 'Chakwal Delivery Coverage (Within 3 KM)',
    slug: 'delivery-coverage',
    content: 'Delivery Chakwal City ke 3 Kilometer radius (Within 3 KM of Chakwal City) ke andar ki jati hai. Flat delivery charges apply hotay hain.',
  },
  {
    id: 'pol-loyalty',
    title: 'Loyalty Points Reward Policy',
    slug: 'loyalty-points',
    content: 'Har Rs. 300 ki shopping par customer ko 10 Loyalty Points miltay hain (1 Point = Rs. 1 Flat Discount). Ye loyalty points kisi doosray discount coupon ke sath combine nahi hotay, aur points redeem karnay ke liye minimum Rs. 500 ki shopping hona lazmi hai.',
  },
  {
    id: 'pol-freshness',
    title: '100% Original & Sealed Food Guarantee',
    slug: 'freshness-guarantee',
    content: 'Tamam orders KFC Kallar Kahar se sealed tamper-evident boxes aur thermal insulated carrier bags mein Chakwal laye jatay hain taake chicken bilkul crispy aur juicy rahay.',
  },
];

export const DEFAULT_DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: 'dm-standard',
    name: 'Standard Chakwal Delivery (Within 3 KM)',
    description: 'Fresh KFC picked from Kallar Kahar Motorway and delivered hot to your doorstep in Chakwal.',
    price: 399,
    estimatedTime: 'Delivered by 8:00 PM (Order before 4 PM)',
    enabled: true,
    isDefault: true,
  },
  {
    id: 'dm-priority',
    name: 'Priority Express Rider (Within 3 KM)',
    description: 'Priority insulated dispatch directly upon arrival in Chakwal.',
    price: 550,
    estimatedTime: 'Priority Dispatch by 7:30 PM',
    enabled: true,
    isDefault: false,
  },
  {
    id: 'dm-free-large',
    name: 'Free Delivery on Orders Above Rs. 3500',
    description: 'Automatic free delivery for bulk and family orders of Rs. 3500 or more.',
    price: 0,
    minOrderAmount: 3500,
    estimatedTime: 'Delivered by 8:00 PM',
    enabled: true,
    isDefault: false,
  },
];

export const DEFAULT_DAILY_DEAL: DailyDealConfig = {
  enabled: false,
  title: "Daily 5 Deals",
  subtitle: 'Manual daily offers — automatic midnight rotation requires a server scheduler.',
  discountPercentage: 4,
  itemCount: 5,
  selectionMode: 'manual',
  selectedProductIds: [],
  autoMidnightRotate: false,
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'KFC Chakwal Delivery',
  tagline: "Authentic KFC Picked from Kallar Kahar Motorway & Delivered to Chakwal",
  markupPercentage: 12, // 12% higher than KFC PK original prices
  deliveryFee: 399, // Rs 399 delivery charges
  minOrderAmount: 500,
  phone: '+92 325 2777574',
  whatsappNumber: '+92 325 2777574',
  storeAddress: 'Chakwal City, Punjab (Deliveries from KFC Kallar Kahar Motorway)',
  openingHours: 'Orders Open: 10:00 AM - 04:00 PM (Delivery by 08:00 PM)',
  isStoreOpen: true,
  announcementText: '🍗 Fresh KFC Picked from Kallar Kahar Motorway & Delivered in Chakwal (Within 3 KM)! Order before 4:00 PM for Delivery by 8:00 PM.',
  showAnnouncement: true,
  announcementBars: [{ id: 'announcement-1', text: '🍗 Fresh KFC Picked from Kallar Kahar Motorway & Delivered in Chakwal (Within 3 KM)! Order before 4:00 PM for Delivery by 8:00 PM.', enabled: true }],
  themeMode: 'light', // Default day theme as requested
  headingFont: 'Barlow Condensed',
  bodyFont: 'Plus Jakarta Sans',
  descriptionWordLimit: 25, // Controllable word limit (max 300)
  deliveryRadiusText: 'Within 3 KM of Chakwal City',
  kallarKaharNotice: 'KFC Chakwal Delivery ek independent delivery service hai hamari, Hum Kallar Kahar Motorway wali KFC branch se fresh meal pick kar ky Chakwal mein daily deliver karty hein.',
  sameDayOrderCutoff: '4:00 PM',
  sameDayDeliveryBy: '8:00 PM',
  orderNotificationSound: true,
  customAppIconUrl: '/pwa-512.png',
  customPreloaderLogoUrl: '/logo.svg',
  customerAuthCopy: {
    title: 'KFC Customer Login',
    subtitle: 'Apna account banayein aur apne orders, addresses aur rewards manage karein.',
    googleButtonText: 'Continue with Google',
    emailLabel: 'Apni Gmail ID / Email',
    emailPlaceholder: 'example@gmail.com',
    passwordLabel: 'Password',
    signInButtonText: 'Sign In',
    newAccountText: 'New Account',
    fullNameLabel: 'Aap ka Naam',
    createAccountButtonText: 'Account Banayein',
    verificationMessage: 'Aapki Gmail par verification email bheji gayi hai. Inbox ya Spam check karke email verify karein.',
    helperText: 'Google se login sab se asaan hai. Ya apni Gmail ID aur password se account use karein.',
  },
  homepageVideo: {
    enabled: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-frying-crispy-chicken-tenders-in-oil-42630-large.mp4',
    title: 'Fresh Hot Chicken · Kallar Kahar to Chakwal',
    subtitle: 'Insulated Tamper-Evident Delivery Daily by 8:00 PM',
    position: 'middle',
  },
  deliveryMethods: DEFAULT_DELIVERY_METHODS,
  dailyDeal: DEFAULT_DAILY_DEAL,
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com',
    whatsapp: 'https://wa.me/923252777574',
  },
  policies: DEFAULT_STORE_POLICIES,
  deliverySection: {
    enabled: true,
    badgeText: '⚡ Picked from Kallar Kahar & Delivered in Chakwal',
    headline: 'Same-Day Delivery Before 8:00 PM',
    estimatedTime: 'Delivered by 8:00 PM (Order before 4 PM)',
    description: 'Hum Kallar Kahar Motorway branch se authentic sealed hot KFC pick kar ke Chakwal city (within 3km) deliver karte hain. Daily 4 baje se pehle order karein aur sham 8 baje tak receive karein.',
    deliveryFeeText: 'Flat Rs. 399',
    buttonText: 'Order Now',
  },
  customSections: DEFAULT_CUSTOM_SECTIONS,
  headerFooter: {
    logoUrl: '/logo.svg',
    headerTitle: 'KFC CHAKWAL DELIVERY',
    footerAboutText: 'KFC Chakwal Delivery: Hum Kallar Kahar Motorway branch se authentic sealed hot KFC pick kar ke Chakwal city (within 3km) daily deliver karte hain.',
    footerCopyrightText: '© 2026 KFC Chakwal Delivery. All rights reserved. Phone: +92 325 2777574',
  },
  hero: DEFAULT_HERO_CONFIG,
  paymentMethods: DEFAULT_PAYMENT_METHODS,
  defaultBadgePosition: 'top-left',
  customDomain: DEFAULT_CUSTOM_DOMAIN_CONFIG,
  metaCommerce: DEFAULT_META_COMMERCE_CONFIG,
  autoReview: DEFAULT_AUTO_REVIEW_CONFIG,
  shopify: {
    enabled: false,
    storeDomain: '',
    storefrontAccessToken: '',
    adminWebhookUrl: '',
    autoSyncOrders: false,
  },
};

export interface BeverageOption {
  id: string;
  name: string;
  volume: string;
  image: string;
  price: number;
}

export const BEVERAGE_OPTIONS: BeverageOption[] = [
  {
    id: 'pepsi-can',
    name: 'Pepsi (345ml)',
    volume: 'Chilled Can',
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200&auto=format&fit=crop&q=80',
    price: 130,
  },
  {
    id: '7up-can',
    name: '7UP (345ml)',
    volume: 'Chilled Can',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&auto=format&fit=crop&q=80',
    price: 130,
  },
  {
    id: 'mirinda-can',
    name: 'Mirinda (345ml)',
    volume: 'Chilled Can',
    image: 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=200&auto=format&fit=crop&q=80',
    price: 130,
  },
  {
    id: 'dew-can',
    name: 'Mountain Dew (345ml)',
    volume: 'Chilled Can',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&auto=format&fit=crop&q=80',
    price: 130,
  },
  {
    id: 'water-pet',
    name: 'Aquafina Water (500ml)',
    volume: 'Chilled Bottle',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=200&auto=format&fit=crop&q=80',
    price: 90,
  },
];

// Common customizable addons with food thumbnail images
export const BURGER_ADDONS: MenuItemAddon[] = [
  { 
    id: 'extra-cheese', 
    name: 'Extra Cheese Slice', 
    price: 80, 
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'garlic-mayo-dip', 
    name: 'Garlic Mayo Dip', 
    price: 100, 
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'vietnamese-dip', 
    name: 'Vietnamese Chili Sauce', 
    price: 100, 
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'upsize-fries', 
    name: 'Upsize to Large Fries', 
    price: 120, 
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'extra-chicken-pc', 
    name: 'Add 1 Pc Crispy Chicken', 
    price: 320, 
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80' 
  },
];

export const INITIAL_KFC_ITEMS: MenuItem[] = [
  {
    "id": "krunch-burger",
    "name": "Krunch Burger",
    "categoryId": "everyday-value",
    "description": "Krunch fillet, spicy mayo, lettuce, sandwiched between a sesame seed bun",
    "baseKfcPrice": 350,
    "sellingPrice": 350,
    "compareAtPrice": 420,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/krunchburger.png?v=1788779323",
    "isSpicy": false,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": false,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    },
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/krunchburger.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "krunch-combo",
    "name": "Krunch Combo",
    "categoryId": "everyday-value",
    "description": "1 Krunch burger + 1 Regular fries + 1 Regular drink",
    "baseKfcPrice": 670,
    "sellingPrice": 670,
    "compareAtPrice": 790,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/krunchcombo.png?v=1788779323",
    "isSpicy": false,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    },
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/krunchcombo.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "krunch-burger-with-drink",
    "name": "Krunch Burger + Drink",
    "categoryId": "everyday-value",
    "description": "1 Krunch burger + 1 Regular drink",
    "baseKfcPrice": 465,
    "sellingPrice": 465,
    "compareAtPrice": 550,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/krunchburger_Drink.png?v=1788779323",
    "isSpicy": false,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    },
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/krunchburger_Drink.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "rice-and-spice",
    "name": "Rice & Spice",
    "categoryId": "everyday-value",
    "description": "Spiced and buttery rice with 6 pcs of Hot Shots topped with our signature Vietnamese sauce",
    "baseKfcPrice": 475,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Rice_Spice520.png?v=1788779323",
    "isSpicy": true,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": false,
      "allowDrinkChoice": false,
      "availableAddons": [
        {
          "id": "extra-rice-sauce",
          "name": "Extra Vietnamese Sauce",
          "price": 90
        },
        {
          "id": "extra-pops",
          "name": "Extra Chicken Pops (6 pcs)",
          "price": 210
        }
      ]
    },
    "sellingPrice": 475,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Rice_Spice520.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "3-pcs-chicken",
    "name": "3 Pcs Chicken",
    "categoryId": "everyday-value",
    "description": "3 pieces of authentic signature chicken, fried to golden crispy perfection with secret herbs and spices.",
    "baseKfcPrice": 790,
    "image": "/src/assets/images/kfc_bucket_crispy_chicken_1791015820219.jpg",
    "isSpicy": true,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": false,
      "availableAddons": [
        {
          "id": "dinner-roll",
          "name": "Dinner Roll (1 pc)",
          "price": 70
        },
        {
          "id": "garlic-dip",
          "name": "Garlic Mayo Dip",
          "price": 100
        },
        {
          "id": "coleslaw-side",
          "name": "Coleslaw Cup",
          "price": 180
        }
      ]
    }
  },
  {
    "id": "1-pc-chicken",
    "name": "1 Pc Chicken",
    "categoryId": "everyday-value",
    "description": "1 piece of juicy, crunchy golden fried chicken (Hot & Crispy or Original Recipe).",
    "baseKfcPrice": 290,
    "image": "/src/assets/images/kfc_bucket_crispy_chicken_1791015820219.jpg",
    "isSpicy": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": false,
      "availableAddons": [
        {
          "id": "dinner-roll",
          "name": "Dinner Roll",
          "price": 70
        },
        {
          "id": "garlic-dip",
          "name": "Garlic Mayo Dip",
          "price": 100
        }
      ]
    }
  },
  {
    "id": "zinger-burger",
    "name": "Zinger Burger",
    "categoryId": "ala-carte-combos",
    "description": "Crispy Zinger fillet, signature mayo and lettuce- sandwiched between a sesame seed bun",
    "baseKfcPrice": 680,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/zingerburger.png?v=1788779323",
    "isSpicy": true,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": false,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    },
    "sellingPrice": 680,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/zingerburger.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "zinger-combo",
    "name": "Zinger Combo",
    "categoryId": "ala-carte-combos",
    "description": "Zinger burger + 1 Regular fries+ 1 Regular drink",
    "baseKfcPrice": 1030,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/zingercombo.png?v=1788779323",
    "isSpicy": true,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    },
    "sellingPrice": 1030,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/zingercombo.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "mighty-zinger",
    "name": "Mighty Zinger",
    "categoryId": "ala-carte-combos",
    "description": "Our signature Zinger but Bigger! Double Zinger fillet with a combination of spicy and plain mayo, lettuce and cheese- sandwiched between a sesame seed bun",
    "baseKfcPrice": 870,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/mightyzinger.png?v=1788779323",
    "isSpicy": true,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": false,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    },
    "sellingPrice": 870,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/mightyzinger.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "mighty-zinger-combo",
    "name": "Mighty Zinger Combo",
    "categoryId": "ala-carte-combos",
    "description": "Mighty Zinger + 1 Regular fries + 1 Regular drink",
    "baseKfcPrice": 1190,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/mightyzingercombo.png?v=1788779323",
    "isSpicy": true,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    },
    "sellingPrice": 1190,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/mightyzingercombo.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "kentucky-burger",
    "name": "Kentucky Burger",
    "categoryId": "ala-carte-combos",
    "description": "OG Zinger fillet layered with beef pepperoni, crispy fried onions, cheese and smokey BBQ sauce- sandwiched between an herb and black sesame bun",
    "baseKfcPrice": 750,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/kentuckyburger.png?v=1788779323",
    "isSpicy": false,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": false,
      "allowDrinkChoice": false,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    },
    "sellingPrice": 750,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/kentuckyburger.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "twister",
    "name": "Twister",
    "categoryId": "ala-carte-combos",
    "description": "Tender boneless strips, black pepper mayo, diced tomatoes and lettuce- wrapped in a tortilla",
    "baseKfcPrice": 500,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/twister480.png?v=1788779323",
    "isSpicy": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": false,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    },
    "sellingPrice": 500,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/twister480.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "twister-combo",
    "name": "Twister Combo",
    "categoryId": "ala-carte-combos",
    "description": "Twister + 1 Regular fries + 1 Regular drink",
    "baseKfcPrice": 800,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/twistercombo.png?v=1788779323",
    "isSpicy": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    },
    "sellingPrice": 800,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/twistercombo.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "crispy-duo-box",
    "name": "Crispy Duo Box",
    "categoryId": "ala-carte-combos",
    "description": "5 pcs Hot & Crispy Chicken + 1 Large fries + 2 Regular drinks",
    "baseKfcPrice": 1570,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/crispyduobox.png?v=1788779323",
    "isSpicy": true,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    },
    "sellingPrice": 1570,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/crispyduobox.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "super-box",
    "name": "Super Box",
    "categoryId": "ala-carte-combos",
    "description": "1 Zinger burger + 1 Pc signature chicken + 1 Regular Fries + 1 Classic Coleslaw + 1 Drink (345ml).",
    "baseKfcPrice": 1650,
    "image": "/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg",
    "isSpicy": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    }
  },
  {
    "id": "value-bucket-9pcs",
    "name": "Value Bucket (9 Pcs)",
    "categoryId": "family-sharing",
    "description": "9 pieces of authentic KFC signature chicken, freshly fried to a golden crunch. Perfect for family gatherings.",
    "baseKfcPrice": 2350,
    "image": "/src/assets/images/kfc_bucket_crispy_chicken_1791015820219.jpg",
    "isSpicy": true,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": false,
      "availableAddons": [
        {
          "id": "fries-bucket",
          "name": "Add Tangy Fries Bucket",
          "price": 490
        },
        {
          "id": "drink-15l",
          "name": "Add 1.5 Liter Drink",
          "price": 310
        },
        {
          "id": "dinner-rolls-4",
          "name": "4 Dinner Rolls",
          "price": 260
        }
      ]
    }
  },
  {
    "id": "family-festival-1",
    "name": "Family Festival 1",
    "categoryId": "family-sharing",
    "description": "4 Krunch burgers+ 4 pieces Hot and Crispy Chicken+ 2 Dinner Rolls + 1.5 Liter drink",
    "baseKfcPrice": 2480,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/familyfestival.png?v=1788779323",
    "isSpicy": true,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-fries",
          "name": "Add Large French Fries",
          "price": 420
        },
        {
          "id": "extra-coleslaw",
          "name": "Add Coleslaw Cup",
          "price": 180
        },
        {
          "id": "extra-dips-2",
          "name": "2x Garlic Mayo Dips",
          "price": 190
        }
      ]
    },
    "sellingPrice": 2480,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/familyfestival.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "family-festival-2",
    "name": "Family Festival 2",
    "categoryId": "family-sharing",
    "description": "2 Zinger burgers + 2 Krunch burgers + 4 pieces Hot and Crispy Chicken + 2 Dinner rolls + 1.5 Liter drink",
    "baseKfcPrice": 2705,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/familyfestival2.png?v=1788779323",
    "isSpicy": true,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-fries",
          "name": "Add Large French Fries",
          "price": 420
        },
        {
          "id": "extra-coleslaw",
          "name": "Add Coleslaw Cup",
          "price": 180
        }
      ]
    },
    "sellingPrice": 2705,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/familyfestival2.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "family-festival-3",
    "name": "Family Festival 3",
    "categoryId": "family-sharing",
    "description": "4 Zinger burgers + 4 pieces Hot and Crispy Chicken + 2 Dinner rolls + 1.5 Liter drink",
    "baseKfcPrice": 2930,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/familyfestival3.png?v=1788779323",
    "isSpicy": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-rolls",
          "name": "2 Dinner Rolls",
          "price": 140
        },
        {
          "id": "extra-dip",
          "name": "Garlic Mayo Dip",
          "price": 100
        }
      ]
    },
    "sellingPrice": 2930,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/familyfestival3.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "wow-meal",
    "name": "Wow Meal",
    "categoryId": "family-sharing",
    "description": "1 Zinger Burger + 1 Piece of Chicken + 1 Regular Fries + 1 Soft Drink can (345ml). An all-time fan favorite!",
    "baseKfcPrice": 1190,
    "image": "/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg",
    "isSpicy": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    }
  },
  {
    "id": "midnight-deal-1",
    "name": "Midnight Deal 1",
    "categoryId": "midnight-deals",
    "description": "1 Zinger Burger + 1 Chilled soft drink (345ml). Active late night delivery special across Chakwal!",
    "baseKfcPrice": 590,
    "image": "/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg",
    "isSpicy": true,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    }
  },
  {
    "id": "midnight-deal-2",
    "name": "Midnight Deal 2",
    "categoryId": "midnight-deals",
    "description": "2 Krunch Burgers + 2 Chilled soft drinks (345ml). Maximum crunch for late night cravings.",
    "baseKfcPrice": 920,
    "image": "/src/assets/images/kfc_krunch_burger_1791015834419.jpg",
    "isSpicy": false,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    }
  },
  {
    "id": "midnight-deal-3",
    "name": "Midnight Deal 3",
    "categoryId": "midnight-deals",
    "description": "1 Mighty Zinger Burger + 1 Regular golden French fries + 1 Soft drink (345ml).",
    "baseKfcPrice": 1090,
    "image": "/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg",
    "isSpicy": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": true,
      "allowDrinkChoice": true,
      "availableAddons": [
        {
          "id": "extra-cheese",
          "name": "Extra Cheese Slice",
          "price": 80,
          "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "garlic-mayo-dip",
          "name": "Garlic Mayo Dip",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Chili Sauce",
          "price": 100,
          "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "upsize-fries",
          "name": "Upsize to Large Fries",
          "price": 120,
          "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80"
        },
        {
          "id": "extra-chicken-pc",
          "name": "Add 1 Pc Crispy Chicken",
          "price": 320,
          "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80"
        }
      ]
    }
  },
  {
    "id": "hot-wings-10pcs",
    "name": "Hot Wings (10 Pcs)",
    "categoryId": "snacks-sides",
    "description": "10 pieces of fiery, crunchy hot wings breaded in KFC signature spicy coating.",
    "baseKfcPrice": 690,
    "image": "/src/assets/images/kfc_hot_wings_platter_1791015846233.jpg",
    "isSpicy": true,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "allowSpiceLevel": false,
      "allowDrinkChoice": false,
      "availableAddons": [
        {
          "id": "garlic-dip",
          "name": "Garlic Mayo Dip",
          "price": 100
        },
        {
          "id": "vietnamese-dip",
          "name": "Vietnamese Sauce",
          "price": 100
        }
      ]
    }
  },
  {
    "id": "tangy-fries-bucket",
    "name": "Tangy Fries Bucket",
    "categoryId": "snacks-sides",
    "description": "A full bucket of hot golden french fries tossed with KFC signature tangy chili spice blend.",
    "baseKfcPrice": 450,
    "image": "/src/assets/images/kfc_hot_wings_platter_1791015846233.jpg",
    "isSpicy": true,
    "isPopular": true,
    "isAvailable": true,
    "customizableOptions": {
      "availableAddons": [
        {
          "id": "melted-cheese",
          "name": "Melted Cheddar Cheese Dip",
          "price": 120
        }
      ]
    }
  },
  {
    "id": "french-fries-large",
    "name": "French Fries (Large)",
    "categoryId": "snacks-sides",
    "description": "Large portion of golden, crispy, salted French fries.",
    "baseKfcPrice": 390,
    "image": "/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg",
    "isSpicy": false,
    "isAvailable": true
  },
  {
    "id": "french-fries-medium",
    "name": "French Fries (Medium)",
    "categoryId": "snacks-sides",
    "description": "Medium portion of crispy golden salted French fries.",
    "baseKfcPrice": 310,
    "image": "/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg",
    "isSpicy": false,
    "isAvailable": true
  },
  {
    "id": "coleslaw",
    "name": "Coleslaw",
    "categoryId": "snacks-sides",
    "description": "Sliced cabbage and carrots tossed in mayo",
    "baseKfcPrice": 170,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Coleslaw.png?v=1788779323",
    "isSpicy": false,
    "isAvailable": true,
    "sellingPrice": 170,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Coleslaw.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "dinner-roll",
    "name": "Dinner Roll",
    "categoryId": "snacks-sides",
    "description": "Soft and fluffy, it complements any meal perfectly",
    "baseKfcPrice": 55,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/DinnerRoll.png?v=1788779323",
    "isSpicy": false,
    "isAvailable": true,
    "sellingPrice": 55,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/DinnerRoll.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "garlic-mayo-dip-side",
    "name": "Garlic Mayo Dip",
    "categoryId": "snacks-sides",
    "description": "Creamy mayo with a hint of garlic for that extra zing.",
    "baseKfcPrice": 85,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/GarlicMayo.png?v=1788779323",
    "isSpicy": false,
    "isAvailable": true,
    "sellingPrice": 85,
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/GarlicMayo.png?v=1788779323"
    ],
    "status": "active"
  },
  {
    "id": "vietnamese-dip-side",
    "name": "Vietnamese Chili Sauce",
    "categoryId": "snacks-sides",
    "description": "Sweet and spicy Vietnamese style chili dipping sauce.",
    "baseKfcPrice": 90,
    "image": "/src/assets/images/kfc_hot_wings_platter_1791015846233.jpg",
    "isSpicy": true,
    "isAvailable": true
  },
  {
    "id": "soft-drink-pepsi-can",
    "name": "Pepsi Can (345ml)",
    "categoryId": "beverages-desserts",
    "description": "Chilled canned Pepsi soft drink.",
    "baseKfcPrice": 180,
    "image": "/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg",
    "isAvailable": true
  },
  {
    "id": "soft-drink-7up-can",
    "name": "7Up Can (345ml)",
    "categoryId": "beverages-desserts",
    "description": "Chilled canned 7Up lemon-lime soft drink.",
    "baseKfcPrice": 180,
    "image": "/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg",
    "isAvailable": true
  },
  {
    "id": "soft-drink-mirinda-can",
    "name": "Mirinda Can (345ml)",
    "categoryId": "beverages-desserts",
    "description": "Chilled canned Mirinda orange soft drink.",
    "baseKfcPrice": 180,
    "image": "/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg",
    "isAvailable": true
  },
  {
    "id": "soft-drink-dew-can",
    "name": "Mountain Dew Can (345ml)",
    "categoryId": "beverages-desserts",
    "description": "Chilled canned Mountain Dew citrus soft drink.",
    "baseKfcPrice": 180,
    "image": "/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg",
    "isAvailable": true
  },
  {
    "id": "pepsi-15l-bottle",
    "name": "Pepsi Bottle (1.5 Liter)",
    "categoryId": "beverages-desserts",
    "description": "Large 1.5 Liter chilled Pepsi family bottle.",
    "baseKfcPrice": 280,
    "image": "/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg",
    "isAvailable": true
  },
  {
    "id": "7up-15l-bottle",
    "name": "7Up Bottle (1.5 Liter)",
    "categoryId": "beverages-desserts",
    "description": "Large 1.5 Liter chilled 7Up family bottle.",
    "baseKfcPrice": 280,
    "image": "/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg",
    "isAvailable": true
  },
  {
    "id": "mineral-water-500ml",
    "name": "Aquafina Mineral Water (500ml)",
    "categoryId": "beverages-desserts",
    "description": "Pure chilled drinking water bottle.",
    "baseKfcPrice": 100,
    "image": "/src/assets/images/kfc_hero_zinger_combo_1791015805739.jpg",
    "isAvailable": true
  },
  {
    "id": "choco-lava-cake",
    "name": "Choco Lava Cake",
    "categoryId": "beverages-desserts",
    "description": "Warm, decadent chocolate cake with a luscious molten melted chocolate center.",
    "baseKfcPrice": 450,
    "image": "/src/assets/images/kfc_hot_wings_platter_1791015846233.jpg",
    "isPopular": true,
    "isAvailable": true
  },
  {
    "id": "zinger-strips-n-dips",
    "name": "Zinger Strips N' Dips",
    "categoryId": "everyday-value",
    "description": "4 Zingers + 8 Strips + 3 Dips (Creamy Ranch, Garlic Mayo and Cheetos Dip) & 1.5Ltr Drink",
    "baseKfcPrice": 2790,
    "sellingPrice": 2790,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/e6638440-bcff-11f1-bf42-e731cb346106-App-Web--Kiosk-Thumbnail-500x500-1-2026-09-30185109.png?v=1790933620",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/e6638440-bcff-11f1-bf42-e731cb346106-App-Web--Kiosk-Thumbnail-500x500-1-2026-09-30185109.png?v=1790933620"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "mighty-double-family-bundle",
    "name": "Mighty Double Family Bundle",
    "categoryId": "everyday-value",
    "description": "2 Mighty Zingers + 2 Krunch Burgers + 1 One Piece Chicken + 1 Regular Fries + 1 Regular Masala Fries + 1.5L Drink + 1 Smoke Show Dip",
    "baseKfcPrice": 3790,
    "sellingPrice": 3790,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Display_burgers_on_white_background_20260920130812.jpg?v=1789891700",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Display_burgers_on_white_background_20260920130812.jpg?v=1789891700"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "zinger-wings-masala-bundle",
    "name": "Zinger Wings Masala Bundle",
    "categoryId": "everyday-value",
    "description": "1 Zinger Burger + 1 Twister + 1 Krunch Burger + 1 Hot Wings Bucket + 1 Masala Fries Bucket + 2 Regular Drink + 1 Colonel’s Secret Sauce",
    "baseKfcPrice": 3270,
    "sellingPrice": 3270,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Two_drinks_displayed_20260920125854.jpg?v=1789891150",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Two_drinks_displayed_20260920125854.jpg?v=1789891150"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "mighty-wings-bucket-bundle",
    "name": "Mighty Wings Bucket Bundle",
    "categoryId": "everyday-value",
    "description": "1 Mighty Zinger + 1 Zinger Burger + 1 Krunch Burger + 1 Hot Wings Bucket + 1 Masala Fries Bucket + 1 Regular Drink + 1 Colonel’s Secret Sauce",
    "baseKfcPrice": 3490,
    "sellingPrice": 3490,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Display_items_on_white_background_20260920120948.jpg?v=1789888198",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Display_items_on_white_background_20260920120948.jpg?v=1789888198"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "zinger-krunch-chicken-bundle",
    "name": "Zinger Krunch Chicken Family Bundle",
    "categoryId": "everyday-value",
    "description": "2 Zinger Burgers + 2 Krunch Burgers + 3 Pieces Chicken + 1 Regular Fries + 1 Colonel’s Secret Sauce + 1 Drink 1.5ltr",
    "baseKfcPrice": 3490,
    "sellingPrice": 3490,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Display_all_items_white_background_20260920120414.jpg?v=1789887868",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Display_all_items_white_background_20260920120414.jpg?v=1789887868"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "zinger-stacker-chicken-bundle",
    "name": "Zinger Stacker Chicken Bundle",
    "categoryId": "everyday-value",
    "description": "1 Zinger Burger + 1 Zinger Stacker + 3 Pieces Chicken + 1 Large Fries + 1 Regular Masala Fries + 1 Garlic Mayo Dip + 2 Drinks 345ml",
    "baseKfcPrice": 3190,
    "sellingPrice": 3190,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Display_two_drinks_20260920114858.jpg?v=1789886949",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Display_two_drinks_20260920114858.jpg?v=1789886949"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "mighty-masala-feast-bundle",
    "name": "Mighty Masala Feast Bundle",
    "categoryId": "everyday-value",
    "description": "2 Zinger Burgers + 1 Mighty Zinger + 1 Regular Fries + 1 Regular Masala Fries + 1 Colonel’s Secret Sauce",
    "baseKfcPrice": 3090,
    "sellingPrice": 3090,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919211038.jpg?v=1789834264",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919211038.jpg?v=1789834264"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "zinger-family-feast-bundle",
    "name": "Zinger Family Feast Bundle",
    "categoryId": "everyday-value",
    "description": "2 Zinger Burgers + 2 Krunch Burgers + 3 Pieces Chicken + 1 Large Fries + 1 Colonel’s Secret Sauce",
    "baseKfcPrice": 3390,
    "sellingPrice": 3390,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919205121.jpg?v=1789833089",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919205121.jpg?v=1789833089"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "mighty-masala-bundle",
    "name": "Mighty Masala Bundle",
    "categoryId": "everyday-value",
    "description": "1 Mighty Zinger + 1 Regular Masala Fries + 1 Creamy Ranch + 1 Regular Drink",
    "baseKfcPrice": 1490,
    "sellingPrice": 1490,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919203856.jpg?v=1789832343",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919203856.jpg?v=1789832343"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "twister-masala-bundle",
    "name": "Twister Masala Bundle",
    "categoryId": "everyday-value",
    "description": "1 Twister + 1 Krunch Burger + 1 Regular Masala Fries + 1 Bucket of Fries with Mayo",
    "baseKfcPrice": 1690,
    "sellingPrice": 1690,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260929144506.jpg?v=1790675133",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260929144506.jpg?v=1790675133"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "zinger-fries-dip-bundle",
    "name": "Zinger Fries Dip Bundle",
    "categoryId": "everyday-value",
    "description": "1 Zinger Burger + 1 One Piece Chicken + 1 Bucket of Fries with Mayo + 1 Regular Drink",
    "baseKfcPrice": 1680,
    "sellingPrice": 1680,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919203134.jpg?v=1789831901",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919203134.jpg?v=1789831901"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "krunch-masala-bucket-bundle",
    "name": "Krunch Masala Bucket Bundle",
    "categoryId": "everyday-value",
    "description": "2 Krunch Burgers + 1 Masala Fries Bucket + 1 Garlic Mayo Dip + 1 Regular Drink",
    "baseKfcPrice": 1460,
    "sellingPrice": 1460,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919202345.jpg?v=1789831443",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919202345.jpg?v=1789831443"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "zinger-masala-bundle",
    "name": "Zinger Masala Bundle",
    "categoryId": "everyday-value",
    "description": "1 Zinger Burger + 1 Krunch Burger + 1 Regular Masala Fries + 1 Garlic Mayo Dip",
    "baseKfcPrice": 1430,
    "sellingPrice": 1430,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919201124.jpg?v=1789830694",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919201124.jpg?v=1789830694"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "mixed-burger-bundle",
    "name": "Mixed Burger Bundle",
    "categoryId": "everyday-value",
    "description": "1 Zinger Burger + 2 Krunch Burgers + 1 Regular Fries + 1 Regular Drink",
    "baseKfcPrice": 1870,
    "sellingPrice": 1870,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919194937.jpg?v=1789829385",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919194937.jpg?v=1789829385"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "mexinger-duo-bundle",
    "name": "Mexinger Duo Bundle",
    "categoryId": "everyday-value",
    "description": "1 Mexinger Burger + 1 Zingeratha + 1 Regular Fries + 1 Regular Drink",
    "baseKfcPrice": 1690,
    "sellingPrice": 1690,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919194234.jpg?v=1789828961",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919194234.jpg?v=1789828961"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "chicken-snack-bundle",
    "name": "Chicken Snack Bundle",
    "categoryId": "everyday-value",
    "description": "3 Pcs Chicken + Hot Shots + 1 Regular Fries",
    "baseKfcPrice": 1680,
    "sellingPrice": 1680,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919192532.jpg?v=1789827942",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919192532.jpg?v=1789827942"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "burger-nuggets-bundle",
    "name": "Burger & Nuggets Bundle",
    "categoryId": "everyday-value",
    "description": "1 Zinger Burger + 1 Krunch Burger + 6 Plain Nuggets",
    "baseKfcPrice": 1580,
    "sellingPrice": 1580,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919191100.jpg?v=1789827070",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_images_on_white_background_20260919191100.jpg?v=1789827070"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "mighty-duo-bundle",
    "name": "Mighty Duo Bundle",
    "categoryId": "everyday-value",
    "description": "1 Mighty Zinger + 1 Krunch Burger + 1 Regular Fries + 1 Regular Drink",
    "baseKfcPrice": 1730,
    "sellingPrice": 1730,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Show_them_in_1_image_20260919190835.jpg?v=1789826926",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Show_them_in_1_image_20260919190835.jpg?v=1789826926"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "krunch-wings-bundle",
    "name": "Krunch Wings Bundle",
    "categoryId": "everyday-value",
    "description": "2 Krunch Burgers + 1 Tangy Masala Wings + 1 Regular Fries + 1 Regular Drink",
    "baseKfcPrice": 1899,
    "sellingPrice": 1899,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_subjects_on_white_backgr__20260919191546.jpg?v=1789827354",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_subjects_on_white_backgr__20260919191546.jpg?v=1789827354"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "twister-duo-bundle",
    "name": "Twister Duo Bundle",
    "categoryId": "everyday-value",
    "description": "2 Twisters + 1 Regular Fries + 1.5L Drink",
    "baseKfcPrice": 1599,
    "sellingPrice": 1599,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Show_them_together_white_background_20260919191414.jpg?v=1789827263",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Show_them_together_white_background_20260919191414.jpg?v=1789827263"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "zinger-chicken-bundle",
    "name": "Zinger & Chicken Bundle",
    "categoryId": "everyday-value",
    "description": "1 Zinger Burger + 1 One Piece Chicken + 1 Large Fries + 1 Regular Drink",
    "baseKfcPrice": 1599,
    "sellingPrice": 1599,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Show_them_together_white_background_20260919191648.jpg?v=1789827419",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Show_them_together_white_background_20260919191648.jpg?v=1789827419"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "three-burger-bundle",
    "name": "Three Burger Bundle",
    "categoryId": "everyday-value",
    "description": "3 Krunch Burgers + 1 Large Fries + 1.5L Drink",
    "baseKfcPrice": 1699,
    "sellingPrice": 1699,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Show_items_on_white_background_20260919191724.jpg?v=1789827451",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Show_items_on_white_background_20260919191724.jpg?v=1789827451"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "zinger-duo-bundle",
    "name": "Zinger Duo Bundle",
    "categoryId": "everyday-value",
    "description": "2 Zinger Burgers + 1 Regular Fries + 1 Regular Drink",
    "baseKfcPrice": 1899,
    "sellingPrice": 1899,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_them_into_one_image_20260919183543.jpg?v=1789824954",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Combine_them_into_one_image_20260919183543.jpg?v=1789824954"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "zinger-rice-box",
    "name": "Zinger Rice Bundle Box",
    "categoryId": "everyday-value",
    "description": "Zinger Burger + Rice & Spice + 2 Hot Shots (9pcs in each box) + 345ml Drink",
    "baseKfcPrice": 2330,
    "sellingPrice": 2330,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/rn-image_picker_lib_temp_db2ab037-f7d5-40ce-83a8-67bd88ffb223.jpg?v=1789470082",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/rn-image_picker_lib_temp_db2ab037-f7d5-40ce-83a8-67bd88ffb223.jpg?v=1789470082"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "wings-nuggets-feast",
    "name": "Wings & Nuggets Bundle",
    "categoryId": "everyday-value",
    "description": "10pcs Hot Wings Bucket + 6 Plain Nuggets + Regular Fries + 345ml Drink",
    "baseKfcPrice": 1890,
    "sellingPrice": 1890,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/kfc_menu_with_rates_and_pics_6.png?v=1789470510",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/kfc_menu_with_rates_and_pics_6.png?v=1789470510"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "burger-loaded-fries",
    "name": "Burger & Loaded Fries Bundle",
    "categoryId": "everyday-value",
    "description": "Zinger Burger + Cheesy Chicken Loaded Fries + 345ml Drink",
    "baseKfcPrice": 1530,
    "sellingPrice": 1530,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/rn-image_picker_lib_temp_d10315b5-b973-4cef-bbb1-606e1c32b7e1.jpg?v=1789469298",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/rn-image_picker_lib_temp_d10315b5-b973-4cef-bbb1-606e1c32b7e1.jpg?v=1789469298"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "loaded-chicken-feast",
    "name": "Loaded Chicken Feast Bundle",
    "categoryId": "everyday-value",
    "description": "Crispy Bucket (9 Big Pieces) + Coleslaw + 345ml Drink",
    "baseKfcPrice": 2590,
    "sellingPrice": 2590,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/rn-image_picker_lib_temp_48491682-60c6-42ef-bcef-2bd61cea2fe5.jpg?v=1789469682",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/rn-image_picker_lib_temp_48491682-60c6-42ef-bcef-2bd61cea2fe5.jpg?v=1789469682"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "mighty-chicken-combo",
    "name": "Mighty Chicken Bundle",
    "categoryId": "everyday-value",
    "description": "Mighty Zinger + One Piece Chicken + Regular Fries + 345ml Drink",
    "baseKfcPrice": 1730,
    "sellingPrice": 1730,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/rn-image_picker_lib_temp_ad48f78c-4b9a-491f-a61b-ad4bb9307734.jpg?v=1789468977",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/rn-image_picker_lib_temp_ad48f78c-4b9a-491f-a61b-ad4bb9307734.jpg?v=1789468977"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "zinger-wings-feast-bundle",
    "name": "Zinger Wings Feast Bundle",
    "categoryId": "everyday-value",
    "description": "Zinger Burger + 8pcs Tangy Masala Wings + Regular Fries + 345ml Drink",
    "baseKfcPrice": 1890,
    "sellingPrice": 1890,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/rn-image_picker_lib_temp_62b0112c-55e5-45be-95be-bc06d1d044e9.jpg?v=1789469036",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/rn-image_picker_lib_temp_62b0112c-55e5-45be-95be-bc06d1d044e9.jpg?v=1789469036"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "9-plain-nuggets",
    "name": "9 Plain Nuggets",
    "categoryId": "everyday-value",
    "description": "Indulge in 9 pieces of tender and delicious chicken nuggets",
    "baseKfcPrice": 755,
    "sellingPrice": 755,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/PlainNuggets.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/PlainNuggets.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "fries-bucket",
    "name": "Fries Bucket",
    "categoryId": "everyday-value",
    "description": "Fries Bucket without Dip",
    "baseKfcPrice": 510,
    "sellingPrice": 510,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/42cba870-0356-11f1-80bc-f9d3c66a61b1-FriesBucket_variant_0-2026-02-06122044.png?v=1789221301",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/42cba870-0356-11f1-80bc-f9d3c66a61b1-FriesBucket_variant_0-2026-02-06122044.png?v=1789221301"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "large-fries",
    "name": "Large Fries",
    "categoryId": "everyday-value",
    "description": "The perfect accompaniment to your KFC meal! Enjoy our golden fries with your favorite meal",
    "baseKfcPrice": 455,
    "sellingPrice": 455,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Fries.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Fries.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "regular-masala-fries-1",
    "name": "Regular Masala Fries",
    "categoryId": "everyday-value",
    "description": "Masala Crispy and Golden Fries.",
    "baseKfcPrice": 415,
    "sellingPrice": 415,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/MasalaFries.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/MasalaFries.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "7up-mint-345-ml",
    "name": "7up Mint - 345 ml",
    "categoryId": "everyday-value",
    "description": "Enjoy the refreshing burst of lemon-lime with a cool mint twist in a 345ml bottle",
    "baseKfcPrice": 100,
    "sellingPrice": 100,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/7UPMint.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/7UPMint.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "dew-345-ml",
    "name": "Dew - 345 ml",
    "categoryId": "everyday-value",
    "description": "Energize yourself with the bold and exhilarating taste of Mountain Dew in a regular-sized bottle 345ml",
    "baseKfcPrice": 100,
    "sellingPrice": 100,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/MountainDewRegular.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/MountainDewRegular.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "sting-345-ml",
    "name": "Sting - 345 ml",
    "categoryId": "everyday-value",
    "description": "Power up with the bold, electrifying taste of Sting energy drink in a 345ml bottle",
    "baseKfcPrice": 100,
    "sellingPrice": 100,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/StingBerryBlast.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/StingBerryBlast.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "mirinda-345-ml",
    "name": "Mirinda - 345 ml",
    "categoryId": "everyday-value",
    "description": "Mirinda Regular: Satisfy your taste buds with the vibrant and fizzy flavor of Mirinda in a regular-sized bottle 345ml",
    "baseKfcPrice": 100,
    "sellingPrice": 100,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/MirindaRegular.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/MirindaRegular.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "large-masala-fries",
    "name": "Large Masala Fries",
    "categoryId": "everyday-value",
    "description": "Masala Crispy and Golden Fries.",
    "baseKfcPrice": 485,
    "sellingPrice": 485,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/MasalaFries.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/MasalaFries.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "7up-1-5-litre",
    "name": "7up - 1.5 Litre",
    "categoryId": "everyday-value",
    "description": "A sizzling cold beverage to quench your thirst.",
    "baseKfcPrice": 200,
    "sellingPrice": 200,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/drink.png?v=1788794843",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/drink.png?v=1788794843"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "pepsi-1-5-litre",
    "name": "Pepsi - 1.5 Litre",
    "categoryId": "everyday-value",
    "description": "The Bold, Refreshing & STRONG cola! Click to add to your meal.",
    "baseKfcPrice": 200,
    "sellingPrice": 200,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/drink_1.png?v=1788794869",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/drink_1.png?v=1788794869"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "7up-345-ml",
    "name": "7up - 345 ml",
    "categoryId": "everyday-value",
    "description": "Experience the crisp and refreshing taste of 7UP in a regular-sized bottle 345ml",
    "baseKfcPrice": 100,
    "sellingPrice": 100,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/7UPRegular.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/7UPRegular.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "pepsi-345-ml",
    "name": "Pepsi - 345 ml",
    "categoryId": "everyday-value",
    "description": "Quench your thirst with the classic taste of Pepsi in a regular-sized bottle 345ml",
    "baseKfcPrice": 100,
    "sellingPrice": 100,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/PepsiRegular.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/PepsiRegular.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "salsa-dip",
    "name": "Salsa Dip",
    "categoryId": "everyday-value",
    "description": "Zesty and spicy Mexican dip with a blend of tomatoes, jalapeños, onions, and peppers.",
    "baseKfcPrice": 110,
    "sellingPrice": 110,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/SalsaDip.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/SalsaDip.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "colonels-secret-sauce",
    "name": "Colonels Secret Sauce",
    "categoryId": "everyday-value",
    "description": "Our signature dipping sauce, creamy, tangy with a peppery hint, perfect for dunking every KFC favourite",
    "baseKfcPrice": 215,
    "sellingPrice": 215,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Colonel_sSecretSauce.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Colonel_sSecretSauce.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "smoke-show-dip",
    "name": "Smoke Show Dip",
    "categoryId": "everyday-value",
    "description": "Smoky bold and flavorful the perfect dip for a fiery bite",
    "baseKfcPrice": 85,
    "sellingPrice": 85,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/SmokeShow.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/SmokeShow.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "vietnamese-dip",
    "name": "Vietnamese Dip",
    "categoryId": "everyday-value",
    "description": "A tangy sweet and savory sauce with a Vietnamese twist perfect for dipping and enhancing your favorite dishes",
    "baseKfcPrice": 85,
    "sellingPrice": 85,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/VietnameseDip.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/VietnameseDip.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "real-mayo-dip",
    "name": "Real Mayo Dip",
    "categoryId": "everyday-value",
    "description": "Smooth, creamy classic mayo that pairs perfectly with everything.",
    "baseKfcPrice": 85,
    "sellingPrice": 85,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/MayoDip.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/MayoDip.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "spicy-mayo-dip",
    "name": "Spicy Mayo Dip",
    "categoryId": "everyday-value",
    "description": "Creamy mayo blended with fiery spice for bold flavor lovers.",
    "baseKfcPrice": 110,
    "sellingPrice": 110,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/SpicyMayo.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/SpicyMayo.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "creamy-ranch-dip",
    "name": "Creamy Ranch Dip",
    "categoryId": "everyday-value",
    "description": "Rich and herby ranch sauce for a cool, tangy kick.",
    "baseKfcPrice": 85,
    "sellingPrice": 85,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/CreamyRanch.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/CreamyRanch.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "cheese-mayo",
    "name": "Cheese Mayo",
    "categoryId": "everyday-value",
    "description": "Creamy, indulgent blend of rich melted cheese and smooth mayonnaise.",
    "baseKfcPrice": 85,
    "sellingPrice": 85,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/CheeseMayo.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/CheeseMayo.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "black-pepper-mayo",
    "name": "Black Pepper Mayo",
    "categoryId": "everyday-value",
    "description": "bold kick to every bite with our rich and zesty black pepper mayo.",
    "baseKfcPrice": 85,
    "sellingPrice": 85,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/BlackPepperMayo.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/BlackPepperMayo.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "bbq-sauce",
    "name": "BBQ Sauce",
    "categoryId": "everyday-value",
    "description": "Bring on the smoky flavour! BBQ Sauce with sweet and tangy kick that makes every bite unforgettable.",
    "baseKfcPrice": 85,
    "sellingPrice": 85,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/BBQSauce.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/BBQSauce.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "thai-sweet-chilli-sauce",
    "name": "Thai Sweet Chilli Sauce",
    "categoryId": "everyday-value",
    "description": "A perfect harmony of sweet and spicy, our Thai Sweet Chili sauce to add a zesty kick.",
    "baseKfcPrice": 85,
    "sellingPrice": 85,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/ThaiSweetChilliSauce.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/ThaiSweetChilliSauce.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "buffalo-sauce",
    "name": "Buffalo Sauce",
    "categoryId": "everyday-value",
    "description": "Turn up the heat with our Buffalo Sauce. A fiery, tangy kick that makes our fried chicken, burgers, and fries extra bold.",
    "baseKfcPrice": 85,
    "sellingPrice": 85,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/BuffaloSauce.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/BuffaloSauce.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "chipotle-sauce",
    "name": "Chipotle Sauce",
    "categoryId": "everyday-value",
    "description": "A taste of Mexico in every dip - smoky chipotle with a hint of spice.",
    "baseKfcPrice": 85,
    "sellingPrice": 85,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/ChipotleSauce.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/ChipotleSauce.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "hot-shot-shakers",
    "name": "Hot Shot Shakers",
    "categoryId": "everyday-value",
    "description": "10 crispy Hotshots, paired with chipotle sauce & ranch dip - made to be shaken, coated and dunked your way.",
    "baseKfcPrice": 620,
    "sellingPrice": 620,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/HotShotShakers.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/HotShotShakers.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "cheesy-chicken-loaded-fries",
    "name": "Cheesy Chicken Loaded Fries",
    "categoryId": "everyday-value",
    "description": "Topped with crispy hot shots, cheese sauce and spicy jalapeños—it's the ultimate flavor-packed treat!",
    "baseKfcPrice": 735,
    "sellingPrice": 735,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/CheesyChickenLoadedFries.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/CheesyChickenLoadedFries.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "kfc-9475400794331",
    "name": "Coleslaw",
    "categoryId": "everyday-value",
    "description": "Sliced cabbage and carrots tossed in mayo",
    "baseKfcPrice": 170,
    "sellingPrice": 170,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Coleslaw.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Coleslaw.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "kfc-9475400728795",
    "name": "Dinner Roll",
    "categoryId": "everyday-value",
    "description": "Soft and fluffy, it complements any meal perfectly",
    "baseKfcPrice": 55,
    "sellingPrice": 55,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/DinnerRoll.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/DinnerRoll.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "corn-on-the-cob",
    "name": "Corn On The Cob",
    "categoryId": "everyday-value",
    "description": "Boiled sweet corn brushed with butter",
    "baseKfcPrice": 330,
    "sellingPrice": 330,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/CornOnTheCob.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/CornOnTheCob.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "bucket-of-fries-with-mayo",
    "name": "Bucket of Fries with Mayo",
    "categoryId": "everyday-value",
    "description": "Fries Bucket with Dip",
    "baseKfcPrice": 530,
    "sellingPrice": 530,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/FriesBucketwithDip.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/FriesBucketwithDip.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "masala-fries-bucket",
    "name": "Masala Fries Bucket",
    "categoryId": "everyday-value",
    "description": "Masala Crispy and Golden Fries",
    "baseKfcPrice": 555,
    "sellingPrice": 555,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/MasalaFriesBucket.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/MasalaFriesBucket.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "regular-fries",
    "name": "Regular Fries",
    "categoryId": "everyday-value",
    "description": "Crispy and Golden Fries",
    "baseKfcPrice": 385,
    "sellingPrice": 385,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Fries.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/Fries.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "tangy-masala-wings",
    "name": "Tangy Masala Wings",
    "categoryId": "everyday-value",
    "description": "8 pcs of Hot Wings coated in a sweet and tangy sauce, dusted with chaat masala",
    "baseKfcPrice": 725,
    "sellingPrice": 725,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/TangyMasalaWings.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/TangyMasalaWings.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "buffalo-saucy-wings",
    "name": "Buffalo Saucy Wings",
    "categoryId": "everyday-value",
    "description": "8 Pcs of Hot Wings coated with a spicy Buffalo sauce, topped with chili flakes",
    "baseKfcPrice": 725,
    "sellingPrice": 725,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/BuffaloWings.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/BuffaloWings.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "thai-sweet-chili-saucy-wings",
    "name": "Thai Sweet Chili Wings",
    "categoryId": "everyday-value",
    "description": "8 Pcs of Hot Wings coated with a Sweet Thai Chilli sauce, topped with sesame seeds",
    "baseKfcPrice": 725,
    "sellingPrice": 725,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/ThaiSweetChilliWings.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/ThaiSweetChilliWings.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "salsa-sprinkled-wings",
    "name": "Salsa Sprinkled Wings",
    "categoryId": "everyday-value",
    "description": "8 Pcs Salsa Sprinkle Wings Bucket",
    "baseKfcPrice": 725,
    "sellingPrice": 725,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/SalsaSprinkleWings.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/SalsaSprinkleWings.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "hot-wings",
    "name": "Hot Wings Bucket",
    "categoryId": "everyday-value",
    "description": "10 Pcs of our Signature Hot & Crispy Wings",
    "baseKfcPrice": 760,
    "sellingPrice": 760,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/HotWingsBucket.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/HotWingsBucket.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "6-plain-nuggets",
    "name": "6 Plain Nuggets",
    "categoryId": "everyday-value",
    "description": "Indulge in 6 pieces of tender and delicious chicken nuggets",
    "baseKfcPrice": 655,
    "sellingPrice": 655,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/PlainNuggets.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/PlainNuggets.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "hot-shots",
    "name": "Hot Shots",
    "categoryId": "everyday-value",
    "description": "9 Pcs of hand-breaded Hot Shots",
    "baseKfcPrice": 545,
    "sellingPrice": 545,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/HotShots.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/HotShots.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "one-piece-chicken",
    "name": "One Piece Chicken",
    "categoryId": "everyday-value",
    "description": "1 piece of Hot & Crispy Fried Chicken",
    "baseKfcPrice": 360,
    "sellingPrice": 360,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/OnePieceChicken.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/OnePieceChicken.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "chicky-meal-2",
    "name": "Chicky Meal 2",
    "categoryId": "everyday-value",
    "description": "4 Nuggets + 1 CHICKY FRIES+ Slice (Chicky Meal 2 without Toy)",
    "baseKfcPrice": 620,
    "sellingPrice": 620,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/ChickyMeal2.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/ChickyMeal2.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "chicky-meal-1",
    "name": "Chicky Meal 1",
    "categoryId": "everyday-value",
    "description": "Krunch + Chicky Fries + Drink",
    "baseKfcPrice": 620,
    "sellingPrice": 620,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/ChickyMeal1.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/ChickyMeal1.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "value-bucket",
    "name": "Crispy Bucket",
    "categoryId": "everyday-value",
    "description": "Enjoy 9 pcs of our Signature Crispy Fried Chicken, hand-breaded in-house.",
    "baseKfcPrice": 2360,
    "sellingPrice": 2360,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/crispybucket.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/crispybucket.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "strips-chips-n-dips",
    "name": "Strips Chips N' Dips",
    "categoryId": "everyday-value",
    "description": "4 Boneless Strips, Regular Fries, 2 Dips (Smoke show and Ranch) with a drink",
    "baseKfcPrice": 850,
    "sellingPrice": 850,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/stripschipsNDips.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/stripschipsNDips.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "xtreme-duo-box",
    "name": "Xtreme Duo Box",
    "categoryId": "everyday-value",
    "description": "2 Signature Zingers + 2 pcs Hot & Crispy Chicken + 1 Large fries + 2 Regular drinks",
    "baseKfcPrice": 1765,
    "sellingPrice": 1765,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/xtremeduobox.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/xtremeduobox.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "wow-box",
    "name": "WOW Box",
    "categoryId": "everyday-value",
    "description": "1 Signature Zinger + 1 pc Hot & Crispy Chicken + 1 Regular fries + 1 Regular drink + 1 Coleslaw",
    "baseKfcPrice": 1190,
    "sellingPrice": 1190,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/wowbox.png?v=1788779325",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/wowbox.png?v=1788779325"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "crispy-box",
    "name": "Crispy Box",
    "categoryId": "everyday-value",
    "description": "2 pcs Hot & Crispy Chicken + 1 Regular fries + 1 Regular drink + 1 Coleslaw",
    "baseKfcPrice": 850,
    "sellingPrice": 850,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/crispybox.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/crispybox.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "kentucky-combo",
    "name": "Kentucky Burger Combo",
    "categoryId": "everyday-value",
    "description": "Kentucky burger + 1 Regular fries+ 1 Regular drink",
    "baseKfcPrice": 1075,
    "sellingPrice": 1075,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/kentuckyburgercombo.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/kentuckyburgercombo.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "zinger-stacker-combo",
    "name": "Zinger Stacker Combo",
    "categoryId": "everyday-value",
    "description": "1 Zinger Stacker + 1 Regular fries + 1 Regular drink",
    "baseKfcPrice": 1070,
    "sellingPrice": 1070,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/zingerstackercombo.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/zingerstackercombo.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "zinger-stacker",
    "name": "Zinger Stacker",
    "categoryId": "everyday-value",
    "description": "Double krunch fillet, jalapenos, spicy mayo, lettuce and cheese with our signature Vietnamese sauce- sandwiched between a corn meal bun",
    "baseKfcPrice": 750,
    "sellingPrice": 750,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/zingerstacker.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/zingerstacker.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "3-pieces-chicken",
    "name": "3 Pieces Chicken",
    "categoryId": "everyday-value",
    "description": "3 Pieces of Hot and Crispy fried chicken",
    "baseKfcPrice": 810,
    "sellingPrice": 810,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/3pcschicken.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/3pcschicken.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "chicken-and-chips",
    "name": "Chicken And Chips",
    "categoryId": "everyday-value",
    "description": "2 Pieces hot and crispy chicken, dinner roll, fries and dip sauce",
    "baseKfcPrice": 735,
    "sellingPrice": 735,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/chicken_Chips.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/chicken_Chips.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "krunch-chicken-combo",
    "name": "Krunch Chicken Combo",
    "categoryId": "everyday-value",
    "description": "1 Krunch burger + 1 pc of Hot and Crispy Fried Chicken + 1 Regular drink",
    "baseKfcPrice": 700,
    "sellingPrice": 700,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/krunchchickencombo.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/krunchchickencombo.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "zingeratha",
    "name": "Zingeratha",
    "categoryId": "everyday-value",
    "description": "Tender boneless strips, sliced onions, tangy imli chutney, mint mayo, wrapped in a soft paratha",
    "baseKfcPrice": 440,
    "sellingPrice": 440,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/zingeratha450.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/zingeratha450.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "kfc-9475398631643",
    "name": "Krunch Burger + Drink",
    "categoryId": "everyday-value",
    "description": "1 Krunch burger + 1 Regular drink",
    "baseKfcPrice": 465,
    "sellingPrice": 465,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/krunchburger_Drink.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/krunchburger_Drink.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "mexinger-combo",
    "name": "Mexinger Combo",
    "categoryId": "everyday-value",
    "description": "1 Mexinger Burger with 1 Regular Fries & 1 Regular Drink",
    "baseKfcPrice": 1070,
    "sellingPrice": 1070,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/mexingercombo.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/mexingercombo.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "mexinger-burger",
    "name": "Mexinger Burger",
    "categoryId": "everyday-value",
    "description": "Bring the taste of Mexico with every bite. Layered with spicy and tangy salsa, melty cheese slice, jalapeños, and smoky chipotle mayo.",
    "baseKfcPrice": 750,
    "sellingPrice": 750,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/mexingerburger.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/mexingerburger.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  },
  {
    "id": "snack-box",
    "name": "Snack Box",
    "categoryId": "everyday-value",
    "description": "4 Strips, 6 Hot Wings with Fries & 2 Dips (Smoke Show & Creamy Ranch)",
    "baseKfcPrice": 1190,
    "sellingPrice": 1190,
    "image": "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/snackbox.png?v=1788779323",
    "galleryImages": [
      "https://cdn.shopify.com/s/files/1/0848/6335/3051/files/snackbox.png?v=1788779323"
    ],
    "isAvailable": true,
    "status": "active"
  }
];

export const DEFAULT_DISCOUNTS: Discount[] = [
  {
    id: 'disc-kfc50',
    code: 'KFC50',
    title: 'Rs. 50 Off First Order',
    type: 'fixed_amount',
    value: 50,
    minOrderAmount: 500,
    isAutomatic: false,
    usageLimit: 1000,
    usedCount: 24,
    status: 'active',
    startDate: '2026-01-01',
  },
  {
    id: 'disc-welcome10',
    code: 'WELCOME10',
    title: '10% Off Family Buckets & Deals',
    type: 'percentage',
    value: 10,
    minOrderAmount: 1500,
    isAutomatic: false,
    usageLimit: 500,
    usedCount: 18,
    status: 'active',
    startDate: '2026-01-01',
  },
  {
    id: 'disc-auto-free-shipping',
    code: '',
    title: 'Automatic Free Delivery on Orders Above Rs. 2,500',
    type: 'free_shipping',
    value: 0,
    minOrderAmount: 2500,
    isAutomatic: true,
    usedCount: 42,
    status: 'active',
    startDate: '2026-01-01',
  },
];

