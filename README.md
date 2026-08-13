# MCP Ops Assistant

A TypeScript **Model Context Protocol (MCP)** platform for DevOps assistance: a remote MCP server exposes tools over HTTP, and an AI CLI client discovers and runs those tools—optionally through an LLM tool-calling loop.

## What this project does

In short, it lets an AI client ask operational questions and answer them by calling real tools on a remote server backed by PostgreSQL—not by hallucinating infrastructure state.

### Core pieces

| Piece | Role |
|-------|------|
| **MCP server** (`apps/mcp-server`) | Remote HTTP service at `/mcp`. Registers tools, validates inputs with Zod, runs them against Postgres, returns structured results. Exposes `/health` for load balancers and ECS. |
| **AI client** (`apps/mcp-client`) | CLI that connects to the remote server, lists tools, calls tools directly, or runs an Anthropic Claude loop (`ask`) so the model picks and executes tools. |
| **Shared contracts** (`packages/shared`) | Tool schemas, error codes, and SQL safety helpers shared by server (and tests). |
| **PostgreSQL** | Source of truth for service inventory, runbook documents (full-text search), and optional tool-execution audit rows. |
| **Docker** | Multi-stage server image + local `docker-compose` (Postgres + server). |
| **CI/CD** | GitHub Actions: typecheck, test, Docker build on PRs; on `main`, push to ECR and deploy to ECS. |
| **AWS** | Terraform for ECS Fargate, ALB, RDS Postgres, ECR, Secrets Manager, and CloudWatch Logs. |

### What you can do with it

1. **Discover tools** — Client asks the server what tools exist (`list-tools`); no hardcoded tool list required on the client.
2. **Query the database safely** — `query_database` runs read-only SQL against allowlisted tables (`services`, `documents`, `tool_executions`). Mutating/DDL SQL is rejected.
3. **Search ops documents** — `search_documents` full-text searches seeded runbooks (deploy, incidents, secrets rotation, local workflow).
4. **Check system / service health** — `get_system_info` returns service inventory status plus live host metrics (uptime, memory, Node version).
5. **Ask in natural language** — With `ANTHROPIC_API_KEY`, `ask "..."` lets Claude choose tools, call the MCP server, and summarize the answer.
6. **Run remotely with auth** — Client ↔ server use a shared secret header (`X-MCP-Secret`). In AWS, that secret (and `DATABASE_URL`) come from Secrets Manager.
7. **Deploy like production** — Containerized server, health checks on `/health`, CloudWatch logs, GitHub Actions → ECR → ECS.

### How a request flows

```
You → AI CLI → (optional) Claude picks tools
                    ↓
              MCP over HTTPS + shared secret
                    ↓
              MCP server validates + executes tool
                    ↓
              PostgreSQL (services / documents / …)
                    ↓
              Structured JSON result → CLI / model answer
```

### What it is not

- Not a full chat web UI (CLI only for speed)
- Not OAuth/RBAC or multi-tenant auth (shared secret)
- Not a general SQL console (allowlisted, read-only)

More detail: [PROJECT_SCOPE.md](./PROJECT_SCOPE.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [TOOLS.md](./TOOLS.md) · [DEMO.md](./DEMO.md)

## Requirements

- Node.js 22+
- pnpm 11+
- Docker (local Postgres + server)
- Optional: Anthropic API key for `ask`
- Optional: AWS account + Terraform for ECS deploy

## Quick start (local)

```bash
cp .env.example .env
pnpm install
pnpm build

# Option A — Docker Compose (Postgres + MCP server)
# Requires Docker Desktop / Engine on PATH
docker compose -f infrastructure/docker/docker-compose.yml up --build -d

# Option B — Host server + existing Postgres
# Create DB user/db, then:
#   pnpm seed
#   pnpm dev:server

# Verify health + remote MCP tool path (also covered by vitest e2e)
curl -s http://localhost:3001/health
pnpm --filter @mcp-ops/mcp-client start list-tools
pnpm --filter @mcp-ops/mcp-client start call-tool search_documents "{\"query\":\"ECS\"}"
pnpm --filter @mcp-ops/mcp-client start call-tool get_system_info "{}"
pnpm --filter @mcp-ops/mcp-client start call-tool query_database "{\"sql\":\"SELECT name, status FROM services\",\"limit\":10}"

# LLM tool loop (needs ANTHROPIC_API_KEY in .env)
pnpm --filter @mcp-ops/mcp-client start ask "What documents mention ECS Fargate?"
```

Automated proof without Docker: `pnpm --filter @mcp-ops/mcp-server test` runs HTTP MCP e2e (auth, list-tools, tool calls).

## Tools

| Tool | Purpose |
|------|---------|
| `query_database` | Read-only SQL against allowlisted tables |
| `search_documents` | Full-text search over runbooks |
| `get_system_info` | Service inventory + live host metrics |

## Repo layout

```
apps/mcp-server/              # Remote HTTP MCP server + tools + /health
apps/mcp-client/              # AI CLI (list / call / ask)
packages/shared/              # Zod schemas + SQL guard
infrastructure/docker/        # Dockerfile, compose, Postgres seed
infrastructure/terraform/     # ECS, ALB, RDS, Secrets Manager, CloudWatch
infrastructure/aws/           # ECS task-definition template for GHA deploy
.github/workflows/            # ci.yml + deploy.yml
```

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Vitest (including HTTP MCP e2e) |
| `pnpm build` | Build shared + apps |
| `pnpm docker:up` | Compose Postgres + server |
| `pnpm seed` | Apply schema/seed SQL to `DATABASE_URL` |

## AWS deploy

1. `cd infrastructure/terraform && terraform apply`
2. Push image to ECR / let `.github/workflows/deploy.yml` run on `main`
3. Seed RDS with `infrastructure/docker/init.sql`
4. Point client at `terraform output -raw mcp_url` with secret from Secrets Manager

Details: [infrastructure/terraform/README.md](./infrastructure/terraform/README.md).

## Tear down (save money)

```bash
cd infrastructure/terraform && terraform destroy
docker compose -f infrastructure/docker/docker-compose.yml down -v
```
