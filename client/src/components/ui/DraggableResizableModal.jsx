// ===============================================
// File: client/src/components/ui/DraggableResizableModal.jsx
// ===============================================

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function DraggableResizableModal({
  isOpen,
  onClose,
  children,
  modalId = 'modal',
  title = '',
  showBackdrop = true,
  closeOnBackdrop = true,
  initialW = 600,
  initialH = 420,
  minW = 420,
  minH = 280,
  maxW = 1600,
  maxH = 1000
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: initialW, h: initialH });
  const drag = useRef({ active: false, dx: 0, dy: 0 });
  const rez = useRef({ active: false, sx: 0, sy: 0, sw: initialW, sh: initialH });
  const overlayRef = useRef(null);
  const shellRef = useRef(null);
  const portalElRef = useRef(null);

  const key = `drm:${modalId}`;
  const HEADER_H = 40;

  useEffect(() => {
    if (!isOpen) return;
    let el = document.getElementById('__nest_modal_root__');
    if (!el) {
      el = document.createElement('div');
      el.id = '__nest_modal_root__';
      document.body.appendChild(el);
    }
    portalElRef.current = el;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.min(Math.max(saved.w || initialW, minW), Math.min(maxW, vw - 24));
      const h = Math.min(Math.max(saved.h || initialH, minH), Math.min(maxH, vh - 24));
      const x = Math.min(Math.max(saved.x ?? Math.floor((vw - w) / 2), 0), Math.max(0, vw - w));
      const y = Math.min(Math.max(saved.y ?? Math.floor((vh - h) / 2), 0), Math.max(0, vh - h));
      setSize({ w, h });
      setPos({ x, y });
    } catch {
      const vw = window.innerWidth, vh = window.innerHeight;
      const x = Math.floor((vw - initialW) / 2);
      const y = Math.floor((vh - initialH) / 2);
      setPos({ x: Math.max(0, x), y: Math.max(0, y) });
      setSize({ w: initialW, h: initialH });
    }
  }, [isOpen, key, initialW, initialH, minW, minH, maxW, maxH]);

  useEffect(() => {
    function onMove(e) {
      if (drag.current.active) {
        const vw = window.innerWidth, vh = window.innerHeight;
        const nx = Math.min(Math.max(e.clientX - drag.current.dx, 0), Math.max(0, vw - size.w));
        const ny = Math.min(Math.max(e.clientY - drag.current.dy, 0), Math.max(0, vh - size.h));
        setPos({ x: nx, y: ny });
      } else if (rez.current.active) {
        const vw = window.innerWidth, vh = window.innerHeight;
        const dw = e.clientX - rez.current.sx;
        const dh = e.clientY - rez.current.sy;
        const w = Math.min(Math.max(rez.current.sw + dw, minW), Math.min(maxW, vw - pos.x - 8));
        const h = Math.min(Math.max(rez.current.sh + dh, minH), Math.min(maxH, vh - pos.y - 8));
        setSize({ w, h });
      }
    }
    function onUp() {
      if (drag.current.active || rez.current.active) {
        drag.current.active = false;
        rez.current.active = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        try { localStorage.setItem(key, JSON.stringify({ ...pos, ...size })); } catch {}
      }
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mouseleave', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mouseleave', onUp);
    };
  }, [pos, size, key, minW, minH, maxW, maxH]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const pressedOnBackdrop = useRef(false);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => setArmed(true), 160);
    return () => clearTimeout(t);
  }, [isOpen]);

  if (!isOpen || !portalElRef.current) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1000]"
      style={{ background: showBackdrop ? 'rgba(0,0,0,0.6)' : 'transparent' }}
      onMouseDown={(e) => {
        if (!closeOnBackdrop || !armed) return;
        pressedOnBackdrop.current = (e.target === overlayRef.current);
      }}
      onMouseUp={(e) => {
        if (!closeOnBackdrop || !armed) return;
        if (pressedOnBackdrop.current && e.target === overlayRef.current) onClose?.();
        pressedOnBackdrop.current = false;
      }}
    >
      <div
        ref={shellRef}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute bg-black border border-[#6a7257] rounded-xl shadow-2xl overflow-hidden"
        style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
      >
        {/* ============================== DRAG HANDLE ============================== */}
        <div
          className="w-full"
          style={{
            height: HEADER_H,
            cursor: 'grab',
            background: 'linear-gradient(180deg, rgba(106,114,87,0.18), rgba(0,0,0,0.0))'
          }}
          onMouseDown={(e) => {
            drag.current.active = true;
            drag.current.dx = e.clientX - pos.x;
            drag.current.dy = e.clientY - pos.y;
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'grabbing';
          }}
        />
        {/* ============================== TITLE / CLOSE ============================== */}
        {title ? (
          <div className="absolute left-1/2 -translate-x-1/2 top-2 text-[15px] font-bold tracking-wide text-white/90 pointer-events-none">
            {title}
          </div>
        ) : null}
        <button
          onClick={onClose}
          className="absolute right-3 top-1.5 text-2xl leading-none font-bold text-[#6a7257] hover:text-red-500"
          aria-label="Close"
        >
          ×
        </button>

        {/* ============================== CONTENT (FILLS REMAINING HEIGHT) ============================== */}
        <div
          className="w-full"
          style={{
            height: `calc(100% - ${HEADER_H}px)`,
            overflow: 'hidden'
          }}
        >
          {children}
        </div>

        {/* ============================== RESIZE HANDLE ============================== */}
        <div
          onMouseDown={(e) => {
            rez.current.active = true;
            rez.current.sx = e.clientX;
            rez.current.sy = e.clientY;
            rez.current.sw = size.w;
            rez.current.sh = size.h;
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'se-resize';
          }}
          className="absolute"
          style={{
            right: 0,
            bottom: 0,
            width: 18,
            height: 18,
            cursor: 'se-resize',
            background:
              'linear-gradient(135deg, transparent 50%, rgba(106,114,87,0.8) 50%), linear-gradient(45deg, transparent 50%, rgba(106,114,87,0.35) 50%)'
          }}
          title="Resize"
        />
      </div>
    </div>,
    portalElRef.current
  );
}
