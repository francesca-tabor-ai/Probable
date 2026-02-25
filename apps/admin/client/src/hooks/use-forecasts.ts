import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, CreateForecastInput, UpdateForecastInput } from "@shared/routes";

export function useForecasts() {
  return useQuery({
    queryKey: [api.forecasts.list.path],
    queryFn: async () => {
      const res = await fetch(api.forecasts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch forecasts");
      const data = await res.json();
      return api.forecasts.list.responses[200].parse(data);
    },
  });
}

export function useCreateForecast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateForecastInput) => {
      const res = await fetch(api.forecasts.create.path, {
        method: api.forecasts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create forecast");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.forecasts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

export function useUpdateForecast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateForecastInput }) => {
      const url = buildUrl(api.forecasts.update.path, { id });
      const res = await fetch(url, {
        method: api.forecasts.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update forecast");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.forecasts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

export function useDeleteForecast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.forecasts.delete.path, { id });
      const res = await fetch(url, {
        method: api.forecasts.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete forecast");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.forecasts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}
