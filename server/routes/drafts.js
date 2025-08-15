// ==============================
// server/routes/drafts.js
// Drafts CRUD (PostgreSQL)
// ==============================

const express = require('express');
const { v4: uuidv4 } = require('uuid');


const router = express.Router();

// Upsert a draft
router.post('/drafts', async (req, res) => {
  try {
    const { user_id, workorder_id, page_key, payload } = req.body;
    if (!user_id || !page_key || payload === undefined) {
      return res.status(400).json({ error: 'Missing user_id, page_key, or payload' });
    }

    const draftId = uuidv4();
    const sql = `
      INSERT INTO drafts (draft_id, user_id, workorder_id, page_key, payload, updated_at)
      VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
      ON CONFLICT (user_id, page_key)
      DO UPDATE SET
        payload    = EXCLUDED.payload,
        updated_at = EXCLUDED.updated_at,
        workorder_id = EXCLUDED.workorder_id
      RETURNING draft_id;
    `;
    const params = [draftId, user_id, workorder_id || null, page_key, JSON.stringify(payload)];
    const { rows } = await db.query(sql, params);

    res.json({ success: true, draft_id: rows[0].draft_id });
  } catch (err) {
    console.error('POST /drafts error:', err);
    res.status(500).json({ error: 'Failed to upsert draft' });
  }
});

// Fetch a draft
router.get('/drafts', async (req, res) => {
  try {
    const { user_id, page_key } = req.query;
    if (!user_id || !page_key) {
      return res.status(400).json({ error: 'Missing user_id or page_key' });
    }

    const { rows } = await db.query(
      `SELECT draft_id, user_id, workorder_id, page_key, payload, updated_at
       FROM drafts
       WHERE user_id = $1 AND page_key = $2`,
      [user_id, page_key]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('GET /drafts error:', err);
    res.status(500).json({ error: 'Failed to fetch draft' });
  }
});

// Delete a draft
router.delete('/drafts', async (req, res) => {
  try {
    const user_id = req.query.user_id || req.body?.user_id;
    const page_key = req.query.page_key || req.body?.page_key;
    if (!user_id || !page_key) {
      return res.status(400).json({ error: 'Missing user_id or page_key' });
    }

    const { rowCount } = await db.query(
      `DELETE FROM drafts WHERE user_id = $1 AND page_key = $2`,
      [user_id, page_key]
    );

    res.json({ success: true, deleted: rowCount });
  } catch (err) {
    console.error('DELETE /drafts error:', err);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

module.exports = router;
