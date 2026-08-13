import { z } from 'zod';

export const ErrorCode = {
  INVALID_SQL: 'INVALID_SQL',
  FORBIDDEN_STATEMENT: 'FORBIDDEN_STATEMENT',
  TABLE_NOT_ALLOWED: 'TABLE_NOT_ALLOWED',
  DATABASE_UNAVAILABLE: 'DATABASE_UNAVAILABLE',
  QUERY_TOO_BROAD: 'QUERY_TOO_BROAD',
  QUERY_TOO_SHORT: 'QUERY_TOO_SHORT',
  SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ToolErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export type ToolError = z.infer<typeof ToolErrorSchema>;

/** Allowlisted relations for query_database. */
export const ALLOWED_TABLES = ['services', 'documents', 'tool_executions'] as const;

export const QueryDatabaseInputSchema = z.object({
  sql: z.string().min(1).max(4000),
  limit: z.number().int().min(1).max(100).optional().default(25),
});

export const QueryDatabaseOutputSchema = z.object({
  columns: z.array(z.string()),
  rows: z.array(z.record(z.unknown())),
  rowCount: z.number().int().nonnegative(),
});

export type QueryDatabaseInput = z.infer<typeof QueryDatabaseInputSchema>;
export type QueryDatabaseOutput = z.infer<typeof QueryDatabaseOutputSchema>;

export const SearchDocumentsInputSchema = z.object({
  query: z.string().min(2).max(500),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

export const DocumentHitSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  snippet: z.string(),
  category: z.string(),
  rank: z.number(),
});

export const SearchDocumentsOutputSchema = z.object({
  query: z.string(),
  count: z.number().int().nonnegative(),
  results: z.array(DocumentHitSchema),
});

export type SearchDocumentsInput = z.infer<typeof SearchDocumentsInputSchema>;
export type SearchDocumentsOutput = z.infer<typeof SearchDocumentsOutputSchema>;

export const GetSystemInfoInputSchema = z.object({
  serviceName: z.string().min(1).max(128).optional(),
});

export const ServiceInfoSchema = z.object({
  name: z.string(),
  status: z.string(),
  version: z.string(),
  environment: z.string(),
  lastCheckedAt: z.string(),
});

export const GetSystemInfoOutputSchema = z.object({
  checkedAt: z.string(),
  host: z.object({
    uptimeSeconds: z.number(),
    memoryMb: z.number(),
    nodeVersion: z.string(),
  }),
  services: z.array(ServiceInfoSchema),
});

export type GetSystemInfoInput = z.infer<typeof GetSystemInfoInputSchema>;
export type GetSystemInfoOutput = z.infer<typeof GetSystemInfoOutputSchema>;

export const TOOL_NAMES = {
  query_database: 'query_database',
  search_documents: 'search_documents',
  get_system_info: 'get_system_info',
} as const;

export type ToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES];
