# Probable

**Turn every news event into a living data project — automatically.**

Probable is an AI-native data journalism and forecasting platform that continuously ingests news and data, and automatically produces evidence-based stories with probabilistic forecasts. Transparent methodology, instant scaling, no analysts required.

---

## What Probable Does

Probable transforms breaking news into transparent, probabilistic data journalism — complete with forecasts, charts, and methodology — without adding analysts to your newsroom. It turns raw data into quantified forecasts, risk distributions, and decision-ready insights so you stop guessing and start acting on what's likely to happen.

| Others offer… | Probable offers… |
|---------------|------------------|
| Static snapshots | Real-time forecasts that update as data changes |
| Manual analysis | Automated synthesis of news into actionable insight |
| Black-box predictions | Transparent methodology and auditable forecasts |
| Single-number forecasts | Full probability distributions and confidence intervals |

---

## Who It's For (Ideal Customer Profiles)

### Tier 1 — Primary Focus
- **Digital media organizations** — Online news publishers, data journalism teams, newsletter-first media, financial news publishers  
  *Roles: Editor-in-Chief, Head of Data Journalism, CTO, Head of Audience*
- **Financial research & investment firms** — Hedge funds, asset managers, macro research firms  
  *Roles: Chief Investment Officer, Head of Research, Portfolio Manager, Quant Lead*

### Tier 2
- **Independent analysts & newsletter creators** — Substack writers, creator journalists, niche industry analysts
- **Data & intelligence platforms** — Economic intelligence, market intelligence, risk platforms

### Tier 3
- **Government & policy teams** — Policy units, think tanks, NGOs, central banks

### Best single starting target
**Head of Data Journalism** at a digital-first media company (10–200 journalists). They have urgent pain, budget authority, and immediately understand the value of probabilistic journalism.

---

## Core Value Propositions

- **Scale data journalism coverage** without hiring analysts
- **Publish faster** — automated story generation and forecasts
- **Differentiate** with transparent, FiveThirtyEight-level analysis
- **Build reader trust** with evidence-based, probabilistic reporting
- **Early trend identification** via scenario analysis and probability modelling

---

## Project Structure

```
Probable/
├── apps/
│   ├── frontend/     # Probable.news React product UI (forecast cards, charts)
│   ├── admin/        # Admin dashboard (feeds, articles, stories, forecasts, integrations)
│   └── api/          # Python FastAPI backend
├── payments/         # Stripe checkout & webhooks (subscriptions)
├── core/             # Shared Python config
├── public/           # Static assets
└── scripts/          # DB migrations, seeding, utilities
```

---

## Setup

### Root (marketing landing)
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### Apps
- **Frontend** — `cd apps/frontend && npm install && npm run dev`
- **Admin** — `cd apps/admin && npm install && npm run dev` (requires API on port 8000; Vite proxies `/api` to backend)
- **Payments** — `cd payments && npm install` — Stripe checkout & webhook server. Copy `payments/.env.example` to `.env` and configure.

The API runs separately (`Dockerfile.api`).

---

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```
Output goes to `dist/`. Preview with `npm run preview`.

---

## Auth

- **POST /api/v1/auth/signup** — `{"email": "...", "password": "...", "full_name": "..."}`
- **POST /api/v1/auth/login** — returns `{access_token, token_type}`
- **GET /api/v1/auth/me** — requires `Authorization: Bearer <token>`

Set `SECRET_KEY` in production (e.g. `openssl rand -hex 32`).

---

## Database

After creating the database (local or Railway):

```bash
alembic upgrade head
python scripts/seed_db.py
```

---

## App Marketplace

The **Integrations** page in the admin lets users connect apps (Slack, Google Sheets, Zapier, etc.). API endpoints:

- `GET /api/marketplace/apps` — List apps
- `GET /api/marketplace/apps/{slug}` — Get app by slug
- `GET /api/marketplace/integrations` — User's connected apps (auth required)
- `POST /api/marketplace/integrations` — Connect app (auth required)
- `DELETE /api/marketplace/integrations/{id}` — Disconnect (auth required)

---

## Deploy Backend (Railway + PostgreSQL)

1. Create a Railway project and add PostgreSQL.
2. New Service → Deploy from GitHub → Select this repo.
3. Link PostgreSQL to the API service (`DATABASE_URL` auto-injected).
4. Generate domain in Settings → Networking.
5. Add `OPENAI_API_KEY` and other vars in Variables.

`railway.json` and `Dockerfile.api` are pre-configured. Migrations run on deploy. Run `python scripts/seed_db.py` once to seed.
