import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, UpdateAgentInput } from "@shared/routes";

export function useAgents() {
  return useQuery({
    queryKey: [api.agents.list.path],
    queryFn: async () => {
      const res = await fetch(api.agents.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch agents");
      const data = await res.json();
      return api.agents.list.responses[200].parse(data);
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAgentInput }) => {
      const url = buildUrl(api.agents.update.path, { id });
      const res = await fetch(url, {
        method: api.agents.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update agent");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.agents.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}
