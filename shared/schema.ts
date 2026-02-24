import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
export * from "./models/auth";

export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SUB_ADMIN: 'SUB_ADMIN',
  BUSINESS_OWNER: 'BUSINESS_OWNER',
  SUB_MERCHANT: 'SUB_MERCHANT',
} as const;

export const BusinessCategory = {
  RESTAURANT: 'Restaurant',
  SALON: 'Salon',
  RETAIL: 'Retail',
  GYM: 'Gym',
  MEDICAL: 'Medical',
  OTHER: 'Other',
} as const;

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default(UserRole.BUSINESS_OWNER),
  businessId: integer("business_id"), // Will reference businesses.id
  permissions: jsonb("permissions"),
});

export const clusters = pgTable("clusters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  status: text("status").notNull().default('ACTIVE'),
  expiryDate: timestamp("expiry_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clusterId: integer("cluster_id").notNull().references(() => clusters.id),
  category: text("category").notNull(),
  ownerName: text("owner_name").notNull(),
  ownerAddress: text("owner_address"),
  email: text("email").notNull(),
  phone: text("phone"),
  profilePhotoUrl: text("profile_photo_url"),
  
  discountType: text("discount_type").notNull().default('PERCENTAGE'),
  discountValue: integer("discount_value").notNull(),
  discountMinPurchase: integer("discount_min_purchase").notNull().default(0),
  discountDescription: text("discount_description"),
  discountIsActive: boolean("discount_is_active").default(true),

  subscriptionStatus: text("subscription_status").notNull().default('ACTIVE'),
  expiryDate: timestamp("expiry_date").notNull(),
  
  maxCouponsPerBatch: integer("max_coupons_per_batch").default(100),
  lastBulkIssueAt: timestamp("last_bulk_issue_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  originBusinessId: integer("origin_business_id").notNull().references(() => businesses.id),
  targetBusinessId: integer("target_business_id"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  createdAt: timestamp("created_at").defaultNow(),
  expiryDate: timestamp("expiry_date").notNull(),
  status: text("status").notNull().default('ACTIVE'), // ACTIVE, EXPIRED, REDEEMED
  isBulk: boolean("is_bulk").default(false),
  discountValue: integer("discount_value"),
  discountType: text("discount_type"),
});

export const redemptions = pgTable("redemptions", {
  id: serial("id").primaryKey(),
  couponId: integer("coupon_id").notNull().references(() => coupons.id),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
  transactionValue: integer("transaction_value").notNull(),
  discountApplied: integer("discount_applied").notNull(),
});

export const insertClusterSchema = createInsertSchema(clusters).omit({ id: true, createdAt: true });
export const insertBusinessSchema = createInsertSchema(businesses).omit({ id: true, createdAt: true });
export const insertCouponSchema = createInsertSchema(coupons).omit({ id: true, createdAt: true });
export const insertRedemptionSchema = createInsertSchema(redemptions).omit({ id: true, redeemedAt: true });

export type Cluster = typeof clusters.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Redemption = typeof redemptions.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertCluster = z.infer<typeof insertClusterSchema>;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type InsertRedemption = z.infer<typeof insertRedemptionSchema>;
