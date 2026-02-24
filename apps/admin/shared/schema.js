import { z } from "zod";
// === ZOD SCHEMAS (API contract - no Drizzle) ===
export var insertRssFeedSchema = z.object({
    name: z.string(),
    url: z.string(),
    category: z.string(),
    status: z.string().optional(),
});
export var insertArticleSchema = z.object({
    feedId: z.number().optional(),
    title: z.string(),
    url: z.string(),
    sourceUrl: z.string(),
    content: z.string().optional(),
    status: z.string().default("pending"),
    topics: z.array(z.string()).optional(),
    entities: z.array(z.string()).optional(),
});
export var insertStorySchema = z.object({
    articleId: z.number().optional(),
    title: z.string(),
    content: z.string(),
    summary: z.string().optional(),
    status: z.string().default("draft"),
    charts: z.unknown().optional(),
    datasets: z.unknown().optional(),
});
export var insertForecastSchema = z.object({
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
export var insertAgentSchema = z.object({
    name: z.string(),
    type: z.string(),
    status: z.string().default("idle"),
    progress: z.number().optional(),
    currentTask: z.string().optional(),
    errorCount: z.number().optional(),
    lastError: z.string().optional(),
    totalProcessed: z.number().optional(),
});
