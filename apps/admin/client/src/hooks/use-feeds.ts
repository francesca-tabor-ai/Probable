import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, CreateRssFeedInput, UpdateRssFeedInput } from "@shared/routes";

export function useFeeds() {
  return useQuery({
    queryKey: [api.feeds.list.path],
    queryFn: async () => {
      const res = await fetch(api.feeds.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch feeds");
      const data = await res.json();
      return api.feeds.list.responses[200].parse(data);
    },
  });
}

export function useCreateFeed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRssFeedInput) => {
      const res = await fetch(api.feeds.create.path, {
        method: api.feeds.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create feed");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.feeds.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

export function useUpdateFeed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateRssFeedInput }) => {
      const url = buildUrl(api.feeds.update.path, { id });
      const res = await fetch(url, {
        method: api.feeds.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update feed");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.feeds.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

export function useDeleteFeed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.feeds.delete.path, { id });
      const res = await fetch(url, {
        method: api.feeds.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete feed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.feeds.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}
