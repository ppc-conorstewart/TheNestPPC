// src/components/RightSidebarTabs.jsx
import React, { useState } from 'react';

export default function RightSidebarTabs({ 
  assetPanel: AssetPanel, 
  consumablesPanel: ConsumablesPanel 
}) {
  const [active, setActive] = useState('asset');

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white">
      <div className="flex">
        <button
          onClick={() => setActive('asset')}
          className={`flex-1 py-2 ${active === 'asset' ? 'bg-gray-800' : 'bg-gray-700'}`}
        >
          Select Asset
        </button>
        <button
          onClick={() => setActive('consumables')}
          className={`flex-1 py-2 ${active === 'consumables' ? 'bg-gray-800' : 'bg-gray-700'}`}
        >
          Consumables
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {active === 'asset'
          ? <AssetPanel />
          : <ConsumablesPanel />
        }
      </div>
    </div>
  );
}
