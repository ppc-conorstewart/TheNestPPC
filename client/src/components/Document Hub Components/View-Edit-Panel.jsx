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
  if (doc.file && doc.file.url) return doc.file.url;
  if (doc.fileUrl) return doc.fileUrl;
  if (doc.id) return `/api/documents/${doc.id}/file`;
  return '';
}
function chooseDownloadUrl(doc) {
  if (!doc) return '';
  if (doc.downloadUrl) return doc.downloadUrl;
  if (doc.id) return `/api/documents/${doc.id}/download`;
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

function DocxViewer({ src, name }) {
  const [html, setHtml] = useState('<div style="opacity:.6">Loading DOCX…</div>');
  const [error, setError] = useState('');
  useEffect(() => {
    let aborted = false;
    async function ensureMammoth() {
      if (window.mammoth) return window.mammoth;
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/mammoth@1.6.0/mammoth.browser.min.js';
        s.async = true;
        s.onload = res;
        s.onerror = () => rej(new Error('Failed to load mammoth'));
        document.head.appendChild(s);
      });
      return window.mammoth;
    }
    async function load() {
      try {
        const mammoth = await ensureMammoth();
        const resp = await fetch(src, { cache: 'no-cache' });
        const buf = await resp.arrayBuffer();
        if (aborted) return;
        const result = await mammoth.convertToHtml({ arrayBuffer: buf });
        if (aborted) return;
        setHtml('<div class="docx-html">' + result.value + '</div>');
      } catch {
        if (!aborted) setError('Unable to render .docx inline. Click Download to open in Word.');
      }
    }
    load();
    return () => { aborted = true; };
  }, [src]);
  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 10, color: '#b00020' }}>{error}</div>
        <a href={src} download={fileSafeName(name)}>Download</a>
      </div>
    );
  }
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', padding: 16, background: 'transparent' }}>
      <style>{DOCX_CSS}</style>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// =====================================================
// XLSX EDITOR
// =====================================================
function XlsxEditor({ src, name }) {
  const hostRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    const pushCss = (href) => {
      if (!document.querySelector(`link[data-ls='${href}']`)) {
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = href;
        l.setAttribute('data-ls', href);
        document.head.appendChild(l);
      }
    };
    const pushJs = (srcUrl) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-ls='${srcUrl}']`)) return resolve();
        const s = document.createElement('script');
        s.src = srcUrl;
        s.async = true;
        s.setAttribute('data-ls', srcUrl);
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
      });
    pushCss('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/css/plugins.css');
    pushCss('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/plugins.css');
    pushCss('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/css/luckysheet.css');
    Promise.all([
      pushJs('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/js/plugin.js'),
      pushJs('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/luckysheet.umd.js'),
      pushJs('https://cdn.jsdelivr.net/npm/luckyexcel@1.0.1/dist/luckyexcel.umd.js')
    ])
      .then(() => setReady(true))
      .catch(() => setErr('Failed to load spreadsheet editor.'));
  }, []);
  useEffect(() => {
    if (!ready || !hostRef.current) return;
    let disposed = false;
    async function init() {
      try {
        if (window.luckysheet) {
          try { window.luckysheet.destroy(); } catch {}
        }
        const resp = await fetch(src, { cache: 'no-cache' });
        const blob = await resp.blob();
        const file = new File([blob], fileSafeName(name || 'workbook.xlsx'), { type: blob.type });
        window.LuckyExcel.transformExcelToLucky(file, (exportJson) => {
          if (disposed) return;
          if (!exportJson || !exportJson.sheets || exportJson.sheets.length === 0) {
            setErr('No sheets found in workbook.');
            return;
          }
          hostRef.current.innerHTML = '';
          window.luckysheet.create({
            container: hostRef.current.id,
            lang: 'en',
            showinfobar: false,
            data: exportJson.sheets
          });
        });
      } catch {
        setErr('Unable to render spreadsheet inline.');
      }
    }
    init();
    return () => { disposed = true; };
  }, [ready, src, name]);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <style>{LUCKYSHEET_LIGHT_FIX_CSS}</style>
      {err ? <div style={{ padding: 12 }}>{err}</div> : null}
      <div id='luckysheet-container' ref={hostRef} style={{ position: 'absolute', inset: 0, background: 'transparent' }} />
    </div>
  );
}

// =====================================================
// COMPONENT
// =====================================================
export default function ViewEditPanel({ doc }) {
  const inlineUrl = useMemo(() => chooseInlineUrl(doc), [doc]);
  const downloadUrl = useMemo(() => chooseDownloadUrl(doc), [doc]);

  const name =
    (doc && (doc.original_filename || doc.title || doc.code)) ||
    (doc && doc.file && (doc.file.name || doc.file.filename)) ||
    'document';

  const mime =
    (doc && (doc.mime_type || doc.mime)) ||
    (doc && doc.file && (doc.file.mime || doc.file.mimetype)) ||
    '';

  const kind = useMemo(() => {
    if (!inlineUrl) return 'none';
    if (isPdf(mime, name)) return 'pdf';
    if (isImage(mime, name)) return 'image';
    if (isDocx(mime, name)) return 'docx';
    if (isSpreadsheet(mime, name)) return 'xlsx';
    return 'unknown';
  }, [inlineUrl, mime, name]);

  const Header = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        background: 'transparent',
        borderBottom: `1px solid ${THEME.border}`
      }}
    >
      <div
        style={{
          color: THEME.text,
          fontSize: 26,
          fontWeight: 900,
          letterSpacing: 2,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '65vw'
        }}
        title={name}
      >
        {name}
      </div>
      {inlineUrl ? (
        <a
          href={downloadUrl || inlineUrl}
          download={fileSafeName(name)}
          style={{ fontSize: 12, fontWeight: 800, textDecoration: 'underline', color: '#e6e8df' }}
        >
          {downloadLabel(kind)}
        </a>
      ) : null}
    </div>
  );

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        background: 'transparent',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.35) inset',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <GlassBackdrop blur={8} opacity={0.18} />
      {Header}
      <div style={{ flex: 1, minHeight: 0, width: '100%', background: 'transparent' }}>
        {!inlineUrl ? (
          <div style={{ padding: 16, color: THEME.text }}>No document selected.</div>
        ) : kind === 'pdf' ? (
          <PdfViewer src={inlineUrl} />
        ) : kind === 'image' ? (
          <ImageViewer src={inlineUrl} name={name} />
        ) : kind === 'docx' ? (
          <DocxViewer src={inlineUrl} name={name} />
        ) : kind === 'xlsx' ? (
          <XlsxEditor src={inlineUrl} name={name} />
        ) : (
          <div style={{ padding: 16, color: THEME.text }}>
            Preview not supported.{' '}
            <a href={downloadUrl || inlineUrl} download={fileSafeName(name)} style={{ color: '#e6e8df', textDecoration: 'underline' }}>
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
