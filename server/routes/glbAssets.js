// ==============================
// FILE: server/routes/glbAssets.js
// ==============================

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const pool = require('../db'); // 
const { memoryUpload, uploadDir } = require('../utils/uploads');

const router = express.Router();

const ensureDir = dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');
const toTagsArray = raw => Array.isArray(raw) ? raw.map(s => String(s).trim()).filter(Boolean)
  : String(raw || '').split(',').map(s => s.trim()).filter(Boolean);
const slugify = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').slice(0,120);
const urlFromAbs = abs => `/uploads/${path.relative(uploadDir, abs).replace(/\\/g, '/')}`;

// ===== LIST =====
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];
    let i = 1;

    if (req.query.query) { where.push(`(name ILIKE $${i} OR description ILIKE $${i} OR $${i} = ANY(tags))`); params.push(`%${req.query.query}%`); i++; }
    if (req.query.category) { where.push(`category ILIKE $${i}`); params.push(req.query.category); i++; }
    if (req.query.active === 'true') where.push('is_active = true');
    if (req.query.customer_slug) { where.push(`customer_slug = $${i}`); params.push(req.query.customer_slug); i++; }
    if (req.query.folder_type) { where.push(`folder_type = $${i}`); params.push(req.query.folder_type); i++; }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const listSql = `
      SELECT id, name, category, version_label, description, tags, storage_url, thumbnail_url,
             file_bytes, checksum_sha256, is_active, created_at, updated_at, folder_type, customer_slug
      FROM glb_assets
      ${whereSql}
      ORDER BY updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const countSql = `SELECT COUNT(*)::int AS total FROM glb_assets ${whereSql}`;
    const [list, count] = await Promise.all([pool.query(listSql, params), pool.query(countSql, params)]);
    res.json({ items: list.rows, total: count.rows[0]?.total || 0, page, limit });
  } catch (err) {
    console.error('GET /api/glb-assets error:', err);
    res.status(500).json({ error: 'Failed to fetch GLB assets' });
  }
});

// ===== DETAIL =====
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM glb_assets WHERE id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/glb-assets/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch GLB asset' });
  }
});

// ===== CREATE (UPLOAD/REGISTER) =====
router.post(
  '/',
  memoryUpload.fields([{ name: 'model', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  async (req, res) => {
    try {
      const modelFile = req.files?.model?.[0];
      if (!modelFile) return res.status(400).json({ error: 'Missing .glb file in "model"' });

      const name = (req.body.name || modelFile.originalname.replace(/\.glb$/i, '')).trim();
      const category = (req.body.category || '').trim();
      const version_label = (req.body.version_label || '').trim();
      const description = (req.body.description || '').trim();
      const tags = toTagsArray(req.body.tags);
      const dest_type = (req.body.dest_type || 'GENERIC').toUpperCase() === 'CUSTOMER' ? 'CUSTOMER' : 'GENERIC';
      const dest_customer = (req.body.dest_customer || '').trim();

      const modelBuf = modelFile.buffer;
      const checksum_sha256 = sha256(modelBuf);
      const file_bytes = modelBuf.length;

      const dup = await pool.query(`SELECT id FROM glb_assets WHERE checksum_sha256 = $1 LIMIT 1`, [checksum_sha256]);
      if (dup.rows.length) {
        const { rows } = await pool.query(`SELECT * FROM glb_assets WHERE id = $1`, [dup.rows[0].id]);
        return res.status(200).json({ duplicate: true, asset: rows[0] });
      }

      const modelSlug = slugify(name || path.parse(modelFile.originalname).name);
      const customer_slug = dest_type === 'CUSTOMER' && dest_customer ? slugify(dest_customer) : null;

      const baseDir = dest_type === 'CUSTOMER'
        ? path.join(uploadDir, 'glb', 'customers', customer_slug || 'unspecified', modelSlug)
        : path.join(uploadDir, 'glb', 'generic', modelSlug);
      if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

      const modelName = modelFile.originalname.toLowerCase().endsWith('.glb') ? modelFile.originalname : `${modelSlug}.glb`;
      const modelAbs = path.join(baseDir, modelName);
      fs.writeFileSync(modelAbs, modelBuf);
      const storage_url = urlFromAbs(modelAbs);

      let thumbnail_url = null;
      const thumbFile = req.files?.thumbnail?.[0];
      if (thumbFile) {
        const thumbsDir = path.join(baseDir, 'thumbs');
        if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });
        const ext = (path.extname(thumbFile.originalname) || '.png').toLowerCase();
        const thumbAbs = path.join(thumbsDir, `${modelSlug}${ext}`);
        fs.writeFileSync(thumbAbs, thumbFile.buffer);
        thumbnail_url = urlFromAbs(thumbAbs);
      }

      const created_by = (req.user && (req.user.id || req.user.username)) || 'system';
      const folder_type = dest_type;

      const sql = `
        INSERT INTO glb_assets
          (name, category, version_label, description, tags, storage_url, thumbnail_url,
           file_bytes, checksum_sha256, is_active, created_by, folder_type, customer_slug)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10,$11,$12)
        RETURNING *
      `;
      const params = [
        name, category || null, version_label || null, description || null, tags,
        storage_url, thumbnail_url, file_bytes, checksum_sha256,
        created_by, folder_type, customer_slug
      ];
      const { rows } = await pool.query(sql, params);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error('POST /api/glb-assets error:', err);
      res.status(500).json({ error: 'Failed to create GLB asset' });
    }
  }
);

// ===== UPDATE =====
router.patch('/:id', async (req, res) => {
  try {
    const fields = [];
    const params = [];
    let i = 1;

    const setField = (col, val, transform) => {
      fields.push(`${col} = $${i}`); params.push(transform ? transform(val) : val); i++;
    };

    if (req.body.name !== undefined) setField('name', req.body.name || null);
    if (req.body.category !== undefined) setField('category', req.body.category || null);
    if (req.body.version_label !== undefined) setField('version_label', req.body.version_label || null);
    if (req.body.description !== undefined) setField('description', req.body.description || null);
    if (req.body.tags !== undefined) setField('tags', toTagsArray(req.body.tags));
    if (req.body.is_active !== undefined) setField('is_active', !!req.body.is_active);
    if (req.body.folder_type !== undefined) setField('folder_type', req.body.folder_type || null);
    if (req.body.customer_slug !== undefined) setField('customer_slug', req.body.customer_slug || null);
    if (req.body.thumbnail_url !== undefined) setField('thumbnail_url', req.body.thumbnail_url || null);
    if (req.body.storage_url !== undefined) setField('storage_url', req.body.storage_url || null);

    if (!fields.length) return res.status(400).json({ error: 'No updatable fields provided' });
    fields.push('updated_at = NOW()');

    const sql = `UPDATE glb_assets SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
    params.push(req.params.id);

    const { rows } = await pool.query(sql, params);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/glb-assets/:id error:', err);
    res.status(500).json({ error: 'Failed to update GLB asset' });
  }
});

// ===== DELETE (SOFT) =====
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE glb_assets SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true, asset: rows[0] });
  } catch (err) {
    console.error('DELETE /api/glb-assets/:id error:', err);
    res.status(500).json({ error: 'Failed to delete GLB asset' });
  }
});

module.exports = router;
