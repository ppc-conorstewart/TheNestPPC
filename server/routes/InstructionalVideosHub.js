// ==============================
// server/routes/InstructionalVideosHub.js
// ==============================
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../db');

const UPLOAD_FOLDER = path.join(__dirname, '..', 'uploads', 'instructional-videos-hub');
if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
        const sanitized = file.originalname.replace(/[^a-z0-9.\-_]/gi, '_');
        cb(null, `${uniqueSuffix}__${sanitized}`);
    }
});
const upload = multer({ storage });

// ==============================
// Fetch all videos for a tab
// ==============================
router.get('/', async (req, res) => {
    const tab = req.query.tab;
    if (!tab) {
        return res.status(400).json({ error: 'Missing tab parameter' });
    }
    try {
        const result = await db.query(
            `SELECT id, file_name, file_path, file_size, mime_type, uploaded_at, tab
             FROM instructional_videos_hub_documents
             WHERE tab = $1 AND (deleted IS NOT TRUE)
             ORDER BY uploaded_at DESC`,
            [tab]
        );
        const videos = result.rows.map(row => ({
            ...row,
            file_url: `/api/instructional-videos-hub/files/${row.id}`
        }));
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// ==============================
// Serve uploaded videos securely
// ==============================
router.get('/files/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query(
            `SELECT file_name, file_path, mime_type FROM instructional_videos_hub_documents WHERE id = $1 AND (deleted IS NOT TRUE)`, [id]
        );
        if (!result.rows.length) {
            return res.status(404).send('File not found');
        }
        const doc = result.rows[0];
        const fullPath = path.join(UPLOAD_FOLDER, path.basename(doc.file_path));
        if (!fs.existsSync(fullPath)) {
            return res.status(404).send('File missing from disk');
        }
        res.setHeader('Content-Type', doc.mime_type);
        res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
        fs.createReadStream(fullPath).pipe(res);
    } catch (err) {
        res.status(500).send('Failed to serve file');
    }
});

// ==============================
// Upload one or more videos for a tab
// ==============================
router.post('/', upload.array('videos'), async (req, res) => {
    try {
        const { tab, uploaded_by, notes } = req.body;
        const files = req.files;
        if (!tab || !files || files.length === 0) {
            return res.status(400).json({ error: 'Missing tab or file(s)' });
        }
        const results = [];
        for (const file of files) {
            const { originalname, filename, size, mimetype } = file;
            const file_path = filename;
            const file_name = originalname;
            const insertQuery = `
                INSERT INTO instructional_videos_hub_documents
                    (file_name, file_path, file_size, mime_type, tab, uploaded_by, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, file_name, file_path, file_size, mime_type, uploaded_at, tab
            `;
            const params = [
                file_name, file_path, size, mimetype, tab, uploaded_by || null, notes || null
            ];
            const { rows } = await db.query(insertQuery, params);
            results.push({
                ...rows[0],
                file_url: `/api/instructional-videos-hub/files/${rows[0].id}`
            });
        }
        res.status(201).json(results);
    } catch (err) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

// ==============================
// Rename a video (PATCH)
// ==============================
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { newName } = req.body;
    if (!newName || !id) return res.status(400).json({ error: 'Missing fields' });

    try {
        const result = await db.query(
            `SELECT file_path FROM instructional_videos_hub_documents WHERE id = $1 AND (deleted IS NOT TRUE)`, [id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Video not found' });
        const oldPath = result.rows[0].file_path;
        const oldExt = path.extname(oldPath);
        let finalName = newName;
        if (!finalName.endsWith(oldExt)) finalName = finalName + oldExt;

        const sanitized = finalName.replace(/[^a-z0-9.\-_]/gi, '_');
        const newPath = `${Date.now()}__${sanitized}`;
        const fullOld = path.join(UPLOAD_FOLDER, oldPath);
        const fullNew = path.join(UPLOAD_FOLDER, newPath);

        fs.renameSync(fullOld, fullNew);

        await db.query(
            `UPDATE instructional_videos_hub_documents SET file_name = $1, file_path = $2 WHERE id = $3`,
            [finalName, newPath, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Rename failed' });
    }
});

// ==============================
// Soft delete a video (admin)
// ==============================
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(
            `UPDATE instructional_videos_hub_documents SET deleted = TRUE WHERE id = $1`,
            [id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;
