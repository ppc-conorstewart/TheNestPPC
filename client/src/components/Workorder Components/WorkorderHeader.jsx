// src/components/WorkorderHeader.jsx

import React, { useMemo } from 'react';
import { Bell } from 'lucide-react';

export default function WorkorderHeader({
  currentPageIndex,
  pages,
  onClose,
  metadata,
  woNumber,         // this will be replaced by woDisplayNumber below
  alerts = [],
  onToggleAlerts,
  dfitSelections = [],
  dfitActiveTab = 0,
}) {
  const title =
    currentPageIndex === 0
      ? 'Customer WO Info'
      : pages[currentPageIndex]?.title || '';

  // ---- BEGIN WO # LOGIC ----
  function tabHasData(tabObj = {}) {
    // Tab is considered "used" if any location field is non-empty
    return Object.keys(tabObj).some(
      key => /^location\d+$/.test(key) && tabObj[key]
    );
  }
  const tab1Used = tabHasData(dfitSelections[0] || {});
  const tab2Used = tabHasData(dfitSelections[1] || {});

  // Decide the dynamic WO number (01/01A/01B)
  // If you want to use a dynamic code, update "01" to a prop
  let woDisplayNumber = "WO #01";
  if (tab2Used) {
    woDisplayNumber = dfitActiveTab === 1 ? "WO #01B" : "WO #01A";
  } else if (tab1Used) {
    woDisplayNumber = "WO #01";
  }
  // ---- END WO # LOGIC ----

  // Filter out category alerts so bell only pulses for real ones
  const filteredAlerts = useMemo(() => {
    const categorySet = new Set([
      'Valves',
      'Adapters',
      'Weco',
      'Spools',
      'Instrumentation Flanges',
      'Other',
    ]);
    return alerts.filter(msg => {
      const m = msg.match(
        /Insufficient\s+"(.+)"\s+in\s+(.+)\s+for.*need\s+[\d.]+,\s+have\s+[\d.]+/
      );
      return m && !categorySet.has(m[1]);
    });
  }, [alerts]);

  const hasRealAlerts = filteredAlerts.length > 0;

  return (
    <>
      {/* Top bar */}
      <div className="relative flex items-center justify-between px-6 py-2 bg-black">
        <div className="flex items-center space-x-2">
          <div className="px-2 py-1 text-xs font-bold text-white border border-gray-600 rounded">
            {woDisplayNumber}
          </div>
        </div>

        <h2 className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 uppercase font-erbaum underline text-3xl font-bold text-[#6A7257]">
          {title}
        </h2>

        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleAlerts}
            className={`${
              hasRealAlerts
                ? 'text-red-500 animate-pulse'
                : 'text-white hover:text-gray-300'
            }`}
            title={hasRealAlerts ? 'You have alerts' : 'No alerts'}
          >
            <Bell size={25} />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl leading-none"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Metadata bar with white top/bottom borders */}
      {currentPageIndex > 0 && (
        <div className="px-6 py-1 bg-black border-t border-b border-white">
          <div className="flex flex-wrap justify-center items-center text-lg uppercase">
            {/* Customer */}
            <div className="flex items-center px-2">
              <span className="font-semibold text-white">Customer:</span>
              <span className="ml-1 text-[#6A7257]">{metadata.customer}</span>
            </div>

            {/* LSD */}
            <div className="flex items-center px-2 border-l border-white">
              <span className="font-semibold text-white">LSD:</span>
              <span className="ml-1 text-[#6A7257]">{metadata.surfaceLSD}</span>
            </div>

            {/* Wells */}
            <div className="flex items-center px-2 border-l border-white">
              <span className="font-semibold text-white">Wells:</span>
              <span className="ml-1 text-[#6A7257]">{metadata.numberOfWells}</span>
            </div>

            {/* Rig-in */}
            <div className="flex items-center px-2 border-l border-white">
              <span className="font-semibold text-white">Rig-in:</span>
              <span className="ml-1 text-[#6A7257]">{metadata.rigInDate}</span>
            </div>

            {/* Bank */}
            <div className="flex items-center px-2 border-l border-white">
              <span className="font-semibold text-white">Bank:</span>
              <span className="ml-1 text-[#6A7257]">{metadata.wellBankType}</span>
            </div>

            {/* Rev */}
            <div className="flex items-center px-2 border-l border-white">
              <span className="font-semibold text-white">Rev:</span>
              <span className="ml-1 text-[#6A7257]">{metadata.workbookRevision}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
