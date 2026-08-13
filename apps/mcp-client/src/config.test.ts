import { describe, expect, it } from 'vitest';
import { loadClientEnv } from './config.js';

describe('loadClientEnv', () => {
  it('applies defaults', () => {
    const env = loadClientEnv({
      MCP_SERVER_SECRET: 'dev-secret-change-me',
    });
    expect(env.MCP_SERVER_URL).toContain('3001');
  });
});
