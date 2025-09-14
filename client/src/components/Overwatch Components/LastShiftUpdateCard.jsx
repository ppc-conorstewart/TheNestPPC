// =====================================================
// Overwatch • LastShiftUpdateCard.jsx — Glass Morphism
// Sections: Imports • Styles • Helpers • Component
// =====================================================

import { useMemo } from 'react';

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

const updateBox = {
  color: '#E6E8DF',
  fontSize: '0.70rem',
  fontWeight: 400,
  padding: '12px 13px 8px 13px',
  minHeight: 145,
  maxHeight: 350,
  overflowY: 'auto',
  textAlign: 'left',
  whiteSpace: 'pre-line',
  letterSpacing: '0.02em',
  lineHeight: 1.45,
  background: 'rgba(24,26,25,0.5)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)'
};

// -----------------------------
// Helpers
// -----------------------------
function fmt(sectionTitle, text) {
  const t = (text || '').toString().trim();
  if (!t) return '';
  return `\n${sectionTitle}:\n${t}\n`;
}

// -----------------------------
// Component
// -----------------------------
export default function LastShiftUpdateCard({ job, notes }) {
  const fromJobJson = job?.job_update_json || {};
  const resolvedNotes = useMemo(() => {
    const src = notes || job?.lastShiftNotes || {};
    const operational = src.operational ?? fromJobJson.operationalNotes ?? '';
    const paloma = src.paloma ?? fromJobJson.palomaNotes ?? '';
    const crossShift = src.crossShift ?? fromJobJson.crossShiftNotes ?? '';
    const submittedBy = job?.updated_by || fromJobJson.updatedBy || fromJobJson.wsm1 || '';
    let body = '';
    if (submittedBy) body += `👤 Submitted by: ${submittedBy}\n`;
    body += fmt('PALOMA NOTES', paloma);
    body += fmt('OPERATIONAL NOTES', operational);
    body += fmt('CROSS-SHIFT NOTES', crossShift);
    return body.trim() || 'No notes submitted yet.';
  }, [job, notes]);

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>Last Shift Update</div>
      <div style={updateBox}>{resolvedNotes}</div>
    </div>
  );
}
