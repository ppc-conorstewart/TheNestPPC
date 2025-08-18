// ===========================
// ScaleToFit.jsx
// ===========================
//
// PURPOSE
// - Auto-scales its children so the whole content always fits inside the
//   available container (no vertical or horizontal scrollbars).
// - Preserves your existing layout/sizing; only applies a CSS transform.
// - Reacts to container or content size changes via ResizeObserver.
//
// USAGE
// <ScaleToFit className="w-full flex-1 min-h-0">
//   <YourContent />
// </ScaleToFit>
//
// NOTES
// - Keeps transform-origin at top-left for predictable layout.
// - Caps scale between minScale and maxScale (default maxScale=1 so it never upscales).
// - Keeps headers/text crisp by letting you choose *what* you wrap (e.g., wrap only the table area).

import { useLayoutEffect, useRef, useState } from "react";

// ===========================
// Component
// ===========================
export default function ScaleToFit({
  children,
  className = "",
  style = {},
  minScale = 0.5,
  maxScale = 1,
}) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    let rafId;

    const measure = () => {
      // Temporarily remove transform to read the natural size.
      const prevTransform = content.style.transform;
      content.style.transform = "none";

      // Use scrollWidth/scrollHeight to capture full intrinsic size.
      const naturalWidth =
        Math.max(content.scrollWidth, content.offsetWidth, 1);
      const naturalHeight =
        Math.max(content.scrollHeight, content.offsetHeight, 1);

      const cw = Math.max(container.clientWidth, 1);
      const ch = Math.max(container.clientHeight, 1);

      // Compute best-fit scale; clamp between min and max.
      let s = Math.min(cw / naturalWidth, ch / naturalHeight);
      if (!isFinite(s) || s <= 0) s = 1;
      s = Math.max(minScale, Math.min(maxScale, s));

      setScale(s);

      // Restore previous transform (React will re-apply with new state).
      content.style.transform = prevTransform;
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    };

    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(container);
    ro.observe(content);

    // Initial measure
    scheduleMeasure();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [minScale, maxScale]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        ref={contentRef}
        style={{
          // Scale from the top-left so layout remains predictable.
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          // Ensure intrinsic measurement uses the content's own width.
          display: "inline-block",
          width: "max-content",
          willChange: "transform",
          // Avoid sub-pixel blur on borders/text when scaled.
          // (GPU hint; harmless if unsupported)
          backfaceVisibility: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
