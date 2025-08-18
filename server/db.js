// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'The NEST',
  password: 'Paloma',
  port: 5432,
});

module.exports = pool;