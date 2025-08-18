// =========================
// routes/customers.js
// =========================

const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'assets', 'logos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Saving logo to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const base = req.body.name
      ? req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      : 'customer';
    const ext = path.extname(file.originalname);
    const fname = `${base}-${Date.now()}${ext}`;
    console.log('Logo filename:', fname);
    cb(null, fname);
  },
});
const upload = multer({ storage });

// =========================
// GET all customers
// =========================
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM customers ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers.' });
  }
});

// =========================
// GET a single customer by id
// =========================
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Customer not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer.' });
  }
});

// =========================
// ADD new customer (with optional logo upload)
// =========================
router.post('/', upload.single('logo'), async (req, res) => {
  const { name, head_office_address, head_of_completions, head_office_phone, category } = req.body;
  let logo_url = req.body.logo_url;
  if (req.file) logo_url = `/assets/logos/${req.file.filename}`;
  if (!name) return res.status(400).json({ error: 'Name required.' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO customers (name, logo_url, head_office_address, head_of_completions, head_office_phone, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, logo_url, head_office_address, head_of_completions, head_office_phone, category || null]
    );
    console.log('Added new customer:', rows[0]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add customer.' });
  }
});

// =========================
// UPDATE customer by id (with optional logo upload)
// =========================
router.put('/:id', upload.single('logo'), async (req, res) => {
  const { name, head_office_address, head_of_completions, head_office_phone, category } = req.body;
  let logo_url = req.body.logo_url;
  if (req.file) logo_url = `/assets/logos/${req.file.filename}`;
  try {
    const { rows: existingRows } = await pool.query(
      'SELECT * FROM customers WHERE id = $1',
      [req.params.id]
    );
    if (!existingRows[0]) return res.status(404).json({ error: 'Customer not found.' });

    const updateQuery = `
      UPDATE customers
      SET name = $1, logo_url = $2, head_office_address = $3, head_of_completions = $4, head_office_phone = $5, category = $6
      WHERE id = $7
      RETURNING *
    `;
    const { rows } = await pool.query(updateQuery, [
      name || existingRows[0].name,
      logo_url || existingRows[0].logo_url,
      head_office_address || existingRows[0].head_office_address,
      head_of_completions || existingRows[0].head_of_completions,
      head_office_phone || existingRows[0].head_office_phone,
      category || existingRows[0].category,
      req.params.id,
    ]);
    console.log('Updated customer:', rows[0]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer.' });
  }
});

// =========================
// DELETE customer by id
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const { rows: existingRows } = await pool.query(
      'SELECT * FROM customers WHERE id = $1',
      [req.params.id]
    );
    if (!existingRows[0]) return res.status(404).json({ error: 'Customer not found.' });

    const logoPath = existingRows[0].logo_url
      ? path.join(uploadDir, path.basename(existingRows[0].logo_url))
      : null;
    if (logoPath && fs.existsSync(logoPath)) fs.unlinkSync(logoPath);

    await pool.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
    console.log('Deleted customer:', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete customer.' });
  }
});

// =========================
// DELETE logo for a customer by id
// =========================
router.delete('/:id/logo', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM customers WHERE id = $1',
      [req.params.id]
    );
    const customer = rows[0];
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });

    const logoPath = customer.logo_url
      ? path.join(uploadDir, path.basename(customer.logo_url))
      : null;
    if (logoPath && fs.existsSync(logoPath)) fs.unlinkSync(logoPath);

    await pool.query(
      'UPDATE customers SET logo_url = NULL WHERE id = $1',
      [req.params.id]
    );
    console.log('Deleted logo for customer:', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete logo.' });
  }
});

module.exports = router;
