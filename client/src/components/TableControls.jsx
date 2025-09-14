// ==============================
// File: src/components/TableControls.jsx
// ==============================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ==============================
// TABLECONTROLS — THEME CONSTANTS
// ==============================
const COLORS = {
  green: '#6a7257',
  text: '#e6e8df',
  bg: '#000',
  border: '#23251d',
  chip: '#12130f'
};

// ==============================
// TABLECONTROLS — UTILS
// ==============================
function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max));
}
function makePageItems(current, total, maxButtons = 7) {
  if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
  const side = Math.floor((maxButtons - 3) / 2);
  let start = Math.max(2, current - side);
  let end = Math.min(total - 1, current + side);

  const visible = end - start + 1;
  if (visible < side * 2 + 1) {
    const missing = side * 2 + 1 - visible;
    start = Math.max(2, start - Math.max(0, missing - Math.max(0, total - 1 - end)));
    end = Math.min(total - 1, end + Math.max(0, missing - Math.max(0, start - 2)));
  }

  const items = [1];
  if (start > 2) items.push('…');
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push('…');
  items.push(total);
  return items;
}
function useKeyboardNav(enabled, currentPage, totalPages, onPageChange) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowLeft') onPageChange(clamp(currentPage - 1, 1, totalPages));
      if (e.key === 'ArrowRight') onPageChange(clamp(currentPage + 1, 1, totalPages));
      if (e.key === 'Home') onPageChange(1);
      if (e.key === 'End') onPageChange(totalPages);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, currentPage, totalPages, onPageChange]);
}

// ==============================
// TABLECONTROLS — COMPONENT
// ==============================
export default function TableControls({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  rowsPerPage,
  onRowsPerPageChange,
  compact = false,
  sticky = true
}) {
  const [goto, setGoto] = useState('');
  const [internalRpp, setInternalRpp] = useState(rowsPerPage || 15);
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof rowsPerPage === 'number' && rowsPerPage !== internalRpp) {
      setInternalRpp(rowsPerPage);
    }
  }, [rowsPerPage]);

  const setPage = useCallback(
    (p) => onPageChange(clamp(p, 1, totalPages || 1)),
    [onPageChange, totalPages]
  );

  const pageItems = useMemo(
    () => makePageItems(currentPage || 1, totalPages || 1, compact ? 5 : 9),
    [currentPage, totalPages, compact]
  );

  useKeyboardNav(true, currentPage || 1, totalPages || 1, setPage);

  const canPrev = (currentPage || 1) > 1;
  const canNext = (currentPage || 1) < (totalPages || 1);

  const rppOptions = [10, 15, 25, 50, 100];

  const handleGotoSubmit = (e) => {
    e.preventDefault();
    const n = parseInt(String(goto).trim(), 10);
    if (!Number.isNaN(n)) setPage(n);
    setGoto('');
  };

  const barStyle = {
    position: sticky ? 'sticky' : 'static',
    bottom: 0,
    zIndex: 3,
    background: COLORS.bg,
    borderTop: `1px solid ${COLORS.border}`,
    color: COLORS.text
  };

  return (
    <div ref={containerRef} style={barStyle} className="w-full">
      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 p-1"
        style={{ background: COLORS.bg, color: COLORS.text, fontSize: '0.7em' }}
      >
        {/* ============================== */}
        {/* RANGE & META */}
        {/* ============================== */}
        <div className="flex items-center gap-1">
          <div
            className="px-1 py-0.5 rounded"
            style={{ background: COLORS.chip, border: `1px solid ${COLORS.border}` }}
          >
            <span style={{ color: COLORS.text, opacity: 0.9 }}>
              Page {currentPage} of {totalPages}
            </span>
          </div>
          {totalItems > 0 && typeof rowsPerPage === 'number' && (
            <div
              className="px-1 py-0.5 rounded hidden sm:block"
              style={{ background: COLORS.chip, border: `1px solid ${COLORS.border}` }}
            >
              {(() => {
                const start = (currentPage - 1) * rowsPerPage + 1;
                const end = Math.min(currentPage * rowsPerPage, totalItems);
                return (
                  <span style={{ color: COLORS.text, opacity: 0.9 }}>
                    Showing {start}–{end} of {totalItems}
                  </span>
                );
              })()}
            </div>
          )}
        </div>

        {/* ============================== */}
        {/* PAGE SIZE + GOTO */}
        {/* ============================== */}
        <div className="flex items-center gap-1">
          {onRowsPerPageChange && (
            <div className="flex items-center gap-1">
              <label htmlFor="rpp" className="hidden sm:block" style={{ color: COLORS.text, opacity: 0.9 }}>
                Rows/page
              </label>
              <select
                id="rpp"
                value={internalRpp}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setInternalRpp(val);
                  onRowsPerPageChange(val);
                }}
                className="px-1 py-0.5 rounded outline-none"
                style={{ background: COLORS.chip, color: COLORS.text, border: `1px solid ${COLORS.border}` }}
              >
                {rppOptions.map((n) => (
                  <option key={n} value={n} style={{ color: '#000' }}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleGotoSubmit} className="flex items-center gap-1">
            <label htmlFor="goto" className="hidden sm:block" style={{ color: COLORS.text, opacity: 0.9 }}>
              Go to
            </label>
            <input
              id="goto"
              inputMode="numeric"
              pattern="[0-9]*"
              value={goto}
              onChange={(e) => setGoto(e.target.value)}
              className="px-1 py-0.5 rounded w-12 outline-none"
              placeholder="#"
              style={{ background: COLORS.chip, color: COLORS.text, border: `1px solid ${COLORS.border}` }}
            />
            <button
              type="submit"
              className="px-1 py-0.5 rounded"
              style={{ background: COLORS.green, color: '#000', border: `1px solid ${COLORS.green}` }}
              aria-label="Go to page"
              title="Go to page"
            >
              Go
            </button>
          </form>
        </div>

        {/* ============================== */}
        {/* PAGINATION CONTROLS */}
        {/* ============================== */}
        <div className="flex items-center gap-1 md:gap-1.5">
          <button
            onClick={() => setPage(1)}
            disabled={!canPrev}
            className="px-1 py-0.5 rounded"
            style={{ background: COLORS.chip, color: COLORS.text, border: `1px solid ${COLORS.border}`, opacity: canPrev ? 1 : 0.5 }}
            aria-label="First page"
            title="First page (Home)"
          >
            «
          </button>
          <button
            onClick={() => setPage(currentPage - 1)}
            disabled={!canPrev}
            className="px-1 py-0.5 rounded"
            style={{ background: COLORS.chip, color: COLORS.text, border: `1px solid ${COLORS.border}`, opacity: canPrev ? 1 : 0.5 }}
            aria-label="Previous page"
            title="Previous page (←)"
          >
            ‹
          </button>

          <div className="flex items-center">
            {pageItems.map((it, idx) =>
              it === '…' ? (
                <span key={'e' + idx} className="px-1 select-none" style={{ color: COLORS.text, opacity: 0.7 }}>
                  …
                </span>
              ) : (
                <button
                  key={it}
                  onClick={() => setPage(it)}
                  className="px-1 py-0.5 rounded mx-[1px]"
                  aria-current={it === currentPage ? 'page' : undefined}
                  style={{
                    background: it === currentPage ? COLORS.green : COLORS.chip,
                    color: it === currentPage ? '#000' : COLORS.text,
                    border: `1px solid ${it === currentPage ? COLORS.green : COLORS.border}`,
                    fontWeight: it === currentPage ? 800 : 600,
                    minWidth: 28
                  }}
                  title={it === currentPage ? `Page ${it} (current)` : `Go to page ${it}`}
                >
                  {it}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setPage(currentPage + 1)}
            disabled={!canNext}
            className="px-1 py-0.5 rounded"
            style={{ background: COLORS.chip, color: COLORS.text, border: `1px solid ${COLORS.border}`, opacity: canNext ? 1 : 0.5 }}
            aria-label="Next page"
            title="Next page (→)"
          >
            ›
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={!canNext}
            className="px-1 py-0.5 rounded"
            style={{ background: COLORS.chip, color: COLORS.text, border: `1px solid ${COLORS.border}`, opacity: canNext ? 1 : 0.5 }}
            aria-label="Last page"
            title="Last page (End)"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
