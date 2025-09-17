// =====================================================
// FILE: client/src/pages/ServiceEquipment.jsx
// =====================================================

// =====================================================
// ServiceEquipment.jsx — Nine Tabs, Two-Pane Layout, Glass UI
// =====================================================

import React from 'react';
import { API_BASE_URL, resolveApiUrl } from '../api';
import ViewEditPanel from '../components/Document Hub Components/View-Edit-Panel';
import LeftNavPanelSE from '../components/Service Equipment Components/LeftNavPanelSE';
import Sidebar from '../components/Sidebar';

// =====================================================
// THEME
// =====================================================
const THEME = {
  border: '#6a7257',
  text: '#e1e5d0',
  sub: '#aab196',
  chip: '#23281c',
  surface: '#0f110d',
  glass: 'bg-black/35 backdrop-blur-md',
  divider: 'border-[#6a7257]'
};

// =====================================================
// TABS — LEFT (equipment) and RIGHT (indices/forms)
// =====================================================
const LEFT_TABS = [
  { key: 'accumulators', label: 'Accumulators' },
  { key: 'valve-stands', label: 'Valve Stands' },
  { key: 'splitter-stands', label: 'Splitter Control Stands' },
  { key: 'grease-seacans', label: 'Grease Seacans' },
  { key: 'grease-pumps', label: 'Grease Pumps' },
  { key: 'torque-equipment', label: 'Torque Equipment' }
];

const RIGHT_TABS = [
  { key: 'parts-index', label: 'Parts Index' },
  { key: 'vendor-index', label: 'Vendor Index' },
  { key: 'forms', label: 'Forms' }
];

// =====================================================
// HELPERS — Map UI Tab Key -> DB Category (left tabs only)
// =====================================================
function toDbCategory(key) {
  const left = new Set(LEFT_TABS.map(t => t.key));
  if (!left.has(key)) return null;
  return key.replace(/-/g, '_');
}

// =====================================================
// TAB PILL COMPONENT
// =====================================================
function TabPill({ active, label, onClick }) {
  const base = 'px-4 py-2 text-xs font-erbaum uppercase tracking-wide rounded';
  const activeCls = 'border-b-2';
  const inactiveCls = 'opacity-80 hover:opacity-100';
  return (
    <button
      onClick={onClick}
      className={base + ' ' + (active ? activeCls : inactiveCls)}
      style={{ borderColor: active ? THEME.border : 'transparent', color: '#fff' }}
    >
      {label}
    </button>
  );
}

// =====================================================
// UNIT ROW — STRICT SINGLE-LINE, COMPACT BUTTON
// =====================================================
function UnitRow({ item, selected, onSelect }) {
  const base = 'w-full text-left px-2 py-1 rounded border transition-colors';
  const sel = 'bg-white/10';
  const unsel = 'hover:bg-white/5';
  return (
    <button
      onClick={onSelect}
      className={`${base} ${selected ? sel : unsel}`}
      style={{ borderColor: THEME.border, color: THEME.text, lineHeight: 1 }}
      title={`${item.ppc_number} • ${item.unit_text || 'Unit ?'} • ${item.serial_number || 'SN ?'} • ${item.model || ''} • ${item.location || '—'} • ${item.status_display || item.status}`}
    >
      <div
        className="flex items-center gap-2 overflow-hidden"
        style={{ whiteSpace: 'nowrap' }}
      >
        <span className="font-semibold text-[12px] tracking-wide shrink-0">{item.ppc_number}</span>
        <span className="text-[11px] opacity-90 shrink-0" style={{ color: THEME.sub }}>
          {item.unit_text || 'Unit ?'}
        </span>
        <span className="text-[11px] opacity-90 shrink-0" style={{ color: THEME.sub }}>• {item.serial_number || 'SN ?'}</span>
        {item.model ? (
          <span className="text-[11px] opacity-90 shrink-0" style={{ color: THEME.sub }}>• {item.model}</span>
        ) : null}
        <span className="text-[11px] opacity-90 shrink-0" style={{ color: THEME.sub }}>• {item.location || '—'}</span>
        <span className="text-[10px] px-2 py-[2px] rounded ml-auto shrink-0" style={{ background: THEME.chip, color: THEME.text }}>
          {item.status_display || item.status}
        </span>
      </div>
    </button>
  );
}

// =====================================================
// MAINTENANCE LOG LIST
// =====================================================
function MaintenanceLogList({ logs = [] }) {
  if (!logs.length) {
    return (
      <div className="text-xs opacity-80" style={{ color: THEME.sub }}>
        No maintenance records yet.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {logs.map(log => (
        <div key={log.id} className="p-2 rounded border" style={{ borderColor: THEME.border }}>
          <div className="text-xs font-semibold" style={{ color: THEME.text }}>
            {log.work_type + ' — ' + log.performed_at}
          </div>
          <div className="text-[11px]" style={{ color: THEME.sub }}>{log.notes}</div>
        </div>
      ))}
    </div>
  );
}

// =====================================================
// MAINTENANCE FORM
// =====================================================
function MaintenanceForm({ onSubmit }) {
  const [form, setForm] = React.useState({ performed_at: '', work_type: '', notes: '' });

  return (
    <form
      className="space-y-2"
      onSubmit={e => {
        e.preventDefault();
        onSubmit && onSubmit(form);
        setForm({ performed_at: '', work_type: '', notes: '' });
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          className="w-full px-2 py-1 rounded bg-black/30 border text-white text-xs"
          style={{ borderColor: THEME.border }}
          value={form.performed_at}
          onChange={e => setForm({ ...form, performed_at: e.target.value })}
          placeholder="Performed At"
        />
        <input
          type="text"
          className="w-full px-2 py-1 rounded bg-black/30 border text-white text-xs"
          style={{ borderColor: THEME.border }}
          value={form.work_type}
          onChange={e => setForm({ ...form, work_type: e.target.value })}
          placeholder="Work Type"
        />
      </div>
      <textarea
        className="w-full px-2 py-1 rounded bg-black/30 border text-white text-xs"
        style={{ borderColor: THEME.border }}
        rows={3}
        value={form.notes}
        onChange={e => setForm({ ...form, notes: e.target.value })}
        placeholder="Notes"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="text-xs px-3 py-1 rounded border"
          style={{ borderColor: THEME.border, color: THEME.text }}
        >
          Add Log
        </button>
      </div>
    </form>
  );
}

// =====================================================
// DOCS API BASE + MAPPERS
// =====================================================
const API_BASE = API_BASE_URL || '';
const SE_DOCS_API = resolveApiUrl('/api/service-equipment-docs');

function toPublicUrl(storagePath) {
  if (!storagePath) return '';
  const norm = String(storagePath).replace(/\\/g, '/');
  const idx = norm.lastIndexOf('/uploads/');
  const rel = idx >= 0 ? norm.slice(idx) : `/uploads/service-equipment/${norm.split('/').pop()}`;
  return API_BASE ? `${API_BASE}${rel}` : rel;
}
function mapDoc(row) {
  const storage = row.storage_path;
  const name = row.original_filename || row.title;
  const mime = row.mime_type || '';
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    code: row.code,
    rev: row.revision,
    updated_at: new Date(row.updated_at || row.created_at || Date.now()).getTime(),
    file: storage ? { name, mime, url: toPublicUrl(storage) } : null
  };
}

// =====================================================
// PAGE COMPONENT
// =====================================================
export default function ServiceEquipment() {
  const [activeTab, setActiveTab] = React.useState(LEFT_TABS[0].key);
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [logs, setLogs] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // -------- FORMS (SE DOCS) STATE --------
  const [docs, setDocs] = React.useState([]);
  const [docSelectedId, setDocSelectedId] = React.useState(null);
  const [docQ, setDocQ] = React.useState('');

  // -------- EQUIPMENT FETCH --------
  React.useEffect(() => {
    let isMounted = true;
    const cat = toDbCategory(activeTab);
    if (!cat) { setItems([]); setSelected(null); setLoading(false); return; }
    setLoading(true);
    setSelected(null);
    fetch(resolveApiUrl('/api/service-equipment?category=') + encodeURIComponent(cat))
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => { if (isMounted) setItems(Array.isArray(data) ? data : []); })
      .catch(() => { if (isMounted) setItems([]); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [activeTab]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(u => {
      const hay =
        (u.ppc_number || '') + ' ' +
        (u.unit_text || '') + ' ' +
        (u.serial_number || '') + ' ' +
        (u.model || '') + ' ' +
        (u.location || '');
      return hay.toLowerCase().includes(q);
    });
  }, [query, items]);

  // -------- SE DOCS FETCH --------
  async function fetchDocs({ q = '' } = {}) {
    const url = new URL(SE_DOCS_API);
    if (q) url.searchParams.set('q', q);
    const res = await fetch(url.toString());
    const data = await res.json();
    setDocs(Array.isArray(data) ? data.map(mapDoc) : []);
  }
  React.useEffect(() => { if (activeTab === 'forms') fetchDocs({ q: docQ }); /* eslint-disable-line */ }, [activeTab, docQ]);

  async function handleUpload(filesOrList, category) {
    const files = Array.isArray(filesOrList) ? filesOrList : [filesOrList];
    if (!files.length) return;

    if (files.length > 1) {
      const form = new FormData();
      files.forEach(f => form.append('files', f));
      form.append('category', category);
      const res = await fetch(`${SE_DOCS_API}/batch`, { method: 'POST', body: form });
      if (!res.ok) return;
      const rows = await res.json();
      const docsNew = (rows || []).map(mapDoc);
      setDocs(prev => [...docsNew, ...prev]);
      setDocSelectedId(docsNew[0]?.id || null);
      return;
    }

    const form = new FormData();
    form.append('file', files[0]);
    form.append('category', category);
    form.append('title', files[0].name);
    form.append('revision', 'REV-A');
    const res = await fetch(SE_DOCS_API, { method: 'POST', body: form });
    if (!res.ok) return;
    const row = await res.json();
    const doc = mapDoc(row);
    setDocs(prev => [doc, ...prev]);
    setDocSelectedId(doc.id);
  }
  async function handleDelete(id) {
    const res = await fetch(`${SE_DOCS_API}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setDocs(prev => prev.filter(d => d.id !== id));
      if (docSelectedId === id) setDocSelectedId(null);
    }
  }
  async function handleRename(id, newTitle) {
    const res = await fetch(`${SE_DOCS_API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    });
    if (res.ok) {
      setDocs(prev => prev.map(d => (d.id === id ? { ...d, title: newTitle, updated_at: Date.now() } : d)));
    }
  }

  // =====================================================
  // RENDER
  // =====================================================
  const isForms = activeTab === 'forms';

  return (
    <div className="app-shell">
      <style>{`.app-shell{position:relative;min-height:100vh;}
.app-sidebar{width:56px;}
.app-main{padding-left:56px;transition:padding-left 300ms ease;}
.app-sidebar:hover ~ .app-main{padding-left:256px;}
@media (max-width:1024px){
  .app-main{padding-left:56px;}
  .app-sidebar:hover ~ .app-main{padding-left:56px;}
}
.unit-list button{min-height:0}`}</style>

      <Sidebar />

      <div className="app-main w-full px-6 pb-10 relative z-0">
        <header className="mb-4 text-center">
          <h1
            className="uppercase tracking-wide font-bold"
            style={{
              color: '#fff',
              fontFamily: 'Cornero, Erbaum, sans-serif',
              fontSize: '3rem',
              lineHeight: 1.05
            }}
          >
            Service Equipment
          </h1>
          <div className="h-px w-full mt-2 border-b" style={{ borderColor: THEME.border }} />
        </header>

        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-3">
            {LEFT_TABS.map(t => (
              <TabPill
                key={t.key}
                label={t.label}
                active={activeTab === t.key}
                onClick={() => { setActiveTab(t.key); setSelected(null); }}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {RIGHT_TABS.map(t => (
              <TabPill
                key={t.key}
                label={t.label}
                active={activeTab === t.key}
                onClick={() => {
                  setActiveTab(t.key);
                  setSelected(null);
                  setItems([]);
                  if (t.key === 'forms') {
                    setDocSelectedId(null);
                    fetchDocs({ q: docQ });
                  }
                }}
              />
            ))}
          </div>
        </div>

        {isForms ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(260px, 32%) 1fr',
              gap: 16,
              minHeight: '68vh'
            }}
          >
            <section className={'p-3 rounded border ' + THEME.glass} style={{ borderColor: THEME.border }}>
              <LeftNavPanelSE
                items={docs}
                selectedId={docSelectedId}
                onSelect={(id) => setDocSelectedId(id)}
                onUpload={handleUpload}
                onDelete={handleDelete}
                onRename={handleRename}
                q={docQ}
                onQuery={setDocQ}
              />
            </section>

            <section className={'p-0 rounded border ' + THEME.glass} style={{ borderColor: THEME.border, minHeight: 0, display: 'flex' }}>
              {docSelectedId
                ? <ViewEditPanel doc={docs.find(d => d.id === docSelectedId)} />
                : (
                  <div className="w-full h-full flex items-center justify-center text-sm opacity-80" style={{ color: THEME.sub }}>
                    No document selected.
                  </div>
                )}
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4">
            <section className={'col-span-12 lg:col-span-4 p-3 rounded border ' + THEME.glass} style={{ borderColor: THEME.border }}>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search PPC# / Unit# / Serial"
                  className="w-full px-3 py-2 rounded bg-black/30 border text-white text-xs"
                  style={{ borderColor: THEME.border }}
                  disabled={!toDbCategory(activeTab)}
                />
              </div>

              <div className="unit-list space-y-1 max-h-[70vh] overflow-auto pr-1">
                {!toDbCategory(activeTab) ? (
                  <div className="text-xs opacity-80" style={{ color: THEME.sub }}>
                    {'No ' + (RIGHT_TABS.find(t => t.key === activeTab)?.label || 'Items') + ' Items Found.'}
                  </div>
                ) : loading ? (
                  <div className="text-xs opacity-80" style={{ color: THEME.sub }}>Loading…</div>
                ) : filtered.length === 0 ? (
                  <div className="text-xs opacity-80" style={{ color: THEME.sub }}>
                    {'No ' + (LEFT_TABS.find(t => t.key === activeTab)?.label || 'Items') + ' Items Found.'}
                  </div>
                ) : (
                  filtered.map(item => (
                    <UnitRow
                      key={item.id || item.ppc_number}
                      item={item}
                      selected={selected && (selected.id === item.id || selected.ppc_number === item.ppc_number)}
                      onSelect={() => { setSelected(item); }}
                    />
                  ))
                )}
              </div>
            </section>

            <section className={'col-span-12 lg:col-span-8 p-4 rounded border ' + THEME.glass} style={{ borderColor: THEME.border }}>
              {!toDbCategory(activeTab) ? (
                <div className="text-sm opacity-80" style={{ color: THEME.sub }}>
                  {'No ' + (RIGHT_TABS.find(t => t.key === activeTab)?.label || 'Items') + ' Items Found.'}
                </div>
              ) : !selected ? (
                <div className="text-sm opacity-80" style={{ color: THEME.sub }}>
                  Select an item on the left to view details and maintenance.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold" style={{ color: THEME.text }}>
                        {selected.ppc_number}
                      </div>
                      <div className="text-xs" style={{ color: THEME.sub }}>
                        {(selected.unit_text || 'Unit ?') + ' • ' + (selected.serial_number || 'SN ?') + ' • ' + (selected.location || '—')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-xs px-3 py-1 rounded border" style={{ borderColor: THEME.border, color: THEME.text }}>
                        Edit
                      </button>
                      <button className="text-xs px-3 py-1 rounded border" style={{ borderColor: THEME.border, color: THEME.text }}>
                        Attach
                      </button>
                    </div>
                  </div>

                  <div className="h-px w-full border-b" style={{ borderColor: THEME.border }} />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm mb-2" style={{ color: THEME.text }}>
                        Maintenance History
                      </h3>
                      <MaintenanceLogList logs={logs} />
                    </div>
                    <div>
                      <h3 className="text-sm mb-2" style={{ color: THEME.text }}>
                        Add Maintenance
                      </h3>
                      <MaintenanceForm
                        onSubmit={entry => {
                          const withId = { ...entry, id: String(Date.now()) };
                          setLogs(prev => [withId, ...prev]);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        <div className="mt-10" />
      </div>
    </div>
  );
}
