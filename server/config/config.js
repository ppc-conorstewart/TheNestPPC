// ==============================
// server/config/config.js
// Safe env loader (doesn't crash if dotenv missing on Render)
// ==============================

// Make dotenv optional so production doesn't crash if it's not installed
try {
  // eslint-disable-next-line global-require
  require('dotenv').config();
} catch (_) { /* no-op */ }

const isRender = !!process.env.RENDER;
const renderHost = process.env.RENDER_EXTERNAL_URL || 'thenestppc-1.onrender.com';

const FRONTEND_DEFAULT = isRender
  ? `https://${renderHost}`
  : 'http://localhost:3000';

const API_BASE_DEFAULT = isRender
  ? `https://${renderHost}`
  : 'http://localhost:3001';

module.exports = {
  PORT: Number(process.env.PORT) || 3001,
  FRONTEND_URL: process.env.FRONTEND_URL || FRONTEND_DEFAULT,

  // MUST match Discord Developer Portal Redirect URI
  DISCORD_CALLBACK_URL:
    process.env.DISCORD_CALLBACK_URL ||
    `${API_BASE_DEFAULT}/auth/discord/callback`,

  SESSION_SECRET: process.env.SESSION_SECRET || 'super_secret_key',

  // These must be set in environment (no hardcoded fallbacks)
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
};
