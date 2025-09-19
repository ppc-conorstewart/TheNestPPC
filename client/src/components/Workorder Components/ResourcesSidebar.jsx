// ==============================
// FILE: ResourcesSidebar.jsx — Library Panel for Site Measurements
// Sections: Imports • Helpers • ItemCard • ContextMenu • Uploader • Panel
// ==============================

import { useEffect, useMemo, useRef, useState } from 'react';
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

function bust(url) {
  if (!url) return url;
  const j = url.includes('?') ? '&' : '?';
  return `${url}${j}v=${Date.now()}`;
}

// ==============================
// ======= ITEM CARD ============
// ==============================
function ItemCard({ item, onContext }) {
  const srcRaw = item.thumbnail_url || item.storage_url || item.storage_path;
  const src = bust(srcRaw);
  return (
    <div
      onContextMenu={e => {
        e.preventDefault();
        onContext && onContext(e, item);
      }}
      draggable
      onDragStart={e => dragLibraryItem(e, item)}
      title={item.title || 'Untitled'}
      style={{
        width: '100%',
        background: '#0f0f0f',
        border: '1px solid #2a2d22',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'grab'
      }}
    >
      <div
        style={{
          width: '100%',
          height: 92,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
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
          <div style={{ color: '#666', fontSize: 12, padding: 10 }}>No Preview</div>
        )}
      </div>
      <div
        style={{
          padding: '6px 8px',
          borderTop: '1px solid #2a2d22',
          color: '#ccc',
          fontSize: 12,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          userSelect: 'none'
        }}
      >
        {item.title || 'Untitled'}
      </div>
    </div>
  );
}

// ==============================
// ======= CONTEXT MENU =========
// ==============================
function ContextMenu({ anchor, onClose, onRename, onDelete }) {
  const ref = useRef(null);

  useEffect(() => {
    const onClickAway = e => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onClose();
    };
    const onEsc = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('mousedown', onClickAway);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClickAway);
      window.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: anchor.x,
        top: anchor.y,
        background: '#0f0f0f',
        border: '1px solid #2a2d22',
        borderRadius: 8,
        overflow: 'hidden',
        zIndex: 10000,
        minWidth: 160,
        boxShadow: '0 6px 20px rgba(0,0,0,0.35)'
      }}
    >
      <button
        onClick={onRename}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          color: '#ddd',
          cursor: 'pointer'
        }}
      >
        Rename
      </button>
      <button
        onClick={onDelete}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          color: '#ff6b6b',
          cursor: 'pointer'
        }}
      >
        Delete
      </button>
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
      onAdded && onAdded(out); // immediate optimistic add
    } catch {
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
      + Add
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
  const [menu, setMenu] = useState(null); // {x,y,item}

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

  const handleAdded = (out) => {
    setItems(prev => [{ ...out }, ...prev]); // real-time optimistic add
  };

  const handleContext = (e, item) => {
    setMenu({ x: e.clientX, y: e.clientY, item });
  };

  const closeMenu = () => setMenu(null);

  const doRename = async () => {
    if (!menu?.item) return;
    const current = menu.item.title || 'Untitled';
    const next = window.prompt('New name:', current);
    if (next == null) return;
    try {
      const r = await fetch(`${API}/api/library/${menu.item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: next })
      });
      const out = await r.json();
      if (!r.ok) throw new Error(out?.error || 'rename_failed');
      setItems(prev => prev.map(i => (i.id === menu.item.id ? { ...i, title: next } : i)));
    } catch {
      alert('Rename failed.');
    } finally {
      closeMenu();
    }
  };

  const doDelete = async () => {
    if (!menu?.item) return;
    if (!window.confirm('Delete this symbol?')) return;
    try {
      const r = await fetch(`${API}/api/library/${menu.item.id}`, { method: 'DELETE' });
      const out = await r.json();
      if (!r.ok || out?.error) throw new Error(out?.error || 'delete_failed');
      setItems(prev => prev.filter(i => i.id !== menu.item.id));
    } catch (e) {
      const msg = e?.message === 'in_use' ? 'This symbol is used on a canvas.' : 'Delete failed.';
      alert(msg);
    } finally {
      closeMenu();
    }
  };

  return (
    <div style={{ width, height: '100%', background: '#111', color: '#ddd', display: 'flex', flexDirection: 'column', position: 'relative' }}>
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
        <Uploader category={tab} customerId={customerId} onAdded={handleAdded} />
      </div>

      <div
        style={{
          padding: 10,
          overflowY: 'auto',
          gap: 10,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignContent: 'start'
        }}
      >
        {items.map(it => <ItemCard key={it.id} item={it} onContext={handleContext} />)}
        {!items.length && <div style={{ color: '#666', padding: 16 }}>No symbols yet.</div>}
      </div>

      {menu && (
        <ContextMenu
          anchor={{ x: menu.x, y: menu.y }}
          onClose={closeMenu}
          onRename={doRename}
          onDelete={doDelete}
        />
      )}
    </div>
  );
}
