// src/components/Consumables.jsx

import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const gasketOptions = [
  { value: 'BX-156 LCS', label: 'BX-156 LCS (Low Carbon Seal)' },
  { value: 'BX-155 LCS', label: 'BX-155 LCS (Low Carbon Seal)' },
  { value: 'BX-154 LCS', label: 'BX-154 LCS (Low Carbon Seal)' },
  { value: 'BX-169 LCS', label: 'BX-169 LCS (Low Carbon Seal)' },
  { value: 'BX-152 LCS', label: 'BX-152 LCS (Low Carbon Seal)' },
  { value: 'BX-156 SS',  label: 'BX-156 SS (Stainless Steel)' },
  { value: 'BX-155 SS',  label: 'BX-155 SS (Stainless Steel)' },
  { value: 'BX-154 SS',  label: 'BX-154 SS (Stainless Steel)' },
  { value: 'BX-169 SS',  label: 'BX-169 SS (Stainless Steel)' },
  { value: 'BX-152 SS',  label: 'BX-152 SS (Stainless Steel)' },
];

const boltupOptions = [
  {
    value: '2 1/16-10K THRU-FLANGE STUDS/NUTS (7/8-10UN x 6.25")',
    label: '2 1/16-10K THRU-FLANGE STUDS/NUTS (7/8-10UN x 6.25") (8)'
  },
  {
    value: '2 1/16-15K THRU-FLANGE STUDS/NUTS (7/8-10UN x 6.00")',
    label: '2 1/16-15K THRU-FLANGE STUDS/NUTS (7/8-10UN x 6.00") (8)'
  },
  {
    value: '3 1/16-10K THRU-FLANGE STUDS/NUTS (1-8UN x 6.75")',
    label: '3 1/16-10K THRU-FLANGE STUDS/NUTS (1-8UN x 6.75") (8)'
  },
  {
    value: '3 1/16-15K THRU-FLANGE STUDS/NUTS (1 1/8-8UN x 7.75")',
    label: '3 1/16-15K THRU-FLANGE STUDS/NUTS (1 1/8-8UN x 7.75") (8)'
  },
  {
    value: '4 1/16-10K THRU-FLANGE STUDS/NUTS (1 1/8-8UN x 8.00")',
    label: '4 1/16-10K THRU-FLANGE STUDS/NUTS (1 1/8-8UN x 8.00") (8)'
  },
  {
    value: '4 1/16-15K THRU-FLANGE STUDS/NUTS (1 3/8-8UN x 9.25")',
    label: '4 1/16-15K THRU-FLANGE STUDS/NUTS (1 3/8-8UN x 9.25") (8)'
  },
  {
    value: '5 1/8-10K THRU-FLANGE STUDS/NUTS (1 1/8-8UN x 8.75")',
    label: '5 1/8-10K THRU-FLANGE STUDS/NUTS (1 1/8-8UN x 8.75") (12)'
  },
  {
    value: '5 1/8-15K THRU-FLANGE STUDS/NUTS (1 1/2-8UN x 11.50")',
    label: '5 1/8-15K THRU-FLANGE STUDS/NUTS (1 1/2-8UN x 11.50") (12)'
  },
  {
    value: '5 1/8-15K THRU-INSTRUMENTATION-FLANGE STUDS/NUTS (1 1/2-8UN x 11.50")',
    label: '5 1/8-15K THRU-INSTRUMENTATION-FLANGE STUDS/NUTS (1 1/2-8UN x 11.50") (12)'
  },
  {
    value: '7 1/16-10K THRU-FLANGE STUDS/NUTS (1 1/2-8UN x 11.25")',
    label: '7 1/16-10K THRU-FLANGE STUDS/NUTS (1 1/2-8UN x 11.25") (16)'
  },
  {
    value: '7 1/16-15K THRU-FLANGE STUDS/NUTS (1 1/2-8UN x 12.75")',
    label: '7 1/16-15K THRU-FLANGE STUDS/NUTS (1 1/2-8UN x 12.75") (16)'
  },
  {
    value: '7 1/16-15K THRU-ROTATOR-FLANGE STUDS/NUTS (1 1/2-8UN x 15.50")',
    label: '7 1/16-15K THRU-ROTATOR-FLANGE STUDS/NUTS (1 1/2-8UN x 15.50") (16)'
  },
];

// Lower height + font size for react-select
const selectStyles = {
  control: provided => ({
    ...provided,
    background: 'transparent',
    borderColor: '#555',
    color: '#fff',
    minHeight: '22px',
    height: '22px',
    fontSize: '0.62rem',
    lineHeight: 1.0,
    padding: '0 2px',
  }),
  valueContainer: provided => ({
    ...provided,
    minHeight: '18px',
    padding: '0 4px',
    fontSize: '0.62rem',
  }),
  indicatorsContainer: provided => ({
    ...provided,
    height: '22px',
  }),
  input: provided => ({
    ...provided,
    fontSize: '0.62rem',
    minHeight: '18px',
  }),
  menu: provided => ({
    ...provided,
    background: '#222',
    color: '#fff',
    fontSize: '0.62rem',
    marginTop: 2,
  }),
  singleValue: provided => ({
    ...provided,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '0.62rem',
  }),
  option: (provided, { isFocused }) => ({
    ...provided,
    background: isFocused ? '#333' : '#222',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '0.62rem',
    padding: '4px 8px',
    minHeight: '18px',
  }),
  dropdownIndicator: provided => ({
    ...provided,
    paddingTop: 2,
    paddingBottom: 2,
  }),
};

export default function Consumables({
  buildQty,
  activeTab,
  page,
  addConsumable,
  savedItems = { gaskets: [], boltups: [] },
  setSavedItems
}) {
  const [gaskets, setGaskets] = useState([]);
  const [boltups, setBoltups] = useState([]);
  const [gasketSelect, setGasketSelect] = useState(null);
  const [boltupSelect, setBoltupSelect] = useState(null);

  // sync savedItems → local state
  useEffect(() => {
    const incomingGaskets = savedItems.gaskets || [];
    const incomingBoltups = savedItems.boltups || [];
    if (JSON.stringify(incomingGaskets) !== JSON.stringify(gaskets)) {
      setGaskets(incomingGaskets);
    }
    if (JSON.stringify(incomingBoltups) !== JSON.stringify(boltups)) {
      setBoltups(incomingBoltups);
    }
  }, [savedItems.gaskets, savedItems.boltups]);

  // push up to parent
  const syncToParent = (newGaskets, newBoltups) => {
    setSavedItems({ gaskets: newGaskets, boltups: newBoltups });
  };

  // add, update, remove handlers for gaskets
  const handleAddGasket = option => {
    if (!option) return;
    const next = [...gaskets, { code: option.value, qty: 0 }];
    setGaskets(next);
    syncToParent(next, boltups);
    addConsumable(option.value, 0, page, activeTab);
    setGasketSelect(null);
  };
  const updateGasketQty = (idx, qty) => {
    const next = gaskets.map((g, i) => (i === idx ? { ...g, qty } : g));
    setGaskets(next);
    syncToParent(next, boltups);
    addConsumable(gaskets[idx].code, qty, page, activeTab);
  };
  const removeGasket = idx => {
    const next = gaskets.filter((_, i) => i !== idx);
    setGaskets(next);
    syncToParent(next, boltups);
  };

  // add, update, remove handlers for bolt-ups
  const handleAddBoltup = option => {
    if (!option) return;
    const next = [...boltups, { code: option.value, qty: 0 }];
    setBoltups(next);
    syncToParent(gaskets, next);
    addConsumable(option.value, 0, page, activeTab);
    setBoltupSelect(null);
  };
  const updateBoltupQty = (idx, qty) => {
    const next = boltups.map((b, i) => (i === idx ? { ...b, qty } : b));
    setBoltups(next);
    syncToParent(gaskets, next);
    addConsumable(boltups[idx].code, qty, page, activeTab);
  };
  const removeBoltup = idx => {
    const next = boltups.filter((_, i) => i !== idx);
    setBoltups(next);
    syncToParent(gaskets, next);
  };

  return (
    <div className="w-full bg-black border border-[#6a7257] rounded-lg p-2 mb-8">
      <h4 className="text-[#6a7257] text-[16px] text-center mb-0 uppercase font-bold">
        Consumables
      </h4>

      <div className="flex">
        {/* GASKETS COLUMN */}
        <div className="w-1/3">
          <h5 className="text-[#6a7257] text-center text-xs font-semibold mb-0 uppercase">
            Gaskets
          </h5>
          <div className="flex items-center mb-1">
            <Select
              value={gasketSelect}
              onChange={setGasketSelect}
              options={gasketOptions}
              styles={selectStyles}
              placeholder="Add Gasket"
              className="flex-1"
            />
            <button
              onClick={() => handleAddGasket(gasketSelect)}
              className="ml-2 px-1 py-0 bg-black text-[#6a7257] border border-[#6a7257] text-[10px] rounded"
            >
              + Add
            </button>
          </div>
          {gaskets.map((g, i) => (
            <div key={i} className="flex items-center mb-2 bg-black p-1 rounded">
              <span className="text-white font-bold mr-2 truncate">{g.code}</span>
              <input
                type="number"
                className="w-10 bg-black border border-[#6a7257] text-white text-center text-[10px] mr-0 p-.5 rounded"
                value={g.qty}
                onChange={e => updateGasketQty(i, Number(e.target.value))}
              />
              <button
                onClick={() => removeGasket(i)}
                className="text-red-500 text-[10px] px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* DIVIDER */}
        <div className="w-px bg-[#6a7257] mx-4" />

        {/* BOLT-UPS COLUMN */}
        <div className="w-2/3">
          <h5 className="text-[#6a7257] text-center text-xs font-semibold mb-0 uppercase">
            Bolt-Ups
          </h5>
          <div className="flex items-center mb-2">
            <Select
              value={boltupSelect}
              onChange={setBoltupSelect}
              options={boltupOptions}
              styles={selectStyles}
              placeholder="Add Bolt-Up"
              className="flex-1"
            />
            <button
              onClick={() => handleAddBoltup(boltupSelect)}
              className="ml-2 px-1 py-0 bg-black text-[#6a7257] border border-[#6a7257] text-[10px] rounded"
            >
              + Add
            </button>
          </div>
          {boltups.map((b, i) => (
            <div key={i} className="flex items-center mb-2 bg-black p-0 rounded">
              <span className="text-white font-bold mr-2 truncate">{b.code}</span>
              <input
                type="number"
                className="w-10 bg-black border border-[#6a7257] text-center text-white text-[10px] mr-0 p-.5 rounded"
                value={b.qty}
                onChange={e => updateBoltupQty(i, Number(e.target.value))}
              />
              <button
                onClick={() => removeBoltup(i)}
                className="text-red-500 text-[10px] px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
