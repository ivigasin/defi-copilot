# DeFi Portfolio Copilot — MVP Specification

## Product Goal

A backend + frontend system that ingests DeFi wallet data (EVM initially), normalizes balances and protocol positions, analyzes portfolio structure and risk, generates actionable recommendations, and triggers alerts on important changes.

This is **"DeBank + intelligent copilot (recommendations + alerts)"** — not just a dashboard.

**Read-only portfolio analysis only.** No transaction execution in MVP.

---

## Tech Stack

### Monorepo

- Nx + pnpm workspaces
- TypeScript (strict) everywhere

### Apps

| App | Framework | Purpose |
|-----|-----------|---------|
| `apps/web` | Next.js 16 (App Router) | Frontend dashboard |
| `apps/api` | NestJS | REST API (port 4000) |
| `apps/worker` | BullMQ | Background jobs |

### Packages

| Package | Purpose |
|---------|---------|
| `packages/domain` | Core entities, enums, interfaces |
| `packages/shared` | Utilities, types, constants |
| `packages/provider-sdk` | Portfolio data providers (mock first) |
| `packages/recommendation-engine` | Deterministic recommendation rules |
| `packages/alert-engine` | Alert evaluation rules |

### Infrastructure (local)

- PostgreSQL 16 (via Docker)
- Redis 7 (via Docker)

### Infrastructure (production)

- **DigitalOcean** — cloud provider
- **DigitalOcean Kubernetes (DOKS)** — container orchestration
- **DigitalOcean Managed PostgreSQL** — production database
- **DigitalOcean Managed Redis** — production cache / BullMQ broker
- **DigitalOcean Container Registry (DOCR)** — private Docker image registry
- **GitHub** — source control
- **GitHub Actions** — CI + image builds
- **Argo CD** — GitOps-based continuous delivery
- **Terraform** — infrastructure as code
- **Terragrunt** — DRY Terraform configuration, environment management

### CI/CD Pipeline (GitHub Actions + Argo CD)

GitHub Actions handles CI (lint, test, build, push). Argo CD handles deployment via GitOps.

#### GitHub Actions (CI + Build)

| Stage | Trigger | Actions |
|-------|---------|---------|
| Lint & Test | Every PR, push to `main` | `pnpm lint`, `pnpm test`, Playwright e2e |
| Build & Push | Push to `main` | Build Docker images for `api`, `web`, `worker`; push to DOCR |
| Update manifests | After successful push | Update image tags in K8s manifests and commit back to repo |

#### Argo CD (Deployment)

Argo CD watches the `infra/k8s/` directory in the repo and automatically syncs changes to the cluster.

| Concern | Implementation |
|---------|---------------|
| Sync source | Git repo `infra/k8s/` directory |
| Staging | Auto-sync on manifest changes (image tag updates from CI) |
| Production | Manual sync with approval via Argo CD UI or CLI |
| Health checks | Argo CD built-in health assessment for Deployments, Services, Ingress |
| Rollback | One-click rollback to any previous Git revision in Argo CD UI |
| Notifications | Argo CD Notifications to Slack/GitHub on sync success/failure |

#### Argo CD Applications

| Application | Namespace | Sync Policy | Path |
|-------------|-----------|-------------|------|
| `defi-copilot-staging` | `defi-copilot-staging` | Auto-sync with self-heal + prune | `infra/k8s/` |
| `defi-copilot-production` | `defi-copilot` | Manual sync | `infra/k8s/` |

#### Argo CD Resources

```
infra/argocd/
├── staging-app.yaml       # Argo CD Application for staging (auto-sync)
├── production-app.yaml    # Argo CD Application for production (manual sync)
└── project.yaml           # Argo CD AppProject with allowed resources/repos
```

#### Flow

1. Developer pushes code → GitHub Actions runs lint, test, e2e
2. On `main`, CI builds Docker images, pushes to DOCR with SHA tag
3. CI updates image tags in `infra/k8s/` manifests and commits
4. Argo CD detects manifest changes, syncs staging automatically
5. After staging validation, operator triggers manual sync for production via Argo CD UI

### Infrastructure as Code (Terraform + Terragrunt)

All DigitalOcean infrastructure is provisioned via Terraform, orchestrated by Terragrunt for DRY multi-environment configuration.

#### Terraform Modules

| Module | Resources Managed |
|--------|-------------------|
| `doks` | DigitalOcean Kubernetes cluster (node pool, version, auto-upgrade) |
| `database` | Managed PostgreSQL cluster (size, version, connection pool, firewall rules) |
| `redis` | Managed Redis cluster (size, version, eviction policy) |
| `registry` | DigitalOcean Container Registry (DOCR) |
| `dns` | Domain + DNS records (A records pointing to load balancer) |
| `networking` | VPC, firewall rules, load balancer |

#### Directory Structure

```
infra/terraform/
├── modules/
│   ├── doks/           # Kubernetes cluster
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/       # Managed PostgreSQL
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── redis/          # Managed Redis
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── registry/       # Container registry
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── dns/            # Domain + DNS records
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── networking/     # VPC + firewall
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── terragrunt/
    ├── terragrunt.hcl           # Root config (remote state, provider)
    ├── env/
    │   ├── staging/
    │   │   ├── env.hcl          # Staging-specific variables
    │   │   ├── doks/terragrunt.hcl
    │   │   ├── database/terragrunt.hcl
    │   │   ├── redis/terragrunt.hcl
    │   │   ├── registry/terragrunt.hcl
    │   │   ├── dns/terragrunt.hcl
    │   │   └── networking/terragrunt.hcl
    │   └── production/
    │       ├── env.hcl          # Production-specific variables
    │       ├── doks/terragrunt.hcl
    │       ├── database/terragrunt.hcl
    │       ├── redis/terragrunt.hcl
    │       ├── registry/terragrunt.hcl
    │       ├── dns/terragrunt.hcl
    │       └── networking/terragrunt.hcl
    └── common.hcl               # Shared inputs (region, project name)
```

#### Terragrunt Configuration

| Concern | Implementation |
|---------|---------------|
| Remote state | DigitalOcean Spaces (S3-compatible) backend |
| State locking | DynamoDB-compatible lock table or Spaces native locking |
| Provider | `digitalocean/digitalocean` provider, token via `DIGITALOCEAN_TOKEN` env var |
| Dependencies | Terragrunt `dependency` blocks: networking → doks → database/redis |
| Environment isolation | Separate state files per environment, different variable values |

#### DOKS Module Key Variables

| Variable | Staging | Production |
|----------|---------|------------|
| `cluster_name` | `defi-copilot-staging` | `defi-copilot-prod` |
| `region` | `nyc1` | `nyc1` |
| `k8s_version` | `1.31` | `1.31` |
| `node_pool_size` | `s-2vcpu-4gb` | `s-4vcpu-8gb` |
| `node_count` | 2 | 3 |
| `auto_upgrade` | `true` | `true` |

#### Database Module Key Variables

| Variable | Staging | Production |
|----------|---------|------------|
| `cluster_name` | `defi-copilot-db-staging` | `defi-copilot-db-prod` |
| `engine_version` | `16` | `16` |
| `size` | `db-s-1vcpu-1gb` | `db-s-2vcpu-4gb` |
| `node_count` | 1 | 2 (HA standby) |

#### Module Outputs → K8s Secrets

Terraform outputs (database connection string, Redis URI, cluster endpoint) are consumed by:
- K8s Secret manifests (manually or via External Secrets Operator)
- GitHub Actions secrets (for CI pipeline)

#### Requirements

- All infrastructure must be reproducible via `terragrunt run-all apply`
- Destroying an environment: `terragrunt run-all destroy`
- No manual DigitalOcean console changes — everything in code
- Terraform state stored remotely (never local, never committed)
- Sensitive values (DO token, DB passwords) via environment variables, never in `.tf` files

### Kubernetes Resources

| Resource | Workload | Replicas |
|----------|----------|----------|
| Deployment | `web` (Next.js) | 2 |
| Deployment | `api` (NestJS) | 2 |
| Deployment | `worker` (BullMQ) | 1 |
| Service | `web`, `api` | ClusterIP |
| Ingress | Public routes | HTTPS via cert-manager |
| ConfigMap | Shared env config | — |
| Secret | DB/Redis credentials, WalletConnect projectId | — |

### Service Mesh — Istio (Ambient Mode)

Istio is deployed in **ambient mode** (no sidecars). Traffic is managed via ztunnel (L4) and waypoint proxies (L7) only where needed.

| Concern | Implementation |
|---------|---------------|
| mTLS | Automatic via ztunnel — all pod-to-pod traffic encrypted without sidecars |
| JWT authentication | `RequestAuthentication` + `AuthorizationPolicy` on the `api` waypoint proxy |
| Traffic policy | `AuthorizationPolicy` allows only `web` → `api`, `worker` → `api` (DB/Redis direct) |
| Observability | Istio telemetry (metrics, traces, access logs) via ztunnel + waypoint |

#### JWT Configuration

- JWT issuer and JWKS URI configured in `RequestAuthentication` resource
- `AuthorizationPolicy` on `api` requires valid JWT for all routes except health checks
- Worker-to-DB traffic is L4 only (no waypoint needed) — mTLS via ztunnel
- Frontend (`web`) calls `api` through the mesh — JWT token attached by the client

#### Ambient Mode Resources

| Resource | Purpose |
|----------|---------|
| `RequestAuthentication` | Validates JWT tokens on `api` |
| `AuthorizationPolicy` | Enforces JWT presence + allowed source namespaces |
| Waypoint proxy | L7 policy enforcement for `api` service only |
| Namespace label `istio.io/dataplane-mode: ambient` | Enrolls namespace in ambient mesh |

### Tooling

- Prisma ORM
- ESLint + Prettier
- Zod validation
- Jest for tests
- TanStack Query (frontend)
- Tailwind CSS v4
- **wagmi** + **viem** for wallet connection & on-chain reads
- **WalletConnect** (via wagmi connectors) for multi-wallet support
- **Playwright** for frontend e2e tests

---

## Domain Model

### Wallet

| Field | Type | Notes |
|-------|------|-------|
| address | string | EVM address (`0x...`, 40 hex chars) |
| label | string? | Optional human-readable name |
| createdAt | Date | |

### PortfolioSnapshot

| Field | Type | Notes |
|-------|------|-------|
| walletAddress | string | |
| totalUsdValue | number | Non-negative |
| timestamp | Date | |

### AssetBalance

| Field | Type | Notes |
|-------|------|-------|
| walletAddress | string | |
| chainId | number | Positive integer |
| tokenSymbol | string | |
| tokenAddress | string? | |
| amount | number | Non-negative |
| usdValue | number | Non-negative |

### ProtocolPosition

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| walletAddress | string | |
| chainId | number | Positive integer |
| protocol | string | e.g. "Aave", "Lido" |
| positionType | PositionType | Enum (see below) |
| assetSymbols | string[] | |
| usdValue | number | Non-negative |
| debtUsd | number? | Non-negative |
| apy | number? | Percentage |
| rewardsUsd | number? | Non-negative |
| healthFactor | number? | Positive |
| riskScore | number? | 0–100 |
| metadata | json? | Arbitrary extra data |
| updatedAt | Date | |

### Recommendation

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| walletAddress | string | |
| type | RecommendationType | Enum (see below) |
| title | string | |
| summary | string | |
| rationale | string[] | Array of reasoning steps |
| confidence | number | 0–1 |
| expectedImpactUsd | number? | |
| createdAt | Date | |

### AlertRule

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| walletAddress | string | |
| type | AlertType | Enum (see below) |
| threshold | number | |
| enabled | boolean | |

### AlertEvent

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| walletAddress | string | |
| ruleId | uuid | References AlertRule |
| message | string | |
| severity | AlertSeverity | Enum (see below) |
| createdAt | Date | |

### Enums

**PositionType**: `LENDING`, `BORROWING`, `LIQUIDITY_POOL`, `STAKING`, `FARMING`, `VAULT`

**RecommendationType**: `IDLE_STABLECOIN`, `HIGH_CONCENTRATION`, `LOW_HEALTH_FACTOR`, `UNCLAIMED_REWARDS`, `LOW_YIELD`

**AlertType**: `HEALTH_FACTOR`, `PORTFOLIO_DROP`, `YIELD_DROP`, `LARGE_BALANCE_CHANGE`

**AlertSeverity**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

### Interfaces

```ts
interface PortfolioProvider {
  getBalances(address: string): Promise<AssetBalance[]>;
  getPositions(address: string): Promise<ProtocolPosition[]>;
}
```

---

## API Endpoints (NestJS)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/wallets` | Register a wallet for tracking |
| GET | `/wallets/:address/portfolio` | Portfolio snapshot with balances |
| GET | `/wallets/:address/positions` | Protocol positions |
| GET | `/wallets/:address/recommendations` | Generated recommendations |
| GET | `/wallets/:address/alerts` | Alert event feed |

### Requirements

- DTO validation with Zod
- Proper error handling (NestJS exception filters)
- Service layer abstraction
- Repository pattern for data access

---

## Wallet Connection (wagmi + WalletConnect)

The frontend uses **wagmi** (with **viem** as the transport layer) to connect user wallets. This replaces manual address entry with a real Web3 connect flow.

### Supported connectors

| Connector | Notes |
|-----------|-------|
| Injected (MetaMask, Rabby, etc.) | Auto-detected browser wallets |
| WalletConnect v2 | QR code / deep-link for mobile & hardware wallets |
| Coinbase Wallet | Via wagmi's built-in connector |

### wagmi integration points

- **`apps/web`**: wagmi `WagmiProvider` wraps the app, configured with Ethereum mainnet chain
- **Connect button**: uses `useConnect()` / `useDisconnect()` hooks
- **Address display**: uses `useAccount()` for connected address & ENS
- **On-chain reads** (post-MVP): wagmi `useReadContract()` can replace mock provider for real balance reads

### Requirements

- wagmi config lives in `apps/web/src/lib/wagmi.ts`
- WalletConnect `projectId` loaded from `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` env var
- On successful connect, auto-register wallet via `POST /wallets` if not already tracked
- Show connected wallet address in the dashboard header
- Graceful fallback: manual address entry still works for read-only mode (no wallet needed)

---

## Data Provider (MVP)

No real blockchain connections. Mock provider returns:

- Fake token balances (ETH, USDC, WBTC, etc.)
- Fake Aave-like lending/borrowing position
- Fake staking position (e.g. Lido stETH)

Must implement the `PortfolioProvider` interface so real providers can be swapped in later.

---

## Data Provider (Real)

Replace mock provider with live on-chain data using **viem** for direct RPC reads and public APIs for DeFi protocol positions.

### Architecture

```
packages/provider-sdk/src/
├── mock-provider.ts          # Existing mock (kept for testing)
├── evm-provider.ts           # Real on-chain provider
├── providers/
│   ├── balance-fetcher.ts    # ERC-20 + native balance reads via viem
│   ├── aave-v3.ts            # Aave V3 position reader
│   ├── lido.ts               # Lido stETH position reader
│   └── defi-llama.ts         # DeFi Llama API for token prices + yield data
├── provider-factory.ts       # Updated: 'mock' | 'evm'
└── index.ts
```

### Token Balances (`balance-fetcher.ts`)

| Source | Method | Data |
|--------|--------|------|
| Native ETH | `viem` `getBalance()` | ETH balance |
| ERC-20 tokens | `viem` `readContract()` with ERC-20 ABI | Token balances for a configurable token list |
| Token prices | DeFi Llama `/prices/current` API | USD values for all tokens |

#### Configurable Token List

A default list of top ERC-20 tokens (USDC, USDT, DAI, WBTC, WETH, stETH, etc.) with their mainnet contract addresses. Stored in `packages/provider-sdk/src/config/tokens.ts`.

### Protocol Positions

#### Aave V3 (`aave-v3.ts`)

| Data | Source |
|------|--------|
| Supplied / borrowed assets | Aave V3 `Pool.getUserAccountData()` via viem |
| Per-asset positions | Aave V3 `UiPoolDataProvider` contract reads |
| Health factor | Returned by `getUserAccountData()` |
| APY | DeFi Llama `/pools` API filtered by Aave V3 |
| Rewards | Aave V3 `RewardsController.getAllUserRewards()` |

#### Lido (`lido.ts`)

| Data | Source |
|------|--------|
| stETH balance | ERC-20 `balanceOf()` on stETH contract |
| APY | DeFi Llama `/pools` API filtered by Lido |
| Position type | Always `STAKING` |

### Price & Yield Data (`defi-llama.ts`)

Uses the free [DeFi Llama API](https://defillama.com/docs/api) (no API key required):

| Endpoint | Purpose |
|----------|---------|
| `GET /prices/current/{coins}` | Current USD prices for tokens (format: `ethereum:{address}`) |
| `GET /pools` | APY data for DeFi protocol pools |

### Provider Configuration

```ts
interface EvmProviderConfig {
  rpcUrl: string;            // Ethereum RPC endpoint (Alchemy, Infura, or public)
  chainId: number;           // Default: 1 (mainnet)
  tokenList?: TokenConfig[]; // Override default token list
}
```

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `EVM_RPC_URL` | Ethereum JSON-RPC endpoint | Yes (for `evm` provider) |
| `PROVIDER_TYPE` | `mock` or `evm` | No (default: `mock`) |

### Requirements

- `EvmProvider` implements the same `PortfolioProvider` interface as `MockPortfolioProvider`
- Provider type selected via `PROVIDER_TYPE` env var in the provider factory
- All RPC calls use **viem** (already a dependency of `apps/web` via wagmi)
- Graceful error handling: if an individual protocol read fails, log and continue with remaining data
- Rate limiting: respect RPC and API rate limits with retry + backoff
- Caching: cache token prices for 60 seconds to avoid redundant API calls
- Must be unit tested with mocked RPC responses
- Integration test with a real RPC endpoint (skipped in CI unless `EVM_RPC_URL` is set)

---

## Recommendation Engine (V1)

Deterministic rules — no AI calls.

| # | Rule | Trigger |
|---|------|---------|
| 1 | Idle stablecoin | > $500 stablecoin not deployed in any protocol |
| 2 | High protocol concentration | > 50% of portfolio value in a single protocol |
| 3 | Low health factor | Health factor < 1.5 on any lending position |
| 4 | Unclaimed rewards | > $50 in unclaimed protocol rewards |
| 5 | Low yield | < 2% APY on stablecoin positions |

Each rule must:

- Produce structured `Recommendation` output
- Include `rationale` (array of reasoning strings)
- Include `confidence` score (0–1)
- Be unit tested

---

## Alert Engine (V1)

| Rule | Description |
|------|-------------|
| Health factor below threshold | Triggers when any position's health factor drops below the configured threshold |
| Portfolio drop > X% | Triggers when total portfolio USD value drops by more than threshold percentage |
| Yield drop | Triggers when APY on a position drops significantly |
| Large balance change | Triggers when a token balance changes by more than threshold |

### Requirements

- Evaluated via worker (cron job)
- Stores `AlertEvent` in database
- Simple logging (no external notifications in MVP)

---

## Worker (BullMQ)

| Job | Frequency | Description |
|-----|-----------|-------------|
| Snapshot | Every 5 minutes | Fetch balances + positions, store snapshot |
| Alert evaluation | After each snapshot | Run alert rules against latest data |
| Recommendation refresh | After each snapshot | Re-run recommendation engine |

---

## Frontend (Next.js)

### Pages

**`/dashboard`**
- Total portfolio value
- Asset allocation breakdown
- Protocol allocation breakdown

**`/positions`**
- List of ProtocolPosition cards
- Position type, protocol, USD value, APY, health factor

**`/recommendations`**
- List with title, summary, rationale, confidence, expected impact

**`/alerts`**
- Chronological alert feed with severity indicators

### Tech

- TanStack Query for data fetching
- Tailwind CSS v4 for styling
- wagmi + viem for wallet connection
- WalletConnect v2 for multi-wallet support
- Simple, functional UI (no design perfection needed)

---

## Testing

| Scope | Tool | Coverage |
|-------|------|----------|
| Recommendation rules | Jest | Unit tests for each of the 5 rules, including edge cases |
| Alert rules | Jest | Unit tests for each of the 4 rules, including edge cases |
| Domain services | Jest | Unit tests for portfolio calculations |
| API endpoints | Jest | Integration tests for all endpoints |
| Worker jobs | Jest | Unit tests for snapshot, recommendations, alerts processors |
| Frontend (e2e) | **Playwright** | End-to-end tests for dashboard, positions, recommendations, alerts pages |

### Playwright (Frontend E2E)

- Playwright tests live in `apps/web/e2e/`
- Tests run against the full stack (API + Web) with mock provider data
- Coverage targets:
  - Navigation between all pages
  - Dashboard loads and displays portfolio value
  - Positions page lists protocol positions
  - Recommendations page shows generated recommendations
  - Alerts page shows alert feed
  - Wallet connection flow (WalletConnect integration)
- Runs in CI via GitHub Actions after build step

---

## Coding Rules

- No business logic in controllers
- Domain logic only in `packages/domain`
- All external providers behind interfaces
- No `any` types
- No silent failures
- Every recommendation/alert rule must be test-covered

---

## Constraints

- No app-level auth in MVP — JWT enforcement handled at the mesh layer (Istio)
- No transaction execution / blockchain writes
- No AI-powered logic (deterministic rules only)
- Real blockchain reads are read-only (no state changes)

---

## Execution Order

| Step | Task | Status |
|------|------|--------|
| 1 | Initialize monorepo + folder structure | Done |
| 2 | Domain models | Done |
| 3 | Docker + Prisma schema + TypeScript | Done |
| 4 | (merged into step 3) | — |
| 5 | (merged into step 3) | — |
| 6 | Mock provider | Done |
| 7 | API (wallets + portfolio) | Done |
| 8 | Recommendation engine | Done |
| 9 | Alert engine | Done |
| 10 | Worker | Done |
| 11 | Frontend | Done |
| 12 | WalletConnect integration (wagmi + connectors) | Done |
| 13 | Tests | Done |
| 14 | Dockerfiles + K8s manifests | Done |
| 15 | Istio ambient mode + JWT policies | Done |
| 16 | CI/CD pipeline (GitHub Actions) | Done |
| 17 | README | Done |
| 18 | Real data provider (viem + DeFi Llama) | Done |
| 19 | Argo CD GitOps deployment | Done |
| 20 | Terraform modules (DOKS, DB, Redis, DOCR, DNS, VPC) | Done |
| 21 | Terragrunt environments (staging + production) | Done |
| **—** | **🚀 MILESTONE: First Deployment** | **—** |
| 22 | Provision staging infra (`terragrunt run-all apply`) | Pending |
| 23 | Install Istio ambient mode + cert-manager on cluster | Pending |
| 24 | Install Argo CD on cluster | Pending |
| 25 | Deploy to staging (first Argo CD sync) | Pending |
| 26 | Smoke test staging (verify all endpoints + UI) | Pending |
| 27 | Provision production infra | Pending |
| 28 | Deploy to production | Pending |
