// ==============================
// jobs.js
// ==============================

const pool = require('./db');

const jobColumns = [
  "customer", "surface_lsd", "products", "rig_in_date", "start_date", "end_date",
  "num_wells", "valve_7_1_16", "valve_5_1_8", "valve_hyd", "valve_man",
  "gateway_pods", "awc_pods", "grease_unit", "coil_trees", "accumulator",
  "techs", "status", "work_orders", "discord_channel_id"
];

module.exports = {
  async getAllJobs() {
    const { rows } = await pool.query(
      `SELECT id, ${jobColumns.join(", ")} FROM jobs ORDER BY id DESC`
    );
    return rows;
  },

  async getJobById(id) {
    const { rows } = await pool.query(
      `SELECT id, ${jobColumns.join(", ")} FROM jobs WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async addJob(job) {
    const insertJob = { ...job };
    if (!insertJob.status) insertJob.status = "not-locked";
    for (const key of jobColumns) {
      if (insertJob[key] === undefined) insertJob[key] = null;
    }

    const placeholders = jobColumns.map((_, i) => `$${i + 1}`).join(", ");
    const values = jobColumns.map((key) => insertJob[key]);
    const { rows } = await pool.query(
      `INSERT INTO jobs (${jobColumns.join(", ")})
       VALUES (${placeholders})
       RETURNING id, ${jobColumns.join(", ")}`,
      values
    );
    return rows[0];
  },

  async updateJob(id, fields) {
    const existing = await this.getJobById(id);
    if (!existing) throw new Error(`Job with id ${id} not found`);

    const merged = {};
    for (const key of jobColumns) {
      merged[key] = fields[key] !== undefined ? fields[key] : existing[key];
    }

    const sets = jobColumns.map((key, i) => `${key} = $${i + 1}`).join(", ");
    const values = jobColumns.map((key) => merged[key]);
    values.push(id);

    await pool.query(
      `UPDATE jobs SET ${sets} WHERE id = $${jobColumns.length + 1}`,
      values
    );
  },

  async deleteJob(id) {
    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
  }
};
