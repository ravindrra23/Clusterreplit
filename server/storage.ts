import { db } from "./db";
import {
  clusters, businesses, coupons, redemptions, notifications, userProfiles, users,
  type Cluster, type InsertCluster, type UpdateClusterRequest,
  type Business, type InsertBusiness, type UpdateBusinessRequest,
  type Coupon, type InsertCoupon, type UpdateCouponRequest,
  type Redemption, type InsertRedemption,
  type UserProfile
} from "@shared/schema";
import { eq, count, sum } from "drizzle-orm";

export interface IStorage {
  // Profiles
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(userId: string, role: string, businessId?: number): Promise<UserProfile>;
  
  // Clusters
  getClusters(): Promise<Cluster[]>;
  getCluster(id: number): Promise<Cluster | undefined>;
  createCluster(cluster: InsertCluster): Promise<Cluster>;
  updateCluster(id: number, updates: UpdateClusterRequest): Promise<Cluster>;
  
  // Businesses
  getBusinesses(): Promise<Business[]>;
  getBusiness(id: number): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, updates: UpdateBusinessRequest): Promise<Business>;
  
  // Coupons
  getCoupons(): Promise<Coupon[]>;
  getCouponsByBusiness(businessId: number): Promise<Coupon[]>;
  getCoupon(id: number): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, updates: UpdateCouponRequest): Promise<Coupon>;
  
  // Redemptions
  createRedemption(redemption: InsertRedemption): Promise<Redemption>;
  
  // Stats
  getStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }
  
  async createUserProfile(userId: string, role: string, businessId?: number): Promise<UserProfile> {
    const [profile] = await db.insert(userProfiles).values({ userId, role, businessId }).returning();
    return profile;
  }
  
  async getClusters(): Promise<Cluster[]> {
    return await db.select().from(clusters);
  }
  
  async getCluster(id: number): Promise<Cluster | undefined> {
    const [cluster] = await db.select().from(clusters).where(eq(clusters.id, id));
    return cluster;
  }
  
  async createCluster(cluster: InsertCluster): Promise<Cluster> {
    const [newCluster] = await db.insert(clusters).values(cluster).returning();
    return newCluster;
  }
  
  async updateCluster(id: number, updates: UpdateClusterRequest): Promise<Cluster> {
    const [updated] = await db.update(clusters).set(updates).where(eq(clusters.id, id)).returning();
    return updated;
  }
  
  async getBusinesses(): Promise<Business[]> {
    return await db.select().from(businesses);
  }
  
  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }
  
  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }
  
  async updateBusiness(id: number, updates: UpdateBusinessRequest): Promise<Business> {
    const [updated] = await db.update(businesses).set(updates).where(eq(businesses.id, id)).returning();
    return updated;
  }
  
  async getCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons);
  }
  
  async getCouponsByBusiness(businessId: number): Promise<Coupon[]> {
    return await db.select().from(coupons).where(eq(coupons.originBusinessId, businessId));
  }
  
  async getCoupon(id: number): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon;
  }
  
  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon;
  }
  
  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await db.insert(coupons).values(coupon).returning();
    return newCoupon;
  }
  
  async updateCoupon(id: number, updates: UpdateCouponRequest): Promise<Coupon> {
    const [updated] = await db.update(coupons).set(updates).where(eq(coupons.id, id)).returning();
    return updated;
  }
  
  async createRedemption(redemption: InsertRedemption): Promise<Redemption> {
    const [newRedemption] = await db.insert(redemptions).values(redemption).returning();
    return newRedemption;
  }
  
  async getStats(): Promise<any> {
    const [couponCount] = await db.select({ value: count() }).from(coupons);
    const [redemptionCount] = await db.select({ value: count() }).from(redemptions);
    const [revenue] = await db.select({ value: sum(redemptions.transactionValue) }).from(redemptions);
    const [activeClusters] = await db.select({ value: count() }).from(clusters).where(eq(clusters.status, 'ACTIVE'));
    
    return {
      couponsGenerated: couponCount.value || 0,
      couponsRedeemed: redemptionCount.value || 0,
      revenueFacilitated: Number(revenue?.value || 0),
      revenueNet: (Number(revenue?.value || 0)) * 0.1, // mock 10% net
      activeClusters: activeClusters.value || 0,
    };
  }
}

export const storage = new DatabaseStorage();
