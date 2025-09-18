// ==============================
// src/components/Master Assembly Components/Mater Asssemblies DB Components/gasketsApi.js
// API helpers for fetching gasket usage for master assemblies
// ==============================

import { resolveApiUrl } from '../../../api';
const API_BASE = '/api/master/gaskets';
const gasketsUrl = (suffix = '') => resolveApiUrl(`${API_BASE}${suffix}`);

/**
 * Normalize a date string to YYYY-MM-DD format.
 */
function normDate(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/**
 * Fetch gaskets for a specific assembly.
 * @param {string} assemblyId e.g. "Dogbone-1"
 * @returns {Promise<Array>} Array of gasket objects
 */
export async function fetchGasketsForAssembly(assemblyId) {
  if (!assemblyId) return [];
  try {
    const res = await fetch(gasketsUrl(`/${encodeURIComponent(assemblyId)}`), {
      credentials: 'include'
    });
    if (!res.ok) {
      console.error(`Failed to fetch gaskets for ${assemblyId}`, res.status);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data)
      ? data.map(g => ({
          ...g,
          gasket_date: normDate(g.gasket_date)
        }))
      : [];
  } catch (err) {
    console.error('Error fetching gaskets for assembly:', err);
    return [];
  }
}

/**
 * Fetch gaskets for all assemblies.
 * @returns {Promise<Object>} Map keyed by assemblyId
 */
export async function fetchAllGaskets() {
  try {
    const res = await fetch(gasketsUrl('/all'), {
      credentials: 'include'
    });
    if (!res.ok) {
      console.error(`Failed to fetch all gaskets`, res.status);
      return {};
    }
    const data = await res.json();
    if (!Array.isArray(data)) return {};

    // Group by assembly id
    return data.reduce((acc, g) => {
      const id = g.assembly || 'UNKNOWN';
      if (!acc[id]) acc[id] = [];
      acc[id].push({
        ...g,
        gasket_date: normDate(g.gasket_date)
      });
      return acc;
    }, {});
  } catch (err) {
    console.error('Error fetching all gaskets:', err);
    return {};
  }
}
