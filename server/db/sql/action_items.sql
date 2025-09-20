-- =============================================
-- Action Items schema for Paloma NEST
-- Creates action_items and action_item_stakeholders tables
-- =============================================

CREATE TABLE IF NOT EXISTS action_items (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Normal',
  category TEXT NOT NULL DEFAULT 'General',
  due_date DATE,
  attachment_url TEXT,
  attachment_name TEXT,
  stakeholders TEXT[] NOT NULL DEFAULT '{}',
  stakeholder_ids TEXT[] NOT NULL DEFAULT '{}',
  acknowledged_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS action_item_stakeholders (
  id BIGSERIAL PRIMARY KEY,
  action_item_id INTEGER NOT NULL REFERENCES action_items(id) ON DELETE CASCADE,
  external_id TEXT,
  name TEXT NOT NULL,
  ack_token UUID NOT NULL UNIQUE,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  sort_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_action_item_stakeholders_action_item_id
  ON action_item_stakeholders(action_item_id);

CREATE INDEX IF NOT EXISTS idx_action_item_stakeholders_ack_token
  ON action_item_stakeholders(ack_token);

CREATE INDEX IF NOT EXISTS idx_action_item_stakeholders_external_id
  ON action_item_stakeholders(external_id);
