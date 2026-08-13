import Anthropic from '@anthropic-ai/sdk';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { ClientEnv } from './config.js';

type McpTool = {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
};

function mcpToolsToAnthropic(tools: McpTool[]): Anthropic.Tool[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description ?? t.name,
    input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
  }));
}

export async function runAskLoop(
  env: ClientEnv,
  mcp: Client,
  prompt: string,
): Promise<string> {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is required for the ask command. Use list-tools or call-tool without an LLM key.',
    );
  }

  const listed = await mcp.listTools();
  const tools = mcpToolsToAnthropic(
    listed.tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema as Record<string, unknown>,
    })),
  );

  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: prompt }];

  for (let step = 0; step < 8; step++) {
    const response = await anthropic.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 2048,
      system:
        'You are a DevOps assistant. Use MCP tools to answer questions about services, documents, and system health. Prefer tools over guessing.',
      tools,
      messages,
    });

    const toolUses = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );

    if (toolUses.length === 0) {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n');
      return text || '(no response)';
    }

    messages.push({ role: 'assistant', content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const use of toolUses) {
      console.error(`→ Calling tool ${use.name} ${JSON.stringify(use.input)}`);
      try {
        const result = await mcp.callTool({
          name: use.name,
          arguments: use.input as Record<string, unknown>,
        });
        const text =
          typeof result.content === 'string'
            ? result.content
            : JSON.stringify(result.content, null, 2);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: use.id,
          content: text,
          is_error: Boolean(result.isError),
        });
      } catch (err) {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: use.id,
          content: err instanceof Error ? err.message : String(err),
          is_error: true,
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });
  }

  return 'Stopped after max tool-loop iterations.';
}
