# ── Stage 1: Install dependencies ──────────────────────────────────
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
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
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=deps /app/packages/domain/node_modules ./packages/domain/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/provider-sdk/node_modules ./packages/provider-sdk/node_modules
COPY --from=deps /app/packages/recommendation-engine/node_modules ./packages/recommendation-engine/node_modules
COPY --from=deps /app/packages/alert-engine/node_modules ./packages/alert-engine/node_modules

COPY tsconfig.base.json tsconfig.json nx.json pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/domain/ packages/domain/
COPY packages/shared/ packages/shared/
COPY packages/provider-sdk/ packages/provider-sdk/
COPY packages/recommendation-engine/ packages/recommendation-engine/
COPY packages/alert-engine/ packages/alert-engine/
COPY apps/api/prisma apps/api/prisma
COPY apps/worker/ apps/worker/

# Build workspace packages (CommonJS for Node.js runtime)
RUN node -e " \
  const pkgs = ['domain','shared','provider-sdk','recommendation-engine','alert-engine']; \
  const fs = require('fs'); \
  pkgs.forEach(p => { \
    const path = \`packages/\${p}/tsconfig.json\`; \
    const cfg = JSON.parse(fs.readFileSync(path)); \
    cfg.compilerOptions = cfg.compilerOptions || {}; \
    cfg.compilerOptions.module = 'commonjs'; \
    cfg.compilerOptions.moduleResolution = 'node'; \
    cfg.compilerOptions.outDir = './dist'; \
    cfg.compilerOptions.skipLibCheck = true; \
    cfg.compilerOptions.composite = false; \
    cfg.compilerOptions.declarationMap = false; \
    if (p === 'provider-sdk') cfg.compilerOptions.lib = ['ES2022', 'DOM', 'DOM.Iterable']; \
    cfg.exclude = ['**/*.spec.ts', 'node_modules', 'dist']; \
    fs.writeFileSync(path, JSON.stringify(cfg, null, 2)); \
  }); \
"
RUN cd packages/domain && npx tsc -p tsconfig.json
RUN cd packages/shared && npx tsc -p tsconfig.json
RUN cd packages/provider-sdk && npx tsc -p tsconfig.json
RUN cd packages/recommendation-engine && npx tsc -p tsconfig.json
RUN cd packages/alert-engine && npx tsc -p tsconfig.json

# Point each package's main to the compiled dist
RUN node -e " \
  const pkgs = ['domain','shared','provider-sdk','recommendation-engine','alert-engine']; \
  const fs = require('fs'); \
  pkgs.forEach(p => { \
    const path = \`packages/\${p}/package.json\`; \
    const pkg = JSON.parse(fs.readFileSync(path)); \
    pkg.main = './dist/index.js'; \
    pkg.types = './dist/index.d.ts'; \
    fs.writeFileSync(path, JSON.stringify(pkg, null, 2)); \
  }); \
"

# Generate Prisma client using installed version
RUN apps/api/node_modules/.bin/prisma generate --schema=apps/api/prisma/schema.prisma

# Build worker
RUN node -e " \
  const fs = require('fs'); \
  const cfg = JSON.parse(fs.readFileSync('apps/worker/tsconfig.json')); \
  cfg.compilerOptions.lib = ['ES2022', 'DOM', 'DOM.Iterable']; \
  cfg.compilerOptions.skipLibCheck = true; \
  cfg.exclude = (cfg.exclude || []).concat(['**/*.spec.ts']); \
  fs.writeFileSync('apps/worker/tsconfig.json', JSON.stringify(cfg, null, 2)); \
"
RUN cd apps/worker && npx tsc

# ── Stage 3: Production ──────────────────────────────────────────
FROM node:20-alpine AS production
RUN apk add --no-cache tini
WORKDIR /app

# Full pnpm node_modules (includes .pnpm virtual store with Prisma client)
COPY --from=build /app/node_modules ./node_modules

# Compiled worker
COPY --from=build /app/apps/worker/dist ./dist

# Prisma schema
COPY --from=build /app/apps/api/prisma ./prisma

# Compiled workspace packages
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

ENV NODE_ENV=production

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
