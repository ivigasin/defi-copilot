# ── Stage 1: Install dependencies ──────────────────────────────────
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/worker/package.json apps/worker/package.json
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
COPY --from=deps /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=deps /app/packages/domain/node_modules ./packages/domain/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/provider-sdk/node_modules ./packages/provider-sdk/node_modules
COPY --from=deps /app/packages/recommendation-engine/node_modules ./packages/recommendation-engine/node_modules
COPY --from=deps /app/packages/alert-engine/node_modules ./packages/alert-engine/node_modules

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json tsconfig.json nx.json ./
COPY apps/worker/ apps/worker/
COPY packages/domain/ packages/domain/
COPY packages/shared/ packages/shared/
COPY packages/provider-sdk/ packages/provider-sdk/
COPY packages/recommendation-engine/ packages/recommendation-engine/
COPY packages/alert-engine/ packages/alert-engine/

# Generate Prisma client (worker uses @prisma/client)
COPY apps/api/prisma apps/api/prisma
RUN cd apps/api && npx prisma generate

# Build workspace packages first
RUN cd packages/domain && npx tsc --outDir dist
RUN cd packages/shared && npx tsc --outDir dist
RUN cd packages/provider-sdk && npx tsc --outDir dist
RUN cd packages/recommendation-engine && npx tsc --outDir dist
RUN cd packages/alert-engine && npx tsc --outDir dist

# Build worker
RUN cd apps/worker && npx tsc

# ── Stage 3: Production ──────────────────────────────────────────
FROM node:20-alpine AS production
RUN apk add --no-cache tini
WORKDIR /app

# Copy compiled output
COPY --from=build /app/apps/worker/dist ./dist
COPY --from=build /app/apps/worker/node_modules ./node_modules

# Copy compiled workspace packages (resolved via node_modules symlinks)
COPY --from=build /app/packages/domain/dist ./packages/domain/dist
COPY --from=build /app/packages/domain/package.json ./packages/domain/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/provider-sdk/dist ./packages/provider-sdk/dist
COPY --from=build /app/packages/provider-sdk/package.json ./packages/provider-sdk/package.json
COPY --from=build /app/packages/recommendation-engine/dist ./packages/recommendation-engine/dist
COPY --from=build /app/packages/recommendation-engine/package.json ./packages/recommendation-engine/package.json
COPY --from=build /app/packages/alert-engine/dist ./packages/alert-engine/dist
COPY --from=build /app/packages/alert-engine/package.json ./packages/alert-engine/package.json

# Copy Prisma client
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/worker/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/apps/worker/node_modules/@prisma ./node_modules/@prisma

ENV NODE_ENV=production

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
