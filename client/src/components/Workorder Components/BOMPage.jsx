// ==============================
// FILE: src/components/BOMPage.jsx
// ==============================

import { useMemo, useState } from 'react';

// ==============================
// SECTION: CONSTANTS
// ==============================
const ASSET_CATEGORIES = [
  'Valves',
  'Adapters',
  'Weco',
  'Spools',
  'Instrumentation Flanges',
  'Other',
];
const CONSUMABLE_CATEGORIES = ['Gaskets', 'Bolt-Ups'];
const TABS = ['Assets', 'Consumables', 'Pad Specifications'];

// ==============================
// SECTION: TAB NAV
// ==============================
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

// ==============================
// SECTION: HELPERS (FIXED TALLY)
// ==============================
// Tally assets across all tabs, multiplying each slot's qtyN by the tab's buildQty.
function tallyAssets(selectionsArr = [], buildQtysArr = []) {
  const assetMap = {};
  selectionsArr.forEach((selObj, tabIdx) => {
    const buildQty = Number(buildQtysArr[tabIdx]) || 0;
    if (!buildQty) return;

    for (let i = 1; i <= 10; i++) {
      const desc = selObj['location' + i];
      if (!desc) continue;
      const perAssetQty = Math.max(1, Math.floor(Number(selObj['qty' + i] || 1)));
      const addQty = perAssetQty * buildQty;
      assetMap[desc] = (assetMap[desc] || 0) + addQty;
    }
  });
  return Object.entries(assetMap).map(([description, quantity]) => ({
    description,
    quantity,
  }));
}

// ==============================
// SECTION: COMPONENT
// ==============================
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

  // ==============================
  // SECTION: ASSET AGGREGATION
  // ==============================
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
    const combined = {};
    all.forEach(({ description, quantity }) => {
      combined[description] = (combined[description] || 0) + quantity;
    });
    return Object.entries(combined)
      .map(([description, quantity]) => ({ description, quantity }))
      .sort((a, b) => a.description.localeCompare(b.description));
  }, [
    dfitSelections, dfitBuildQtys,
    umaSelections, umaBuildQtys,
    fcaSelections, fcaBuildQtys,
    svaSelections, svaBuildQtys,
    dogbonesSelections, dogbonesBuildQtys,
    zippersSelections, zippersBuildQtys,
    pplSelections, pplBuildQtys,
  ]);

  const groupedAssets = useMemo(() => {
    const map = Object.fromEntries(ASSET_CATEGORIES.map(c => [c, []]));
    assetItems.forEach(item => {
      const desc = (item.description || '').toLowerCase();
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

  // ==============================
  // SECTION: CONSUMABLES
  // ==============================
  const consumableItems = useMemo(() => {
    const agg = {};
    consumables.forEach(({ name, quantity, qty, tab, page }) => {
      const q = Number(quantity ?? qty) || 0;
      let buildQty = 1;
      if (page === 'DFIT' && Array.isArray(dfitBuildQtys)) buildQty = Number(dfitBuildQtys[tab]) || 0;
      else if (page === 'UMA' && Array.isArray(umaBuildQtys)) buildQty = Number(umaBuildQtys[tab]) || 0;
      else if (page === 'FCA' && Array.isArray(fcaBuildQtys)) buildQty = Number(fcaBuildQtys[tab]) || 0;
      else if (page === 'SVA' && Array.isArray(svaBuildQtys)) buildQty = Number(svaBuildQtys[tab]) || 0;
      else if (page === 'Dogbones' && Array.isArray(dogbonesBuildQtys)) buildQty = Number(dogbonesBuildQtys[tab]) || 0;
      else if (page === 'Zippers' && Array.isArray(zippersBuildQtys)) buildQty = Number(zippersBuildQtys[tab]) || 0;
      else if (page === 'PPL' && Array.isArray(pplBuildQtys)) buildQty = Number(pplBuildQtys[tab]) || 0;
      const total = q * buildQty;
      if (total > 0) agg[name] = (agg[name] || 0) + total;
    });
    return Object.entries(agg)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [
    consumables,
    dfitBuildQtys, umaBuildQtys, fcaBuildQtys, svaBuildQtys,
    dogbonesBuildQtys, zippersBuildQtys, pplBuildQtys,
  ]);

  const groupedConsumables = useMemo(() => {
    const map = { 'Gaskets': [], 'Bolt-Ups': [] };
    consumableItems.forEach(item => {
      if (item.name && item.name.startsWith('BX-')) map['Gaskets'].push(item);
      else map['Bolt-Ups'].push(item);
    });
    return map;
  }, [consumableItems]);

  // ==============================
  // SECTION: PAD SPECS
  // ==============================
  const padSpecRows = [
    ['Total Fill Volume',   padSpecs.totalFillVolume,   'L'],
    ['Full Pad OAL',        padSpecs.fullPadOAL,        'INCHES'],
    ['Spooling OAL',        padSpecs.spoolingOAL,       'INCHES'],
    ['Full Trucking Weight', padSpecs.fullTruckingWeight, 'LBS'],
  ];

  // ==============================
  // SECTION: RENDER
  // ==============================
  return (
    <div className="flex flex-col h-full w-full overflow-auto px-6 py-4 uppercase text-xs">
      <TabNav activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'Assets' && (
        <div className="space-y-4 overflow-auto">
          {[ASSET_CATEGORIES.slice(0, 3), ASSET_CATEGORIES.slice(3, 6)].map((cats, blockIdx) => {
            const maxRows = Math.max(...cats.map(c => groupedAssets[c].length), 1);
            return (
              <table key={blockIdx} className="w-full table-fixed border-collapse border border-gray-600">
                <colgroup>
                  {cats.map((_, i) => <col key={i} style={{ width: '33.3333%' }} />)}
                </colgroup>
                <thead>
                  <tr>
                    {cats.map(cat => (
                      <th key={cat} className="border border-gray-600 px-2 py-1 text-[#6a7257] font-semibold text-center">
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
                          <td key={cat} className="border border-gray-600 px-2 py-1 text-white">
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
                  <th key={cat} className="border border-gray-600 px-2 py-1 text-[#6a7257] font-semibold text-center">
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
                        <td key={cat} className="border border-gray-600 px-2 py-1 text-white">
                          {item ? (
                            <div className="flex justify-between items-center">
                              <span className="truncate">{item.name}</span>
                              <span className="font-bold ml-2">{item.quantity}</span>
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
                    {value ? (
                      <>
                        <span className="text-white">{value}</span>
                        <span className="ml-1" style={{ color: '#6a7257' }}>{unit}</span>
                      </>
                    ) : '—'}
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
