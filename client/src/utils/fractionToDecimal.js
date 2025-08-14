// src/utils/fractionToDecimal.js
const FRACTION_MAP = {
  '7-1/16': '7.0625',
  '5-1/8': '5.125',
  '3-1/16': '3.0625',
  '2-1/16': '2.0625',
  // add more if you need
};

/**
 * Replaces fraction sizes (e.g., '7-1/16') with decimal (e.g., '7.0625')
 */
export function convertFractionSizeToDecimal(str) {
  if (!str) return str;
  let replaced = str;
  Object.keys(FRACTION_MAP).forEach(frac => {
    // Replace both with and without quotes
    replaced = replaced.replace(frac + '"', FRACTION_MAP[frac]); // e.g., 7-1/16"
    replaced = replaced.replace(frac, FRACTION_MAP[frac]);
  });
  return replaced;
}
