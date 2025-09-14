// ==============================
// FILE: src/components/Workorder Components/GlbLibraryModal.jsx
// ==============================

import { useEffect, useMemo, useRef, useState } from 'react';

// ==============================
// ======= CONSTANTS ============
// ==============================
const API_BASE = 'http://localhost:3001';

// ==============================
// ======= UTILS ================
// ==============================
const fmtMB = n => (n == null ? '-' : `${(n / 1024 / 1024).toFixed(2)} MB`);
const slug = (str = '') => str.trim().toLowerCase().replace(/\s+/g, '-');

// ==============================
// ======= LOGOS ================
// ==============================
const customerLogoMap = {
  'generic': '/assets/folders/generic.png',
  'aoc': '/assets/customer-logos/aoc.png',
  'baytex': '/assets/customer-logos/baytex.png',
  'chevron': '/assets/customer-logos/chevron.png',
  'conocophillips': '/assets/customer-logos/conocophillips.png',
  'halo-exploration': '/assets/customer-logos/halo-exploration.png',
  'nuvista': '/assets/customer-logos/nuvista.png',
  'pacific-canbriam': '/assets/customer-logos/pacific-canbriam.png',
  'paramount': '/assets/customer-logos/paramount.png',
  'tourmaline': '/assets/customer-logos/tourmaline.png',
  'true-canadian-kec': '/assets/customer-logos/true-canadian-kec.png',
  'veren': '/assets/customer-logos/veren.png',
  'whitecap': '/assets/customer-logos/whitecap.png',
};
const getCustomerLogo = (name = 'Generic') =>
  customerLogoMap[slug(name)] || `/assets/customer-logos/${slug(name)}.png`;

// ==============================
// ======= GLB LIBRARY MODAL ====
// ==============================
export default function GlbLibraryModal({
  open,
  onClose = () => {},
  onSelect = () => {},
  initialQuery = '',
}) {
  // ==============================
  // ======= STATE ===============
  // ==============================
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [folders, setFolders] = useState(['Generic']);
  const [selectedFolder, setSelectedFolder] = useState('Generic');

  const dialogRef = useRef(null);

  // ==============================
  // ======= LOAD FOLDERS =========
  // ==============================
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs`, { credentials: 'include' });
        if (!res.ok) throw new Error('jobs HTTP ' + res.status);
        const data = await res.json();
        const set = new Set();
        for (const j of data || []) {
          const c = (j.customer || j.Customer || j.client || '').trim();
          if (c && c.toLowerCase() !== 'monthly totals') set.add(c);
        }
        setFolders(['Generic', ...Array.from(set).sort()]);
      } catch {
        setFolders(['Generic']);
      }
    })();
  }, [open]);

  // ==============================
  // ======= DATA FETCH ===========
  // ==============================
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (category) params.set('category', category);
      if (activeOnly) params.set('active', 'true');
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (selectedFolder && selectedFolder !== 'Generic') {
        params.set('dest_type', 'CUSTOMER');
        params.set('dest_customer', selectedFolder);
      } else {
        params.set('dest_type', 'GENERIC');
      }
      const res = await fetch(`${API_BASE}/api/glb-assets?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setItems(list);
      setTotal(Number(data?.total || 0));
    } catch (e) {
      setError(e?.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query, category, activeOnly, page, limit, selectedFolder]);

  // ==============================
  // ======= ESC / OUTSIDE ========
  // ==============================
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onBackdrop = e => {
    if (e.target === dialogRef.current) onClose();
  };

  // ==============================
  // ======= MEMO COUNTS ==========
  // ==============================
  const pageInfo = useMemo(() => {
    const from = (page - 1) * limit + 1;
    const to = (page - 1) * limit + (items?.length || 0);
    return total ? `${from}-${to} of ${total}` : '';
  }, [page, limit, items, total]);

  if (!open) return null;

  // ==============================
  // ======= RENDER ===============
  // ==============================
  return (
    <div
      ref={dialogRef}
      onMouseDown={onBackdrop}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        role='dialog'
        aria-modal='true'
        style={{
          width: 'min(1120px, 96vw)',
          maxHeight: '86vh',
          background: '#0a0a0a',
          border: '1px solid #6a7257',
          borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '12px 14px',
            borderBottom: '1px solid #6a7257',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#0f0f0f',
          }}
        >
          <div style={{ fontFamily: 'varien, sans-serif', fontWeight: 800, color: 'white', fontSize: 18 }}>
            GLB Asset Library
          </div>
          <div style={{ marginLeft: 16, color: '#cfd3c3', fontSize: 12 }}>
            Folder: <span style={{ color: 'white' }}>{selectedFolder}</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ color: '#cfd3c3', fontSize: 12 }}>{pageInfo}</div>
            <button
              onClick={onClose}
              style={{
                padding: '6px 10px',
                background: 'black',
                color: 'white',
                border: '1px solid #444',
                borderRadius: 6,
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div
          style={{
            padding: 12,
            borderBottom: '1px solid #6a7257',
            display: 'grid',
            gridTemplateColumns: '1fr 240px 120px',
            gap: 8,
            alignItems: 'center',
            background: '#0d0d0d',
          }}
        >
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            placeholder='Search name, tag…'
            style={{
              padding: '8px 10px',
              background: '#121212',
              color: 'white',
              border: '1px solid #6a7257',
              borderRadius: 6,
            }}
          />
          <input
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
            placeholder='Category (Flowcross, Dogbone…)'
            style={{
              padding: '8px 10px',
              background: '#121212',
              color: 'white',
              border: '1px solid #6a7257',
              borderRadius: 6,
            }}
          />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#cfd3c3' }}>
            <input
              type='checkbox'
              checked={activeOnly}
              onChange={e => { setActiveOnly(e.target.checked); setPage(1); }}
            />
            Active
          </label>
        </div>

        {/* LIST */}
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ background: '#0b0b0b', color: '#6a7257' }}>
                <th style={th}>Thumb</th>
                <th style={th}>Name</th>
                <th style={th}>Category</th>
                <th style={th}>Version</th>
                <th style={th}>Tags</th>
                <th style={th}>Size</th>
                <th style={th}>Updated</th>
                <th style={th}>Action</th>
              </tr>
            </thead>

            {/* FOLDERS SECTION */}
            <tbody>
              {selectedFolder !== 'Generic' && (
                <tr
                  onDoubleClick={() => { setSelectedFolder('Generic'); setPage(1); }}
                >
                  <td style={td}></td>
                  <td
                    colSpan={6}
                    style={{ ...td, color: '#e7f4d3', cursor: 'pointer' }}
                    onClick={() => { setSelectedFolder('Generic'); setPage(1); }}
                  >
                    ⬆ Up to Generic
                  </td>
                  <td style={td}></td>
                </tr>
              )}
              {folders.map(name => (
                <tr
                  key={name}
                  style={{ background: name === selectedFolder ? '#1a1f14' : '#0a0a0a' }}
                  onDoubleClick={() => { setSelectedFolder(name); setPage(1); }}
                >
                  <td style={td}>
                    <img
                      src={getCustomerLogo(name)}
                      alt={name}
                      width={18}
                      height={18}
                      style={{ width: 18, height: 18, objectFit: 'contain' }}
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = customerLogoMap.generic; }}
                      draggable={false}
                    />
                  </td>
                  <td
                    colSpan={6}
                    style={{ ...td, color: 'white', cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => { setSelectedFolder(name); setPage(1); }}
                  >
                    {name}
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => { setSelectedFolder(name); setPage(1); }}
                      style={ghostBtn}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* ASSETS SECTION */}
            <tbody>
              {loading && <tr><td colSpan={8} style={tdCenter}>Loading…</td></tr>}
              {!loading && error && <tr><td colSpan={8} style={{ ...tdCenter, color: '#ff8a8a' }}>{error}</td></tr>}
              {!loading && !error && items.length === 0 && (
                <tr><td colSpan={8} style={tdCenter}>No assets found.</td></tr>
              )}
              {!loading && !error && items.map(item => (
                <tr key={item.id} style={{ background: '#0a0a0a' }}>
                  <td style={td}>
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.name}
                        style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }}
                        draggable={false}
                      />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #6a7257', background: '#121212' }} />
                    )}
                  </td>
                  <td style={{ ...td, color: 'white' }}>{item.name}</td>
                  <td style={{ ...td, color: 'white' }}>{item.category || '-'}</td>
                  <td style={{ ...td, color: 'white' }}>{item.version_label || '-'}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(item.tags || []).map(t => (
                        <span key={t} style={chip}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ ...td, color: '#cfd3c3' }}>{fmtMB(item.file_bytes)}</td>
                  <td style={{ ...td, color: '#cfd3c3' }}>{item.updated_at ? new Date(item.updated_at).toLocaleString() : '-'}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => onSelect(item)}
                        style={primaryBtn}
                        title='Add to viewer'
                      >
                        Add
                      </button>
                      <a
                        href={item.storage_url}
                        target='_blank'
                        rel='noreferrer'
                        style={ghostBtn}
                        title='Open original'
                      >
                        Open
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div
          style={{
            padding: 10,
            borderTop: '1px solid #6a7257',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#0f0f0f',
          }}
        >
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={ghostBtn}
            >
              Prev
            </button>
            <div style={{ color: '#cfd3c3', fontSize: 12 }}>Page {page}</div>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={items.length < limit}
              style={ghostBtn}
            >
              Next
            </button>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <label style={{ color: '#cfd3c3', fontSize: 12 }}>Rows:</label>
            <select
              value={limit}
              onChange={e => { setPage(1); setLimit(Number(e.target.value)); }}
              style={{
                background: '#0a0a0a',
                color: 'white',
                border: '1px solid #6a7257',
                borderRadius: 6,
                padding: '6px 8px',
              }}
            >
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================
// ======= STYLES ===============
// ==============================
const th = { padding: '8px 10px', borderBottom: '1px solid #6a7257', textAlign: 'left' };
const td = { padding: '8px 10px', borderBottom: '1px solid #1e1e1e', verticalAlign: 'middle' };
const tdCenter = { ...td, textAlign: 'center', color: '#cfd3c3' };
const chip = {
  padding: '2px 8px',
  border: '1px solid #6a7257',
  borderRadius: 999,
  fontSize: 12,
  color: '#cfd3c3',
};
const primaryBtn = {
  padding: '6px 10px',
  background: '#6a7257',
  color: 'black',
  border: '1px solid #6a7257',
  borderRadius: 6,
  fontWeight: 700,
  cursor: 'pointer',
};
const ghostBtn = {
  padding: '6px 10px',
  background: '#0a0a0a',
  color: 'white',
  border: '1px solid #444',
  borderRadius: 6,
  cursor: 'pointer',
};
