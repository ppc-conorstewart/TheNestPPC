// ============================================
// server/services/masterAssignments.service.js
// Master Assignments core service
// ============================================

const db = require('../db');
const assetService = require('./assets');

// ------------------ helpers ------------------
function normalizeSlot(child, slot) {
  const m = /-([A-Za-z0-9]+)$/.exec((child || '').trim());
  const letter = m ? m[1] : null;
  let s = (slot || '').trim();
  if (letter) {
    const re = new RegExp('^' + letter + '\\s*[-:_]\\s*', 'i');
    s = s.replace(re, '').trim();
  }
  return s;
}
function assemblyAbbrev(assemblyTitle = '') {
  const t = assemblyTitle.trim().toLowerCase();
  if (t === 'dog bones')   return 'DB';
  if (t === 'zippers')     return 'ZIP';
  if (t === 'flowcrosses') return 'FC';
  if (t === 'missiles')    return 'MI';
  return null;
}
function childSuffix(child = '') {
  const t = (child || '').trim();
  const mNum = /^Missile-(\d+)/i.exec(t);
  if (mNum) return mNum[1];
  const m = /-\s*([A-Za-z0-9]+)\)?$/.exec(t);
  return m ? m[1].toUpperCase() : null;
}
function computeMAStatus(assemblyTitle, child) {
  const abbr = assemblyAbbrev(assemblyTitle);
  const suf = childSuffix(child);
  if (!abbr || !suf) return 'In-Use';
  if (abbr === 'MI') return `MA-MI-${suf}`;
  return `MA (${abbr}-${suf})`;
}
async function setAssetStatus(assetId, status) {
  await db.query('UPDATE assets SET status = $1 WHERE id = $2', [status, assetId]);
  let color = null;
  if (/^MA-MI-\d+$/i.test(status)) color = '#A64DFF';
  else if (/^MA\s*\(/i.test(status)) color = '#F5D742';
  try { await db.query('UPDATE assets SET status_color = $1 WHERE id = $2', [color, assetId]); } catch {}
}

// ------------------ assignments ------------------
async function getAllAssignments() {
  const { rows } = await db.query('SELECT * FROM master_assignments');
  return rows;
}
async function getAssignmentsForChild(assembly, child) {
  const { rows } = await db.query(
    `SELECT assembly, child, slot, asset_id, updated_by, updated_at
       FROM master_assignments
      WHERE assembly = $1 AND child = $2 AND (slot IS NULL OR slot <> '__meta__')`,
    [assembly, child]
  );
  const meta = await db.query(
    `SELECT status, creation_date, recert_date
       FROM master_assignments
      WHERE assembly = $1 AND child = $2
        AND slot = '__meta__'
      ORDER BY updated_at DESC
      LIMIT 1`,
    [assembly, child]
  );
  const metaRow = meta.rows[0] || {};
  return rows.map(r => ({
    assembly: r.assembly,
    child: r.child,
    slot: normalizeSlot(child, r.slot),
    asset_id: r.asset_id,
    updated_by: r.updated_by,
    updated_at: r.updated_at,
    // rows don’t carry meta; caller can read it from /meta or this join
    meta_status: metaRow.status || null,
    creation_date: metaRow.creation_date || null,
    recert_date: metaRow.recert_date || null,
  }));
}
async function upsertAssignment({ assembly, child, slot, asset_id, updated_by }) {
  const cleanSlot = normalizeSlot(child, slot);
  const prev = await db.query(
    'SELECT asset_id FROM master_assignments WHERE assembly = $1 AND child = $2 AND slot = $3',
    [assembly, child, cleanSlot]
  );
  const prevAssetId = prev.rows[0]?.asset_id || null;

  await db.query(
    'DELETE FROM master_assignments WHERE assembly = $1 AND child = $2 AND slot = $3',
    [assembly, child, cleanSlot]
  );

  if (asset_id) {
    await db.query(
      `INSERT INTO master_assignments
         (assembly, child, slot, asset_id, updated_by, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [assembly, child, cleanSlot, asset_id, updated_by || 'Unknown', new Date()]
    );
  }

  if (prevAssetId && prevAssetId !== asset_id) {
    await setAssetStatus(prevAssetId, 'Available');
    try {
      await assetService.addActivityLog({
        action: 'Removed from Master Assembly',
        asset_id: prevAssetId,
        details: JSON.stringify({
          action: 'Removed from Master Assembly',
          assembly, child, slot: cleanSlot, new_status: 'Available'
        }),
        user: updated_by || 'system',
      });
    } catch {}
  }

  if (asset_id) {
    const status = computeMAStatus(assembly, child);
    await setAssetStatus(asset_id, status);
    try {
      await assetService.addActivityLog({
        action: 'Added to Master Assembly',
        asset_id,
        details: JSON.stringify({
          action: 'Added to Master Assembly',
          assembly, child, slot: cleanSlot, new_status: status
        }),
        user: updated_by || 'system',
      });
    } catch {}
  }
  return { success: true };
}
async function deleteAssignment({ assembly, child, slot, new_status, notes, updated_by }) {
  const cleanSlot = normalizeSlot(child, slot);
  const prev = await db.query(
    'SELECT asset_id FROM master_assignments WHERE assembly = $1 AND child = $2 AND slot = $3',
    [assembly, child, cleanSlot]
  );
  const prevAssetId = prev.rows[0]?.asset_id || null;

  await db.query(
    'DELETE FROM master_assignments WHERE assembly = $1 AND child = $2 AND slot = $3',
    [assembly, child, cleanSlot]
  );

  if (prevAssetId) {
    const finalStatus = (new_status && String(new_status).trim()) || 'Available';
    await setAssetStatus(prevAssetId, finalStatus);
    try {
      await assetService.addActivityLog({
        action: 'Removed from Master Assembly',
        asset_id: prevAssetId,
        details: JSON.stringify({
          action: 'Removed from Master Assembly',
          assembly, child, slot: cleanSlot, new_status: finalStatus, notes: notes || ''
        }),
        user: updated_by || 'system',
      });
    } catch {}
  }
  return { success: true };
}
async function getSummaryForAssembly(assembly) {
  const { rows } = await db.query(
    `WITH latest_meta AS (
       SELECT DISTINCT ON (child) child, status, updated_at
         FROM master_assignments
        WHERE assembly = $1 AND slot = '__meta__'
        ORDER BY child, updated_at DESC
     ),
     child_counts AS (
       SELECT child,
              COUNT(*) FILTER (WHERE slot <> '__meta__' AND asset_id IS NOT NULL) AS assigned_count,
              BOOL_OR(TRUE) AS any_rows
         FROM master_assignments
        WHERE assembly = $1
        GROUP BY child
     )
     SELECT c.child, c.assigned_count,
            COALESCE(lm.status, 'Inactive') AS status,
            (COALESCE(lm.status, 'Inactive') = 'Active') AS active
       FROM child_counts c
  LEFT JOIN latest_meta lm ON lm.child = c.child
   ORDER BY c.child ASC`,
    [assembly]
  );
  return rows || [];
}

// ------------------ meta (status + dates) ------------------
const ALLOWED_STATUSES = new Set(['Active','Inactive','Offline','Torn Down']);
function normalizeStatus(s) {
  const x = String(s || '').trim();
  if (!x) return 'Inactive';
  if (ALLOWED_STATUSES.has(x)) return x;
  const low = x.toLowerCase().replace(/\s+/g, ' ').trim();
  if (low === 'active') return 'Active';
  if (low === 'inactive' || low === 'in-active' || low === 'in active') return 'Inactive';
  if (low === 'offline') return 'Offline';
  if (low === 'torn down' || low === 'torn-down' || low === 'disassembled' || low === 'dis-assembled') return 'Torn Down';
  return 'Inactive';
}

async function getMeta(assembly, child) {
  const metaRow = await db.query(
    `SELECT status, creation_date, recert_date, updated_at
       FROM master_assignments
      WHERE assembly = $1 AND child = $2 AND slot = '__meta__'
      ORDER BY updated_at DESC
      LIMIT 1`,
    [assembly, child]
  );
  if (metaRow.rows[0]) {
    const row = metaRow.rows[0];
    return {
      status: row.status || 'Inactive',
      creation_date: row.creation_date || null,
      recert_date: row.recert_date || null,
    };
  }
  return { status: 'Inactive', creation_date: null, recert_date: null };
}

async function putMeta({ assembly, child, status, creation_date, recert_date, updated_by }) {
  const safeStatus = normalizeStatus(status);

  const hasCreation = !!creation_date;
  const isoCreation = hasCreation ? new Date(creation_date).toISOString().slice(0,10) : null;
  let isoRecert = null;
  if (hasCreation) {
    isoRecert = recert_date
      ? new Date(recert_date).toISOString().slice(0,10)
      : (() => { const d = new Date(isoCreation); d.setMonth(d.getMonth() + 6); return d.toISOString().slice(0,10); })();
  }

  await db.query('BEGIN');
  try {
    // maintain a single __meta__ row
    await db.query(
      `DELETE FROM master_assignments WHERE assembly = $1 AND child = $2 AND slot = '__meta__'`,
      [assembly, child]
    );
    await db.query(
      `INSERT INTO master_assignments
         (assembly, child, slot, asset_id, updated_by, updated_at, status, creation_date, recert_date)
       VALUES ($1,$2,'__meta__',NULL,$3,$4,$5,$6,$7)`,
      [assembly, child, updated_by || 'system', new Date(), safeStatus, isoCreation, isoRecert]
    );

    // IMPORTANT: Do NOT propagate META status to slot rows.
    // Asset rows must keep their "MA (DB-X)" statuses.
    // (If you want to propagate dates, add a separate UPDATE here.)

    await db.query('COMMIT');
  } catch (e) {
    await db.query('ROLLBACK');
    throw e;
  }

  return { success: true };
}

// ------------------ gaskets ------------------
async function getGaskets(assembly, child) {
  const { rows } = await db.query(
    `SELECT gasket_slot, gasket_id, gasket_date, updated_by, updated_at
       FROM master_gaskets
      WHERE assembly = $1 AND child = $2
      ORDER BY gasket_slot ASC`,
    [assembly, child]
  );
  return rows;
}
async function putGasketsBulk({ assembly, child, items = [], updated_by }) {
  const cleaned = (items || []).map(i => ({
    slot: String(i?.gasket_slot || '').trim(),
    id: String(i?.gasket_id || '').trim(),
    date: i?.gasket_date ? new Date(i.gasket_date).toISOString().slice(0,10) : null,
  }));

  const blanks = cleaned.filter(i => !i.id && i.slot).map(i => i.slot);
  if (blanks.length > 0) {
    await db.query(
      `DELETE FROM master_gaskets
        WHERE assembly = $1 AND child = $2 AND gasket_slot = ANY($3::text[])`,
      [assembly, child, blanks]
    );
  }

  const ups = cleaned.filter(i => i.id && i.slot);
  for (const row of ups) {
    await db.query(
      `INSERT INTO master_gaskets (assembly, child, gasket_slot, gasket_id, gasket_date, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (assembly, child, gasket_slot)
       DO UPDATE SET gasket_id = EXCLUDED.gasket_id,
                     gasket_date = EXCLUDED.gasket_date,
                     updated_by = EXCLUDED.updated_by,
                     updated_at = NOW()`,
      [assembly, child, row.slot, row.id, row.date, updated_by || 'system']
    );
  }
  return { success: true };
}

// ------------------ unified save ------------------
async function saveMasterAssembly({
  assembly, child,
  status, creation_date, recert_date,
  assignments = [], gaskets = [],
  updated_by
}) {
  // 1) update slot rows first (sets assets to "MA (DB-X)")
  for (const a of (assignments || [])) {
    await upsertAssignment({ assembly, child, slot: a.slot, asset_id: a.asset_id, updated_by });
  }
  if (Array.isArray(gaskets) && gaskets.length > 0) {
    await putGasketsBulk({ assembly, child, items: gaskets, updated_by });
  }
  // 2) write META last (no propagation into slot rows)
  await putMeta({ assembly, child, status, creation_date, recert_date, updated_by });
  return { success: true };
}

// ------------------ history ------------------
async function getHistory(limit = 400) {
  const { rows } = await db.query(
    `SELECT time, action, slot, asset_id, asset_name, "user"
       FROM master_history_log
      ORDER BY time DESC
      LIMIT $1`,
    [limit]
  );
  return rows;
}
async function addHistory({ time, action, slot, asset_id, asset_name, user }) {
  await db.query(
    `INSERT INTO master_history_log (time, action, slot, asset_id, asset_name, "user")
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [time || new Date(), action, slot, asset_id, asset_name, user || 'Unknown']
  );
  return { success: true };
}

// ------------------ exports ------------------
module.exports = {
  normalizeSlot,
  computeMAStatus,
  getAllAssignments,
  getAssignmentsForChild,
  upsertAssignment,
  deleteAssignment,
  getSummaryForAssembly,
  getMeta,
  putMeta,
  getGaskets,
  putGasketsBulk,
  saveMasterAssembly,
  getHistory,
  addHistory,
};
