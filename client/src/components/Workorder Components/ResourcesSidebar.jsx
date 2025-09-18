// ==============================
// FILE: ResourcesSidebar.jsx — Library Panel for Site Measurements
// Sections: Imports • Helpers • ItemCard • Uploader • Panel
// ==============================

import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../api';

// ==============================
// ======= HELPERS ==============
// ==============================
const API = API_BASE_URL || '';
const CATS = [
  { key: 'paloma', label: 'Paloma' },
  { key: 'customer', label: 'Customer' },
  { key: 'third_party', label: '3rd Party' }
];

function dragLibraryItem(e, item) {
  const payload = {
    key: item.id,
    src: item.storage_url || item.storage_path || ''
  };
  e.dataTransfer.setData('application/library-item', JSON.stringify(payload));
  e.dataTransfer.effectAllowed = 'copy';
}

// ==============================
// ======= ITEM CARD ============
// ==============================
function ItemCard({ item }) {
  const src = item.thumbnail_url || item.storage_url || item.storage_path;
  return (
    <div
      draggable
      onDragStart={e => dragLibraryItem(e, item)}
      title={item.title}
      style={{
        width: '100%',
        aspectRatio: '1.6',
        background: '#0f0f0f',
        border: '1px solid #2a2d22',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab'
      }}
    >
      {src ? (
        <img
          src={src}
          alt={item.title}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', pointerEvents: 'none' }}
          draggable={false}
        />
      ) : (
        <div style={{ color: '#666', fontSize: 12 }}>{item.title}</div>
      )}
    </div>
  );
}

// ==============================
// ======= UPLOADER =============
// ==============================
function Uploader({ category, customerId, onAdded }) {
  const [busy, setBusy] = useState(false);

  async function onPick(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', file.name);
      fd.append('category', category);
      if (category === 'customer' && customerId) fd.append('customer_id', String(customerId));
      const r = await fetch(`${API}/api/library`, { method: 'POST', body: fd });
      const out = await r.json();
      if (!r.ok) throw new Error(out?.error || 'upload_failed');
      onAdded && onAdded(out);
    } catch (e) {
      alert('Upload failed.');
    } finally {
      setBusy(false);
      ev.target.value = '';
    }
  }

  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid #2a2d22',
        background: '#0f0f0f',
        color: busy ? '#777' : '#8CF94A',
        fontWeight: 800,
        cursor: busy ? 'default' : 'pointer',
        userSelect: 'none'
      }}
    >
      + Add Symbol
      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" onChange={onPick} style={{ display: 'none' }} disabled={busy} />
    </label>
  );
}

// ==============================
// ======= PANEL ================
// ==============================
export default function ResourcesSidebar({ width = '100%', customerId = null }) {
  const [tab, setTab] = useState('paloma');
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');

  const qs = useMemo(() => {
    const u = new URL(`${API}/api/library`, window.location.origin);
    u.searchParams.set('category', tab);
    if (tab === 'customer' && customerId) u.searchParams.set('customer_id', String(customerId));
    if (search) u.searchParams.set('search', search);
    u.searchParams.set('limit', '60');
    return u.toString().replace(window.location.origin, '');
  }, [tab, customerId, search]);

  useEffect(() => {
    let killed = false;
    (async () => {
      try {
        const r = await fetch(qs);
        const out = await r.json();
        if (!killed) setItems(Array.isArray(out.items) ? out.items : []);
      } catch {
        if (!killed) setItems([]);
      }
    })();
    return () => { killed = true; };
  }, [qs]);

  return (
    <div style={{ width, height: '100%', background: '#111', color: '#ddd', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 6, padding: 10, borderBottom: '2px solid #2a2d22' }}>
        {CATS.map(c => (
          <button
            key={c.key}
            onClick={() => setTab(c.key)}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #2a2d22',
              background: tab === c.key ? '#6a7257' : '#0f0f0f',
              color: tab === c.key ? '#000' : '#ddd',
              fontWeight: 800
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '10px 10px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid #2a2d22',
            background: '#0f0f0f',
            color: '#ddd'
          }}
        />
        <Uploader category={tab} customerId={customerId} onAdded={() => {
          // refresh list
          setSearch(s => s + '');
        }} />
      </div>

      <div style={{ padding: 10, overflowY: 'auto', gap: 10, display: 'grid', gridTemplateColumns: '1fr', alignContent: 'start' }}>
        {items.map(it => <ItemCard key={it.id} item={it} />)}
        {!items.length && <div style={{ color: '#666', padding: 16 }}>No symbols yet.</div>}
      </div>
    </div>
  );
}
