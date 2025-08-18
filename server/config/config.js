require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  DISCORD_CALLBACK_URL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3001/auth/discord/callback',
  SESSION_SECRET: process.env.SESSION_SECRET || 'super_secret_key',
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || '1377007649924714506',
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || 'caT5jRYxfjJL5z_Lirn0ANQOK6Xu4xgk'
};