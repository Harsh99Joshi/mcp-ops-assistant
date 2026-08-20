# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV CI=true
RUN corepack enable && corepack prepare pnpm@11.20.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/mcp-server/package.json apps/mcp-server/
COPY apps/mcp-client/package.json apps/mcp-client/
RUN pnpm install --frozen-lockfile
COPY packages/shared packages/shared
COPY apps/mcp-server apps/mcp-server
RUN pnpm --filter @mcp-ops/mcp-server... build \
 && pnpm --filter @mcp-ops/mcp-server deploy --prod --legacy /deploy \
 && rm -rf /deploy/node_modules/@mcp-ops/shared \
 && mkdir -p /deploy/node_modules/@mcp-ops/shared \
 && cp -r packages/shared/dist packages/shared/package.json /deploy/node_modules/@mcp-ops/shared/

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV CI=true
RUN useradd --create-home --uid 1001 mcp
COPY --from=build /deploy /app
USER mcp
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
