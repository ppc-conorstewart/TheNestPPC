// ==============================
// FILE: src/components/AssemblyPage.jsx
// ==============================

import { useMemo, useState } from 'react';
import Select from 'react-select';
import torqueSpecsData from '../../data/TorqueSpecs';
import useAssets from '../../hooks/useAssets';
import Consumables from './Consumables';
import SimpleViewer from './SimpleViewer';
import SpecsPanel from './SpecsPanel';

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
  buildingBase,
  buildQty,
  priorSelectionsList,
  priorBuildQtysList
}) {
  const catKey = 'category' + n;
  const assetKey = 'location' + n;
  const qtyKey = 'qty' + n;

  const chosenCategory = selections[catKey] || null;
  const sel = selections[assetKey] || '';
  const qty = Number.isFinite(Number(selections[qtyKey])) ? Number(selections[qtyKey]) : 1;

  const summary = {};
  assets
    .filter(a => a.name === sel && a.status === 'Available')
    .forEach(a => {
      const base = a.location || '';
      summary[base] = (summary[base] || 0) + 1;
    });

  const isVoid = voided[n];

  const usedAtBaseForThisAsset_CurrentPage = useMemo(() => {
    if (!sel) return 0;
    let perPageCount = 0;
    for (let i = 1; i <= 10; i++) {
      if (selections['location' + i] === sel) {
        const q = Number(selections['qty' + i]) || 1;
        perPageCount += q;
      }
    }
    const assemblyBuildQty = Number(buildQty) || 0;
    return perPageCount * assemblyBuildQty;
  }, [selections, sel, buildQty]);

  const usedAtBaseForThisAsset_PriorPages = useMemo(() => {
    if (!sel || !Array.isArray(priorSelectionsList) || !Array.isArray(priorBuildQtysList)) return 0;
    let total = 0;
    priorSelectionsList.forEach((selArray, idx) => {
      const bqs = priorBuildQtysList[idx] || [];
      selArray.forEach((selObj, tabIdx) => {
        const buildQtyForTab = Number(bqs[tabIdx]) || 0;
        let perTabCount = 0;
        for (let i = 1; i <= 10; i++) {
          if (selObj['location' + i] === sel) {
            const q = Number(selObj['qty' + i]) || 1;
            perTabCount += q;
          }
        }
        total += perTabCount * buildQtyForTab;
      });
    });
    return total;
  }, [priorSelectionsList, priorBuildQtysList, sel]);

  let options;
  let placeholder;
  if (!chosenCategory) {
    options = categories.map(c => ({ value: c, label: c.toUpperCase() }));
    placeholder = 'SELECT CATEGORY';
  } else {
    options = [
      { value: '__RESET_CAT', label: '← CHANGE CATEGORY' },
      ...bucketed[chosenCategory].map(name => ({ value: name, label: name.toUpperCase() }))
    ];
    placeholder = 'SELECT ASSET';
  }

  return (
    <div key={n} className='mb-2'>
      <div className='flex items-center gap-1 uppercase'>
        <span className='text-gray-400 text-[7px]'>{n}.</span>
        {!isVoid ? (
          <>
            <Select
              options={options}
              placeholder={placeholder}
              isClearable
              value={!chosenCategory ? null : sel ? { value: sel, label: sel.toUpperCase() } : null}
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
              className='flex-1 text-[7px]'
              styles={{
                control: base => ({ ...base, backgroundColor: 'black', borderColor: '#374151', minHeight: '1.2rem', fontSize: '0.6rem' }),
                menu: base => ({ ...base, backgroundColor: '#111' }),
                option: (base, { isFocused }) => ({ ...base, backgroundColor: isFocused ? '#374151' : '#111', color: 'white', fontSize: '0.6rem' }),
                singleValue: base => ({ ...base, color: '#6a7257', fontWeight: 600, letterSpacing: '0.5px', fontSize: '0.7rem' })
              }}
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              menuPosition='fixed'
              maxMenuHeight={300}
            />
            <div className='flex items-center gap-1 ml-2'>
              <span className='text-gray-400 text-[7px]'>QTY</span>
              <input
                type='number'
                min='0'
                step='1'
                value={qty}
                onChange={e => {
                  const v = Math.max(0, Math.floor(Number(e.target.value || 0)));
                  handleChange(qtyKey, String(v));
                }}
                className='w-12 px-1 py-[2px] rounded bg-black text-white border border-[#374151] text-[9px] focus:outline-none'
              />
            </div>
          </>
        ) : (
          <span className='text-[#6a7257] font-bold text-[7px]'>VOID</span>
        )}
        <button onClick={() => toggleVoid(n)} className='text-red-500 text-sm select-none'>×</button>
      </div>

      {!isVoid && sel && (
        <div className='text-[5px] text-gray-400 ml-6 uppercase'>
          {Object.entries(summary).map(([base, cnt]) => {
            const adjustedBase =
              base === buildingBase
                ? (cnt - usedAtBaseForThisAsset_PriorPages - usedAtBaseForThisAsset_CurrentPage)
                : cnt;
            return (
              <span key={base} className='inline-block ml-2'>
                <span className={(baseColors[base] || '') + ' font-semibold text-[5px]'}>{abbr[base] || base}:</span>{' '}
                <span className={adjustedBase > 0 ? 'text-green-400' : 'text-red-400'}>{adjustedBase}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTorqueSpecForAsset(assetName) {
  if (!assetName) return null;
  const match = assetName.match(/([3-9][\.\-\d\/]*)\s*["']?\s*([0-9]{2,3}K)/i);
  if (!match) return null;
  let size = match[1];
  const psi = match[2].replace(/K/i, '') + 'K';
  let keyFrac = size + ' ' + psi;
  const decToFrac = { '7.0625': '7-1/16', '5.125': '5-1/8', '3.0625': '3-1/16', '2.0625': '2-1/16' };
  if (decToFrac[size]) keyFrac = decToFrac[size] + ' ' + psi;
  const data = torqueSpecsData[keyFrac] || torqueSpecsData[keyFrac];
  if (data && data.maxFtLbs) return { connection: keyFrac, torque: data.maxFtLbs };
  return null;
}

export default function AssemblyPage({
  title,
  woNumber,
  selections,
  allSelections,
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
  buildingBase,
  priorSelectionsList = [],
  priorBuildQtysList = []
}) {
  const abbr = { 'Red Deer': 'RD', 'Grand Prairie': 'GP', Nisku: 'NIS' };

  const categories = ['Valves', 'Adapters', 'Weco', 'Spools', 'Instrumentation Flanges', 'Other'];

  const bucketed = useMemo(() => {
    const buckets = { Valves: new Set(), Adapters: new Set(), Weco: new Set(), Spools: new Set(), 'Instrumentation Flanges': new Set(), Other: new Set() };
    assets.forEach(a => {
      const nm = a.name || '';
      const l = nm.toLowerCase();
      if (l.includes('valve')) buckets.Valves.add(nm);
      else if (l.includes('adapter')) buckets.Adapters.add(nm);
      else if (l.includes('weco')) buckets.Weco.add(nm);
      else if (l.includes('spool')) buckets.Spools.add(nm);
      else if (l.includes('flange')) buckets['Instrumentation Flanges'].add(nm);
      else buckets.Other.add(nm);
    });
    return Object.fromEntries(Object.entries(buckets).map(([k, set]) => [k, Array.from(set).sort((a, b) => a.localeCompare(b))]));
  }, [assets]);

  const [voided, setVoided] = useState(() => {
    const v = {};
    for (let i = 1; i <= 10; i++) v[i] = false;
    return v;
  });
  const toggleVoid = n => {
    setVoided(v => {
      const nv = { ...v, [n]: !v[n] };
      handleChange('void' + n, nv[n]);
      handleChange('location' + n, '');
      return nv;
    });
  };

  const { computeCombinedSpecs } = useAssets();
  const selectedAssetNames = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => selections['location' + (i + 1)])
        .filter((name, idx) => typeof name === 'string' && name && !voided[idx + 1]),
    [selections, voided]
  );

  const { totalWeight = 0, totalVolume = 0, totalOAL = 0 } = computeCombinedSpecs(selectedAssetNames);

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

  const storageKey = (woNumber || 'WO') + '::' + (title || 'Assembly') + '::TAB' + String(activeTab);
  const currentBuildQty = Number(buildQtys?.[activeTab]) || 0;

  return (
    <div className='flex h-full bg-black uppercase text-[9px]'>
      <div className='flex-none mr-2 border border-[#374151] bg-black' style={{ width: '45%' }}>
        <SimpleViewer
          key={storageKey}
          style={{ width: '100%', height: '100%' }}
          initialUrl={modelUrl}
          onUrlChange={setModelUrl}
          initialLocked={locked}
          onLockedChange={setLocked}
          initialLabels={labels}
          onLabelsChange={setLabels}
          storageKey={storageKey}
        />
      </div>

      <div className='flex-1 bg-[#111] border border-[#6a7257] p-3 flex flex-col overflow-auto'>
        <div className='flex items-center justify-between mb-2'>
          <div className='font-bold text-[#6a7257] text-lg tracking-widest'>{woNumber}</div>
          <div className='text-white text-xl font-bold'>{title}</div>
        </div>

        <div className='flex justify-between items-center mb-3'>
          <div className='flex items-center space-x-2'>
            <label className='text-white font-bold text-lg'>BUILD QTY:</label>
            <input
              type='number'
              step='1'
              min='0'
              value={Math.floor(currentBuildQty)}
              onChange={e => {
                const v = Math.max(0, Math.floor(Number(e.target.value)));
                setBuildQtys(bqs => bqs.map((x, i) => (i === activeTab ? v : x)));
              }}
              className='w-16 px-2 py-1 rounded bg-black text-xl text-white border border-[#374151] focus:outline-none'
            />
          </div>
          {Array.isArray(buildQtys) && buildQtys.length > 1 && (
            <div className='flex gap-1'>
              {buildQtys.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={'px-3 py-1 font-bold text-sm rounded ' + (activeTab === i ? 'bg-[#6a7257] text-black' : 'bg-[#333] text-white hover:bg-[#6a7257]')}
                >
                  {title} {String.fromCharCode(65 + i)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className='flex gap-4 mb-24 overflow-auto'>
          <div className='flex-1'>
            <h4 className='text-[#6a7257] uppercase font-bold text-[14px] mb-2 text-center'>SELECT ASSET (1–5)</h4>
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
                buildingBase={buildingBase}
                buildQty={currentBuildQty}
                priorSelectionsList={priorSelectionsList}
                priorBuildQtysList={priorBuildQtysList}
              />
            ))}
          </div>
          <div className='flex-1'>
            <h4 className='text-[#6a7257] uppercase font-bold text-[14px] mb-2 text-center'>SELECT ASSET (6–10)</h4>
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
                buildingBase={buildingBase}
                buildQty={currentBuildQty}
                priorSelectionsList={priorSelectionsList}
                priorBuildQtysList={priorBuildQtysList}
              />
            ))}
          </div>
        </div>

        <Consumables
          buildQty={currentBuildQty}
          activeTab={activeTab}
          page={title}
          addConsumable={addConsumable}
          savedItems={savedItems}
          setSavedItems={setSavedItems}
        />

        <SpecsPanel weight={totalWeight} volume={totalVolume} oal={totalOAL} torqueSpecs={torqueSpecsArr} />
      </div>
    </div>
  );
}
