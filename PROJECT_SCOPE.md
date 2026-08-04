# Project Scope — MCP Ops Assistant (v1)

## One-paragraph description

Build and deploy a remote Model Context Protocol (MCP) server in TypeScript that exposes a small set of operations tools, plus a separate TypeScript MCP client (CLI first) that discovers and invokes those tools over HTTP. The focus is deployment engineering: validated tool contracts, service-to-service authentication, Docker packaging, and a public HTTPS deployment. Mock/fixture data backs the tools in v1; a full LLM chat UI is out of scope until the remote MCP path works.

## Version 1 focus

| In scope | Out of scope (later) |
|----------|----------------------|
| MCP server (Streamable HTTP) | Next.js chat UI / LLM tool loop |
| MCP CLI client | OAuth, RBAC, Kubernetes |
| 3 tools with Zod schemas | Terraform / AWS ECS |
| Mock fixture data | Full observability stack |
| Docker for the server | Redis, vector DB, multi-agent |
| Remote HTTPS deploy | Complex multi-agent routing |
| Shared-secret auth (client ↔ server) | Production monitoring integrations |

## First three tools

| Tool | Type | Approval | Purpose |
|------|------|----------|---------|
| `get_service_status` | Read | No | Return status for one named service |
| `search_logs` | Read | No | Search recent log lines for a service |
| `create_incident` | Write | Yes (CLI confirm) | Create an incident record (in-memory/mock in v1) |

## Data source (v1)

Mock JSON fixtures in memory / local files. No PostgreSQL required for v1.

## Minimum client (v1)

CLI that can:

- List tools from the remote MCP server
- Call each of the three tools
- Require explicit confirmation before `create_incident`
- Read `MCP_SERVER_URL` and auth secret from environment
- Show structured success/error output

## First deployment target

Pick one managed container platform for v1 (decide in Phase 9):

- Railway, Render, or Fly.io (recommended first)
- MCP server at `https://<host>/mcp`
- Client runs locally (or second service later) against that URL

## Database entities (v1)

None required. Optional later: `incidents`, `tool_executions`.

## Definition of “version 1 complete”

- [ ] MCP server and MCP CLI client are separate TypeScript apps
- [ ] Tools use Zod-validated inputs and structured outputs
- [ ] Server speaks MCP over HTTP (not stdio-only)
- [ ] CLI lists tools and calls all three successfully locally
- [ ] Write tool (`create_incident`) requires explicit confirmation
- [ ] Server Docker image builds and runs
- [ ] Server deployed remotely with HTTPS
- [ ] CLI can call the remote server (no localhost in production config)
- [ ] Shared secret required between client and server
- [ ] Health endpoint exists
- [ ] Basic CI: install, typecheck, test, Docker build
- [ ] README documents setup, env vars, and demo commands

## Stack decisions (locked for v1)

| Decision | Choice |
|----------|--------|
| Language | TypeScript (strict) |
| Runtime | Node.js 22 LTS |
| Package manager | pnpm (workspace monorepo) |
| MCP SDK | Official TypeScript MCP SDK |
| Validation | Zod |
| Logging | Pino |
| Testing | Vitest |
| Containers | Docker |
| ORM / DB | Deferred past v1 |
| Web/AI UI | Deferred past v1 |
| Hosting | Decide at first remote deploy |

## Repo layout (target)

```
mcp-ops-assistant/
├── apps/
│   ├── mcp-server/
│   └── mcp-client/          # CLI
├── packages/
│   └── shared/              # tool schemas, errors
├── infrastructure/docker/
├── roadmap/
├── PROJECT_SCOPE.md
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Current phase

**Phase 0 — Define project scope** (this document).
