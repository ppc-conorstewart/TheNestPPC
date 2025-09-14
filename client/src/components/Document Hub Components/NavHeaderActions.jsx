// =====================================================
// NavHeaderActions.jsx — LeftNavPanel Header Actions (Create • Upload • Expand • Collapse) — Compact Buttons
// Sections: Imports • Props • Component
// =====================================================
import { useState } from 'react';

// =====================================================
// PROPS
// =====================================================
// theme: { text, sub, surface, ... }
// ROOTS: string[] of category keys
// CATEGORY_LABELS: { [code]: label }
// onCreate: ({ l1: string }) => void
// onOpenUpload: () => void
// onExpandAll: () => void
// onCollapseAll: () => void
// =====================================================

export default function NavHeaderActions({
  theme,
  ROOTS,
  CATEGORY_LABELS,
  onCreate,
  onOpenUpload,
  onExpandAll,
  onCollapseAll
}) {
  const [newOpen, setNewOpen] = useState(false);

  return (
    <div className='flex items-center gap-2 mt-3 mb-2 justify-center relative'>
      {/* ================= Create ================= */}
      <div className='relative'>
        <button
          type='button'
          className='px-2 py-[2px] text-[10px] font-extrabold'
          style={{ color: theme?.text, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
          onClick={() => setNewOpen(v => !v)}
          title='Create new document'
        >
          CREATE
        </button>

        {newOpen ? (
          <div
            className='absolute left-0 mt-2 z-10'
            style={{ background: theme?.surface, minWidth: 220, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}
          >
            <div className='px-3 py-2 text-[10px]' style={{ color: theme?.sub }}>Choose category</div>
            {ROOTS.map(cat => (
              <button
                key={cat}
                type='button'
                className='w-full text-left px-3 py-2 text-[11px]'
                style={{ color: theme?.text, background: 'transparent' }}
                onClick={() => { setNewOpen(false); onCreate?.({ l1: cat }); }}
                title={CATEGORY_LABELS[cat]}
              >
                {cat} <span style={{ fontSize: 10, color: '#ffffff' }}>({CATEGORY_LABELS[cat]})</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* ================= Upload ================= */}
      <button
        type='button'
        className='px-2 py-[2px] text-[10px] font-extrabold'
        style={{ color: theme?.text, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
        onClick={onOpenUpload}
        title='Upload an existing file'
      >
        UPLOAD
      </button>

      {/* ================= Expand / Collapse ================= */}
      <button
        type='button'
        className='px-2 py-[2px] text-[10px] font-extrabold'
        style={{ color: theme?.text, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
        onClick={onExpandAll}
        title='Expand all categories'
      >
        EXPAND
      </button>

      <button
        type='button'
        className='px-2 py-[2px] text-[10px] font-extrabold'
        style={{ color: theme?.text, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
        onClick={onCollapseAll}
        title='Collapse all categories'
      >
        COLLAPSE
      </button>
    </div>
  );
}
