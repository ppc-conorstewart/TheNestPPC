// ==============================
// src/pages/LandingPage.jsx
// ==============================

import { useEffect, useState } from 'react';

const flyIqLogo = '/assets/logo.png';
const flyHqLogo = '/assets/flyhq-logo.png';
const FLYBASELogo = '/assets/FLY-BASE.png';
const palomaLogo = '/assets/Paloma_Logo_White_Rounded.png';
const backgroundGif = '/assets/card-bg.gif';

// Crest color mapping (borders + accents)
const CREST_COLORS = [
  {
    border: '#6a7257', // Army green FIELD
    accent: '#b7c495',
    check: '#b7c495'
  },
  {
    border: '#ffe066', // Gold OFFICE
    accent: '#ffe066',
    check: '#ffe066'
  },
  {
    border: '#c8b18b', // Custom BASE color
    accent: '#c8b18b',
    check: '#c8b18b'
  }
];

// Checkmark SVG
function Check({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M5 10.6L8.2 14L15 7" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Rotating segment (rectangular) — perfectly centered on the logo
function RotatingSegment({ color, idx, boxSize = 350, rectPad = 15, rectRx = 65, strokeW = 7 }) {
  const svgSize = boxSize + rectPad * 2;
  const rectSize = boxSize;
  const rectOffset = rectPad;
  return (
    <svg
      className="absolute top-1/2 left-1/2 pointer-events-none rotating-segment"
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      fill="none"
      style={{
        zIndex: 3,
        width: svgSize,
        height: svgSize,
        pointerEvents: "none",
        transform: "translate(-50%, -50%)"
      }}
    >
      <rect
        x={rectOffset}
        y={rectOffset}
        width={rectSize}
        height={rectSize}
        rx={rectRx}
        fill="none"
        stroke="none"
      />
      <rect
        x={rectOffset}
        y={rectOffset}
        width={rectSize}
        height={rectSize}
        rx={rectRx}
        fill="none"
        stroke={`url(#rect-glow-${idx})`}
        strokeWidth={strokeW}
        strokeDasharray="1380 0"
        strokeDashoffset="0"
        strokeLinecap="round"
        opacity="1"
      />
      <defs>
        <linearGradient id={`rect-glow-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="30%" stopColor={color} stopOpacity="1" />
          <stop offset="70%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.18" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function LandingPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userData = params.get('user');
    if (userData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userData));
        setUser(parsed);
        localStorage.setItem('flyiq_user', JSON.stringify(parsed));
        window.history.replaceState({}, document.title, '/');
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    } else {
      const stored = localStorage.getItem('flyiq_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem('flyiq_user');
        }
      }
    }
  }, []);

  const BASE_URL = process.env.REACT_APP_API_URL;

  const handleDiscordLogin = () => {
    window.location.href = `${BASE_URL}/auth/discord`;
  };

  // Card configs (label, logo, bullets, onClick, color index)
  const CARDS = [
    {
      title: 'FIELD',
      logo: flyIqLogo,
      accent: CREST_COLORS[0],
      bullets: [
        'Interactive Field Training',
        'Paloma Points',
        'Paloma Shop Access'
      ],
      onClick: () => (window.location.href = '/fly-iq')
    },
    {
      title: 'OFFICE',
      logo: flyHqLogo,
      accent: CREST_COLORS[1],
      bullets: [
        'Asset Management',
        'Job Planner',
        'Workorder Hub',
        'Field Training',
        'Sourcing',
        'Pad Overwatch',
        'MFV Hub'
      ],
      onClick: () => (window.location.href = '/fly-hq-tools')
    },
    {
      title: 'BASE',
      logo: FLYBASELogo,
      accent: CREST_COLORS[2],
      bullets: [
        'Valve Reports',
        'Valve Documentation',
        'Shop guides'
      ],
      onClick: () => (window.location.href = '/fly-mfv')
    }
  ];

  if (!user) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <img
          src={backgroundGif}
          alt="Background Animation"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black bg-opacity-80 z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <img
            src={palomaLogo}
            alt="Paloma Logo"
            className="w-[240px] sm:w-[300px] lg:w-[300px] drop-shadow-[0_0_25px_rgba(154,162,125,0.6)]"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-8 text-center">
            To Gain Access to The Nest
          </h1>
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

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={backgroundGif}
        alt="Background Animation"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-black bg-opacity-80 z-0" />
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-start p-0">
        <h1 className="uppercase font-erbaum font-extrabold text-6xl text-[white] mt-6 text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
          Welcome to The Nest, {user.username || user.id}!
        </h1>
        <h2 className="text-xl font-bold font-erbaum mt-6 mb-6 text-white tracking-wider">
          SELECT A HUB:
        </h2>
        <div
          className="flex justify-center items-end w-full max-w-8xl flex-wrap px-4"
          style={{ gap: '3rem' }}
        >
          {CARDS.map((card, idx) => (
            <div
              key={card.title}
              className="group relative flex flex-col items-center justify-end cursor-pointer"
              style={{
                width: 370,
                minWidth: 250,
                marginBottom: 0
              }}
              onClick={card.onClick}
            >
              {/* Logo with perfectly centered rotating rectangle on hover */}
              <div
                className="crest-block transition-all duration-200 ease-in-out"
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'transparent',
                  width: 370,
                  height: 370,
                  justifyContent: 'center'
                }}
              >
                <img
                  src={card.logo}
                  alt={card.title + " Logo"}
                  style={{
                    width: 260,
                    height: 260,
                    objectFit: "contain",
                    margin: 0,
                    transition: 'transform .19s cubic-bezier(.25,.8,.36,1.04)'
                  }}
                  className="crest-img"
                />
                {/* Rotating glowing segment on hover only, perfectly centered */}
                <div className="rotating-rect-segment" style={{
                  position: 'absolute',
                  top: 0, left: 0, width: 380, height: 380,
                  pointerEvents: 'none', zIndex: 3,
                  opacity: 0
                }}>
                  <RotatingSegment color={card.accent.accent} idx={idx} boxSize={350} rectPad={15} rectRx={65} strokeW={7} />
                </div>
              </div>
              {/* Description text floating underneath */}
              <div
                className="description-block"
                style={{
                  marginTop: 22,
                  marginBottom: 10,
                  textAlign: 'center'
                }}
              >
                <div className="flex flex-col items-center gap-0.5 w-full">
                  {card.bullets.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-[1.1rem] font-bold font-erbaum tracking-wide"
                      style={{
                        color: 'white',
                        padding: "1.5px 0",
                        fontSize: 18,
                        textShadow: "0 1px 6px #23241c55"
                      }}
                    >
                      <Check color={card.accent.check} /> {item}
                    </div>
                  ))}
                </div>
              </div>
              {/* Animation and hover logic for the rotating segment */}
              <style>{`
                .group:hover .crest-block, .group:focus .crest-block {
                  transform: scale(1.00);
                  z-index: 20;
                }
                .group:hover .crest-img, .group:focus .crest-img {
                  transform: scale(1.10);
                }
                .group:hover .rotating-rect-segment, .group:focus .rotating-rect-segment {
                  opacity: 1 !important;
                  animation: none;
                }
                .group:hover .rotating-rect-segment svg rect[stroke^="url"], .group:focus .rotating-rect-segment svg rect[stroke^="url"] {
                  animation: dash-spin-rect 2.2s linear infinite;
                }
                @keyframes dash-spin-rect {
                  0% { stroke-dashoffset: 0; }
                  100% { stroke-dashoffset: -1380; }
                }
              `}</style>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}