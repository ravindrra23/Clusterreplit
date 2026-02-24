import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export interface ProfileResponse {
  id: number;
  userId: string;
  role: 'SUPER_ADMIN' | 'SUB_ADMIN' | 'BUSINESS_OWNER' | 'SUB_MERCHANT';
  businessId?: number;
  business?: any;
}

export function useProfile() {
  return useQuery({
    queryKey: [api.profile.get.path],
    queryFn: async () => {
      const res = await fetch(api.profile.get.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return (await res.json()) as ProfileResponse;
    },
    staleTime: 5 * 60 * 1000,
  });
}
