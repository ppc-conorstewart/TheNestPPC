// ==============================
// FILE: tools/upload-seed.js — One-off uploader for seeding Railway Volume
// Sections: Config • Walk • Upload • Main
// ==============================
const fs = require('fs');
const path = require('path');
const os = require('os');
const fetch = require('node-fetch');
const FormData = require('form-data');

// ------------------------------
// Config
// ------------------------------
const LOCAL_UPLOADS_DIR = process.env.LOCAL_UPLOADS_DIR || path.join(process.cwd(), 'server', 'uploads');
const ADMIN_KEY = process.env.ADMIN_IMPORT_KEY || '';
const BASE_URL = process.env.SEED_BASE_URL || 'https://thenestppc-production.up.railway.app'; // change if needed
const ENDPOINT = `${BASE_URL.replace(/\/+$/, '')}/api/admin/seed`;
const CONCURRENCY = parseInt(process.env.SEED_CONCURRENCY || '4', 10);

// ------------------------------
// Walk
// ------------------------------
function listFiles(baseDir) {
  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
      } else if (entry.isFile()) {
        out.push(abs);
      }
    }
  }
  walk(baseDir);
  return out.map(abs => ({
    abs,
    rel: path.relative(baseDir, abs).replace(/\\/g, '/'),
  }));
}

// ------------------------------
// Upload
// ------------------------------
async function uploadOne(file) {
  const form = new FormData();
  form.append('relPath', file.rel);
  form.append('file', fs.createReadStream(file.abs), path.basename(file.abs));

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'x-admin-key': ADMIN_KEY },
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

async function runBatch(files) {
  let i = 0, ok = 0, fail = 0;
  const q = [...files];
  const workers = Array.from({ length: CONCURRENCY }).map(async () => {
    while (q.length) {
      const f = q.shift();
      const idx = ++i;
      try {
        await uploadOne(f);
        ok++;
        process.stdout.write(`[${idx}/${files.length}] OK  ${f.rel}\n`);
      } catch (e) {
        fail++;
        process.stdout.write(`[${idx}/${files.length}] ERR ${f.rel} :: ${e.message}\n`);
      }
    }
  });
  await Promise.all(workers);
  return { ok, fail, total: files.length };
}

// ------------------------------
// Main
// ------------------------------
(async () => {
  if (!ADMIN_KEY) {
    console.error('Set ADMIN_IMPORT_KEY env to match server.');
    process.exit(1);
  }
  if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
    console.error(`Local uploads not found: ${LOCAL_UPLOADS_DIR}`);
    process.exit(1);
  }
  const files = listFiles(LOCAL_UPLOADS_DIR);
  if (!files.length) {
    console.error('No files to upload.');
    process.exit(1);
  }
  console.log(`Seeding ${files.length} files from ${LOCAL_UPLOADS_DIR} -> ${ENDPOINT}`);
  const res = await runBatch(files);
  console.log(`Done. OK=${res.ok} FAIL=${res.fail} TOTAL=${res.total}`);
})();
