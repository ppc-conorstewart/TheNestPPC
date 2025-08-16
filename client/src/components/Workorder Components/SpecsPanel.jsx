// src/components/SpecsPanel.jsx

import React from 'react';

export default function SpecsPanel({
  weight,
  volume,
  oal,
  torqueSpecs = [],    // Array of { connection, torque }
}) {
  // fallback zeros and always numbers
  const w = Number.isFinite(weight) ? weight : 0;
  const v = Number.isFinite(volume) ? volume : 0;
  const o = Number.isFinite(oal) ? oal : 0;

  return (
    <div className="w-full bg-black border border-[#6a7257] rounded-lg p-2 mb-2">
      <h2 className="text-[#6a7257] text-[16px] text-center mb-2 uppercase font-bold">
        Assembly Specifications
      </h2>
      <div className="flex">
        {/* Left column */}
        <div className="flex-1 pr-4 border-r font-bold border-[#6a7257]">
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Overall Weight:</span>
              <span>{w ? w.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0} lbs</span>
            </li>
            <li className="flex justify-between">
              <span>Fill Volume:</span>
              <span>{v ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0} L</span>
            </li>
            <li className="flex justify-between">
              <span>Assembly OAL:</span>
              <span>{o ? o.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0} INCHES</span>
            </li>
          </ul>
        </div>

        {/* Right column - Torque Specs */}
        <div className="flex-1 pl-4">
          <div className="flex font-bold mb-2">
            <div className="flex-1">Connection:</div>
            <div className="flex-1">Torque Spec:</div>
          </div>
          {torqueSpecs.length > 0 ? (
            <ul className="space-y-2">
              {torqueSpecs.map(({ connection, torque }, i) => (
                <li key={i} className="flex">
                  <div className="flex-1">{connection}</div>
                  <div className="flex-1">
                    {torque ? torque.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0} ft-lbs
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic mt-2">No torque specs available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
