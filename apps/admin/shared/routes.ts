import { z } from 'zod';
import { 
  insertRssFeedSchema, 
  insertArticleSchema, 
  insertStorySchema, 
  insertForecastSchema,
  insertAgentSchema 
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats' as const,
      responses: {
        200: z.object({
          totalFeeds: z.number(),
          activeFeeds: z.number(),
          totalArticles: z.number(),
          pendingArticles: z.number(),
          totalStories: z.number(),
          publishedStories: z.number(),
          totalForecasts: z.number(),
          activeForecasts: z.number(),
          agentsRunning: z.number(),
          agentsWithErrors: z.number(),
        }),
      },
    },
  },
  feeds: {
    list: {
      method: 'GET' as const,
      path: '/api/feeds' as const,
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/feeds/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/feeds' as const,
      input: insertRssFeedSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/feeds/:id' as const,
      input: insertRssFeedSchema.partial(),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/feeds/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  articles: {
    list: {
      method: 'GET' as const,
      path: '/api/articles' as const,
      input: z.object({
        status: z.string().optional(),
        feedId: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/articles/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/articles/:id' as const,
      input: insertArticleSchema.partial(),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/articles/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  stories: {
    list: {
      method: 'GET' as const,
      path: '/api/stories' as const,
      input: z.object({
        status: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/stories/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/stories' as const,
      input: insertStorySchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/stories/:id' as const,
      input: insertStorySchema.partial(),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    publish: {
      method: 'PATCH' as const,
      path: '/api/stories/:id/publish' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/stories/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  forecasts: {
    list: {
      method: 'GET' as const,
      path: '/api/forecasts' as const,
      input: z.object({
        status: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/forecasts/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/forecasts' as const,
      input: insertForecastSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/forecasts/:id' as const,
      input: insertForecastSchema.partial(),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/forecasts/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  agents: {
    list: {
      method: 'GET' as const,
      path: '/api/agents' as const,
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/agents/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/agents/:id' as const,
      input: insertAgentSchema.partial(),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type CreateRssFeedInput = z.infer<typeof api.feeds.create.input>;
export type UpdateRssFeedInput = z.infer<typeof api.feeds.update.input>;
export type UpdateArticleInput = z.infer<typeof api.articles.update.input>;
export type CreateStoryInput = z.infer<typeof api.stories.create.input>;
export type UpdateStoryInput = z.infer<typeof api.stories.update.input>;
export type CreateForecastInput = z.infer<typeof api.forecasts.create.input>;
export type UpdateForecastInput = z.infer<typeof api.forecasts.update.input>;
export type UpdateAgentInput = z.infer<typeof api.agents.update.input>;
export type DashboardStatsResponse = z.infer<typeof api.dashboard.stats.responses[200]>;
