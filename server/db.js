// ==============================
// server/db.js
// PostgreSQL connection pool — Auto-detect hosted via DATABASE_URL (Render-safe)
// ==============================

const { Pool } = require('pg');

// Prefer a hosted connection whenever a non-local DATABASE_URL is present.
const rawUrl = process.env.DATABASE_URL || '';
const hasHostedUrl = !!rawUrl && !/^postgres(?:ql)?:\/\/localhost/i.test(rawUrl);

// Helper: build SSL config
function buildSSL() {
  // If we're using a hosted URL, default to TLS unless explicitly disabled.
  const requireFlag =
    String(process.env.PGSSLMODE || '').toLowerCase() === 'require' ||
    String(process.env.PGSSL || '').toLowerCase() === 'true' ||
    hasHostedUrl;

  return requireFlag ? { rejectUnauthorized: false } : false;
}

const pool = hasHostedUrl
  ? new Pool({
      connectionString: rawUrl,
      ssl: buildSSL(),
      max: Number(process.env.PGPOOL_MAX || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
  : new Pool({
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'The NEST',
      password: process.env.PGPASSWORD || 'Paloma',
      port: Number(process.env.PGPORT || 5432),
      ssl: buildSSL(),
      max: Number(process.env.PGPOOL_MAX || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

module.exports = pool;
