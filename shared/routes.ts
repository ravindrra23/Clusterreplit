import { z } from 'zod';
import { 
  insertClusterSchema, 
  insertBusinessSchema, 
  insertCouponSchema, 
  insertRedemptionSchema
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  profile: {
    get: {
      method: 'GET' as const,
      path: '/api/profile' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      }
    }
  },
  clusters: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/clusters' as const,
      responses: { 200: z.array(z.any()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/clusters' as const,
      input: insertClusterSchema,
      responses: { 201: z.any(), 400: errorSchemas.validation }
    }
  },
  businesses: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/businesses' as const,
      responses: { 200: z.array(z.any()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/businesses' as const,
      input: insertBusinessSchema,
      responses: { 201: z.any(), 400: errorSchemas.validation }
    }
  },
  coupons: {
    list: {
      method: 'GET' as const,
      path: '/api/coupons' as const,
      responses: { 200: z.array(z.any()) }
    },
    issue: {
      method: 'POST' as const,
      path: '/api/coupons' as const,
      input: z.object({
        customerPhone: z.string().optional(),
        customerEmail: z.string().optional(),
        customerName: z.string().optional(),
        isBulk: z.boolean().default(false),
        count: z.number().optional().default(1),
      }),
      responses: { 201: z.array(z.any()), 400: errorSchemas.validation }
    },
    redeem: {
      method: 'POST' as const,
      path: '/api/coupons/redeem' as const,
      input: z.object({
        code: z.string(),
        transactionValue: z.number(),
      }),
      responses: { 200: z.any(), 400: errorSchemas.validation, 404: errorSchemas.notFound }
    }
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats' as const,
      responses: { 200: z.any() }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
