// ==============================
// FILE: client/src/hooks/useUser.js
// SECTIONS: Imports • Hook
// ==============================

import { useEffect, useState } from 'react';
// ---------- Imports: API Resolver ----------
import { resolveApiUrl } from '../api';
// ---------- Imports: Local Discord User Fallback ----------
import { getStoredDiscordUser } from '../utils/currentUser';

// ==============================
// SECTION: Hook
// ==============================
export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let didCancel = false;

    const trySet = (val) => {
      if (!didCancel) setUser(val || null);
    };

    const load = async () => {
      try {
        const res = await fetch(resolveApiUrl('/api/user'), { credentials: 'include' });
        if (!res.ok) {
          // 401 or any non-OK: fall back to locally stored Discord user (AuthListener)
          const local = getStoredDiscordUser();
          return trySet(local || null);
        }
        const data = await res.json().catch(() => null);
        // Accept either { id, ... } OR { user: { id, ... } }
        const normalized = data && (data.id ? data : (data.user?.id ? data.user : null));
        if (normalized) return trySet(normalized);

        // If shape is unexpected, fall back to local
        const local = getStoredDiscordUser();
        return trySet(local || null);
      } catch (err) {
        const local = getStoredDiscordUser();
        return trySet(local || null);
      }
    };

    load();
    return () => {
      didCancel = true;
    };
  }, []);

  return { user };
}
