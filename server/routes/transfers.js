// ==============================
// server/routes/transfers.js — Transfers API
// ==============================
const express = require('express');
const router = express.Router();
const db = require('../db');

console.log('TRANSFERS ROUTES LOADED');

// ==============================
// CREATE transfer (sets assets "In Transit")
// ==============================
router.post('/', async (req, res) => {
  console.log('POST /api/transfers called');
  const client = await db.connect();
  try {
    const {
      delivery_address,
      trucking_provider,
      status,
      assets,
      non_serialized_items,
      shipper,
      address,
      date,
      po_number,
      comments,
      receiver_name,
      receiver_phone,
      receiver_email,
      driver_name,
      driver_time,
      bol_total,
      signature,
    } = req.body;

    if (!delivery_address || !trucking_provider || !assets || !Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const assetIds = assets.map(a => typeof a === 'object' ? a.id : a).filter(Boolean);
    if (assetIds.length === 0) {
      return res.status(400).json({ error: 'No valid asset IDs supplied.' });
    }

    await client.query('BEGIN');

    // Create transfer
    const result = await client.query(
      `INSERT INTO transfers (
        delivery_address, trucking_provider, status, assets, non_serialized_items, shipper,
        address, date, po_number, comments, receiver_name, receiver_phone, receiver_email,
        driver_name, driver_time, bol_total, signature, created_at
      ) VALUES (
        $1, $2, $3, $4::jsonb, $5::jsonb, $6,
        $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, CURRENT_TIMESTAMP
      ) RETURNING id`,
      [
        delivery_address,
        trucking_provider,
        status || 'In Transit',
        JSON.stringify(assets),
        non_serialized_items ? JSON.stringify(non_serialized_items) : null,
        shipper,
        address,
        date,
        po_number,
        comments,
        receiver_name,
        receiver_phone,
        receiver_email,
        driver_name,
        driver_time,
        bol_total,
        signature,
      ]
    );
    const transferId = result.rows[0].id;

    // Set assets to "In Transit"
    await client.query(
      `UPDATE assets SET status = 'In Transit' WHERE id = ANY($1::text[])`,
      [assetIds]
    );

    // Log each asset
    for (const aid of assetIds) {
      await client.query(
        `INSERT INTO asset_activity_log (asset_id, action, details, "user", "timestamp")
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [aid, 'Transfer Out', JSON.stringify({ to: delivery_address, by: shipper }), shipper || 'system']
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ id: transferId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in POST /api/transfers:', err);
    res.status(500).json({ error: 'Failed to create transfer', detail: err.message });
  } finally {
    client.release();
  }
});

// ==============================
// GET all transfers
// ==============================
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM transfers ORDER BY id DESC');
    const rows = result.rows.map(row => ({
      ...row,
      assets: safeJsonParse(row.assets),
      non_serialized_items: safeJsonParse(row.non_serialized_items),
    }));
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch transfers:', err);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

// ==============================
// GET transfer by ID
// ==============================
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM transfers WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Transfer not found' });

    const row = result.rows[0];
    row.assets = safeJsonParse(row.assets);
    row.non_serialized_items = safeJsonParse(row.non_serialized_items);

    if (row.assets && row.assets.length > 0) {
      const assetDetails = [];
      for (const asset of row.assets) {
        const assetId = typeof asset === 'object' && asset.id ? asset.id : asset;
        const found = await db.query(
          'SELECT id, name, category, sn, status, location FROM assets WHERE id = $1',
          [assetId]
        );
        assetDetails.push(found.rows[0] || { id: assetId, name: '(Not found)' });
      }
      row.assets = assetDetails;
    }

    res.json(row);
  } catch (err) {
    console.error('Failed to fetch transfer:', err);
    res.status(500).json({ error: 'Failed to fetch transfer' });
  }
});

// ==============================
// PATCH transfer
// ==============================
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    status,
    delivery_address,
    trucking_provider,
    receiver_name,
    receiver_phone,
    receiver_email,
    driver_name,
    driver_time,
    signature
  } = req.body;

  try {
    const result = await db.query('SELECT * FROM transfers WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Transfer not found' });

    const old = result.rows[0];
    await db.query(
      `UPDATE transfers SET
        status = $1,
        delivery_address = $2,
        trucking_provider = $3,
        receiver_name = $4,
        receiver_phone = $5,
        receiver_email = $6,
        driver_name = $7,
        driver_time = $8,
        signature = $9
      WHERE id = $10`,
      [
        status || old.status,
        delivery_address || old.delivery_address,
        trucking_provider || old.trucking_provider,
        receiver_name || old.receiver_name,
        receiver_phone || old.receiver_phone,
        receiver_email || old.receiver_email,
        driver_name || old.driver_name,
        driver_time || old.driver_time,
        signature || old.signature,
        id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update transfer:', err);
    res.status(500).json({ error: 'Failed to update transfer' });
  }
});

// ==============================
// RECEIVE-ALL — set Active + location, log, close
// ==============================
router.post('/:id/receive-all', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM transfers WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Transfer not found' });

    const transfer = result.rows[0];
    const assets = safeJsonParse(transfer.assets);
    const newLocation = transfer.delivery_address;

    for (const asset of assets) {
      const aid = asset.id || asset;
      await db.query('UPDATE assets SET status = $1, location = $2 WHERE id = $3', ['Active', newLocation, aid]);
      await db.query(
        `INSERT INTO asset_activity_log (asset_id, action, details, "user", "timestamp")
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [aid, 'Receive', JSON.stringify({ location: newLocation }), transfer.receiver_name || 'system']
      );
    }

    await db.query('DELETE FROM transfers WHERE id = $1', [id]);
    res.json({ success: true, message: 'All assets received, transfer closed.' });
  } catch (err) {
    console.error('Failed to receive all assets:', err);
    res.status(500).json({ error: 'Failed to receive all assets' });
  }
});

// ==============================
// PARTIAL-RECEIVE — set Active + location for selected, log, update
// ==============================
router.post('/:id/partial-receive', async (req, res) => {
  const { id } = req.params;
  const { assetIds, receiver_name, signature } = req.body;
  try {
    const result = await db.query('SELECT * FROM transfers WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Transfer not found' });

    let assets = safeJsonParse(result.rows[0].assets);
    const newLocation = result.rows[0].delivery_address;

    if (Array.isArray(assetIds) && assetIds.length > 0) {
      for (const aid of assetIds) {
        await db.query('UPDATE assets SET status = $1, location = $2 WHERE id = $3', ['Active', newLocation, aid]);
        await db.query(
          `INSERT INTO asset_activity_log (asset_id, action, details, "user", "timestamp")
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
          [aid, 'Partial Receive', JSON.stringify({ location: newLocation }), receiver_name || 'system']
        );
      }
    }

    assets = assets.filter(a => !assetIds.includes(a.id || a));
    if (assets.length === 0) {
      await db.query('DELETE FROM transfers WHERE id = $1', [id]);
      res.json({ success: true, message: 'All assets received, transfer closed.' });
    } else {
      await db.query(
        `UPDATE transfers SET assets = $1, receiver_name = $2, signature = $3 WHERE id = $4`,
        [JSON.stringify(assets), receiver_name || null, signature || null, id]
      );
      res.json({ success: true, message: 'Partial receive, transfer updated.' });
    }
  } catch (err) {
    console.error('Failed to partial receive:', err);
    res.status(500).json({ error: 'Failed to partial receive' });
  }
});

// ==============================
// DELETE transfer
// ==============================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM transfers WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete transfer:', err);
    res.status(500).json({ error: 'Failed to delete transfer' });
  }
});

// ==============================
// Utility
// ==============================
function safeJsonParse(input) {
  try {
    return typeof input === 'string' ? JSON.parse(input) : input;
  } catch {
    return [];
  }
}

module.exports = router;
