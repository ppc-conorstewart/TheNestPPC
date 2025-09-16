// ==============================
// FILE: src/LandingPage.jsx
// ==============================

import { useEffect, useState } from 'react';
import BackgroundFX from './components/BackgroundFX';

// ==============================
// ======= BRAND ASSETS =========
// ==============================
const flyIqLogo = '/assets/logo.png';
const flyHqLogo = '/assets/flyhq-logo.png';
const flyBaseLogo = '/assets/FLY-BASE.png';

// ==============================
// ========== APP ===============
// ==============================
export default function LandingPage() {
  const [user, setUser] = useState(null);

  // ==============================
  // ======== AUTH BOOT ==========
  // ==============================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userData = params.get('user');
    if (userData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userData));
        setUser(parsed);
        localStorage.setItem('flyiq_user', JSON.stringify(parsed));
        window.history.replaceState({}, document.title, '/');
      } catch {}
    } else {
      const stored = localStorage.getItem('flyiq_user');
      if (stored) {
        try { setUser(JSON.parse(stored)); }
        catch { localStorage.removeItem('flyiq_user'); }
      }
    }
  }, []);

  // ==============================
  // ======== CONFIG =============
  // ==============================
  const BASE_URL = process.env.REACT_APP_API_URL;
  const handleDiscordLogin = () => (window.location.href = `${BASE_URL}/auth/discord`);

  const CRESTS = [
    { logo: flyIqLogo,  href: '/fly-iq',        desktopOffset: '26vh' },
    { logo: flyHqLogo,  href: '/fly-hq-tools',  desktopOffset: '0'    },
    { logo: flyBaseLogo, href: '/fly-mfv',      desktopOffset: '26vh' }
  ];

  // ==============================
  // ======== UNAUTH =============
  // ==============================
  if (!user) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <BackgroundFX />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-8 text-center">To Gain Access to The Nest</h1>
          <button
            onClick={handleDiscordLogin}
            className="mt-8 bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-lg text-lg font-semibold transition shadow-md"
          >
            Log in with Discord
          </button>
        </div>
      </div>
    );
  }

  // ==============================
  // ========= AUTHED ============
  // ==============================
  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <BackgroundFX />
      </div>

      <div className="relative z-10 h-full w-full flex flex-col items-center p-4">
        <h1 className="uppercase font-erbaum font-extrabold text-4xl text-white mt-4 mb-2 text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
          Welcome to The Nest, {user.username || user.id}!
        </h1>

        {/* ============================== CRESTS ONLY (NO TEXT LABELS) ============================== */}
        <div className="crest-wrap">
          {CRESTS.map(({ logo, href, desktopOffset }) => (
            <button
              key={href}
              className="crest-btn"
              onClick={() => (window.location.href = href)}
              style={{ '--desktopOffset': desktopOffset }}
              aria-label="module"
            >
              <div className="logo-wrap">
                <img src={logo} alt="logo" className="crest-img" />
                <div className="crest-shadow" />
              </div>
            </button>
          ))}
        </div>

        {/* ============================== STYLE ============================== */}
        <style>{`
          .crest-wrap{
            width: 100%;
            max-width: 1760px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 9rem;
            margin-top: 10px;
            padding: 0 1rem 4rem 1rem;
          }
          .crest-btn{
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: transparent;
            border: none;
            cursor: pointer;
            transform: translateY(var(--desktopOffset, 0));
          }
          .logo-wrap{
            position: relative;
            width: 440px;
            height: 396px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .crest-img{
            width: 300px;
            height: 300px;
            object-fit: contain;
            filter: drop-shadow(0 10px 28px rgba(0,0,0,.55));
            transition: transform .25s cubic-bezier(.22,.75,.25,1.05);
            position: relative;
            z-index: 2;
          }
          .crest-shadow{
            position: absolute;
            bottom: 34px;
            width: 54%;
            height: 16px;
            border-radius: 999px;
            background: radial-gradient(ellipse at center, rgba(0,0,0,.52), rgba(0,0,0,0));
            filter: blur(6px);
            transform: scale(1);
            transition: transform .28s ease;
            z-index: 1;
          }
          .crest-btn:hover .crest-img{ transform: scale(1.06); }
          .crest-btn:hover .crest-shadow{ transform: scale(1.1); }

          /* ===== Mobile: vertical stack, smaller logos, no offsets ===== */
          @media (max-width: 860px){
            .crest-wrap{
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              gap: 18px;
              margin-top: 10px;
              padding-bottom: 24px;
            }
            .crest-btn{
              transform: none !important;
            }
            .logo-wrap{
              width: 240px;
              height: 220px;
            }
            .crest-img{
              width: 170px;
              height: 170px;
            }
            .crest-shadow{
              bottom: 20px;
              width: 60%;
              height: 12px;
            }
          }
          @media (max-width: 420px){
            .logo-wrap{
              width: 200px;
              height: 188px;
            }
            .crest-img{
              width: 140px;
              height: 140px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
