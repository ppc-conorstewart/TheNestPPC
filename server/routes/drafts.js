// server/routes/drafts.js
const express       = require('express');
const { v4: uuidv4 } = require('uuid');
const db            = require('../utils/dbInit');
const router        = express.Router();

// 1) Upsert a draft (create or update)
router.post('/drafts', (req, res) => {
  const { user_id, workorder_id, page_key, payload } = req.body;
  const now     = new Date().toISOString();
  const draftId = uuidv4();

  const stmt = db.prepare(`
    INSERT INTO drafts 
      (draft_id, user_id, workorder_id, page_key, payload, updated_at)
    VALUES
      (@draft_id, @user_id, @workorder_id, @page_key, @payload, @updated_at)
    ON CONFLICT(user_id, page_key)
    DO UPDATE SET
      payload    = excluded.payload,
      updated_at = excluded.updated_at;
  `);

  stmt.run({
    draft_id:     draftId,
    user_id,
    workorder_id: workorder_id || null,
    page_key,
    payload:      JSON.stringify(payload),
    updated_at:   now
  });

  res.json({ success: true, draft_id: draftId });
});

// 2) Fetch a draft for a given user + page
router.get('/drafts', (req, res) => {
  const { user_id, page_key } = req.query;
  const row = db
    .prepare(`SELECT * FROM drafts WHERE user_id = ? AND page_key = ?`)
    .get(user_id, page_key);

  if (!row) {
    return res.status(404).json({ error: 'Draft not found' });
  }
 
  // Parse the JSON blob back into an object
  row.payload = JSON.parse(row.payload);
  res.json(row);
});

// DELETE /api/drafts?user_id=…&page_key=…
router.delete('/drafts', (req, res) => {
  // Support both query and body for flexibility:
  const user_id = req.query.user_id || req.body?.user_id;
  const page_key = req.query.page_key || req.body?.page_key;
  if (!user_id || !page_key) {
    return res.status(400).json({ error: 'Missing user_id or page_key' });
  }

  const info = db
    .prepare(`DELETE FROM drafts WHERE user_id = ? AND page_key = ?`)
    .run(user_id, page_key);

  res.json({ success: true, deleted: info.changes });
});


module.exports = router;
