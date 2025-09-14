// =====================================================
// server/controllers/serviceEquipmentController.js — Controller Layer
// =====================================================

const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

// =====================================================
// Utilities
// =====================================================
const pick = (src, keys) =>
  keys.reduce((acc, k) => {
    if (src[k] !== undefined) acc[k] = src[k];
    return acc;
  }, {});

// =====================================================
// List Service Equipment
// =====================================================
async function listServiceEquipment(req, res) {
  try {
    const { type, q, status, location, limit = 100, offset = 0 } = req.query;

    const where = [];
    const params = [];
    let idx = 1;

    if (type) {
      where.push(`equipment_type = $${idx++}`);
      params.push(type);
    }
    if (status) {
      where.push(`status = $${idx++}`);
      params.push(status);
    }
    if (location) {
      where.push(`location ILIKE $${idx++}`);
      params.push(`%${location}%`);
    }
    if (q) {
      where.push(`(equipment_tag ILIKE $${idx} OR brand ILIKE $${idx} OR model ILIKE $${idx} OR sn ILIKE $${idx})`);
      params.push(`%${q}%`);
      idx++;
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sql = `
      SELECT *
      FROM service_equipment
      ${whereSql}
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
      LIMIT $${idx++} OFFSET $${idx++};
    `;
    params.push(Number(limit));
    params.push(Number(offset));

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('listServiceEquipment error', err);
    res.status(500).json({ error: 'Failed to list service equipment' });
  }
}

// =====================================================
// Get One Service Equipment (with recent logs)
// =====================================================
async function getServiceEquipment(req, res) {
  try {
    const { id } = req.params;

    const eq = await pool.query(
      `SELECT * FROM service_equipment WHERE id = $1`,
      [id]
    );
    if (!eq.rows.length) return res.status(404).json({ error: 'Not found' });

    const logs = await pool.query(
      `SELECT * FROM service_equipment_maintenance_logs WHERE equipment_id = $1 ORDER BY performed_at DESC, created_at DESC LIMIT 250`,
      [id]
    );

    res.json({ equipment: eq.rows[0], logs: logs.rows });
  } catch (err) {
    console.error('getServiceEquipment error', err);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
}

// =====================================================
// Create Service Equipment
// =====================================================
async function createServiceEquipment(req, res) {
  try {
    const id = uuidv4();
    const allowed = [
      'equipment_tag',
      'equipment_type',
      'brand',
      'model',
      'sn',
      'location',
      'status'
    ];
    const body = pick(req.body || {}, allowed);
    const now = new Date();

    const { rows } = await pool.query(
      `
      INSERT INTO service_equipment
        (id, equipment_tag, equipment_type, brand, model, sn, location, status, created_at, updated_at)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
      `,
      [
        id,
        body.equipment_tag || null,
        body.equipment_type || null,
        body.brand || null,
        body.model || null,
        body.sn || null,
        body.location || null,
        body.status || null,
        now,
        now
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createServiceEquipment error', err);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
}

// =====================================================
// Update Service Equipment
// =====================================================
async function updateServiceEquipment(req, res) {
  try {
    const { id } = req.params;
    const allowed = [
      'equipment_tag',
      'equipment_type',
      'brand',
      'model',
      'sn',
      'location',
      'status'
    ];
    const body = pick(req.body || {}, allowed);

    const setClauses = [];
    const params = [];
    let idx = 1;

    Object.entries(body).forEach(([k, v]) => {
      setClauses.push(`${k} = $${idx++}`);
      params.push(v);
    });
    setClauses.push(`updated_at = NOW()`);

    if (!setClauses.length) return res.status(400).json({ error: 'No fields to update' });

    const sql = `
      UPDATE service_equipment
      SET ${setClauses.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;
    params.push(id);

    const { rows } = await pool.query(sql, params);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    res.json(rows[0]);
  } catch (err) {
    console.error('updateServiceEquipment error', err);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
}

// =====================================================
// Delete Service Equipment
// =====================================================
async function deleteServiceEquipment(req, res) {
  try {
    const { id } = req.params;

    await pool.query(`DELETE FROM service_equipment_maintenance_logs WHERE equipment_id = $1`, [id]);
    const { rowCount } = await pool.query(`DELETE FROM service_equipment WHERE id = $1`, [id]);

    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteServiceEquipment error', err);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
}

// =====================================================
// List Logs
// =====================================================
async function listLogs(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM service_equipment_maintenance_logs WHERE equipment_id = $1 ORDER BY performed_at DESC, created_at DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error('listLogs error', err);
    res.status(500).json({ error: 'Failed to list logs' });
  }
}

// =====================================================
// Create Log
// =====================================================
async function createLog(req, res) {
  try {
    const { id } = req.params;
    const logId = uuidv4();
    const allowed = ['performed_at', 'work_type', 'notes'];
    const body = pick(req.body || {}, allowed);
    const now = new Date();

    const { rows } = await pool.query(
      `
      INSERT INTO service_equipment_maintenance_logs
        (id, equipment_id, performed_at, work_type, notes, created_at)
      VALUES
        ($1,$2,$3,$4,$5,$6)
      RETURNING *;
      `,
      [
        logId,
        id,
        body.performed_at || null,
        body.work_type || null,
        body.notes || null,
        now
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createLog error', err);
    res.status(500).json({ error: 'Failed to create log' });
  }
}

// =====================================================
// Update Log
// =====================================================
async function updateLog(req, res) {
  try {
    const { id, logId } = req.params;
    const allowed = ['performed_at', 'work_type', 'notes'];
    const body = pick(req.body || {}, allowed);

    const setClauses = [];
    const params = [];
    let idx = 1;

    Object.entries(body).forEach(([k, v]) => {
      setClauses.push(`${k} = $${idx++}`);
      params.push(v);
    });

    if (!setClauses.length) return res.status(400).json({ error: 'No fields to update' });

    const sql = `
      UPDATE service_equipment_maintenance_logs
      SET ${setClauses.join(', ')}
      WHERE id = $${idx++} AND equipment_id = $${idx}
      RETURNING *;
    `;
    params.push(logId, id);

    const { rows } = await pool.query(sql, params);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    res.json(rows[0]);
  } catch (err) {
    console.error('updateLog error', err);
    res.status(500).json({ error: 'Failed to update log' });
  }
}

// =====================================================
// Delete Log
// =====================================================
async function deleteLog(req, res) {
  try {
    const { id, logId } = req.params;
    const { rowCount } = await pool.query(
      `DELETE FROM service_equipment_maintenance_logs WHERE id = $1 AND equipment_id = $2`,
      [logId, id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteLog error', err);
    res.status(500).json({ error: 'Failed to delete log' });
  }
}

module.exports = {
  listServiceEquipment,
  getServiceEquipment,
  createServiceEquipment,
  updateServiceEquipment,
  deleteServiceEquipment,
  listLogs,
  createLog,
  updateLog,
  deleteLog
};
