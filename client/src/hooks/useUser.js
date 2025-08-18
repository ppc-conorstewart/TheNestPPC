import { useEffect, useState } from 'react';

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/user', {
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
