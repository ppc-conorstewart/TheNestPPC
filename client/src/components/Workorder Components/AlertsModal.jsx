// src/components/AlertsModal.jsx

import React from 'react';

export default function AlertsModal({ alerts, onClose }) {
  // Categories to ignore entirely
  const categorySet = new Set([
    'Valves',
    'Adapters',
    'Weco',
    'Spools',
    'Instrumentation Flanges',
    'Other',
  ]);

  // Turn raw alert messages into structured data
  const filteredAlerts = alerts
    .map(item => {
      const msg = typeof item === 'object' && item.message ? item.message : item;
      const pageInfo = typeof item === 'object' && item.page ? item.page : null;

      // original msg example:
      // Insufficient "Manual Valve | 5-1/8" 15K" in Nisku for DFIT tab #1, location location1: need 4, have 3
      const m = msg.match(
        /Insufficient\s+"(.+?)"\s+in\s+(.+?)\s+for\s+([^:]+):\s+need\s+([\d.]+),\s+have\s+([\d.]+)/
      );
      if (!m) return null;
      const [_, asset, base, rawPageDesc, needRaw, haveRaw] = m;

      if (categorySet.has(asset)) return null;

      // Derive a nice page label: DFIT tab #N → DFIT-A, B, C...
      let pageLabel = '';
      const pd = (pageInfo || rawPageDesc).split(',')[0].trim(); // drop everything after comma
      const tabMatch = pd.match(/DFIT\s*tab\s*#(\d+)/i);
      if (tabMatch) {
        const idx = parseInt(tabMatch[1], 10);
        const letter = String.fromCharCode(64 + idx); // 1→A, 2→B, etc.
        pageLabel = `DFIT-${letter}`;
      } else {
        pageLabel = pd;
      }

      return {
        asset: asset.trim(),
        base: base.trim(),
        page: pageLabel,
        need: Math.floor(parseFloat(needRaw)) || 0,
        have: Math.floor(parseFloat(haveRaw)) || 0,
      };
    })
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-black text-white w-11/12 max-w-md p-2 rounded-lg border border-[#6a7257]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1 pb-1 border-b border-gray-700">
          <h2 className="text-lg font-bold uppercase text-white">Asset Alerts</h2>
          <button
            onClick={onClose}
            className="text-white text-xl leading-none"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* No alerts */}
        {filteredAlerts.length === 0 && (
          <p className="text-center text-gray-400 text-sm">No alerts.</p>
        )}

        {/* Alert entries */}
        {filteredAlerts.map(({ asset, base, page, need, have }, idx) => (
          <div
            key={idx}
            className="mb-2 p-2 bg-gray-900 rounded border border-[#6a7257] text-sm"
          >
            {/* Page/Tab info */}
            {page && (
              <div className="text-right text-xs font-bold text-gray-400 mb-1">
                {page}
              </div>
            )}

            {/* Title */}
            <div className="font-bold text-white mb-0">Insufficient Assets</div>

            {/* Asset info with Req/Have on the right */}
            <div className="flex justify-between items-start text-xs mb-1">
              <div className="leading-tight">
                <span className="text-yellow-400">{asset}</span>
                <span> in </span>
                <span className="font-semibold">{base}</span>
              </div>
              <div className="flex space-x-4 text-right">
                <div>
                  <span className="font-semibold text-blue-400">Req:</span>{' '}
                  <span className="font-mono">{need}</span>
                </div>
                <div>
                  <span className="font-semibold text-red-400">Have:</span>{' '}
                  <span className="font-mono">{have}</span>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="text-center text-gray-500 text-[11px]">
              Shops to take inventory or Consider transferring assets.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
