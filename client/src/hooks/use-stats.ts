import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export interface DashboardStats {
  couponsGenerated: number;
  couponsRedeemed: number;
  revenueFacilitated: number;
  revenueNet: number;
  activeClusters: number;
  recentActivity?: any[];
}

export function useStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const res = await fetch(api.stats.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return (await res.json()) as DashboardStats;
    },
  });
}
