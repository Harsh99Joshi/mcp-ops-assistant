import { loadEnv } from './config.js';
import { createPool } from './db.js';
import { createLogger } from './logger.js';
import { createApp } from './app.js';

async function main() {
  const env = loadEnv();
  const logger = createLogger(env);
  const db = createPool(env.DATABASE_URL);

  const app = createApp(env, db, logger);
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'MCP server listening');
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down');
    server.close();
    await db.end();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
