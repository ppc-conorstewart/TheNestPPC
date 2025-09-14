// ==========================================
// FILE: server/routes/assets.js
// ==========================================

// ==============================
// ASSETS ROUTER — IMPORTS
// ==============================
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ==============================
// ASSETS ROUTER — HELPERS
// ==============================
function sanitizeUpdateBody(body) {
  const allowed = [
    'name',
    'category',
    'sn',
    'status',
    'location',
    'machining_vendor',
    'expected_return',
    'downed_notes'
  ];
  const out = {};
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, k)) out[k] = body[k];
  }
  return out;
}

// ==============================
// ASSETS ROUTER — OPTIONS (NAMES/CATEGORIES/LOCATIONS/STATUSES/VENDORS)
// ==============================
router.get('/options/names', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `select distinct name from assets where name is not null and name <> '' order by 1 asc`
    );
    res.json(rows.map(r => r.name));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch names' });
  }
});
router.get('/options/categories', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `select distinct category from assets where category is not null and category <> '' order by 1 asc`
    );
    res.json(rows.map(r => r.category));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});
router.get('/options/locations', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `select distinct location from assets where location is not null and location <> '' order by 1 asc`
    );
    res.json(rows.map(r => r.location));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});
router.get('/options/statuses', async (_req, res) => {
  try {
    const base = ['Available', 'In Use', 'Downed', 'Awaiting Quote', 'In Machining', 'QA', 'Ready for Pickup', 'Returned'];
    const { rows } = await pool.query(
      `select distinct status from assets where status is not null and status <> '' order by 1 asc`
    );
    const merged = Array.from(new Set([...base, ...rows.map(r => r.status)])).sort((a, b) =>
      String(a).localeCompare(String(b))
    );
    res.json(merged);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch statuses' });
  }
});
router.get('/options/machining_vendors', async (_req, res) => {
  try {
    const vendors = ['Alaska','Academy','Golden Eagle','Hi-Quality','Source','Domino','Champ','Pacific'];
    res.json(vendors);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});
// ---- legacy aliases (keep above "/:id") ----
router.get('/names', (_req, res) => res.redirect(307, '/api/assets/options/names'));
router.get('/categories', (_req, res) => res.redirect(307, '/api/assets/options/categories'));
router.get('/locations', (_req, res) => res.redirect(307, '/api/assets/options/locations'));
router.get('/statuses', (_req, res) => res.redirect(307, '/api/assets/options/statuses'));
router.get('/vendors', (_req, res) => res.redirect(307, '/api/assets/options/machining_vendors'));

// ==============================
// ASSETS ROUTER — GET ALL
// ==============================
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `select
         id, name, category, location, status, sn,
         machining_vendor, expected_return, downed_notes,
         updated_by, updated_at
       from assets
       order by id asc`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// ==============================
// ASSETS ROUTER — GET BY ID
// ==============================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `select
         id, name, category, location, status, sn,
         machining_vendor, expected_return, downed_notes,
         updated_by, updated_at
       from assets
       where id = $1
       limit 1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Asset not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// ==============================
// ASSETS ROUTER — CREATE
// ==============================
router.post('/', async (req, res) => {
  try {
    const { id, name, category, location, status, sn } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Asset id is required' });
    await pool.query(
      `insert into assets (id, name, category, location, status, sn, updated_at)
       values ($1,$2,$3,$4,$5,$6, now())`,
      [id, name || null, category || null, location || null, status || null, sn || null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// ==============================
// ASSETS ROUTER — UPDATE
// ==============================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = sanitizeUpdateBody(req.body || {});
    if (!Object.keys(fields).length) return res.json({ ok: true });

    const setParts = [];
    const values = [];
    let idx = 1;

    for (const [key, val] of Object.entries(fields)) {
      setParts.push(`${key} = $${idx++}`);
      values.push(val);
    }
    setParts.push(`updated_at = now()`);
    const sql = `update assets set ${setParts.join(', ')} where id = $${idx}`;
    values.push(id);

    const result = await pool.query(sql, values);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Asset not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// ==============================
// ASSETS ROUTER — TRANSFER
// ==============================
router.post('/transfer', async (req, res) => {
  try {
    const { assetIds, newLocation } = req.body || {};
    if (!Array.isArray(assetIds) || !assetIds.length || !newLocation) {
      return res.status(400).json({ error: 'assetIds[] and newLocation are required' });
    }
    await pool.query(
      'update assets set location = $1, updated_at = now() where id = any($2::text[])',
      [newLocation, assetIds]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to transfer assets' });
  }
});

// ==============================
// ASSETS ROUTER — DOWNED PATCH
// ==============================
router.patch('/:id/downed', async (req, res) => {
  try {
    const { id } = req.params;
    const { machining_vendor, expected_return, downed_notes, status } = req.body || {};
    const body = sanitizeUpdateBody({
      machining_vendor,
      expected_return,
      downed_notes,
      status: status || 'Downed'
    });
    const setParts = [];
    const values = [];
    let idx = 1;
    for (const [k, v] of Object.entries(body)) {
      setParts.push(`${k} = $${idx++}`);
      values.push(v);
    }
    if (!setParts.length) return res.json({ ok: true });
    setParts.push('updated_at = now()');
    const sql = `update assets set ${setParts.join(', ')} where id = $${idx}`;
    values.push(id);
    const result = await pool.query(sql, values);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Asset not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark asset as downed' });
  }
});

module.exports = router;
