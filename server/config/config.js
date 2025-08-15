// ==============================
// server/config/config.js
// Safe env loader + shared flags (trim-aware)
// ==============================

try { require('dotenv').config(); } catch (_) { /* Render may not have .env */ }

const trim = (v) => (typeof v === 'string' ? v.trim() : v);
const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;

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
  FRONTEND_URL: trim(process.env.FRONTEND_URL) || FRONTEND_DEFAULT,

  // MUST match the Redirect URI in Discord Dev Portal
  DISCORD_CALLBACK_URL:
    trim(process.env.DISCORD_CALLBACK_URL) || `${API_BASE_DEFAULT}/auth/discord/callback`,

  // ==============================
  // Secrets
  // ==============================
  SESSION_SECRET: trim(process.env.SESSION_SECRET) || 'super_secret_key',

  // ==============================
  // Discord OAuth
  // ==============================
  DISCORD_CLIENT_ID: trim(process.env.DISCORD_CLIENT_ID || ''),
  DISCORD_CLIENT_SECRET: trim(process.env.DISCORD_CLIENT_SECRET || '')
};

// ==============================
// Flags (trim-aware to avoid false positives)
// ==============================
cfg.HAS_DISCORD_OAUTH =
  nonEmpty(cfg.DISCORD_CLIENT_ID) &&
  nonEmpty(cfg.DISCORD_CLIENT_SECRET) &&
  nonEmpty(cfg.DISCORD_CALLBACK_URL);

if (!cfg.HAS_DISCORD_OAUTH) {
  console.warn('[Auth] Discord OAuth env missing/empty. Set DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_CALLBACK_URL.');
}

module.exports = cfg;
