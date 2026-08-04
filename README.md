# MCP Ops Assistant

Remote TypeScript MCP server + CLI client. Focus: tool contracts, HTTP MCP, auth, Docker, and cloud deploy.

See [PROJECT_SCOPE.md](./PROJECT_SCOPE.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).

## Requirements

- Node.js 22+ (see `.nvmrc`)
- pnpm 11+

## Setup

```bash
pnpm install
```

Packages will be added as phases progress (`apps/mcp-server`, `apps/mcp-client`, `packages/shared`).

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Run tests |
| `pnpm build` | Build all packages |

## Environment

Copy `.env.example` when it exists. Never commit `.env`.

## Current phase

Phase 0 complete → next: Phase 1 (TypeScript foundation) / Phase 2 (monorepo apps).
