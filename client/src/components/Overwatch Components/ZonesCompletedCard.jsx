// =====================================================
// Overwatch • ZonesCompletedCard.jsx — Glass Morphism
// Sections: Imports • Styles • Component
// =====================================================



// -----------------------------
// Styles
// -----------------------------
const cardStyle = {
  background: 'rgba(24,28,20,0.58)',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.12)',
  padding: 0,
  minHeight: 152,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  height: '100%',
  boxSizing: 'border-box',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
  backdropFilter: 'blur(14px) saturate(140%)',
  WebkitBackdropFilter: 'blur(14px) saturate(140%)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.45)'
};

const cardHeaderStyle = {
  background: 'rgba(0,0,0,0.55)',
  color: '#b0b79f',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: '13px 0 8px 0',
  fontSize: '1.17rem',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  letterSpacing: '1.13px',
  margin: 0,
  textAlign: 'center',
  width: '100%',
  lineHeight: 1.1
};

const chartImage = {
  width: '100%',
  height: '100%',
  minHeight: 210,
  objectFit: 'cover',
  borderRadius: 8,
  background: 'rgba(25,28,22,0.5)',
  margin: 0,
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)'
};

const mutedText = {
  color: '#b0b79f',
  fontSize: '1.01rem',
  marginLeft: '8px',
  textAlign: 'start',
  width: '100%'
};

// -----------------------------
// Component
// -----------------------------
export default function ZonesCompletedCard({ job }) {
  const expectedDate = job?.expected_completion_date || 'Expected Date of Job Completion:';
  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>Zones Completed (24/hr Average) Chart</div>
      
      <div style={mutedText}>{expectedDate}</div>
    </div>
  );
}
