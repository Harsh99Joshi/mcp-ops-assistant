import {
  ErrorCode,
  GetSystemInfoInputSchema,
  type GetSystemInfoOutput,
} from '@mcp-ops/shared';
import type { Db } from '../db.js';
import type { Logger } from '../logger.js';

export async function getSystemInfo(
  db: Db,
  logger: Logger,
  rawInput: unknown,
): Promise<{ ok: true; data: GetSystemInfoOutput } | { ok: false; code: string; message: string }> {
  const parsed = GetSystemInfoInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, code: ErrorCode.INTERNAL_ERROR, message: parsed.error.message };
  }

  const mem = process.memoryUsage();
  const host = {
    uptimeSeconds: Math.round(process.uptime()),
    memoryMb: Math.round(mem.rss / (1024 * 1024)),
    nodeVersion: process.version,
  };

  try {
    const params: string[] = [];
    let sql = `SELECT name, status, version, environment, last_checked_at
               FROM services`;
    if (parsed.data.serviceName) {
      params.push(parsed.data.serviceName);
      sql += ` WHERE name = $1`;
    }
    sql += ` ORDER BY name ASC`;

    const result = await db.query<{
      name: string;
      status: string;
      version: string;
      environment: string;
      last_checked_at: Date;
    }>(sql, params);

    if (parsed.data.serviceName && result.rows.length === 0) {
      return {
        ok: false,
        code: ErrorCode.SERVICE_NOT_FOUND,
        message: `Service "${parsed.data.serviceName}" not found`,
      };
    }

    const data: GetSystemInfoOutput = {
      checkedAt: new Date().toISOString(),
      host,
      services: result.rows.map((r) => ({
        name: r.name,
        status: r.status,
        version: r.version,
        environment: r.environment,
        lastCheckedAt: r.last_checked_at.toISOString(),
      })),
    };

    logger.info({ serviceCount: data.services.length }, 'get_system_info ok');
    return { ok: true, data };
  } catch (err) {
    logger.error({ err }, 'get_system_info failed');
    return {
      ok: false,
      code: ErrorCode.DATABASE_UNAVAILABLE,
      message: err instanceof Error ? err.message : 'System info query failed',
    };
  }
}
