// server/sourcing.js

const db = require('./db');

const VALID_STATUSES = ['Requested', 'Ordered', 'Received', 'Cancelled'];
const VALID_PRIORITIES = ['High', 'Medium', 'Low'];
const VALID_CATEGORIES = ['Consumables', 'Equipment', 'Spare Parts', 'Other'];

module.exports = {
  async getAllTickets({ status, priority, category }) {
    const conditions = [];
    const values = [];

    if (status) {
      conditions.push(`status = $${values.length + 1}`);
      values.push(status);
    }
    if (priority) {
      conditions.push(`priority = $${values.length + 1}`);
      values.push(priority);
    }
    if (category) {
      conditions.push(`category = $${values.length + 1}`);
      values.push(category);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM sourcing_tickets ${whereClause} ORDER BY created_at DESC`;

    const { rows } = await db.query(query, values);
    return rows;
  },

  async getTicketById(id) {
    const { rows } = await db.query(
      `SELECT * FROM sourcing_tickets WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async addTicket({
    itemDescription,
    base,
    neededBy,
    quantity,
    project,
    vendor = '',
    category = 'Other',
    priority = 'Medium',
    status = 'Requested',
    expectedDate = null,
  }) {
    if (!VALID_PRIORITIES.includes(priority)) throw new Error(`Invalid priority: ${priority}`);
    if (!VALID_CATEGORIES.includes(category)) throw new Error(`Invalid category: ${category}`);
    if (!VALID_STATUSES.includes(status)) throw new Error(`Invalid status: ${status}`);

    const result = await db.query(
      `
      INSERT INTO sourcing_tickets
        (item_description, base, needed_by, quantity, project, vendor, category, priority, status, expected_date)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
      `,
      [
        itemDescription,
        base,
        neededBy,
        quantity,
        project,
        vendor,
        category,
        priority,
        status,
        expectedDate
      ]
    );

    return result.rows[0];
  },

  async updateTicket(id, updates) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const key in updates) {
      if (
        ['itemDescription', 'base', 'neededBy', 'quantity', 'project', 'vendor', 'category', 'priority', 'status', 'expectedDate'].includes(key)
      ) {
        const column = key === 'itemDescription' ? 'item_description'
                     : key === 'neededBy' ? 'needed_by'
                     : key === 'expectedDate' ? 'expected_date'
                     : key;
        fields.push(`${column} = $${idx}`);
        values.push(updates[key]);
        idx++;
      }
    }

    if (!fields.length) throw new Error('No valid fields provided for update.');

    values.push(id);
    const query = `
      UPDATE sourcing_tickets
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING *
    `;

    const { rows } = await db.query(query, values);
    if (!rows.length) throw new Error(`Ticket with ID ${id} not found.`);
    return rows[0];
  },

  async deleteTicket(id) {
    await db.query(`DELETE FROM sourcing_tickets WHERE id = $1`, [id]);
  },

  async addAttachmentToTicket(id, filename, fileBuffer) {
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(__dirname, 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const uniqueName = `${Date.now()}_${filename}`;
    const savePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(savePath, fileBuffer);
    const relPath = path.relative(__dirname, savePath);

    const result = await db.query(
      `
      UPDATE sourcing_tickets
      SET attachments = COALESCE(attachments, '{}') || $1::text, updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [relPath, id]
    );

    if (!result.rows.length) throw new Error(`Ticket ${id} not found when adding attachment.`);
    return relPath;
  }
};
