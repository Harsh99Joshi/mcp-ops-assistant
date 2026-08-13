# MCP Ops Assistant

TypeScript **remote MCP server** + **AI CLI client** for DevOps tool discovery and execution. Tools cover database querying, document retrieval, and system operations on **PostgreSQL**, packaged with **Docker**, and deployable to **AWS ECS** via **GitHub Actions** (Secrets Manager, CloudWatch, health checks).

See [PROJECT_SCOPE.md](./PROJECT_SCOPE.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [TOOLS.md](./TOOLS.md), [DEMO.md](./DEMO.md).

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

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Vitest |
| `pnpm build` | Build shared + apps |
| `pnpm docker:up` | Compose Postgres + server |

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
