// ==============================
// server/db.js
// PostgreSQL connection pool — supports local & Render
// ==============================

const { Pool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
  // Render / hosted Postgres
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.PGSSLMODE === 'disable'
        ? false
        : { rejectUnauthorized: false }
  });
} else {
  // Local dev
  pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'The NEST',
    password: 'Paloma',
    port: 5432
  });
}

module.exports = pool;
