// ==============================
// components/Overwatch Components/LastShiftUpdateCard.jsx — Live Notes (Context-Friendly)
// ==============================

import { useMemo } from 'react';

// ==============================
// Styles
// ==============================
const cardStyle = {
  background: '#10110f',
  borderRadius: 0,
  border: '1.5px solid #949C7F',
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
  overflow: 'hidden'
};

const cardHeaderStyle = {
  background: '#000',
  color: '#b0b79f',
  borderBottom: '2.5px solid #35392e',
  padding: '13px 0 8px 0',
  fontSize: '1.17rem',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  letterSpacing: '1.13px',
  margin: 0,
  textAlign: 'center',
  width: '100%',
  lineHeight: 1.1,
  boxShadow: '0 2px 10px #22291e25'
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
  lineHeight: 1.45
};

// ==============================
// Helpers
// ==============================
function fmt(sectionTitle, text) {
  const t = (text || '').toString().trim();
  if (!t) return '';
  return `\n${sectionTitle}:\n${t}\n`;
}

// ==============================
// Component
// ==============================
export default function LastShiftUpdateCard({ job, notes }) {
  const fromJobJson = job?.job_update_json || {};

  const resolvedNotes = useMemo(() => {
    const src = notes || job?.lastShiftNotes || {};
    const operational = src.operational ?? fromJobJson.operationalNotes ?? '';
    const paloma = src.paloma ?? fromJobJson.palomaNotes ?? '';
    const crossShift = src.crossShift ?? fromJobJson.crossShiftNotes ?? '';
    const submittedBy =
      job?.updated_by ||
      fromJobJson.updatedBy ||
      fromJobJson.wsm1 ||
      '';

    let body = '';
    if (submittedBy) {
      body += `👤 Submitted by: ${submittedBy}\n`;
    }
    body += fmt('PALOMA NOTES', paloma);
    body += fmt('OPERATIONAL NOTES', operational);
    body += fmt('CROSS-SHIFT NOTES', crossShift);

    return body.trim() || 'No notes submitted yet.';
  }, [job, notes]);

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        Last Shift Update
      </div>
      <div style={updateBox}>
        {resolvedNotes}
      </div>
    </div>
  );
}
