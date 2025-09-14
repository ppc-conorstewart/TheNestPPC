// =====================================================
// FILE: server/routes/serviceEquipment.js
// =====================================================
// :contentReference[oaicite:0]{index=0}
// :contentReference[oaicite:1]{index=1}

/* ==============================
   Imports & Setup
   ============================== */
const express = require('express');
const router = express.Router();
const db = require('../db');

/* ==============================
   Helpers
   ============================== */
const TABLE = 'nest.service_equipment';

function mapRow(r) {
  return {
    id: r.id,
    category: r.category,
    ppc_number: r.ppc_number,
    product_type: r.product_type,
    serial_number: r.serial_number,
    model: r.model,
    unit_text: r.unit_text,
    location: r.location,
    status: r.status,
    notes: r.notes,
    created_at: r.created_at,
    updated_at: r.updated_at
  };
}

/* ==============================
   GET /api/service-equipment
   Query: category=accumulators|...
   Optional: q (search)
   ============================== */
router.get('/', async (req, res) => {
  try {
    const { category, q } = req.query;

    const params = [];
    const where = [];

    if (category) {
      params.push(category);
      where.push(`category = $${params.length}::nest.service_equipment_category`);
    }

    if (q && String(q).trim() !== '') {
      params.push(`%${String(q).trim()}%`);
      where.push(`(ppc_number ILIKE $${params.length} OR serial_number ILIKE $${params.length} OR model ILIKE $${params.length} OR unit_text ILIKE $${params.length} OR location ILIKE $${params.length})`);
    }

    const sql = `
      SELECT id, category, ppc_number, product_type, serial_number, model,
             unit_text, location, status, notes, created_at, updated_at
      FROM ${TABLE}
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY ppc_number ASC
    `;

    const { rows } = await db.query(sql, params);
    return res.json(rows.map(mapRow));
  } catch (err) {
    console.error('GET /service-equipment failed', err);
    return res.status(500).json({ error: 'Failed to load service equipment' });
  }
});

/* ==============================
   GET /api/service-equipment/:id
   ============================== */
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, category, ppc_number, product_type, serial_number, model,
              unit_text, location, status, notes, created_at, updated_at
       FROM ${TABLE}
       WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json(mapRow(rows[0]));
  } catch (err) {
    console.error('GET /service-equipment/:id failed', err);
    return res.status(500).json({ error: 'Failed to load item' });
  }
});

/* ==============================
   POST /api/service-equipment
   Body: { category, ppc_number, product_type, serial_number, model, unit_text, location, status, notes }
   ============================== */
router.post('/', async (req, res) => {
  try {
    const {
      category,
      ppc_number,
      product_type = null,
      serial_number = null,
      model = null,
      unit_text = null,
      location = null,
      status = 'active',
      notes = null
    } = req.body || {};

    if (!category || !ppc_number) {
      return res.status(400).json({ error: 'category and ppc_number are required' });
    }

    const sql = `
      INSERT INTO ${TABLE}
        (category, ppc_number, product_type, serial_number, model, unit_text, location, status, notes)
      VALUES
        ($1::nest.service_equipment_category, $2, $3, $4, $5, $6, $7, $8::nest.service_equipment_status, $9)
      ON CONFLICT (ppc_number) DO UPDATE SET
        category = EXCLUDED.category,
        product_type = EXCLUDED.product_type,
        serial_number = EXCLUDED.serial_number,
        model = EXCLUDED.model,
        unit_text = EXCLUDED.unit_text,
        location = EXCLUDED.location,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING id, category, ppc_number, product_type, serial_number, model,
                unit_text, location, status, notes, created_at, updated_at
    `;

    const { rows } = await db.query(sql, [
      category,
      ppc_number,
      product_type,
      serial_number,
      model,
      unit_text,
      location,
      status,
      notes
    ]);

    return res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    console.error('POST /service-equipment failed', err);
    return res.status(500).json({ error: 'Failed to upsert item' });
  }
});

/* ==============================
   PUT /api/service-equipment/:id
   ============================== */
router.put('/:id', async (req, res) => {
  try {
    const {
      category,
      ppc_number,
      product_type,
      serial_number,
      model,
      unit_text,
      location,
      status,
      notes
    } = req.body || {};

    const fields = [];
    const params = [];
    let idx = 1;

    if (category !== undefined) { fields.push(`category = $${idx++}::nest.service_equipment_category`); params.push(category); }
    if (ppc_number !== undefined) { fields.push(`ppc_number = $${idx++}`); params.push(ppc_number); }
    if (product_type !== undefined) { fields.push(`product_type = $${idx++}`); params.push(product_type); }
    if (serial_number !== undefined) { fields.push(`serial_number = $${idx++}`); params.push(serial_number); }
    if (model !== undefined) { fields.push(`model = $${idx++}`); params.push(model); }
    if (unit_text !== undefined) { fields.push(`unit_text = $${idx++}`); params.push(unit_text); }
    if (location !== undefined) { fields.push(`location = $${idx++}`); params.push(location); }
    if (status !== undefined) { fields.push(`status = $${idx++}::nest.service_equipment_status`); params.push(status); }
    if (notes !== undefined) { fields.push(`notes = $${idx++}`); params.push(notes); }

    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

    params.push(req.params.id);

    const sql = `
      UPDATE ${TABLE}
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING id, category, ppc_number, product_type, serial_number, model,
                unit_text, location, status, notes, created_at, updated_at
    `;

    const { rows } = await db.query(sql, params);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json(mapRow(rows[0]));
  } catch (err) {
    console.error('PUT /service-equipment/:id failed', err);
    return res.status(500).json({ error: 'Failed to update item' });
  }
});

/* ==============================
   DELETE /api/service-equipment/:id
   ============================== */
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query(`DELETE FROM ${TABLE} WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /service-equipment/:id failed', err);
    return res.status(500).json({ error: 'Failed to delete item' });
  }
});

/* ==============================
   Exports
   ============================== */
module.exports = router;
