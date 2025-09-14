// =====================================================
// DocumentRow.jsx — Single Document Row (Favorites • Inline Rename • Centered/Bordered REV Column • Context Menu)
// =====================================================
import { useEffect, useRef, useState } from 'react';
import ContextMenu from './ContextMenu';

export default function DocumentRow({
  doc,
  code,
  title,
  revision,
  revisionStyle,
  revColumnWidth = 88,
  revColumnBorderColor = '#6a7257',
  isSelected,
  theme,
  highlightMatch,
  isFavorite,
  onToggleFavorite,
  onClick,
  onDelete,
  onRename,
  dragHandlers
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(title || '');
  const inputRef = useRef(null);

  function handleContextMenu(e) { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }); }
  function handleCloseContext() { setContextMenu(null); }
  function beginRename() { setContextMenu(null); setRenameValue(title || ''); setIsRenaming(true); }
  function cancelRename() { setIsRenaming(false); setRenameValue(title || ''); }
  async function commitRename() {
    const val = (renameValue || '').trim();
    if (!val) return cancelRename();
    await onRename?.(val);
    setIsRenaming(false);
  }
  useEffect(() => { if (isRenaming) inputRef.current?.focus(); }, [isRenaming]);

  return (
    <div key={doc.id} className='flex items-stretch gap-2' onContextMenu={handleContextMenu}>
      <div style={{ marginLeft: 22, width: 6 }}>
        <div style={{ height: dragHandlers.showAbove ? 6 : 0, background: theme.border, transition: 'height 120ms ease' }} />
      </div>

      <div
        draggable
        onDragStart={dragHandlers.onDragStart}
        onDragOver={dragHandlers.onDragOver}
        onDragLeave={dragHandlers.onDragLeave}
        onDrop={dragHandlers.onDrop}
        className='flex-1'
      >
        <div
          className='text-left'
          onClick={!isRenaming ? onClick : undefined}
          style={{
            paddingTop: 4, paddingBottom: 4, paddingLeft: 8, paddingRight: 8,
            color: '#ffffff',
            background: isSelected ? 'rgba(106,114,87,0.12)' : 'transparent',
            fontSize: 12.5,
            display: 'flex', alignItems: 'center', gap: 10,
            border: isSelected ? '1px solid rgba(106,114,87,0.35)' : '1px solid transparent',
            borderRadius: 8,
            position: 'relative',
            cursor: isRenaming ? 'text' : 'pointer'
          }}
          title={title}
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={() => setShowPreview(false)}
        >
          <span
            onClick={e => { e.stopPropagation(); onToggleFavorite?.(); }}
            style={{ cursor: 'pointer', color: isFavorite ? '#FFD700' : theme.sub, fontSize: 14 }}
          >
            ★
          </span>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0, flex: 1 }}>
            <span style={{ fontWeight: 900, whiteSpace: 'nowrap', color: '#6A7257' }}>
              {highlightMatch(code || doc.l1 || '', '')}
            </span>

            {!isRenaming ? (
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                {highlightMatch(title, '')}
              </span>
            ) : (
              <input
                ref={inputRef}
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') cancelRename(); }}
                onBlur={commitRename}
                className='w-full outline-none'
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '2px 6px',
                  borderRadius: 6,
                  fontSize: 12.5,
                  color: '#ffffff'
                }}
              />
            )}
          </div>

          <span style={{ marginLeft: 'auto', fontSize: 10, color: theme.sub }}>
            {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : '—'}
          </span>
        </div>
      </div>

      <div
        style={{
          width: revColumnWidth,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderLeft: `1px solid ${revColumnBorderColor}`,
          borderRight: `1px solid ${revColumnBorderColor}`
        }}
        title={revision || 'No revision'}
        onClick={() => setShowHistory(v => !v)}
      >
        {revision ? (
          <span
            style={{
              fontSize: 11,
              fontWeight: 900,
              padding: '1px 8px',
              border: '1px solid ' + revisionStyle.border,
              background: revisionStyle.bg,
              color: revisionStyle.color,
              borderRadius: 6,
              textAlign: 'center'
            }}
          >
            {revision}
          </span>
        ) : (
          <span style={{ fontSize: 11, color: theme.sub }}>—</span>
        )}
      </div>

      <div style={{ marginLeft: 22, width: 6 }}>
        <div style={{ height: dragHandlers.showBelow ? 6 : 0, background: theme.border, transition: 'height 120ms ease' }} />
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContext}
          options={[
            { label: 'Open', onClick: () => onClick?.() },
            { label: 'Rename', onClick: beginRename },
            { label: 'Download', onClick: () => {} },
            { label: 'Delete', onClick: () => onDelete?.() }
          ]}
        />
      )}

      {showPreview && !isRenaming && (
        <div
          style={{
            position: 'absolute',
            left: '100%',
            top: 0,
            background: theme.surface,
            color: '#ffffff',
            padding: '6px 10px',
            fontSize: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            zIndex: 50
          }}
        >
          {title}
        </div>
      )}

      {showHistory && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            background: theme.surface,
            color: theme.text,
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            fontSize: 12,
            zIndex: 60,
            padding: 6,
            whiteSpace: 'nowrap'
          }}
        >
          <div>REV-A</div>
          <div>REV-B</div>
          <div>REV-C</div>
        </div>
      )}
    </div>
  );
}
