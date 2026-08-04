# Tools (v1)

## get_service_status

- **Type:** read
- **Approval:** not required
- **Purpose:** Return current status for one service.
- **Input:** `{ "serviceName": string }`
- **Output:** `{ serviceName, status, version, lastDeployment, checkedAt }`
- **Errors:** `SERVICE_NOT_FOUND`, `INVALID_SERVICE_NAME`, `STATUS_PROVIDER_UNAVAILABLE`

## search_logs

- **Type:** read
- **Approval:** not required
- **Purpose:** Search recent logs for a service.
- **Input:** `{ serviceName, query, limit (1–100), startTime?, endTime? }`
- **Output:** `{ serviceName, query, count, entries[] }`
- **Errors:** `SERVICE_NOT_FOUND`, `INVALID_TIME_RANGE`, `LOG_PROVIDER_UNAVAILABLE`, `QUERY_TOO_LONG`

## create_incident

- **Type:** write
- **Approval:** required (CLI confirmation in v1)
- **Purpose:** Create an incident record (mock store in v1).
- **Input:** `{ serviceName, severity, summary, details? }`
- **Output:** `{ incidentId, status: "created", createdAt }`
- **Errors:** `SERVICE_NOT_FOUND`, `INVALID_SEVERITY`, `DUPLICATE_INCIDENT`, `DATABASE_UNAVAILABLE`
