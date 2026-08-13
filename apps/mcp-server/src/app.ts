import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import type { Env } from './config.js';
import { checkDb, type Db } from './db.js';
import type { Logger } from './logger.js';
import { createMcpServer } from './mcp.js';

const SECRET_HEADER = 'x-mcp-secret';

export function createApp(env: Env, db: Db, logger: Logger): Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', async (_req, res) => {
    const dbOk = await checkDb(db);
    const status = dbOk ? 200 : 503;
    res.status(status).json({
      status: dbOk ? 'ok' : 'degraded',
      db: dbOk ? 'up' : 'down',
      uptimeSeconds: Math.round(process.uptime()),
    });
  });

  app.use('/mcp', (req: Request, res: Response, next: NextFunction) => {
    const secret = req.header(SECRET_HEADER);
    if (!secret || secret !== env.MCP_SERVER_SECRET) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or missing MCP secret' } });
      return;
    }
    next();
  });

  // Stateless streamable HTTP: new transport per request (works behind ALB)
  app.all('/mcp', async (req: Request, res: Response) => {
    try {
      const server = createMcpServer(db, logger);
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await server.connect(transport);

      // For initialize-style clients that still send session headers, accept body as-is
      if (req.method === 'POST' && isInitializeRequest(req.body)) {
        logger.info({ requestId: randomUUID() }, 'MCP initialize');
      }

      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      logger.error({ err }, 'MCP request failed');
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  });

  return app;
}
