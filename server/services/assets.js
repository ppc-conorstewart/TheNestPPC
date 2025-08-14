// ==============================
// services/assets.js — Postgres asset manager
// ==============================
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'The NEST',
  password: 'Paloma',
  port: 5432,
  ssl: false,
});

// ==============================
// Assets: CRUD
// ==============================
async function getAllAssets() {
  const res = await pool.query('SELECT * FROM assets ORDER BY id ASC');
  return res.rows;
}

async function getAssetsByStatus(status) {
  const res = await pool.query('SELECT * FROM assets WHERE status = $1 ORDER BY id ASC', [status]);
  return res.rows;
}

async function getAssetById(id) {
  const res = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
  return res.rows[0];
}

async function addAsset(asset, updatedBy = 'system') {
  const { id, name, category, location, status, sn } = asset;
  const res = await pool.query(
    `INSERT INTO assets (id, name, category, location, status, sn, updated_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [id, name, category, location, status, sn, updatedBy]
  );
  return res.rows[0];
}

async function updateAsset(assetId, changes, updatedBy = 'system') {
  const allowed = ['name', 'category', 'sn', 'status', 'location'];
  const fields = [];
  const values = [];
  let i = 1;
  for (const k of Object.keys(changes)) {
    if (allowed.includes(k)) {
      fields.push(`${k} = $${i++}`);
      values.push(changes[k]);
    }
  }
  if (!fields.length) throw new Error('No fields to update');
  fields.push(`updated_by = $${i++}`);
  values.push(updatedBy);
  fields.push(`updated_at = NOW()`);
  values.push(assetId);
  const sql = `UPDATE assets SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
  const res = await pool.query(sql, values);
  return res.rows[0];
}

async function deleteAsset(assetId) {
  const res = await pool.query('DELETE FROM assets WHERE id = $1', [assetId]);
  return res.rowCount > 0;
}

async function transferMultipleAssets(assetIds, newLocation, updatedBy = 'system') {
  if (!Array.isArray(assetIds) || !assetIds.length) throw new Error('No assetIds given');
  const ids = assetIds.filter(id => typeof id === 'string' && id.trim());
  if (!ids.length) throw new Error('No valid asset IDs');
  await pool.query(
    `UPDATE assets SET location = $1, updated_by = $2, updated_at = NOW() WHERE id = ANY($3::text[])`,
    [newLocation, updatedBy, ids]
  );
}

// ==============================
// Activity Log
// ==============================
async function getActivityLog(limit = 200) {
  const res = await pool.query(
    'SELECT * FROM asset_activity_log ORDER BY timestamp DESC LIMIT $1',
    [limit]
  );
  return res.rows;
}

async function getActivityLogByAsset(assetId, limit = 200) {
  const res = await pool.query(
    `SELECT * FROM asset_activity_log
     WHERE asset_id = $1
     ORDER BY timestamp DESC
     LIMIT $2`,
    [assetId, limit]
  );
  return res.rows;
}

async function addActivityLog({ action, asset_id, details, user = 'system' }) {
  await pool.query(
    `INSERT INTO asset_activity_log (action, asset_id, details, "user")
     VALUES ($1,$2,$3,$4)`,
    [action, asset_id, details, user]
  );
}

module.exports = {
  getAllAssets,
  getAssetsByStatus,
  getAssetById,
  addAsset,
  updateAsset,
  deleteAsset,
  transferMultipleAssets,
  getActivityLog,
  getActivityLogByAsset,
  addActivityLog,
};
