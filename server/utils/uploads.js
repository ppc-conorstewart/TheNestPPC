// =====================================================
// FILE: server/utils/uploads.js — Multer Upload Utility (Disk + Memory)
// Sections: Setup • Allowed Types • Disk Storage • Memory Storage • Uploaders • Exports
// =====================================================
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { FILES_BASE_DIR } = require('../config/storagePaths');

// --------------------------
// Setup
// --------------------------
const uploadDir = FILES_BASE_DIR;
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// --------------------------
// Allowed Types
// --------------------------
const allowedImageTypes = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'];
const allowedModelTypes = ['.glb'];
const allowedDocTypes   = ['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.xls', '.csv', '.pptx'];
const allowed = new Set([...allowedImageTypes, ...allowedModelTypes, ...allowedDocTypes]);

function filterByExt(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.has(ext)) return cb(new Error('Unsupported file type.'));
  cb(null, true);
}

// --------------------------
// Disk Storage (legacy routes: jobs/assets/etc.)
// --------------------------
const diskStorage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    const uniq = Date.now() + '-' + Math.floor(Math.random() * 10000);
    cb(null, `${uniq}-${base}${ext}`);
  }
});
const diskUpload = multer({
  storage: diskStorage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: filterByExt
});

// --------------------------
// Memory Storage (documents → Postgres BYTEA, GLB library ingestion)
// --------------------------
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 512 * 1024 * 1024 },
  fileFilter: filterByExt
});

// --------------------------
// Uploaders
// --------------------------
const generalUpload = diskUpload;
const docUpload = memoryUpload;

// --------------------------
// Exports
// --------------------------
module.exports = {
  upload: diskUpload,
  diskUpload,
  memoryUpload,
  generalUpload,
  docUpload,
  uploadDir
};
