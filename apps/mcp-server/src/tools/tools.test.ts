import { describe, expect, it } from 'vitest';
import { assertReadOnlySql } from '@mcp-ops/shared';
import { QueryDatabaseInputSchema } from '@mcp-ops/shared';

describe('server tool contracts', () => {
  it('parses query_database input', () => {
    const parsed = QueryDatabaseInputSchema.parse({ sql: 'SELECT * FROM services', limit: 5 });
    expect(parsed.limit).toBe(5);
  });

  it('guards mutating sql', () => {
    const r = assertReadOnlySql('UPDATE services SET status = $1');
    expect(r.ok).toBe(false);
  });
});
