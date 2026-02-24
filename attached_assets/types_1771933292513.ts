
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUB_ADMIN = 'SUB_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  SUB_MERCHANT = 'SUB_MERCHANT',
}

export interface SubAdminPermissions {
  canManageClusters: boolean;
  canManageBusinesses: boolean;
  canBroadcast: boolean;
  canViewReports: boolean;
  canDownloadData: boolean;
}

export interface SubAdminUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissions: SubAdminPermissions;
  createdAt: string;
}

export enum BusinessCategory {
  RESTAURANT = 'Restaurant',
  SALON = 'Salon',
  RETAIL = 'Retail',
  GYM = 'Gym',
  MEDICAL = 'Medical',
  OTHER = 'Other',
}

export interface DiscountRule {
  type: 'PERCENTAGE' | 'FLAT';
  value: number;
  minPurchase: number;
  description: string;
  isActive: boolean;
}

export interface LuckyGift {
  name: string;
  quantity: number;
}

export interface Business {
  id: string;
  name: string;
  clusterId: string;
  category: string; 
  ownerName: string;
  ownerAddress?: string; 
  email: string;
  phone?: string; 
  profilePhotoUrl?: string; 
  discountRule: DiscountRule;
  subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  expiryDate: string;
  integratedEmail?: string;
  isEmailConnected?: boolean;
  lastDiscountUpdate?: string; 
  discountOverrideEnabled?: boolean; 
  isBulkEnabled?: boolean; 
  isSingleEnabled?: boolean;
  luckyGiftName?: string; // Legacy
  luckyGiftQuantity?: number; // Legacy
  luckyGifts?: LuckyGift[]; // New multi-gift support
  subMerchantEmail?: string;
  subMerchantPassword?: string;
  maxCouponsPerBatch?: number; // New: Limit controlled by Admin
  lastBulkIssueAt?: string; // New: Timestamp for the 40-day lock
}

export interface Cluster {
  id: string;
  name: string;
  city: string;
  businessCount: number;
  status: 'ACTIVE' | 'EXPIRED';
  expiryDate: string;
  totalIssued?: number;
  activeCoupons?: number;
  redeemedCount?: number;
  expiredCoupons?: number;
  healthScore?: number;
}

export interface RedemptionRecord {
  businessId: string;
  redeemedAt: string;
  transactionValue: number;
  discountApplied: number;
}

export interface Coupon {
  code: string;
  originBusinessId: string;
  originBusinessName: string;
  originBusinessProfilePhoto?: string; 
  targetBusinessId?: string; 
  targetBusinessName?: string; 
  customerPhone: string;
  customerEmail?: string; 
  customerName?: string;
  createdAt: string;
  expiryDate: string; 
  status: 'ACTIVE' | 'EXPIRED' | 'REDEEMED'; 
  redemptions: RedemptionRecord[]; 
  points?: number; 
  isBulk?: boolean;
  discountValue?: number; 
  discountType?: 'PERCENTAGE' | 'FLAT'; 
  discountMinPurchase?: number;
  customTitle?: string;
  luckyGift?: string;
}

export interface Notification {
  id: string;
  businessId: string;
  title: string;
  message: string;
  type: 'SYSTEM' | 'EXPIRY_WARNING';
  createdAt: string;
  isRead: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  businessId?: string; 
  profilePhotoUrl?: string; 
  permissions?: SubAdminPermissions;
}

export interface Stats {
  couponsGenerated: number;
  couponsRedeemed: number;
  revenueFacilitated: number;
  revenueNet: number;
  activeClusters: number;
}
