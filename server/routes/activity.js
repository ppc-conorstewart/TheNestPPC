// ==============================
// routes/activity.js — Asset activity API (dedupe, filter, format)
// ==============================
const express = require('express');
const assetService = require('../services/assets');

const router = express.Router();

// ==============================
// Helpers: parse + normalize details
// ==============================
function parseDetails(details) {
  if (!details) return {};
  try {
    return typeof details === 'string' ? JSON.parse(details) : details;
  } catch {
    return {};
  }
}

function normalizeRow(raw) {
  const d = parseDetails(raw.details);
  const action = raw.action || raw.action_type || '';
  const assembly_name  = raw.assembly_name || d.assembly || null;
  const assembly_child = raw.assembly_child || d.child || null;
  const assembly_slot  = raw.assembly_slot || d.slot || null;
  const status_from    = raw.status_from || d.previous_status || null;
  const status_to      = raw.status_to   || d.new_status      || null;
  const notes          = raw.notes || d.notes || null;
  const ts             = raw.timestamp || raw.time || raw.created_at || null;

  // Canonical formatted string
  let formatted = '';
  if (action === 'Added to Master Assembly') {
    formatted = `${raw.asset_id} | Added to Master Assembly: ${assembly_child || ''}${assembly_name ? ` (${assembly_name}${assembly_slot ? ` — ${assembly_slot}` : ''})` : ''} • Status Updated to: ${status_to || '-'}`;
  } else if (action === 'Removed from Master Assembly') {
    formatted = `${raw.asset_id} | Removed from Master Assembly: ${assembly_child || ''}${assembly_name ? ` (${assembly_name}${assembly_slot ? ` — ${assembly_slot}` : ''})` : ''} | Status Updated to: ${status_to || '-'}`;
  } else if (action === 'Updated Asset' || action === 'Update Asset' || action === 'Asset Updated') {
    formatted = `Asset Updated to: ${status_to || status_from || '-'}`;
  } else {
    formatted = action || '';
  }

  return {
    ...raw,
    action,
    user: raw.user || raw.updated_by || 'Unknown',
    timestamp: ts,
    assembly_name,
    assembly_child,
    assembly_slot,
    status_from,
    status_to,
    notes,
    formatted
  };
}

// ==============================
// Dedupe + Filter rules
//  - Drop "Updated Asset" rows with no meaningful status_to
//  - Dedupe identical events occurring at the same second
// ==============================
function keyFor(row) {
  // round timestamp to whole second for stability
  const t = row.timestamp ? new Date(row.timestamp) : null;
  const second = t ? Math.floor(t.getTime() / 1000) : 0;
  return [
    row.asset_id || '',
    row.action || '',
    row.assembly_name || '',
    row.assembly_child || '',
    row.assembly_slot || '',
    row.status_to || '',
    row.status_from || '',
    row.notes || '',
    second
  ].join('|');
}

function condenseAndFilter(rows) {
  const map = new Map();
  for (const r of rows) {
    // Filter out noisy "Updated Asset" entries with no status_to
    if (
      (r.action === 'Updated Asset' || r.action === 'Update Asset' || r.action === 'Asset Updated') &&
      (!r.status_to || r.status_to === '-' || r.status_to === 'null')
    ) {
      continue;
    }
    const k = keyFor(r);
    if (!map.has(k)) map.set(k, r); // keep first
  }
  // sort newest first if service didn’t already
  return Array.from(map.values()).sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tb - ta;
  });
}

// ==============================
// GET: all activity (admin views)
// ==============================
router.get('/', async (_req, res) => {
  try {
    const logs = await assetService.getActivityLog();
    const normalized = Array.isArray(logs) ? logs.map(normalizeRow) : [];
    const cleaned = condenseAndFilter(normalized);
    res.json(cleaned);
  } catch (err) {
    console.error('Failed to fetch activity logs:', err);
    res.status(500).json({ error: 'Failed to load activity logs' });
  }
});

// ==============================
// GET: activity for one asset
// ==============================
router.get('/:assetId', async (req, res) => {
  try {
    const logs = await assetService.getActivityLogByAsset(req.params.assetId);
    const normalized = Array.isArray(logs) ? logs.map(normalizeRow) : [];
    const cleaned = condenseAndFilter(normalized);
    res.json(cleaned);
  } catch (err) {
    console.error('Failed to fetch asset activity:', err);
    res.status(500).json({ error: 'Failed to load asset activity' });
  }
});

// ==============================
// POST: append activity
// ==============================
router.post('/', async (req, res) => {
  try {
    const { action, asset_id, details, user } = req.body;
    await assetService.addActivityLog({ action, asset_id, details, user: user || 'system' });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Failed to add activity log:', err);
    res.status(500).json({ error: 'Failed to add activity log' });
  }
});

module.exports = router;
