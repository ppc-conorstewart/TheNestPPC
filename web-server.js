// ==============================
// The NEST App — Private Frontend Web Server
// Serves React build behind HTTP Basic Auth
// ==============================

const path = require('path');
const express = require('express');

// ---------- CONFIG ----------
const USER = process.env.BASIC_USER || 'Paloma';
const PASS = process.env.BASIC_PASS || 'Paloma2025*';
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, 'client', 'build');

// Optional IP allowlist: "1.2.3.4,5.6.7.8"
const IP_ALLOWLIST = (process.env.IP_ALLOWLIST || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// ---------- Basic Auth ----------
function basicAuth(req, res, next) {
  if (IP_ALLOWLIST.length) {
    const remote = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    if (!IP_ALLOWLIST.includes(remote)) return res.status(403).send('Forbidden');
  }
  const auth = req.headers.authorization || '';
  const token = auth.split(' ')[1] || '';
  const [u, p] = Buffer.from(token || '', 'base64').toString().split(':');
  if (u === USER && p === PASS) return next();
  res.set('WWW-Authenticate', 'Basic realm="TheNestPPC"');
  return res.status(401).send('Authentication required');
}

// ---------- App ----------
const app = express();
app.disable('x-powered-by');
app.use(basicAuth);
app.use(express.static(STATIC_DIR, { maxAge: '1h', index: 'index.html' }));

// ---------- SPA fallback (Express 4) ----------
app.get('*', (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`Private frontend listening on port ${PORT}`);
  console.log(`Serving: ${STATIC_DIR}`);
});
