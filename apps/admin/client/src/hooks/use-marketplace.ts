import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const APPS_API = "/api/marketplace/apps";
const INTEGRATIONS_API = "/api/marketplace/integrations";

export function useMarketplaceApps(category?: string) {
  const url = category ? `${APPS_API}?category=${category}` : APPS_API;
  return useQuery({
    queryKey: ["marketplace-apps", category],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch apps");
      return res.json();
    },
  });
}

export function useUserIntegrations() {
  return useQuery({
    queryKey: [INTEGRATIONS_API],
    queryFn: async () => {
      const res = await fetch(INTEGRATIONS_API, { credentials: "include" });
      if (res.status === 401) return [];
      if (!res.ok) throw new Error("Failed to fetch integrations");
      return res.json();
    },
    retry: false,
  });
}

export function useConnectIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { app_id: number; config?: Record<string, unknown> }) => {
      const res = await fetch(INTEGRATIONS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to connect");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [INTEGRATIONS_API] });
    },
  });
}

export function useDisconnectIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${INTEGRATIONS_API}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to disconnect");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [INTEGRATIONS_API] });
    },
  });
}
