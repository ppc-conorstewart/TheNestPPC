// =====================================================
// File: client/src/api.js
// Sections: Base URL • Exports
// =====================================================

const rawBase =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  ''

export const API_BASE_URL = rawBase.replace(/\/+$/, '')
export const API = API_BASE_URL
