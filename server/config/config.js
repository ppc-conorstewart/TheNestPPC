// ==============================
// server/config/config.js
// Safe env loader + shared flags
// ==============================

try { require('dotenv').config(); } catch (_) { /* Render may not have .env */ }

const isRender = !!process.env.RENDER;

// Prefer Render’s provided external URL if present; fall back to known hostname.
const renderHost =
  (process.env.RENDER_EXTERNAL_URL && process.env.RENDER_EXTERNAL_URL.replace(/^https?:\/\//, '')) ||
  process.env.RENDER_HOST ||
  'thenestppc-1.onrender.com';

const FRONTEND_DEFAULT = isRender ? `https://${renderHost}` : 'http://localhost:3000';
const API_BASE_DEFAULT  = isRender ? `https://${renderHost}` : 'http://localhost:3001';

const cfg = {
  // ==============================
  // Ports & URLs
  // ==============================
  PORT: Number(process.env.PORT) || 3001,
  FRONTEND_URL: process.env.FRONTEND_URL || FRONTEND_DEFAULT,

  // MUST match the Redirect URI in Discord Dev Portal
  DISCORD_CALLBACK_URL:
    process.env.DISCORD_CALLBACK_URL || `${API_BASE_DEFAULT}/auth/discord/callback`,

  // ==============================
  // Secrets
  // ==============================
  SESSION_SECRET: process.env.SESSION_SECRET || 'super_secret_key',

  // ==============================
  // Discord OAuth
  // ==============================
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET
};

// ==============================
// Flags (not relied on for safety anymore)
// ==============================
cfg.HAS_DISCORD_OAUTH =
  !!(cfg.DISCORD_CLIENT_ID && cfg.DISCORD_CLIENT_SECRET && cfg.DISCORD_CALLBACK_URL);

if (!cfg.HAS_DISCORD_OAUTH) {
  console.warn('[Auth] Discord OAuth env missing. Set DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_CALLBACK_URL.');
}

module.exports = cfg;
