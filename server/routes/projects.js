// server/routes/projects.js
// Projects API: checklist, files, progress
// Requires: express, pg, multer

const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const crypto = require('crypto');

const router = express.Router();
const pool = new Pool(); // uses PG env vars

// Multer: in-memory buffer (DB storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max; adjust if needed
});

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

/* ===========================
   Checklist
   =========================== */

// List checklist items for a project
router.get('/:projectId/checklist', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, label, is_completed, sort_index, created_at, updated_at
       FROM projects_checklist_items
       WHERE project_id = $1 AND deleted_at IS NULL
       ORDER BY sort_index ASC, id ASC`,
      [projectId]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
});

// Create checklist item
router.post('/:projectId/checklist', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { label, sortIndex = 0, actor } = req.body || {};
    if (!label || typeof label !== 'string') return res.status(400).json({ error: 'label is required' });

    const { rows } = await pool.query(
      `INSERT INTO projects_checklist_items
         (project_id, label, sort_index, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $4)
       RETURNING id, label, is_completed, sort_index, created_at, updated_at`,
      [projectId, label.trim(), sortIndex, actor || null]
    );
    const item = rows[0];

    await pool.query(
      `INSERT INTO projects_checklist_item_events (checklist_id, event_type, new_value, actor)
       VALUES ($1, 'created', $2, $3)`,
      [item.id, JSON.stringify(item), actor || null]
    );

    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create checklist item' });
  }
});

// Update checklist item
router.patch('/checklist/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { label, isCompleted, sortIndex, actor } = req.body || {};

    const { rows: before } = await pool.query(
      `SELECT id, label, is_completed, sort_index
       FROM projects_checklist_items
       WHERE id = $1 AND deleted_at IS NULL`,
      [itemId]
    );
    if (before.length === 0) return res.status(404).json({ error: 'Not found' });
    const oldValue = before[0];

    const { rows } = await pool.query(
      `UPDATE projects_checklist_items
         SET label = COALESCE($2, label),
             is_completed = COALESCE($3, is_completed),
             sort_index = COALESCE($4, sort_index),
             updated_by = COALESCE($5, updated_by),
             updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, label, is_completed, sort_index, updated_at`,
      [itemId, label, typeof isCompleted === 'boolean' ? isCompleted : null, sortIndex, actor || null]
    );
    const newValue = rows[0];

    await pool.query(
      `INSERT INTO projects_checklist_item_events (checklist_id, event_type, old_value, new_value, actor)
       VALUES ($1, 'edited', $2, $3, $4)`,
      [itemId, JSON.stringify(oldValue), JSON.stringify(newValue), actor || null]
    );

    res.json(newValue);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update checklist item' });
  }
});

// Soft-delete checklist item
router.delete('/checklist/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { actor } = req.query;

    const { rows } = await pool.query(
      `UPDATE projects_checklist_items
         SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, label, is_completed, sort_index`,
      [itemId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

    await pool.query(
      `INSERT INTO projects_checklist_item_events (checklist_id, event_type, old_value, actor)
       VALUES ($1, 'deleted', $2, $3)`,
      [itemId, JSON.stringify(rows[0]), actor || null]
    );

    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete checklist item' });
  }
});

// Bulk reorder
router.post('/:projectId/checklist/reorder', async (req, res) => {
  const client = await pool.connect();
  try {
    const { projectId } = req.params;
    const { order = [], actor } = req.body || {}; // [{id, sortIndex}]
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be array' });

    await client.query('BEGIN');
    for (const row of order) {
      await client.query(
        `UPDATE projects_checklist_items
           SET sort_index = $1, updated_by = COALESCE($2, updated_by), updated_at = NOW()
         WHERE id = $3 AND project_id = $4 AND deleted_at IS NULL`,
        [row.sortIndex, actor || null, row.id, projectId]
      );
      await client.query(
        `INSERT INTO projects_checklist_item_events (checklist_id, event_type, new_value, actor)
         VALUES ($1, 'reordered', $2, $3)`,
        [row.id, JSON.stringify({ sort_index: row.sortIndex }), actor || null]
      );
    }
    await client.query('COMMIT');
    res.status(204).end();
  } catch (e) {
    await pool.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Failed to reorder' });
  } finally {
    client.release();
  }
});

/* ===========================
   Files (images & documents)
   =========================== */

// List files (optionally by kind)
router.get('/:projectId/files', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { kind } = req.query; // 'image' | 'document'
    const params = [projectId];
    const filter = kind ? 'AND kind = $2' : '';
    if (kind) params.push(kind);

    const { rows } = await pool.query(
      `SELECT id, kind, filename, mime_type, byte_size, uploaded_by, created_at
       FROM projects_files
       WHERE project_id = $1 AND deleted_at IS NULL ${filter}
       ORDER BY created_at DESC`,
      params
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Upload file
router.post('/:projectId/files', upload.single('file'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { kind = 'document', uploadedBy, width, height } = req.body || {};
    if (!req.file) return res.status(400).json({ error: 'file is required' });
    if (!['image', 'document'].includes(kind)) return res.status(400).json({ error: 'invalid kind' });

    const buf = req.file.buffer;
    const digest = sha256(buf);

    // De-dupe within project
    const dup = await pool.query(
      `SELECT id FROM projects_files
       WHERE project_id = $1 AND sha256_hex = $2 AND deleted_at IS NULL LIMIT 1`,
      [projectId, digest]
    );
    if (dup.rows.length) {
      return res.status(200).json({ id: dup.rows[0].id, deduped: true });
    }

    const { rows } = await pool.query(
      `INSERT INTO projects_files
         (project_id, kind, filename, mime_type, byte_size, content, sha256_hex, width, height, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, filename, mime_type, byte_size, created_at`,
      [
        projectId,
        kind,
        req.file.originalname,
        req.file.mimetype || 'application/octet-stream',
        req.file.size,
        buf,
        digest,
        width ? parseInt(width, 10) : null,
        height ? parseInt(height, 10) : null,
        uploadedBy || null
      ]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Soft-delete file
router.delete('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { rowCount } = await pool.query(
      `UPDATE projects_files SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL`,
      [fileId]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Download/stream file
router.get('/files/:fileId/download', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { rows } = await pool.query(
      `SELECT filename, mime_type, byte_size, content
       FROM projects_files
       WHERE id = $1 AND deleted_at IS NULL`,
      [fileId]
    );
    if (!rows.length) return res.status(404).end();
    const f = rows[0];
    res.setHeader('Content-Type', f.mime_type);
    res.setHeader('Content-Length', f.byte_size);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(f.filename)}"`);
    res.send(f.content);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

/* ===========================
   Progress
   =========================== */

router.get('/:projectId/progress', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rows } = await pool.query(
      `SELECT progress_pct
       FROM projects_progress
       WHERE project_id = $1`,
      [projectId]
    );
    res.json({ progressPct: rows[0]?.progress_pct ?? 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

module.exports = router;
