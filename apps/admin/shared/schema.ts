import { z } from "zod";

// === ZOD SCHEMAS (API contract - no Drizzle) ===

export const insertRssFeedSchema = z.object({
  name: z.string(),
  url: z.string(),
  category: z.string(),
  status: z.string().optional(),
});

export const insertArticleSchema = z.object({
  feedId: z.number().optional(),
  title: z.string(),
  url: z.string(),
  sourceUrl: z.string(),
  content: z.string().optional(),
  status: z.string().default("pending"),
  topics: z.array(z.string()).optional(),
  entities: z.array(z.string()).optional(),
});

export const insertStorySchema = z.object({
  articleId: z.number().optional(),
  title: z.string(),
  content: z.string(),
  summary: z.string().optional(),
  status: z.string().default("draft"),
  charts: z.unknown().optional(),
  datasets: z.unknown().optional(),
});

export const insertForecastSchema = z.object({
  storyId: z.number().optional(),
  topic: z.string(),
  target: z.string(),
  probability: z.number(),
  confidence: z.string(),
  modelType: z.string(),
  horizon: z.string().optional(),
  status: z.string().default("active"),
  scenarios: z.unknown().optional(),
});

export const insertAgentSchema = z.object({
  name: z.string(),
  type: z.string(),
  status: z.string().default("idle"),
  progress: z.number().optional(),
  currentTask: z.string().optional(),
  errorCount: z.number().optional(),
  lastError: z.string().optional(),
  totalProcessed: z.number().optional(),
});

// === API TYPES ===

export type RssFeed = {
  id: number;
  name: string;
  url: string;
  category: string;
  status: string;
  lastFetched?: string | null;
  articlesCount?: number;
  createdAt?: string;
};
export type InsertRssFeed = z.infer<typeof insertRssFeedSchema>;
export type CreateRssFeedRequest = InsertRssFeed;
export type UpdateRssFeedRequest = Partial<InsertRssFeed>;
export type RssFeedResponse = RssFeed;

export type Article = {
  id: number;
  feedId?: number | null;
  title: string;
  url: string;
  sourceUrl: string;
  content?: string | null;
  status: string;
  topics?: string[] | null;
  entities?: string[] | null;
  fetchedAt?: string | null;
  processedAt?: string | null;
};
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type CreateArticleRequest = InsertArticle;
export type UpdateArticleRequest = Partial<InsertArticle>;
export type ArticleResponse = Article;

export type Story = {
  id: number;
  articleId?: number | null;
  title: string;
  content: string;
  summary?: string | null;
  status: string;
  charts?: unknown;
  datasets?: unknown;
  publishedAt?: string | null;
  createdAt?: string;
};
export type InsertStory = z.infer<typeof insertStorySchema>;
export type CreateStoryRequest = InsertStory;
export type UpdateStoryRequest = Partial<InsertStory>;
export type StoryResponse = Story;

export type Forecast = {
  id: number;
  storyId?: number | null;
  topic: string;
  target: string;
  probability: number;
  confidence: string;
  modelType: string;
  horizon?: string | null;
  status: string;
  scenarios?: unknown;
  lastUpdated?: string;
  createdAt?: string;
};
export type InsertForecast = z.infer<typeof insertForecastSchema>;
export type CreateForecastRequest = InsertForecast;
export type UpdateForecastRequest = Partial<InsertForecast>;
export type ForecastResponse = Forecast;

export type Agent = {
  id: number;
  name: string;
  type: string;
  status: string;
  progress?: number;
  currentTask?: string | null;
  errorCount?: number;
  lastError?: string | null;
  lastRun?: string | null;
  totalProcessed?: number;
};
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type CreateAgentRequest = InsertAgent;
export type UpdateAgentRequest = Partial<InsertAgent>;
export type AgentResponse = Agent;

export interface DashboardStats {
  totalFeeds: number;
  activeFeeds: number;
  totalArticles: number;
  pendingArticles: number;
  totalStories: number;
  publishedStories: number;
  totalForecasts: number;
  activeForecasts: number;
  agentsRunning: number;
  agentsWithErrors: number;
}
