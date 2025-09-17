import { useEffect, useState } from 'react';
import { resolveApiUrl } from '../api'

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(resolveApiUrl('/api/user'), {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setUser(data);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  return { user };
}
