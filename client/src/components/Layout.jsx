// src/components/Layout.jsx

import { useLocation } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import Sidebar from './Sidebar'

const MODULE_PATHS = [
  '/fly-hq',
  '/fly-hq-tools',
  '/job-planner',
  '/workorder-hub',
  '/sourcing',
  '/analytics',
  '/projects',
  '/pad-overwatch',
]

const HEADER_HEIGHT = 36
const HEADER_BORDER = 0
const FOOTER_HEIGHT = 28

export default function Layout({ children, hideSidebar }) {
  const { pathname } = useLocation()
  const isFlyIQ = pathname.startsWith("/fly-iq")
  const showSidebar = !isFlyIQ && MODULE_PATHS.some(p => pathname.startsWith(p)) && !hideSidebar

  return (
    <div
      className="min-h-screen flex"
      style={{
        minHeight: '100vh',
        flexDirection: 'row',
        width: '100vw',
        background: 'transparent', // let GlassBackdrop show through
      }}
    >
      {showSidebar && <Sidebar />}
      <div
        className="flex flex-col flex-1 min-h-screen transition-margin duration-300 relative"
        style={{
          minHeight: '100vh',
          marginLeft: showSidebar ? '56px' : '0px',
          paddingTop: HEADER_HEIGHT + HEADER_BORDER,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent', // let GlassBackdrop show through
        }}
      >
        <Header />
        <main
          className="flex-1 w-full overflow-y-auto custom-scrollbar"
          style={{
            minHeight: 0, // Let flexbox handle sizing
            background: 'transparent', // let GlassBackdrop show through
            width: '100%',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 2, // ensure content stacks above backdrop
          }}
        >
          {children}
        </main>
        <Footer />
      </div>
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
