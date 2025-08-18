// src/components/DFITPage.jsx

import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import Consumables from './Consumables';
import SimpleViewer from './SimpleViewer';
import SpecsPanel from './SpecsPanel';
import useAssemblyWeight from '../hooks/useAssemblyWeight';
import useAssets from '../hooks/useAssets';
import torqueSpecs from '../data/TorqueSpecs';

export default function DFITPage({
  metadata,
  selections,
  assets,
  buildQtys,
  setBuildQtys,
  activeTab,
  setActiveTab,
  handleChange,
  baseColors,
  addConsumable,
  savedItems,
  setSavedItems,
  // model persistence props
  simpleModelUrl,
  onSimpleModelChange,
  simpleModelLocked,
  onSimpleModelLockedChange,
  simpleModelLabels,
  onSimpleModelLabelsChange,
  setSpecs, // <-- pass down from parent for aggregation!
}) {
  const abbr = { 'Red Deer': 'RD', 'Grand Prairie': 'GP', Nisku: 'NIS' };

  // Build array of the 10 selected asset names from selections
  const selectedAssets = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => selections[`location${i + 1}`])
        .filter(Boolean),
    [selections]
  );

  // === AUTO TORQUE LOOKUP BLOCK ===
  const connectionKeys = selectedAssets
    .map(name => {
      const m = name.match(/(\d[-\d/]+)\s*"?\s*(\d{2,5}K)/i);
      if (m) return `${m[1]} ${m[2]}`;
      return null;
    })
    .filter(Boolean);

  const uniqueKeys = [...new Set(connectionKeys)];
  const torqueSpecsArr = uniqueKeys
    .map(key => {
      const spec = torqueSpecs[key];
      if (!spec) return null;
      return {
        connection: key,
        torque: (spec.torqueLubed && spec.torqueDry)
          ? `${spec.torqueLubed} ft-lbs (Lubed) / ${spec.torqueDry} ft-lbs (Dry)`
          : spec.maxFtLbs
            ? `${spec.maxFtLbs} ft-lbs`
            : '-',
        ringGasket: spec.ringGasket,
        numBolts: spec.numBolts,
        stud: spec.stud,
        wrench: spec.wrench,
        maxFtLbs: spec.maxFtLbs,
      };
    })
    .filter(Boolean);
  // === END AUTO TORQUE LOOKUP BLOCK ===

  // Total weight (kg) of this DFIT assembly (legacy weight hook)
  const dfitWeight = useAssemblyWeight(selectedAssets);

  // Combined specs (weight, volume, OAL) from AssetSpecifications.json
  const { computeCombinedSpecs } = useAssets();
  const { totalWeight, totalVolume, totalOAL } = useMemo(
    () => computeCombinedSpecs(selectedAssets),
    [selectedAssets]
  );

  // ---- MULTIPLY SPECS BY BUILD QTY BEFORE PUSHING UP ----
  useEffect(() => {
    if (setSpecs) {
      const buildQty = Number(buildQtys?.[activeTab]) || 0;
      setSpecs([
        {
          fillVolume: (Number(totalVolume) || 0) * buildQty,
          weight: (Number(totalWeight) || 0) * buildQty,
          OAL: (Number(totalOAL) || 0) * buildQty,
          buildQty,
        }
      ]);
    }
  }, [setSpecs, totalVolume, totalWeight, totalOAL, buildQtys, activeTab]);
  // -------------------------------------------------------

  // Void toggles:
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

  // Fixed categories:
  const categories = [
    'Valves',
    'Adapters',
    'Weco',
    'Spools',
    'Instrumentation Flanges',
    'Other',
  ];

  // Bucket names by category, deduped & sorted
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

  // summary & in-use for a given slot key
  const getSummary = key => {
    const sel = selections[key] || '';
    const summary = {};
    assets
      .filter(a => a.name === sel && a.status === 'Available')
      .forEach(a => {
        summary[a.location] = (summary[a.location] || 0) + 1;
      });
    const inUse = assets.filter(
      a => a.name === sel && /in[\s-]?use/i.test(a.status)
    ).length;
    return { sel, summary, inUse };
  };

  function Slot({ n }) {
    const catKey = `category${n}`;
    const assetKey = `location${n}`;
    const chosenCategory = selections[catKey] || null;
    const { sel, summary, inUse } = getSummary(assetKey);
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

  return (
    <div className="flex h-full bg-black uppercase text-[9px]">
      {/* Left pane (3D model or image) */}
      <div
        className="flex-none mr-2 border border-[#374151] bg-black"
        style={{ width: '45%' }}
      >
        <SimpleViewer
          style={{ width: '100%', height: '100%' }}
          initialUrl={simpleModelUrl}
          onUrlChange={onSimpleModelChange}
          initialLocked={simpleModelLocked}
          onLockedChange={onSimpleModelLockedChange}
          initialLabels={simpleModelLabels}
          onLabelsChange={onSimpleModelLabelsChange}
        />
      </div>

      {/* Right pane (controls + specs) */}
      <div className="flex-1 bg-[#111] border border-[#6a7257] p-3 flex flex-col overflow-auto">
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
          <div className="flex gap-1">
            {['DFIT-A', 'DFIT-B'].map((lbl, i) => (
              <button
                key={lbl}
                onClick={() => setActiveTab(i)}
                className={`px-3 py-1 font-bold text-sm rounded ${
                  activeTab === i
                    ? 'bg-[#6a7257] text-black'
                    : 'bg-[#333] text-white hover:bg-[#6a7257]'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Asset Slots */}
        <div className="flex gap-4 mb-24 overflow-auto">
          <div className="flex-1">
            <h4 className="text-[#6a7257] uppercase font-bold text-[14px] mb-2 text-center">
              SELECT ASSET (1–5)
            </h4>
            {Array.from({ length: 5 }, (_, i) => (
              <Slot key={i + 1} n={i + 1} />
            ))}
          </div>
          <div className="flex-1">
            <h4 className="text-[#6a7257] uppercase font-bold text-[14px] mb-2 text-center">
              SELECT ASSET (6–10)
            </h4>
            {Array.from({ length: 5 }, (_, i) => (
              <Slot key={6 + i} n={6 + i} />
            ))}
          </div>
        </div>

        {/* Consumables */}
        <Consumables
          buildQty={buildQtys[activeTab]}
          activeTab={activeTab}
          page="DFIT"
          addConsumable={addConsumable}
          savedItems={savedItems}
          setSavedItems={setSavedItems}
        />

        {/* Specifications Panel */}
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
