// ==============================
// FILE: src/components/WOInfoPage.jsx
// ==============================

import { useState } from 'react';
import SimpleViewer from './SimpleViewer';

// ==============================
// COMPONENT: WOInfoPage
// ==============================
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
  // ==============================
  // SECTION: Local UI State
  // ==============================
  const [editModes, setEditModes] = useState({});
  const toggleEdit = field =>
    setEditModes(m => ({ ...m, [field]: !m[field] }));

  // ==============================
  // SECTION: Labels & Safe Display
  // ==============================
  const labelMap = {
    surfaceLSD: 'Surface LSD',
    numberOfWells: '# of Wells',
    rigInDate: 'Rig-in Date',
    wellBankType: 'Bank Type',
    workbookRevision: 'Revision',
    buildingBase: 'Building Base',
  };

  const safeDisplay = v => {
    if (v == null) return '—';
    if (v instanceof Date) return v.toLocaleDateString();
    const t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean') return String(v);
    try {
      if (v && typeof v === 'object') {
        if ('canvas' in v) return '—';
        const json = JSON.stringify(v);
        return json.length > 64 ? json.slice(0, 64) + '…' : json;
      }
    } catch {}
    return '—';
  };

  // ==============================
  // SECTION: Field Selection
  // ==============================
  const fields = Object.entries(metadata).filter(([key]) => {
    if (key === 'customer' || key === 'notes') return false;
    if (/^location\d+$/i.test(key)) return false;
    if (/sitemeasure/i.test(key)) return false;
    return true;
  });

  // ==============================
  // SECTION: Render
  // ==============================
  return (
    <div className="flex justify-center bg-gray-900 h-full overflow-auto">
      <div className="w-full h-full bg-[#0b0b0b] border-2 border-[#6a7257] rounded-lg shadow-xl flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* ============================== */}
          {/* SECTION: Left Panel */}
          {/* ============================== */}
          <aside className="md:w-1/5 lg:w-1/6 p-3 overflow-auto">
            {/* Logo Block */}
            <div className="mb-4">
              <div className="w-full border-2 border-[#6a7257] rounded-lg bg-black/40 shadow-lg overflow-hidden flex items-center justify-center group transition-transform">
                <img
                  src={logoSrc}
                  alt={`${metadata.customer} logo`}
                  onError={e => (e.currentTarget.style.display = 'none')}
                  className="object-contain w-full h-20 p-2 grayscale group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-200 ease-in-out"
                />
              </div>
            </div>

            {/* Field Cards */}
            <div className="space-y-2">
              {fields.map(([field, value]) => {
                const label = labelMap[field] || field;
                const isBuildingBase = field === 'buildingBase';
                const controlledValue =
                  typeof value === 'string' ? value : safeDisplay(value);

                return (
                  <div
                    key={field}
                    className="rounded-lg border border-[#6a7257]/40 bg-black/40 hover:bg-black/55 transition-colors"
                  >
                    <div className="px-3 pt-2 text-center">
                      <div className="text-[#e9eadf] underline underline-offset-[6px] decoration-2 decoration-[#6a7257] uppercase font-erbaum tracking-wide text-[13px]">
                        {label}
                      </div>
                    </div>

                    <div className="px-3 pb-2 text-center">
                      {editModes[field] ? (
                        isBuildingBase ? (
                          <select
                            value={typeof value === 'string' ? value : ''}
                            onChange={e => handleChange(field, e.target.value)}
                            className="mt-1 w-full bg-[#0f0f0f] border border-[#6a7257]/60 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#6a7257]"
                          >
                            <option value="" disabled>
                              Select base…
                            </option>
                            <option value="Red Deer">Red Deer</option>
                            <option value="Grand Prairie">Grand Prairie</option>
                            <option value="Nisku">Nisku</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={typeof value === 'string' ? value : ''}
                            onChange={e => handleChange(field, e.target.value)}
                            className="mt-1 w-full bg-[#0f0f0f] border border-[#6a7257]/60 rounded px-2 py-1 text-center text-lg text-white focus:outline-none focus:ring-1 focus:ring-[#6a7257]"
                          />
                        )
                      ) : (
                        <div className="mt-1 text-white text-xl font-semibold font-erbaum tracking-wide">
                          {safeDisplay(controlledValue)}
                        </div>
                      )}

                      <div className="mt-1">
                        <button
                          onClick={() => toggleEdit(field)}
                          className="inline-block rounded-full border border-yellow-400/70 text-yellow-300 hover:bg-yellow-300 hover:text-black text-[12px] px-3 py-0.5 transition-colors"
                        >
                          {editModes[field] ? 'Save' : 'Edit'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Divider */}
          <div className="hidden md:block w-px bg-gray-800/70" />

          {/* ============================== */}
          {/* SECTION: Right Panel */}
          {/* ============================== */}
          <section className="flex-1 p-3 flex flex-col">
            <div className="mb-1 text-[#6a7257] text-center uppercase font-semibold text-lg font-erbaum tracking-wide">
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
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
