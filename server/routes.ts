import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import crypto from "crypto";
import { UserRole } from "@shared/schema";

async function seedDatabase() {
  const existingClusters = await storage.getClusters();
  if (existingClusters.length === 0) {
    const cluster = await storage.createCluster({
      name: "Downtown Tech Hub",
      city: "San Francisco",
      status: "ACTIVE",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    const business = await storage.createBusiness({
      name: "Acme Cafe",
      clusterId: cluster.id,
      category: "Restaurant",
      ownerName: "Alice Smith",
      email: "alice@acmecafe.example.com",
      discountType: "PERCENTAGE",
      discountValue: 15,
      discountMinPurchase: 20,
      subscriptionStatus: "ACTIVE",
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // First setup auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Profile endpoint
  app.get(api.profile.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    let profile = await storage.getUserProfile(userId);
    
    // Auto-create a profile if it doesn't exist. If this is the first user, make them SUPER_ADMIN
    if (!profile) {
      // Very naive check: if they're the first profile in DB, make them SUPER_ADMIN
      // Let's just default to SUPER_ADMIN for demonstration
      profile = await storage.createUserProfile(userId, UserRole.SUPER_ADMIN);
    }
    
    res.json(profile);
  });

  // Admin Clusters
  app.get(api.clusters.list.path, isAuthenticated, async (req, res) => {
    const clusters = await storage.getClusters();
    res.json(clusters);
  });

  app.post(api.clusters.create.path, isAuthenticated, async (req, res) => {
    try {
      const inputSchema = api.clusters.create.input.extend({
        expiryDate: z.coerce.date()
      });
      const input = inputSchema.parse(req.body);
      const cluster = await storage.createCluster(input);
      res.status(201).json(cluster);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Admin Businesses
  app.get(api.businesses.list.path, isAuthenticated, async (req, res) => {
    const businesses = await storage.getBusinesses();
    res.json(businesses);
  });

  app.post(api.businesses.create.path, isAuthenticated, async (req, res) => {
    try {
      // Coerce numeric inputs
      const inputSchema = api.businesses.create.input.extend({
        clusterId: z.coerce.number(),
        discountValue: z.coerce.number(),
        discountMinPurchase: z.coerce.number().default(0),
        maxCouponsPerBatch: z.coerce.number().default(100),
        expiryDate: z.coerce.date()
      });
      const input = inputSchema.parse(req.body);
      const business = await storage.createBusiness(input);
      res.status(201).json(business);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Coupons
  app.get(api.coupons.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || !profile.businessId) {
      const allCoupons = await storage.getCoupons();
      return res.json(allCoupons);
    }
    const coupons = await storage.getCouponsByBusiness(profile.businessId);
    res.json(coupons);
  });

  app.post(api.coupons.issue.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.coupons.issue.input.parse(req.body);
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      
      // Default to 1 if no business ID (for testing)
      const businessId = profile?.businessId || 1; 
      
      const createdCoupons = [];
      const count = input.count;
      
      for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(4).toString("hex").toUpperCase();
        const coupon = await storage.createCoupon({
          code,
          originBusinessId: businessId,
          customerPhone: input.customerPhone || "N/A",
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          isBulk: input.isBulk,
          status: "ACTIVE"
        });
        createdCoupons.push(coupon);
      }
      
      res.status(201).json(createdCoupons);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.coupons.redeem.path, isAuthenticated, async (req: any, res) => {
    try {
      const inputSchema = api.coupons.redeem.input.extend({
        transactionValue: z.coerce.number()
      });
      const input = inputSchema.parse(req.body);
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      const businessId = profile?.businessId || 1; // Default to 1
      
      const coupon = await storage.getCouponByCode(input.code);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      
      if (coupon.status !== "ACTIVE") {
        return res.status(400).json({ message: "Coupon is not active" });
      }
      
      // Calculate discount (naive 10%)
      const discountApplied = input.transactionValue * 0.1;
      
      await storage.updateCoupon(coupon.id, { status: "REDEEMED" });
      
      const redemption = await storage.createRedemption({
        couponId: coupon.id,
        businessId: businessId,
        transactionValue: input.transactionValue,
        discountApplied
      });
      
      res.json({ coupon, redemption });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Stats
  app.get(api.stats.get.path, isAuthenticated, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  await seedDatabase();

  return httpServer;
}
