// src/components/Layout.jsx

import { useLocation } from 'react-router-dom'
import Footer from './Footer'
import Sidebar from './Sidebar'

const MODULE_PATHS = [
  '/fly-hq',
  '/fly-hq-tools',
  '/job-planner',
  '/workorder-hub',
  '/sourcing',
  '/documentation',
  '/projects',
  '/pad-overwatch',
]

// ==============================
// LAYOUT • ROOT CONTAINER
// ==============================
export default function Layout({ children, hideSidebar }) {
  const { pathname } = useLocation()
  const isFlyIQ = pathname.startsWith('/fly-iq')
  const showSidebar =
    !isFlyIQ && MODULE_PATHS.some(p => pathname.startsWith(p)) && !hideSidebar

  return (
    <div
      className="min-h-screen flex"
      style={{
        minHeight: '100vh',
        flexDirection: 'row',
        width: '100%',                 // prevent 100vw overflow
        background: 'transparent',
        overflowX: 'hidden'            // hard-stop any horizontal scroll
      }}
    >
      {showSidebar && <Sidebar />}

      {/* ============================== */}
      {/* LAYOUT • PAGE COLUMN           */}
      {/* ============================== */}
      <div
        className="flex flex-col flex-1 transition-margin duration-300 relative"
        style={{
          minHeight: 0,
          marginLeft: showSidebar ? '56px' : '0px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
          overflowX: 'hidden'          // shield column from micro overflows
        }}
      >
        {/* ============================== */}
        {/* LAYOUT • MAIN CONTENT         */}
        {/* ============================== */}
        <main
          className="flex-1 w-full overflow-y-auto custom-scrollbar"
          style={{
            flex: '1 1 auto',
            background: 'transparent',
            width: '100%',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 2,
            minHeight: 0,
            overflowX: 'hidden'        // no horizontal scrollbar in main
          }}
        >
          {children}
        </main>

        {/* ============================== */}
        {/* LAYOUT • FOOTER               */}
        {/* ============================== */}
        <Footer />
      </div>

      {/* ============================== */}
      {/* LAYOUT • INLINE STYLES         */}
      {/* ============================== */}
      <style>{`
        aside.group:hover ~ div.flex-1 {
          margin-left: 256px !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 9px;
          background: rgba(0,0,0,0.10);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3c4133;
          border-radius: 8px;
          border: 1.5px solid #6a7257;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #494f3c;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3c4133 #23282b;
        }
      `}</style>
    </div>
  )
}
