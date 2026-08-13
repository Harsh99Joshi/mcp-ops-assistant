# Tools

## query_database

- **Type:** read
- **Purpose:** Run a read-only SQL query against allowlisted tables.
- **Input:** `{ "sql": string, "limit"?: number }`
- **Output:** `{ columns: string[], rows: Record<string, unknown>[], rowCount: number }`
- **Errors:** `INVALID_SQL`, `FORBIDDEN_STATEMENT`, `TABLE_NOT_ALLOWED`, `DATABASE_UNAVAILABLE`, `QUERY_TOO_BROAD`

## search_documents

- **Type:** read
- **Purpose:** Full-text search over the `documents` table (runbooks, notes).
- **Input:** `{ "query": string, "limit"?: number }`
- **Output:** `{ query: string, count: number, results: { id, title, snippet, category, rank }[] }`
- **Errors:** `QUERY_TOO_SHORT`, `DATABASE_UNAVAILABLE`

## get_system_info

- **Type:** read
- **Purpose:** Return service inventory health plus live process metrics for the MCP host.
- **Input:** `{ "serviceName"?: string }`
- **Output:** `{ checkedAt, host: { uptimeSeconds, memoryMb, nodeVersion }, services: [...] }`
- **Errors:** `SERVICE_NOT_FOUND`, `DATABASE_UNAVAILABLE`
