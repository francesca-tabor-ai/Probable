# Probable Admin

Admin dashboard UI for managing feeds, articles, stories, forecasts, and agents. Built with React, TanStack Query, and shadcn/ui components.

## Prerequisites

The admin expects a backend API that implements the routes defined in `shared/routes.ts` (feeds, articles, stories, forecasts, agents). When Probable's FastAPI backend adds these endpoints, configure the proxy target below.

## Development

```bash
cd apps/admin
npm install
npm run dev
```

Runs on [http://localhost:5174](http://localhost:5174). API requests to `/api/*` are proxied to the backend (default: `http://localhost:8000`). Set `VITE_API_URL` to override.

## Build

```bash
npm run build
```

Output goes to `apps/admin/dist/`.
