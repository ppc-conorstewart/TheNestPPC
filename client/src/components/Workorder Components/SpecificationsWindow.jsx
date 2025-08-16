// src/components/SpecificationsWindow.jsx

import React from 'react';

export default function SpecificationsWindow({
  weight = 0,
  fillVolume = 0,
  assemblyOAL = 0,
}) {
  // Convert KG to LBS
  const weightLbs = weight * 2.20462;

  return (
    <div className="specs-window p-4 bg-black bg-opacity-80 border border-[#6a7257] rounded-md text-green-100 w-full h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Specifications</h2>
      <ul className="space-y-2">
        <li className="flex justify-between">
          <span>Overall Weight:</span>
          <span>{weightLbs.toLocaleString(undefined, { maximumFractionDigits: 0 })} lbs</span>
        </li>
        <li className="flex justify-between">
          <span>Fill Volume:</span>
          <span>{fillVolume.toLocaleString()} L</span>
        </li>
        <li className="flex justify-between">
          <span>Assembly OAL:</span>
          <span>{assemblyOAL.toLocaleString()} mm</span>
        </li>
      </ul>
    </div>
  );
}
