// src/hooks/useAssets.js

import { useCallback, useEffect, useState } from 'react';
import { resolveApiUrl } from '../api';
import assetSpecs from '../data/AssetSpecifications.json';

// --- Fraction to decimal utility (inline for now) ---
const FRACTION_MAP = {
  '7-1/16': '7.0625',
  '5-1/8': '5.125',
  '3-1/16': '3.0625',
  '2-1/16': '2.0625',
  // Add more if needed
};
/**
 * Replaces fraction sizes (e.g., '7-1/16') with decimal (e.g., '7.0625')
 */
function convertFractionSizeToDecimal(str) {
  if (!str) return str;
  let replaced = str;
  Object.keys(FRACTION_MAP).forEach(frac => {
    // Replace both with and without quotes, and allow for leading/trailing spaces
    replaced = replaced.replace(new RegExp(frac + '"', 'g'), FRACTION_MAP[frac]);
    replaced = replaced.replace(new RegExp(frac, 'g'), FRACTION_MAP[frac]);
  });
  return replaced;
}

/**
 * Hook to fetch live assets and also compute combined specs
 * (weight, fill volume, OAL) for any selection of asset names.
 */
export default function useAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(resolveApiUrl('/api/assets'), {
        credentials: 'include'
      });
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  /**
   * Normalize name for matching.
   */
  function normalize(name) {
    if (!name) return '';
    return name
      .replace(/"/g, '')      // Remove double quotes
      .replace(/'/g, '')      // Remove single quotes
      .replace(/\s+OAL/gi, '') // Remove trailing OAL if present
      .replace(/\s+/g, ' ')   // Collapse spaces
      .replace(/\s*\|\s*/g, '|') // Collapse spaces around pipe
      .toLowerCase()
      .trim();
  }

  /**
   * Looks up a single asset's spec entry in AssetSpecifications.json using all normalization rules.
   * Returns null if not found.
   */
  function getSpecForAsset(rawName) {
    let spec = assetSpecs[rawName];

    if (!spec) {
      const normalizedRaw = normalize(rawName);
      const matchKey = Object.keys(assetSpecs).find(
        k => normalize(k) === normalizedRaw
      );
      spec = matchKey && assetSpecs[matchKey];
    }

    if (!spec) {
      const decimalName = convertFractionSizeToDecimal(rawName);
      spec = assetSpecs[decimalName];
      if (!spec) {
        const normalizedDecimal = normalize(decimalName);
        const matchKey = Object.keys(assetSpecs).find(
          k => normalize(k) === normalizedDecimal
        );
        spec = matchKey && assetSpecs[matchKey];
      }
    }

    return spec || null;
  }

  /**
   * Given an array of asset display names,
   * returns totals for weight (lbs), fillVolume (L), and OAL (inches).
   */
  const computeCombinedSpecs = (selectedNames = []) => {
    let totalWeight = 0;
    let totalVolume = 0;
    let totalOAL    = 0;

    selectedNames.forEach((rawName) => {
      let spec = getSpecForAsset(rawName); // Use new function here!

      if (spec) {
        totalWeight += spec.weight ?? 0;
        totalVolume += spec.fillVolume ?? 0;
        totalOAL    += spec.OAL ?? 0;
      }
    });

    // Convert KG to LBS for totalWeight
    return {
      totalWeight: totalWeight * 2.20462,
      totalVolume,
      totalOAL
    };
  };

  return {
    assets,
    fetchAssets,
    loading,
    computeCombinedSpecs,
    getSpecForAsset,
  };
}
