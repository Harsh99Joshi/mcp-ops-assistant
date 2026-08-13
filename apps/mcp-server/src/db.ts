import pg from 'pg';

const { Pool } = pg;

export type Db = pg.Pool;

export function createPool(databaseUrl: string): Db {
  return new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
  });
}

export async function checkDb(db: Db): Promise<boolean> {
  try {
    await db.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
