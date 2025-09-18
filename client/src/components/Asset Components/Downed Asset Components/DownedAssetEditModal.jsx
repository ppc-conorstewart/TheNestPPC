// ==========================================
// FILE: client/src/components/Asset Components/Downed Asset Components/DownedAssetEditModal.jsx
// ==========================================

// ==============================
// DOWNED ASSET EDIT MODAL — IMPORTS
// ==============================
import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../../api';


const API_BASE = API_BASE_URL || '';

// ==============================
// DOWNED ASSET EDIT MODAL — THEME CONSTANTS
// ==============================
const cardBorder = '1px solid #6a7257';
const headerBg = '#10110f';
const palomaGreen = '#6a7257';
const textMain = '#e6e8df';

// ==============================
// DOWNED ASSET EDIT MODAL — CONSTANTS
// ==============================
const VENDOR_OPTIONS = [
  'Alaska',
  'Academy',
  'Golden Eagle',
  'Hi-Quality',
  'Source',
  'Domino',
  'Champ',
  'Pacific'
];

// ==============================
// DOWNED ASSET EDIT MODAL — HELPERS
// ==============================
function fmtDateInput(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseDateInput(v) {
  if (!v) return null;
  const dt = new Date(v + 'T00:00:00');
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
}

// ==============================
// DOWNED ASSET EDIT MODAL — COMPONENT
// ==============================
export default function DownedAssetEditModal({ asset = null, onClose = () => {}, onSaved = () => {} }) {
  const initial = useMemo(
    () => ({
      machining_vendor: asset?.machining_vendor || asset?.machiningVendor || null,
      expected_return: asset?.expected_return || asset?.expectedReturn || asset?.refurb_date || '',
      status: asset?.status || 'Downed',
      downed_notes: asset?.downed_notes || asset?.notes || ''
    }),
    [asset]
  );

  const [vendor, setVendor] = useState(initial.machining_vendor ?? '');
  const [expected, setExpected] = useState(fmtDateInput(initial.expected_return));
  const [status, setStatus] = useState(initial.status);
  const [notes, setNotes] = useState(initial.downed_notes);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    setVendor(initial.machining_vendor ?? '');
    setExpected(fmtDateInput(initial.expected_return));
    setStatus(initial.status);
    setNotes(initial.downed_notes);
  }, [initial]);

  async function handleSave() {
    if (!asset?.id) return;
    setSaving(true);
    setErr('');
    try {
      const body = {
        machining_vendor: vendor || null,
        expected_return: parseDateInput(expected),
        downed_notes: notes || null,
        status
      };
      const res = await fetch(`${API_BASE}/api/assets/` + encodeURIComponent(asset.id), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Save failed');
      onSaved();
      onClose();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('paloma:assets-updated'));
    } catch (e) {
      setErr(e?.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='fixed inset-0 flex items-center justify-center' style={{ background: 'rgba(0,0,0,.6)', zIndex: 9999 }}>
      <div className='rounded shadow-xl' style={{ width: 780, maxWidth: '92vw', background: '#0a0b09', border: cardBorder }}>
        <div className='flex items-center justify-between px-4 py-3' style={{ background: headerBg, borderBottom: cardBorder }}>
          <div className='text-lg font-bold uppercase' style={{ color: palomaGreen }}>Edit Downed Asset</div>
          <button onClick={onClose} style={{ color: textMain, border: '1px solid #2a2e26', padding: '4px 10px', background: '#0c0d0b' }}>Close</button>
        </div>

        <div className='p-4 flex flex-col gap-4' style={{ color: textMain }}>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <div className='text-xs opacity-80 uppercase'>Asset ID</div>
              <div className='font-bold'>{asset?.id || '—'}</div>
            </div>
            <div>
              <div className='text-xs opacity-80 uppercase'>Serial #</div>
              <div className='font-bold'>{asset?.sn || '—'}</div>
            </div>
            <div className='col-span-2'>
              <div className='text-xs opacity-80 uppercase'>Name</div>
              <div className='font-bold'>{asset?.name || '—'}</div>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1'>
              <label className='text-xs opacity-80 uppercase'>Machining Vendor</label>
              <select
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #2d332a', background: '#0b0c0a', color: '#e6e8df', outline: 'none' }}
              >
                <option value=''>— Not designated —</option>
                {VENDOR_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-xs opacity-80 uppercase'>Expected Return</label>
              <input type='date' value={expected} onChange={(e) => setExpected(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #2d332a', background: '#0b0c0a', color: '#e6e8df', outline: 'none' }} />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1'>
              <label className='text-xs opacity-80 uppercase'>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #2d332a', background: '#0b0c0a', color: '#e6e8df', outline: 'none' }}>
                <option value='Downed'>Downed</option>
                <option value='Awaiting Quote'>Awaiting Quote</option>
                <option value='In Machining'>In Machining</option>
                <option value='QA'>QA</option>
                <option value='Ready for Pickup'>Ready for Pickup</option>
                <option value='Returned'>Returned</option>
              </select>
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-xs opacity-80 uppercase'>Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder='Optional notes' style={{ width: '100%', padding: '10px 12px', border: '1px solid #2d332a', background: '#0b0c0a', color: '#e6e8df', outline: 'none' }} />
            </div>
          </div>

          {!!err && <div className='text-red-400 text-xs'>{err}</div>}

          <div className='flex items-center justify-end gap-3 pt-2'>
            <button onClick={onClose} disabled={saving} style={{ padding: '8px 12px', border: '1px solid #2d332a', background: '#0c0d0b', color: textMain }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} className='uppercase font-bold' style={{ padding: '8px 14px', border: '1px solid #6a7257', background: '#162016', color: '#e6e8df', letterSpacing: '.08em', cursor: 'pointer', opacity: saving ? 0.8 : 1 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

