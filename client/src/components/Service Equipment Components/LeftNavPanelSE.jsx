// =====================================================
// FILE: client/src/components/Service Equipment Docs/LeftNavPanelSE.jsx
// =====================================================

// =====================================================
// LeftNavPanelSE — Service Equipment Docs (Categories • Upload • Favorites)
// =====================================================

import { useEffect, useMemo, useRef, useState } from 'react';

// =====================================================
// THEME
// =====================================================
const THEME = {
  border: '#6a7257',
  text: '#e1e5d0',
  sub: '#aab196',
  chip: '#23281c',
  surface: '#0f110d',
  highlight: '#81ff7a33',
  markBg: '#ffd54d',
  markText: '#111'
};

// =====================================================
// CATEGORIES (SERVICE EQUIPMENT)
// =====================================================
const CATEGORY_LABELS = {
  SEF: 'SERVICE FORMS',
  SEP: 'SERVICE PROCEDURES',
  INS: 'INSPECTIONS',
  MA: 'MAINTENANCE',
  DRAW: 'DRAWINGS',
  CERT: 'CERTIFICATES',
  GEN: 'GENERIC'
};
const ROOTS = Object.keys(CATEGORY_LABELS);

// =====================================================
// HELPERS
// =====================================================
function safeIncludes(hay, needle) { if (!needle) return true; try { return hay.includes(needle); } catch { return false; } }
function highlightMatch(text, query) {
  if (!query) return text;
  const q = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const re = new RegExp('(' + q + ')', 'ig');
    return text.split(re).map((part, i) =>
      re.test(part) ? (<mark key={i} style={{ background: THEME.markBg, color: THEME.markText, padding: '0 2px' }}>{part}</mark>) : (<span key={i}>{part}</span>)
    );
  } catch { return text; }
}

// =====================================================
// COMPONENT
// =====================================================
export default function LeftNavPanelSE({
  items,
  selectedId,
  onSelect,
  onUpload,
  onDelete,
  onRename,
  q,
  onQuery
}) {
  const [open, setOpen] = useState(new Set(ROOTS));
  const [favorites, setFavorites] = useState(() => { try { return new Set(JSON.parse(localStorage.getItem('se.docs.fav') || '[]')); } catch { return new Set(); } });
  useEffect(() => { try { localStorage.setItem('se.docs.fav', JSON.stringify(Array.from(favorites))); } catch {} }, [favorites]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const fileRef = useRef(null);

  const itemsByCat = useMemo(() => {
    const s = (q || '').trim().toLowerCase();
    const map = {}; ROOTS.forEach(c => { map[c] = []; });
    (items || [])
      .filter(d => {
        if (!s) return true;
        const hay = [d.title, d.code, d.category, d.revision, d.original_filename].map(x => (x || '').toLowerCase()).join(' ');
        return safeIncludes(hay, s);
      })
      .forEach(d => {
        const cat = ROOTS.includes(d.category) ? d.category : 'GEN';
        map[cat].push(d);
      });
    ROOTS.forEach(c => { (map[c] || []).sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0)); });
    return map;
  }, [items, q]);

  function onFilePicked(e) {
    const files = Array.from(e.target.files || []);
    if (files.length) setUploadFiles(prev => [...prev, ...files]);
    e.target.value = '';
  }
  async function submitUpload() {
    if (!uploadFiles.length || !uploadCategory) return;
    await onUpload?.(uploadFiles, uploadCategory);
    setUploadOpen(false); setUploadFiles([]); setUploadCategory('');
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(20, 20, 20, 0.55)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        position: 'relative'
      }}
    >
      <div className='px-3 pt-3'>
        <div
          style={{
            color: THEME.text,
            fontSize: 26,
            fontWeight: 900,
            textAlign: 'center',
            letterSpacing: 2,
            textTransform: 'uppercase',
            paddingBottom: 0,
            borderBottom: `1px solid ${THEME.border}`
          }}
        >
          Documents
        </div>

        <div className='flex items-center gap-2 py-2'>
          <button
            onClick={() => setUploadOpen(true)}
            className='text-xs px-3 py-1 rounded border'
            style={{ borderColor: THEME.border, color: THEME.text }}
          >
            Upload
          </button>
          <button
            onClick={() => setOpen(new Set(ROOTS))}
            className='text-xs px-3 py-1 rounded border'
            style={{ borderColor: THEME.border, color: THEME.text }}
          >
            Expand
          </button>
          <button
            onClick={() => setOpen(new Set())}
            className='text-xs px-3 py-1 rounded border'
            style={{ borderColor: THEME.border, color: THEME.text }}
          >
            Collapse
          </button>
        </div>
      </div>

      <div className='px-3 py-2'>
        <input
          value={q}
          onChange={e => onQuery(e.target.value)}
          placeholder='Search title / code'
          className='w-full text-sm px-3 py-2 outline-none'
          style={{ color: THEME.text, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      <div className='flex-1 overflow-auto pb-3'>
        {ROOTS.map(cat => {
          const list = itemsByCat[cat] || [];
          const isOpen = open.has(cat);
          return (
            <div key={cat} className='px-2'>
              <button
                onClick={() => { const next = new Set(open); next.has(cat) ? next.delete(cat) : next.add(cat); setOpen(next); }}
                className='w-full text-left py-2'
                style={{ color: THEME.text, borderBottom: `1px solid ${THEME.border}` }}
              >
                {CATEGORY_LABELS[cat]} ({list.length})
              </button>
              <div style={{ display: isOpen ? 'block' : 'none' }}>
                {list.map(d => {
                  const selected = selectedId === d.id;
                  return (
                    <div
                      key={d.id}
                      className='flex items-center gap-2 py-1 px-1 rounded cursor-pointer'
                      style={{ background: selected ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                      onClick={() => onSelect?.(d.id)}
                      title={d.title}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); const f = new Set(favorites); f.has(d.id) ? f.delete(d.id) : f.add(d.id); setFavorites(f); }}
                        className='text-xs px-1'
                        title='Toggle favorite'
                        style={{ color: favorites.has(d.id) ? '#ffd54d' : THEME.sub }}
                      >
                        ★
                      </button>
                      <div className='truncate' style={{ color: THEME.text, fontSize: 12, fontWeight: 700 }}>
                        {highlightMatch(d.title, q)}
                      </div>
                      <div className='ml-auto flex items-center gap-2'>
                        <button
                          onClick={(e) => { e.stopPropagation(); const newTitle = prompt('Rename document', d.title); if (newTitle) onRename?.(d.id, newTitle); }}
                          className='text-[10px] px-2 py-[2px] rounded border'
                          style={{ borderColor: THEME.border, color: THEME.text }}
                        >
                          Rename
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (confirm('Delete this file?')) onDelete?.(d.id); }}
                          className='text-[10px] px-2 py-[2px] rounded border'
                          style={{ borderColor: THEME.border, color: THEME.text }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {uploadOpen ? (
        <div className='fixed inset-0 z-40 flex items-center justify-center' style={{ background: 'rgba(0,0,0,0.55)' }} onClick={() => setUploadOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: THEME.surface, width: 500, maxWidth: '92vw', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className='px-4 py-3' style={{ color: THEME.text, fontWeight: 800 }}>Upload Documents</div>
            <div className='p-4 space-y-3' style={{ color: THEME.text }}>
              <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)} className='w-full px-3 py-2 outline-none text-sm' style={{ background: THEME.surface, color: THEME.text, border: '1px solid rgba(255,255,255,0.08)' }}>
                <option value=''>Select category</option>
                {ROOTS.map(c => (<option key={c} value={c}>{c} — {CATEGORY_LABELS[c]}</option>))}
              </select>
              <div
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer?.files || []);
                  if (files.length) setUploadFiles(prev => [...prev, ...files]);
                }}
                className='text-sm'
                style={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.4)', color: THEME.sub, border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 10 }}
                onClick={() => fileRef.current?.click()}
              >
                {uploadFiles.length ? (
                  <div className='w-full px-2' style={{ maxHeight: 240, overflow: 'auto', color: THEME.text }}>
                    <div className='text-xs mb-2' style={{ color: THEME.sub }}>{uploadFiles.length} files selected</div>
                    <ul className='text-left text-xs space-y-1'>
                      {uploadFiles.map((f, i) => (<li key={i} className='truncate'>{f.name}</li>))}
                    </ul>
                  </div>
                ) : (
                  <div>Drag & drop files here, or click to choose</div>
                )}
                <input ref={fileRef} type='file' multiple accept='.pdf,.docx,.doc,.txt,.xlsx,.xls,.csv,.pptx,.png,.jpg,.jpeg' className='hidden' onChange={onFilePicked} />
              </div>
              <button onClick={submitUpload} className='w-full px-3 py-2 text-xs font-bold' style={{ background: 'transparent', color: THEME.text, opacity: uploadFiles.length && uploadCategory ? 1 : 0.6, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} disabled={!uploadFiles.length || !uploadCategory}>
                Upload {uploadFiles.length ? `(${uploadFiles.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
