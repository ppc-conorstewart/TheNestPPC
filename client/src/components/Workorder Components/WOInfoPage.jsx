// src/components/WOInfoPage.jsx

import React, { useState } from 'react';
import SimpleViewer from './SimpleViewer';

export default function WOInfoPage({
  metadata,
  handleChange,
  logoSrc,
  simpleModelUrl,
  onSimpleModelChange,
  simpleModelLocked,
  onSimpleModelLockedChange,
  simpleModelLabels,
  onSimpleModelLabelsChange,
}) {
  const [editModes, setEditModes] = useState({});
  const toggleEdit = field =>
    setEditModes(m => ({ ...m, [field]: !m[field] }));

  const labelMap = {
    surfaceLSD: 'Surface LSD',
    numberOfWells: '# of Wells',
    rigInDate: 'Rig-in Date',
    wellBankType: 'Bank Type',
    workbookRevision: 'Revision',
    buildingBase: 'Building Base',
  };

  const fields = Object.entries(metadata).filter(
    ([key]) =>
      key !== 'customer' &&
      key !== 'notes' &&
      !/^location\d+$/.test(key)
  );

  return (
    <div className="flex justify-center bg-gray-900 h-full overflow-auto">
      <div className="w-full h-full bg-[#111] border-2 border-[#6a7257] rounded-lg shadow-xl flex flex-col">
        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left column: logo + six fields */}
          <div className="md:w-1/6 p-2 overflow-auto space-y-0">
            {/* Logo above fields with white background */}
            <div className="flex justify-center mb-4">
              <div className="bg-white p-2 rounded">
                <img
                  src={logoSrc}
                  alt={`${metadata.customer} logo`}
                  onError={e => (e.currentTarget.style.display = 'none')}
                  className="h-12 w-auto"
                />
              </div>
            </div>

            {fields.map(([field, value]) => {
              const label = labelMap[field] || field;
              const isBuildingBase = field === 'buildingBase';
              return (
                <div
                  key={field}
                  className="[#6a7257] hover:bg-gray-700 transition rounded-lg p-2 text-center"
                >
                  <div className="text-white underline uppercase font-erbaum font-bold text-base">
                    {label}
                  </div>
                  <div>
                    {editModes[field] ? (
                      isBuildingBase ? (
                        <select
                          value={value}
                          onChange={e =>
                            handleChange(field, e.target.value)
                          }
                          className="w-full bg-gray-900 border border-[#6a7257] rounded px-2 py-0.5 text-sm text-white"
                        >
                          <option value="" disabled>
                            Select base…
                          </option>
                          <option value="Red Deer">Red Deer</option>
                          <option value="Grand Prairie">
                            Grand Prairie
                          </option>
                          <option value="Nisku">Nisku</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={e =>
                            handleChange(field, e.target.value)
                          }
                          className="w-full bg-gray-900 border border-[#6a7257] rounded px-2 py-0.5 text-center text-lg text-white"
                        />
                      )
                    ) : (
                      <span className="text-white text-lg font-semibold">
                        {value || '—'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleEdit(field)}
                    className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                  >
                    {editModes[field] ? 'Save' : 'Edit'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-gray-700" />

          {/* Right column: clean black dropzone with green dashed border */}
          <div className="flex-1 p-2 flex flex-col">
            <div className="mb-0 text-[#6a7257] text-center uppercase font-semibold text-lg">
              Full Pad Layout
            </div>
            <div className="relative flex-1 bg-black border border-dashed border-[#6a7257] rounded-lg overflow-hidden">
              <SimpleViewer
                style={{ width: '100%', height: '100%' }}
                initialUrl={simpleModelUrl}
                onUrlChange={onSimpleModelChange}
                initialLocked={simpleModelLocked}
                onLockedChange={onSimpleModelLockedChange}
                initialLabels={simpleModelLabels}
                onLabelsChange={onSimpleModelLabelsChange}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-gray-400 uppercase text-sm"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
