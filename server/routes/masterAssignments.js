// ==============================
// server/routes/masterAssignments.js
// Master Assemblies API Router
// - Assignments (list/get/upsert/delete)
// - Meta (status + dates GET/PUT)
// - Gaskets (GET/PUT bulk)
// - Summary (per assembly family)
// - Unified Save (atomic meta + assignments + gaskets)
// - History (GET/POST)
// ==============================

const express = require('express');
const router = express.Router();

const svc = require('../services/masterAssignments.service');
const assetsSvc = require('../services/assets');

// ------------------------------
// Helpers
// ------------------------------
function ok(res, data) { return res.status(200).json(data); }
function bad(res, msg, code = 400) { return res.status(code).json({ error: msg }); }

// ------------------------------
// Assignments
// ------------------------------

// GET /api/master/assignments?all=1
// GET /api/master/assignments/all
router.get(['/assignments', '/assignments/all'], async (req, res) => {
  try {
    const { all, assembly, child } = req.query;

    if (all === '1' || req.path.endsWith('/all')) {
      const rows = await svc.getAllAssignments();
      return ok(res, rows || []);
    }

    if (!assembly || !child) {
      return bad(res, 'assembly and child are required');
    }

    const rows = await svc.getAssignmentsForChild(assembly, child);
    return ok(res, rows || []);
  } catch (e) {
    console.error('GET /assignments failed', e);
    return bad(res, 'Failed to fetch assignments', 500);
  }
});

// POST /api/master/assignment  { assembly, child, slot, asset_id, updated_by }
router.post('/assignment', async (req, res) => {
  try {
    const { assembly, child, slot, asset_id, updated_by } = req.body || {};
    if (!assembly || !child || !slot) return bad(res, 'assembly, child, slot required');

    const j = await svc.upsertAssignment({ assembly, child, slot, asset_id, updated_by });
    return ok(res, j);
  } catch (e) {
    console.error('POST /assignment failed', e);
    return bad(res, 'Failed to upsert assignment', 500);
  }
});

// DELETE /api/master/assignment  { assembly, child, slot, new_status?, notes?, updated_by? }
router.delete('/assignment', async (req, res) => {
  try {
    const { assembly, child, slot, new_status, notes, updated_by } = req.body || {};
    if (!assembly || !child || !slot) return bad(res, 'assembly, child, slot required');

    const j = await svc.deleteAssignment({ assembly, child, slot, new_status, notes, updated_by });
    return ok(res, j);
  } catch (e) {
    console.error('DELETE /assignment failed', e);
    return bad(res, 'Failed to delete assignment', 500);
  }
});

// ------------------------------
// Summary per family
// ------------------------------
// GET /api/master/summary/:assembly   (assembly title: "Dog Bones" | "Zippers" | "Flowcrosses" | "Missiles")
router.get('/summary/:assembly', async (req, res) => {
  try {
    const assembly = decodeURIComponent(req.params.assembly || '');
    if (!assembly) return bad(res, 'assembly required');
    const rows = await svc.getSummaryForAssembly(assembly);
    return ok(res, rows || []);
  } catch (e) {
    console.error('GET /summary failed', e);
    return bad(res, 'Failed to fetch summary', 500);
  }
});

// ------------------------------
// Meta (status + creation/recert dates)
// ------------------------------

// GET /api/master/meta/:assembly/:child
router.get('/meta/:assembly/:child', async (req, res) => {
  try {
    const assembly = decodeURIComponent(req.params.assembly || '');
    const child = decodeURIComponent(req.params.child || '');
    if (!assembly || !child) return bad(res, 'assembly and child required');

    const row = await svc.getMeta(assembly, child);
    return ok(res, row || {});
  } catch (e) {
    console.error('GET /meta failed', e);
    return bad(res, 'Failed to fetch meta', 500);
  }
});

// PUT /api/master/meta { assembly, child, status?, creation_date?, recert_date?, updated_by? }
router.put('/meta', async (req, res) => {
  try {
    const { assembly, child, status, creation_date, recert_date, updated_by } = req.body || {};
    if (!assembly || !child) return bad(res, 'assembly and child required');

    const j = await svc.putMeta({ assembly, child, status, creation_date, recert_date, updated_by });
    return ok(res, j);
  } catch (e) {
    console.error('PUT /meta failed', e);
    return bad(res, 'Failed to save meta', 500);
  }
});

// ------------------------------
// Gaskets
// ------------------------------

// GET /api/master/gaskets/:assembly/:child
router.get('/gaskets/:assembly/:child', async (req, res) => {
  try {
    const assembly = decodeURIComponent(req.params.assembly || '');
    const child = decodeURIComponent(req.params.child || '');
    if (!assembly || !child) return bad(res, 'assembly and child required');

    const rows = await svc.getGaskets(assembly, child);
    return ok(res, rows || []);
  } catch (e) {
    console.error('GET /gaskets failed', e);
    return bad(res, 'Failed to fetch gaskets', 500);
  }
});

// PUT /api/master/gaskets/bulk  { assembly, child, items: [{gasket_slot, gasket_id, gasket_date}], updated_by? }
router.put('/gaskets/bulk', async (req, res) => {
  try {
    const { assembly, child, items, updated_by } = req.body || {};
    if (!assembly || !child) return bad(res, 'assembly and child required');

    const j = await svc.putGasketsBulk({ assembly, child, items, updated_by });
    return ok(res, j);
  } catch (e) {
    console.error('PUT /gaskets/bulk failed', e);
    return bad(res, 'Failed to save gaskets', 500);
  }
});

// ------------------------------
// Unified Save (atomic)
// ------------------------------
// POST /api/master/save
// Body: {
//   assembly, child,
//   status, creation_date, recert_date,
//   assignments: [{ slot, asset_id }],
//   gaskets: [{ gasket_slot, gasket_id, gasket_date }],
//   updated_by
// }
router.post('/save', async (req, res) => {
  try {
    const {
      assembly, child,
      status, creation_date, recert_date,
      assignments = [], gaskets = [],
      updated_by
    } = req.body || {};

    if (!assembly || !child) return bad(res, 'assembly and child required');

    const j = await svc.saveMasterAssembly({
      assembly,
      child,
      status,
      creation_date,
      recert_date,
      assignments,
      gaskets,
      updated_by
    });
    return ok(res, j);
  } catch (e) {
    console.error('POST /save failed', e);
    return bad(res, 'Failed to save master assembly', 500);
  }
});

// ------------------------------
// History
// ------------------------------

// GET /api/master/history
router.get('/history', async (_req, res) => {
  try {
    const rows = await svc.getHistory(400);
    return ok(res, rows || []);
  } catch (e) {
    console.error('GET /history failed', e);
    return bad(res, 'Failed to fetch history', 500);
  }
});

// POST /api/master/history  { time?, action, slot, asset_id, asset_name, user? }
router.post('/history', async (req, res) => {
  try {
    const j = await svc.addHistory(req.body || {});
    return ok(res, j);
  } catch (e) {
    console.error('POST /history failed', e);
    return bad(res, 'Failed to add history', 500);
  }
});

// ------------------------------
// Available Assets (unassigned + status = Available)
// ------------------------------
// GET /api/master/available-assets
router.get('/available-assets', async (_req, res) => {
  try {
    const rows = await assetsSvc.getAvailableAssets();
    return ok(res, rows || []);
  } catch (e) {
    console.error('GET /available-assets failed', e);
    return bad(res, 'Failed to fetch available assets', 500);
  }
});

module.exports = router;
