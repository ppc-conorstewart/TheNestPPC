require('dotenv').config()

const isProd = process.env.NODE_ENV === 'production'

function requiredEnv(key, { allowEmptyInDev = true } = {}) {
  const val = process.env[key]
  if (isProd && !val) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return val || (allowEmptyInDev ? '' : undefined)
}

module.exports = {
  PORT: Number(process.env.PORT) || 3001,
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://thenestppc-frontend-production.up.railway.app',
  // In production these must be provided via environment; no hardcoded defaults
  DISCORD_CALLBACK_URL: requiredEnv('DISCORD_CALLBACK_URL'),
  SESSION_SECRET: process.env.SESSION_SECRET || (!isProd ? 'dev-only-session-secret' : undefined),
  DISCORD_CLIENT_ID: requiredEnv('DISCORD_CLIENT_ID'),
  DISCORD_CLIENT_SECRET: requiredEnv('DISCORD_CLIENT_SECRET')
}
