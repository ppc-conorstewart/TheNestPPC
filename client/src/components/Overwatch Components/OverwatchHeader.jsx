// =====================================================
// OverwatchHeader.jsx — Pad Overwatch Header (Glass)
// =====================================================


const overwatchVideo = "C:/Users/WelshWonder/FLY-IQ/The NEST App/client/src/assets/overwatchanimation.mp4";

// -----------------------------
// Glass Shell + Layout
// -----------------------------
const headerGlassShell = {
  position: 'relative',
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 20,
  borderBottom: '1.5px solid rgba(255,255,255,0.14)',
  padding: 0,
  overflow: 'hidden',
  background: 'rgba(24,28,20,0.58)',
  backdropFilter: 'blur(14px) saturate(140%)',
  WebkitBackdropFilter: 'blur(14px) saturate(140%)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
  borderRadius: 14,
  margin: '8px 6px 10px'
};

const videoBgStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '35%',
  height: '100%',
  objectFit: 'cover',
  zIndex: 0,
  opacity: 0.22,
  pointerEvents: 'none'
};

const leftSection = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minWidth: 340,
  gap: 24,
  zIndex: 2,
  flexShrink: 0,
  padding: '8px 10px'
};

const rightSection = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  minWidth: 230,
  zIndex: 2,
  flex: 1,
  paddingRight: 14
};

const palomaLogoStyle = {
  height: 68,
  marginLeft: 0,
  marginRight: 0,
  alignSelf: 'center',
  background: 'transparent',
  objectFit: 'contain',
  zIndex: 2
};

const customerLogoStyle = {
  height: 54,
  width: 54,
  minWidth: 54,
  minHeight: 54,
  borderRadius: '36px',
  objectFit: 'contain',
  border: '1px solid rgba(255,255,255,0.22)',
  boxShadow: '0 0 10px 0 rgba(0,0,0,0.35)',
  background: '#fff',
  marginLeft: 0,
  marginRight: 14,
  alignSelf: 'center',
  zIndex: 2
};

const padHeaderTitleStyle = {
  fontFamily: 'Punoer',
  fontWeight: 800,
  fontSize: '3.85rem',
  letterSpacing: '0.09em',
  color: '#d4dcc3',
  textShadow: '0 1px 1px #000, 0 20px 10px #0a0a0a40',
  textTransform: 'uppercase',
  border: 'none',
  textAlign: 'center',
  alignSelf: 'center',
  marginLeft: 90,
  padding: 0,
  whiteSpace: 'nowrap',
  lineHeight: 1.0,
  zIndex: 2
};

const padHeaderSubtitleStyle = {
  fontFamily: '"Punoer", "Oswald", "Bebas Neue", Arial, sans-serif',
  fontWeight: 900,
  fontSize: '1.9rem',
  color: '#f0f3ea',
  textShadow: '0 2px 12px #10110f',
  margin: 0,
  textAlign: 'center',
  letterSpacing: '1.2px',
  whiteSpace: 'nowrap',
  alignSelf: 'center',
  zIndex: 2
};

// -----------------------------
// Component
// -----------------------------
export default function OverwatchHeader({ customerLogo, padTitle, padSubtitle }) {
  return (
    <div style={headerGlassShell}>
      <video
        src={overwatchVideo}
        autoPlay
        muted
        loop
        playsInline
        style={videoBgStyle}
      />
      <div style={leftSection}>
       
       
      </div>
      <div style={rightSection}>
        {customerLogo && (
          <img
            src={customerLogo}
            alt="Customer Logo"
            style={customerLogoStyle}
            onError={e => { e.target.style.display = "none"; }}
          />
        )}
        <div style={padHeaderSubtitleStyle}>
          {padSubtitle
            ? <span>{padSubtitle}</span>
            : <span style={{ color: "#a3a3a3" }}>No Pad Selected</span>
          }
        </div>
      </div>
    </div>
  );
}
