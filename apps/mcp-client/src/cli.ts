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
  MCP_TOOL_ARGS        JSON args for call-tool (Windows-friendly)
  ANTHROPIC_API_KEY    required for ask
  ANTHROPIC_MODEL      optional model override

Windows PowerShell (pnpm strips JSON quotes):
  .\\scripts\\call-tool.ps1 search_documents '{"query":"ECS"}'
  $env:MCP_TOOL_ARGS='{"query":"ECS"}'; pnpm --filter @mcp-ops/mcp-client start call-tool search_documents
`);
  process.exit(1);
}

function parseToolArgs(rest: string[]): Record<string, unknown> {
  const fromEnv = process.env.MCP_TOOL_ARGS?.trim();
  const inline = rest.length > 1 ? rest.slice(1).join(' ').trim() : '';
  const argsJson = fromEnv || inline || '{}';

  try {
    return JSON.parse(argsJson) as Record<string, unknown>;
  } catch {
    console.error('Invalid JSON args:', argsJson);
    console.error('On Windows, use scripts/call-tool.ps1 or set MCP_TOOL_ARGS.');
    process.exit(1);
  }
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
      if (!name) usage();
      const args = parseToolArgs(rest);
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
