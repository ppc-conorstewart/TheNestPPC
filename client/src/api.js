// =====================================================
// File: client/src/api.js
// Purpose: Centralized environment-driven URL helpers for API integrations
// =====================================================

const envApiBase = (process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || '').trim()
const windowOrigin = typeof window !== 'undefined' ? window.location.origin : ''

const rawApiBase = envApiBase || windowOrigin || ''
export const API_BASE_URL = rawApiBase.replace(/\/+$/, '')
export const API = API_BASE_URL

/**
 * Build a full URL for the main API. Falls back to relative paths when no base is configured.
 */
export function resolveApiUrl(path = '') {
  if (!path) return API_BASE_URL
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${normalized}` : normalized
}

const envBotBase = (process.env.REACT_APP_BOT_SERVICE_URL || '').trim()
const localhostBotFallback =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3020'
    : ''
const rawBotBase = envBotBase || localhostBotFallback || ''
export const BOT_SERVICE_BASE_URL = rawBotBase.replace(/\/+$/, '')

export function resolveBotUrl(path = '') {
  if (!path) return BOT_SERVICE_BASE_URL
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return BOT_SERVICE_BASE_URL ? `${BOT_SERVICE_BASE_URL}${normalized}` : normalized
}