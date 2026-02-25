import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { DashboardStatsResponse } from "@shared/routes";
import { authFetch } from "@/lib/auth-api";

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await authFetch(api.dashboard.stats.path);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await res.json();
      return api.dashboard.stats.responses[200].parse(data) as DashboardStatsResponse;
    },
  });
}
