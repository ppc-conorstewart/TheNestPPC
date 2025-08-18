// ==============================
// UI/Visual • GlassBackdrop.jsx
// Full-page cosmic image background with subtle vignette & parallax
// ==============================
import { useEffect, useRef } from 'react';

export default function GlassBackdrop({
  image = '/assets/dark-bg.png', // updated to match public assets path
  blur = 0,                                  // no blur on the bg itself (glass lives above)
  opacity = 0.82,                            // darkness overlay
}) {
  const ref = useRef(null);

  useEffect(() => {
    // lightweight parallax
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
      <div
        ref={ref}
        className="glass-bg"
        style={{
          '--glass-bg-url': `url("${process.env.PUBLIC_URL}/assets/dark-bg.png")`,
          '--glass-bg-blur': `${blur}px`,
        }}
      />
      <div className="glass-vignette" style={{ '--glass-vignette-opacity': opacity }} />
    </>
  );
}
