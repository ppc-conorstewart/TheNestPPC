// ==============================
// server/config/config.js
// Centralized configuration (no hard‑coded secrets)
// ==============================

require('dotenv').config();

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

  // MUST match the Discord Developer Portal Redirect URI
  DISCORD_CALLBACK_URL:
    process.env.DISCORD_CALLBACK_URL ||
    `${API_BASE_DEFAULT}/auth/discord/callback`,

  SESSION_SECRET: process.env.SESSION_SECRET || 'super_secret_key',

  // Required in environment (no hardcoded fallbacks)
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
};
