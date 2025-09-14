// ==============================
// FILE: server/routes/workorders.js
// ==============================

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// ==============================
// ===== Helpers & Validation ===
// ==============================
function ensureObject(x) {
  if (x && typeof x === 'object' && !Array.isArray(x)) return x;
  return {};
}
function toInt(x) { const n = Number(x); return Number.isFinite(n) ? Math.trunc(n) : null; }

// ==============================
// ===== Get Workorders (list / filter)
// ==============================
router.get('/', async (req, res) => {
  try {
    const jobId = toInt(req.query.job_id);
    let sql = 'SELECT id, job_id, revision, payload, created_at, updated_at FROM work_orders';
    const params = [];
    if (jobId) { sql += ' WHERE job_id = $1'; params.push(jobId); }
    sql += ' ORDER BY updated_at DESC';
    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/workorders error:', err);
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
});

// ==============================
// ===== Get Single Workorder ===
// ==============================
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, job_id, revision, payload, created_at, updated_at
       FROM work_orders WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/workorders/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch work order' });
  }
});

// ==============================
// ===== Latest by Job ID =======
// ==============================
router.get('/by-job/:jobId/latest', async (req, res) => {
  try {
    const jobId = toInt(req.params.jobId);
    if (!jobId) return res.status(400).json({ error: 'Invalid jobId' });

    const { rows } = await db.query(
      `SELECT id, job_id, revision, payload, created_at, updated_at
       FROM work_orders
       WHERE job_id = $1
       ORDER BY updated_at DESC
       LIMIT 1`,
      [jobId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No work order for job' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/workorders/by-job/:jobId/latest error:', err);
    res.status(500).json({ error: 'Failed to fetch latest work order' });
  }
});

// ==============================
// ===== Create Workorder =======
// ==============================
router.post('/', async (req, res) => {
  try {
    const { job_id, revision, payload } = req.body || {};
    const jobId = toInt(job_id);
    if (!jobId) return res.status(400).json({ error: 'job_id is required' });

    const rev = (revision || 'A').toString().trim() || 'A';
    const data = ensureObject(payload);

    const { rows } = await db.query(
      `INSERT INTO work_orders (id, job_id, revision, payload)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING id, job_id, revision, payload, created_at, updated_at`,
      [uuidv4(), jobId, rev, JSON.stringify(data)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/workorders error:', err);
    res.status(500).json({ error: 'Failed to create work order' });
  }
});

// ==============================
// ===== Update Workorder =======
// ==============================
router.put('/:id', async (req, res) => {
  try {
    const { revision, payload } = req.body || {};
    const rev = revision ? String(revision).trim() : null;
    const data = payload !== undefined ? ensureObject(payload) : undefined;

    const sets = [];
    const params = [];
    let p = 1;

    if (rev !== null) { sets.push(`revision = $${p++}`); params.push(rev); }
    if (data !== undefined) { sets.push(`payload = $${p++}::jsonb`); params.push(JSON.stringify(data)); }
    sets.push(`updated_at = now()`);
    params.push(req.params.id);

    const { rows } = await db.query(
      `UPDATE work_orders
       SET ${sets.join(', ')}
       WHERE id = $${p}
       RETURNING id, job_id, revision, payload, created_at, updated_at`,
      params
    );

    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/workorders/:id error:', err);
    res.status(500).json({ error: 'Failed to update work order' });
  }
});

// ==============================
// ===== Delete Workorder =======
// ==============================
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM work_orders WHERE id = $1', [req.params.id]);
    res.json({ success: true, deleted: rowCount });
  } catch (err) {
    console.error('DELETE /api/workorders/:id error:', err);
    res.status(500).json({ error: 'Failed to delete work order' });
  }
});

module.exports = router;
