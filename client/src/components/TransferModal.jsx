// ==============================
// src/components/TransferModal.jsx
// ==============================

import { useEffect, useMemo, useState } from 'react';
import DraggableResizableModal from './ui/DraggableResizableModal';

// ==============================
// TRANSFER MODAL — COMPONENT
// ==============================
export default function TransferModal({
  isOpen,
  selectedCount,
  selectedIds,
  onClose,
  locationOptions,
  newLocation,
  onLocationChange,
  onTransfer,
  searchableAssets = [],
  onAddAssets
}) {
  // ==============================
  // STATE — LOCATION & PICK LISTS
  // ==============================
  const [localLocation, setLocalLocation] = useState('');
  const [query, setQuery] = useState('');
  const [addedIds, setAddedIds] = useState(new Set());

  // ==============================
  // EFFECTS — SYNC LOCATION / RESET
  // ==============================
  useEffect(() => {
    setLocalLocation(newLocation || '');
  }, [newLocation, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setAddedIds(new Set());
    }
  }, [isOpen]);

  // ==============================
  // MEMOS — FILTERED SEARCH RESULTS
  // ==============================
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return searchableAssets.slice(0, 50);
    return searchableAssets
      .filter(a => {
        const str = [a?.id, a?.assetId, a?.name, a?.category, a?.sn]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return str.includes(q);
      })
      .slice(0, 50);
  }, [query, searchableAssets]);

  // ==============================
  // HELPERS — SELECTION MGMT
  // ==============================
  const combinedIds = useMemo(() => {
    const base = new Set(selectedIds || []);
    for (const id of addedIds) base.add(id);
    return Array.from(base);
  }, [selectedIds, addedIds]);

  const combinedCount = combinedIds.length;
  const isAlreadySelected = (id) =>
    (selectedIds || []).includes(id) || addedIds.has(id);

  const addId = (id) => {
    if (!id || isAlreadySelected(id)) return;
    setAddedIds(prev => new Set(prev).add(id));
  };

  const removeId = (id) => {
    if (!id) return;
    setAddedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // ==============================
  // HANDLERS — LOCATION / SUBMIT
  // ==============================
  const handleSelect = (e) => {
    setLocalLocation(e.target.value);
    onLocationChange(e.target.value);
  };

  const handleTransfer = () => {
    if (combinedCount > 0 && localLocation) {
      if (onAddAssets && addedIds.size > 0) onAddAssets(Array.from(addedIds));
      onLocationChange(localLocation);
      onTransfer();
    }
  };

  if (!isOpen) return null;

  // ==============================
  // RENDER — DRAGGABLE/RESIZABLE WRAP
  // ==============================
  return (
    <DraggableResizableModal
      isOpen={isOpen}
      onClose={onClose}
      modalId="transfer-modal"
      title="Shop to Shop Transfer [Admin]"
      initialW={980}
      initialH={560}
      minW={720}
      minH={420}
      closeOnBackdrop={false}
      contentScrollable={false}
    >
      {/* ============================== LAYOUT (BODY + FOOTER) ============================== */}
      <div style={{ display: 'grid', gridTemplateRows: '1fr auto', height: '100%', background: '#000000ff', color: '#fff' }}>
        {/* ============================== BODY ============================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 18,
            padding: 20,
            overflow: 'hidden'
          }}
        >
          {/* ============================== SEARCH PANEL ============================== */}
          <div
            style={{
              background: '#000000ff',
              border: '1px solid #2c422a',
              borderRadius: 12,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 280
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10
              }}
            >
              <input
                type='text'
                placeholder='Search assets by ID, name, category, SN…'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  fontSize: 15,
                  padding: '10px 12px',
                  border: '2px solid #6a7257',
                  borderRadius: 8,
                  outline: 'none',
                  background: '#000000ff',
                  color: '#ffffffff',
                  fontWeight: 600
                }}
              />
            </div>

            <div
              style={{
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                borderRadius: 8,
                border: '1px solid #253523',
                background: '#000000ff',
                flex: 1
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#000000ff' }}>
                    <th style={th}>Asset ID</th>
                    <th style={th}>Name</th>
                    <th style={thCenter}>Add</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={3} style={tdEmpty}>
                        No results
                      </td>
                    </tr>
                  )}
                  {filtered.map((a) => {
                    const id = a?.id || a?.assetId;
                    const disabled = isAlreadySelected(id);
                    return (
                      <tr key={id} style={{ borderTop: '1px solid #1e281c' }}>
                        <td style={tdMono}>{id}</td>
                        <td style={td}>{a?.name || '—'}</td>
                        <td style={tdCenter}>
                          <button
                            onClick={() => addId(id)}
                            disabled={disabled}
                            style={{
                              background: disabled ? '#3a3a3a' : '#32ab17ff',
                              color: '#fff',
                              fontWeight: 400,
                              border: 'none',
                              borderRadius: 6,
                              padding: '2px 8px',
                              cursor: disabled ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {disabled ? 'Added' : 'Add'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============================== SELECTION & LOCATION PANEL ============================== */}
          <div
            style={{
              background: '#0b0f0b',
              border: '1px solid #2c422a',
              borderRadius: 12,
              padding: 14,
              display: 'grid',
              gridTemplateRows: 'auto auto 1fr',
              gap: 12,
              minHeight: 280
            }}
          >
            <div style={{ fontSize: 16 }}>
              Selected Assets{' '}
              <span style={{ color: '#6a7257', fontWeight: 800 }}>
                {combinedCount}
              </span>
            </div>

            <div>
              <label
                htmlFor='location'
                style={{
                  fontSize: 15,
                  color: '#ffffffff',
                  marginBottom: 8,
                  display: 'block'
                }}
              >
                New Location
              </label>
              <select
                id='location'
                value={localLocation}
                onChange={handleSelect}
                style={{
                  fontSize: 16,
                  padding: '9px 18px 9px 10px',
                  border: '2px solid #6a7257',
                  borderRadius: 8,
                  outline: 'none',
                  background: '#222f1d',
                  color: '#fff',
                  fontWeight: 700,
                  minWidth: 220
                }}
              >
                <option value=''>Select Location…</option>
                {locationOptions &&
                  locationOptions.map((loc, i) => (
                    <option value={loc} key={loc + i}>
                      {loc}
                    </option>
                  ))}
              </select>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                gap: 8,
                overflow: 'hidden'
              }}
            >
              <div style={{ fontSize: 14, color: '#c9d1c5' }}>
                Review &amp; adjust added assets
              </div>
              <div
                style={{
                  overflowY: 'auto',
                  border: '1px solid #253523',
                  borderRadius: 8,
                  background: '#0f140f',
                  padding: 8
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8
                  }}
                >
                  {(selectedIds || []).map((id) => (
                    <span key={'pre-' + id} style={chipLocked}>
                      {id}
                    </span>
                  ))}
                  {Array.from(addedIds).map((id) => (
                    <span key={'add-' + id} style={chip}>
                      {id}
                      <button
                        onClick={() => removeId(id)}
                        style={chipX}
                        aria-label='Remove asset from transfer'
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {combinedCount === 0 && (
                    <span style={{ color: '#8fa08a', fontSize: 13 }}>
                      No assets selected yet.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================== FOOTER ============================== */}
        <div
          style={{
            padding: 16,
            borderTop: '1px solid rgba(106,114,87,.35)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            background: '#000000ff'
          }}
        >
          <button
            onClick={handleTransfer}
            disabled={combinedCount === 0 || !localLocation}
            style={{
              background:
                combinedCount === 0 || !localLocation ? '#444' : '#6a7257',
              color: '#fff',
              fontWeight: 900,
              fontSize: 10,
              border: 'none',
              borderRadius: 2,
              padding: '2px 8px',
              cursor:
                combinedCount === 0 || !localLocation ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px #0007',
              letterSpacing: 0.6,
              opacity: combinedCount === 0 || !localLocation ? 0.7 : 1
            }}
          >
            Transfer
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#1d1d1d',
              color: '#b6e7ad',
              border: '2px solid #374134',
              fontWeight: 900,
              fontSize: 10,
              borderRadius: 2,
              padding: '2px 8px',
              cursor: 'pointer',
              letterSpacing: 0.5
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </DraggableResizableModal>
  );
}

// ==============================
// TRANSFER MODAL — STYLES
// ==============================
const th = {
  textAlign: 'left',
  padding: '10px 12px',
  fontSize: 12,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: '#cfe3c9',
  borderBottom: '1px solid #23331f'
};

const thCenter = { ...th, textAlign: 'center', width: 72 };

const td = {
  padding: '4px 4px',
  fontSize: 10,
  color: '#e9efe6'
};

const tdMono = {
  ...td,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  color: '#ff0505ff',
  whiteSpace: 'nowrap'
};

const tdCenter = { ...td, textAlign: 'center' };

const tdEmpty = {
  ...tdCenter,
  padding: 18,
  color: '#a7b5a3'
};

const chip = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 10px',
  borderRadius: 0,
  background: '#172018',
  border: '1px solid #2c422a',
  fontSize: 10,
  fontWeight: 400,
  color: '#ff0000ff'
};

const chipLocked = {
  ...chip,
  background: '#141a15',
  border: '1px dashed #2c422a',
  color: '#c7d6c4',
  opacity: 0.9
};

const chipX = {
  appearance: 'none',
  border: 'none',
  background: 'transparent',
  color: '#9db09a',
  fontWeight: 900,
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1
};
