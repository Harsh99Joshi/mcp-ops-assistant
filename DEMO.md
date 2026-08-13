# Demo script (60–90s)

Use this in interviews or screen recordings.

## Local path

```bash
# 1) Start stack
docker compose -f infrastructure/docker/docker-compose.yml up --build -d
curl -s http://localhost:3001/health

# 2) Discover tools
pnpm --filter @mcp-ops/mcp-client start list-tools

# 3) Database tool
pnpm --filter @mcp-ops/mcp-client start call-tool query_database "{\"sql\":\"SELECT name, status, version FROM services\",\"limit\":10}"

# 4) Document retrieval
pnpm --filter @mcp-ops/mcp-client start call-tool search_documents "{\"query\":\"Secrets Manager\"}"

# 5) System operations snapshot
pnpm --filter @mcp-ops/mcp-client start call-tool get_system_info "{}"

# 6) AI client tool loop (optional)
set ANTHROPIC_API_KEY=sk-ant-...
pnpm --filter @mcp-ops/mcp-client start ask "Which services are degraded and what runbook applies?"
```

## Talking points (resume-aligned)

1. **Remote MCP** — Streamable HTTP at `/mcp`, not stdio-only; client discovers tools dynamically.
2. **Modular tools** — Zod-validated `query_database`, `search_documents`, `get_system_info` on Node + Postgres.
3. **Secure client-server execution** — shared secret header; SQL allowlist + read-only guard.
4. **Containers** — multi-stage Docker image; compose for local Postgres + server.
5. **CI/CD → ECS** — GitHub Actions typecheck/test/build; deploy workflow pushes ECR and updates ECS.
6. **Observability & secrets** — CloudWatch logs, ALB/ECS `/health` checks, Secrets Manager for `DATABASE_URL` + `MCP_SERVER_SECRET`.

## Project blurb (LinkedIn / GitHub)

> Built a TypeScript MCP platform with a remote HTTP MCP server and AI CLI client for LLM-driven tool discovery and execution. Containerized modular tools for database querying, document retrieval, and system operations on Node.js, Docker, and PostgreSQL. Implemented GitHub Actions CI/CD to AWS ECS with Secrets Manager, CloudWatch logging, and health checks.
