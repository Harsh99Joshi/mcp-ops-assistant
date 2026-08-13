import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(0).default(3001),
  LOG_LEVEL: z.string().default('info'),
  DATABASE_URL: z
    .string()
    .default('postgresql://mcp:mcp@localhost:5432/mcp_ops'),
  MCP_SERVER_SECRET: z.string().min(8).default('dev-secret-change-me'),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(env: NodeJS.ProcessEnv = process.env): Env {
  return EnvSchema.parse(env);
}
