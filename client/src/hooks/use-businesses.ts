import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { Business, InsertBusiness } from "@shared/schema";

export function useBusinesses() {
  return useQuery({
    queryKey: [api.businesses.list.path],
    queryFn: async () => {
      const res = await fetch(api.businesses.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch businesses");
      return (await res.json()) as Business[];
    },
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBusiness) => {
      const res = await fetch(api.businesses.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create business");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.businesses.list.path] });
    },
  });
}
