// =====================================================
// ContextMenu.jsx — Right-Click Context Menu for Documents
// =====================================================
import { useEffect } from 'react';

export default function ContextMenu({ x, y, options, onClose }) {
  useEffect(() => {
    function handleClickOutside() {
      onClose?.();
    }
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 9999,
        background: '#0f110d',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 6,
        padding: '4px 0',
        minWidth: 140,
        color: '#e1e5d0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
      }}
    >
      {options.map((opt, idx) => (
        <div
          key={idx}
          onClick={() => {
            opt.onClick?.();
            onClose?.();
          }}
          style={{
            padding: '6px 12px',
            fontSize: 13,
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.background = 'rgba(106,114,87,0.25)')
          }
          onMouseLeave={e =>
            (e.currentTarget.style.background = 'transparent')
          }
        >
          {opt.label}
        </div>
      ))}
    </div>
  );
}
