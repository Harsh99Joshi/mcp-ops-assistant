/**
 * Lightweight SQL safety checks for read-only allowlisted queries.
 * Not a full SQL parser — defense in depth with Postgres role restrictions in prod.
 */
import { ALLOWED_TABLES, ErrorCode } from './schemas.js';

const FORBIDDEN =
  /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|call|execute|merge|replace|attach|detach)\b/i;

export function assertReadOnlySql(sql: string): { ok: true } | { ok: false; code: ErrorCode; message: string } {
  const trimmed = sql.trim().replace(/;+\s*$/, '');
  if (!trimmed) {
    return { ok: false, code: ErrorCode.INVALID_SQL, message: 'SQL must not be empty' };
  }
  if (trimmed.includes(';')) {
    return { ok: false, code: ErrorCode.FORBIDDEN_STATEMENT, message: 'Multiple statements are not allowed' };
  }
  if (!/^\s*select\b/i.test(trimmed) && !/^\s*with\b/i.test(trimmed)) {
    return { ok: false, code: ErrorCode.FORBIDDEN_STATEMENT, message: 'Only SELECT/WITH queries are allowed' };
  }
  if (FORBIDDEN.test(trimmed)) {
    return { ok: false, code: ErrorCode.FORBIDDEN_STATEMENT, message: 'Mutating or DDL keywords are not allowed' };
  }

  const lower = trimmed.toLowerCase();
  const referenced = ALLOWED_TABLES.filter((t) => new RegExp(`\\b${t}\\b`, 'i').test(lower));
  if (referenced.length === 0) {
    return {
      ok: false,
      code: ErrorCode.TABLE_NOT_ALLOWED,
      message: `Query must reference one of: ${ALLOWED_TABLES.join(', ')}`,
    };
  }

  // Reject references that look like other relations (simple heuristic)
  const fromMatches = [...lower.matchAll(/\b(?:from|join)\s+([a-z_][a-z0-9_]*)/g)].map((m) => m[1]);
  for (const table of fromMatches) {
    if (!(ALLOWED_TABLES as readonly string[]).includes(table)) {
      return {
        ok: false,
        code: ErrorCode.TABLE_NOT_ALLOWED,
        message: `Table "${table}" is not allowlisted`,
      };
    }
  }

  return { ok: true };
}

export function wrapLimit(sql: string, limit: number): string {
  const trimmed = sql.trim().replace(/;+\s*$/, '');
  return `SELECT * FROM (${trimmed}) AS _q LIMIT ${limit}`;
}
