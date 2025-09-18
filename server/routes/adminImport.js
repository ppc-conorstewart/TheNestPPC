// ==============================
// FILE: server/routes/adminImport.js
// Sections: Imports • Config • Helpers • Routes • Exports
// ==============================
const express = require('express');
const path = require('path');
const fs = require('fs');
const { memoryUpload, uploadDir } = require('../utils/uploads');

// ------------------------------
// Config
// ------------------------------
const router = express.Router();
const ADMIN_KEY = process.env.ADMIN_IMPORT_KEY || '';

// ------------------------------
// Helpers
// ------------------------------
function ensureParentDirs(absPath) {
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function authOk(req) {
  const hdr = req.headers['x-admin-key'] || '';
  return ADMIN_KEY && hdr === ADMIN_KEY;
}

// ------------------------------
// Routes
// ------------------------------
// Health check
router.get('/seed/health', (req, res) => {
  if (!ADMIN_KEY) return res.status(500).json({ error: 'ADMIN_IMPORT_KEY not set' });
  return res.json({ ok: true, uploadDir });
});

// Seed a single file
// Form-Data: file=<binary>, relPath=<relative path under uploads>
// Headers:   x-admin-key=<ADMIN_IMPORT_KEY>
router.post('/seed', memoryUpload.single('file'), (req, res) => {
  try {
    if (!authOk(req)) return res.status(401).json({ error: 'unauthorized' });
    if (!req.file || !req.body || !req.body.relPath) {
      return res.status(400).json({ error: 'file and relPath required' });
    }
    const rel = String(req.body.relPath).replace(/^[/\\]+/, '');
    const abs = path.join(uploadDir, rel);
    ensureParentDirs(abs);
    fs.writeFileSync(abs, req.file.buffer);
    const publicUrl = `/uploads/${rel.replace(/\\/g, '/')}`;
    return res.json({ ok: true, relPath: rel, url: publicUrl });
  } catch (err) {
    console.error('admin seed error:', err);
    return res.status(500).json({ error: 'seed failed' });
  }
});

// ------------------------------
// Exports
// ------------------------------
module.exports = router;
