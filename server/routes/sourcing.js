// server/routes/sourcing.js

const express = require('express');
const { generalUpload } = require('../utils/uploads');
const sourcing = require('../sourcing');

const router = express.Router();

// === GET ALL TICKETS (optional filtering) ===
router.get('/', async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    const tickets = await sourcing.getAllTickets({ status, priority, category });
    return res.json(tickets);
  } catch (err) {
    console.error('Failed to fetch sourcing tickets:', err);
    return res.status(500).json({ error: 'Failed to load sourcing tickets' });
  }
});

// === CREATE NEW TICKET ===
router.post('/', async (req, res) => {
  try {
    const {
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
    } = req.body;

    if (!itemDescription || !base || !neededBy || quantity === undefined || !project) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const nb = new Date(neededBy);
    if (isNaN(nb.getTime())) {
      return res.status(400).json({ error: 'neededBy must be a valid date.' });
    }

    const ticket = await sourcing.addTicket({
      itemDescription,
      base,
      neededBy,
      quantity,
      project,
      vendor,
      category,
      priority,
      status,
      expectedDate,
    });

    return res.status(201).json(ticket);
  } catch (err) {
    console.error('Failed to create sourcing ticket:', err);
    return res.status(500).json({ error: 'Failed to create sourcing ticket' });
  }
});

// === UPDATE ENTIRE TICKET ===
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updatedTicket = await sourcing.updateTicket(id, req.body);
    return res.json(updatedTicket);
  } catch (err) {
    console.error('Failed to update sourcing ticket:', err);
    return res.status(400).json({ error: err.message });
  }
});

// === PATCH EXPECTED DATE ONLY ===
router.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { expectedDate } = req.body;

    if (!expectedDate) {
      return res.status(400).json({ error: 'expectedDate is required' });
    }

    const ed = new Date(expectedDate);
    if (isNaN(ed.getTime())) {
      return res.status(400).json({ error: 'expectedDate must be a valid date.' });
    }

    const updated = await sourcing.updateTicket(id, { expectedDate });
    return res.json(updated);
  } catch (err) {
    console.error('Failed to patch expectedDate:', err);
    return res.status(400).json({ error: err.message });
  }
});

// === DELETE TICKET ===
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await sourcing.deleteTicket(id);
    return res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete sourcing ticket:', err);
    return res.status(500).json({ error: 'Failed to delete sourcing ticket' });
  }
});

// === ADD ATTACHMENT ===
router.post('/:id/attachment', generalUpload.single('attachment'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const relPath = await sourcing.addAttachmentToTicket(id, req.file.originalname, req.file.buffer);
    return res.json({ path: relPath });
  } catch (err) {
    console.error('Failed to upload attachment:', err);
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
