// =====================================================
// client/src/pages/DocumentationHub.jsx — Hub (List • Multi-Upload • Inline Rename -> API PUT)
// Sections: Imports • Theme • Card • Helpers • Component • Render
// =====================================================
import Lottie from 'lottie-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL, resolveApiUrl } from '../api';

import GlassBackdrop from '../components/ui/GlassBackdrop';

import LeftNavPanel from '../components/Document Hub Components/LeftNavPanel';
import OnePagerPanel from '../components/Document Hub Components/OnePagerPanel';
import ViewEditPanel from '../components/Document Hub Components/View-Edit-Panel';

import DocumentHubIcon from '../assets/Fly-HQ Icons/Documenthubicon.json';

import '../pages/FlyHQTools.css';

const THEME = {
  border: '#6a7257',
  text: '#e1e5d0',
  sub: '#aab196',
  chip: '#23281c',
  surface: '#0f110d'
};

const cardStyle = {
  background: 'rgba(0,0,0,0.9)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(106,114,87,0.28)',
  boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
  borderRadius: 12
};

const API_BASE = API_BASE_URL || '';

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function toPublicUrl(storagePath) {
  if (!storagePath) return '';
  const norm = String(storagePath).replace(/\\/g, '/');
  const idx = norm.lastIndexOf('/uploads/');
  const rel = idx >= 0 ? norm.slice(idx) : `/uploads/docs/${norm.split('/').pop()}`;
  return API_BASE ? `${API_BASE}${rel}` : rel;
}
function mapDoc(row) {
  const storage = row.latest_storage_path || row.storage_path;
  const name = row.latest_original_filename || row.original_filename || row.title;
  const mime = row.latest_mime_type || row.mime_type || '';
  return {
    id: row.id,
    l1: row.category,
    title: row.title,
    code: row.code,
    rev: row.revision,
    updatedAt: new Date(row.updated_at || row.created_at || Date.now()).getTime(),
    file: storage ? {
      name,
      mime,
      url: toPublicUrl(storage)
    } : null
  };
}

export default function DocumentationHub() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [q, setQ] = useState('');
  const [compareId, setCompareId] = useState(null);

  const selected = useMemo(() => items.find(i => i.id === selectedId) || null, [items, selectedId]);
  const compareDoc = useMemo(() => items.find(i => i.id === compareId) || null, [items, compareId]);

  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('docHub.theme') || 'dark');
  useEffect(() => { localStorage.setItem('docHub.theme', themeMode); }, [themeMode]);

  const [mode, setMode] = useState(() => localStorage.getItem('docHub.mode') || 'doc');
  useEffect(() => { localStorage.setItem('docHub.mode', mode); }, [mode]);

  useEffect(() => {
    localStorage.removeItem('docHub.splitRatio');
    localStorage.removeItem('docHub.onePagerCollapsed');
  }, []);

  const containerRef = useRef(null);
  const [headerH, setHeaderH] = useState(0);
  useEffect(() => {
    function measure() {
      const candidates = [
        document.querySelector('header'),
        document.querySelector('[role="banner"]'),
        document.getElementById('app-header')
      ].filter(Boolean);
      const h = candidates.length ? Math.max(...candidates.map(el => el.getBoundingClientRect().height)) : 0;
      setHeaderH(Math.max(50, Math.min(120, Math.floor(h))));
    }
    measure();
    window.addEventListener('resize', measure);
    // Removed 500ms interval - only measure on actual resize
    return () => { window.removeEventListener('resize', measure); };
  }, []);

  const API = resolveApiUrl('/api/documents');

  async function fetchList({ query = '' } = {}) {
    const url = new URL(
      API,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    );
    if (query) url.searchParams.set('q', query);
    const res = await fetch(url.toString());
    const data = await res.json();
    setItems(Array.isArray(data) ? data.map(mapDoc) : []);
  }

  useEffect(() => { fetchList({ query: q }); /* eslint-disable-line */ }, [q]);
  useEffect(() => { fetchList(); }, []);

  async function handleUpload(filesOrSingle, category) {
    const files = Array.isArray(filesOrSingle) ? filesOrSingle : [filesOrSingle];
    if (!files.length) return;

    if (files.length > 1) {
      const form = new FormData();
      files.forEach(f => form.append('files', f));
      form.append('category', category);
      const res = await fetch(`${API}/batch`, { method: 'POST', body: form });
      if (!res.ok) return;
      const rows = await res.json();
      const docs = (rows || []).map(mapDoc);
      setItems(prev => [...docs, ...prev]);
      setSelectedId(docs[0]?.id || null);
      setMode('doc');
      return;
    }

    const form = new FormData();
    form.append('file', files[0]);
    form.append('category', category);
    form.append('title', files[0].name);
    form.append('revision', 'REV-A');
    const res = await fetch(API, { method: 'POST', body: form });
    if (!res.ok) return;
    const row = await res.json();
    const doc = mapDoc(row);
    setItems(prev => [doc, ...prev]);
    setSelectedId(doc.id);
    setMode('doc');
  }

  async function handleDelete(id) {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setItems(prev => prev.filter(d => d.id !== id));
      if (selectedId === id) setSelectedId(null);
      if (compareId === id) setCompareId(null);
    }
  }

  function createUnder({ l1 }) {
    setMode('onepager');
    console.info('Open One Pager to create under category:', l1);
  }

  function updateSelected(patch) {
    if (!selectedId) return;
    setItems(prev => prev.map(d => (d.id === selectedId ? { ...d, ...patch, updatedAt: Date.now() } : d)));
  }

  async function saveSelected() {
    if (!selectedId) return;
    setItems(prev => prev.map(d => (d.id === selectedId ? { ...d, updatedAt: Date.now() } : d)));
  }

  function createFromTemplate(template) {
    const id = uid();
    const now = Date.now();
    const doc = {
      id,
      l1: template?.l1 || 'OP',
      title: template?.title || 'One Pager',
      code: template?.code || '',
      rev: template?.rev || 'REV-A',
      updatedAt: now,
      file: null
    };
    setItems(prev => [doc, ...prev]);
    setSelectedId(id);
    setMode('doc');
  }

  async function handleRename(id, newTitle) {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    });
    if (res.ok) {
      setItems(prev => prev.map(d => (d.id === id ? { ...d, title: newTitle, updatedAt: Date.now() } : d)));
    }
  }

  const topBarTop = headerH + 0;
  const mainPadTop = headerH + 0;

  return (
    <div
      className="w-full h-full"
      style={{
        background: themeMode === 'dark' ? 'transparent' : '#f5f6f4',
        color: themeMode === 'dark' ? THEME.text : '#1a1d14',
        minHeight: 0,
        height: '100%'
      }}
    >
      <GlassBackdrop />

      <div
        style={{
          position: 'fixed',
          right: 12,
          top: topBarTop,
          height: 25,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 0px',
          border: '1px solid rgba(106,114,87,0.28)',
          borderRadius: 8,
          zIndex: 1002
        }}
      >
        <button
          type="button"
          onClick={() => setThemeMode(m => (m === 'dark' ? 'light' : 'dark'))}
          style={{ background: 'transparent', fontWeight: 800, fontSize: 12 }}
          title="Toggle theme"
        >
          {themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <div style={{ width: 1, alignSelf: 'stretch', background: THEME.border, opacity: 0.6 }} />

        <div className="flex items-center gap-2" role="tablist" aria-label="Right Pane Mode">
          <button
            type="button"
            onClick={() => setMode('doc')}
            aria-selected={mode === 'doc'}
            style={{
              padding: '6px 10px',
              fontWeight: 800,
              fontSize: 12
            }}
          >
            Document
          </button>
          <button
            type="button"
            onClick={() => setMode('onepager')}
            aria-selected={mode === 'onepager'}
            style={{
              padding: '0px 0px',
              fontWeight: 800,
              fontSize: 12
            }}
          >
            One Pager
          </button>
        </div>
      </div>

      <main
        style={{
          paddingLeft: '4px',
          paddingRight: '12px',
          paddingTop: `${mainPadTop}px`,
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: '100%'
        }}
      >
        <div
          ref={containerRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            width: '100%',
            height: '100%',
            minHeight: 0
          }}
        >
          <section style={{ height: '100%', minWidth: 0 }}>
            <LeftNavPanel
              items={items}
              selectedId={selectedId}
              onSelect={(id) => { setSelectedId(id); setMode('doc'); }}
              onCreate={createUnder}
              onUpload={handleUpload}
              onDelete={handleDelete}
              onRename={handleRename}
              q={q}
              onQuery={setQ}
            />
          </section>

          <section style={{ height: '100%', position: 'relative', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {mode === 'doc' ? (
              selected ? (
                <ViewEditPanel doc={selected} compareDoc={compareDoc} onChange={updateSelected} onSave={saveSelected} />
              ) : (
                <div
                  style={{
                    ...cardStyle,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1
                  }}
                >
                  <div className="flex flex-col items-center">
                    <Lottie animationData={DocumentHubIcon} autoplay loop style={{ width: 110, height: 110 }} />
                    <div className="mt-2 text-sm" style={{ color: THEME.sub }}>No document selected.</div>
                  </div>
                </div>
              )
            ) : (
              <OnePagerPanel onCreate={createFromTemplate} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
