// =====================================================
// File: client/src/components/Document Hub Components/LeftNavPanel.jsx
// =====================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import DraggableResizableModal from '../ui/DraggableResizableModal';
import GlassBackdrop from '../ui/GlassBackdrop';
import CategorySection from './CategorySection';
import useKeyboardShortcuts from './KeyboardShortcuts';
import NavHeaderActions from './NavHeaderActions';
import QuickFilters from './QuickFilters';

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

const CATEGORY_LABELS = {
  QF: 'QUALITY FORMS',
  QP: 'QUALITY PROCEDURES',
  CF: 'COMPETENCY FORMS',
  FOP: 'FIELD OPERATING PROCEDURES',
  OP: 'ONE PAGERS',
  LWI: 'LOCAL WORK INSTRUCTIONS',
  FIELD: 'FIELD DOCUMENTATION',
  GEN: 'GENERIC'
};
const ROOTS = Object.keys(CATEGORY_LABELS);
const BRACKET_COLOR = '#ffffff';

// =====================================================
// HELPERS
// =====================================================
function inferRootFromName(name) {
  const up = (name || '').toUpperCase();
  for (const code of ROOTS) if (up.startsWith(code + '-') || up.startsWith(code + ' ')) return code;
  return '';
}
function splitCodeAndTitle(title = '', explicitCode = '') {
  const t = String(title);
  const code = explicitCode || (t.match(/\b([A-Z]{2,5}-?\d{1,4}(?:\.\d{1,3})?)\b/)?.[1] || '');
  if (!code) return { code: '', cleanTitle: t };
  const cleanTitle = t.replace(code, '').replace(/^[-–—\s]+/, '').trim();
  return { code, cleanTitle: cleanTitle || t };
}
function getRevision(doc) {
  const direct = doc?.rev || doc?.revision || doc?.version || doc?.meta?.rev;
  if (direct) return String(direct).toUpperCase().replace(/^REV[\s.\-:]*/i, 'REV-');
  const fromTitle = (doc?.title || '').match(/\bREV[\s.\-:]?([A-Z])\b/i);
  if (fromTitle) return 'REV-' + fromTitle[1].toUpperCase();
  return '';
}
function revColor(rev) {
  const letter = (rev.match(/REV-([A-Z])/i)?.[1] || '').toUpperCase();
  if (!letter) return { bg: 'linear-gradient(180deg, rgba(255,215,0,0.18), rgba(255,215,0,0.08))', border: 'rgba(255,215,0,0.5)', color: '#ffd700' };
  if ('AB'.includes(letter)) return { bg: 'linear-gradient(180deg, rgba(0,128,0,0.25), rgba(0,128,0,0.12))', border: 'rgba(0,200,120,0.5)', color: '#7CFFA7' };
  if ('CDE'.includes(letter)) return { bg: 'linear-gradient(180deg, rgba(255,165,0,0.22), rgba(255,165,0,0.1))', border: 'rgba(255,165,0,0.55)', color: '#ffcb7a' };
  if ('FGH'.includes(letter)) return { bg: 'linear-gradient(180deg, rgba(70,130,180,0.22), rgba(70,130,180,0.1))', border: 'rgba(70,130,180,0.5)', color: '#a6d3ff' };
  return { bg: 'linear-gradient(180deg, rgba(220,20,60,0.22), rgba(220,20,60,0.1))', border: 'rgba(220,20,60,0.55)', color: '#ff9aaa' };
}
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
export default function LeftNavPanel({
  items,
  selectedId,
  onSelect,
  onCreate,
  onUpload,
  onDelete,
  onRename,
  q,
  onQuery
}) {
  // -------------------------------------------------
  // UI State
  // -------------------------------------------------
  const [open, setOpen] = useState(new Set(ROOTS));
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const fileRef = useRef(null);

  const FILTERS = ['ALL', 'FAVORITES', 'RECENT', 'REV-A'];
  const [activeFilter, setActiveFilter] = useState('ALL');

  const [toast, setToast] = useState(null);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);

  // -------------------------------------------------
  // Persisted State (Order, Favorites)
  // -------------------------------------------------
  const ORDER_KEY = 'docHub.order.v1';
  const FAV_KEY = 'docHub.favorites.v1';
  const [orderMap, setOrderMap] = useState(() => { try { return JSON.parse(localStorage.getItem(ORDER_KEY) || '{}'); } catch { return {}; } });
  const [favorites, setFavorites] = useState(() => { try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); } catch { return new Set(); } });
  useEffect(() => { try { localStorage.setItem(ORDER_KEY, JSON.stringify(orderMap)); } catch {} }, [orderMap]);
  useEffect(() => { try { localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(favorites))); } catch {} }, [favorites]);

  // -------------------------------------------------
  // Drag/Drop State
  // -------------------------------------------------
  const [dragging, setDragging] = useState(null);
  const [overTarget, setOverTarget] = useState(null);

  // -------------------------------------------------
  // Accordion Measurement Refs
  // -------------------------------------------------
  const sectionRefs = useRef({});
  const [heights, setHeights] = useState({});
  useEffect(() => {
    const h = {};
    ROOTS.forEach(c => { const el = sectionRefs.current[c]; if (el) h[c] = el.scrollHeight; });
    setHeights(h);
  }, [items, q, open, activeFilter, favorites]);

  // -------------------------------------------------
  // Grouping, Search, Ordering, Filters
  // -------------------------------------------------
  const itemsByCat = useMemo(() => {
    const s = (q || '').trim().toLowerCase();
    const map = {}; ROOTS.forEach(c => { map[c] = []; });

    (items || [])
      .filter(d => {
        if (!s) return true;
        const hay = [d.title, d.code, d.l1, d.rev, d.revision].map(x => (x || '').toLowerCase()).join(' ');
        return safeIncludes(hay, s);
      })
      .filter(d => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'FAVORITES') return favorites.has(d.id);
        if (activeFilter === 'RECENT') { const updated = d.updatedAt ? Number(d.updatedAt) : 0; const twoWeeks = 1000 * 60 * 60 * 24 * 14; return Date.now() - updated <= twoWeeks; }
        if (activeFilter === 'REV-A') { const rev = getRevision(d); return /REV-A/i.test(rev); }
        return true;
      })
      .forEach(d => {
        const cat = (d.l1 && ROOTS.includes(d.l1)) ? d.l1 : inferRootFromName(d.code || d.title);
        if (!cat || !ROOTS.includes(cat)) return;
        map[cat].push(d);
      });

    ROOTS.forEach(cat => {
      const list = map[cat] || [];
      const order = orderMap[cat] || [];
      const idx = new Map(order.map((id, i) => [id, i]));
      list.sort((a, b) => {
        const ia = idx.has(a.id) ? idx.get(a.id) : Number.POSITIVE_INFINITY;
        const ib = idx.has(b.id) ? idx.get(b.id) : Number.POSITIVE_INFINITY;
        if (ia !== ib) return ia - ib;
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
    });

    return map;
  }, [items, q, orderMap, activeFilter, favorites]);

  // -------------------------------------------------
  // Ensure Order Coverage
  // -------------------------------------------------
  function ensureOrder(cat, list) {
    const existing = orderMap[cat] || [];
    const known = new Set(existing);
    const next = [...existing, ...list.map(d => d.id).filter(id => !known.has(id))];
    if (next.length !== existing.length) setOrderMap(prev => ({ ...prev, [cat]: next }));
  }
  useEffect(() => { ROOTS.forEach(cat => ensureOrder(cat, itemsByCat[cat] || [])); }, [itemsByCat]); // eslint-disable-line

  // -------------------------------------------------
  // Upload & Delete
  // -------------------------------------------------
  function onDropUploadGlobal(e) { e.preventDefault(); e.stopPropagation(); }
  function onDragOverUploadGlobal(e) { e.preventDefault(); e.stopPropagation(); }
  async function submitUpload() {
    if (!uploadFiles.length || !uploadCategory) return;
    await onUpload?.(uploadFiles, uploadCategory);
    setUploadOpen(false); setUploadFiles([]); setUploadCategory(''); setToast('Uploaded');
  }

  // -------------------------------------------------
  // Keyboard Navigation
  // -------------------------------------------------
  const searchRef = useRef(null);
  const flatVisibleDocs = useMemo(() => {
    const arr = []; ROOTS.forEach(cat => { const list = itemsByCat[cat] || []; list.forEach(d => arr.push({ cat, id: d.id })); });
    return arr;
  }, [itemsByCat]);
  const selectedIndex = useMemo(() => flatVisibleDocs.findIndex(d => d.id === selectedId), [flatVisibleDocs, selectedId]);
  function navUp() { if (!flatVisibleDocs.length) return; const nextIdx = selectedIndex > 0 ? selectedIndex - 1 : 0; const next = flatVisibleDocs[nextIdx]; if (next) onSelect(next.id); }
  function navDown() { if (!flatVisibleDocs.length) return; const nextIdx = selectedIndex < flatVisibleDocs.length - 1 ? selectedIndex + 1 : flatVisibleDocs.length - 1; const next = flatVisibleDocs[nextIdx]; if (next) onSelect(next.id); }
  function navEnter() { if (selectedId) onSelect(selectedId); }
  function focusSearch() { try { searchRef.current?.focus(); } catch {} }
  useKeyboardShortcuts({ onUp: navUp, onDown: navDown, onEnter: navEnter, onDelete: () => {}, onFocusSearch: focusSearch });

  const revColWidth = 88;

  // -------------------------------------------------
  // Render
  // -------------------------------------------------
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
        overflowX: 'hidden',
        width: '100%',
        minWidth: 0
      }}
      onDragOver={onDragOverUploadGlobal}
      onDrop={onDropUploadGlobal}
    >
      {/* Morphism Background (single layer) */}
      <GlassBackdrop blur={8} opacity={0.18} />

      <div className='px-3 pt-3 relative' style={{ minWidth: 0 }}>
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

        <NavHeaderActions
          theme={THEME}
          ROOTS={ROOTS}
          CATEGORY_LABELS={CATEGORY_LABELS}
          onCreate={(payload) => onCreate?.(payload)}
          onOpenUpload={() => setUploadOpen(true)}
          onExpandAll={() => setOpen(new Set(ROOTS))}
          onCollapseAll={() => setOpen(new Set())}
        />
      </div>

      <div className='px-3 py-2 relative' style={{ minWidth: 0 }}>
        <input
          ref={searchRef}
          value={q}
          onChange={e => onQuery(e.target.value)}
          placeholder='Search title / code'
          className='w-full text-sm px-3 py-2 outline-none'
          style={{ color: THEME.text, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}
          title='Search documents by title, code, or revision'
        />
      </div>

      <QuickFilters
        filters={['ALL', 'FAVORITES', 'RECENT', 'REV-A']}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div className='flex-1 overflow-auto pb-3 relative' style={{ overflowX: 'hidden', minWidth: 0 }}>
        {ROOTS.map(cat => {
          const list = itemsByCat[cat] || [];
          const isOpen = open.has(cat);
          const contentHeight = heights[cat] || 0;

          return (
            <CategorySection
              key={cat}
              category={{ code: cat, label: CATEGORY_LABELS[cat] }}
              docs={list}
              isOpen={isOpen}
              contentHeight={contentHeight}
              sectionRef={el => { if (el) { sectionRefs.current[cat] = el; } }}
              toggleOpen={() => { const next = new Set(open); next.has(cat) ? next.delete(cat) : next.add(cat); setOpen(next); }}
              theme={THEME}
              bracketColor={BRACKET_COLOR}
              highlightMatch={highlightMatch}
              splitCodeAndTitle={splitCodeAndTitle}
              getRevision={getRevision}
              revColor={revColor}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggleFavorite={(id) => {
                setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
              }}
              favorites={favorites}
              dragging={dragging}
              overTarget={overTarget}
              onDragStart={(e, id, c) => { setDragging({ id, cat: c }); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', id); } catch {} }}
              onDragOver={(e, id, c) => {
                e.preventDefault();
                if (!dragging || dragging.cat !== c) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = e.clientY < rect.top + rect.height / 2 ? 'above' : 'below';
                setOverTarget({ id, cat: c, pos });
              }}
              onDragLeave={() => setOverTarget(null)}
              onDrop={(e, id, c) => {
                e.preventDefault();
                if (!dragging || dragging.cat !== c || !overTarget) { setDragging(null); setOverTarget(null); return; }
                const listLocal = itemsByCat[c] || [];
                const order = orderMap[c] ? [...orderMap[c]] : listLocal.map(d => d.id);
                const fromIdx = order.indexOf(dragging.id);
                const toIdxBase = order.indexOf(id);
                if (fromIdx === -1 || toIdxBase === -1) { setDragging(null); setOverTarget(null); return; }
                let toIdx = toIdxBase + (overTarget.pos === 'below' ? 1 : 0);
                order.splice(fromIdx, 1);
                if (toIdx > fromIdx) toIdx -= 1;
                order.splice(toIdx, 0, dragging.id);
                setOrderMap(prev => ({ ...prev, [c]: order }));
                setDragging(null); setOverTarget(null);
              }}
              onDeleteClick={(id) => onDelete?.(id)}
              onUploadToCategory={(files) => onUpload?.(Array.isArray(files) ? files : [files], cat)}
              revColumnWidth={revColWidth}
              revColumnBorderColor={THEME.border}
              onRename={(id, newTitle) => onRename?.(id, newTitle)}
            />
          );
        })}
      </div>

      {uploadOpen ? (
        <DraggableResizableModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          modalId="upload-documents"
          title="Upload Documents"
          initialW={500}
          initialH={360}
          minW={420}
          minH={320}
          closeOnBackdrop={false}
        >
          <div className='p-4 space-y-3' style={{ color: THEME.text }}>
            <select
              value={uploadCategory}
              onChange={e => setUploadCategory(e.target.value)}
              className='w-full px-3 py-2 outline-none text-sm'
              style={{ background: THEME.surface, color: THEME.text, border: '1px solid rgba(255,255,255,0.08)' }}
            >
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
              <input
                ref={fileRef}
                type='file'
                multiple
                accept='.pdf,.docx,.doc,.txt,.xlsx,.xls,.csv,.pptx'
                className='hidden'
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length) setUploadFiles(prev => [...prev, ...files]);
                  e.target.value = '';
                }}
              />
            </div>

            <button
              onClick={submitUpload}
              className='w-full px-3 py-2 text-xs font-bold'
              style={{ background: 'transparent', color: THEME.text, opacity: uploadFiles.length && uploadCategory ? 1 : 0.6, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              disabled={!uploadFiles.length || !uploadCategory}
            >
              Upload {uploadFiles.length ? `(${uploadFiles.length})` : ''}
            </button>
          </div>
        </DraggableResizableModal>
      ) : null}

      {toast ? (
        <div className='pointer-events-none' style={{ position: 'absolute', right: 10, bottom: 10, background: 'rgba(0,0,0,0.8)', color: THEME.text, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, fontWeight: 800 }}>
          {toast}
        </div>
      ) : null}
    </div>
  );
}
