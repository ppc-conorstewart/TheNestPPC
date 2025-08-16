import React from 'react';

// Update the import path as needed for your environment:
import ZonesCompletedImg from '../../assets/whitelogo.png';

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

const chartImage = {
  width: '100%',
  height: '100%',
  minHeight: 210,
  objectFit: 'cover',
  borderRadius: 8,
  background: '#191c16',
  margin: 0
};

const mutedText = {
  color: '#b0b79f',
  fontSize: '1.01rem',
  marginLeft: '8px',
  textAlign: 'start',
  width: '100%'
};

export default function ZonesCompletedCard({ job }) {
  // Show expected date if available, otherwise a placeholder
  const expectedDate = job?.expected_completion_date || 'Expected Date of Job Completion:';

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        Zones Completed (24/hr Average) Chart
      </div>
      <img src={ZonesCompletedImg} alt="Zones Completed Chart" style={chartImage} />
      <div style={mutedText}>
        {expectedDate}
      </div>
    </div>
  );
}
