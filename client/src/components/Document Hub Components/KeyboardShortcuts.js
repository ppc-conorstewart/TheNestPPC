// =====================================================
// KeyboardShortcuts.js — Custom Hook for Keyboard Navigation & Shortcuts
// =====================================================
import { useEffect } from 'react';

export default function useKeyboardShortcuts({
  onUp,
  onDown,
  onEnter,
  onDelete,
  onFocusSearch,
  enable = true
}) {
  useEffect(() => {
    if (!enable) return;

    function isTypingInInput(target) {
      if (!target) return false;
      const tag = (target.tagName || '').toLowerCase();
      const editable = target.getAttribute && target.getAttribute('contenteditable');
      return tag === 'input' || tag === 'textarea' || editable === '' || editable === 'true';
    }

    function handleKey(e) {
      if (isTypingInInput(e.target)) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUp?.();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onDown?.();
      } else if (e.key === 'Enter') {
        onEnter?.();
      } else if (e.key === 'Delete' || (e.shiftKey && e.key.toLowerCase() === 'delete')) {
        onDelete?.();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        if (onFocusSearch) {
          e.preventDefault();
          onFocusSearch();
        }
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onUp, onDown, onEnter, onDelete, onFocusSearch, enable]);
}
