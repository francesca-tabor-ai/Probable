import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = "/api/data-sources";

export function useDataSources() {
  return useQuery({
    queryKey: [API],
    queryFn: async () => {
      const res = await fetch(API, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch data sources");
      return res.json();
    },
  });
}

export function useCreateDataSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { topic: string; config?: Record<string, unknown> }) => {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [API] });
    },
  });
}

export function useUpdateDataSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { topic?: string; config?: Record<string, unknown> } }) => {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [API] });
    },
  });
}

export function useDeleteDataSource() {
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
