// =====================================================
// server/services/documentsService.js — Documents Service (BYTEA storage)
// Sections: Imports • SQL • Methods • Exports
// =====================================================

// ==============================
// Imports
// ==============================
const pool = require('../db');

// ==============================
// SQL
// ==============================
const SQL_INSERT = `
  INSERT INTO documents
    (title, category, original_filename, mime_type, size_bytes, file_bytes, created_by, updated_by)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$7)
  RETURNING id, title, category, original_filename, mime_type, size_bytes, created_by, updated_by, created_at, updated_at;
`;

const SQL_LIST = `
  SELECT id, title, category, original_filename, mime_type, size_bytes,
         created_by, updated_by, created_at, updated_at
  FROM documents
  WHERE ($1::text IS NULL OR category = $1::text)
    AND ($2::text IS NULL
         OR title ILIKE ('%'||$2::text||'%')
         OR original_filename ILIKE ('%'||$2::text||'%'))
  ORDER BY updated_at DESC
  LIMIT COALESCE($3::int,200)
  OFFSET COALESCE($4::int,0);
`;

const SQL_GET_META = `
  SELECT id, title, category, original_filename, mime_type, size_bytes,
         created_by, updated_by, created_at, updated_at
  FROM documents
  WHERE id = $1;
`;

const SQL_GET_FULL = `
  SELECT *
  FROM documents
  WHERE id = $1;
`;

const SQL_UPDATE_META = `
  UPDATE documents
     SET title = COALESCE($2, title),
         category = COALESCE($3, category),
         updated_by = COALESCE($4, updated_by),
         updated_at = now()
   WHERE id = $1
   RETURNING id, title, category, original_filename, mime_type, size_bytes,
             created_by, updated_by, created_at, updated_at;
`;

const SQL_DELETE = `DELETE FROM documents WHERE id = $1;`;

// ==============================
// Methods
// ==============================
async function createDocument({
  title,
  category,
  originalFilename,
  mimeType,
  sizeBytes,
  fileBuffer,
  user
}) {
  const safeTitle = (title && String(title).trim().length) ? String(title).trim() : originalFilename;
  const { rows } = await pool.query(SQL_INSERT, [
    safeTitle,
    category || null,
    originalFilename,
    mimeType,
    sizeBytes,
    fileBuffer,
    user || null
  ]);
  return rows[0];
}

async function listDocuments({ category = null, q = null, limit = 200, offset = 0 } = {}) {
  const { rows } = await pool.query(SQL_LIST, [category, q, limit, offset]);
  return rows;
}

async function getDocumentMeta(id) {
  const { rows } = await pool.query(SQL_GET_META, [id]);
  return rows[0] || null;
}

async function getDocumentFull(id) {
  const { rows } = await pool.query(SQL_GET_FULL, [id]);
  return rows[0] || null;
}

async function updateDocumentMeta(id, { title, category, user }) {
  const cleanTitle = (title && String(title).trim().length) ? String(title).trim() : null;
  const { rows } = await pool.query(SQL_UPDATE_META, [
    id,
    cleanTitle,
    category ?? null,
    user ?? null
  ]);
  return rows[0] || null;
}

async function deleteDocument(id) {
  await pool.query(SQL_DELETE, [id]);
  return { ok: true };
}

// ==============================
// Exports
// ==============================
module.exports = {
  createDocument,
  listDocuments,
  getDocumentMeta,
  getDocumentFull,
  updateDocumentMeta,
  deleteDocument
};
