// ==============================
// server/routes/jobs.js — All Jobs API Endpoints
// ==============================

const express = require('express');
const path = require('path');
const fs = require('fs');
const { generalUpload, memoryUpload, uploadDir } = require('../utils/uploads');
const db = require('../db');
const jobs = require('../jobs');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const router = express.Router();

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const data = await jobs.getAllJobs();
    // Attach auditChecklistUrl if file exists
    const augmented = data.map((job) => {
      const filename = `job-${job.id}.pdf`;
      const filepath = path.join(uploadDir, filename);
      if (fs.existsSync(filepath)) {
        return { ...job, auditChecklistUrl: `/uploads/${filename}` };
      }
      return job;
    });
    res.json(augmented);
  } catch (err) {
    console.error('Failed to get jobs:', err);
    res.status(500).json({ error: 'Failed to load jobs' });
  }
});

// Monthly totals for all metrics
router.get('/monthly-totals', async (req, res) => {
  try {
    const all = await jobs.getAllJobs();
    const YEAR = new Date().getFullYear();
    const monthly = all
      .filter(j => new Date(j.rig_in_date).getFullYear() === YEAR)
      .reduce((acc, job) => {
        const m = new Date(job.rig_in_date).getMonth();
        if (!acc[m]) acc[m] = {
          wells: 0,
          valve_7_1_16: 0,
          valve_5_1_8: 0,
          hyd_3_1_16: 0,
          man_3_1_16: 0,
          gateway_pods: 0,
          awc_pods: 0,
          grease_unit: 0,
          coil_trees: 0,
          accumulator: 0,
          techs: 0,
          work_orders: 0
        };
        acc[m].wells            += Number(job.num_wells   || 0);
        acc[m].valve_7_1_16     += Number(job.valve_7_1_16 || 0);
        acc[m].valve_5_1_8      += Number(job.valve_5_1_8  || 0);
        acc[m].hyd_3_1_16       += Number(job.valve_hyd    || 0);
        acc[m].man_3_1_16       += Number(job.valve_man    || 0);
        acc[m].gateway_pods     += Number(job.gateway_pods || 0);
        acc[m].awc_pods         += Number(job.awc_pods     || 0);
        acc[m].grease_unit      += Number(job.grease_unit  || 0);
        acc[m].coil_trees       += Number(job.coil_trees   || 0);
        acc[m].accumulator      += Number(job.accumulator  || 0);
        acc[m].techs            += Number(job.techs       ) || 0;
        acc[m].work_orders      += Number(job.work_orders ) || 0;
        return acc;
      }, {});

    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const result = MONTH_NAMES.map((mon, i) => ({
      month: mon,
      ...monthly[i]
    }));

    res.json(result);
  } catch (err) {
    console.error('Failed to get monthly totals for all metrics:', err);
    res.status(500).json({ error: 'Failed to load monthly totals' });
  }
});

// Add new job
router.post('/', async (req, res) => {
  try {
    await jobs.addJob(req.body);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Failed to add job:', err);
    res.status(500).json({ error: 'Failed to add job' });
  }
});

// Update entire job
router.put('/:id', async (req, res) => {
  try {
    await jobs.updateJob(Number(req.params.id), req.body);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update job:', err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Patch/partial update (general fields)
router.patch('/:id', async (req, res) => {
  try {
    const jobId = Number(req.params.id);
    await jobs.updateJob(jobId, req.body);
    const updatedJob = await jobs.getJobById(jobId);
    res.json(updatedJob);
  } catch (err) {
    console.error('Failed to patch job:', err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// ==============================
// PATCH only Discord Channel ID
router.patch('/:id/discord-channel', async (req, res) => {
  try {
    const jobId = Number(req.params.id);
    const { discord_channel_id } = req.body;
    if (!discord_channel_id) {
      return res.status(400).json({ error: 'Missing discord_channel_id' });
    }
    await db.query(
      `UPDATE jobs SET discord_channel_id = $1 WHERE id = $2`,
      [discord_channel_id, jobId]
    );
    const updatedJob = await jobs.getJobById(jobId);
    res.json(updatedJob);
  } catch (err) {
    console.error('Failed to update discord_channel_id:', err);
    res.status(500).json({ error: 'Failed to update discord_channel_id' });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    const jobId = Number(req.params.id);
    await jobs.deleteJob(jobId);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete job:', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Audit checklist upload (file)
router.post(
  '/:id/audit-checklist',
  generalUpload.single('auditChecklist'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  }
);

// Audit checklist delete
router.delete('/:id/audit-checklist', (req, res) => {
  try {
    const jobId = req.params.id.toString();
    const files = fs
      .readdirSync(uploadDir)
      .filter(fn => fn.startsWith(`job-${jobId}.`));
    if (files.length === 0) {
      return res.status(404).json({ error: 'Audit file not found' });
    }
    files.forEach(fn => {
      fs.unlinkSync(path.join(uploadDir, fn));
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete audit file:', err);
    res.status(500).json({ error: 'Failed to delete audit file' });
  }
});

// Job file upload (DB)
router.post('/:jobId/files', memoryUpload.single('file'), async (req, res) => {
  const { jobId } = req.params;
  const { tab } = req.body;
  const file = req.file;
  if (!file || !tab) return res.status(400).json({ error: 'File and tab required.' });

  // determine uploader from body, header, or session user
  const uploader =
    (req.body.uploaded_by && String(req.body.uploaded_by).trim()) ||
    (req.headers['x-uploaded-by'] && String(req.headers['x-uploaded-by']).trim()) ||
    (req.user && (req.user.username || req.user.global_name)) ||
    'Unknown';

  try {
    await db.query(
      `INSERT INTO job_files (job_id, tab, filename, mimetype, size, data, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        jobId,
        tab,
        file.originalname,
        file.mimetype,
        file.size,
        file.buffer,
        uploader
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to upload file:', err);
    res.status(500).json({ error: 'Failed to upload file.' });
  }
});

// List job files
router.get('/:jobId/files', async (req, res) => {
  const { jobId } = req.params;
  const { tab } = req.query;
  let query = `SELECT id, tab, filename, mimetype, size, uploaded_at, uploaded_by FROM job_files WHERE job_id = $1`;
  const params = [jobId];
  if (tab) {
    query += ' AND tab = $2';
    params.push(tab);
  }
  query += ' ORDER BY uploaded_at DESC';
  try {
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch files:', err);
    res.status(500).json({ error: 'Failed to fetch files.' });
  }
});

// Download job file
router.get('/:jobId/files/:fileId', async (req, res) => {
  const { jobId, fileId } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT filename, mimetype, data FROM job_files WHERE job_id = $1 AND id = $2`,
      [jobId, fileId]
    );
    if (!rows[0]) return res.status(404).send('File not found.');
    res.setHeader('Content-Disposition', `attachment; filename="${rows[0].filename}"`);
    res.setHeader('Content-Type', rows[0].mimetype);
    res.send(rows[0].data);
  } catch (err) {
    console.error('Failed to download file:', err);
    res.status(500).send('Failed to download file.');
  }
});

// Delete job file
router.delete('/:jobId/files/:fileId', async (req, res) => {
  const { jobId, fileId } = req.params;
  try {
    await db.query(
      `DELETE FROM job_files WHERE job_id = $1 AND id = $2`,
      [jobId, fileId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete file:', err);
    res.status(500).json({ error: 'Failed to delete file.' });
  }
});

// ==============================
// Job update — history + snapshot for dashboard/overwatch
router.post('/:id/update', async (req, res) => {
  const jobId = Number(req.params.id);
  const { update_data, updated_by } = req.body; // update_data: object, updated_by: string

  try {
    await db.query(
      `INSERT INTO job_updates (job_id, update_data, updated_by) VALUES ($1, $2, $3)`,
      [jobId, JSON.stringify(update_data), updated_by || 'system']
    );

    await db.query(
      `UPDATE jobs SET job_update_json = $1, last_updated = NOW() WHERE id = $2`,
      [JSON.stringify(update_data), jobId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to post job update:', err);
    res.status(500).json({ error: 'Failed to save job update' });
  }
});

// ==============================
// Overwatch summary payload
router.get('/:id/overwatch', async (req, res) => {
  const jobId = Number(req.params.id);
  try {
    const { rows: jobRows } = await db.query(
      `SELECT id, job_update_json FROM jobs WHERE id = $1`,
      [jobId]
    );
    if (!jobRows[0]) return res.status(404).json({ error: 'Job not found' });

    const latest = jobRows[0].job_update_json || {};

    // derive zone progress
    // expected shapes accepted:
    // - latest.totalZones: "32/109" OR number total
    // - zone fields like aZone/bZone/... as "X/X"
    let completed = 0;
    let total = 0;

    if (typeof latest.totalZones === 'string' && latest.totalZones.includes('/')) {
      const [c, t] = latest.totalZones.split('/').map(s => parseInt(s.trim(), 10) || 0);
      completed = c;
      total = t;
    } else if (typeof latest.totalZones === 'number') {
      total = latest.totalZones;
    }

    const letters = ['a','b','c','d','e','f','g','h','i','j'];
    for (const k of letters) {
      const key = `${k}Zone`;
      if (typeof latest[key] === 'string' && latest[key].includes('/')) {
        const [c, t] = latest[key].split('/').map(s => parseInt(s.trim(), 10) || 0);
        completed += c;
        total += t;
      }
    }

    const notes = {
      operational: latest.operationalNotes || '',
      paloma: latest.palomaNotes || '',
      crossShift: latest.crossShiftNotes || ''
    };

    const { rows: items } = await db.query(
      `SELECT id, job_id, item_text, qty, status
       FROM job_required_items
       WHERE job_id = $1
       ORDER BY id ASC`,
      [jobId]
    );

    res.json({
      zoneProgress: { completed, total },
      lastShiftNotes: notes,
      requiredItems: items
    });
  } catch (err) {
    console.error('Failed to get overwatch summary:', err);
    res.status(500).json({ error: 'Failed to get overwatch summary' });
  }
});

// ==============================
// Required Items CRUD (minimal)
router.post('/:id/required-items', async (req, res) => {
  const jobId = Number(req.params.id);
  const { item_text, qty, status } = req.body;
  if (!item_text) return res.status(400).json({ error: 'item_text required' });

  try {
    const { rows } = await db.query(
      `INSERT INTO job_required_items (job_id, item_text, qty, status)
       VALUES ($1, $2, COALESCE($3, 1), COALESCE($4, 'pending'))
       RETURNING id, job_id, item_text, qty, status`,
      [jobId, item_text, qty || 1, status || 'pending']
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Failed to add required item:', err);
    res.status(500).json({ error: 'Failed to add required item' });
  }
});

router.delete('/:id/required-items/:itemId', async (req, res) => {
  const jobId = Number(req.params.id);
  const itemId = Number(req.params.itemId);
  try {
    await db.query(
      `DELETE FROM job_required_items WHERE job_id = $1 AND id = $2`,
      [jobId, itemId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete required item:', err);
    res.status(500).json({ error: 'Failed to delete required item' });
  }
});

module.exports = router;
