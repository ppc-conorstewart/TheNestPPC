// Test database connection
require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing connection with:');
console.log('  Host:', process.env.PGHOST);
console.log('  Port:', process.env.PGPORT);
console.log('  Database:', process.env.PGDATABASE);
console.log('  User:', process.env.PGUSER);
console.log('  Password:', process.env.PGPASSWORD ? '***' + process.env.PGPASSWORD.slice(-2) : 'NOT SET');

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'The NEST',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || ''
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('\n❌ Connection failed:', err.message);
    if (err.code === '28P01') {
      console.log('\nThis is a password authentication error. Please verify:');
      console.log('1. The password in .env matches what you set in PostgreSQL');
      console.log('2. Try connecting via pgAdmin with the same credentials');
    }
  } else {
    console.log('\n✅ Successfully connected to database!');
    console.log('Current time from DB:', res.rows[0].now);
  }
  pool.end();
});