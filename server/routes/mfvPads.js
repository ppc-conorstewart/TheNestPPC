// ==============================
// routes/mfvPads.js — With Manual Sync Endpoints + Active Pad Toggle
// ==============================
const express = require("express");
const router = express.Router();
const pool = require("../db");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Internal sync util for a pad by pad_key (CSV -> DB)
async function syncPadFromCsv(pad_key) {
  try {
    const padResult = await pool.query(`SELECT id, url FROM mfv_pads WHERE pad_key = $1;`, [pad_key]);
    if (padResult.rowCount === 0) {
      throw new Error('Pad not found');
    }
    const pad_id = padResult.rows[0].id;
    const pad_url = padResult.rows[0].url;
    if (!pad_url) throw new Error('Pad has no URL');

    const response = await fetch(pad_url, { redirect: 'follow' });
    const text = await response.text();
    if (text.trim().startsWith('<')) throw new Error('Downloaded file is HTML, not CSV.');

    const Papa = require("papaparse");
    const parsed = Papa.parse(text, { skipEmptyLines: true });
    const headers = parsed.data[0] || [];
    const rows = parsed.data.slice(1).filter(r => r.length === headers.length);

    if (!headers.length || !rows.length) throw new Error('No headers or rows found in CSV');

    await pool.query(
      `INSERT INTO mfv_pad_data_headers (pad_id, headers)
       VALUES ($1, $2)
       ON CONFLICT (pad_id) DO UPDATE SET headers=EXCLUDED.headers;`,
      [pad_id, JSON.stringify(headers)]
    );
    await pool.query(`DELETE FROM mfv_pad_data WHERE pad_id=$1;`, [pad_id]);
    for (let i = 0; i < rows.length; ++i) {
      await pool.query(
        `INSERT INTO mfv_pad_data (pad_id, row_index, row_json) VALUES ($1, $2, $3);`,
        [pad_id, i, JSON.stringify(rows[i])]
      );
    }
    console.log(`[PAD SYNC] Updated pad "${pad_key}" with ${rows.length} rows.`);
    return { success: true, imported: rows.length, pad_key };
  } catch (err) {
    console.error(`[PAD SYNC ERROR] Pad "${pad_key}":`, err.message);
    return { success: false, error: err.message, pad_key };
  }
}

// --- Manual single pad sync ---
router.post("/pads/:pad_key/sync", async (req, res) => {
  const { pad_key } = req.params;
  const result = await syncPadFromCsv(pad_key);
  if (result.success) res.json(result);
  else res.status(500).json(result);
});

// --- Manual ALL pads sync ---
router.post("/sync-all", async (req, res) => {
  try {
    const allPads = await pool.query(`SELECT pad_key FROM mfv_pads WHERE archived=false;`);
    const results = [];
    for (const { pad_key } of allPads.rows) {
      results.push(await syncPadFromCsv(pad_key));
    }
    res.json({ ok: true, results });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- Add a new Pad ---
router.post("/pads", async (req, res) => {
  const { pad_key, label, url } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO mfv_pads (pad_key, label, url)
       VALUES ($1, $2, $3)
       ON CONFLICT (pad_key) DO UPDATE SET label=EXCLUDED.label, url=EXCLUDED.url
       RETURNING *;`,
      [pad_key, label, url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Add Pad Error:", err);
    res.status(500).json({ error: "Could not add pad." });
  }
});

// --- Get all Pads (with archive state) ---
router.get("/pads", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM mfv_pads ORDER BY archived ASC, created_at DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get Pads Error:", err);
    res.status(500).json({ error: "Could not fetch pads." });
  }
});

// --- Archive/Unarchive a Pad ---
router.patch("/pads/:id/archive", async (req, res) => {
  const { id } = req.params;
  const { archived } = req.body;
  try {
    const result = await pool.query(
      `UPDATE mfv_pads SET archived=$1 WHERE id=$2 RETURNING *;`,
      [archived, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Archive Pad Error:", err);
    res.status(500).json({ error: "Could not update archive status." });
  }
});

// --- Toggle Active Status for Pad ---
router.patch("/pads/:pad_key/active", async (req, res) => {
  const { pad_key } = req.params;
  const { is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE mfv_pads SET is_active = $1 WHERE pad_key = $2 RETURNING *;`,
      [is_active, pad_key]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Could not update active state." });
  }
});

// --- Bulk CSV Import for Pad ---
router.post("/pads/:pad_key/import", async (req, res) => {
  const { pad_key } = req.params;
  const { headers, rows, url } = req.body;

  try {
    // 1. Get pad ID by pad_key
    const padResult = await pool.query(
      `SELECT id, url FROM mfv_pads WHERE pad_key = $1;`,
      [pad_key]
    );
    if (padResult.rowCount === 0) {
      console.error('Pad not found in import!');
      return res.status(400).json({ error: "Pad not found. Create it first." });
    }
    const pad_id = padResult.rows[0].id;
    const pad_url = url || padResult.rows[0].url;

    // 1.1. If no direct headers/rows posted (client-side parse), try to fetch and parse CSV server-side
    let finalHeaders = headers, finalRows = rows;
    if ((!headers || headers.length === 0 || !rows || rows.length === 0) && pad_url) {
      // Robust CSV download with redirect support
      console.log("Fetching CSV with redirect support:", pad_url);
      const response = await fetch(pad_url, { redirect: 'follow' });
      const text = await response.text();
      if (text.trim().startsWith('<')) {
        // HTML, not CSV
        console.error('Downloaded file is HTML, not CSV:', text.substring(0, 200));
        return res.status(400).json({ error: 'Downloaded file is HTML, not CSV. Check your link.' });
      }
      // Parse CSV (using papaparse)
      const Papa = require("papaparse");
      const parsed = Papa.parse(text, { skipEmptyLines: true });
      finalHeaders = parsed.data[0] || [];
      finalRows = parsed.data.slice(1).filter(r => r.length === finalHeaders.length);
      console.log('CSV fetched and parsed server-side. Header:', finalHeaders);
      console.log('Sample row:', finalRows && finalRows.length ? finalRows[0] : "none");
    }

    // LOG CSV structure
    console.log("=== MFV IMPORT ===");
    console.log("Pad:", pad_key, "Pad ID:", pad_id);
    console.log("Headers:", finalHeaders);
    console.log("First row:", finalRows && finalRows.length > 0 ? finalRows[0] : "none");
    console.log("Total rows:", finalRows ? finalRows.length : 0);

    if (!finalHeaders || !finalHeaders.length || !finalRows || !finalRows.length) {
      return res.status(400).json({ error: "No headers or rows found in parsed CSV." });
    }

    // 2. Save headers
    await pool.query(
      `INSERT INTO mfv_pad_data_headers (pad_id, headers)
       VALUES ($1, $2)
       ON CONFLICT (pad_id) DO UPDATE SET headers=EXCLUDED.headers;`,
      [pad_id, JSON.stringify(finalHeaders)]
    );
    console.log("Headers saved.");

    // 3. Delete existing rows for this pad
    await pool.query(`DELETE FROM mfv_pad_data WHERE pad_id=$1;`, [pad_id]);
    console.log("Old rows cleared.");

    // 4. Bulk insert rows (log error per row if any)
    let importedCount = 0;
    for (let i = 0; i < finalRows.length; ++i) {
      try {
        await pool.query(
          `INSERT INTO mfv_pad_data (pad_id, row_index, row_json) VALUES ($1, $2, $3);`,
          [pad_id, i, JSON.stringify(finalRows[i])]
        );
        importedCount++;
      } catch (err) {
        console.error(`Row import error at row ${i}:`, err);
      }
    }
    console.log(`Imported ${importedCount} rows out of ${finalRows.length}`);

    res.json({ success: true, rows_imported: importedCount });
  } catch (err) {
    console.error("Bulk CSV Import Error:", err);
    res.status(500).json({ error: "Could not import CSV data.", detail: err.message });
  }
});

router.get("/pads/:pad_key/rows", async (req, res) => {
  const { pad_key } = req.params;
  try {
    // 1. Get pad ID by pad_key
    const padResult = await pool.query(
      `SELECT id FROM mfv_pads WHERE pad_key = $1;`,
      [pad_key]
    );
    if (padResult.rowCount === 0) {
      return res.status(404).json({ error: "Pad not found." });
    }
    const pad_id = padResult.rows[0].id;

    // 2. Get headers for this pad (from mfv_pad_data_headers)
    const headerResult = await pool.query(
      `SELECT headers FROM mfv_pad_data_headers WHERE pad_id = $1;`,
      [pad_id]
    );
    const headers = headerResult.rowCount > 0 ? headerResult.rows[0].headers : [];

    // 3. Get rows for this pad
    const rowResult = await pool.query(
      `SELECT row_index, row_json FROM mfv_pad_data WHERE pad_id=$1 ORDER BY row_index ASC;`,
      [pad_id]
    );
    const rows = rowResult.rows.map(r => r.row_json);

    // --- Return both headers and rows! ---
    res.json({ headers, rows });
  } catch (err) {
    console.error("Get Pad Rows Error:", err);
    res.status(500).json({ error: "Could not fetch pad rows." });
  }
});

// --- Delete a Pad (and its data) ---
router.delete("/pads/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM mfv_pads WHERE id=$1;`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete Pad Error:", err);
    res.status(500).json({ error: "Could not delete pad." });
  }
});

module.exports = router;
