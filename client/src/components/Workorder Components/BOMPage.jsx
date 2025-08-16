// src/components/BOMPage.jsx

import React, { useState, useMemo } from 'react';

// Your six asset categories
const ASSET_CATEGORIES = [
  'Valves',
  'Adapters',
  'Weco',
  'Spools',
  'Instrumentation Flanges',
  'Other',
];

// Consumable categories
const CONSUMABLE_CATEGORIES = ['Gaskets', 'Bolt-Ups'];

// Tab names
const TABS = ['Assets', 'Consumables', 'Pad Specifications'];

function TabNav({ activeTab, onChange }) {
  return (
    <div className="flex justify-center space-x-6 mb-4 border-b border-gray-700">
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-3 py-1 uppercase text-xs font-bold ${
            activeTab === tab
              ? 'text-white border-b-2 border-[#6a7257]'
              : 'text-gray-500 hover:text-white'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// Helper function: Tallies assets from all tabs
function tallyAssets(selectionsArr = [], buildQtysArr = []) {
  // Map: description -> total quantity
  const assetMap = {};
  selectionsArr.forEach((selObj, tabIdx) => {
    const qty = Number(buildQtysArr[tabIdx]) || 0;
    Object.entries(selObj)
      .filter(([key, val]) => /^location\d+$/.test(key) && val)
      .forEach(([, description]) => {
        if (!description) return;
        assetMap[description] = (assetMap[description] || 0) + qty;
      });
  });
  return Object.entries(assetMap).map(([description, quantity]) => ({
    description,
    quantity,
  }));
}

export default function BOMPage({
  dfitSelections = [],
  dfitBuildQtys = [],
  umaSelections = [],
  umaBuildQtys = [],
  fcaSelections = [],
  fcaBuildQtys = [],
  svaSelections = [],
  svaBuildQtys = [],
  dogbonesSelections = [],
  dogbonesBuildQtys = [],
  zippersSelections = [],
  zippersBuildQtys = [],
  pplSelections = [],
  pplBuildQtys = [],
  consumables = [],
  padSpecs = {},
}) {
  const [activeTab, setActiveTab] = useState('Assets');

  // Build assetItems from ALL assemblies
  const assetItems = useMemo(() => {
    const allSections = [
      [dfitSelections, dfitBuildQtys],
      [umaSelections, umaBuildQtys],
      [fcaSelections, fcaBuildQtys],
      [svaSelections, svaBuildQtys],
      [dogbonesSelections, dogbonesBuildQtys],
      [zippersSelections, zippersBuildQtys],
      [pplSelections, pplBuildQtys],
    ];
    const all = allSections.flatMap(([sels, qtys]) => tallyAssets(sels, qtys));
    // Merge duplicates
    const combined = {};
    all.forEach(({ description, quantity }) => {
      combined[description] = (combined[description] || 0) + quantity;
    });
    return Object.entries(combined).map(([description, quantity]) => ({
      description,
      quantity,
    }));
  }, [
    dfitSelections, dfitBuildQtys,
    umaSelections, umaBuildQtys,
    fcaSelections, fcaBuildQtys,
    svaSelections, svaBuildQtys,
    dogbonesSelections, dogbonesBuildQtys,
    zippersSelections, zippersBuildQtys,
    pplSelections, pplBuildQtys,
  ]);

  // Group assets into the six categories
  const groupedAssets = useMemo(() => {
    const map = Object.fromEntries(
      ASSET_CATEGORIES.map(c => [c, []])
    );
    assetItems.forEach(item => {
      const desc = item.description.toLowerCase();
      let cat = 'Other';
      if (desc.includes('valve')) cat = 'Valves';
      else if (desc.includes('adapter')) cat = 'Adapters';
      else if (desc.includes('weco')) cat = 'Weco';
      else if (desc.includes('spool')) cat = 'Spools';
      else if (desc.includes('flange')) cat = 'Instrumentation Flanges';
      map[cat].push(item);
    });
    return map;
  }, [assetItems]);

  // Aggregate consumables, multiplying by tab's buildQty and filtering out qty <= 0
  const consumableItems = useMemo(() => {
    const agg = {};
    consumables.forEach(({ name, quantity, qty, tab, page }) => {
      const q = Number(quantity ?? qty) || 0;
      // Figure out the right buildQty array and value for the consumable's section and tab
      let buildQty = 1;
      if (page === 'DFIT' && Array.isArray(dfitBuildQtys) && typeof tab === 'number') {
        buildQty = Number(dfitBuildQtys[tab]) || 0;
      } else if (page === 'UMA' && Array.isArray(umaBuildQtys) && typeof tab === 'number') {
        buildQty = Number(umaBuildQtys[tab]) || 0;
      } else if (page === 'FCA' && Array.isArray(fcaBuildQtys) && typeof tab === 'number') {
        buildQty = Number(fcaBuildQtys[tab]) || 0;
      } else if (page === 'SVA' && Array.isArray(svaBuildQtys) && typeof tab === 'number') {
        buildQty = Number(svaBuildQtys[tab]) || 0;
      } else if (page === 'Dogbones' && Array.isArray(dogbonesBuildQtys) && typeof tab === 'number') {
        buildQty = Number(dogbonesBuildQtys[tab]) || 0;
      } else if (page === 'Zippers' && Array.isArray(zippersBuildQtys) && typeof tab === 'number') {
        buildQty = Number(zippersBuildQtys[tab]) || 0;
      } else if (page === 'PPL' && Array.isArray(pplBuildQtys) && typeof tab === 'number') {
        buildQty = Number(pplBuildQtys[tab]) || 0;
      }
      const total = q * buildQty;
      if (total > 0) {
        agg[name] = (agg[name] || 0) + total;
      }
    });
    return Object.entries(agg)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [
    consumables,
    dfitBuildQtys,
    umaBuildQtys,
    fcaBuildQtys,
    svaBuildQtys,
    dogbonesBuildQtys,
    zippersBuildQtys,
    pplBuildQtys,
  ]);

  // Group consumables under Gaskets vs Bolt-Ups
  const groupedConsumables = useMemo(() => {
    const map = { 'Gaskets': [], 'Bolt-Ups': [] };
    consumableItems.forEach(item => {
      if (item.name && item.name.startsWith('BX-')) map['Gaskets'].push(item);
      else map['Bolt-Ups'].push(item);
    });
    return map;
  }, [consumableItems]);

  // ---- UNITS MAP FOR PAD SPECS ----
  const padSpecRows = [
    ['Total Fill Volume',   padSpecs.totalFillVolume,   'L'],
    ['Full Pad OAL',        padSpecs.fullPadOAL,        'INCHES'],
    ['Spooling OAL',        padSpecs.spoolingOAL,       'INCHES'],
    ['Full Trucking Weight', padSpecs.fullTruckingWeight, 'LBS'],
  ];

  return (
    <div className="flex flex-col h-full w-full overflow-auto px-6 py-4 uppercase text-xs">
      <TabNav activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'Assets' && (
        <div className="space-y-4 overflow-auto">
          {[
            ASSET_CATEGORIES.slice(0, 3),
            ASSET_CATEGORIES.slice(3, 6),
          ].map((cats, blockIdx) => {
            const maxRows = Math.max(
              ...cats.map(c => groupedAssets[c].length),
              1
            );
            return (
              <table
                key={blockIdx}
                className="w-full table-fixed border-collapse border border-gray-600"
              >
                <colgroup>
                  {cats.map((_, i) => (
                    <col key={i} style={{ width: '33.3333%' }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    {cats.map(cat => (
                      <th
                        key={cat}
                        className="border border-gray-600 px-2 py-1 text-[#6a7257] font-semibold text-center"
                      >
                        {cat}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: maxRows }).map((_, rowIdx) => (
                    <tr key={rowIdx}>
                      {cats.map(cat => {
                        const item = groupedAssets[cat][rowIdx];
                        return (
                          <td
                            key={cat}
                            className="border border-gray-600 px-2 py-1 text-white"
                          >
                            {item ? (
                              <div className="flex justify-between items-center">
                                <span className="truncate">{item.description}</span>
                                <span className="font-bold ml-2">{item.quantity}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500 block text-center">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })}
        </div>
      )}

      {activeTab === 'Consumables' && (
        <div className="overflow-auto">
          <table className="w-full table-fixed border-collapse border border-gray-600">
            <colgroup>
              <col style={{ width: '50%' }} />
              <col style={{ width: '50%' }} />
            </colgroup>
            <thead>
              <tr>
                {CONSUMABLE_CATEGORIES.map(cat => (
                  <th
                    key={cat}
                    className="border border-gray-600 px-2 py-1 text-[#6a7257] font-semibold text-center"
                  >
                    {cat}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const maxRows = Math.max(
                  groupedConsumables['Gaskets'].length,
                  groupedConsumables['Bolt-Ups'].length,
                  1
                );
                return Array.from({ length: maxRows }).map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {CONSUMABLE_CATEGORIES.map(cat => {
                      const item = groupedConsumables[cat][rowIdx];
                      return (
                        <td
                          key={cat}
                          className="border border-gray-600 px-2 py-1 text-white"
                        >
                          {item ? (
                            <div className="flex justify-between items-center">
                              <span className="truncate">{item.name}</span>
                              <span className="font-bold ml-2">
                                {item.quantity}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500 block text-center">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}

       {activeTab === 'Pad Specifications' && (
        <div className="overflow-auto mt-4">
          <table className="w-full table-fixed border-collapse border border-gray-600">
            <tbody>
              {padSpecRows.map(([label, value, unit]) => (
                <tr key={label}>
                  <th className="border border-gray-600 px-2 py-1 text-left text-[#6a7257]">
                    {label}
                  </th>
                  <td className="border border-gray-600 px-2 py-1 font-bold text-white text-right">
                    {value
                      ? (
                        <>
                          <span className="text-white">{value}</span>
                          <span className="ml-1" style={{ color: "#6a7257" }}>{unit}</span>
                        </>
                      )
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
