// client/src/data/convert-specs.js

const fs   = require('fs');
const XLSX = require('xlsx');

// 1. Read the workbook
const workbook = XLSX.readFile('./Asset-Specifications.xlsx');
const sheet    = workbook.Sheets[workbook.SheetNames[0]];

// 2. Parse to JS objects
const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

// Helper to convert pounds → kilograms (2 decimals)
const toKg = lbs => Math.round(lbs * 0.453592 * 100) / 100;

// 3. Build the lookup
const mapping = {};

rows.forEach(row => {
  // Use whichever column has a name
  const name = row['SPOOLS'] || row['VALVES'];
  if (!name) return; 

  // Weight (lbs) columns differ by section; pick the non-null one
  const wLbs = row['Weight(lbs)']   != null
    ? row['Weight(lbs)']
    : row['Weight(lbs).1'];

  // OAL and fill-volume columns
  const oal       = row['OAL(INCHES)'];
  const fillVol   = row['Fill Volume (Litres)'];

  // Only include if we have at least a name & OAL
  if (wLbs == null || oal == null || fillVol == null) return;

  mapping[name] = {
    weight:     toKg(wLbs),      // kg
    OAL:        oal,             // inches
    fillVolume: fillVol          // litres
  };
});

// 4. Write out to JSON
fs.writeFileSync(
  './AssetSpecifications.json',
  JSON.stringify(mapping, null, 2)
);

console.log(`Wrote ${Object.keys(mapping).length} assets to AssetSpecifications.json`);
