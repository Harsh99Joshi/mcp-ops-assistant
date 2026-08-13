import { describe, expect, it } from 'vitest';
import { assertReadOnlySql, wrapLimit } from './sql-guard.js';

describe('assertReadOnlySql', () => {
  it('allows select from services', () => {
    expect(assertReadOnlySql('SELECT name, status FROM services')).toEqual({ ok: true });
  });

  it('rejects delete', () => {
    const r = assertReadOnlySql('DELETE FROM services');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('FORBIDDEN_STATEMENT');
  });

  it('rejects unknown tables', () => {
    const r = assertReadOnlySql('SELECT * FROM users');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('TABLE_NOT_ALLOWED');
  });

  it('rejects multi-statement', () => {
    const r = assertReadOnlySql('SELECT * FROM services; DROP TABLE services');
    expect(r.ok).toBe(false);
  });
});

describe('wrapLimit', () => {
  it('wraps query', () => {
    expect(wrapLimit('SELECT * FROM services', 5)).toContain('LIMIT 5');
  });
});
