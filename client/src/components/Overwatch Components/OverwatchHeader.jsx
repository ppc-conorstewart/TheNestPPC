
// Adjust the import path for WhiteLogo as needed
import whiteLogo from '../../assets/whitelogo.png';


// Path to your .mov file
const overwatchVideo = "C:/Users/WelshWonder/FLY-IQ/The NEST App/client/src/assets/overwatchanimation.mp4";

const palomaLogoStyle = {
  height: 82,
  marginLeft: 0,
  marginRight: 0,
  alignSelf: 'center',
  background: 'transparent',
  objectFit: 'contain',
  zIndex: 2
};

const customerLogoStyle = {
  height: 60,
  width: 60,
  minWidth: 60,
  minHeight: 60,
  borderRadius: '36px',
  objectFit: 'contain',
  border: '0px solid #4ade80',
  boxShadow: '0 0 0px 0px #4ade8080',
  background: '#fff',
  marginLeft: 0,
  marginRight: 14,
  alignSelf: 'center',
  zIndex: 2
};

const padHeaderTitleStyle = {
  fontFamily: 'Punoer',
  fontWeight: 800,
  fontSize: '4rem',
  letterSpacing: '0.09em',
  color: '#6a7257',
  textShadow: '0 1px 1px #000, 0 20px 10 #a3ada740',
  textTransform: 'uppercase',
  border: 'none',
  textAlign: 'center',
  alignSelf: 'center',
  marginLeft: 150,
  padding: 0,
  whiteSpace: 'nowrap',
  lineHeight: 1.0,
  zIndex: 2
};

const padHeaderSubtitleStyle = {
  fontFamily: '"Punoer", "Oswald", "Bebas Neue", Arial, sans-serif',
  fontWeight: 900,
  fontSize: '2rem',
  color: '#fff',
  textShadow: '0 2px 12px #10110f',
  margin: 0,
  textAlign: 'left',
  letterSpacing: '1.2px',
  whiteSpace: 'nowrap',
  alignSelf: 'center',
  zIndex: 2
};

const mainHeaderWrap = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 80,
  borderBottom: '1.5px solid #949C7F',
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  position: 'relative',
  overflow: 'hidden',
  background: 'transparent'
};

const videoBgStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '25%',
  height: '25%',
  objectFit: 'cover',
  zIndex: 0,
  opacity: 0.26,
  pointerEvents: 'none'
};

// LOCKED LEFT SECTION
const leftSection = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minWidth: 340,
  gap: 32,
  zIndex: 2,
  flexShrink: 0
};

const rightSection = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 12,
  minWidth: 230,
  zIndex: 2,
  flex: 1
};

export default function OverwatchHeader({ customerLogo, padTitle, padSubtitle }) {
  return (
    <div style={mainHeaderWrap}>
      {/* Video Background */}
      <video
        src={overwatchVideo}
        autoPlay
        muted
        loop
        playsInline
        style={videoBgStyle}
      />
      {/* Left: Paloma Logo & Overwatch Title (Locked) */}
      <div style={leftSection}>
        <img src={WhiteLogo} alt="Paloma Logo" style={palomaLogoStyle} />
        <div style={padHeaderTitleStyle}>OVERWATCH</div>
      </div>
      {/* Right: Customer Logo and Pad Info (Moves Only This Part) */}
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
            ? <span style={{ color: "#fff" }}>{padSubtitle}</span>
            : <span style={{ color: "#a3a3a3" }}>No Pad Selected</span>
          }
        </div>
      </div>
    </div>
  );
}
