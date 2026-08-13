import {
  ErrorCode,
  SearchDocumentsInputSchema,
  type SearchDocumentsOutput,
} from '@mcp-ops/shared';
import type { Db } from '../db.js';
import type { Logger } from '../logger.js';

export async function searchDocuments(
  db: Db,
  logger: Logger,
  rawInput: unknown,
): Promise<{ ok: true; data: SearchDocumentsOutput } | { ok: false; code: string; message: string }> {
  const parsed = SearchDocumentsInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, code: ErrorCode.QUERY_TOO_SHORT, message: parsed.error.message };
  }

  const { query, limit } = parsed.data;
  try {
    const result = await db.query<{
      id: number;
      title: string;
      category: string;
      snippet: string;
      rank: number;
    }>(
      `SELECT
         id,
         title,
         category,
         ts_headline('english', body, plainto_tsquery('english', $1), 'MaxWords=25, MinWords=10') AS snippet,
         ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank
       FROM documents
       WHERE search_vector @@ plainto_tsquery('english', $1)
       ORDER BY rank DESC
       LIMIT $2`,
      [query, limit],
    );

    logger.info({ count: result.rowCount, query }, 'search_documents ok');
    return {
      ok: true,
      data: {
        query,
        count: result.rows.length,
        results: result.rows.map((r) => ({
          id: r.id,
          title: r.title,
          snippet: r.snippet,
          category: r.category,
          rank: Number(r.rank),
        })),
      },
    };
  } catch (err) {
    logger.error({ err }, 'search_documents failed');
    return {
      ok: false,
      code: ErrorCode.DATABASE_UNAVAILABLE,
      message: err instanceof Error ? err.message : 'Document search failed',
    };
  }
}
