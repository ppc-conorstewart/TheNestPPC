// ==============================
// server/config/config.js
// Centralized configuration for The NEST App
// ==============================

require('dotenv').config();

const isRender = !!process.env.RENDER;
const renderHost =
  process.env.RENDER_EXTERNAL_URL || 'thenestppc-1.onrender.com';

// Build sensible defaults for each environment
const DEFAULT_API_BASE = isRender
  ? `https://${renderHost}`
  : 'http://localhost:3001';

const DEFAULT_FRONTEND = isRender
  ? `https://${renderHost}`
  : 'http://localhost:3000';

module.exports = {
  PORT: Number(process.env.PORT) || 3001,

  // Frontend (where we redirect the user after auth)
  FRONTEND_URL: process.env.FRONTEND_URL || DEFAULT_FRONTEND,

  // Discord OAuth callback must exactly match the Redirect URI in the Discord Developer Portal
  DISCORD_CALLBACK_URL:
    process.env.DISCORD_CALLBACK_URL || `${DEFAULT_API_BASE}/auth/discord/callback`,

  // Session secret for express-session
  SESSION_SECRET: process.env.SESSION_SECRET || 'super_secret_key',

  // Discord app credentials – must be set in env on Render
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
};
