// =====================================================
// CategorySection.jsx — Category Section (Collapsible • Drag/Drop Upload • Document Rows • Inline Rename)
// =====================================================
import { useRef, useState } from 'react';
import DocumentRow from './DocumentRow';

export default function CategorySection({
  category,
  docs,
  isOpen,
  contentHeight,
  sectionRef,
  toggleOpen,
  theme,
  bracketColor,
  highlightMatch,
  splitCodeAndTitle,
  getRevision,
  revColor,
  selectedId,
  onSelect,
  onToggleFavorite,
  favorites,
  dragging,
  overTarget,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDeleteClick,
  onUploadToCategory,
  revColumnWidth,
  revColumnBorderColor,
  onRename
}) {
  const headerRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOverHeader(e) { e.preventDefault(); setIsDragOver(true); }
  function handleDragLeaveHeader() { setIsDragOver(false); }
  function handleDropHeader(e) {
    e.preventDefault(); setIsDragOver(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files?.length) onUploadToCategory?.(files);
  }

  function stripExt(name = '') {
    return String(name).replace(/\.(pdf|docx?|xlsx?|pptx|csv|txt)$/i, '');
  }

  return (
    <div className='mb-1'>
      <div
        ref={headerRef}
        className='w-full text-left flex items-center gap-2 px-2 py-1 cursor-pointer select-none'
        onClick={toggleOpen}
        onDragOver={handleDragOverHeader}
        onDragLeave={handleDragLeaveHeader}
        onDrop={handleDropHeader}
        style={{
          marginLeft: 8,
          color: '#6A7257',
          background: isDragOver ? 'rgba(106,114,87,0.12)' : 'transparent',
          borderRadius: 6,
          border: isDragOver ? '1px dashed rgba(106,114,87,0.55)' : '1px solid transparent',
          transition: 'all 160ms ease'
        }}
        title={category.label}
      >
        <span className='inline-block transition-transform' style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 180ms ease' }}>›</span>
        <span className='text-sm font-extrabold'>
          {category.code}{' '}
          <span style={{ fontSize: 11, color: bracketColor }}>({category.label})</span>
        </span>
      </div>

      <div style={{ overflow: 'hidden', transition: 'max-height 260ms ease', maxHeight: isOpen ? contentHeight + 12 : 0 }}>
        <div ref={sectionRef} className='mt-0.5'>
          {(docs || []).map(doc => {
            const { code, cleanTitle } = splitCodeAndTitle(doc.title, doc.code);
            const rev = getRevision(doc);
            const rc = revColor(rev);
            const isSelected = selectedId === doc.id;

            return (
              <DocumentRow
                key={doc.id}
                doc={doc}
                code={code}
                title={stripExt(cleanTitle)}
                revision={rev}
                revisionStyle={rc}
                revColumnWidth={revColumnWidth}
                revColumnBorderColor={revColumnBorderColor}
                isSelected={isSelected}
                theme={theme}
                highlightMatch={highlightMatch}
                isFavorite={favorites?.has(doc.id)}
                onToggleFavorite={() => onToggleFavorite?.(doc.id)}
                onClick={() => onSelect?.(doc.id)}
                onDelete={() => onDeleteClick?.(doc.id)}
                onRename={(newTitle) => onRename?.(doc.id, newTitle)}
                dragHandlers={{
                  onDragStart: e => onDragStart?.(e, doc.id, category.code),
                  onDragOver: e => onDragOver?.(e, doc.id, category.code),
                  onDragLeave: () => onDragLeave?.(),
                  onDrop: e => onDrop?.(e, doc.id, category.code),
                  showAbove:
                    overTarget &&
                    overTarget.id === doc.id &&
                    overTarget.cat === category.code &&
                    overTarget.pos === 'above',
                  showBelow:
                    overTarget &&
                    overTarget.id === doc.id &&
                    overTarget.cat === category.code &&
                    overTarget.pos === 'below'
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
