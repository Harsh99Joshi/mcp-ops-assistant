-- MCP Ops Assistant schema + seed
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down', 'unknown')),
  version TEXT NOT NULL,
  environment TEXT NOT NULL,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  body TEXT NOT NULL,
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_search_idx ON documents USING GIN (search_vector);

CREATE TABLE IF NOT EXISTS tool_executions (
  id SERIAL PRIMARY KEY,
  tool_name TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO services (name, status, version, environment, last_checked_at) VALUES
  ('payments-api', 'healthy', '2.4.1', 'production', NOW() - INTERVAL '2 minutes'),
  ('checkout-web', 'healthy', '1.18.0', 'production', NOW() - INTERVAL '1 minutes'),
  ('image-processor', 'degraded', '0.9.3', 'production', NOW() - INTERVAL '5 minutes'),
  ('mcp-ops-server', 'healthy', '1.0.0', 'production', NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO documents (title, category, body) VALUES
  (
    'ECS Fargate Deploy Runbook',
    'deploy',
    'Deploy MCP services to AWS ECS Fargate. Push image to ECR, update task definition, force new deployment. Health checks hit /health. Secrets come from AWS Secrets Manager. CloudWatch captures container logs.'
  ),
  (
    'PostgreSQL Read-Only Query Guide',
    'database',
    'Use query_database with SELECT against allowlisted tables: services, documents, tool_executions. Never run DDL. Prefer LIMIT. Monitor slow queries in CloudWatch when RDS Performance Insights is enabled.'
  ),
  (
    'Incident Response: Degraded Image Processor',
    'incident',
    'If image-processor is degraded, check queue depth, CPU throttling on Fargate, and recent deployments. Search documents for timeout errors. Scale the ECS service desired count if CPU > 80%.'
  ),
  (
    'MCP Shared Secret Rotation',
    'security',
    'Rotate MCP_SERVER_SECRET in AWS Secrets Manager, update ECS task definition revision, redeploy. Clients must pick up the new secret from their environment. Never commit secrets to git.'
  ),
  (
    'Local Docker Compose Workflow',
    'local',
    'Run docker compose up to start PostgreSQL and the MCP server. Point MCP_SERVER_URL to http://localhost:3001/mcp and use the shared secret from .env. AI client discovers tools over Streamable HTTP.'
  );
