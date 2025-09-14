// =====================================================
// server/routes/documents.js — Document API (BYTEA storage; List • Get • Stream • Download • Upload • Upload Batch • Update • Delete)
// Sections: Imports • Helpers • Routes
// =====================================================
const express = require('express');
const path = require('path');
const router = express.Router();

const documentsService = require('../services/documentsService');
const { docUpload } = require('../utils/uploads');

// =====================================================
// Helpers
// =====================================================
function sanitizeFilename(name = '') {
  return String(name).replace(/[\/\\?%*:|"<>]/g, '-').trim();
}
function fileUrlFor(id) {
  return `/api/documents/${id}/file`;
}

// =====================================================
// List
// =====================================================
router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim() || null;
    const category = (req.query.category || '').trim() || null;
    const limit = req.query.limit ? Number(req.query.limit) : 200;
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    const rows = await documentsService.listDocuments({ category, q, limit, offset });
    res.json(rows.map(r => ({ ...r, fileUrl: fileUrlFor(r.id) })));
  } catch (err) {
    next(err);
  }
});

// =====================================================
// Get (metadata)
// =====================================================
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await documentsService.getDocumentMeta(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json({ ...doc, fileUrl: fileUrlFor(doc.id) });
  } catch (err) {
    next(err);
  }
});

// =====================================================
// Stream Inline (view)
// =====================================================
router.get('/:id/file', async (req, res, next) => {
  try {
    const doc = await documentsService.getDocumentFull(req.params.id);
    if (!doc || !doc.file_bytes) return res.status(404).send('File not found');
    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    const safe = sanitizeFilename(doc.original_filename || 'document');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(safe)}"`);
    return res.send(Buffer.from(doc.file_bytes));
  } catch (err) {
    next(err);
  }
});

// =====================================================
// Download (attachment)
// =====================================================
router.get('/:id/download', async (req, res, next) => {
  try {
    const doc = await documentsService.getDocumentFull(req.params.id);
    if (!doc || !doc.file_bytes) return res.status(404).send('File not found');

    const orig = doc.original_filename || doc.title || `document-${doc.id}`;
    const ext = path.extname(orig) || '';
    const baseNoExt = path.basename(orig, ext);
    const downloadName = `${sanitizeFilename(baseNoExt)}${ext}`;

    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`);
    return res.send(Buffer.from(doc.file_bytes));
  } catch (err) {
    next(err);
  }
});

// =====================================================
// Upload (single)
// =====================================================
router.post('/', docUpload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const saved = await documentsService.createDocument({
      title: req.body.title,
      category: req.body.category || null,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      fileBuffer: file.buffer,
      user: req.user_id || null
    });

    res.json({ ...saved, fileUrl: fileUrlFor(saved.id) });
  } catch (err) {
    next(err);
  }
});

// =====================================================
// Upload (batch)
// =====================================================
router.post('/batch', docUpload.array('files', 50), async (req, res, next) => {
  try {
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: 'No files uploaded' });

    const results = [];
    for (const file of files) {
      const saved = await documentsService.createDocument({
        title: null,
        category: req.body.category || null,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        fileBuffer: file.buffer,
        user: req.user_id || null
      });
      results.push({ ...saved, fileUrl: fileUrlFor(saved.id) });
    }
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// =====================================================
// Update (rename)
// =====================================================
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const title = (req.body.title || '').trim();
    if (!title) return res.status(400).json({ error: 'Title required' });

    const updated = await documentsService.updateDocumentMeta(id, {
      title,
      category: null,
      user: req.user_id || null
    });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ ...updated, fileUrl: fileUrlFor(updated.id) });
  } catch (err) {
    next(err);
  }
});

// =====================================================
// Delete
// =====================================================
router.delete('/:id', async (req, res, next) => {
  try {
    const meta = await documentsService.getDocumentMeta(req.params.id);
    if (!meta) return res.status(404).json({ error: 'Not found' });

    await documentsService.deleteDocument(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
