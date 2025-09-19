const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  if (!dirPath) return null;
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  } catch (err) {
    console.warn(`[storagePaths] Failed to ensure directory ${dirPath}:`, err.message);
    return dirPath;
  }
}

const resolveDir = (value, fallback) => {
  if (value && typeof value === 'string') {
    return ensureDir(path.resolve(value));
  }
  return ensureDir(fallback);
};

const FILES_BASE_DIR = resolveDir(
  process.env.FILES_BASE_DIR,
  path.join(__dirname, '..', 'uploads')
);

const CUSTOMER_LOGO_DIR = resolveDir(
  process.env.CUSTOMER_LOGO_DIR,
  path.join(__dirname, '..', 'public', 'assets', 'logos')
);

module.exports = {
  FILES_BASE_DIR,
  CUSTOMER_LOGO_DIR
};
