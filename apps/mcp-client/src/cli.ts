#!/usr/bin/env node
import { loadClientEnv } from './config.js';
import { connectMcp } from './mcp-connect.js';
import { runAskLoop } from './ask.js';

function usage(): never {
  console.log(`Usage:
  mcp-ops list-tools
  mcp-ops call-tool <name> '<json-args>'
  mcp-ops ask "<prompt>"

Env:
  MCP_SERVER_URL       (default http://localhost:3001/mcp)
  MCP_SERVER_SECRET    shared secret
  ANTHROPIC_API_KEY    required for ask
  ANTHROPIC_MODEL      optional model override
`);
  process.exit(1);
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  if (!cmd) usage();

  const env = loadClientEnv();
  const { client, close } = await connectMcp(env);

  try {
    if (cmd === 'list-tools') {
      const tools = await client.listTools();
      console.log(JSON.stringify(tools.tools, null, 2));
      return;
    }

    if (cmd === 'call-tool') {
      const name = rest[0];
      const argsJson = rest[1] ?? '{}';
      if (!name) usage();
      let args: Record<string, unknown>;
      try {
        args = JSON.parse(argsJson) as Record<string, unknown>;
      } catch {
        console.error('Invalid JSON args');
        process.exit(1);
      }
      const result = await client.callTool({ name, arguments: args });
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (cmd === 'ask') {
      const prompt = rest.join(' ').trim();
      if (!prompt) usage();
      const answer = await runAskLoop(env, client, prompt);
      console.log(answer);
      return;
    }

    usage();
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
