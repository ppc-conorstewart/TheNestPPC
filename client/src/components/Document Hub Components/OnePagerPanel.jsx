// =====================================================
// OnePagerPanel.jsx — One Pager with Word-style Ribbon and 2-Row Header
// Sections: Imports • Theme • Constants • Helpers • Component State • Export • Shortcuts • Render
// =====================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import OnePagerRibbon from './OnePagerRibbon';

// =====================================================
// Theme
// =====================================================
const THEME = {
  border: '#6a7257',
  text: '#e1e5d0',
  sub: '#aab196',
  chip: '#23281c',
  surface: '#0f110d',
  paper: '#ffffff',
  ink: '#111111',
  danger: '#e11d48'
};

// =====================================================
// Constants (A4 sizing)
// =====================================================
const PAGE_WIDTH = 820;
const A4_RATIO = 297 / 210;
const PAGE_HEIGHT = Math.round(PAGE_WIDTH * A4_RATIO);
const PUBLIC_LOGO = '/assets/Paloma_Logo_White_Rounded3.png';

// =====================================================
// Helpers
// =====================================================
function today() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}
function escapeHTML(s) {
  const v = s || '';
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// =====================================================
// Component
// =====================================================
export default function OnePagerPanel({ onCreate }) {
  // ---------- Document Fields ----------
  const [docNo, setDocNo] = useState('');
  const [rev, setRev] = useState('A');
  const [date, setDate] = useState(today());
  const [owner, setOwner] = useState('');
  const [title, setTitle] = useState('Untitled Document');

  // ---------- UI State ----------
  const [showRibbon, setShowRibbon] = useState(true);
  const [fitMode, setFitMode] = useState('width'); // 'width' | 'normal'
  const [showErrors, setShowErrors] = useState(false);

  // ---------- Refs ----------
  const viewportRef = useRef(null);
  const pageRef = useRef(null);
  const bodyRef = useRef(null);

  // ---------- Dynamic Scale ----------
  const [scale, setScale] = useState(1);
  useEffect(() => {
    function recalc() {
      if (fitMode !== 'width' || !viewportRef.current) {
        setScale(1);
        return;
      }
      const cw = viewportRef.current.clientWidth - 32;
      const s = Math.min(1, cw / PAGE_WIDTH);
      setScale(s);
    }
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [fitMode]);

  // =====================================================
  // Exportable HTML
  // =====================================================
  const pageHTML = useMemo(() => {
    const content = bodyRef.current && bodyRef.current.innerHTML ? bodyRef.current.innerHTML : '';
    const html =
      '<div style="font-family: Arial, Helvetica, sans-serif; color:#111;">' +
        '<div style="border:2px solid #000; padding:10px;">' +
          '<div style="display:grid; grid-template-columns: 160px 1fr; gap:8px; align-items:center; margin-bottom:8px;">' +
            '<div style="height:58px; display:flex; align-items:center; justify-content:center;">' +
              `<img src="${PUBLIC_LOGO}" alt="Paloma Logo" style="max-height:54px; max-width:100%; object-fit:contain;" />` +
            '</div>' +
            '<div style="padding:6px 10px; height:58px; display:flex; align-items:center; border:2px solid #000;">' +
              `<div style="width:100%; font-size:24px; font-weight:800;">${escapeHTML(title)}</div>` +
            '</div>' +
          '</div>' +
          '<div style="display:grid; grid-template-columns: 1fr 160px 80px 150px; gap:8px; align-items:center;">' +
            '<div style="border:2px solid #000; padding:6px; height:58px; font-size:12px; display:flex; align-items:center;">' +
              '<div style="font-weight:700; margin-right:6px;">Owner:</div>' +
              `<div>${escapeHTML(owner)}</div>` +
            '</div>' +
            '<div style="border:2px solid #000; padding:6px; height:58px; font-size:12px;">' +
              '<div style="font-weight:700; margin-bottom:4px;">Document No.</div>' +
              `<div>${escapeHTML(docNo)}</div>` +
            '</div>' +
            '<div style="border:2px solid #000; padding:6px; height:58px; font-size:12px;">' +
              '<div style="font-weight:700; margin-bottom:4px;">Rev.</div>' +
              `<div>${escapeHTML(rev)}</div>` +
            '</div>' +
            '<div style="border:2px solid #000; padding:6px; height:58px; font-size:12px;">' +
              '<div style="font-weight:700; margin-bottom:4px;">Date:</div>' +
              `<div>${escapeHTML(date)}</div>` +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="border-left:2px solid #000; border-right:2px solid #000; border-bottom:2px solid #000; min-height:720px; padding:14px; margin-top:-2px;">' +
          (content ? content : '<div style="opacity:.45;">Start typing here…</div>') +
        '</div>' +
      '</div>';
    return html;
  }, [docNo, rev, date, owner, title]);

  // =====================================================
  // Export Handlers
  // =====================================================
  function exportFile(type) {
    setShowErrors(true);
    if (!title.trim()) return;
    const blob = new Blob([pageHTML], { type: type === 'pdf' ? 'application/pdf' : 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = type === 'pdf' ? 'document.pdf' : type === 'docx' ? 'document.docx' : 'document.html';
    link.click();
  }

  // =====================================================
  // Keyboard Shortcuts
  // =====================================================
  useEffect(() => {
    function onKey(e) {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 's') {
        e.preventDefault();
        exportFile('pdf');
      }
      if ((e.ctrlKey || e.metaKey) && k === 'b') {
        e.preventDefault();
        document.execCommand('bold', false, null);
      }
      if ((e.ctrlKey || e.metaKey) && k === 'i') {
        e.preventDefault();
        document.execCommand('italic', false, null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pageHTML, title]);

  // =====================================================
  // Render
  // =====================================================
  return (
    <div
      className='onepager-root'
      style={{
        position: 'relative',
        background: 'rgba(0,0,0,0.9)',
        border: '1px solid rgba(106,114,87,0.28)',
        borderRadius: 12,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {showRibbon && <OnePagerRibbon editorRef={bodyRef} />}

      <div className='onepager-toolbar onepager-nonprint' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 10px', background: 'rgba(0,0,0,0.7)' }}>
        <div className='flex items-center gap-2'>
          <button onClick={() => setShowRibbon(!showRibbon)} style={{ color: THEME.text, fontSize: 12, background: 'transparent' }} title={showRibbon ? 'Hide Ribbon' : 'Show Ribbon'}>
            {showRibbon ? '▲ Hide Ribbon' : '▼ Show Ribbon'}
          </button>
          <div style={{ width: 1, height: 16, background: '#6a725744' }} />
          <button onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('bold')} style={{ color: THEME.text, fontSize: 12, background: 'transparent' }} title='Bold (Ctrl+B)'>B</button>
          <button onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('italic')} style={{ color: THEME.text, fontSize: 12, background: 'transparent' }} title='Italic (Ctrl+I)'>I</button>
          <button onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('insertUnorderedList')} style={{ color: THEME.text, fontSize: 12, background: 'transparent' }} title='Bullet List'>• List</button>
          <div style={{ width: 1, height: 16, background: '#6a725744' }} />
          <button
            onClick={() => setFitMode(m => (m === 'width' ? 'normal' : 'width'))}
            style={{ color: THEME.text, fontSize: 12, background: 'transparent' }}
            title={fitMode === 'width' ? 'Normal Size' : 'Fit to Width'}
          >
            {fitMode === 'width' ? 'Normal' : 'Fit Width'}
          </button>
        </div>

        <div className='flex gap-2'>
          <button onClick={() => exportFile('pdf')} style={{ color: THEME.text, fontSize: 12 }} title='Export to PDF'>Export PDF</button>
          <button onClick={() => exportFile('docx')} style={{ color: THEME.text, fontSize: 12 }} title='Export to DOCX'>Export DOCX</button>
          <button onClick={() => exportFile('md')} style={{ color: THEME.text, fontSize: 12 }} title='Export to HTML'>Export HTML</button>
        </div>
      </div>

      <div ref={viewportRef} style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: 16 }}>
        <div
          ref={pageRef}
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            background: THEME.paper,
            boxShadow: '0 8px 40px rgba(0,0,0,.45)',
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            transform: `scale(${scale})`,
            transformOrigin: 'top center'
          }}
        >
          <div style={{ border: '2px solid #000', padding: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={PUBLIC_LOGO} alt='Paloma Logo' style={{ maxHeight: 54, maxWidth: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ border: '2px solid #000', padding: '6px 10px', height: 58, display: 'flex', alignItems: 'center' }}>
                <input
                  className={`onepager-input${showErrors && !title.trim() ? ' onepager-input-error' : ''}`}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder='Document Title'
                  style={{ width: '100%', fontSize: 24, fontWeight: 800, border: 'none', outline: 'none', color: THEME.ink }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px 150px', gap: 8, alignItems: 'center' }}>
              <div style={{ border: '2px solid #000', padding: 6, height: 58, display: 'flex', alignItems: 'center', fontSize: 12 }}>
                <div style={{ fontWeight: 700, marginRight: 6, color: THEME.ink }}>Owner:</div>
                <input className='onepager-input' value={owner} onChange={e => setOwner(e.target.value)} placeholder='Owner' style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: THEME.ink }} />
              </div>
              <div style={{ border: '2px solid #000', padding: 6, height: 58, fontSize: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, color: THEME.ink }}>Document No.</div>
                <input className='onepager-input' value={docNo} onChange={e => setDocNo(e.target.value)} style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, color: THEME.ink }} />
              </div>
              <div style={{ border: '2px solid #000', padding: 6, height: 58, fontSize: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, color: THEME.ink }}>Rev.</div>
                <input className='onepager-input' value={rev} onChange={e => setRev(e.target.value)} style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, color: THEME.ink }} />
              </div>
              <div style={{ border: '2px solid #000', padding: 6, height: 58, fontSize: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, color: THEME.ink }}>Date:</div>
                <input className='onepager-input' type='date' value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, color: THEME.ink }} />
              </div>
            </div>
          </div>

          <div
            ref={bodyRef}
            contentEditable
            suppressContentEditableWarning
            className='onepager-body'
            style={{
              borderLeft: '2px solid #000',
              borderRight: '2px solid #000',
              borderBottom: '2px solid #000',
              flex: 1,
              minHeight: 0,
              padding: 14,
              outline: 'none',
              marginTop: -2,
              overflowY: 'auto',
              color: THEME.ink
            }}
          />
        </div>
      </div>
    </div>
  );
}
