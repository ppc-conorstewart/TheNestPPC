// ==============================
// server/db.js
// PostgreSQL connection pool — Render-safe (SSL) with hard guard
// ==============================

const { Pool } = require('pg');

const isRender = !!process.env.RENDER;

// Helper: build SSL config
function buildSSL() {
  // If PGSSLMODE=require or PGSSL=true -> use TLS (no CA on Render)
  const requireSSL =
    String(process.env.PGSSLMODE || '').toLowerCase() === 'require' ||
    String(process.env.PGSSL || '').toLowerCase() === 'true';

  return requireSSL ? { rejectUnauthorized: false } : false;
}

let pool;

// Hosted environment (Render): require DATABASE_URL
if (isRender) {
  if (!process.env.DATABASE_URL || /^postgresql?:\/\/localhost/i.test(process.env.DATABASE_URL)) {
    console.error('[DB] Missing or invalid DATABASE_URL on Render. Refusing to start.');
    console.error('[DB] Set DATABASE_URL to your Render Postgres *External Database URL*.');
    throw new Error('DATABASE_URL not configured for hosted environment');
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: buildSSL(),
    max: Number(process.env.PGPOOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

} else {
  // Local dev fallback
  pool = new Pool({
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
}

module.exports = pool;
