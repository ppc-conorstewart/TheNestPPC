import { useEffect, useState } from 'react';

export default function useMediaQuery(query) {
  const getMatch = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    const matchMedia = typeof window !== 'undefined' ? window.matchMedia(query) : null;
    if (!matchMedia) return undefined;

    const handler = (event) => setMatches(event.matches);
    setMatches(matchMedia.matches);

    matchMedia.addEventListener?.('change', handler);
    return () => matchMedia.removeEventListener?.('change', handler);
  }, [query]);

  return matches;
}
