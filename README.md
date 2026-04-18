# DeFi Portfolio Copilot

A backend + frontend system that ingests DeFi wallet data (EVM), normalizes balances and protocol positions, analyzes portfolio structure and risk, generates actionable recommendations, and triggers alerts on important changes.

Read-only portfolio analysis — no transaction execution.

## Architecture

Nx monorepo with pnpm workspaces, three apps, and five packages:

```
apps/
  web/       → Next.js 16 (App Router) — dashboard UI (port 3000)
  api/       → NestJS — REST API (port 4000)
  worker/    → BullMQ — background snapshot, recommendation & alert jobs

packages/
  domain/               → Zod schemas, enums, interfaces
  shared/               → Utilities, types, constants
  provider-sdk/         → Portfolio data providers (mock + real)
  recommendation-engine → Deterministic recommendation rules (5 rules)
  alert-engine          → Alert evaluation rules (4 rules)
```

## Tech Stack

- **TypeScript** (strict) everywhere
- **Nx** for monorepo orchestration and caching
- **Prisma** ORM with PostgreSQL
- **BullMQ** + Redis for job queues
- **Zod** for validation
- **TanStack Query** for frontend data fetching
- **Tailwind CSS v4** for styling
- **wagmi** + **viem** for wallet connection (MetaMask, WalletConnect, Coinbase)
- **Jest** for unit/integration tests
- **Playwright** for e2e tests
- **Istio** (ambient mode) for service mesh, mTLS, and JWT auth
- **DigitalOcean** Kubernetes for production deployment

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker (for PostgreSQL + Redis)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start PostgreSQL + Redis
pnpm docker:up

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Start all services (run in separate terminals)
pnpm dev:api      # API on http://localhost:4000
pnpm dev:web      # Web on http://localhost:3000
pnpm dev:worker   # Background worker
```

Open http://localhost:3000, connect a wallet (or enter an address manually), and explore the dashboard.

## Available Commands

```bash
pnpm dev:web             # Next.js dev server
pnpm dev:api             # NestJS dev server
pnpm dev:worker          # BullMQ worker process
pnpm build               # Build all packages
pnpm test                # Run all unit/integration tests
pnpm lint                # Lint all packages
pnpm docker:up           # Start Postgres + Redis containers
pnpm docker:down         # Stop infrastructure containers
pnpm db:generate         # Generate Prisma client
pnpm db:migrate          # Run Prisma migrations
npx nx graph             # Visualize dependency graph
pnpm affected:build      # Build only affected projects
pnpm affected:test       # Test only affected projects
```

### E2E Tests (Playwright)

```bash
cd apps/web
npx playwright install chromium   # First time only
npx playwright test               # Run e2e tests
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/wallets` | Register a wallet for tracking |
| GET | `/wallets/:address/portfolio` | Portfolio snapshot with balances |
| GET | `/wallets/:address/positions` | Protocol positions |
| GET | `/wallets/:address/recommendations` | Generated recommendations |
| GET | `/wallets/:address/alerts` | Alert event feed |

## Recommendation Rules

| Rule | Trigger |
|------|---------|
| Idle stablecoin | > $500 stablecoin not deployed in any protocol |
| High concentration | > 50% of portfolio value in a single protocol |
| Low health factor | Health factor < 1.5 on any lending position |
| Unclaimed rewards | > $50 in unclaimed protocol rewards |
| Low yield | < 2% APY on stablecoin positions |

## Alert Rules

| Rule | Trigger |
|------|---------|
| Health factor | Position health factor drops below configured threshold |
| Portfolio drop | Total USD value drops by more than threshold percentage |
| Yield drop | APY on a position drops significantly |
| Large balance change | Token balance changes by more than threshold percentage |

## Test Coverage

| Scope | Tests | Tool |
|-------|-------|------|
| Domain schemas | 24 | Jest |
| Mock provider | 13 | Jest |
| Recommendation rules | 36 | Jest |
| Alert rules | 31 | Jest |
| API controller | 8 | Jest |
| API service | 10 | Jest |
| API integration | 14 | Jest (supertest) |
| Worker jobs | 10 | Jest |
| Frontend e2e | 21 | Playwright |
| **Total** | **167** | |

## Production Deployment

### Infrastructure

- DigitalOcean Kubernetes (DOKS) with Istio ambient mode
- DigitalOcean Managed PostgreSQL + Redis
- DigitalOcean Container Registry (DOCR)

### Docker

Each app has a multi-stage Dockerfile (build context is the monorepo root):

```bash
docker build -f apps/api/Dockerfile -t defi-copilot/api .
docker build -f apps/web/Dockerfile -t defi-copilot/web .
docker build -f apps/worker/Dockerfile -t defi-copilot/worker .
```

### Kubernetes Manifests

```
infra/k8s/
├── namespace.yaml            # Namespace with Istio ambient mode label
├── configmap.yaml            # Shared environment config
├── secret.yaml               # DB/Redis credentials (template)
├── service-accounts.yaml     # ServiceAccounts for all workloads
├── api-deployment.yaml       # API (2 replicas)
├── api-service.yaml          # ClusterIP with waypoint annotation
├── web-deployment.yaml       # Web (2 replicas)
├── web-service.yaml          # ClusterIP
├── worker-deployment.yaml    # Worker (1 replica)
├── ingress.yaml              # HTTPS ingress with cert-manager
└── istio/
    ├── api-waypoint.yaml               # Waypoint proxy for L7 policy on API
    ├── peer-authentication.yaml        # Strict mTLS namespace-wide
    ├── request-authentication.yaml     # JWT validation on API
    ├── authorization-policy-jwt.yaml   # Require JWT (except health checks)
    └── authorization-policy-traffic.yaml  # Allow only web/worker → API
```

### CI/CD (GitHub Actions)

- **`ci.yaml`** — Lint, test, and e2e on every PR and push to `main`
- **`build-and-deploy.yaml`** — Build Docker images, push to DOCR, deploy to staging (auto) and production (manual approval)

Required GitHub secrets: `DIGITALOCEAN_ACCESS_TOKEN`, `K8S_CLUSTER_NAME`

## Environment Variables

| Variable | Used By | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | api, worker | PostgreSQL connection string |
| `REDIS_HOST` | worker | Redis hostname |
| `REDIS_PORT` | worker | Redis port (default: 6379) |
| `NEXT_PUBLIC_API_URL` | web | API base URL (default: http://localhost:4000) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | web | WalletConnect project ID |
| `PROVIDER_TYPE` | api, worker | `mock` or `evm` (default: mock) |
| `EVM_RPC_URL` | api, worker | Ethereum RPC endpoint (required when `PROVIDER_TYPE=evm`) |

## Project Structure

```
.
├── apps/
│   ├── api/                   # NestJS REST API
│   ├── web/                   # Next.js frontend
│   └── worker/                # BullMQ background jobs
├── packages/
│   ├── domain/                # Core entities, Zod schemas, enums
│   ├── shared/                # Shared utilities
│   ├── provider-sdk/          # Portfolio data providers
│   ├── recommendation-engine/ # 5 deterministic recommendation rules
│   └── alert-engine/          # 4 alert evaluation rules
├── infra/
│   ├── docker/                # docker-compose for local dev
│   └── k8s/                   # Kubernetes + Istio manifests
├── .github/workflows/         # CI/CD pipelines
└── docs/prd/                  # Product specification
```

## License

Private — not open source.
