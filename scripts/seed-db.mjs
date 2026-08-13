#!/usr/bin/env node
/**
 * Apply schema + seed to a Postgres database.
 * Usage: DATABASE_URL=postgresql://... node scripts/seed-db.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, '..', 'infrastructure', 'docker', 'init.sql');
const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://mcp:mcp@localhost:5432/mcp_ops';

const sql = fs.readFileSync(sqlPath, 'utf8');
const client = new pg.Client({ connectionString: databaseUrl });

await client.connect();
await client.query(sql);
await client.end();
console.log('Seeded database:', databaseUrl.replace(/:[^:@/]+@/, ':***@'));
