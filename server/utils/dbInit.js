// server/utils/dbInit.js
const fs       = require('fs');
const path     = require('path');
const Database = require('better-sqlite3');

// ── Ensure the data directory exists ─────────────────────────────────────
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(__dirname, '..', 'flyhq_assets.db');


// Open (or create) the SQLite database file
const db = new Database(dbPath);

// Enable foreign‐key support
db.pragma('foreign_keys = ON');

// ── Create `drafts` table with proper conflict target ────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS drafts (
    draft_id     TEXT,
    user_id      TEXT NOT NULL,
    workorder_id TEXT,
    page_key     TEXT NOT NULL,
    payload      TEXT NOT NULL,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, page_key)
  );
`);

module.exports = db;
