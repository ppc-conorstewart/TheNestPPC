// ==============================
// server/routes/FlyIQJobsSchedule.js
// ==============================
const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper to format a row to only needed columns
const filterJob = job => ({
  customer: job.customer,
  surface_lsd: job.surface_lsd,
  products: job.products,
  rig_in_date: job.rig_in_date,
  start_date: job.start_date,
  end_date: job.end_date,
  num_wells: job.num_wells,
});

// GET /api/jobs-schedule
router.get('/', async (req, res) => {
  try {
    // Get ALL jobs
    const { rows } = await db.query(`
      SELECT customer, surface_lsd, products, rig_in_date, start_date, end_date, num_wells, status
      FROM jobs
      ORDER BY
        (CASE WHEN status = 'in-progress' THEN 0 ELSE 1 END),
        rig_in_date ASC,
        start_date ASC
    `);

    const today = new Date();
    const twoMonthsOut = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());

    // Group jobs
    const inProgress = [];
    const upcoming = [];

    for (const job of rows) {
      if (job.status && job.status.toLowerCase() === 'in-progress') {
        inProgress.push(filterJob(job));
      } else {
        // Parse dates
        let rigIn = job.rig_in_date ? new Date(job.rig_in_date) : null;
        let start = job.start_date ? new Date(job.start_date) : null;

        // Check: scheduled within next 2 months and NOT in-progress
        const isUpcoming =
          (rigIn && rigIn >= today && rigIn <= twoMonthsOut) ||
          (start && start >= today && start <= twoMonthsOut);

        if (isUpcoming) upcoming.push(filterJob(job));
      }
    }

    res.json({ inProgress, upcoming });
  } catch (err) {
    console.error('Failed to load job schedule:', err);
    res.status(500).json({ error: 'Failed to load job schedule' });
  }
});

module.exports = router;
