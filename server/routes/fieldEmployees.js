const express = require('express');
const router = express.Router();

const {
  listEmployees,
  createEmployee,
  updateEmployeeInfo,
  upsertNotes,
  upsertCompetencies,
  addDocuments,
  listDocuments,
  getDocument,
  deleteDocument,
  deleteEmployee
} = require('../services/fieldEmployeesService');

const { docUpload } = require('../utils/uploads');

const mapEmployeeRow = (row, req) => {
  const baseUrl = req.protocol + '://' + req.get('host');
  const documents = (row.documents || []).map((doc) => ({
    id: doc.id,
    name: doc.original_filename,
    mime: doc.mime_type,
    uploaded_at: doc.uploaded_at,
    downloadUrl: `/api/field-employees/${row.id}/documents/${doc.id}/download`
  }));
  return {
    id: row.id,
    full_name: row.full_name,
    base_location: row.base_location,
    rank: row.rank,
    level: row.level,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
    notes: row.notes || '',
    competencies: row.competencies || {},
    documents
  };
};

router.get('/', async (req, res, next) => {
  try {
    const rows = await listEmployees();
    res.json(rows.map(row => mapEmployeeRow(row, req)));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { full_name, base_location, rank = 0, level = 0 } = req.body || {};
    if (!full_name) return res.status(400).json({ error: 'full_name is required' });
    const created = await createEmployee({
      fullName: full_name,
      baseLocation: base_location || null,
      rank: Number(rank) || 0,
      level: Number(level) || 0
    });
    const list = await listEmployees();
    const fresh = list.find(r => r.id === created.id);
    res.status(201).json(mapEmployeeRow(fresh || created, req));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, base_location, rank, level, is_active } = req.body || {};
    const updated = await updateEmployeeInfo(id, {
      fullName: full_name || null,
      baseLocation: base_location || null,
      rank: typeof rank === 'number' ? rank : rank != null ? Number(rank) : undefined,
      level: typeof level === 'number' ? level : level != null ? Number(level) : undefined,
      isActive: typeof is_active === 'boolean' ? is_active : undefined
    });
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    const list = await listEmployees();
    const fresh = list.find(r => r.id === id);
    res.json(mapEmployeeRow(fresh || updated, req));
  } catch (err) {
    next(err);
  }
});

router.put('/:id/notes', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req.body || {};
    await upsertNotes(id, body || '');
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/competencies', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data } = req.body || {};
    await upsertCompetencies(id, data || {});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/documents', async (req, res, next) => {
  try {
    const { id } = req.params;
    const docs = await listDocuments(id);
    res.json(docs.map(doc => ({
      id: doc.id,
      name: doc.original_filename,
      mime: doc.mime_type,
      uploaded_at: doc.uploaded_at,
      downloadUrl: `/api/field-employees/${id}/documents/${doc.id}/download`
    })));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/documents', docUpload.array('files', 20), async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: 'No files uploaded' });
    await addDocuments(id, files);
    const docs = await listDocuments(id);
    res.json(docs.map(doc => ({
      id: doc.id,
      name: doc.original_filename,
      mime: doc.mime_type,
      uploaded_at: doc.uploaded_at,
      downloadUrl: `/api/field-employees/${id}/documents/${doc.id}/download`
    })));
  } catch (err) {
    next(err);
  }
});

router.get('/:id/documents/:docId/download', async (req, res, next) => {
  try {
    const { id, docId } = req.params;
    const doc = await getDocument(id, docId);
    if (!doc) return res.status(404).send('Document not found');
    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.original_filename)}"`);
    return res.send(Buffer.from(doc.file_bytes));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/documents/:docId', async (req, res, next) => {
  try {
    const { id, docId } = req.params;
    await deleteDocument(id, docId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteEmployee(id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
