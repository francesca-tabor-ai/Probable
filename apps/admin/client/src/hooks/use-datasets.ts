import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = "/api/datasets";

export function useDatasets(topic?: string) {
  const url = topic ? `${API}?topic=${encodeURIComponent(topic)}` : API;
  return useQuery({
    queryKey: [API, topic],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch datasets");
      return res.json();
    },
  });
}

export function useCreateDataset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { topic: string; source?: string; data?: Record<string, unknown>; articleId?: number }) => {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: data.topic,
          source: data.source ?? "Admin",
          data: data.data ?? {},
          articleId: data.articleId ?? null,
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create dataset");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [API] });
    },
  });
}

export function useDeleteDataset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API}/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [API] });
    },
  });
}
