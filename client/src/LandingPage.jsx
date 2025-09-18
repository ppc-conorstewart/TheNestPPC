// ==============================
// FILE: src/LandingPage.jsx
// Sections: Imports • Brand Assets • Component • Styles
// ==============================

import { useEffect, useState } from 'react';
import { resolveApiUrl } from './api';
import BackgroundFX from './components/BackgroundFX';

// ==============================
// ======= BRAND ASSETS =========
// ==============================
const flyIqLogo = '/assets/logo.png';
const flySalesLogo = '/assets/SALES.png';
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
  const handleDiscordLogin = () => {
    window.location.href = resolveApiUrl('/auth/discord');
  };

  const CRESTS = [
    { logo: flyIqLogo,    href: '/fly-iq' },        // Left-lower
    { logo: flySalesLogo, href: '/sales' },         // Upper-center-left
    { logo: flyHqLogo,    href: '/fly-hq-tools' },  // Upper-center-right
    { logo: flyBaseLogo,  href: '/fly-mfv' }        // Right-lower
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

        {/* ============================== CRESTS ARCH ============================== */}
        <div className="crest-arch">
          {CRESTS.map(({ logo, href }, i) => (
            <button
              key={href}
              className={`crest-btn crest-${i + 1}`}
              onClick={() => (window.location.href = href)}
              aria-label="module"
            >
              <div className="logo-wrap">
                <img src={logo} alt="logo" className="crest-img" draggable="false" />
                <div className="crest-shadow" />
              </div>
            </button>
          ))}
        </div>

        {/* ============================== STYLE ============================== */}
        <style>{`
          /* ====== ARCH GEOMETRY (centered over background crest on all viewports) ====== */
          .crest-arch{
            --gap: clamp(1.5rem, 5vw, 4.5rem);
            --lowerY: clamp(10vh, 18vh, 22vh);
            --upperY: 0vh;
            --wrapW: min(92vw, 1500px);
            width: var(--wrapW);
            margin-top: clamp(6px, 1vh, 18px);
            padding: 0 0 clamp(24px, 4vh, 48px) 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            gap: var(--gap);
          }

          /* Place items in a gentle arc */
          .crest-1{ transform: translateY(var(--lowerY)); } /* left lower */
          .crest-2{ transform: translateY(var(--upperY)); } /* upper left-center (SALES) */
          .crest-3{ transform: translateY(var(--upperY)); } /* upper right-center (OFFICE/HQ) */
          .crest-4{ transform: translateY(var(--lowerY)); } /* right lower */

          .crest-btn{
            background: transparent;
            border: 0;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform .25s cubic-bezier(.22,.75,.25,1.05);
          }
          .logo-wrap{
            position: relative;
            width: clamp(220px, 26vw, 440px);
            height: clamp(200px, 24vw, 396px);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .crest-img{
            width: clamp(160px, 18vw, 300px);
            height: clamp(160px, 18vw, 300px);
            object-fit: contain;
            filter: drop-shadow(0 10px 28px rgba(0,0,0,.55));
            position: relative;
            z-index: 2;
            user-select: none;
          }
          .crest-shadow{
            position: absolute;
            bottom: clamp(16px, 2.2vw, 34px);
            width: 54%;
            height: clamp(10px, 1.1vw, 16px);
            border-radius: 999px;
            background: radial-gradient(ellipse at center, rgba(0,0,0,.52), rgba(0,0,0,0));
            filter: blur(6px);
            z-index: 1;
            transform: scale(1);
            transition: transform .28s ease;
          }
          .crest-btn:hover .crest-img{ transform: scale(1.06); }
          .crest-btn:hover .crest-shadow{ transform: scale(1.1); }

          /* ===== Super-wide screens: slightly tighter arc so it hugs the center crest ===== */
          @media (min-width: 1920px){
            .crest-arch{ --gap: clamp(2rem, 3.8vw, 4rem); --lowerY: 18vh; }
          }

          /* ===== Medium / Laptop widths: pull lower crests up a bit and tighten spacing ===== */
          @media (max-width: 1280px){
            .crest-arch{ --gap: clamp(1.2rem, 3.6vw, 3.2rem); --lowerY: 14vh; }
          }

          /* ===== Tablet and below: stack vertically centered, equal sizes, no offsets ===== */
          @media (max-width: 860px){
            .crest-arch{
              width: min(96vw, 680px);
              flex-direction: column;
              align-items: center;
              gap: clamp(10px, 3vh, 18px);
              --lowerY: 0vh;
              --upperY: 0vh;
            }
            .logo-wrap{
              width: clamp(180px, 58vw, 260px);
              height: clamp(160px, 52vw, 220px);
            }
            .crest-img{
              width: clamp(130px, 46vw, 170px);
              height: clamp(130px, 46vw, 170px);
            }
            .crest-shadow{
              bottom: clamp(10px, 2.2vh, 20px);
              width: 60%;
              height: clamp(8px, 1.6vh, 12px);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
