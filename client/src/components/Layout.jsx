// ==============================
// FILE: client/src/components/Layout.jsx
// ==============================

// ==============================
// SECTION: Imports
// ==============================
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

// ==============================
// SECTION: Constants
// ==============================
const MODULE_PATHS = [
  '/fly-hq',
  '/fly-hq-tools',
  '/job-planner',
  '/workorder-hub',
  '/sourcing',
  '/documentation',
  '/projects',
  '/pad-overwatch'
]

// ==============================
// SECTION: Component
// ==============================
export default function Layout({ children, hideSidebar }) {
  const { pathname } = useLocation()
  const isFlyIQ = pathname.startsWith('/fly-iq')
  const showSidebar = !isFlyIQ && MODULE_PATHS.some(p => pathname.startsWith(p)) && !hideSidebar

  const mq = useMemo(() => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 1024px)') : null), [])
  const [isMobile, setIsMobile] = useState(() => (mq ? mq.matches : false))
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!mq) return
    const handler = e => {
      setIsMobile(e.matches)
      if (!e.matches) setIsSidebarOpen(false)
    }
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [mq])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (isMobile && isSidebarOpen) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [isMobile, isSidebarOpen])

  return (
    <div
      className='min-h-screen flex'
      style={{
        minHeight: '100svh',
        flexDirection: isMobile ? 'column' : 'row',
        width: '100%',
        background: 'transparent',
        overflowX: 'hidden',
        overflowY: 'auto'
      }}
    >
      {showSidebar && <Sidebar open={isMobile ? isSidebarOpen : false} onToggle={() => setIsSidebarOpen(v => !v)} />}

      <div
        className='flex flex-col flex-1 transition-margin duration-300 relative'
        style={{
          minHeight: 0,
          marginLeft: showSidebar && !isMobile ? '56px' : '0px',
          width: '100%',
          overflow: 'visible'
        }}
      >
        <div className='flex-1 w-full' style={{ minHeight: '100%', position: 'relative' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
