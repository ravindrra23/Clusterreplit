
import { Business, BusinessCategory, Cluster, Coupon, DiscountRule, Stats, UserRole, Notification, RedemptionRecord, SubAdminPermissions, SubAdminUser, LuckyGift } from '../types';

const STORAGE_KEYS = {
  CLUSTERS: 'cg_clusters_data_v1',
  BUSINESSES: 'cg_businesses_data_v1',
  COUPONS: 'cg_coupons_data_v2', 
  CATEGORIES: 'cg_categories_v1',
  NOTIFICATIONS: 'cg_notifications_v1',
  SUB_ADMINS: 'cg_subadmins_list_v1',
};

const DEFAULT_DISCOUNT: DiscountRule = {
  type: 'PERCENTAGE',
  value: 10,
  minPurchase: 500,
  description: '10% off on orders above ₹500',
  isActive: true,
};

// Performance Cache to speed up the app
let _cache: { [key: string]: any } = {};

const db = {
  getRawClusters: (): Cluster[] => {
    if (_cache[STORAGE_KEYS.CLUSTERS]) return _cache[STORAGE_KEYS.CLUSTERS];
    const data = localStorage.getItem(STORAGE_KEYS.CLUSTERS);
    const parsed = data ? JSON.parse(data) : [
      { id: 'c1', name: 'Downtown Eats & Treats', city: 'Mumbai', businessCount: 2, status: 'ACTIVE', expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(), healthScore: 85 },
    ];
    _cache[STORAGE_KEYS.CLUSTERS] = parsed;
    return parsed;
  },
  getClusters: (): Cluster[] => {
    const raw = db.getRawClusters();
    const businesses = db.getBusinesses();
    const coupons = db.getCoupons();
    const now = new Date();
    return raw.map(cluster => {
      const clusterBusinesses = businesses.filter(b => b.clusterId === cluster.id);
      const clusterBizIds = clusterBusinesses.map(b => b.id);
      const clusterCoupons = coupons.filter(c => clusterBizIds.includes(c.originBusinessId));
      
      const redeemed = clusterCoupons.reduce((sum, c) => sum + c.redemptions.length, 0);
      const expired = clusterCoupons.filter(c => new Date(c.expiryDate) < now && c.status !== 'REDEEMED').length;

      return {
        ...cluster,
        businessCount: clusterBusinesses.length,
        totalIssued: clusterCoupons.length,
        activeCoupons: clusterCoupons.filter(c => new Date(c.expiryDate) > now && c.status === 'ACTIVE').length,
        redeemedCount: redeemed,
        expiredCoupons: expired,
        healthScore: cluster.healthScore || 75
      };
    });
  },
  setClusters: (data: Cluster[]) => {
    _cache[STORAGE_KEYS.CLUSTERS] = data;
    localStorage.setItem(STORAGE_KEYS.CLUSTERS, JSON.stringify(data));
  },
  getBusinesses: (): Business[] => {
    if (_cache[STORAGE_KEYS.BUSINESSES]) return _cache[STORAGE_KEYS.BUSINESSES];
    const data = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
    const parsed = data ? JSON.parse(data) : [
      { id: 'b1', name: 'Joe\'s Pizza', clusterId: 'c1', category: 'Restaurant', ownerName: 'Joe Doe', email: 'joe@pizza.com', phone: '9876543210', subscriptionStatus: 'ACTIVE', expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(), discountRule: DEFAULT_DISCOUNT, isBulkEnabled: true, isSingleEnabled: true, maxCouponsPerBatch: 100 },
      { id: 'b2', name: 'Beauty Hub', clusterId: 'c1', category: 'Salon', ownerName: 'Jane Smith', email: 'jane@beauty.com', phone: '9876543211', subscriptionStatus: 'ACTIVE', expiryDate: '2025-12-31', discountRule: { ...DEFAULT_DISCOUNT, value: 20, description: '20% Off' }, isBulkEnabled: true, isSingleEnabled: true, maxCouponsPerBatch: 100 },
      { id: 'b3', name: 'Fitness Zone', clusterId: 'c1', category: 'Gym', ownerName: 'Mike Ross', email: 'mike@fit.com', phone: '9876543212', subscriptionStatus: 'ACTIVE', expiryDate: '2025-12-31', discountRule: { value: 100, type: 'FLAT', minPurchase: 1000, description: 'Rs. 100 Off' }, isBulkEnabled: true, isSingleEnabled: true, maxCouponsPerBatch: 100 }
    ];
    _cache[STORAGE_KEYS.BUSINESSES] = parsed;
    return parsed;
  },
  setBusinesses: (data: Business[]) => {
    _cache[STORAGE_KEYS.BUSINESSES] = data;
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(data));
  },
  getCoupons: (): Coupon[] => {
    if (_cache[STORAGE_KEYS.COUPONS]) return _cache[STORAGE_KEYS.COUPONS];
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
    _cache[STORAGE_KEYS.COUPONS] = parsed;
    return parsed;
  },
  setCoupons: (data: Coupon[]) => {
    _cache[STORAGE_KEYS.COUPONS] = data;
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(data));
  },
  getSubAdmins: (): SubAdminUser[] => {
    if (_cache[STORAGE_KEYS.SUB_ADMINS]) return _cache[STORAGE_KEYS.SUB_ADMINS];
    const data = localStorage.getItem(STORAGE_KEYS.SUB_ADMINS);
    const parsed = data ? JSON.parse(data) : [
      { id: 'sa1', name: 'Staff Member', email: 'staff@staff.com', password: 'password123', status: 'ACTIVE', permissions: { canManageClusters: true, canManageBusinesses: true, canBroadcast: true, canViewReports: true, canDownloadData: true }, createdAt: new Date().toISOString() }
    ];
    _cache[STORAGE_KEYS.SUB_ADMINS] = parsed;
    return parsed;
  },
  setSubAdmins: (data: SubAdminUser[]) => {
    _cache[STORAGE_KEYS.SUB_ADMINS] = data;
    localStorage.setItem(STORAGE_KEYS.SUB_ADMINS, JSON.stringify(data));
  },
  getNotifications: (): Notification[] => {
    if (_cache[STORAGE_KEYS.NOTIFICATIONS]) return _cache[STORAGE_KEYS.NOTIFICATIONS];
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    _cache[STORAGE_KEYS.NOTIFICATIONS] = parsed;
    return parsed;
  },
  setNotifications: (data: Notification[]) => {
    _cache[STORAGE_KEYS.NOTIFICATIONS] = data;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data));
  },
  getCategories: (): string[] => {
    if (_cache[STORAGE_KEYS.CATEGORIES]) return _cache[STORAGE_KEYS.CATEGORIES];
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    _cache[STORAGE_KEYS.CATEGORIES] = parsed;
    return parsed;
  },
  setCategories: (data: string[]) => {
    _cache[STORAGE_KEYS.CATEGORIES] = data;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
  },
};

export const mockService = {
  getClusters: async () => db.getClusters(),
  getBusinessById: async (id: string) => db.getBusinesses().find(b => b.id === id),
  getBusinesses: async () => db.getBusinesses(),
  getCategories: async () => db.getCategories(),
  
  broadcastNotification: async (title: string, message: string, target: string) => {
    const businesses = db.getBusinesses();
    const notifications = db.getNotifications();
    const targetBizIds = target === 'all' 
      ? businesses.map(b => b.id) 
      : businesses.filter(b => b.clusterId === target).map(b => b.id);
    
    const newNotifications: Notification[] = targetBizIds.map(bizId => ({
      id: `n-${Date.now()}-${bizId}`,
      businessId: bizId,
      title,
      message,
      type: 'SYSTEM',
      createdAt: new Date().toISOString(),
      isRead: false
    }));

    db.setNotifications([...newNotifications, ...notifications]);
  },

  getBusinessesByCluster: async (clusterId: string) => {
    return db.getBusinesses().filter(b => b.clusterId === clusterId);
  },

  addCluster: async (data: any) => {
    const clusters = db.getRawClusters();
    const newCluster: Cluster = {
      id: `c-${Date.now()}`,
      businessCount: 0,
      status: 'ACTIVE',
      expiryDate: data.expiryDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      healthScore: 100,
      ...data
    };
    clusters.push(newCluster);
    db.setClusters(clusters);
    return newCluster;
  },

  updateCluster: async (id: string, data: Partial<Cluster>) => {
    const clusters = db.getRawClusters();
    const idx = clusters.findIndex(c => c.id === id);
    if (idx !== -1) {
      clusters[idx] = { ...clusters[idx], ...data };
      db.setClusters(clusters);
      return clusters[idx];
    }
    throw new Error("Cluster not found");
  },

  addBusiness: async (data: any) => {
    const businesses = db.getBusinesses();
    const newBusiness: Business = {
      id: `b-${Date.now()}`,
      discountRule: { ...DEFAULT_DISCOUNT },
      subscriptionStatus: 'ACTIVE',
      isBulkEnabled: false,
      isSingleEnabled: true,
      email: `${data.name.replace(/\s+/g, '').toLowerCase()}@placeholder.com`,
      maxCouponsPerBatch: data.maxCouponsPerBatch || 100, // New: Default limit
      ...data
    };
    businesses.push(newBusiness);
    db.setBusinesses(businesses);
    return newBusiness;
  },

  deleteCluster: async (id: string) => {
    const clusters = db.getRawClusters().filter(c => c.id !== id);
    db.setClusters(clusters);
  },

  downloadClusterSpecificData: async (id: string) => {
    console.log("Simulating download for cluster", id);
  },

  downloadClusterData: async () => {
    console.log("Simulating platform data download");
  },

  addSubAdmin: async (data: any) => {
    const admins = db.getSubAdmins();
    const newAdmin: SubAdminUser = {
      id: `sa-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...data
    };
    admins.push(newAdmin);
    db.setSubAdmins(admins);
    return newAdmin;
  },

  updateSubAdmin: async (id: string, data: any) => {
    const admins = db.getSubAdmins();
    const idx = admins.findIndex(a => a.id === id);
    if (idx !== -1) {
      admins[idx] = { ...admins[idx], ...data };
      db.setSubAdmins(admins);
    }
  },

  deleteSubAdmin: async (id: string) => {
    const admins = db.getSubAdmins().filter(a => a.id !== id);
    db.setSubAdmins(admins);
  },

  toggleBulkAccess: async (id: string, enabled: boolean) => {
    const businesses = db.getBusinesses();
    const idx = businesses.findIndex(b => b.id === id);
    if (idx !== -1) {
      businesses[idx].isBulkEnabled = enabled;
      db.setBusinesses(businesses);
    }
  },

  toggleSingleAccess: async (id: string, enabled: boolean) => {
    const businesses = db.getBusinesses();
    const idx = businesses.findIndex(b => b.id === id);
    if (idx !== -1) {
      businesses[idx].isSingleEnabled = enabled;
      db.setBusinesses(businesses);
    }
  },

  resetIssueLock: async (id: string) => {
    const businesses = db.getBusinesses();
    const idx = businesses.findIndex(b => b.id === id);
    if (idx !== -1) {
      delete businesses[idx].lastBulkIssueAt;
      db.setBusinesses(businesses);
    }
  },

  generateBulkCoupons: async (businessId: string, quantity: number, points: number, customTitle?: string) => {
    const allBusinesses = db.getBusinesses();
    const bizIdx = allBusinesses.findIndex(b => b.id === businessId);
    const myBiz = allBusinesses[bizIdx];
    
    if (!myBiz) throw new Error("Business not found");

    // Check Lock (40 days)
    const now = new Date();
    if (myBiz.lastBulkIssueAt) {
      const lastIssueDate = new Date(myBiz.lastBulkIssueAt);
      const diffTime = Math.abs(now.getTime() - lastIssueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 40) {
        throw new Error(`You can only issue coupons once every 40 days. Next eligible date: ${new Date(lastIssueDate.getTime() + 40 * 24 * 60 * 60 * 1000).toLocaleDateString()}`);
      }
    }

    const clusterMates = allBusinesses.filter(b => b.clusterId === myBiz.clusterId && b.id !== businessId);
    if (clusterMates.length === 0) throw new Error("No other businesses in cluster to distribute to.");

    const coupons = db.getCoupons();
    const newCoupons: Coupon[] = [];
    const expiry = new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000).toISOString();

    const baseQty = Math.floor(quantity / clusterMates.length);
    const remainder = quantity % clusterMates.length;

    clusterMates.forEach((target, index) => {
      const targetQty = baseQty + (index < remainder ? 1 : 0);
      
      // Calculate how many gifts to distribute to this target batch
      const targetGifts = target.luckyGifts || [];
      const totalAvailableGifts = targetGifts.reduce((sum, g) => sum + g.quantity, 0);
      
      // Create a pool of gift names based on their quantities
      const giftPool: string[] = [];
      targetGifts.forEach(g => {
        for (let i = 0; i < g.quantity; i++) {
          giftPool.push(g.name);
        }
      });

      // Random indices for gifts
      const giftIndices = new Map<number, string>();
      if (giftPool.length > 0) {
        const actualGiftsToPlace = Math.min(targetQty, giftPool.length);
        const selectedIndices = new Set<number>();
        
        while (selectedIndices.size < actualGiftsToPlace) {
          selectedIndices.add(Math.floor(Math.random() * targetQty));
        }

        const indicesArray = Array.from(selectedIndices);
        indicesArray.forEach((idx, i) => {
          giftIndices.set(idx, giftPool[i]);
        });
      }

      for (let i = 0; i < targetQty; i++) {
        newCoupons.push({
          code: `BLK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          originBusinessId: businessId,
          originBusinessName: myBiz.name,
          targetBusinessId: target.id,
          targetBusinessName: target.name,
          customerPhone: 'BULK-GENERATED',
          customerName: 'Loyalty Customer',
          createdAt: now.toISOString(),
          expiryDate: expiry,
          status: 'ACTIVE',
          redemptions: [],
          points: points,
          isBulk: true,
          discountValue: target.discountRule.value,
          discountType: target.discountRule.type,
          discountMinPurchase: target.discountRule.minPurchase,
          customTitle: customTitle,
          luckyGift: giftIndices.get(i)
        });
      }
    });

    // Update last bulk issue timestamp
    allBusinesses[bizIdx].lastBulkIssueAt = now.toISOString();
    db.setBusinesses(allBusinesses);

    db.setCoupons([...newCoupons, ...coupons]);
    return newCoupons;
  },

  getBulkCouponsIssuedForMe: async (businessId: string) => {
    const coupons = db.getCoupons();
    return coupons.filter(c => c.isBulk && c.targetBusinessId === businessId && c.status === 'ACTIVE');
  },

  getStats: async (role: string, businessId?: string): Promise<Stats & { totalBusinesses?: number }> => {
    const allCoupons = db.getCoupons();
    const allBusinesses = db.getBusinesses();
    const allClusters = db.getRawClusters();
    
    if (businessId && role === UserRole.BUSINESS_OWNER) {
      const issuedByMe = allCoupons.filter(c => c.originBusinessId === businessId);
      const redemptionsAtMyShop = allCoupons.flatMap(c => c.redemptions).filter(r => r.businessId === businessId);
      
      return {
        couponsGenerated: issuedByMe.length,
        couponsRedeemed: redemptionsAtMyShop.length,
        revenueFacilitated: redemptionsAtMyShop.reduce((sum, r) => sum + r.transactionValue, 0),
        revenueNet: redemptionsAtMyShop.reduce((sum, r) => sum + (r.transactionValue - r.discountApplied), 0),
        activeClusters: allClusters.length
      };
    }

    const allRedemptions = allCoupons.flatMap(c => c.redemptions);
    return {
      couponsGenerated: allCoupons.length,
      couponsRedeemed: allRedemptions.length,
      revenueFacilitated: allRedemptions.reduce((sum, r) => sum + r.transactionValue, 0),
      revenueNet: allRedemptions.reduce((sum, r) => sum + (r.transactionValue - r.discountApplied), 0),
      activeClusters: allClusters.length,
      totalBusinesses: allBusinesses.length
    };
  },

  getAnalyticsData: async (id: string) => {
    const coupons = db.getCoupons();
    const myIssued = coupons.filter(c => c.originBusinessId === id);
    const myRedemptions = coupons.flatMap(c => c.redemptions).filter(r => r.businessId === id);
    const now = new Date();
    
    // Revenue by Month for redemptions at my shop
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = now.getMonth();
    const last6Months = [];
    for(let i = 5; i >= 0; i--) {
        const idx = (currentMonthIndex - i + 12) % 12;
        last6Months.push({ month: months[idx], amount: 0 });
    }

    myRedemptions.forEach(r => {
        const rDate = new Date(r.redeemedAt);
        const rMonth = months[rDate.getMonth()];
        const dataPoint = last6Months.find(d => d.month === rMonth);
        if (dataPoint) dataPoint.amount += r.transactionValue;
    });

    // Distribution of MY issued coupons
    const active = myIssued.filter(c => c.status === 'ACTIVE' && new Date(c.expiryDate) >= now).length;
    const redeemed = myIssued.filter(c => c.status === 'REDEEMED').length;
    const expired = myIssued.filter(c => c.status === 'EXPIRED' || (new Date(c.expiryDate) < now && c.status !== 'REDEEMED')).length;

    return {
      revenue: last6Months,
      distribution: [
        { name: 'Active', value: active },
        { name: 'Redeemed', value: redeemed },
        { name: 'Expired', value: expired },
      ]
    };
  },

  getPlatformAnalytics: async () => {
    const coupons = db.getCoupons();
    const businesses = db.getBusinesses();
    const clusters = db.getRawClusters();
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Revenue last 6 months
    const currentMonthIndex = now.getMonth();
    const last6Months = [];
    for(let i = 5; i >= 0; i--) {
        const idx = (currentMonthIndex - i + 12) % 12;
        last6Months.push({ month: months[idx], amount: 0 });
    }

    coupons.forEach(c => {
        c.redemptions.forEach(r => {
            const rDate = new Date(r.redeemedAt);
            const rMonth = months[rDate.getMonth()];
            const dataPoint = last6Months.find(d => d.month === rMonth);
            if (dataPoint) dataPoint.amount += r.transactionValue;
        });
    });

    // Revenue by Cluster
    const clusterPerf = clusters.map(c => {
       const clusterBizIds = businesses.filter(b => b.clusterId === c.id).map(b => b.id);
       const clusterRev = coupons.reduce((sum, cp) => {
          const redemptionsInCluster = cp.redemptions.filter(r => clusterBizIds.includes(r.businessId));
          return sum + redemptionsInCluster.reduce((s, r) => s + r.transactionValue, 0);
       }, 0);
       return { name: c.name, value: clusterRev || 0.1 }; // small offset for chart visibility if 0
    });

    // Distribution of platform coupons
    return {
      revenue: last6Months,
      distribution: [
        { name: 'Active', value: coupons.filter(c => c.status === 'ACTIVE' && new Date(c.expiryDate) >= now).length },
        // Fixed: Corrected typo 'REDEDEEMED' to 'REDEEMED' to match the type definition.
        { name: 'Redeemed', value: coupons.filter(c => c.status === 'REDEEMED').length },
        { name: 'Expired', value: coupons.filter(c => c.status === 'EXPIRED' || (new Date(c.expiryDate) < now && c.status !== 'REDEEMED')).length },
      ],
      clusterPerformance: clusterPerf
    };
  },

  generateCoupon: async (businessId: string, phone: string, billAmount: number, name: string, email: string, validity: number) => {
    const myBiz = db.getBusinesses().find(b => b.id === businessId);
    if (!myBiz) throw new Error("Business not found");
    const coupons = db.getCoupons();
    const newCoupon: Coupon = {
      code: `CG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      originBusinessId: businessId,
      originBusinessName: myBiz.name,
      customerPhone: phone, customerName: name, customerEmail: email,
      createdAt: new Date().toISOString(),
      expiryDate: new Date(Date.now() + validity * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE', redemptions: []
    };
    coupons.push(newCoupon);
    db.setCoupons(coupons);
    return newCoupon;
  },

  validateCoupon: async (code: string, businessId: string) => {
    const coupons = db.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim());
    if (!coupon) return { valid: false, message: "Coupon not found." };
    
    if (coupon.status === 'REDEEMED') {
        return { valid: false, message: "Coupon already redeemed. This coupon cannot be used again." };
    }

    if (coupon.isBulk) {
        if (coupon.targetBusinessId !== businessId) {
            return { 
                valid: false, 
                message: `This coupon is exclusively valid at ${coupon.targetBusinessName}. It cannot be redeemed at this shop.` 
            };
        }
    } else {
        if (coupon.originBusinessId === businessId) {
            return { valid: false, message: "You cannot redeem your own issued coupon." };
        }
    }

    if (new Date(coupon.expiryDate) < new Date()) return { valid: false, message: "This coupon has expired." };

    let rule: DiscountRule | undefined;
    if (coupon.isBulk && coupon.discountValue !== undefined && coupon.discountType) {
      rule = {
        type: coupon.discountType,
        value: coupon.discountValue,
        minPurchase: coupon.discountMinPurchase || 0,
        description: 'Cluster Network Campaign',
        isActive: true
      };
    } else {
      const originBiz = db.getBusinesses().find(b => b.id === coupon.originBusinessId);
      rule = originBiz?.discountRule;
    }
    
    return { valid: true, coupon, discount: rule, message: "Valid." };
  },

  redeemCoupon: async (code: string, businessId: string, amount: number) => {
    const coupons = db.getCoupons();
    const idx = coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase().trim());
    if (idx === -1) throw new Error("Coupon not found");
    
    const coupon = coupons[idx];
    if (coupon.status === 'REDEEMED') throw new Error("Coupon already redeemed");

    let rule: DiscountRule;
    if (coupon.isBulk && coupon.discountValue !== undefined && coupon.discountType) {
      rule = {
        type: coupon.discountType,
        value: coupon.discountValue,
        minPurchase: coupon.discountMinPurchase || 0,
        description: 'Cluster Network Campaign',
        isActive: true
      };
    } else {
      const originBiz = db.getBusinesses().find(b => b.id === coupon.originBusinessId);
      if (!originBiz) throw new Error("Origin business data missing");
      rule = originBiz.discountRule;
    }

    const redemption = { 
      businessId, 
      redeemedAt: new Date().toISOString(), 
      transactionValue: amount, 
      discountApplied: rule.type === 'PERCENTAGE' ? (amount * rule.value / 100) : rule.value 
    };
    
    coupons[idx].status = 'REDEEMED';
    coupons[idx].redemptions.push(redemption);
    
    db.setCoupons(coupons);
    return redemption;
  },

  getRecentCoupons: async (businessId: string) => db.getCoupons().filter(c => c.originBusinessId === businessId).slice(0, 10),
  getClusterLiveCoupons: async (businessId: string) => {
    const biz = db.getBusinesses().find(b => b.id === businessId);
    if (!biz) return [];
    return db.getCoupons().filter(c => c.status === 'ACTIVE' && (
        (c.isBulk && c.targetBusinessId === businessId) ||
        (!c.isBulk && c.originBusinessId !== businessId)
    )).slice(0, 5);
  },
  getCouponsByType: async (businessId: string, type: any) => {
    const coupons = db.getCoupons();
    if (type === 'REDEEMED') {
      return coupons.filter(c => c.redemptions.some(r => r.businessId === businessId));
    }
    return coupons.filter(c => c.originBusinessId === businessId);
  },

  getNotifications: async (businessId: string) => {
    // Generate automatic expiry reminders before returning notifications
    await mockService._generateExpiryReminders(businessId);
    return db.getNotifications().filter(n => n.businessId === businessId);
  },

  _generateExpiryReminders: async (businessId: string) => {
    const business = db.getBusinesses().find(b => b.id === businessId);
    if (!business) return;

    const notifications = db.getNotifications();
    const now = new Date();
    const expiryDate = new Date(business.expiryDate);
    
    // Calculate days remaining
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const checkAndAdd = (days: number) => {
      const reminderId = `expiry-${days}d-${businessId}`;
      const alreadyExists = notifications.some(n => n.id === reminderId);
      
      if (diffDays === days && !alreadyExists) {
        const newNotif: Notification = {
          id: reminderId,
          businessId: businessId,
          title: 'Subscription Expiry Reminder',
          message: `Your business subscription will expire in ${days} days (on ${expiryDate.toLocaleDateString()}). Please renew to continue cluster operations.`,
          type: 'SYSTEM',
          createdAt: now.toISOString(),
          isRead: false
        };
        notifications.unshift(newNotif);
        db.setNotifications(notifications);
      }
    };

    // Auto-generate for 7 days and 3 days
    checkAndAdd(7);
    checkAndAdd(3);
  },

  markNotificationAsRead: async (id: string) => {
    const notifs = db.getNotifications();
    const idx = notifs.findIndex(n => n.id === id);
    if(idx !== -1) { notifs[idx].isRead = true; db.setNotifications(notifs); }
  },
  getAllActivity: async (id: string) => {
    const coupons = db.getCoupons();
    return coupons.filter(c => c.originBusinessId === id || c.redemptions.some(r => r.businessId === id));
  },
  getGlobalActivity: async () => db.getCoupons(),
  updateBusinessSettings: async (id: string, rule: any, luckyDraw?: { gifts: LuckyGift[] }) => {
    const businesses = db.getBusinesses();
    const idx = businesses.findIndex(b => b.id === id);
    if (idx !== -1) {
      businesses[idx].discountRule = rule;
      businesses[idx].lastDiscountUpdate = new Date().toISOString();
      if (luckyDraw) {
        businesses[idx].luckyGifts = luckyDraw.gifts;
        // Keep legacy fields for backward compatibility if needed, using the first gift
        if (luckyDraw.gifts.length > 0) {
          businesses[idx].luckyGiftName = luckyDraw.gifts[0].name;
          businesses[idx].luckyGiftQuantity = luckyDraw.gifts[0].quantity;
        }
      }
      db.setBusinesses(businesses);
    }
  },
  updateBusinessProfile: async (id: string, data: any) => {
    const businesses = db.getBusinesses();
    const idx = businesses.findIndex(b => b.id === id);
    if (idx !== -1) {
      businesses[idx] = { ...businesses[idx], ...data };
      db.setBusinesses(businesses);
    }
  },
  connectBusinessEmail: async (id: string, email: string) => {
    const businesses = db.getBusinesses();
    const idx = businesses.findIndex(b => b.id === id);
    if (idx !== -1) {
      businesses[idx].isEmailConnected = true;
      businesses[idx].integratedEmail = email;
      db.setBusinesses(businesses);
    }
  },
  disconnectBusinessEmail: async (id: string) => {
    const businesses = db.getBusinesses();
    const idx = businesses.findIndex(b => b.id === id);
    if (idx !== -1) {
      businesses[idx].isEmailConnected = false;
      delete businesses[idx].integratedEmail;
      db.setBusinesses(businesses);
    }
  },
  toggleDiscountOverride: async (id: string, enabled: boolean) => {
    const biz = db.getBusinesses();
    const idx = biz.findIndex(b => b.id === id);
    if (idx !== -1) { biz[idx].discountOverrideEnabled = enabled; db.setBusinesses(biz); }
  },
  addCategory: async (name: string) => {
    const cats = db.getCategories();
    if (!cats.includes(name)) { cats.push(name); db.setCategories(cats); }
    return cats;
  },
  deleteBusiness: async (id: string) => {
     db.setBusinesses(db.getBusinesses().filter(b => b.id !== id));
  },
  verifySubAdmin: async (e: string, p: string) => {
    const admins = db.getSubAdmins();
    return admins.find(a => a.email === e && a.password === p) || null;
  },
  verifySubMerchant: async (e: string, p: string, merchantName: string) => {
    const businesses = db.getBusinesses();
    // Validate email, password AND merchant name (case-insensitive)
    const biz = businesses.find(b => 
      b.subMerchantEmail === e && 
      b.subMerchantPassword === p && 
      b.name.toLowerCase() === merchantName.toLowerCase().trim()
    );
    if (biz) return biz;
    return null;
  },
  getSubAdmins: async () => db.getSubAdmins(),

  resetMerchantData: async (id: string, options: { clearCoupons: boolean, resetRedemptions: boolean }) => {
    let coupons = db.getCoupons();
    
    if (options.clearCoupons) {
      // Deletes all coupons issued by this merchant
      coupons = coupons.filter(c => c.originBusinessId !== id);
    }

    if (options.resetRedemptions) {
      // Clears all redemption records that happened AT this merchant's shop
      coupons = coupons.map(c => ({
        ...c,
        redemptions: c.redemptions.filter(r => r.businessId !== id)
      }));
    }

    db.setCoupons(coupons);
    return true;
  }
};
