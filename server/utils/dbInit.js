// ==============================
// server/utils/dbInit.js
// PostgreSQL pool + startup DDL (auto-creates `drafts` table)
// ==============================

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.PGSSLMODE === 'disable'
      ? false
      : { rejectUnauthorized: false }
});

// Simple query helper
async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

// Auto-create `drafts` table on startup
async function init() {
  await query(`
    CREATE TABLE IF NOT EXISTS drafts (
      draft_id     UUID,
      user_id      TEXT NOT NULL,
      workorder_id TEXT,
      page_key     TEXT NOT NULL,
      payload      JSONB NOT NULL,
      updated_at   TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, page_key)
    );
  `);
}

// Initialize immediately
init().catch(err => {
  console.error('Failed to initialize PostgreSQL tables:', err);
});

module.exports = { pool, query };
