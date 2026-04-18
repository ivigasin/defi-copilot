# CLAUDE.md — DeFi Portfolio Copilot

## Architecture

Nx monorepo (pnpm + Nx task runner) with three apps and five packages:

```
apps/web       → Next.js 16 (App Router) — frontend dashboard
apps/api       → NestJS — REST API (port 4000)
apps/worker    → BullMQ worker — background jobs

packages/domain               → core entities, enums, interfaces
packages/shared                → utilities, types, constants
packages/provider-sdk          → portfolio data providers (mock first)
packages/recommendation-engine → deterministic recommendation rules
packages/alert-engine          → alert evaluation rules
```

### Key rules

- **No business logic in controllers** — controllers delegate to services
- **Domain logic only in `packages/domain`**
- **All external providers behind interfaces** (`PortfolioProvider`)
- **No `any` types**
- **No silent failures** — always throw or log
- **Every recommendation/alert rule must be test-covered**

## Commands

```bash
pnpm install                # Install all dependencies
pnpm dev:web                # Next.js dev (port 3000)
pnpm dev:api                # NestJS dev (port 4000)
pnpm dev:worker             # Worker process
pnpm build                  # Build all packages (nx run-many)
pnpm test                   # Run all tests (nx run-many)
pnpm lint                   # Lint all packages (nx run-many)
pnpm docker:up              # Start Postgres + Redis
pnpm docker:down            # Stop infrastructure
pnpm db:generate            # Generate Prisma client
pnpm db:migrate             # Run Prisma migrations

# Nx-specific
npx nx graph                # Visualize dependency graph
pnpm affected:build         # Build only affected projects
pnpm affected:test          # Test only affected projects
npx nx run <project>:<target>  # Run a specific target
```

## Tech stack

- **TypeScript** (strict) everywhere
- **Prisma** ORM with PostgreSQL
- **BullMQ** + Redis for job queues
- **Nx** for monorepo orchestration, caching, and affected detection
- **Zod** for validation
- **Jest** for testing
- **TanStack Query** in frontend
- **Tailwind CSS v4** — config in CSS, not JS

### Important: Non-standard Next.js version

`apps/web` uses **Next.js 16.2.4** with **React 19.2.4**. Before writing Next.js-specific code, read relevant guides in `apps/web/node_modules/next/dist/docs/`.

## How to add a new protocol adapter

1. Create a class in `packages/provider-sdk/src/` implementing `PortfolioProvider`
2. Implement `getBalances()` and `getPositions()`
3. Register the adapter in the provider factory
4. Add tests

## How to add a new recommendation rule

1. Create a function in `packages/recommendation-engine/src/rules/`
2. It receives portfolio data, returns `Recommendation[]`
3. Each recommendation must include `rationale[]` and `confidence`
4. Register the rule in the engine's rule list
5. Add unit tests with edge cases

## Naming conventions

- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Interfaces: `PascalCase` (no `I` prefix)
- Enums: `PascalCase` with `PascalCase` members
- Functions/variables: `camelCase`
- Database tables: `snake_case` (Prisma maps automatically)



# Engineering rules

## Mandatory testing policy
For every code change, Claude must create or update tests at the same time as the implementation.

Required coverage unless explicitly impossible:
- unit tests for business logic
- integration tests for module/service/database/API boundaries
- e2e tests for user-facing or externally observable flows

Never mark a task complete until:
1. implementation is finished
2. unit tests are added/updated
3. integration tests are added/updated
4. e2e tests are added/updated when the change affects a real flow
5. the relevant test commands were run
6. failing tests were fixed or clearly reported

If a test type is not applicable, Claude must state:
- why it is not applicable
- what lower-level or higher-level test covers the risk instead

When making changes, proactively delegate to testing subagents.
