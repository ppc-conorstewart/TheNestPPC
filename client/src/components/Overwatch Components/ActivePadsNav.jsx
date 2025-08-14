
// Pulser CSS for card border (add to your CSS file if not already present)
/*
@keyframes pulseBorder {
  0% {
    box-shadow: 0 0 0 0 #4ade8099, 0 0 0 0 #4ade8044;
    border-color: #4ade80;
  }
  60% {
    box-shadow: 0 0 0 7px #4ade8033, 0 0 0 0 #4ade8044;
    border-color: #8affc1;
  }
  100% {
    box-shadow: 0 0 0 0 #4ade8000, 0 0 0 0 #4ade8044;
    border-color: #4ade80;
  }
}
*/

const navPanelTitle = {
  fontSize: '1.16rem',
  fontWeight: 700,
  color: '#4ade80',
  letterSpacing: '1.09px',
  marginBottom: '4px'
};

const jobListStyle = {
  fontSize: '0.7rem', // compact!
  color: '#E6E8DF',
  fontWeight: 500,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  width: '100%',
  height: '100%'
};

const jobButtonStyle = (isActive) => ({
  background: isActive ? '#181A15' : 'transparent',
  color: isActive ? '#6A7257' : '#E6E8DF',
  border: `2.5px solid #4ade80`,
  borderRadius: 13,
  padding: '0px 6px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.7rem',
  marginBottom: 0,
  transition: 'background 0.15s, color 0.12s, border-color 0.15s',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  minWidth: 0,
  gap: 15,
  minHeight: 74,
  boxShadow: '0 0 0 0 #4ade8099',
  animation: 'pulseBorder 1.25s cubic-bezier(0.4,0,0.6,1) infinite'
});

const customerLogoStyle = {
  height: 56,
  width: 70,
  minWidth: 95,
  minHeight: 60,
  borderRadius: '12px',
  objectFit: 'contain',
  border: '0px solid #4ade80',
  background: '#ffffffff',
  boxShadow: '0 0 7px 1px #35392e44',
  alignSelf: 'center',
  marginLeft: 0,
  marginRight: 10
};

const jobInfoBox = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: 1,
  alignItems: 'flex-end',
  textAlign: 'end',
  lineHeight: 1.13
};

const activePadsContainer = {
  background: '#111',
  borderRadius: '12px 0 0 12px',
  borderRight: `2px solid #949C7F`,
  minWidth: 260,
  maxWidth: 320,
  width: 320,
  height: 1000,
  minHeight: 100,
  padding: '0px 12px 0px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  boxSizing: 'border-box',
  justifyContent: 'center'
};

export default function ActivePadsNav({
  jobs,
  selectedIndex,
  onSelectJob
}) {
  return (
    <div style={activePadsContainer}>
      <div style={navPanelTitle}>ACTIVE PADS</div>
      <div style={jobListStyle}>
        {(!jobs || jobs.length === 0) ? (
          <div style={{ color: '#4ade80', textAlign: 'center', marginTop: 0 }}>
            No pads in progress.
          </div>
        ) : (
          jobs.map((job, idx) => (
            <div
              key={job.id}
              style={jobButtonStyle(selectedIndex === idx)}
              onClick={() => onSelectJob(idx)}
            >
              {job.customerLogo && (
                <img
                  src={job.customerLogo}
                  alt=""
                  style={customerLogoStyle}
                  onError={e => { e.target.style.display = "none"; }}
                />
              )}
              <div style={jobInfoBox}>
                <span style={{ fontWeight: 900, color: '#fff', fontSize: '1.09em', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {job.customer || 'No Customer'}
                </span>
                <span style={{ fontWeight: 400, color: '#b0b79f', fontSize: '1.01em', marginTop: 1 }}>
                  LSD: {job.surface_lsd || '-'}
                </span>
                <span style={{ fontWeight: 900, color: '#cade4aff', fontSize: '1.15em', marginTop: 2 }}>
                  Wells: {job.num_wells != null ? job.num_wells : '-'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Inject the animation CSS for the pulsing border if not present */}
      <style>
        {`
        @keyframes pulseBorder {
          0% {
            box-shadow: 0 0 0 0 #4ade8099, 0 0 0 0 #4ade8044;
            border-color: #4ade80;
          }
          60% {
            box-shadow: 0 0 0 7px #4ade8033, 0 0 0 0 #4ade8044;
            border-color: #8affc1;
          }
          100% {
            box-shadow: 0 0 0 0 #4ade8000, 0 0 0 0 #4ade8044;
            border-color: #4ade80;
          }
        }
        `}
      </style>
    </div>
  );
}
