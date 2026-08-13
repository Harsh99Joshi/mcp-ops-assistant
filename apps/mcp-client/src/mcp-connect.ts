import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { ClientEnv } from './config.js';

export async function connectMcp(env: ClientEnv): Promise<{
  client: Client;
  close: () => Promise<void>;
}> {
  const url = new URL(env.MCP_SERVER_URL);
  const transport = new StreamableHTTPClientTransport(url, {
    requestInit: {
      headers: {
        'X-MCP-Secret': env.MCP_SERVER_SECRET,
      },
    },
  });

  const client = new Client({ name: 'mcp-ops-ai-client', version: '1.0.0' });
  await client.connect(transport);

  return {
    client,
    close: async () => {
      await client.close();
    },
  };
}
