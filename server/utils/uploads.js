const path = require('path');
const multer = require('multer');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const allowedImageTypes = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const allowedModelTypes = ['.glb'];
const allowedExtensions = [...allowedImageTypes, ...allowedModelTypes];

const generalUploadStorage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);
    cb(null, `${unique}-${basename}${ext}`);
  },
});

const generalUpload = multer({
  storage: generalUploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Only .glb and common image files allowed!'));
    }
    cb(null, true);
  }
});

const memoryUpload = multer(); // For in-memory uploads

module.exports = {
  uploadDir,
  generalUpload,
  memoryUpload
};
