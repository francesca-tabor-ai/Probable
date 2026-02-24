import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, UpdateArticleInput } from "@shared/routes";

export function useArticles(status?: string) {
  return useQuery({
    queryKey: [api.articles.list.path, status],
    queryFn: async () => {
      const url = new URL(api.articles.list.path, window.location.origin);
      if (status) url.searchParams.append("status", status);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch articles");
      const data = await res.json();
      return api.articles.list.responses[200].parse(data);
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateArticleInput }) => {
      const url = buildUrl(api.articles.update.path, { id });
      const res = await fetch(url, {
        method: api.articles.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update article");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.articles.delete.path, { id });
      const res = await fetch(url, {
        method: api.articles.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete article");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}
