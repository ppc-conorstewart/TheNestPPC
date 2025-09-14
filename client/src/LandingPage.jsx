// ==============================
// src/LandingPage.jsx
// ==============================

import { useEffect, useState } from 'react';
import BackgroundFX from './components/BackgroundFX';

// ==============================
// ======= BRAND ASSETS =========
// ==============================
const flyIqLogo = '/assets/logo.png';
const flyHqLogo = '/assets/flyhq-logo.png';
const FLYBASELogo = '/assets/FLY-BASE.png';

// ==============================
// ====== COLOR ACCENTS =========
// ==============================
const CREST_COLORS = [
  { accent: '#8aa06a' }, // FIELD — olive
  { accent: '#d9c56e' }, // OFFICE — brass
  { accent: '#b89f7a' }  // BASE  — desert tan
];

// ==============================
// ====== HALO DOTS (CSS) =======
// ==============================
function HaloDots({ color, count = 48, size = 320 }) {
  const dots = Array.from({ length: count }).map((_, i) => {
    const angle = Math.random() * 360;
    const radius = size * (0.36 + Math.random() * 0.12); // tighter band
    const delay = (Math.random() * 2).toFixed(2) + 's';
    const dur = (6 + Math.random() * 5).toFixed(2) + 's';
    const s = (1 + Math.random() * 2).toFixed(2);
    return (
      <span
        key={i}
        className="hdot"
        style={{
          '--angle': `${angle}deg`,
          '--radius': `${radius}px`,
          '--delay': delay,
          '--dur': dur,
          width: `${s}px`,
          height: `${s}px`,
          background: color
        }}
      />
    );
  });
  return (
    <div className="halo" style={{ width: size, height: size }}>
      {dots}
      <style>{`
        .halo {
          position:absolute; inset:0; margin:auto; pointer-events:none;
          opacity:0; filter: drop-shadow(0 0 8px rgba(0,0,0,.45));
          z-index:0; transform: translateZ(0) scale(1.0);
          transition: opacity .28s ease, transform .28s ease;
        }
        .hdot {
          position:absolute; top:50%; left:50%; border-radius:50%;
          transform: rotate(var(--angle)) translateX(var(--radius));
          animation: h-orbit var(--dur) linear infinite;
          animation-delay: var(--delay);
          box-shadow: 0 0 8px currentColor, 0 0 14px currentColor;
          opacity:.78;
        }
        .group:hover .halo { opacity:1; transform: scale(1.10); }
        @keyframes h-orbit { to { transform: rotate(calc(var(--angle) + 360deg)) translateX(var(--radius)); } }
      `}</style>
    </div>
  );
}

// ==============================
// ==== UNDER-RING (BEHIND LOGO)
// ==============================
function UnderRing({ color, size = 340 }) {
  return (
    <div
      className="under-ring pointer-events-none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        inset: 0,
        margin: 'auto',
        zIndex: 0,
        opacity: 0
      }}
    >
      <div
        className="ring-sweep"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          mixBlendMode: 'screen',
          filter: 'blur(2px)',
          background: `conic-gradient(from 0deg,
            transparent 0 40deg,
            ${color}cc 60deg,
            transparent 120deg,
            ${color}aa 180deg,
            transparent 240deg,
            ${color}cc 300deg,
            transparent 360deg)`
        }}
      />
      <div
        className="ring-soft"
        style={{
          position: 'absolute',
          inset: '12%',
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,0,0,0), rgba(0,0,0,.55))'
        }}
      />
      <style>{`
        .group:hover .under-ring { opacity: 1; transition: opacity .28s ease; }
        .group:hover .ring-sweep { animation: ring-spin 3.6s linear infinite; }
        @keyframes ring-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ==============================
// ==== MIL-SCAN HUD STRIP ======
// ==============================
function HudStrip({ color }) {
  return (
    <div className="hudstrip">
      <style>{`
        .hudstrip{
          position:absolute; left:50%; transform:translateX(-50%);
          bottom:-8px; width:86%; height:2px; opacity:0;
          background: linear-gradient(90deg, transparent, ${color}, transparent);
          box-shadow: 0 0 16px ${color}55;
          transition: opacity .3s ease;
        }
        .group:hover .hudstrip{ opacity:1; }
      `}</style>
    </div>
  );
}

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
      } catch { /* noop */ }
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

  const CARDS = [
    {
      title: 'FIELD',
      logo: flyIqLogo,
      accent: CREST_COLORS[0],
      description: ['Interactive Field Training', 'Paloma Points', 'Paloma Shop Access'],
      onClick: () => (window.location.href = '/fly-iq')
    },
    {
      title: 'OFFICE',
      logo: flyHqLogo,
      accent: CREST_COLORS[1],
      description: ['Asset Management', 'Job Planner', 'Workorder Hub', 'Sourcing', 'Pad Overwatch', 'MFV Hub'],
      onClick: () => (window.location.href = '/fly-hq-tools')
    },
    {
      title: 'BASE',
      logo: FLYBASELogo,
      accent: CREST_COLORS[2],
      description: ['Valve Reports', 'Valve Documentation', 'Shop Guides'],
      onClick: () => (window.location.href = '/fly-mfv')
    }
  ];

  // ==============================
  // ======== UNAUTH =============
  // ==============================
  if (!user) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <BackgroundFX hideLogo />
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
        <BackgroundFX hideLogo />
      </div>

      <div className="relative z-10 h-full w-full flex flex-col items-center justify-start p-0">
        <h1 className="uppercase font-erbaum font-extrabold text-4xl text-white mt-6 text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
          Welcome to The Nest, {user.username || user.id}!
        </h1>
        

        {/* ============================== CREST ROW ============================== */}
        <div
          className="relative w-full max-w-[1760px] px-10 flex items-start justify-between"
          style={{ gap: '9rem', marginTop: '10px' }}
        >
          {CARDS.map((card, idx) => {
            const isOffice = idx === 1;
            const isFieldOrBase = idx !== 1;
            return (
              <div
                key={card.title}
                className="group relative flex flex-col items-center justify-start cursor-pointer select-none"
                style={{
                  width: 520,
                  transform: isFieldOrBase ? 'translateY(26vh)' : 'none'
                }}
                onClick={card.onClick}
              >
                {/* ===== LOGO + UNDER FX (BEHIND ONLY) ===== */}
                <div
                  className="logo-wrap"
                  style={{
                    position: 'relative',
                    width: 440,
                    height: 396,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <UnderRing color={`${card.accent.accent}`} size={360} />
                  <HaloDots color={`${card.accent.accent}`} count={48} size={320} />
                  <img
                    src={card.logo}
                    alt={card.title + ' Logo'}
                    className="crest"
                    style={{
                      width: 300,
                      height: 300,
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 10px 28px rgba(0,0,0,.55))',
                      transition: 'transform .28s cubic-bezier(.22,.75,.25,1.05)',
                      position: 'relative',
                      zIndex: 2
                    }}
                  />
                  <div
                    className="crest-shadow"
                    style={{
                      position: 'absolute',
                      bottom: 34,
                      width: '54%',
                      height: 16,
                      borderRadius: 999,
                      background: 'radial-gradient(ellipse at center, rgba(0,0,0,.52), rgba(0,0,0,0))',
                      filter: 'blur(6px)',
                      transform: 'scale(1)',
                      transition: 'transform .28s ease',
                      zIndex: 1
                    }}
                  />

                  {/* ===== OVERLAY DESCRIPTION FOR FIELD/BASE (ON TOP OF LOGO) ===== */}
                  {isFieldOrBase && (
                    <div
                      className="intel-overlay"
                      style={{
                        position: 'absolute',
                        inset: 'auto 6% 6% 6%',
                        borderRadius: 12,
                        padding: '14px 16px 12px',
                        background: 'linear-gradient(180deg, rgba(10,14,10,.72), rgba(10,14,10,.34))',
                        border: '1px solid rgba(185,205,155,.24)',
                        boxShadow: '0 0 0 1px rgba(0,0,0,.25) inset, 0 14px 28px rgba(0,0,0,.35)',
                        backdropFilter: 'blur(8px)',
                        transform: 'translateY(8px)',
                        opacity: 0,
                        pointerEvents: 'none',
                        transition: 'opacity .45s ease, transform .45s ease',
                        zIndex: 3
                      }}
                    >
                      <div
                        style={{
                          color: '#e9efde',
                          fontFamily: 'Erbaum, sans-serif',
                          letterSpacing: '.14em',
                          fontSize: 13,
                          marginBottom: 8,
                          textAlign: 'center',
                          textShadow: '0 0 8px rgba(0,0,0,.6)'
                        }}
                      >
                        {card.title} MODULES
                      </div>
                      <div style={{ display: 'grid', gap: 8 }}>
                        {card.description.map((d, i) => (
                          <div
                            key={i}
                            className="ov-row"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              color: '#F3F5EF',
                              fontFamily: 'Erbaum, sans-serif',
                              fontSize: 18,
                              letterSpacing: '.06em',
                              transform: 'translateY(8px)',
                              opacity: 0
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                background: card.accent.accent,
                                borderRadius: 2,
                                boxShadow: `0 0 8px ${card.accent.accent}aa, 0 0 18px ${card.accent.accent}77`
                              }}
                            />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                      <HudStrip color={card.accent.accent} />
                    </div>
                  )}
                </div>

                {/* ===== DESCRIPTION BELOW FOR OFFICE ===== */}
                {isOffice && (
                  <div
                    className="intel-card"
                    style={{
                      position: 'relative',
                      marginTop: 10,
                      width: '92%',
                      maxWidth: 560,
                      borderRadius: 12,
                      padding: '14px 16px 16px',
                      background: 'linear-gradient(180deg, rgba(10,14,10,.72), rgba(10,14,10,.34))',
                      border: '1px solid rgba(185,205,155,.24)',
                      boxShadow: '0 0 0 1px rgba(0,0,0,.25) inset, 0 14px 28px rgba(0,0,0,.35)',
                      backdropFilter: 'blur(8px)',
                      transform: 'translateY(10px)',
                      opacity: 0,
                      overflow: 'hidden',
                      transition: 'opacity .45s ease, transform .45s ease'
                    }}
                  >
                    <div
                      style={{
                        color: '#e9efde',
                        fontFamily: 'Erbaum, sans-serif',
                        letterSpacing: '.14em',
                        fontSize: 13,
                        marginBottom: 8,
                        textAlign: 'center',
                        textShadow: '0 0 8px rgba(0,0,0,.6)'
                      }}
                    >
                      {card.title} MODULES
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {card.description.map((d, i) => (
                        <div
                          key={i}
                          className="desc-row"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            transform: 'translateY(8px)',
                            opacity: 0
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              background: card.accent.accent,
                              borderRadius: 2,
                              boxShadow: `0 0 8px ${card.accent.accent}aa, 0 0 18px ${card.accent.accent}77`
                            }}
                          />
                          <span
                            style={{
                              color: '#F3F5EF',
                              fontFamily: 'Erbaum, sans-serif',
                              fontSize: 18,
                              letterSpacing: '.06em'
                            }}
                          >
                            {d}
                          </span>
                        </div>
                      ))}
                    </div>
                    <HudStrip color={card.accent.accent} />
                  </div>
                )}

                {/* ===== HOVER/ANIM STYLES ===== */}
                <style>{`
                  .group:hover .crest{ transform: scale(1.08) rotateX(6deg); }
                  .group:hover .crest-shadow{ transform: scale(1.1); }

                  .group:hover .intel-card{ opacity:1; transform: translateY(0); }
                  .group:hover .desc-row{ animation: row-in .55s ease forwards; }
                  .group:hover .desc-row:nth-child(1){ animation-delay:.06s }
                  .group:hover .desc-row:nth-child(2){ animation-delay:.14s }
                  .group:hover .desc-row:nth-child(3){ animation-delay:.22s }
                  .group:hover .desc-row:nth-child(4){ animation-delay:.30s }
                  .group:hover .desc-row:nth-child(5){ animation-delay:.38s }
                  .group:hover .desc-row:nth-child(6){ animation-delay:.46s }

                  .group:hover .intel-overlay{ opacity:1; transform: translateY(0); }
                  .group:hover .ov-row{ animation: row-in .55s ease forwards; }
                  .group:hover .ov-row:nth-child(1){ animation-delay:.06s }
                  .group:hover .ov-row:nth-child(2){ animation-delay:.14s }
                  .group:hover .ov-row:nth-child(3){ animation-delay:.22s }
                  .group:hover .ov-row:nth-child(4){ animation-delay:.30s }
                  .group:hover .ov-row:nth-child(5){ animation-delay:.38s }
                  .group:hover .ov-row:nth-child(6){ animation-delay:.46s }

                  @keyframes row-in { to { transform: translateY(0); opacity:1; } }
                `}</style>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
