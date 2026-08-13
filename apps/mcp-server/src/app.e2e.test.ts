import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { Server } from 'node:http';
import { createApp } from './app.js';
import { loadEnv } from './config.js';
import type { Db } from './db.js';
import { createLogger } from './logger.js';

function createMockDb(): Db {
  const services = [
    {
      name: 'payments-api',
      status: 'healthy',
      version: '2.4.1',
      environment: 'production',
      last_checked_at: new Date(),
    },
    {
      name: 'image-processor',
      status: 'degraded',
      version: '0.9.3',
      environment: 'production',
      last_checked_at: new Date(),
    },
  ];

  return {
    query: async (sql: string, params?: unknown[]) => {
      const text = sql.toLowerCase();
      if (text.includes('select 1')) {
        return { rows: [{ '?column?': 1 }], fields: [], rowCount: 1 };
      }
      if (text.includes('from services')) {
        let rows = services;
        if (params?.[0]) {
          rows = services.filter((s) => s.name === params[0]);
        }
        return {
          rows,
          fields: [
            { name: 'name' },
            { name: 'status' },
            { name: 'version' },
            { name: 'environment' },
            { name: 'last_checked_at' },
          ],
          rowCount: rows.length,
        };
      }
      if (text.includes('from documents')) {
        return {
          rows: [
            {
              id: 1,
              title: 'ECS Fargate Deploy Runbook',
              category: 'deploy',
              snippet: 'Deploy MCP services to AWS ECS Fargate...',
              rank: 0.9,
            },
          ],
          fields: [],
          rowCount: 1,
        };
      }
      if (text.includes('as _q')) {
        return {
          rows: services.map((s) => ({ name: s.name, status: s.status })),
          fields: [{ name: 'name' }, { name: 'status' }],
          rowCount: services.length,
        };
      }
      return { rows: [], fields: [], rowCount: 0 };
    },
    end: async () => undefined,
  } as unknown as Db;
}

describe('HTTP MCP e2e', () => {
  const secret = 'test-secret-change-me';
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const env = loadEnv({
      NODE_ENV: 'test',
      PORT: '0',
      LOG_LEVEL: 'silent',
      DATABASE_URL: 'postgresql://unused',
      MCP_SERVER_SECRET: secret,
    });
    const app = createApp(env, createMockDb(), createLogger(env));
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => resolve());
    });
    const addr = server.address();
    if (!addr || typeof addr === 'string') throw new Error('no port');
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  afterAll(async () => {
    if (!server) return;
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it('health requires no secret and returns ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; db: string };
    expect(body.status).toBe('ok');
    expect(body.db).toBe('up');
  });

  it('rejects MCP without secret', async () => {
    const res = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    expect(res.status).toBe(401);
  });

  it('lists tools and calls get_system_info over Streamable HTTP', async () => {
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`), {
      requestInit: { headers: { 'X-MCP-Secret': secret } },
    });
    const client = new Client({ name: 'e2e', version: '1.0.0' });
    await client.connect(transport);

    const tools = await client.listTools();
    const names = tools.tools.map((t) => t.name).sort();
    expect(names).toEqual(['get_system_info', 'query_database', 'search_documents']);

    const result = await client.callTool({
      name: 'get_system_info',
      arguments: {},
    });
    expect(result.isError).toBeFalsy();
    const text = Array.isArray(result.content)
      ? result.content.map((c) => ('text' in c ? c.text : '')).join('')
      : '';
    expect(text).toContain('payments-api');
    expect(text).toContain('image-processor');

    await client.close();
  });

  it('search_documents returns hits', async () => {
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`), {
      requestInit: { headers: { 'X-MCP-Secret': secret } },
    });
    const client = new Client({ name: 'e2e', version: '1.0.0' });
    await client.connect(transport);

    const result = await client.callTool({
      name: 'search_documents',
      arguments: { query: 'ECS' },
    });
    const text = Array.isArray(result.content)
      ? result.content.map((c) => ('text' in c ? c.text : '')).join('')
      : '';
    expect(text).toContain('ECS Fargate');

    await client.close();
  });

  it('query_database returns rows', async () => {
    const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`), {
      requestInit: { headers: { 'X-MCP-Secret': secret } },
    });
    const client = new Client({ name: 'e2e', version: '1.0.0' });
    await client.connect(transport);

    const result = await client.callTool({
      name: 'query_database',
      arguments: { sql: 'SELECT name, status FROM services', limit: 10 },
    });
    const text = Array.isArray(result.content)
      ? result.content.map((c) => ('text' in c ? c.text : '')).join('')
      : '';
    expect(text).toContain('payments-api');

    await client.close();
  });
});
