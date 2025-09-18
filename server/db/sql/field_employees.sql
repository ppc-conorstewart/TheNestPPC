-- ================================================
-- Field Employees schema
-- ================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS field_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  base_location TEXT,
  rank INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS field_employee_notes (
  employee_id UUID PRIMARY KEY REFERENCES field_employees(id) ON DELETE CASCADE,
  body TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS field_employee_competencies (
  employee_id UUID PRIMARY KEY REFERENCES field_employees(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS field_employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES field_employees(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  mime_type TEXT,
  file_bytes BYTEA NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_field_employees ON field_employees;
CREATE TRIGGER set_timestamp_field_employees
BEFORE UPDATE ON field_employees
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_field_employee_notes ON field_employee_notes;
CREATE TRIGGER set_timestamp_field_employee_notes
BEFORE UPDATE ON field_employee_notes
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_field_employee_competencies ON field_employee_competencies;
CREATE TRIGGER set_timestamp_field_employee_competencies
BEFORE UPDATE ON field_employee_competencies
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_field_employee_documents ON field_employee_documents;
CREATE TRIGGER set_timestamp_field_employee_documents
BEFORE UPDATE ON field_employee_documents
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
