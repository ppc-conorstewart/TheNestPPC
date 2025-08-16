// src/components/SwabValveAssemblyPage.jsx

import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import Consumables from '../Consumables';
import ModelViewer from '../ModelViewer';

export default function SwabValveAssemblyPage({
  metadata,
  assets,
  buildQtys,
  setBuildQtys,
  activeTab,
  setActiveTab,
  handleChange,    // handleChange(key, value)
  baseColors,
  addConsumable,
  savedItems,
  setSavedItems,
}) {
  const abbr = { 'Red Deer': 'RD', 'Grand Prairie': 'GP', Nisku: 'NIS' };
  const tabs = ['SVA-1', 'SVA-2'];

  // Void toggles
  const [voided, setVoided] = useState(() => {
    const v = {}; for (let i = 1; i <= 10; i++) v[i] = false;
    return v;
  });
  const toggleVoid = n => {
    setVoided(v => {
      const nv = { ...v, [n]: !v[n] };
      handleChange(`void${n}`, nv[n]);
      return nv;
    });
  };

  // Categories for asset selection
  const categories = ['Valves', 'Adapters', 'Weco', 'Spools', 'Other'];

  // Bucket assets by category
  const bucketed = useMemo(() => {
    const buckets = {
      Valves: new Set(),
      Adapters: new Set(),
      Weco: new Set(),
      Spools: new Set(),
      Other: new Set(),
    };
    assets.forEach(a => {
      const nm = a.name || '';
      const l = nm.toLowerCase();
      if (l.includes('valve')) buckets.Valves.add(nm);
      else if (l.includes('adapter')) buckets.Adapters.add(nm);
      else if (l.includes('weco')) buckets.Weco.add(nm);
      else if (l.includes('spool')) buckets.Spools.add(nm);
      else buckets.Other.add(nm);
    });
    return Object.fromEntries(
      Object.entries(buckets).map(([k, set]) => [
        k,
        Array.from(set).sort((a, b) => a.localeCompare(b)),
      ])
    );
  }, [assets]);

  // Summary & in-use for a given slot
  const getSummary = key => {
    const sel = metadata[key] || '';
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

  // Track category vs asset selection per slot
  const [slotCat, setSlotCat] = useState({});

  function Slot({ n }) {
    const catKey = `category${n}`;
    const assetKey = `location${n}`;
    const chosenCategory = slotCat[n] || metadata[catKey] || null;
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
              value={
                !chosenCategory
                  ? null
                  : sel
                  ? { value: sel, label: sel.toUpperCase() }
                  : null
              }
              onChange={opt => {
                if (!chosenCategory) {
                  setSlotCat(c => ({ ...c, [n]: opt.value }));
                  handleChange(catKey, opt.value);
                  handleChange(assetKey, '');
                } else if (opt.value === '__RESET_CAT') {
                  setSlotCat(c => { const nv = { ...c }; delete nv[n]; return nv; });
                  handleChange(catKey, '');
                  handleChange(assetKey, '');
                } else {
                  handleChange(assetKey, opt.value);
                }
              }}
              isClearable
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
            title={isVoid ? 'Unvoid' : 'Void'}
          >
            ×
          </button>
        </div>

        {!isVoid && sel && (
          <div className="text-[5px] text-gray-400 ml-6 uppercase">
            IN-USE: <span className="text-yellow-400">{inUse}</span>
            {Object.entries(summary).map(([base, cnt]) => (
              <span key={base} className="inline-block ml-2">
                <span className={`${baseColors[base]} font-semibold text-[5px]`}>
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

      {/* Left pane: square viewer */}
      <div
        className="flex-none mr-2 border border-[#374151] bg-black"
        style={{ width: '45%' }}
      >
        <ModelViewer style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Right pane */}
      <div className="flex-1 bg-[#111] border border-[#6a7257] p-3 flex flex-col overflow-auto">

        {/* BUILD QTY + tabs */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <label className="text-white font-bold text-lg">
              BUILD QTY:
            </label>
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
            {tabs.map((lbl, i) => (
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

        {/* ASSET SLOTS (two columns) */}
        <div className="flex gap-4 mb-3 overflow-auto">
          <div className="flex-1">
            <h4 className="text-[#6a7257] uppercase font-bold text-[14px] mb-2 text-center">
              SELECT ASSET (1–5)
            </h4>
            {[1,2,3,4,5].map(n => <Slot key={n} n={n} />)}
          </div>
          <div className="flex-1">
            <h4 className="text-[#6a7257] uppercase font-bold text-[14px] mb-2 text-center">
              SELECT ASSET (6–10)
            </h4>
            {[6,7,8,9,10].map(n => <Slot key={n} n={n} />)}
          </div>
        </div>

        {/* Consumables */}
        <Consumables
          buildQty={buildQtys[activeTab]}
          activeTab={activeTab}
          page="SVA"
          addConsumable={addConsumable}
          savedItems={savedItems}
          setSavedItems={setSavedItems}
        />

        {/* Notes */}
        <div className="mt-4 flex-1 flex flex-col">
          <h4 className="text-[#6a7257] uppercase font-bold text-[14px] mb-2 text-center">
            DETAILS FOR SWAB VALVE ASSEMBLY
          </h4>
          <textarea
            placeholder="Enter notes or parameters for Swab Valve Assembly"
            value={metadata.notes || ''}
            onChange={e => handleChange('notes', e.target.value)}
            className="w-full flex-1 p-2 bg-black text-white text-[8px] border border-[#374151] rounded resize-none focus:outline-none"
          />
        </div>

      </div>
    </div>
  );
}
