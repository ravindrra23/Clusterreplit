import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
export * from "./models/auth";

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull(),
  businessId: text("business_id"),
  permissions: jsonb("permissions"),
});

export const clusters = pgTable("clusters", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  businessCount: integer("business_count").default(0),
  status: text("status").notNull().default('ACTIVE'),
  expiryDate: text("expiry_date").notNull(),
});

export const businesses = pgTable("businesses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  clusterId: text("cluster_id").notNull().references(() => clusters.id),
  category: text("category").notNull(),
  ownerName: text("owner_name").notNull(),
  ownerAddress: text("owner_address"),
  email: text("email").notNull(),
  phone: text("phone"),
  profilePhotoUrl: text("profile_photo_url"),
  discountRule: jsonb("discount_rule").notNull(),
  subscriptionStatus: text("subscription_status").notNull().default('ACTIVE'),
  expiryDate: text("expiry_date").notNull(),
  isBulkEnabled: boolean("is_bulk_enabled").default(true),
  isSingleEnabled: boolean("is_single_enabled").default(true),
});

export const coupons = pgTable("coupons", {
  code: text("code").primaryKey(),
  originBusinessId: text("origin_business_id").notNull().references(() => businesses.id),
  originBusinessName: text("origin_business_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  createdAt: text("created_at").notNull(),
  expiryDate: text("expiry_date").notNull(),
  status: text("status").notNull().default('ACTIVE'),
  redemptions: jsonb("redemptions").default([]),
  isBulk: boolean("is_bulk").default(false),
});
