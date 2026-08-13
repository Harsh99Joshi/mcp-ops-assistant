# Project Scope — MCP Ops Assistant

## One-paragraph description

Build and deploy a remote Model Context Protocol (MCP) platform in TypeScript: an HTTP MCP server exposing modular DevOps tools, plus an AI CLI client that discovers those tools and executes them via an LLM tool loop. Tools cover database querying, document retrieval, and system operations, backed by PostgreSQL, packaged with Docker, and deployed to AWS ECS with GitHub Actions, Secrets Manager, CloudWatch, and health checks.

## In scope

| Area | Detail |
|------|--------|
| MCP server | Streamable HTTP at `/mcp`, shared-secret auth, `/health` |
| AI client | CLI: list tools, call tools, Anthropic tool-calling loop |
| Tools | `query_database`, `search_documents`, `get_system_info` |
| Data | PostgreSQL (seeded services + documents) |
| Containers | Docker multi-stage image + local docker-compose |
| CI/CD | GitHub Actions: typecheck, test, build, push ECR, deploy ECS |
| AWS | ECS Fargate, ALB, RDS Postgres, Secrets Manager, CloudWatch |

## Out of scope

Next.js chat UI, OAuth/RBAC, Kubernetes, Redis/vector DB, multi-agent routing, multi-AZ HA.

## Definition of done

- [x] Separate TypeScript MCP server and AI CLI client
- [x] Three Zod-validated tools backed by PostgreSQL
- [x] Server speaks MCP over HTTP with shared-secret auth
- [x] Docker image + compose (server + Postgres)
- [x] GitHub Actions CI/CD to AWS ECS
- [x] Secrets Manager, CloudWatch logs, ALB/ECS health checks
- [x] README + DEMO runbooks

## Stack

| Decision | Choice |
|----------|--------|
| Language | TypeScript (strict) |
| Runtime | Node.js 22 LTS |
| Package manager | pnpm workspace |
| MCP SDK | `@modelcontextprotocol/sdk` |
| Validation | Zod |
| Logging | Pino |
| Testing | Vitest |
| DB | PostgreSQL + `pg` |
| LLM | Anthropic Claude |
| Containers | Docker |
| IaC | Terraform |
| Hosting | AWS ECS Fargate |

## Repo layout

```
apps/mcp-server/
apps/mcp-client/
packages/shared/
infrastructure/docker/
infrastructure/terraform/
.github/workflows/
```
