// src/components/AssemblyPage.jsx

import React, { useMemo, useState } from 'react';
import Select from 'react-select';
import SimpleViewer from './SimpleViewer';
import Consumables from './Consumables';
import SpecsPanel from './SpecsPanel';
import useAssets from '../../hooks/useAssets';
import torqueSpecsData from '../../data/TorqueSpecs'; // import your torque specs map

function AssetSlot({
  n,
  categories,
  selections,
  handleChange,
  assets,
  bucketed,
  baseColors,
  abbr,
  voided,
  toggleVoid,
}) {
  const catKey = `category${n}`;
  const assetKey = `location${n}`;
  const chosenCategory = selections[catKey] || null;
  const sel = selections[assetKey] || '';
  const summary = {};
  assets
    .filter(a => a.name === sel && a.status === 'Available')
    .forEach(a => {
      summary[a.location] = (summary[a.location] || 0) + 1;
    });
  const inUse = assets.filter(
    a => a.name === sel && /in[\s-]?use/i.test(a.status)
  ).length;
  const isVoid = voided[n];

  let options, placeholder;
  if (!chosenCategory) {
    options = categories.map(c => ({ value: c, label: c.toUpperCase() }));
    placeholder = 'SELECT CATEGORY';
  } else {
    options = [
      { value: '__RESET_CAT', label: '← CHANGE CATEGORY' },
      ...bucketed[chosenCategory].map(name => ({
        value: name,
        label: name.toUpperCase(),
      })),
    ];
    placeholder = 'SELECT ASSET';
  }

  return (
    <div key={n} className="mb-2">
      <div className="flex items-center gap-1 uppercase">
        <span className="text-gray-400 text-[7px]">{n}.</span>
        {!isVoid ? (
          <Select
            options={options}
            placeholder={placeholder}
            isClearable
            value={
              !chosenCategory
                ? null
                : sel
                ? { value: sel, label: sel.toUpperCase() }
                : null
            }
            onChange={opt => {
              if (opt === null) {
                handleChange(catKey, '');
                handleChange(assetKey, '');
                return;
              }
              if (!chosenCategory) {
                handleChange(catKey, opt.value);
                handleChange(assetKey, '');
              } else if (opt.value === '__RESET_CAT') {
                handleChange(catKey, '');
                handleChange(assetKey, '');
              } else {
                handleChange(assetKey, opt.value);
              }
            }}
            className="flex-1 text-[7px]"
            styles={{
              control: base => ({
                ...base,
                backgroundColor: 'black',
                borderColor: '#374151',
                minHeight: '1.2rem',
                fontSize: '0.6rem',
              }),
              menu: base => ({ ...base, backgroundColor: '#111' }),
              option: (base, { isFocused }) => ({
                ...base,
                backgroundColor: isFocused ? '#374151' : '#111',
                color: 'white',
                fontSize: '0.6rem',
              }),
              singleValue: base => ({
                ...base,
                color: '#6a7257',
                fontWeight: 600,
                letterSpacing: '0.5px',
                fontSize: '0.7rem',
              }),
            }}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            maxMenuHeight={300}
          />
        ) : (
          <span className="text-[#6a7257] font-bold text-[7px]">VOID</span>
        )}
        <button
          onClick={() => toggleVoid(n)}
          className="text-red-500 text-sm select-none"
        >
          ×
        </button>
      </div>

      {!isVoid && sel && (
        <div className="text-[5px] text-gray-400 ml-6 uppercase">
          IN-USE: <span className="text-yellow-400">{inUse}</span>
          {Object.entries(summary).map(([base, cnt]) => (
            <span key={base} className="inline-block ml-2">
              <span
                className={`${baseColors[base]} font-semibold text-[5px]`}
              >
                {abbr[base] || base}:
              </span>{' '}
              <span className={cnt > 0 ? 'text-green-400' : 'text-red-400'}>
                {cnt}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Helper: get torque spec for asset string (fraction/decimal normalization) ---
function getTorqueSpecForAsset(assetName) {
  if (!assetName) return null;
  // Try to extract a "size" and "rating" part from the asset name
  // E.g., "Hydraulic Valve | 7-1/16 15K" or "Manual Valve | 7.0625 15K"
  // Both should resolve to "7-1/16 15K" or "7.0625 15K"
  // Our torqueSpecsData keys are in the form "7-1/16 15K", "5-1/8 15K", etc.
  // We'll try both original, fraction-to-decimal, and decimal-to-fraction conversions

  // Regex to extract something like 7-1/16 or 7.0625 and the pressure
  const match = assetName.match(/([3-9][\.\-\d\/]*)\s*[\"]*\s*([0-9]{2,3}K)/i);
  if (!match) return null;

  let size = match[1];
  let psi = match[2].replace(/K/i, '') + 'K';

  // Try direct match (as in keys in your torqueSpecs.js)
  let keyFrac = `${size} ${psi}`; // E.g. "7-1/16 15K" or "5-1/8 10K"
  let keyDec = keyFrac;

  // Support decimal-to-fraction for torqueSpecsData too
  const decToFrac = {
    '7.0625': '7-1/16',
    '5.125': '5-1/8',
    '3.0625': '3-1/16',
    '2.0625': '2-1/16',
  };
  if (decToFrac[size]) keyFrac = `${decToFrac[size]} ${psi}`;

  // Try both keys
  const data =
    torqueSpecsData[keyFrac] ||
    torqueSpecsData[keyDec] ||
    null;

  if (data && data.maxFtLbs) {
    return {
      connection: keyFrac,
      torque: data.maxFtLbs,
    };
  }
  return null;
}

export default function AssemblyPage({
  title,
  woNumber,
  selections,
  buildQtys,
  setBuildQtys,
  activeTab,
  setActiveTab,
  handleChange,
  assets,
  baseColors,
  addConsumable,
  savedItems,
  setSavedItems,
  modelUrl,
  setModelUrl,
  locked,
  setLocked,
  labels,
  setLabels,
}) {
  const abbr = { 'Red Deer': 'RD', 'Grand Prairie': 'GP', Nisku: 'NIS' };

  // Category logic
  const categories = [
    'Valves',
    'Adapters',
    'Weco',
    'Spools',
    'Instrumentation Flanges',
    'Other',
  ];

  // Bucket asset names by category
  const bucketed = useMemo(() => {
    const buckets = {
      Valves: new Set(),
      Adapters: new Set(),
      Weco: new Set(),
      Spools: new Set(),
      'Instrumentation Flanges': new Set(),
      Other: new Set(),
    };
    assets.forEach(a => {
      const nm = a.name || '';
      const l = nm.toLowerCase();
      if (l.includes('valve')) buckets.Valves.add(nm);
      else if (l.includes('adapter')) buckets.Adapters.add(nm);
      else if (l.includes('weco')) buckets.Weco.add(nm);
      else if (l.includes('spool')) buckets.Spools.add(nm);
      else if (l.includes('flange'))
        buckets['Instrumentation Flanges'].add(nm);
      else buckets.Other.add(nm);
    });
    return Object.fromEntries(
      Object.entries(buckets).map(([k, set]) => [
        k,
        Array.from(set).sort((a, b) => a.localeCompare(b)),
      ])
    );
  }, [assets]);

  // Void toggles per slot (just like DFITPage)
  const [voided, setVoided] = useState(() => {
    const v = {};
    for (let i = 1; i <= 10; i++) v[i] = false;
    return v;
  });
  const toggleVoid = n => {
    setVoided(v => {
      const nv = { ...v, [n]: !v[n] };
      handleChange(`void${n}`, nv[n]);
      handleChange(`location${n}`, '');
      return nv;
    });
  };

  const { computeCombinedSpecs } = useAssets();

  // Gather all non-voided, non-empty asset selections for slots 1-10
  const selectedAssetNames = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => selections[`location${i + 1}`])
        .filter((name, idx) => name && !voided[idx + 1]),
    [selections, voided]
  );

  // Calculate totals
  const { totalWeight = 0, totalVolume = 0, totalOAL = 0 } =
    computeCombinedSpecs(selectedAssetNames);

  // Gather all relevant torque specs for selected assets (no duplicates)
  const torqueSpecsArr = useMemo(() => {
    const arr = [];
    const seen = new Set();
    selectedAssetNames.forEach(name => {
      const specObj = getTorqueSpecForAsset(name);
      if (specObj && !seen.has(specObj.connection)) {
        arr.push(specObj);
        seen.add(specObj.connection);
      }
    });
    return arr;
  }, [selectedAssetNames]);

  // --- UI ---
  return (
    <div className="flex h-full bg-black uppercase text-[9px]">
      {/* Left pane (3D model or image) */}
      <div
        className="flex-none mr-2 border border-[#374151] bg-black"
        style={{ width: '45%' }}
      >
        <SimpleViewer
          style={{ width: '100%', height: '100%' }}
          initialUrl={modelUrl}
          onUrlChange={setModelUrl}
          initialLocked={locked}
          onLockedChange={setLocked}
          initialLabels={labels}
          onLabelsChange={setLabels}
        />
      </div>

      {/* Right pane */}
      <div className="flex-1 bg-[#111] border border-[#6a7257] p-3 flex flex-col overflow-auto">
        {/* Title and WO number */}
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-[#6a7257] text-lg tracking-widest">
            {woNumber}
          </div>
          <div className="text-white text-xl font-bold">{title}</div>
        </div>

        {/* BUILD QTY + Tab Switch */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <label className="text-white font-bold text-lg">BUILD QTY:</label>
            <input
              type="number"
              step="1"
              min="0"
              value={Math.floor(buildQtys[activeTab])}
              onChange={e => {
                const v = Math.max(0, Math.floor(Number(e.target.value)));
                setBuildQtys(bqs =>
                  bqs.map((x, i) => (i === activeTab ? v : x))
                );
              }}
              className="w-16 px-2 py-1 rounded bg-black text-xl text-white border border-[#374151] focus:outline-none"
            />
          </div>
          {Array.isArray(buildQtys) && buildQtys.length > 1 && (
            <div className="flex gap-1">
              {buildQtys.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`px-3 py-1 font-bold text-sm rounded ${
                    activeTab === i
                      ? 'bg-[#6a7257] text-black'
                      : 'bg-[#333] text-white hover:bg-[#6a7257]'
                  }`}
                >
                  {title} {String.fromCharCode(65 + i)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Asset Slots */}
        <div className="flex gap-4 mb-24 overflow-auto">
          <div className="flex-1">
            <h4 className="text-[#6a7257] uppercase font-bold text-[14px] mb-2 text-center">
              SELECT ASSET (1–5)
            </h4>
            {Array.from({ length: 5 }, (_, i) => (
              <AssetSlot
                key={i + 1}
                n={i + 1}
                categories={categories}
                selections={selections}
                handleChange={handleChange}
                assets={assets}
                bucketed={bucketed}
                baseColors={baseColors}
                abbr={abbr}
                voided={voided}
                toggleVoid={toggleVoid}
              />
            ))}
          </div>
          <div className="flex-1">
            <h4 className="text-[#6a7257] uppercase font-bold text-[14px] mb-2 text-center">
              SELECT ASSET (6–10)
            </h4>
            {Array.from({ length: 5 }, (_, i) => (
              <AssetSlot
                key={6 + i}
                n={6 + i}
                categories={categories}
                selections={selections}
                handleChange={handleChange}
                assets={assets}
                bucketed={bucketed}
                baseColors={baseColors}
                abbr={abbr}
                voided={voided}
                toggleVoid={toggleVoid}
              />
            ))}
          </div>
        </div>

        {/* Consumables */}
        <Consumables
          buildQty={buildQtys[activeTab]}
          activeTab={activeTab}
          page={title}
          addConsumable={addConsumable}
          savedItems={savedItems}
          setSavedItems={setSavedItems}
        />

        {/* Specifications Panel - shows totals and all torque specs for current assembly */}
        <SpecsPanel
          weight={totalWeight}
          volume={totalVolume}
          oal={totalOAL}
          torqueSpecs={torqueSpecsArr}
        />
      </div>
    </div>
  );
}
