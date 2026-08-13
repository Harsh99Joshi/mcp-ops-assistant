import {
  assertReadOnlySql,
  ErrorCode,
  QueryDatabaseInputSchema,
  type QueryDatabaseOutput,
  wrapLimit,
} from '@mcp-ops/shared';
import type { Db } from '../db.js';
import type { Logger } from '../logger.js';

export async function queryDatabase(
  db: Db,
  logger: Logger,
  rawInput: unknown,
): Promise<{ ok: true; data: QueryDatabaseOutput } | { ok: false; code: string; message: string }> {
  const parsed = QueryDatabaseInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, code: ErrorCode.INVALID_SQL, message: parsed.error.message };
  }

  const guard = assertReadOnlySql(parsed.data.sql);
  if (!guard.ok) {
    return { ok: false, code: guard.code, message: guard.message };
  }

  const sql = wrapLimit(parsed.data.sql, parsed.data.limit);
  try {
    const result = await db.query(sql);
    const columns = result.fields.map((f) => f.name);
    const rows = result.rows as Record<string, unknown>[];
    logger.info({ rowCount: rows.length }, 'query_database ok');
    return {
      ok: true,
      data: {
        columns,
        rows,
        rowCount: rows.length,
      },
    };
  } catch (err) {
    logger.error({ err }, 'query_database failed');
    return {
      ok: false,
      code: ErrorCode.DATABASE_UNAVAILABLE,
      message: err instanceof Error ? err.message : 'Database query failed',
    };
  }
}
