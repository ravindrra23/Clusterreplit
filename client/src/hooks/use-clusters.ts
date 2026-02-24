import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { Cluster, InsertCluster } from "@shared/schema";

export function useClusters() {
  return useQuery({
    queryKey: [api.clusters.list.path],
    queryFn: async () => {
      const res = await fetch(api.clusters.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch clusters");
      return (await res.json()) as Cluster[];
    },
  });
}

export function useCreateCluster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCluster) => {
      const res = await fetch(api.clusters.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create cluster");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.clusters.list.path] });
    },
  });
}
