// ==========================================
// FILE: client/src/hooks/useAssetOptions.js
// ==========================================

// ==============================
// useAssetOptions — IMPORTS
// ==============================
import { useEffect, useState } from 'react';

// ==============================
// useAssetOptions — CONSTANTS
// ==============================
const FALLBACK_VENDORS = ['Alaska','Academy','Golden Eagle','Hi-Quality','Source','Domino','Champ','Pacific'];

// ==============================
// useAssetOptions — HOOK
// ==============================
export default function useAssetOptions() {
  const [names, setNames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [vendors, setVendors] = useState(FALLBACK_VENDORS);

  useEffect(() => {
    async function run() {
      try {
        const [n, c, l, s, v] = await Promise.all([
          fetch('http://localhost:3001/api/assets/options/names', { credentials: 'include' }),
          fetch('http://localhost:3001/api/assets/options/categories', { credentials: 'include' }),
          fetch('http://localhost:3001/api/assets/options/locations', { credentials: 'include' }),
          fetch('http://localhost:3001/api/assets/options/statuses', { credentials: 'include' }),
          fetch('http://localhost:3001/api/assets/options/machining_vendors', { credentials: 'include' })
        ]);
        const [nJ, cJ, lJ, sJ, vJ] = await Promise.all([n.json(), c.json(), l.json(), s.json(), v.json()]);
        if (Array.isArray(nJ)) setNames(nJ);
        if (Array.isArray(cJ)) setCategories(cJ);
        if (Array.isArray(lJ)) setLocations(lJ);
        if (Array.isArray(sJ)) setStatuses(sJ);
        if (Array.isArray(vJ) && vJ.length) setVendors(vJ);
      } catch {
        // fall back to defaults
      }
    }
    run();
  }, []);

  return { names, categories, locations, statuses, vendors };
}
