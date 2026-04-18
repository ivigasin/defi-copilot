# ── Stage 1: Install dependencies ──────────────────────────────────
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/provider-sdk/package.json packages/provider-sdk/package.json
COPY packages/recommendation-engine/package.json packages/recommendation-engine/package.json
COPY packages/alert-engine/package.json packages/alert-engine/package.json

RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────────────────
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/domain/node_modules ./packages/domain/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/provider-sdk/node_modules ./packages/provider-sdk/node_modules
COPY --from=deps /app/packages/recommendation-engine/node_modules ./packages/recommendation-engine/node_modules
COPY --from=deps /app/packages/alert-engine/node_modules ./packages/alert-engine/node_modules

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json tsconfig.json nx.json ./
COPY apps/api/ apps/api/
COPY packages/domain/ packages/domain/
COPY packages/shared/ packages/shared/
COPY packages/provider-sdk/ packages/provider-sdk/
COPY packages/recommendation-engine/ packages/recommendation-engine/
COPY packages/alert-engine/ packages/alert-engine/

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build API (webpack bundles workspace packages)
RUN cd apps/api && npx nest build

# ── Stage 3: Production ──────────────────────────────────────────
FROM node:20-alpine AS production
RUN apk add --no-cache tini
WORKDIR /app

# Copy Prisma schema + generated client
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/apps/api/node_modules/@prisma ./node_modules/@prisma

# Copy webpack bundle (single file)
COPY --from=build /app/apps/api/dist ./dist

ENV NODE_ENV=production
EXPOSE 4000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
