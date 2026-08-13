# Architecture

```
┌──────────────────────┐   Anthropic API    ┌─────────────────────┐
│  AI CLI Client       │◄──────────────────►│  Claude (tool loop) │
│  apps/mcp-client     │                    └─────────────────────┘
│                      │
│  list-tools / ask /  │  HTTPS + X-MCP-Secret
│  call-tool           │──────────────────────────────────────────┐
└──────────────────────┘                                          │
                                                                  ▼
                                                    ┌─────────────────────┐
                                                    │  MCP Server         │
                                                    │  apps/mcp-server    │
                                                    │  /mcp  /health      │
                                                    │                     │
                                                    │  query_database    │
                                                    │  search_documents   │
                                                    │  get_system_info    │
                                                    └──────────┬──────────┘
                                                               │
                                                               ▼
                                                    ┌─────────────────────┐
                                                    │  PostgreSQL         │
                                                    │  services           │
                                                    │  documents          │
                                                    │  tool_executions    │
                                                    └─────────────────────┘
```

## Trust boundaries

1. **User → CLI** — local process; prompts drive the LLM tool loop.
2. **CLI → MCP server** — shared secret header; secret never committed.
3. **MCP tools → Postgres** — read-focused tools; `query_database` allowlists tables and forbids mutating SQL.
4. **AWS** — task secrets from Secrets Manager; logs to CloudWatch; ALB health on `/health`.

## Deployed shape

- **Local:** docker-compose (Postgres + mcp-server); client on host.
- **AWS:** ECS Fargate task behind ALB; RDS Postgres; ECR image; GitHub Actions deploy.
