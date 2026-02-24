import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, CreateStoryInput, UpdateStoryInput } from "@shared/routes";

export function useStories() {
  return useQuery({
    queryKey: [api.stories.list.path],
    queryFn: async () => {
      const res = await fetch(api.stories.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stories");
      const data = await res.json();
      return api.stories.list.responses[200].parse(data);
    },
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStoryInput) => {
      const res = await fetch(api.stories.create.path, {
        method: api.stories.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create story");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.stories.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

export function usePublishStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.stories.publish.path, { id });
      const res = await fetch(url, {
        method: api.stories.publish.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to publish story");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.stories.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.stories.delete.path, { id });
      const res = await fetch(url, {
        method: api.stories.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete story");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.stories.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}
