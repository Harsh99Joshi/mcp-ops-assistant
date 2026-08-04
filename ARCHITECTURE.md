# Architecture (v1)

```
┌─────────────────────┐         HTTPS + shared secret         ┌─────────────────────┐
│   MCP CLI Client    │ ────────────────────────────────────► │    MCP Server       │
│  apps/mcp-client    │   MCP over Streamable HTTP            │  apps/mcp-server    │
│                     │ ◄──────────────────────────────────── │                     │
│  list-tools         │                                       │  get_service_status │
│  call tools         │                                       │  search_logs        │
│  confirm writes     │                                       │  create_incident    │
└─────────────────────┘                                       │         │           │
                                                              │         ▼           │
                                                              │  mock fixtures      │
                                                              └─────────────────────┘
```

## Trust boundaries

1. **User → CLI** — local process; user must confirm write tools.
2. **CLI → MCP server** — authenticated with shared secret; never expose secret in git.
3. **MCP tools → fixtures** — mock data only in v1; no real infra APIs.

## Deployed shape (v1)

- MCP server: one container on Railway / Render / Fly (HTTPS).
- MCP client: runs on developer machine against the remote URL.
- Optional later: second service or AI backend that reuses the same MCP client library.
