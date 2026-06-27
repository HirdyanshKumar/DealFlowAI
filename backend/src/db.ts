import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';

// ── Neon HTTP client (used by /health — stateless, no connection overhead) ──
export function getNeonSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set. Check your .env file.');
  return neon(url);
}

export async function testDbConnection(): Promise<void> {
  const sql = getNeonSql();
  await sql`SELECT 1`;
}

// ── pg Pool (used by API routes — persistent TCP connection, proper pooling) ─
let _pool: Pool | null = null;

export function getPool(): Pool {
  if (_pool) return _pool;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set. Check your .env file.');
  _pool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: { rejectUnauthorized: false },
  });
  return _pool;
}
