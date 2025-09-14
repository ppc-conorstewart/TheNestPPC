// =====================================================
// OnePagerRibbon.jsx — Static Word-style Ribbon for OnePager
// Sections: Imports • Constants • Styles • Selection Utils • Exec Utils • Component
// =====================================================

import { useEffect, useRef, useState } from 'react';

// -----------------------------
// Constants
// -----------------------------
const FONTS = [
  'Calibri','Arial','Helvetica','Times New Roman','Georgia','Courier New',
  'Verdana','Tahoma','Trebuchet MS','Garamond','Cambria','Segoe UI'
];
const SIZES = [10,11,12,14,16,18,20,22,24,28,32,36,48,72];

// -----------------------------
// Styles
// -----------------------------
const bar = {
  position: 'sticky',
  top: 0,
  zIndex: 5,
  display: 'flex',
  alignItems: 'center',
  gap: 0,
  padding: '8px 12px',
  background: 'rgba(0,0,0,0.86)',
  borderBottom: '1px solid rgba(255,255,255,0.08)'
};
const group = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '0 10px',
  borderRight: '1px solid rgba(255,255,255,0.12)'
};
const groupLast = { ...group, borderRight: 'none' };
const btn = {
  background: 'transparent',
  border: 'none',
  color: '#E6E8DF',
  fontWeight: 800,
  fontSize: 13,
  padding: '4px 6px',
  lineHeight: 1,
  cursor: 'pointer'
};
const selectBase = {
  background: 'transparent',
  border: 'none',
  color: '#E6E8DF',
  fontWeight: 700,
  fontSize: 13,
  padding: '2px 4px',
  outline: 'none',
  textAlign: 'center',
  textAlignLast: 'center'
};
const colorInput = {
  appearance: 'none',
  WebkitAppearance: 'none',
  background: 'transparent',
  border: 'none',
  width: 22,
  height: 18,
  padding: 0,
  cursor: 'pointer'
};

// -----------------------------
// Selection Utils
// -----------------------------
function within(node, container) {
  if (!node || !container) return false;
  let n = node.nodeType === 3 ? node.parentElement : node;
  while (n) { if (n === container) return true; n = n.parentElement; }
  return false;
}
function getSelectionRangeIfInEditor(editorEl) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!within(range.startContainer, editorEl)) return null;
  return range.cloneRange();
}
function restoreSelection(editorEl, savedRange) {
  if (!savedRange) return;
  const sel = window.getSelection();
  if (!sel) return;
  editorEl.focus();
  sel.removeAllRanges();
  sel.addRange(savedRange);
}
function applyInlineStyle(styleObj) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (range.collapsed) {
    const span = document.createElement('span');
    Object.entries(styleObj).forEach(([k, v]) => (span.style[k] = v));
    span.appendChild(document.createTextNode('\u200b'));
    range.insertNode(span);
    const newRange = document.createRange();
    newRange.setStart(span.firstChild, 1);
    newRange.setEnd(span.firstChild, 1);
    sel.removeAllRanges();
    sel.addRange(newRange);
    return;
  }
  const span = document.createElement('span');
  Object.entries(styleObj).forEach(([k, v]) => (span.style[k] = v));
  range.surroundContents(span);
}

// -----------------------------
// Exec Utils
// -----------------------------
function exec(cmd, val = null) {
  try { document.execCommand('styleWithCSS', false, true); } catch {}
  document.execCommand(cmd, false, val);
}

// -----------------------------
// Component
// -----------------------------
export default function OnePagerRibbon({ editorRef, pageSize, onPageSize }) {
  const [font, setFont] = useState('Calibri');
  const [size, setSize] = useState(16);
  const savedRangeRef = useRef(null);

  useEffect(() => {
    function syncFromSelection() {
      const ed = editorRef?.current;
      const sel = window.getSelection();
      if (!sel || !ed || sel.rangeCount === 0 || !within(sel.anchorNode, ed)) return;
      let el = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
      const cs = window.getComputedStyle(el);
      const fam = (cs.fontFamily || '').split(',')[0].replace(/["']/g, '') || 'Calibri';
      const px = parseInt(cs.fontSize, 10) || 16;
      setFont(fam);
      setSize(px);
    }
    document.addEventListener('selectionchange', syncFromSelection);
    return () => document.removeEventListener('selectionchange', syncFromSelection);
  }, [editorRef]);

  function cacheSelection() {
    const ed = editorRef?.current;
    if (!ed) return;
    savedRangeRef.current = getSelectionRangeIfInEditor(ed);
  }

  function setFontFamily(f) {
    const ed = editorRef?.current;
    restoreSelection(ed, savedRangeRef.current);
    try { exec('fontName', f); } catch { applyInlineStyle({ fontFamily: f }); }
    setFont(f);
    ed?.focus?.();
  }
  function setFontSizePx(px) {
    const ed = editorRef?.current;
    restoreSelection(ed, savedRangeRef.current);
    applyInlineStyle({ fontSize: `${px}px` });
    setSize(px);
    ed?.focus?.();
  }
  function incDecFont(delta) {
    const next = Math.min(96, Math.max(8, size + delta));
    setFontSizePx(next);
  }
  function color(c)     { const ed = editorRef?.current; restoreSelection(ed, savedRangeRef.current); try { exec('foreColor', c); }   catch { applyInlineStyle({ color: c }); }           ed?.focus?.(); }
  function highlight(c) { const ed = editorRef?.current; restoreSelection(ed, savedRangeRef.current); try { exec('hiliteColor', c); } catch { applyInlineStyle({ backgroundColor: c }); } ed?.focus?.(); }
  function block(tag)   { const ed = editorRef?.current; restoreSelection(ed, savedRangeRef.current); exec('formatBlock', tag); ed?.focus?.(); }
  function list(type)   { const ed = editorRef?.current; restoreSelection(ed, savedRangeRef.current); exec(type === 'ol' ? 'insertOrderedList' : 'insertUnorderedList'); ed?.focus?.(); }
  function align(which) { const ed = editorRef?.current; restoreSelection(ed, savedRangeRef.current); exec(`justify${which}`); ed?.focus?.(); }
  function indent()     { const ed = editorRef?.current; restoreSelection(ed, savedRangeRef.current); exec('indent'); ed?.focus?.(); }
  function outdent()    { const ed = editorRef?.current; restoreSelection(ed, savedRangeRef.current); exec('outdent'); ed?.focus?.(); }
  function clearFormat(){ const ed = editorRef?.current; restoreSelection(ed, savedRangeRef.current); exec('removeFormat'); ed?.focus?.(); }
  function link()       { const ed = editorRef?.current; restoreSelection(ed, savedRangeRef.current); const url = prompt('Link URL'); if (!url) return; exec('createLink', url); ed?.focus?.(); }
  function unlink()     { const ed = editorRef?.current; restoreSelection(ed, savedRangeRef.current); exec('unlink'); ed?.focus?.(); }
  function insertHR()   { const ed = editorRef?.current; restoreSelection(ed, savedRangeRef.current); exec('insertHorizontalRule'); ed?.focus?.(); }
  function insertDate() { const ed = editorRef?.current; restoreSelection(ed, savedRangeRef.current); document.execCommand('insertText', false, new Date().toLocaleString()); ed?.focus?.(); }
  function image()      { const ed = editorRef?.current; restoreSelection(ed, savedRangeRef.current); const url = prompt('Image URL'); if (!url) return; exec('insertImage', url); ed?.focus?.(); }

  return (
    <div style={bar} onMouseDown={cacheSelection} aria-label='Word-style editor ribbon'>
      <style>
        {`
          select.onepager-select option { color: #111 !important; background: #fff !important; text-align: center; }
          select.onepager-select { text-align-last: center; }
        `}
      </style>

      <div style={group} aria-label='History'>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>exec('undo')} title='Undo (Ctrl+Z)'>Undo</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>exec('redo')} title='Redo (Ctrl+Y)'>Redo</button>
      </div>

      <div style={group} aria-label='Font'>
        <select
          className='onepager-select'
          style={{ ...selectBase, minWidth: 160 }}
          value={font}
          onFocus={cacheSelection}
          onChange={e=>setFontFamily(e.target.value)}
          title='Font family'
          aria-label='Font family'
        >
          {FONTS.map(f=>(<option key={f} value={f}>{f}</option>))}
        </select>

        <select
          className='onepager-select'
          style={{ ...selectBase, width: 72 }}
          value={String(size)}
          onFocus={cacheSelection}
          onChange={e=>setFontSizePx(parseInt(e.target.value,10))}
          title='Font size'
          aria-label='Font size'
        >
          {SIZES.map(s=>(<option key={s} value={s}>{s}</option>))}
        </select>

        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>incDecFont(+2)} title='Increase font size'>A▲</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>incDecFont(-2)} title='Decrease font size'>A▼</button>

        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>exec('bold')} title='Bold (Ctrl+B)'>B</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>exec('italic')} title='Italic (Ctrl+I)'><i>I</i></button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>exec('underline')} title='Underline (Ctrl+U)'><u>U</u></button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>exec('strikeThrough')} title='Strikethrough'>S̶</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>exec('superscript')} title='Superscript'>x²</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>exec('subscript')} title='Subscript'>x₂</button>

        <label style={{...btn,padding:0}} title='Font color'>
          <input type='color' style={colorInput} onFocus={cacheSelection} onChange={e=>color(e.target.value)} aria-label='Font color' />
        </label>
        <label style={{...btn,padding:0}} title='Highlight color'>
          <input type='color' style={colorInput} onFocus={cacheSelection} onChange={e=>highlight(e.target.value)} aria-label='Highlight color' />
        </label>
      </div>

      <div style={group} aria-label='Paragraph'>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>block('p')} title='Normal text'>Normal</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>block('h1')} title='Heading 1'>H1</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>block('h2')} title='Heading 2'>H2</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>block('h3')} title='Heading 3'>H3</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={clearFormat} title='Clear formatting'>Clear</button>
      </div>

      <div style={group} aria-label='Lists & Alignment'>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>list('ul')} title='Bulleted list'>• List</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>list('ol')} title='Numbered list'>1. List</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>align('Left')} title='Align left'>⟸</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>align('Center')} title='Align center'>⇔</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>align('Right')} title='Align right'>⟹</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={()=>align('Full')} title='Justify'>≋</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={indent} title='Increase indent'>⇥</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={outdent} title='Decrease indent'>⇤</button>
      </div>

      <div style={groupLast} aria-label='Insert & Page'>
        <select
          className='onepager-select'
          style={{ ...selectBase, minWidth: 140 }}
          value={pageSize}
          onChange={e => onPageSize?.(e.target.value)}
          title='Page size'
          aria-label='Page size'
        >
          <option value='A4'>A4 (210×297)</option>
          <option value='Letter'>Letter (8.5×11)</option>
        </select>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={link} title='Insert link'>Link</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={unlink} title='Remove link'>Unlink</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={insertHR} title='Insert horizontal rule'>HR</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={insertDate} title='Insert current date/time'>Date</button>
        <button style={btn} onMouseDown={e=>e.preventDefault()} onClick={image} title='Insert image by URL'>Image</button>
      </div>
    </div>
  );
}
