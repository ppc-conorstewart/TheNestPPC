// ==============================
// FILE: src/LandingPage.jsx
// Sections: Imports • Brand Assets • Component • Styles
// ==============================

import { useEffect, useState } from 'react';
import { resolveApiUrl } from './api';
import BackgroundFXOptimized from './components/BackgroundFXOptimized';

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
    { logo: flyIqLogo,    href: '/fly-iq' },
    { logo: flySalesLogo, href: '/sales' },
    { logo: flyHqLogo,    href: '/fly-hq-tools' },
    { logo: flyBaseLogo,  href: '/fly-mfv' }
  ];

  // ==============================
  // ======== UNAUTH =============
  // ==============================
  if (!user) {
    return (
      <div className='relative w-full h-full overflow-hidden'>
        <div className='absolute inset-0 z-0'>
          <BackgroundFXOptimized />
        </div>
        <div className='relative z-10 flex flex-col items-center justify-center min-h-screen p-6'>
          <h1 className='text-xl sm:text-2xl font-bold text-white mt-8 text-center'>To Gain Access to The Nest</h1>
          <button
            onClick={handleDiscordLogin}
            className='mt-8 bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-lg text-lg font-semibold transition shadow-md'
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
    <div className='relative w-full h-full overflow-hidden'>
      <div className='absolute inset-0 z-0'>
        <BackgroundFXOptimized />
      </div>

      <div className='relative z-10 h-full w-full flex flex-col items-center p-4 overflow-x-hidden overflow-y-auto'>
        <h1 className='uppercase font-erbaum font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white mt-4 mb-2 text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)] px-2'>
          Welcome to The Nest, {user.username || user.id}!
        </h1>

        {/* ============================== CRESTS ARCH ============================== */}
        <div className='crest-arch'>
          {CRESTS.map(({ logo, href }, i) => (
            <button
              key={href}
              className={`crest-btn crest-${i + 1}`}
              onClick={() => (window.location.href = href)}
              aria-label='module'
            >
              <div className='logo-wrap'>
                <img src={logo} alt='logo' className='crest-img' draggable='false' />
                <div className='crest-shadow' />
              </div>
            </button>
          ))}
        </div>

        {/* ============================== STYLE ============================== */}
        <style>{`
          .crest-arch{
            --gap: clamp(1.5rem, 4vw, 6rem);
            --lowerY: clamp(8vh, 12vh, 20vh);
            --upperY: 0vh;
            --wrapW: min(92vw, 2400px);
            width: var(--wrapW);
            margin-top: clamp(6px, 1vh, 18px);
            padding: 0 0 clamp(24px, 4vh, 48px) 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            gap: var(--gap);
            position: relative;
            contain: layout;
          }

          .crest-1{ transform: translateY(var(--lowerY)); }
          .crest-2{ transform: translateY(var(--upperY)); }
          .crest-3{ transform: translateY(var(--upperY)); }
          .crest-4{ transform: translateY(var(--lowerY)); }

          .crest-btn{
            background: transparent;
            border: 0;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
            touch-action: manipulation;
            contain: layout style paint;
            flex-shrink: 0;
          }
          .logo-wrap{
            position: relative;
            width: clamp(180px, 20vw, 380px);
            height: clamp(180px, 20vw, 380px);
            display: flex;
            align-items: center;
            justify-content: center;
            transform: scale(1);
            transform-origin: center center;
            transition: none;
            backface-visibility: hidden;
            -webkit-font-smoothing: antialiased;
          }
          .crest-btn:hover .logo-wrap{
            transform: scale3d(1.08, 1.08, 1);
            transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;
          }

          .crest-img{
            width: clamp(140px, 15vw, 280px);
            height: clamp(140px, 15vw, 280px);
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
            z-index: 0;
            transform: scale(1);
            transform-origin: center center;
            transition: none;
          }
          .crest-btn:hover .crest-shadow{
            transform: scale3d(1.15, 1.15, 1);
            transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Ultra-wide and 4K screens */
          @media (min-width: 2880px){
            .crest-arch{
              --gap: clamp(3rem, 5vw, 8rem);
              --lowerY: clamp(12vh, 15vh, 18vh);
              --wrapW: min(85vw, 2800px);
            }
            .logo-wrap{
              width: clamp(240px, 18vw, 420px);
              height: clamp(240px, 18vw, 420px);
            }
            .crest-img{
              width: clamp(180px, 14vw, 320px);
              height: clamp(180px, 14vw, 320px);
            }
          }

          /* 2K displays */
          @media (min-width: 2560px) and (max-width: 2879px){
            .crest-arch{
              --gap: clamp(2.5rem, 4.5vw, 7rem);
              --lowerY: clamp(10vh, 14vh, 16vh);
              --wrapW: min(88vw, 2200px);
            }
            .logo-wrap{
              width: clamp(220px, 19vw, 400px);
              height: clamp(220px, 19vw, 400px);
            }
            .crest-img{
              width: clamp(170px, 14.5vw, 300px);
              height: clamp(170px, 14.5vw, 300px);
            }
          }

          /* Standard high-res displays */
          @media (min-width: 1920px) and (max-width: 2559px){
            .crest-arch{
              --gap: clamp(2rem, 4vw, 5rem);
              --lowerY: clamp(12vh, 16vh, 18vh);
              --wrapW: min(90vw, 1800px);
            }
            .logo-wrap{
              width: clamp(200px, 22vw, 380px);
              height: clamp(200px, 22vw, 380px);
            }
            .crest-img{
              width: clamp(160px, 16vw, 280px);
              height: clamp(160px, 16vw, 280px);
            }
          }

          @media (max-width: 1919px) and (min-width: 1281px){
            .crest-arch{
              --gap: clamp(1.5rem, 3.5vw, 4rem);
              --lowerY: clamp(10vh, 14vh, 16vh);
            }
          }

          @media (max-width: 1280px) and (min-width: 861px){
            .crest-arch{
              --gap: clamp(1.2rem, 3.2vw, 3.5rem);
              --lowerY: clamp(8vh, 12vh, 14vh);
            }
          }

          /* Mobile and tablets */
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
              width: clamp(180px, 58vw, 300px);
              height: clamp(180px, 58vw, 300px);
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

          /* Ensure content fits in viewport height */
          @media (max-height: 800px) and (min-width: 861px){
            .crest-arch{
              --lowerY: clamp(6vh, 10vh, 12vh);
            }
            .logo-wrap{
              width: clamp(160px, 18vw, 320px);
              height: clamp(160px, 18vw, 320px);
            }
            .crest-img{
              width: clamp(120px, 14vw, 240px);
              height: clamp(120px, 14vw, 240px);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
