import { z } from 'zod';

const EnvSchema = z.object({
  MCP_SERVER_URL: z.string().url().default('http://localhost:3001/mcp'),
  MCP_SERVER_SECRET: z.string().min(8).default('dev-secret-change-me'),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-20250514'),
});

export type ClientEnv = z.infer<typeof EnvSchema>;

export function loadClientEnv(env: NodeJS.ProcessEnv = process.env): ClientEnv {
  return EnvSchema.parse(env);
}
