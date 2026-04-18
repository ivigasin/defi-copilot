# Test Coverage Plan

## Overview

Three tiers of testing, each with a clear scope and boundary.

| Tier | Runner | What it validates | Speed |
|------|--------|-------------------|-------|
| **Unit** | Jest | Pure logic in isolation — no I/O, no DB, no network | < 1s per suite |
| **Integration** | Jest + Prisma + Docker | Service layers with real DB, module wiring | < 10s per suite |
| **E2E** | Jest + Supertest | Full HTTP request/response cycle through the API | < 30s per suite |

---

## Unit Tests

### packages/domain

| File | Tests | Priority |
|------|-------|----------|
| `models.spec.ts` | Zod schema validation — valid inputs pass, invalid inputs rejected (bad address format, negative amounts, out-of-range confidence, missing required fields) | High |
| `enums.spec.ts` | Enum values match expected strings, exhaustive coverage | Low |

### packages/recommendation-engine

| Rule | Test Cases | Priority |
|------|------------|----------|
| Idle stablecoin | Stablecoin balance > $500 with no protocol position triggers recommendation; balance < $500 does not; non-stablecoin ignored; balance deployed in lending excluded | High |
| High concentration | Single protocol > 50% triggers; two protocols at 50% each does not; single-position portfolio (100%) triggers; empty portfolio does not | High |
| Low health factor | Health factor < 1.5 triggers; exactly 1.5 does not; position without health factor skipped; multiple positions, only unhealthy flagged | High |
| Unclaimed rewards | Rewards > $50 triggers; exactly $50 does not; zero rewards skipped; multiple positions with rewards aggregated per-position | High |
| Low yield | Stablecoin position with APY < 2% triggers; non-stablecoin with low APY ignored; no APY field skipped; exactly 2% does not trigger | High |
| Engine orchestration | All rules run and results aggregated; empty portfolio returns empty recommendations; deduplication if multiple rules flag same issue | Medium |

### packages/alert-engine

| Rule | Test Cases | Priority |
|------|------------|----------|
| Health factor below threshold | Current < threshold triggers; current >= threshold does not; no health factor skipped; disabled rule skipped | High |
| Portfolio drop | Value dropped by more than threshold % triggers; value increased does not; no previous snapshot skipped; exactly at threshold does not trigger | High |
| Yield drop | APY decreased significantly triggers; APY increased does not; position removed between snapshots handled | Medium |
| Large balance change | Balance change > threshold triggers; small change does not; new token appearance treated as large change; token disappearance treated as large change | Medium |
| Engine orchestration | Only enabled rules evaluated; events created with correct severity; multiple rules can fire for same wallet | Medium |

### packages/provider-sdk

| Test | Description | Priority |
|------|-------------|----------|
| Mock provider returns balances | Returns non-empty array of valid `AssetBalance` for any address | Medium |
| Mock provider returns positions | Returns non-empty array of valid `ProtocolPosition` for any address | Medium |
| Data conforms to schemas | All returned data passes Zod schema validation | Medium |

### packages/shared

| Test | Description | Priority |
|------|-------------|----------|
| Utility functions | Any shared helpers (formatting, calculations) produce correct output | As needed |

---

## Integration Tests

> Require Docker (Postgres + Redis) running via `pnpm docker:up`.

### apps/api — Service Layer

| Module | Tests | Priority |
|--------|-------|----------|
| WalletService | `create()` persists to DB and returns wallet; `create()` with duplicate address returns conflict error; `findByAddress()` returns null for unknown address | High |
| PortfolioService | `getPortfolio()` calls provider, stores snapshot, returns aggregated data; snapshot stored with correct totalUsdValue; balances and positions associated with wallet | High |
| RecommendationService | `generate()` calls engine with real provider data, persists results; subsequent call replaces stale recommendations; returns empty array for unknown wallet | Medium |
| AlertService | `evaluate()` runs enabled rules against latest snapshot; creates AlertEvent records; `getAlerts()` returns paginated results ordered by createdAt desc | Medium |

### apps/api — Repository Layer

| Repository | Tests | Priority |
|------------|-------|----------|
| WalletRepository | CRUD operations against real Postgres | High |
| SnapshotRepository | Insert snapshot + query latest by wallet | High |
| AlertRepository | Insert event + query by wallet with filters | Medium |
| RecommendationRepository | Upsert recommendations + query by wallet | Medium |

### apps/api — Prisma

| Test | Description | Priority |
|------|-------------|----------|
| Schema migration | `prisma migrate deploy` runs cleanly on empty DB | High |
| Seed data | Seed script inserts test wallet + mock data without errors | Medium |

### apps/worker

| Test | Description | Priority |
|------|-------------|----------|
| Snapshot job | Fetches from provider, stores snapshot in DB, triggers downstream jobs | Medium |
| Alert job | Reads latest snapshot, evaluates rules, stores events | Medium |
| Recommendation job | Reads latest data, runs engine, stores results | Medium |

---

## E2E Tests

> Full HTTP tests against a running NestJS server with real DB.

### Wallet Endpoints

| Test | Method | Path | Assertions |
|------|--------|------|------------|
| Register wallet | POST | `/wallets` | 201, returns wallet object with address and createdAt |
| Register duplicate wallet | POST | `/wallets` | 409 Conflict |
| Register invalid address | POST | `/wallets` | 400, validation error for non-EVM address |

### Portfolio Endpoints

| Test | Method | Path | Assertions |
|------|--------|------|------------|
| Get portfolio | GET | `/wallets/:address/portfolio` | 200, returns totalUsdValue, balances array, timestamp |
| Get portfolio unknown wallet | GET | `/wallets/:address/portfolio` | 404 |
| Get positions | GET | `/wallets/:address/positions` | 200, returns array of ProtocolPosition |
| Position structure | GET | `/wallets/:address/positions` | Each position has required fields: id, protocol, positionType, usdValue |

### Recommendation Endpoints

| Test | Method | Path | Assertions |
|------|--------|------|------------|
| Get recommendations | GET | `/wallets/:address/recommendations` | 200, returns array of Recommendation |
| Recommendation structure | GET | `/wallets/:address/recommendations` | Each has title, summary, rationale[], confidence (0–1) |
| Unknown wallet | GET | `/wallets/:address/recommendations` | 404 |

### Alert Endpoints

| Test | Method | Path | Assertions |
|------|--------|------|------------|
| Get alerts | GET | `/wallets/:address/alerts` | 200, returns array of AlertEvent |
| Alert structure | GET | `/wallets/:address/alerts` | Each has message, severity, createdAt |
| Empty alerts | GET | `/wallets/:address/alerts` | 200, returns empty array for wallet with no triggered alerts |
| Unknown wallet | GET | `/wallets/:address/alerts` | 404 |

### Error Handling

| Test | Description | Assertions |
|------|-------------|------------|
| Invalid JSON body | POST `/wallets` with malformed JSON | 400 |
| Missing required field | POST `/wallets` with empty body | 400 with field-level errors |
| Invalid address format | Any endpoint with non-hex address | 400 |

---

## Test Infrastructure

### Configuration

```
packages/domain/jest.config.ts          → unit
packages/recommendation-engine/jest.config.ts → unit
packages/alert-engine/jest.config.ts    → unit
packages/provider-sdk/jest.config.ts    → unit
apps/api/jest.config.ts                 → unit + integration
apps/api/test/jest-e2e.json             → e2e
apps/worker/jest.config.ts              → integration
```

### Commands

```bash
pnpm test                          # All unit tests (nx run-many)
pnpm test --filter=@defi-copilot/domain   # Domain unit tests only

# Integration + E2E (require Docker)
pnpm docker:up
pnpm --filter @defi-copilot/api test:e2e
pnpm docker:down
```

### Test Database

- Separate `defi_copilot_test` database created by test setup
- Each test suite runs `prisma migrate deploy` before tests
- Each test truncates all tables in `beforeEach`
- Connection string: `DATABASE_URL=postgresql://defi:defi_pass@localhost:5432/defi_copilot_test`

### Test Utilities

| Utility | Location | Purpose |
|---------|----------|---------|
| `createTestWallet()` | `packages/shared/src/test-utils.ts` | Returns a valid Wallet with random address |
| `createTestPosition()` | `packages/shared/src/test-utils.ts` | Returns a valid ProtocolPosition with sensible defaults |
| `createTestBalances()` | `packages/shared/src/test-utils.ts` | Returns an array of AssetBalance with common tokens |
| `createTestSnapshot()` | `packages/shared/src/test-utils.ts` | Returns a PortfolioSnapshot |

---

## Coverage Targets

| Package | Minimum Coverage |
|---------|-----------------|
| `packages/domain` | 90% |
| `packages/recommendation-engine` | 95% |
| `packages/alert-engine` | 95% |
| `packages/provider-sdk` | 80% |
| `apps/api` (services) | 80% |
| `apps/api` (controllers) | 70% |
| `apps/worker` | 70% |

### Jest Coverage Configuration

Add to each `jest.config.ts`:

```ts
collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/index.ts'],
coverageThresholds: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

---

## What Is NOT Tested in MVP

- Frontend components (no React Testing Library yet)
- Real blockchain provider calls
- Redis connection edge cases
- BullMQ retry/failure scenarios beyond basic happy path
- Performance / load testing
- Auth / authorization (not implemented)
