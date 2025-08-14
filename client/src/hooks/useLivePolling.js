// ==============================
// src/hooks/useLivePolling.js
// ==============================
import { useEffect, useRef } from 'react';

// ==============================
// Live Polling Hook (dropdown-safe)
// - Pauses polling while any react-select menu is open
// - Skips ticks when the tab is hidden
// - Uses a ref to avoid stale closures
// ==============================
export function useLivePolling(callback, interval = 5000) {
  const cbRef = useRef(callback);
  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const G = typeof window !== 'undefined' ? window : globalThis;

    const tick = () => {
      const anyMenuOpen = Number(G.__palomaMenuOpenAny || 0) > 0;
      const hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
      if (!anyMenuOpen && !hidden) {
        cbRef.current?.();
      }
    };

    // Initial tick (respects open-menu & visibility)
    tick();

    const timer = setInterval(tick, interval);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Kick a tick when returning to the tab (if no menus are open)
        const anyMenuOpen = Number(G.__palomaMenuOpenAny || 0) > 0;
        if (!anyMenuOpen) cbRef.current?.();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [interval]);
}
