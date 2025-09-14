// =====================================================
// db.js — Centralized Postgres Pool
// =====================================================
const { Pool } = require('pg');
require('dotenv').config();

const config = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL ? { rejectUnauthorized: false } : false
    }
  : {
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'The NEST',
      password: process.env.PGPASSWORD || '',
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      ssl: process.env.PGSSL ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(config);

module.exports = pool;
