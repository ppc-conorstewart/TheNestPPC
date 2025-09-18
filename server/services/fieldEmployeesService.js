const pool = require('../db');

const LIST_EMPLOYEES_SQL = `
  SELECT
    e.id,
    e.full_name,
    e.base_location,
    e.rank,
    e.level,
    e.is_active,
    e.created_at,
    e.updated_at,
    COALESCE(n.body, '') AS notes,
    COALESCE(c.data, '{}'::jsonb) AS competencies,
    COALESCE(
      json_agg(
        jsonb_build_object(
          'id', d.id,
          'original_filename', d.original_filename,
          'mime_type', d.mime_type,
          'uploaded_at', d.uploaded_at
        )
        ORDER BY d.uploaded_at DESC
      ) FILTER (WHERE d.id IS NOT NULL),
      '[]'::json
    ) AS documents
  FROM field_employees e
  LEFT JOIN field_employee_notes n ON n.employee_id = e.id
  LEFT JOIN field_employee_competencies c ON c.employee_id = e.id
  LEFT JOIN field_employee_documents d ON d.employee_id = e.id
  GROUP BY e.id, n.body, c.data
  ORDER BY e.full_name ASC;
`;

const INSERT_EMPLOYEE_SQL = `
  INSERT INTO field_employees (full_name, base_location, rank, level)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
`;

const UPDATE_EMPLOYEE_SQL = `
  UPDATE field_employees
  SET full_name = COALESCE($2, full_name),
      base_location = COALESCE($3, base_location),
      rank = COALESCE($4, rank),
      level = COALESCE($5, level),
      is_active = COALESCE($6, is_active)
  WHERE id = $1
  RETURNING *;
`;

const UPSERT_NOTES_SQL = `
  INSERT INTO field_employee_notes (employee_id, body)
  VALUES ($1, $2)
  ON CONFLICT (employee_id)
  DO UPDATE SET body = EXCLUDED.body, updated_at = now()
  RETURNING body, updated_at;
`;

const UPSERT_COMP_SQL = `
  INSERT INTO field_employee_competencies (employee_id, data)
  VALUES ($1, $2::jsonb)
  ON CONFLICT (employee_id)
  DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  RETURNING data, updated_at;
`;

const INSERT_DOCUMENT_SQL = `
  INSERT INTO field_employee_documents (employee_id, original_filename, mime_type, file_bytes)
  VALUES ($1, $2, $3, $4)
  RETURNING id, original_filename, mime_type, uploaded_at;
`;

const SELECT_DOCUMENT_SQL = `
  SELECT id, employee_id, original_filename, mime_type, file_bytes, uploaded_at
  FROM field_employee_documents
  WHERE employee_id = $1 AND id = $2;
`;

const DELETE_DOCUMENT_SQL = `
  DELETE FROM field_employee_documents
  WHERE employee_id = $1 AND id = $2;
`;

const DELETE_EMPLOYEE_SQL = `
  DELETE FROM field_employees WHERE id = $1;
`;

async function listEmployees() {
  const { rows } = await pool.query(LIST_EMPLOYEES_SQL);
  return rows.map(row => ({
    ...row,
    documents: Array.isArray(row.documents) ? row.documents : []
  }));
}

async function createEmployee({ fullName, baseLocation, rank = 0, level = 0 }) {
  const { rows } = await pool.query(INSERT_EMPLOYEE_SQL, [fullName, baseLocation || null, rank, level]);
  return rows[0];
}

async function updateEmployeeInfo(id, { fullName, baseLocation, rank, level, isActive }) {
  const { rows } = await pool.query(UPDATE_EMPLOYEE_SQL, [id, fullName || null, baseLocation || null, rank, level, isActive]);
  return rows[0];
}

async function upsertNotes(id, body) {
  const { rows } = await pool.query(UPSERT_NOTES_SQL, [id, body || '']);
  return rows[0];
}

async function upsertCompetencies(id, data) {
  const payload = data ? JSON.stringify(data) : '{}';
  const { rows } = await pool.query(UPSERT_COMP_SQL, [id, payload]);
  return rows[0];
}

async function listDocuments(id) {
  const { rows } = await pool.query(
    `SELECT id, original_filename, mime_type, uploaded_at FROM field_employee_documents WHERE employee_id = $1 ORDER BY uploaded_at DESC`,
    [id]
  );
  return rows;
}

async function addDocuments(id, files = []) {
  const inserted = [];
  for (const file of files) {
    const { rows } = await pool.query(INSERT_DOCUMENT_SQL, [id, file.originalname, file.mimetype, file.buffer]);
    inserted.push(rows[0]);
  }
  return inserted;
}

async function getDocument(employeeId, documentId) {
  const { rows } = await pool.query(SELECT_DOCUMENT_SQL, [employeeId, documentId]);
  return rows[0] || null;
}

async function deleteDocument(employeeId, documentId) {
  await pool.query(DELETE_DOCUMENT_SQL, [employeeId, documentId]);
}

async function deleteEmployee(id) {
  await pool.query(DELETE_EMPLOYEE_SQL, [id]);
}

module.exports = {
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
};
