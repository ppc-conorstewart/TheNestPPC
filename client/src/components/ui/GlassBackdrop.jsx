// ==============================
// FILE: client/src/components/GlassBackdrop.jsx
// ==============================
import { useEffect, useRef } from 'react';

export default function GlassBackdrop({
  
  blur = 0,
  opacity = 0,           // transparent overlay so particles are visible
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 6;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.02)`;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <>
      
      <div className="glass-vignette" style={{ '--glass-vignette-opacity': opacity }} />
    </>
  );
}
