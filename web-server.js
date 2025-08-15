// ==============================
// The NEST App — Unified Web Server (API + Frontend)
// ==============================
const path = require('path');
const express = require('express');

// ---------- Load API first (handles /auth/discord, /api, etc.) ----------
const apiApp = require('./server/index'); // exports the initialized Express app

// ---------- CONFIG ----------
const USER = process.env.BASIC_USER || 'Paloma';
const PASS = process.env.BASIC_PASS || 'Paloma2025*';
const PORT = process.env.PORT || 3000;
// CRA build by default; change to 'client/dist' if using Vite
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, 'client', 'build');

const IP_ALLOWLIST = (process.env.IP_ALLOWLIST || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// ---------- Basic Auth (frontend only) ----------
function basicAuth(req, res, next) {
  if (IP_ALLOWLIST.length) {
    const remote = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '')
      .split(',')[0].trim();
    if (!IP_ALLOWLIST.includes(remote)) return res.status(403).send('Forbidden');
  }
  const auth = req.headers.authorization || '';
  const token = (auth.split(' ')[1] || '');
  const [u, p] = Buffer.from(token || '', 'base64').toString().split(':');
  if (u === USER && p === PASS) return next();
  res.set('WWW-Authenticate', 'Basic realm="TheNestPPC"');
  return res.status(401).send('Authentication required');
}

// ---------- App ----------
const app = express();
app.disable('x-powered-by');

// Mount API first so OAuth & API never hit SPA fallback
app.use(apiApp);

// Frontend: protect with Basic Auth, then serve static
app.use(basicAuth);
app.use(express.static(STATIC_DIR, { maxAge: '1h', index: 'index.html' }));

// ---------- SPA fallback (absolute path; bypass OAuth paths just in case) ----------
app.get('*', (req, res) => {
  if (req.path.startsWith('/auth/discord')) {
    return res.status(404).send('Not Found');
  }
  const indexPath = path.join(STATIC_DIR, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application.');
    }
  });
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`Unified server listening on port ${PORT}`);
  console.log(`Serving frontend from: ${STATIC_DIR}`);
});
