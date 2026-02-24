import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { Coupon } from "@shared/schema";

export function useCoupons() {
  return useQuery({
    queryKey: [api.coupons.list.path],
    queryFn: async () => {
      const res = await fetch(api.coupons.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch coupons");
      return (await res.json()) as Coupon[];
    },
  });
}

interface IssueCouponData {
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  isBulk: boolean;
  count?: number;
}

export function useIssueCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: IssueCouponData) => {
      const res = await fetch(api.coupons.issue.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to issue coupon" }));
        throw new Error(errorData.message || "Failed to issue coupon");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.coupons.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}

interface RedeemCouponData {
  code: string;
  transactionValue: number;
}

export function useRedeemCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RedeemCouponData) => {
      const res = await fetch(api.coupons.redeem.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to redeem coupon" }));
        throw new Error(errorData.message || "Failed to redeem coupon");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.coupons.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}
