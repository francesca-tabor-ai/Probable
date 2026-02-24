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
