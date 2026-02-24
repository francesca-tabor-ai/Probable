import { z } from 'zod';
import { insertRssFeedSchema, insertArticleSchema, insertStorySchema, insertForecastSchema, insertAgentSchema } from './schema';
// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export var errorSchemas = {
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
export var api = {
    dashboard: {
        stats: {
            method: 'GET',
            path: '/api/dashboard/stats',
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
            method: 'GET',
            path: '/api/feeds',
            responses: {
                200: z.array(z.any()),
            },
        },
        get: {
            method: 'GET',
            path: '/api/feeds/:id',
            responses: {
                200: z.any(),
                404: errorSchemas.notFound,
            },
        },
        create: {
            method: 'POST',
            path: '/api/feeds',
            input: insertRssFeedSchema,
            responses: {
                201: z.any(),
                400: errorSchemas.validation,
            },
        },
        update: {
            method: 'PUT',
            path: '/api/feeds/:id',
            input: insertRssFeedSchema.partial(),
            responses: {
                200: z.any(),
                400: errorSchemas.validation,
                404: errorSchemas.notFound,
            },
        },
        delete: {
            method: 'DELETE',
            path: '/api/feeds/:id',
            responses: {
                204: z.void(),
                404: errorSchemas.notFound,
            },
        },
    },
    articles: {
        list: {
            method: 'GET',
            path: '/api/articles',
            input: z.object({
                status: z.string().optional(),
                feedId: z.string().optional(),
            }).optional(),
            responses: {
                200: z.array(z.any()),
            },
        },
        get: {
            method: 'GET',
            path: '/api/articles/:id',
            responses: {
                200: z.any(),
                404: errorSchemas.notFound,
            },
        },
        update: {
            method: 'PUT',
            path: '/api/articles/:id',
            input: insertArticleSchema.partial(),
            responses: {
                200: z.any(),
                400: errorSchemas.validation,
                404: errorSchemas.notFound,
            },
        },
        delete: {
            method: 'DELETE',
            path: '/api/articles/:id',
            responses: {
                204: z.void(),
                404: errorSchemas.notFound,
            },
        },
    },
    stories: {
        list: {
            method: 'GET',
            path: '/api/stories',
            input: z.object({
                status: z.string().optional(),
            }).optional(),
            responses: {
                200: z.array(z.any()),
            },
        },
        get: {
            method: 'GET',
            path: '/api/stories/:id',
            responses: {
                200: z.any(),
                404: errorSchemas.notFound,
            },
        },
        create: {
            method: 'POST',
            path: '/api/stories',
            input: insertStorySchema,
            responses: {
                201: z.any(),
                400: errorSchemas.validation,
            },
        },
        update: {
            method: 'PUT',
            path: '/api/stories/:id',
            input: insertStorySchema.partial(),
            responses: {
                200: z.any(),
                400: errorSchemas.validation,
                404: errorSchemas.notFound,
            },
        },
        publish: {
            method: 'PATCH',
            path: '/api/stories/:id/publish',
            responses: {
                200: z.any(),
                404: errorSchemas.notFound,
            },
        },
        delete: {
            method: 'DELETE',
            path: '/api/stories/:id',
            responses: {
                204: z.void(),
                404: errorSchemas.notFound,
            },
        },
    },
    forecasts: {
        list: {
            method: 'GET',
            path: '/api/forecasts',
            input: z.object({
                status: z.string().optional(),
            }).optional(),
            responses: {
                200: z.array(z.any()),
            },
        },
        get: {
            method: 'GET',
            path: '/api/forecasts/:id',
            responses: {
                200: z.any(),
                404: errorSchemas.notFound,
            },
        },
        create: {
            method: 'POST',
            path: '/api/forecasts',
            input: insertForecastSchema,
            responses: {
                201: z.any(),
                400: errorSchemas.validation,
            },
        },
        update: {
            method: 'PUT',
            path: '/api/forecasts/:id',
            input: insertForecastSchema.partial(),
            responses: {
                200: z.any(),
                400: errorSchemas.validation,
                404: errorSchemas.notFound,
            },
        },
        delete: {
            method: 'DELETE',
            path: '/api/forecasts/:id',
            responses: {
                204: z.void(),
                404: errorSchemas.notFound,
            },
        },
    },
    agents: {
        list: {
            method: 'GET',
            path: '/api/agents',
            responses: {
                200: z.array(z.any()),
            },
        },
        get: {
            method: 'GET',
            path: '/api/agents/:id',
            responses: {
                200: z.any(),
                404: errorSchemas.notFound,
            },
        },
        update: {
            method: 'PUT',
            path: '/api/agents/:id',
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
export function buildUrl(path, params) {
    var url = path;
    if (params) {
        Object.entries(params).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (url.includes(":".concat(key))) {
                url = url.replace(":".concat(key), String(value));
            }
        });
    }
    return url;
}
