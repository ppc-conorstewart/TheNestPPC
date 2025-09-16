// ==============================
// FILE: client/src/components/Layout.jsx
// ==============================

import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import Sidebar from './Sidebar';

const MODULE_PATHS = [
  '/fly-hq',
  '/fly-hq-tools',
  '/job-planner',
  '/workorder-hub',
  '/sourcing',
  '/documentation',
  '/projects',
  '/pad-overwatch'
];

// ==============================
// COMPONENT
// ==============================
export default function Layout({ children, hideSidebar }) {
  const { pathname } = useLocation();
  const isFlyIQ = pathname.startsWith('/fly-iq');
  const showSidebar = !isFlyIQ && MODULE_PATHS.some(p => pathname.startsWith(p)) && !hideSidebar;

  const mq = useMemo(() => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 1024px)') : null), []);
  const [isMobile, setIsMobile] = useState(() => (mq ? mq.matches : false));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!mq) return;
    const handler = e => {
      setIsMobile(e.matches);
      if (!e.matches) setIsSidebarOpen(false);
    };
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, [mq]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isMobile && isSidebarOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }, [isMobile, isSidebarOpen]);

  return (
    <div
      className='min-h-screen flex'
      style={{ minHeight: '100vh', flexDirection: 'row', width: '100%', background: 'transparent', overflowX: 'hidden' }}
    >
      {showSidebar && <Sidebar open={isMobile ? isSidebarOpen : false} />}

      <div
        className='flex flex-col flex-1 transition-margin duration-300 relative'
        style={{
          minHeight: 0,
          marginLeft: showSidebar && !isMobile ? '56px' : '0px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
          overflowX: 'hidden'
        }}
      >
        <main
          className='flex-1 w-full overflow-y-auto custom-scrollbar'
          style={{
            flex: '1 1 auto',
            background: 'transparent',
            width: '100%',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 2,
            minHeight: 0,
            overflowX: 'hidden'
          }}
        >
          {children}
        </main>
        <Footer />
      </div>

      {showSidebar && isMobile && (
        <>
          <button
            type='button'
            aria-label='Toggle menu'
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen(v => !v)}
            className='fixed top-3 left-3 z-40 rounded-md border border-[#6a7257] bg-black/60 backdrop-blur px-3 py-2'
            style={{ lineHeight: 0 }}
          >
            <span aria-hidden='true' className='block w-6 h-0.5 bg-white mb-1' />
            <span aria-hidden='true' className='block w-6 h-0.5 bg-white mb-1' />
            <span aria-hidden='true' className='block w-6 h-0.5 bg-white' />
          </button>

          {isSidebarOpen && (
            <div className='fixed inset-0 z-20 bg-black/50 backdrop-blur-sm' onClick={() => setIsSidebarOpen(false)} />
          )}
        </>
      )}

      <style>{`
        aside.group:hover ~ div.flex-1 { margin-left: 256px !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 9px; background: rgba(0,0,0,0.10); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4133; border-radius: 8px; border: 1.5px solid #6a7257; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #494f3c; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #3c4133 #23282b; }
      `}</style>
    </div>
  );
}
