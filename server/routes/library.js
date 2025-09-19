// ==============================
// FILE: server/routes/library.js — Library API (Paloma / Customer / Third Party)
// Sections: Imports • Helpers • List • Create (Upload/Register) • Update (Rename) • Delete • Exports
// ==============================

const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { generalUpload } = require('../utils/uploads');

// ==============================
// ======= ROUTER ===============
// ==============================
const router = express.Router();

// ==============================
// ======= HELPERS ==============
// ==============================
const CATEGORIES = new Set(['paloma', 'customer', 'third_party']);

function normStr(x) {
  return (x == null ? '' : String(x)).trim();
}
function normCategory(x) {
  const v = normStr(x).toLowerCase();
  return CATEGORIES.has(v) ? v : null;
}
function toUUID(x) {
  const s = normStr(x);
  return /^[0-9a-fA-F-]{36}$/.test(s) ? s : null;
}
function resolvePublicUrl(req, relPath) {
  if (!relPath) return '';
  if (/^https?:\/\//i.test(relPath)) return relPath;
  const proto = req.header('x-forwarded-proto') || req.protocol || 'https';
  const host = req.get('host');
  if (!host) return relPath;
  const base = `${proto}://${host}`.replace(/\/+$/, '');
  const suffix = relPath.startsWith('/') ? relPath : `/${relPath}`;
  return `${base}${suffix}`;
}

// ==============================
// ======= LIST =================
// ==============================
// GET /api/library?category=paloma|customer|third_party&customer_id=&search=&limit=&offset=
router.get('/', async (req, res) => {
  try {
    const category = normCategory(req.query.category || '');
    const customerIdRaw = req.query.customer_id;
    const search = normStr(req.query.search);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const where = [];
    const params = [];
    let p = 1;

    if (category) {
      where.push(`category = $${p++}`);
      params.push(category);
    }
    if (category === 'customer' && customerIdRaw != null) {
      if (/^\d+$/.test(String(customerIdRaw))) {
        where.push(`customer_id = $${p++}`);
        params.push(Number(customerIdRaw));
      } else if (/^[0-9a-fA-F-]{36}$/.test(String(customerIdRaw))) {
        where.push(`customer_id = $${p++}`);
        params.push(customerIdRaw);
      }
    }
    if (search) {
      where.push(`(title ILIKE $${p++} OR $${p} = ANY(tags))`);
      params.push(`%${search}%`, search);
      p++;
    }

    const sql =
      `SELECT id, title, category, customer_id, storage_path, thumbnail_path, mime_type, file_ext,
              width_px, height_px, aspect_ratio, tags, active, created_at, updated_at
       FROM library_images
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY updated_at DESC
       LIMIT $${p++} OFFSET $${p}`;
    params.push(limit, offset);

    const { rows } = await db.query(sql, params);

    const items = rows.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      customer_id: r.customer_id,
      storage_path: r.storage_path,
      storage_url: resolvePublicUrl(req, r.storage_path),
      thumbnail_path: r.thumbnail_path,
      thumbnail_url: r.thumbnail_path ? resolvePublicUrl(req, r.thumbnail_path) : null,
      mime_type: r.mime_type,
      file_ext: r.file_ext,
      width_px: r.width_px,
      height_px: r.height_px,
      aspect_ratio: r.aspect_ratio,
      tags: Array.isArray(r.tags) ? r.tags : [],
      active: !!r.active,
      created_at: r.created_at,
      updated_at: r.updated_at
    }));

    res.json({ items, nextOffset: offset + items.length });
  } catch (err) {
    console.error('GET /api/library error:', err);
    res.status(500).json({ error: 'failed_to_list' });
  }
});

// ==============================
// ======= CREATE (UPLOAD) ======
// ==============================
// POST /api/library
// multipart/form-data: file, title, category, customer_id?, tags?
router.post('/', generalUpload.single('file'), async (req, res) => {
  try {
    const title = normStr(req.body.title || (req.file && req.file.originalname) || 'Untitled');
    const category = normCategory(req.body.category);
    const rawCustomer = req.body.customer_id;

    if (!req.file) return res.status(400).json({ error: 'file_required' });
    if (!category) return res.status(400).json({ error: 'invalid_category' });

    const relPath = `/uploads/${req.file.filename}`;
    const ext = path.extname(req.file.originalname || '').toLowerCase().replace(/^\./, '') || 'png';
    const mime = req.file.mimetype || 'image/png';
    const size = Number(req.file.size) || null;

    let tags = [];
    if (Array.isArray(req.body.tags)) tags = req.body.tags.map(v => String(v || '').trim()).filter(Boolean);
    else if (req.body.tags) tags = String(req.body.tags).split(',').map(s => s.trim()).filter(Boolean);

    let customerId = null;
    if (category === 'customer' && rawCustomer != null) {
      if (/^\d+$/.test(String(rawCustomer))) customerId = Number(rawCustomer);
      else if (/^[0-9a-fA-F-]{36}$/.test(String(rawCustomer))) customerId = String(rawCustomer);
      else return res.status(400).json({ error: 'invalid_customer_id' });
    }

    const { rows } = await db.query(
      `INSERT INTO library_images
         (id, title, category, customer_id, storage_path, thumbnail_path, mime_type, file_ext, file_size_bytes, tags, active)
       VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $8, $9::text[], TRUE)
       RETURNING id, title, category, customer_id, storage_path, mime_type, file_ext, tags, active, created_at, updated_at`,
      [uuidv4(), title, category, customerId, relPath, mime, ext, size, tags]
    );

    const r = rows[0];
    res.status(201).json({
      id: r.id,
      title: r.title,
      category: r.category,
      customer_id: r.customer_id,
      storage_path: r.storage_path,
      storage_url: resolvePublicUrl(req, r.storage_path),
      mime_type: r.mime_type,
      file_ext: r.file_ext,
      tags: r.tags || [],
      active: !!r.active,
      created_at: r.created_at,
      updated_at: r.updated_at
    });
  } catch (err) {
    console.error('POST /api/library error:', err);
    res.status(500).json({ error: 'failed_to_create' });
  }
});

// ==============================
// ======= UPDATE (RENAME) ======
// ==============================
// PATCH /api/library/:id  { title: "New Name" }
router.patch('/:id', async (req, res) => {
  try {
    const id = toUUID(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid_id' });
    const title = normStr(req.body?.title || '');
    if (!title) return res.status(400).json({ error: 'invalid_title' });

    const { rows } = await db.query(
      `UPDATE library_images
       SET title = $1, updated_at = now()
       WHERE id = $2
       RETURNING id, title, category, customer_id, storage_path, mime_type, file_ext, tags, active, created_at, updated_at`,
      [title, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/library/:id error:', err);
    res.status(500).json({ error: 'failed_to_update' });
  }
});

// ==============================
// ======= DELETE ===============
// ==============================
// DELETE /api/library/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = toUUID(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid_id' });

    const dep = await db.query(
      'SELECT 1 FROM workorder_canvas_items WHERE library_image_id = $1 LIMIT 1',
      [id]
    );
    if (dep.rowCount) return res.status(409).json({ error: 'in_use' });

    const { rowCount } = await db.query('DELETE FROM library_images WHERE id = $1', [id]);
    res.json({ ok: rowCount > 0 });
  } catch (err) {
    console.error('DELETE /api/library/:id error:', err);
    res.status(500).json({ error: 'failed_to_delete' });
  }
});

module.exports = router;
