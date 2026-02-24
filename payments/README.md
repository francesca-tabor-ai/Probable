# Probable Payments Service

Node.js/TypeScript payments service for the Probable platform. Implements the Payments Engineer Agent system with four specialized agents:

- **Subscription Lifecycle Management (SLM)** - State machine, dunning, proration
- **Payment Gateway Orchestration (PGO)** - Stripe/PayPal routing, fallback
- **Creator Payout & Reconciliation (CPR)** - Earnings calculation, payouts
- **Fraud Detection & Risk (FDR)** - Risk scoring, approve/review/block

## Setup

1. Copy `.env.example` to `.env` and fill in values.
2. Ensure PostgreSQL and Redis are running (use main project's `docker-compose up -d postgres redis`).
3. Run migrations: `npm run db:migrate`
4. Start the service: `npm run dev`

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (same DB as main app)
- `REDIS_URL` - Redis connection string
- `STRIPE_SECRET_KEY` - Stripe secret key (required)
- `STRIPE_WEBHOOK_SECRET` - For webhook signature verification (required for production)
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` - Optional, for PayPal gateway
- `PORT` - Server port (default: 3001)

## API Endpoints

### Core
- `GET /health` - Health check
- `POST /checkout/session` - Create Stripe Checkout session for subscription
- `POST /charge` - Charge via Payment Gateway Orchestration agent
- `POST /webhooks/stripe` - Stripe webhook handler

### Admin
- `GET /admin/subscriptions` - List subscriptions (query: userId, status, limit, offset)
- `POST /admin/subscriptions/:id/plan-change` - Plan upgrade/downgrade (body: newPlanId, changeType)
- `GET /admin/plans`, `POST /admin/plans` - List/create plans
- `GET /admin/transactions` - List transactions
- `POST /admin/users` - Create user (body: email)
- `POST /admin/payouts/run` - Run creator payout calculations (body: periodStart, periodEnd, creatorIds?)

### Observability
- `GET /admin/decisions` - Agent decision log (query: agent, entityId, since)
- `GET /admin/metrics/slm` - SLM metrics (churn, renewal rate)
- `GET /admin/metrics/pgo` - PGO metrics (success rate per gateway)
- `GET /admin/metrics/cpr` - CPR metrics (payout stats)
- `GET /admin/metrics/fdr` - FDR metrics (dispute rate)

### Fraud
- `POST /fraud/assess` - Assess transaction risk (body: userId, amount, currency, ipAddress?)

## Creating a Checkout Session

```json
POST /checkout/session
{
  "userId": "uuid",
  "planId": "uuid",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel",
  "trialDays": 7
}
```

Returns `{ sessionId, url }` - redirect the user to `url` for payment.
