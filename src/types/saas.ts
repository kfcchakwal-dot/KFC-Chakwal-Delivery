export type TenantPlanId = 'basic' | 'professional' | 'enterprise' | 'custom';

export type TenantSubscriptionStatus = 
  | 'trial' 
  | 'active' 
  | 'payment_due' 
  | 'grace_period' 
  | 'suspended' 
  | 'cancelled';

export interface RestaurantFeatures {
  onlineOrdering: boolean;
  productManagement: boolean;
  pos: boolean;
  inventory: boolean;
  suppliers: boolean;
  staffRoles: boolean;
  advancedReporting: boolean;
  loyaltyPromotions: boolean;
  multiBranch: boolean;
  kitchenDisplay: boolean;
  customTheme: boolean;
  whatsappMarketing: boolean;
}

export interface RestaurantLimits {
  maxProducts: number;
  maxBranches: number;
  maxStaff: number;
}

export interface RestaurantTenant {
  id: string; // unique slug e.g. 'kfc-chakwal'
  name: string;
  slug: string;
  tagline?: string;
  logoUrl?: string;
  coverUrl?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  city: string;
  address: string;
  currency: string;
  status: TenantSubscriptionStatus;
  planId: TenantPlanId;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  price: number;
  startDate: string;
  dueDate: string;
  gracePeriodDays: number;
  nextRenewalDate: string;
  suspendedAt?: string;
  statusReason?: string;
  features: RestaurantFeatures;
  limits: RestaurantLimits;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: TenantPlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  badge?: string;
  popular?: boolean;
  features: RestaurantFeatures;
  limits: RestaurantLimits;
}

export interface SubscriptionPaymentRecord {
  id: string;
  restaurantId: string;
  restaurantName: string;
  planId: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  paymentMethod: 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'raast' | string;
  transactionRef: string;
  paymentDate: string;
  proofUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface SubscriptionAuditLog {
  id: string;
  restaurantId: string;
  restaurantName: string;
  action: 
    | 'status_changed' 
    | 'payment_submitted' 
    | 'payment_approved' 
    | 'payment_rejected' 
    | 'subscription_extended' 
    | 'restaurant_created' 
    | 'restaurant_updated' 
    | 'plan_changed';
  previousStatus?: TenantSubscriptionStatus;
  newStatus?: TenantSubscriptionStatus;
  details: string;
  performedBy: string;
  timestamp: string;
}

export interface PlatformPaymentInstructions {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  branchCode?: string;
  jazzCashNumber: string;
  jazzCashTitle: string;
  easyPaisaNumber: string;
  easyPaisaTitle: string;
  raastId?: string;
  supportWhatsApp: string;
  instructions: string;
  updatedAt: string;
}

export const DEFAULT_SAAS_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Starter',
    description: 'Essential online food ordering & basic counter billing for single restaurants.',
    monthlyPrice: 4999,
    yearlyPrice: 49990,
    badge: 'Starter',
    features: {
      onlineOrdering: true,
      productManagement: true,
      pos: true,
      inventory: false,
      suppliers: false,
      staffRoles: false,
      advancedReporting: false,
      loyaltyPromotions: false,
      multiBranch: false,
      kitchenDisplay: false,
      customTheme: false,
      whatsappMarketing: false,
    },
    limits: {
      maxProducts: 50,
      maxBranches: 1,
      maxStaff: 2,
    },
  },
  {
    id: 'professional',
    name: 'Professional Growth',
    description: 'Complete operations with inventory, shifts, staff roles, and customer loyalty.',
    monthlyPrice: 9999,
    yearlyPrice: 99990,
    badge: 'Most Popular',
    popular: true,
    features: {
      onlineOrdering: true,
      productManagement: true,
      pos: true,
      inventory: true,
      suppliers: true,
      staffRoles: true,
      advancedReporting: true,
      loyaltyPromotions: true,
      multiBranch: false,
      kitchenDisplay: false,
      customTheme: true,
      whatsappMarketing: true,
    },
    limits: {
      maxProducts: 200,
      maxBranches: 2,
      maxStaff: 8,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise Scale',
    description: 'Multi-branch franchises, Kitchen Display System (KDS), unlimited products & branches.',
    monthlyPrice: 19999,
    yearlyPrice: 199990,
    badge: 'Full Power',
    features: {
      onlineOrdering: true,
      productManagement: true,
      pos: true,
      inventory: true,
      suppliers: true,
      staffRoles: true,
      advancedReporting: true,
      loyaltyPromotions: true,
      multiBranch: true,
      kitchenDisplay: true,
      customTheme: true,
      whatsappMarketing: true,
    },
    limits: {
      maxProducts: 1000,
      maxBranches: 10,
      maxStaff: 50,
    },
  },
];

export const DEFAULT_PLATFORM_PAYMENT_INSTRUCTIONS: PlatformPaymentInstructions = {
  bankName: 'Meezan Bank Limited',
  accountTitle: 'KFC Chakwal SaaS Platform',
  accountNumber: '0281-0105829101',
  iban: 'PK55MEZN0002810105829101',
  branchCode: '0281 (Chakwal Branch)',
  jazzCashNumber: '0325-2777574',
  jazzCashTitle: 'Muhammad Rizwan / Platform Admin',
  easyPaisaNumber: '0325-2777574',
  easyPaisaTitle: 'Muhammad Rizwan / Platform Admin',
  raastId: '03252777574',
  supportWhatsApp: '+92 325 2777574',
  instructions: 'Please transfer your subscription fee using online banking, mobile app, or ATM transfer. Enter your Restaurant ID in the transfer remarks/reference. After transferring, upload the screenshot or enter the transaction ID below for instant Super Admin verification and automatic account activation.',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_KFC_TENANT: RestaurantTenant = {
  id: 'kfc-chakwal',
  name: 'KFC Chakwal Delivery',
  slug: 'kfc-chakwal',
  tagline: 'Authentic KFC Picked from Kallar Kahar Motorway & Delivered to Chakwal',
  logoUrl: '/favicon.ico',
  coverUrl: '',
  ownerName: 'Muhammad Rizwan',
  ownerEmail: 'kfcchakwal@gmail.com',
  ownerPhone: '+92 325 2777574',
  city: 'Chakwal',
  address: 'Main Bhaun Road & Kallar Kahar Interchange, Chakwal, Punjab',
  currency: 'PKR',
  status: 'active',
  planId: 'enterprise',
  planName: 'Enterprise Scale',
  billingCycle: 'yearly',
  price: 199990,
  startDate: '2026-01-01T00:00:00.000Z',
  dueDate: '2027-01-01T00:00:00.000Z',
  gracePeriodDays: 7,
  nextRenewalDate: '2027-01-01T00:00:00.000Z',
  features: {
    onlineOrdering: true,
    productManagement: true,
    pos: true,
    inventory: true,
    suppliers: true,
    staffRoles: true,
    advancedReporting: true,
    loyaltyPromotions: true,
    multiBranch: true,
    kitchenDisplay: true,
    customTheme: true,
    whatsappMarketing: true,
  },
  limits: {
    maxProducts: 1000,
    maxBranches: 10,
    maxStaff: 50,
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
};
