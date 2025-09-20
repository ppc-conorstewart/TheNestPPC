// =====================================================
// client/src/components/Document Hub Components/View-Edit-Panel.jsx
// Sections: Imports • Theme • Light CSS • Utils • Viewers • XLSX Editor • Component • Render
// =====================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import GlassBackdrop from '../ui/GlassBackdrop';

// =====================================================
// THEME
// =====================================================
const THEME = {
  border: '#6a7257',
  text: '#ffffffff',
  sub: '#444444',
  chip: '#f3f3f3',
  surface: 'rgba(20,20,20,0.46)',
  paper: 'rgba(255,255,255,0.06)'
};

const API_BASE = process.env.REACT_APP_API_URL || '';

const buildAbsoluteUrl = (input = '') => {
  if (!input) return '';
  const str = String(input);
  if (/^https?:/i.test(str)) return str;
  const rel = str.startsWith('/') ? str : `/${str}`;
  return API_BASE ? `${API_BASE.replace(/\/$/, '')}${rel}` : rel;
};

// =====================================================
// LIGHT MODE CSS CONSTANTS
// =====================================================
const DOCX_CSS = [
  '.docx-html h1,h2,h3{margin:.6em 0 .3em;font-weight:800;color:#111}',
  '.docx-html p{margin:.4em 0;line-height:1.35;color:#111}',
  '.docx-html table{border-collapse:collapse;background:#fff}',
  '.docx-html td,.docx-html th{border:1px solid #ddd;padding:6px;color:#111}'
].join('\n');

const LUCKYSHEET_LIGHT_FIX_CSS = [
  '/* Luckysheet Light Theme Readability Fixes (Paloma) */',
  '#luckysheet-container,',
  '#luckysheet-container * {',
  '  --paloma-accent: #6a7257;',
  '  --txt: #111111;',
  '  --sub: #444444;',
  '  --bg0: #ffffff;',
  '  --bg1: #f7f7f7;',
  '  --bg2: #fafafa;',
  '}',
  '#luckysheet-container {',
  '  background: var(--bg0) !important;',
  '  color: var(--txt) !important;',
  '}',
  '#luckysheet-container .luckysheet-grid-container,',
  '#luckysheet-container .luckysheet-cell-main {',
  '  background-color: var(--bg0) !important;',
  '  color: var(--txt) !important;',
  '}',
  '#luckysheet-container .luckysheet-row-header,',
  '#luckysheet-container .luckysheet-col-header {',
  '  background-color: var(--bg1) !important;',
  '  color: var(--txt) !important;',
  '  border-color: #e5e5e5 !important;',
  '}',
  '#luckysheet-container .luckysheet-toolbar,',
  '#luckysheet-container .luckysheet-infobar {',
  '  background: var(--bg0) !important;',
  '  color: var(--txt) !important;',
  '  border-bottom: 1px solid #e5e5e5 !important;',
  '}',
  '#luckysheet-container .luckysheet-toolbar .luckysheet-toolbar-button,',
  '#luckysheet-container .luckysheet-toolbar .luckysheet-toolbar-button span {',
  '  color: var(--txt) !important;',
  '}',
  '#luckysheet-container .luckysheet-cell {',
  '  color: var(--txt) !important;',
  '}',
  '#luckysheet-container .luckysheet-default-input {',
  '  color: var(--txt) !important;',
  '  background:#fff !important;',
  '}',
  '#luckysheet-container input,',
  '#luckysheet-container select,',
  '#luckysheet-container textarea {',
  '  background:#fff !important;',
  '  color: var(--txt) !important;',
  '  border: 1px solid #d9d9d9 !important;',
  '}',
  '#luckysheet-container input::placeholder,',
  '#luckysheet-container textarea::placeholder {',
  '  color: #666 !important;',
  '}',
  '#luckysheet-container .luckysheet-sheet-area,',
  '#luckysheet-container .luckysheet-sheets-item,',
  '#luckysheet-container .luckysheet-sheets-item .sheetName {',
  '  background: var(--bg1) !important;',
  '  color: var(--txt) !important;',
  '  border-color: #e5e5e5 !important;',
  '}',
  '#luckysheet-container .luckysheet-sheets-item-active,',
  '#luckysheet-container .luckysheet-sheets-item:hover {',
  '  background: var(--bg2) !important;',
  '  color: var(--txt) !important;',
  '}',
  '#luckysheet-container .luckysheet-contextmenu,',
  '#luckysheet-container .luckysheet-cols-menu,',
  '#luckysheet-container .luckysheet-cell-dropdownmenu {',
  '  background: #fff !important;',
  '  color: var(--txt) !important;',
  '  border: 1px solid #e5e5e5 !important;',
  '}',
  '#luckysheet-container .luckysheet-cols-menu li:hover {',
  '  background: var(--bg2) !important;',
  '}',
  '#luckysheet-container .luckysheet-cell-selected,',
  '#luckysheet-container .luckysheet-selection-copy,',
  '#luckysheet-container .luckysheet-selection {',
  '  border-color: var(--paloma-accent) !important;',
  '}',
  '#luckysheet-container .luckysheet-grid-canvas {',
  '  background: transparent !important;',
  '}'
].join('\n');

// =====================================================
// UTILS
// =====================================================
function isPdf(mime, name) {
  return (mime || '').includes('pdf') || /\.pdf(\?|$)/i.test(name || '');
}
function isImage(mime, name) {
  const m = (mime || '').toLowerCase();
  return m.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name || '');
}
function isDocx(mime, name) {
  return (mime || '').includes('officedocument.wordprocessingml.document') || /\.docx?(\?|$)/i.test(name || '');
}
function isSpreadsheet(mime, name) {
  const m = (mime || '').toLowerCase();
  return (
    m.includes('officedocument.spreadsheetml.sheet') ||
    m.includes('application/vnd.ms-excel') ||
    /\.xlsx?(\?|$)/i.test(name || '') ||
    /\.xls(\?|$)/i.test(name || '')
  );
}
function fileSafeName(name = 'document') {
  return name.replace(/[^\w.\-]+/g, '_');
}
function downloadLabel(kind) {
  return kind === 'pdf' ? 'Download PDF' : 'Download Document';
}
function chooseInlineUrl(doc) {
  if (!doc) return '';
  if (doc.file && doc.file.url) return buildAbsoluteUrl(doc.file.url);
  if (doc.fileUrl) return buildAbsoluteUrl(doc.fileUrl);
  if (doc.id) return buildAbsoluteUrl(`/api/documents/${doc.id}/file`);
  return '';
}
function chooseDownloadUrl(doc) {
  if (!doc) return '';
  if (doc.downloadUrl) return buildAbsoluteUrl(doc.downloadUrl);
  if (doc.id) return buildAbsoluteUrl(`/api/documents/${doc.id}/download`);
  const u = chooseInlineUrl(doc);
  return u || '';
}

// =====================================================
// VIEWERS
// =====================================================
function PdfViewer({ src }) {
  return <iframe title='pdf' src={src} style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }} />;
}

function ImageViewer({ src, name }) {
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
      <img alt={name || 'image'} src={src} style={{ maxWidth: '100%', maxHeight: '100%' }} />
    </div>
  );
}

function DocxViewer({ src }) {
  const ref = useRef(null);
  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const r = await fetch(src);
        const ab = await r.arrayBuffer();
        const { renderAsync } = await import('docx-preview');
        if (!cancelled) renderAsync(ab, ref.current, null, { inWrapper: false, styleMap: DOCX_CSS });
      } catch (err) {
        console.error('Docx render error:', err);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [src]);
  return <div ref={ref} className='docx-html' style={{ padding: '1rem', background: '#fff', height: '100%', overflow: 'auto' }} />;
}

// =====================================================
// XLSX EDITOR (LUCKYSHEET EMBED)
// =====================================================
function XlsxEditor({ src }) {
  const containerRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const luckysheet = (await import('luckysheet')).default;
        if (cancelled) return;
        const id = 'luckysheet-container';
        containerRef.current.id = id;
        luckysheet.create({
          container: id,
          showtoolbar: true,
          showinfobar: false,
          showsheetbar: true,
          data: [{
            name: 'Sheet1',
            celldata: []
          }],
          allowCopy: true,
          lang: 'en',
          plugins: ['chart'],
          hook: {},
          loadUrl: src
        });
        const styleTag = document.createElement('style');
        styleTag.innerHTML = LUCKYSHEET_LIGHT_FIX_CSS;
        document.head.appendChild(styleTag);
      } catch (err) {
        console.error('Xlsx render error:', err);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [src]);
  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

// =====================================================
// COMPONENT
// =====================================================
export default function ViewEditPanel({ doc }) {
  const inlineUrl = useMemo(() => chooseInlineUrl(doc), [doc]);
  const downloadUrl = useMemo(() => chooseDownloadUrl(doc), [doc]);

  if (!doc) {
    return (
      <GlassBackdrop>
        <div style={{ padding: '2rem', color: THEME.text }}>Select a document to view</div>
      </GlassBackdrop>
    );
  }

  const kind = isPdf(doc.mimeType, doc.name)
    ? 'pdf'
    : isImage(doc.mimeType, doc.name)
    ? 'image'
    : isDocx(doc.mimeType, doc.name)
    ? 'docx'
    : isSpreadsheet(doc.mimeType, doc.name)
    ? 'spreadsheet'
    : 'unknown';

  return (
    <GlassBackdrop>
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        {downloadUrl && (
          <a href={downloadUrl} download={fileSafeName(doc.name)} target='_blank' rel='noreferrer'>
            <button style={{ padding: '.5rem 1rem', background: THEME.border, color: '#fff', border: 'none', borderRadius: 4 }}>
              {downloadLabel(kind)}
            </button>
          </a>
        )}
      </div>
      <div style={{ width: '100%', height: '100%', background: THEME.surface }}>
        {kind === 'pdf' && <PdfViewer src={inlineUrl} />}
        {kind === 'image' && <ImageViewer src={inlineUrl} name={doc.name} />}
        {kind === 'docx' && <DocxViewer src={inlineUrl} />}
        {kind === 'spreadsheet' && <XlsxEditor src={inlineUrl} />}
        {kind === 'unknown' && (
          <div style={{ padding: '2rem', color: THEME.text }}>
            Cannot preview this file type. Please download instead.
          </div>
        )}
      </div>
    </GlassBackdrop>
  );
}
