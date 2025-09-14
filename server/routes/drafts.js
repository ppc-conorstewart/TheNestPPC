// ==============================
// FILE: server/routes/drafts.js
// ==============================

const express = require('express');
const db = require('../db');

const router = express.Router();

// ==============================
// ===== Helpers
// ==============================
const asJson = (x) => {
  if (x && typeof x === 'object') return x;
  try { return JSON.parse(x); } catch { return {}; }
};

// ==============================
// ===== Get draft (by user/page)
// ==============================
router.get('/drafts', async (req, res) => {
  try {
    const { user_id, page_key } = req.query;

    if (!user_id || !page_key) {
      const { rows } = await db.query(
        `SELECT draft_id, user_id, workorder_id, page_key, payload, updated_at
         FROM drafts
         ORDER BY updated_at DESC
         LIMIT 100`
      );
      return res.json(rows);
    }

    const { rows } = await db.query(
      `SELECT draft_id, user_id, workorder_id, page_key, payload, updated_at
       FROM drafts
       WHERE user_id = $1 AND page_key = $2
       LIMIT 1`,
      [user_id, page_key]
    );

    if (!rows[0]) {
      return res.json({ user_id, page_key, payload: {} });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/drafts error:', err);
    res.status(500).json({ error: 'Failed to fetch draft' });
  }
});

// ==============================
// ===== Upsert draft
// ==============================
router.post('/drafts', async (req, res) => {
  try {
    const { user_id, workorder_id = null, page_key, payload = {} } = req.body || {};
    if (!user_id || !page_key) {
      return res.status(400).json({ error: 'user_id and page_key are required' });
    }

    const body = asJson(payload);

    const { rows } = await db.query(
      `INSERT INTO drafts (user_id, workorder_id, page_key, payload, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, now())
       ON CONFLICT (user_id, page_key)
       DO UPDATE SET
         workorder_id = EXCLUDED.workorder_id,
         payload      = EXCLUDED.payload,
         updated_at   = now()
       RETURNING draft_id, user_id, workorder_id, page_key, payload, updated_at`,
      [user_id, workorder_id, page_key, JSON.stringify(body)]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/drafts error:', err);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// ==============================
// ===== Delete draft
// ==============================
router.delete('/drafts', async (req, res) => {
  try {
    const { user_id, page_key } = req.query;
    if (!user_id || !page_key) {
      return res.status(400).json({ error: 'user_id and page_key are required' });
    }

    const { rowCount } = await db.query(
      `DELETE FROM drafts WHERE user_id = $1 AND page_key = $2`,
      [user_id, page_key]
    );

    return res.json({ success: true, deleted: rowCount });
  } catch (err) {
    console.error('DELETE /api/drafts error:', err);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

module.exports = router;
