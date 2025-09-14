// ==========================================
// FILE: client/src/components/DownedAssetsTab.jsx
// ==========================================

// ==============================
// DOWNED ASSETS TAB — IMPORTS
// ==============================
import { useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import useAssetOptions from '../hooks/useAssetOptions';
import '../styles/Calendar.css';
import DownedAssetEditModal from './Asset Components/Downed Asset Components/DownedAssetEditModal';

// ==============================
// DOWNED ASSETS TAB — THEME CONSTANTS
// ==============================
const cardBorder = '1px solid #6a7257';
const headerBg = '#10110f';
const palomaGreen = '#6a7257';
const textMain = '#e6e8df';

// ==============================
// DOWNED ASSETS TAB — HELPERS
// ==============================
function fmt(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toISOString().slice(0, 10);
}
function parseDateInput(v) {
  if (!v) return null;
  const dt = new Date(v + 'T00:00:00');
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
}
function pickReturnDate(asset) {
  const candidates = [
    asset.expected_return,
    asset.expectedReturn,
    asset.refurb_date,
    asset.refurbDate,
    asset.return_date,
    asset.expected_date,
    asset.expectedDate
  ].filter(Boolean);
  if (!candidates.length) return null;
  const d = new Date(candidates[0]);
  return Number.isNaN(d.getTime()) ? null : d;
}
function csvEscape(s) {
  return '"' + String(s ?? '').replace(/"/g, '""') + '"';
}
function exportCsv(rows, name = 'downed-assets') {
  const csv = rows.map(r => r.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function matches(term, a) {
  const q = (term || '').trim().toLowerCase();
  if (!q) return true;
  return (
    String(a.id || '').toLowerCase().includes(q) ||
    String(a.sn || '').toLowerCase().includes(q) ||
    String(a.name || '').toLowerCase().includes(q) ||
    String(a.category || '').toLowerCase().includes(q) ||
    String(a.location || '').toLowerCase().includes(q) ||
    String(a.status || '').toLowerCase().includes(q)
  );
}

// ==============================
// DOWNED ASSETS TAB — BADGES
// ==============================
const STATUS_COLORS = {
  Downed: '#eab308',
  'Awaiting Quote': '#fb923c',
  'In Machining': '#60a5fa',
  QA: '#a78bfa',
  'Ready for Pickup': '#34d399',
  Returned: '#22c55e'
};
function StatusPill({ value }) {
  const c = STATUS_COLORS[value] || '#9aa08a';
  return (
    <span
      style={{
        border: '1px solid ' + c + '33',
        color: c,
        background: c + '14',
        padding: '1px 6px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '.02em',
        whiteSpace: 'nowrap'
      }}
    >
      {value || '—'}
    </span>
  );
}
function VendorBadge({ value }) {
  if (!value) return <span style={{ opacity: 0.7 }}>—</span>;
  return (
    <span
      style={{
        border: '1px solid #6a725733',
        color: '#c7d0b4',
        background: '#1a2016',
        padding: '1px 6px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '.02em',
        whiteSpace: 'nowrap'
      }}
    >
      {value}
    </span>
  );
}

// ==============================
// DOWNED ASSETS TAB — TOASTS
// ==============================
function Toast({ t, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, t.ms ?? 2000);
    return () => clearTimeout(id);
  }, [t, onClose]);
  return (
    <div
      style={{
        padding: '10px 14px',
        background: '#0b0d0a',
        border: '1px solid #2d332a',
        color: '#e6e8df',
        borderRadius: 8,
        boxShadow: '0 8px 32px #0008',
        fontSize: 13
      }}
    >
      {t.msg}
    </div>
  );
}

// ==============================
// DOWNED ASSETS TAB — MAIN COMPONENT
// ==============================
export default function DownedAssetsTab({ allAssets = [], activityLogs = [] }) {
  // ---------- Options ----------
  const { vendors, statuses } = useAssetOptions();

  // ---------- Derive downed list ----------
  const downedAssets = useMemo(
    () =>
      (Array.isArray(allAssets) ? allAssets : []).filter((a) => {
        const s = (a.status || '').toLowerCase();
        return (
          s === 'downed' ||
          s.includes('down') ||
          s.includes('machin') ||
          s.includes('qa') ||
          s.includes('await') ||
          s.includes('pickup') ||
          s.includes('return')
        );
      }),
    [allAssets]
  );

  // ---------- Selection / bulk actions ----------
  const [selectedIds, setSelectedIds] = useState(new Set());
  const toggleId = (id) =>
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const clearSelection = () => setSelectedIds(new Set());
  const allChecked = downedAssets.length && downedAssets.every((a) => selectedIds.has(a.id));
  const toggleAll = () => {
    if (allChecked) clearSelection();
    else setSelectedIds(new Set(downedAssets.map((a) => a.id)));
  };

  // ---------- Details drawer ----------
  const [drawerAsset, setDrawerAsset] = useState(null);

  // ---------- Edit modal state ----------
  const [editing, setEditing] = useState(null);

  // ---------- Calendar modal ----------
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDouble, setCalendarDouble] = useState(false);
  const [assignFromCalendar, setAssignFromCalendar] = useState(false);

  // ---------- Events map ----------
  const eventsByDay = useMemo(() => {
    const map = {};
    for (const a of downedAssets) {
      const d = pickReturnDate(a);
      if (!d) continue;
      const key = d.toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    return map;
  }, [downedAssets]);

  // ---------- Toasts ----------
  const [toasts, setToasts] = useState([]);
  const pushToast = (msg, ms = 2000) => setToasts((t) => [...t, { id: Math.random().toString(36).slice(2), msg, ms }]);
  const popToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  // ---------- Optimistic local edits ----------
  const [localEdits, setLocalEdits] = useState({});
  const viewAsset = (a) => ({ ...a, ...(localEdits[a.id] || {}) });

  // ---------- Inline & bulk updates ----------
  async function updateAssets(ids, changes) {
    if (!ids.length) return;
    setLocalEdits((prev) => {
      const copy = { ...prev };
      ids.forEach((id) => {
        copy[id] = { ...(copy[id] || {}), ...changes };
      });
      return copy;
    });
    try {
      await Promise.all(
        ids.map((id) =>
          fetch('http://localhost:3001/api/assets/' + encodeURIComponent(id), {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changes)
          })
        )
      );
      window.dispatchEvent(new Event('paloma:assets-updated'));
      pushToast('Saved changes');
    } catch {
      pushToast('Failed to save', 2500);
    }
  }

  // ---------- Add-downed modal ----------
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [addSelectedId, setAddSelectedId] = useState(null);
  const selectableAssets = useMemo(() => {
    const inDb = Array.isArray(allAssets) ? allAssets : [];
    return inDb
      .filter((a) => {
        const s = (a.status || '').toLowerCase();
        return !(s === 'downed' || s.includes('down') || s.includes('machin'));
      })
      .filter((a) => matches(addSearch, a))
      .slice(0, 200);
  }, [allAssets, addSearch]);
  async function handleSubmitDowned() {
    if (!addSelectedId) return;
    try {
      const res = await fetch('http://localhost:3001/api/assets/' + encodeURIComponent(addSelectedId), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Downed' })
      });
      if (!res.ok) {
        const msg = await res.text();
        alert('Failed to update asset: ' + msg);
        return;
      }
      setShowAddModal(false);
      setAddSelectedId(null);
      setAddSearch('');
      window.dispatchEvent(new Event('paloma:assets-updated'));
      pushToast('Asset marked as Downed');
    } catch {
      alert('Failed to update asset');
    }
  }

  // ==============================
  // DOWNED ASSETS TAB — RENDER
  // ==============================
  const rowPad = '6px';

  return (
    <div className='flex flex-col gap-3 w-full h-full px-3 py-2' style={{ boxSizing: 'border-box' }}>
      {/* ---------- Bulk actions ---------- */}
      <div className='flex items-center gap-2 justify-between rounded border px-3 py-2' style={{ border: cardBorder, background: '#0a0b09' }}>
        <div className='flex items-center gap-2'>
          <div style={{ color: textMain, fontSize: 12 }}>
            Selected: <b>{selectedIds.size}</b>
          </div>
          <select id='bulkVendor' style={{ padding: '4px 6px', border: '1px solid #2d332a', background: '#0b0c0a', color: '#e6e8df' }}>
            <option value=''>Assign Vendor…</option>
            {vendors.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              const v = document.getElementById('bulkVendor').value;
              if (!v) return;
              updateAssets(Array.from(selectedIds), { machining_vendor: v });
            }}
            style={{ padding: '4px 8px', border: '1px solid #6a7257', background: '#0c0d0b', color: '#e6e8df' }}
          >
            Apply
          </button>
          <input id='bulkDate' type='date' style={{ padding: '4px 6px', border: '1px solid #2d332a', background: '#0b0c0a', color: '#e6e8df' }} />
          <button
            onClick={() => {
              const v = document.getElementById('bulkDate').value;
              updateAssets(Array.from(selectedIds), { expected_return: parseDateInput(v) });
            }}
            style={{ padding: '4px 8px', border: '1px solid #6a7257', background: '#0c0d0b', color: '#e6e8df' }}
          >
            Set Date
          </button>
          <button onClick={() => updateAssets(Array.from(selectedIds), { status: 'Returned' })} style={{ padding: '4px 8px', border: '1px solid #6a7257', background: '#0c0d0b', color: '#e6e8df' }}>
            Mark Returned
          </button>
          <button
            onClick={() => {
              const header = ['Asset ID', 'Serial #', 'Name', 'Category', 'Vendor', 'Status', 'Expected Return', 'Location'];
              const rows = [header].concat(
                downedAssets
                  .filter((a) => selectedIds.has(a.id))
                  .map((a) => {
                    a = viewAsset(a);
                    return [a.id, a.sn, a.name, a.category, a.machining_vendor, a.status, fmt(a.expected_return), a.location];
                  })
              );
              exportCsv(rows, 'downed-assets-selection');
            }}
            style={{ padding: '4px 8px', border: '1px solid #6a7257', background: '#0c0d0b', color: '#e6e8df' }}
          >
            Export Selected
          </button>
          <button
            onClick={() => {
              setAssignFromCalendar(true);
              setCalendarModalOpen(true);
            }}
            style={{ padding: '4px 8px', border: '1px solid #2d332a', background: '#0c0d0b', color: '#e6e8df' }}
          >
            Assign via Calendar
          </button>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setCalendarModalOpen(true)}
            className='uppercase font-bold'
            style={{ padding: '4px 8px', border: '1px solid #6a7257', background: '#0c0d0b', color: '#e6e8df', letterSpacing: '.06em' }}
          >
            Open Calendar
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className='uppercase font-bold'
            style={{ padding: '4px 8px', border: '1px solid #6a7257', background: '#0c0d0b', color: '#e6e8df', letterSpacing: '.06em' }}
          >
            Add Downed Asset
          </button>
        </div>
      </div>

      {/* ---------- Table ---------- */}
      <div className='rounded border overflow-auto' style={{ border: cardBorder, background: '#000' }}>
        <table className='w-full' style={{ color: textMain, fontSize: '12px', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}>
          <colgroup>
            <col style={{ width: 46 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: 260 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 220 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: 180 }} />
            <col style={{ width: 120 }} />
          </colgroup>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: headerBg }}>
            <tr>
              <th className='py-1' style={{ borderBottom: cardBorder, position: 'sticky', left: 0, background: headerBg, textAlign: 'center' }}>
                <input type='checkbox' checked={!!allChecked} onChange={toggleAll} />
              </th>
              <th className='py-1' style={{ borderBottom: cardBorder, position: 'sticky', left: 46, background: headerBg, color: palomaGreen, textAlign: 'center' }}>
                Asset ID
              </th>
              <th className='py-1' style={{ borderBottom: cardBorder, color: palomaGreen, textAlign: 'center' }}>Serial #</th>
              <th className='py-1' style={{ borderBottom: cardBorder, color: palomaGreen, textAlign: 'center' }}>Name</th>
              <th className='py-1' style={{ borderBottom: cardBorder, color: palomaGreen, textAlign: 'center' }}>Category</th>
              <th className='py-1' style={{ borderBottom: cardBorder, color: palomaGreen, textAlign: 'center' }}>Machining Vendor</th>
              <th className='py-1' style={{ borderBottom: cardBorder, color: palomaGreen, textAlign: 'center' }}>Status</th>
              <th className='py-1' style={{ borderBottom: cardBorder, color: palomaGreen, textAlign: 'center' }}>Expected Return</th>
              <th className='py-1' style={{ borderBottom: cardBorder, color: palomaGreen, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {downedAssets.map((orig, i) => {
              const a = viewAsset(orig);
              const rowBg = i % 2 === 0 ? '#0b0c0a' : '#090a08';
              return (
                <tr key={a.id} style={{ background: rowBg }}>
                  <td style={{ borderBottom: '1px solid #11140f', position: 'sticky', left: 0, background: rowBg, padding: rowPad, textAlign: 'center', verticalAlign: 'middle' }}>
                    <input type='checkbox' checked={selectedIds.has(a.id)} onChange={() => toggleId(a.id)} />
                  </td>
                  <td style={{ borderBottom: '1px solid #11140f', position: 'sticky', left: 46, background: rowBg, padding: rowPad, fontWeight: 700, textAlign: 'center', verticalAlign: 'middle' }}>{a.id}</td>
                  <td style={{ borderBottom: '1px solid #11140f', padding: rowPad, textAlign: 'center', verticalAlign: 'middle' }}>{a.sn || '—'}</td>
                  <td style={{ borderBottom: '1px solid #11140f', padding: rowPad, textAlign: 'center', verticalAlign: 'middle' }}>{a.name || '—'}</td>
                  <td style={{ borderBottom: '1px solid #11140f', padding: rowPad, textAlign: 'center', verticalAlign: 'middle' }}>{a.category || '—'}</td>
                  <td style={{ borderBottom: '1px solid #11140f', padding: rowPad, textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <VendorBadge value={a.machining_vendor} />
                      <select
                        value={a.machining_vendor || ''}
                        onChange={(e) => updateAssets([a.id], { machining_vendor: e.target.value || null })}
                        style={{ padding: '4px 6px', border: '1px solid #2d332a', background: '#0b0c0a', color: '#e6e8df', minWidth: 120 }}
                      >
                        <option value=''>—</option>
                        {vendors.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td style={{ borderBottom: '1px solid #11140f', padding: rowPad, textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <StatusPill value={a.status} />
                      <select
                        value={a.status || 'Downed'}
                        onChange={(e) => updateAssets([a.id], { status: e.target.value })}
                        style={{ padding: '4px 6px', border: '1px solid #2d332a', background: '#0b0c0a', color: '#e6e8df', minWidth: 120 }}
                      >
                        {(statuses.length ? statuses : ['Downed', 'Awaiting Quote', 'In Machining', 'QA', 'Ready for Pickup', 'Returned']).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td style={{ borderBottom: '1px solid #11140f', padding: rowPad, textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <span>{fmt(a.expected_return)}</span>
                      <input
                        type='date'
                        defaultValue={fmt(a.expected_return)}
                        onChange={(e) => updateAssets([a.id], { expected_return: parseDateInput(e.target.value) })}
                        style={{ padding: '4px 6px', border: '1px solid #2d332a', background: '#0b0c0a', color: '#e6e8df' }}
                      />
                    </div>
                  </td>
                  <td style={{ borderBottom: '1px solid #11140f', padding: rowPad, textAlign: 'center', verticalAlign: 'middle' }}>
                    <button onClick={() => setDrawerAsset(a)} style={{ padding: '4px 8px', border: '1px solid #2d332a', background: '#0c0d0b', color: '#e6e8df', marginRight: 6 }}>
                      Details
                    </button>
                    <button onClick={() => setEditing(a)} style={{ padding: '4px 8px', border: '1px solid #6a7257', background: '#0c0d0b', color: '#e6e8df' }}>
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
            {!downedAssets.length && (
              <tr>
                <td colSpan={9} className='py-4' style={{ color: '#9aa08a', padding: 12, textAlign: 'center' }}>
                  No downed assets.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Calendar Modal ---------- */}
      {calendarModalOpen && (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center' style={{ background: 'rgba(0,0,0,.7)' }}>
          <div className='rounded-xl shadow-2xl paloma-frosted-glass flex flex-col' style={{ width: 'min(1400px, 96vw)', height: 'min(980px, 92vh)' }}>
            <div className='flex items-center justify-between px-4 py-3' style={{ background: headerBg, borderBottom: cardBorder }}>
              <div className='text-lg font-bold uppercase' style={{ color: palomaGreen }}>Refurb Calendar</div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setCalendarDouble((v) => !v)}
                  className='uppercase font-bold'
                  style={{ padding: '4px 8px', border: '1px solid #6a7257', background: '#0c0d0b', color: '#e6e8df', letterSpacing: '.06em' }}
                >
                  {calendarDouble ? 'One Month' : 'Two Months'}
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className='uppercase font-bold'
                  style={{ padding: '4px 8px', border: '1px solid #6a7257', background: '#0c0d0b', color: '#e6e8df', letterSpacing: '.06em' }}
                >
                  Today
                </button>
                <button
                  onClick={() => setAssignFromCalendar((v) => !v)}
                  className='uppercase font-bold'
                  style={{ padding: '4px 8px', border: '1px solid #6a7257', background: assignFromCalendar ? '#162016' : '#0c0d0b', color: '#e6e8df', letterSpacing: '.06em' }}
                >
                  {assignFromCalendar ? 'Assign Mode: ON' : 'Assign Mode: OFF'}
                </button>
                <button onClick={() => setCalendarModalOpen(false)} style={{ padding: '4px 8px', border: '1px solid #2a2e26', background: '#0c0d0b', color: textMain }}>
                  Close
                </button>
              </div>
            </div>

            <div className='p-4 bg-black flex-1 overflow-hidden'>
              <div className='paloma-calendar rounded-xl p-4 h-full'>
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  showNeighboringMonth={false}
                  prev2Label={null}
                  next2Label={null}
                  locale='en-CA'
                  className={'w-full h-full ' + (calendarDouble ? 'react-calendar--doubleView' : '')}
                  onClickDay={(date) => {
                    if (!assignFromCalendar || selectedIds.size === 0) return;
                    const iso = date.toISOString().slice(0, 10);
                    updateAssets(Array.from(selectedIds), { expected_return: iso });
                    pushToast('Assigned ' + selectedIds.size + ' asset(s) to ' + iso);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Details Drawer ---------- */}
      {drawerAsset && (
        <div className='fixed inset-0 z-[9998]' onClick={() => setDrawerAsset(null)} style={{ background: 'transparent' }}>
          <div className='absolute inset-0' />
          <div
            className='absolute top-0 right-0 h-full w-[420px] shadow-2xl'
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#0a0b09', borderLeft: cardBorder }}
          >
            <div className='flex items-center justify-between px-4 py-3' style={{ background: headerBg, borderBottom: cardBorder }}>
              <div className='text-lg font-bold uppercase' style={{ color: palomaGreen }}>Asset Details</div>
              <button onClick={() => setDrawerAsset(null)} style={{ padding: '4px 8px', border: '1px solid #2a2e26', background: '#0c0d0b', color: '#e6e8df' }}>
                Close
              </button>
            </div>
            <div className='p-4' style={{ color: textMain }}>
              <div style={{ fontSize: 12, opacity: 0.8 }} className='uppercase'>
                Asset ID
              </div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{drawerAsset.id}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }} className='uppercase'>
                Name
              </div>
              <div style={{ marginBottom: 8 }}>{drawerAsset.name || '—'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div className='uppercase' style={{ fontSize: 12, opacity: 0.8 }}>
                    Serial #
                  </div>
                  <div style={{ marginBottom: 8 }}>{drawerAsset.sn || '—'}</div>
                </div>
                <div>
                  <div className='uppercase' style={{ fontSize: 12, opacity: 0.8 }}>
                    Category
                  </div>
                  <div style={{ marginBottom: 8 }}>{drawerAsset.category || '—'}</div>
                </div>
                <div>
                  <div className='uppercase' style={{ fontSize: 12, opacity: 0.8 }}>
                    Vendor
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <VendorBadge value={drawerAsset.machining_vendor} />
                  </div>
                </div>
                <div>
                  <div className='uppercase' style={{ fontSize: 12, opacity: 0.8 }}>
                    Status
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <StatusPill value={drawerAsset.status} />
                  </div>
                </div>
                <div>
                  <div className='uppercase' style={{ fontSize: 12, opacity: 0.8 }}>
                    Expected Return
                  </div>
                  <div style={{ marginBottom: 8 }}>{fmt(drawerAsset.expected_return)}</div>
                </div>
                <div>
                  <div className='uppercase' style={{ fontSize: 12, opacity: 0.8 }}>
                    Location
                  </div>
                  <div style={{ marginBottom: 8 }}>{drawerAsset.location || '—'}</div>
                </div>
              </div>
              <div className='flex items-center gap-2 pt-2'>
                <button onClick={() => setEditing(drawerAsset)} style={{ padding: '6px 10px', border: '1px solid #6a7257', background: '#0c0d0b', color: '#e6e8df' }}>
                  Edit
                </button>
                <button onClick={() => setDrawerAsset(null)} style={{ padding: '6px 10px', border: '1px solid #2d332a', background: '#0c0d0b', color: '#e6e8df' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Add Downed Asset Modal ---------- */}
      {showAddModal && (
        <div className='fixed inset-0 flex items-center justify-center' style={{ background: 'rgba(0,0,0,.6)', zIndex: 9999 }}>
          <div className='rounded shadow-xl' style={{ width: 820, maxWidth: '92vw', background: '#0a0b09', border: cardBorder }}>
            <div className='flex items-center justify-between px-4 py-3' style={{ background: headerBg, borderBottom: cardBorder }}>
              <div className='text-lg font-bold uppercase' style={{ color: palomaGreen }}>Add Downed Asset</div>
              <button onClick={() => setShowAddModal(false)} style={{ color: textMain, border: '1px solid #2a2e26', padding: '4px 10px', background: '#0c0d0b' }}>
                Close
              </button>
            </div>

            <div className='p-4 flex flex-col gap-3' style={{ color: textMain }}>
              <div className='text-xs opacity-80'>
                Search your existing assets and select one to mark as <b>Downed</b>.
              </div>
              <input
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                placeholder='Search by ID, SN, name, category, location'
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #2d332a', background: '#0b0c0a', color: '#e6e8df', outline: 'none' }}
              />
              <div className='rounded' style={{ maxHeight: 340, overflow: 'auto', border: '1px solid #2d332a', background: '#050605' }}>
                <table className='w-full text-left' style={{ fontSize: '0.8rem', color: textMain }}>
                  <thead>
                    <tr style={{ background: '#0e0f0d' }}>
                      <th className='px-2 py-2' style={{ color: palomaGreen, borderBottom: '1px solid #2d332a' }}>Select</th>
                      <th className='px-2 py-2' style={{ color: palomaGreen, borderBottom: '1px solid #2d332a' }}>Asset ID</th>
                      <th className='px-2 py-2' style={{ color: palomaGreen, borderBottom: '1px solid #2d332a' }}>Serial #</th>
                      <th className='px-2 py-2' style={{ color: palomaGreen, borderBottom: '1px solid #2d332a' }}>Name</th>
                      <th className='px-2 py-2' style={{ color: palomaGreen, borderBottom: '1px solid #2d332a' }}>Category</th>
                      <th className='px-2 py-2' style={{ color: palomaGreen, borderBottom: '1px solid #2d332a' }}>Location</th>
                      <th className='px-2 py-2' style={{ color: palomaGreen, borderBottom: '1px solid #2d332a' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectableAssets.map((a, i) => (
                      <tr key={a.id} style={{ background: i % 2 === 0 ? '#0b0c0a' : '#090a08' }}>
                        <td className='px-2 py-2' style={{ borderBottom: '1px solid #11140f' }}>
                          <input type='radio' name='downed-select' checked={addSelectedId === a.id} onChange={() => setAddSelectedId(a.id)} />
                        </td>
                        <td className='px-2 py-2' style={{ borderBottom: '1px solid #11140f' }}>{a.id}</td>
                        <td className='px-2 py-2' style={{ borderBottom: '1px solid #11140f' }}>{a.sn || '—'}</td>
                        <td className='px-2 py-2' style={{ borderBottom: '1px solid #11140f' }}>{a.name}</td>
                        <td className='px-2 py-2' style={{ borderBottom: '1px solid #11140f' }}>{a.category}</td>
                        <td className='px-2 py-2' style={{ borderBottom: '1px solid #11140f' }}>{a.location}</td>
                        <td className='px-2 py-2' style={{ borderBottom: '1px solid #11140f' }}>{a.status}</td>
                      </tr>
                    ))}
                    {!selectableAssets.length && (
                      <tr>
                        <td colSpan={7} className='px-2 py-3' style={{ color: '#9aa08a' }}>
                          No assets found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ---------- Modal Footer: Midland Import (left) + Actions (right) ---------- */}
              <div className='flex items-center justify-between gap-3 pt-2'>
                <button
                  onClick={() => {
                    try {
                      window.dispatchEvent(new Event('paloma:midland-import'));
                    } catch {}
                  }}
                  style={{ padding: '6px 10px', border: '1px solid #6a7257', background: '#0c0d0b', color: palomaGreen }}
                >
                  New PPC# (Midland Import)
                </button>

                <div className='flex items-center gap-3'>
                  <button onClick={() => setShowAddModal(false)} style={{ padding: '6px 10px', border: '1px solid #2d332a', background: '#0c0d0b', color: textMain }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitDowned}
                    disabled={!addSelectedId}
                    className='uppercase font-bold'
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #6a7257',
                      background: addSelectedId ? '#162016' : '#0c0d0b',
                      color: addSelectedId ? '#e6e8df' : '#7f8573',
                      letterSpacing: '.08em',
                      cursor: addSelectedId ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Mark As Downed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Edit Modal ---------- */}
      {editing && <DownedAssetEditModal asset={editing} onClose={() => setEditing(null)} onSaved={() => {}} />}

      {/* ---------- Toasts ---------- */}
      <div className='fixed bottom-4 right-4 flex flex-col gap-2 z-[9999]'>{toasts.map((t) => <Toast key={t.id} t={t} onClose={() => popToast(t.id)} />)}</div>
    </div>
  );
}
