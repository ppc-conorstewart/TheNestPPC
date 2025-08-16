// src/hooks/useAssemblyWeight.js

import { useMemo } from 'react';
import assetSpecs from '../data/AssetSpecifications.json';

/**
 * Hook to compute the total assembly weight (in KG) 
 * from an array of selected asset names.
 *
 * @param {string[]} selectedNames
 * @returns {number} total weight in KG
 */
export default function useAssemblyWeight(selectedNames = []) {
  const totalWeight = useMemo(() => {
    return selectedNames.reduce((sum, name) => {
      const spec = assetSpecs[name];
      // If for some reason the asset isn’t in the JSON, treat it as zero.
      return sum + (spec?.weight ?? 0);
    }, 0);
  }, [selectedNames]);

  return totalWeight;
}
