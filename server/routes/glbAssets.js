// ==============================
// FILE: server/routes/glbAssets.js
// SECTIONS: Imports • Helpers • List • Detail • Create • Update • Delete (soft/hard) • Move • Defaults • Export
// ==============================

const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const pool = require('../db');
const { memoryUpload, uploadDir } = require('../utils/uploads');

const router = express.Router();

// ==============================
// SECTION: Helpers
// ==============================
const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const toTagsArray = (raw) => Array.isArray(raw)
  ? raw.map((s) => String(s).trim()).filter(Boolean)
  : String(raw || '').split(',').map((s) => s.trim()).filter(Boolean);
const slugify = (s) => String(s || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '')
  .slice(0, 120);
const urlFromAbs = (abs) => `/uploads/${path.relative(uploadDir, abs).replace(/\\/g, '/')}`;
const absFromUrl = (url) => path.join(uploadDir, url.replace(/^\/?uploads\//i, ''));

const buildAssetBaseDir = (folderType, customerSlug, modelSlug) => {
  return folderType === 'CUSTOMER'
    ? path.join(uploadDir, 'glb', 'customers', customerSlug || 'unspecified', modelSlug)
    : path.join(uploadDir, 'glb', 'generic', modelSlug);
};

const moveAssetOnDisk = (storageUrl, folderType, customerSlug) => {
  const srcAbs = absFromUrl(storageUrl);
  const srcDir = path.dirname(srcAbs);
  const modelSlug = path.basename(srcDir);
  const dstBase = buildAssetBaseDir(folderType, customerSlug, modelSlug);
  ensureDir(dstBase);
  const dstAbs = path.join(dstBase, path.basename(srcAbs));
  const dstDir = path.dirname(dstAbs);

  ensureDir(dstDir);
  if (srcDir !== dstDir) {
    ensureDir(path.dirname(dstDir));
    ensureDir(dstDir);
    // Move entire model folder (to keep thumbs/aux files)
    if (fs.existsSync(srcDir)) {
      const parentDst = path.dirname(dstBase);
      ensureDir(parentDst);
      fs.renameSync(srcDir, dstBase);
    }
  }
  const newStorageUrl = urlFromAbs(path.join(dstBase, path.basename(srcAbs)));
  // Fix thumbnail path if it existed
  const thumbsSrc = path.join(dstBase, 'thumbs'); // already moved with folder
  const thumbCandidate = fs.existsSync(thumbsSrc)
    ? fs.readdirSync(thumbsSrc).find((f) => f.startsWith(modelSlug + '.'))
    : null;
  const thumbnailUrl = thumbCandidate ? urlFromAbs(path.join(thumbsSrc, thumbCandidate)) : null;
  return { newStorageUrl, thumbnailUrl };
};

// ==============================
// SECTION: List
// ==============================
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

// ==============================
// SECTION: Detail
// ==============================
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

// ==============================
// SECTION: Create (Upload/Register)
// ==============================
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

      const baseDir = buildAssetBaseDir(dest_type, customer_slug, modelSlug);
      ensureDir(baseDir);

      const modelName = modelFile.originalname.toLowerCase().endsWith('.glb') ? modelFile.originalname : `${modelSlug}.glb`;
      const modelAbs = path.join(baseDir, modelName);
      fs.writeFileSync(modelAbs, modelBuf);
      const storage_url = urlFromAbs(modelAbs);

      let thumbnail_url = null;
      const thumbFile = req.files?.thumbnail?.[0];
      if (thumbFile) {
        const thumbsDir = path.join(baseDir, 'thumbs');
        ensureDir(thumbsDir);
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

// ==============================
// SECTION: Update
// ==============================
router.patch('/:id', async (req, res) => {
  try {
    const fields = [];
    const params = [];
    let i = 1;

    const setField = (col, val, transform) => { fields.push(`${col} = $${i}`); params.push(transform ? transform(val) : val); i++; };

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

// ==============================
// SECTION: Delete (Soft / Hard via ?hard=true)
// ==============================
router.delete('/:id', async (req, res) => {
  try {
    const hard = String(req.query.hard || '').toLowerCase() === 'true';
    const { rows: existing } = await pool.query(`SELECT id, storage_url FROM glb_assets WHERE id = $1`, [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });

    if (hard) {
      try {
        const abs = absFromUrl(existing[0].storage_url);
        const dir = path.dirname(abs);
        if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
      } catch (_) { /* ignore */ }
      await pool.query(`DELETE FROM glb_assets WHERE id = $1`, [req.params.id]);
      return res.json({ deleted: true, hard: true });
    }

    const { rows } = await pool.query(
      `UPDATE glb_assets SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json({ deleted: true, hard: false, asset: rows[0] });
  } catch (err) {
    console.error('DELETE /api/glb-assets/:id error:', err);
    res.status(500).json({ error: 'Failed to delete GLB asset' });
  }
});

// ==============================
// SECTION: Move GLB Asset (folder/customer)
// BODY: { folder_type: 'GENERIC'|'CUSTOMER', customer_slug?: string }
// ==============================
router.post('/:id/move', async (req, res) => {
  try {
    const folder_type = (req.body.folder_type || '').toUpperCase() === 'CUSTOMER' ? 'CUSTOMER' : 'GENERIC';
    const customer_slug = folder_type === 'CUSTOMER' ? slugify(req.body.customer_slug || '') : null;

    const { rows: currentRows } = await pool.query(
      `SELECT id, storage_url, thumbnail_url FROM glb_assets WHERE id = $1`,
      [req.params.id]
    );
    if (!currentRows.length) return res.status(404).json({ error: 'Not found' });

    const { newStorageUrl, thumbnailUrl } = moveAssetOnDisk(currentRows[0].storage_url, folder_type, customer_slug);

    const { rows } = await pool.query(
      `UPDATE glb_assets
         SET storage_url = $1,
             thumbnail_url = COALESCE($2, thumbnail_url),
             folder_type = $3,
             customer_slug = $4,
             updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [newStorageUrl, thumbnailUrl, folder_type, customer_slug, req.params.id]
    );

    res.json({ moved: true, asset: rows[0] });
  } catch (err) {
    console.error('POST /api/glb-assets/:id/move error:', err);
    res.status(500).json({ error: 'Failed to move GLB asset' });
  }
});

// ==============================
// SECTION: Assign/Unassign Default
// BODY: { customer_slug: string, active?: boolean, by_category?: string }
// ==============================
router.post('/:id/defaults', async (req, res) => {
  try {
    const customer_slug = slugify(req.body.customer_slug || '');
    if (!customer_slug) return res.status(400).json({ error: 'customer_slug_required' });
    const active = req.body.active === undefined ? true : !!req.body.active;
    const by_category = req.body.by_category ? String(req.body.by_category) : null;

    const upsertSql = `
      INSERT INTO glb_asset_defaults (id, asset_id, customer_slug, by_category, is_active, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
      ON CONFLICT (customer_slug, asset_id)
      DO UPDATE SET is_active = EXCLUDED.is_active, by_category = EXCLUDED.by_category
      RETURNING *
    `;
    const { rows } = await pool.query(upsertSql, [req.params.id, customer_slug, by_category, active]);
    res.json({ ok: true, default: rows[0] });
  } catch (err) {
    console.error('POST /api/glb-assets/:id/defaults error:', err);
    res.status(500).json({ error: 'Failed to update defaults' });
  }
});

// ==============================
// SECTION: Export (GLB passthrough, GLTF/ZIP if gltf-pipeline is present)
// QUERY: ?format=glb|gltf|zip
// ==============================
router.get('/:id/export', async (req, res) => {
  try {
    const format = String(req.query.format || 'glb').toLowerCase();
    const { rows } = await pool.query(`SELECT id, name, storage_url FROM glb_assets WHERE id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const asset = rows[0];
    const srcAbs = absFromUrl(asset.storage_url);
    const baseName = slugify(asset.name || path.basename(srcAbs, path.extname(srcAbs)));

    if (format === 'glb') {
      res.setHeader('Content-Disposition', `attachment; filename="${baseName}.glb"`);
      return fs.createReadStream(srcAbs).pipe(res);
    }

    let pipeline = null;
    try {
      // Optional dependency; only used if installed
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      pipeline = require('gltf-pipeline');
    } catch (_) { /* not installed */ }

    if (!pipeline) {
      return res.status(501).json({ error: 'converter_unavailable', note: 'Install gltf-pipeline to enable GLTF/ZIP export' });
    }

    const glbBuf = fs.readFileSync(srcAbs);
    const result = await pipeline.glbToGltf(glbBuf, {});
    const gltf = result.gltf;
    const gltfJson = Buffer.from(JSON.stringify(gltf, null, 0));

    if (format === 'gltf') {
      res.setHeader('Content-Type', 'model/gltf+json');
      res.setHeader('Content-Disposition', `attachment; filename="${baseName}.gltf"`);
      return res.end(gltfJson);
    }

    if (format === 'zip') {
      // Minimal ZIP without extra deps; write temp files and stream as .zip via system zip if available
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nest-gltf-'));
      const gltfPath = path.join(tmpDir, `${baseName}.gltf`);
      fs.writeFileSync(gltfPath, gltfJson);
      // Try to use OS zip; fallback to serving .gltf
      try {
        const { execFileSync } = require('child_process');
        const zipPath = path.join(tmpDir, `${baseName}.zip`);
        const zipCmd = process.platform === 'win32' ? 'powershell' : 'zip';
        if (zipCmd === 'zip') {
          execFileSync('zip', ['-j', zipPath, gltfPath], { stdio: 'ignore' });
        } else {
          execFileSync('powershell', ['-NoProfile', '-Command', `Compress-Archive -Path '${gltfPath}' -DestinationPath '${zipPath}' -Force`], { stdio: 'ignore' });
        }
        res.setHeader('Content-Disposition', `attachment; filename="${baseName}.zip"`);
        const stream = fs.createReadStream(zipPath);
        stream.on('close', () => { try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {} });
        return stream.pipe(res);
      } catch (_) {
        res.setHeader('Content-Type', 'model/gltf+json');
        res.setHeader('Content-Disposition', `attachment; filename="${baseName}.gltf"`);
        return res.end(gltfJson);
      }
    }

    return res.status(400).json({ error: 'unsupported_format' });
  } catch (err) {
    console.error('GET /api/glb-assets/:id/export error:', err);
    res.status(500).json({ error: 'Failed to export GLB asset' });
  }
});

module.exports = router;
