// src/components/Header.jsx

import { useEffect, useRef, useState } from 'react'
import { resolveApiUrl } from '../api'

export default function Header() {
  const [user, setUser] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const mobileMenuRef = useRef(null)

  // Navigation items - empty as per request
  const navItems = []

  useEffect(() => {
    const stored = localStorage.getItem('flyiq_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) }
      catch { localStorage.removeItem('flyiq_user') }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setScrolled(scrollY > 50)
      let current = ''
      navItems.forEach(item => {
        const el = document.querySelector(item.href)
        if (el) {
          const top = el.offsetTop - 80
          const bottom = top + el.offsetHeight
          if (scrollY >= top && scrollY < bottom) current = item.href
        }
      })
      setActiveSection(current)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const onClickLogin = () => { window.location.href = resolveApiUrl('/auth/discord') }
  const onClickLogout = () => {
    localStorage.removeItem('flyiq_user')
    setUser(null)
    window.location.href = '/'
  }
  const getAvatarUrl = () => {
    if (!user) return ''
    if (user.avatar?.startsWith('http')) return user.avatar
    if (!user.avatar) {
      const idx = parseInt(user.discriminator || '0', 10) % 5
      return `https://cdn.discordapp.com/embed/avatars/${idx}.png`
    }
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
  }

  return (
    <>
      {/* Vertical Divider at left, above all other elements */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '2px',
          height: '100vh',
          background: '#6a7257',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      />
      <header
        id="navbar"
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 font-erbaum"
        style={{
          height: 'calc(2rem + 2px)',        // Header and border included
          minHeight: 'calc(2rem + 2px)',
          maxHeight: 'calc(2rem + 2px)',
          lineHeight: '2rem',
          margin: 0,
          padding: 0,
          border: 'none',
          borderRadius: 0,
          
          boxShadow: 'none',
          background: 'transparent',                // Solid black, covers border
          boxSizing: 'border-box',           // Border is inside the height
        }}
      >
        <div
          className="flex items-center justify-between px-4 h-full w-full relative"
          style={{ minHeight: '2rem', height: '2rem', maxHeight: '2rem', paddingBottom: 0, marginBottom: 0 }}
        >
          {/* Centered Logo */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-auto h-full z-10 select-none pointer-events-none">
            <img
              src="/assets/headerlogo.png"
              alt="Header Logo"
              className="h-[1rem] object-contain"
              style={{
                maxHeight: '1.6rem',
                minHeight: '1.2rem',
                margin: '0 auto',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
              draggable={false}
            />
          </div>
          {/* Right side: User & mobile button */}
          <div className="flex items-center space-x-4 ml-auto">
            <button
              id="mobile-menu-button"
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden flex flex-col justify-between h-4 w-4 p-1"
            >
              <span className="block h-0.5 bg-white"></span>
              <span className="block h-0.5 bg-white"></span>
              <span className="block h-0.5 bg-white"></span>
            </button>
            {/* Desktop auth */}
            <div className="hidden md:flex items-center uppercase space-x-4 text-white">
              {user ? (
                <>
                  <div className="flex items-center bg-transparent border border-[#6a7257] px-2 py-1 rounded-md text-xs">
                    <img
                      src={getAvatarUrl()}
                      alt="Discord Avatar"
                      className="w-4 h-4 rounded-full mr-2 border border-[#6a7257]"
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png' }}
                    />
                    <span className="font-semibold text-xs">{user.username || user.id}</span>
                  </div>
                  <button
                    onClick={onClickLogout}
                    className="bg-gradient-to-r from-[#6a7257] to-[#8a946b] hover:from-[#5f664f] hover:to-[#7e865b] transition font-bold text-white px-2 py-0.5 rounded-md text-xs shadow-lg"
                  >
                    LOG OUT
                  </button>
                </>
              ) : (
                <button
                  onClick={onClickLogin}
                  className="bg-[#6a7257] hover:bg-[#5f664f] transition text-white px-2 py-0.5 rounded-md text-xs"
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          style={{ height: mobileOpen ? `${mobileMenuRef.current?.scrollHeight}px` : '0px' }}
          className="md:hidden overflow-hidden transition-[height] duration-300 bg-black/80 font-erbaum"
        >
          {user && (
            <button
              onClick={onClickLogout}
              className="w-full text-left px-4 py-1 mt-2 bg-gradient-to-r from-[#6a7257] to-[#8a946b] hover:from-[#5f664f] hover:to-[#7e865b] transition font-bold text-white rounded-md text-xs shadow-lg"
            >
              LOG OUT
            </button>
          )}
        </div>
      </header>
    </>
  )
}
