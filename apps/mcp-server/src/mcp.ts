import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TOOL_NAMES } from '@mcp-ops/shared';
import { z } from 'zod';
import type { Db } from './db.js';
import type { Logger } from './logger.js';
import { getSystemInfo } from './tools/get-system-info.js';
import { queryDatabase } from './tools/query-database.js';
import { searchDocuments } from './tools/search-documents.js';

function textResult(payload: unknown, isError = false) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
    isError,
  };
}

export function createMcpServer(db: Db, logger: Logger): McpServer {
  const server = new McpServer({
    name: 'mcp-ops-assistant',
    version: '1.0.0',
  });

  server.tool(
    TOOL_NAMES.query_database,
    'Run a read-only SQL SELECT against allowlisted tables (services, documents, tool_executions).',
    {
      sql: z.string().describe('Read-only SQL SELECT/WITH query'),
      limit: z.number().int().min(1).max(100).optional().describe('Max rows (default 25)'),
    },
    async (args) => {
      const result = await queryDatabase(db, logger, args);
      if (!result.ok) return textResult({ error: result }, true);
      return textResult(result.data);
    },
  );

  server.tool(
    TOOL_NAMES.search_documents,
    'Full-text search over DevOps runbooks and operational documents.',
    {
      query: z.string().describe('Search query'),
      limit: z.number().int().min(1).max(50).optional().describe('Max hits (default 10)'),
    },
    async (args) => {
      const result = await searchDocuments(db, logger, args);
      if (!result.ok) return textResult({ error: result }, true);
      return textResult(result.data);
    },
  );

  server.tool(
    TOOL_NAMES.get_system_info,
    'Return service inventory health plus live MCP host process metrics.',
    {
      serviceName: z
        .string()
        .optional()
        .describe('Optional service name filter (e.g. payments-api)'),
    },
    async (args) => {
      const result = await getSystemInfo(db, logger, args);
      if (!result.ok) return textResult({ error: result }, true);
      return textResult(result.data);
    },
  );

  return server;
}
