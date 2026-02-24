# Probable

Predict with confidence. A landing page for Probable — probabilistic intelligence for modern teams.

---

## Platform Description

*Written by the Product Manager*

Probable is probabilistic intelligence for teams who make high-stakes decisions under uncertainty. It turns raw data into quantified forecasts, risk distributions, and decision-ready insights—so you stop guessing and start acting on what's likely to happen.

### Who It's For (Ideal Customer Profile)

Our ideal customers are **ops leads, strategy teams, and finance leaders** at growth-stage and mid-market companies (Series A–D) who:

- Own revenue targets, resource planning, or product roadmaps
- Operate in fast-changing environments where outcomes are uncertain
- Need to communicate forecasts and risks clearly to leadership and boards
- Are tired of point estimates and “best guess” scenarios

### Pain Points We Solve

Today’s teams are stuck with:

- **Single-number forecasts** that hide the real range of outcomes and create false certainty
- **Static snapshots** that go stale as new data arrives, forcing manual re-work
- **Scattered tools**—spreadsheets, BI dashboards, separate risk models—that don’t talk to each other
- **Gut-feel decisions** when leadership asks “how confident are we?” and there’s no clear answer

The result: missed targets, misallocated resources, and slower, less confident decision-making.

### Why Probable Is Different

Probable is built around **probabilistic thinking** from the ground up—not a bolt-on to traditional forecasting.

| Others offer… | Probable offers… |
|---------------|------------------|
| Point estimates | Full probability distributions and confidence intervals |
| One-off reports | Real-time forecasts that update as data changes |
| Isolated risk models | Integrated risk, scenario, and forecast views |
| Generic dashboards | Decision-ready outputs tailored to your workflows |

We connect to your existing data sources (spreadsheets, databases, APIs) without moving data. You define the outcomes that matter; we model uncertainty and surface the drivers. The result is forecasts you can trust and explain, not black-box predictions.

### Expected Results & ROI

Teams using Probable typically see:

- **Faster decisions** — Probabilistic estimates reduce back-and-forth and “what-if” paralysis by clarifying realistic ranges
- **Fewer surprises** — Understanding best and worst case helps you plan contingencies instead of reacting when things go wrong
- **More credible forecasts** — Confidence intervals and scenario analyses give leadership and investors a clear view of risk
- **Time back** — Less manual re-forecasting as data changes; real-time updates keep forecasts current

The ROI comes from better resource allocation, fewer costly misses, and faster cycle times on strategic decisions—often paying back within a single planning cycle for teams that rely on accurate forecasts.

## Setup

```bash
npm install
```

## Apps

- **`apps/frontend`** — Probable.news React product UI (forecast cards, charts). Run: `cd apps/frontend && npm install && npm run dev`
- **`apps/admin`** — Admin dashboard with full CRUD for feeds, articles, stories, forecasts, data sources, datasets, users. Run: `cd apps/admin && npm install && npm run dev` (requires API on port 8000; Vite proxies `/api` to backend)

The root `npm run dev` serves the main marketing landing (static HTML). The API runs separately (`Dockerfile.api`).

## Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
```

Output goes to the `dist/` folder. Preview the production build with:

```bash
npm run preview
```

## Auth

Sign up and log in via the API:

- **POST /api/v1/auth/signup** — `{"email": "...", "password": "...", "full_name": "..."}`
- **POST /api/v1/auth/login** — `{"email": "...", "password": "..."}` returns `{access_token, token_type}`
- **GET /api/v1/auth/me** — requires `Authorization: Bearer <token>`

Set `SECRET_KEY` in production (e.g. `openssl rand -hex 32`).

## Database

After creating the database (local or Railway), run migrations and seed:

```bash
# Run migrations
alembic upgrade head

# Seed sample data (idempotent)
python scripts/seed_db.py
```

## Deploy Backend (Railway + PostgreSQL)

1. **Create a Railway project** and add a **PostgreSQL** database.
2. **New Service** → Deploy from GitHub → Select this repo.
3. Link the PostgreSQL service to your API service (Railway will inject `DATABASE_URL`).
4. **Generate domain** in Settings → Networking.
5. Optional: Add `OPENAI_API_KEY` and other vars in Variables.

The `railway.json` and `Dockerfile.api` are pre-configured. Railway auto-converts `postgresql://` to `postgresql+asyncpg://` for async SQLAlchemy. Migrations run automatically on deploy. To seed: run `python scripts/seed_db.py` once (connect to Railway DB or run locally with `DATABASE_URL` pointed at Railway).
