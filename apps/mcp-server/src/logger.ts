import pino from 'pino';
import type { Env } from './config.js';

export function createLogger(env: Env) {
  return pino({
    level: env.LOG_LEVEL,
    base: { service: 'mcp-server' },
  });
}

export type Logger = ReturnType<typeof createLogger>;
