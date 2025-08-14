import React from 'react';

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
  textTransform: 'uppercase',
  fontSize: '1.17rem',
  fontWeight: 'bold',
  letterSpacing: '1.13px',
  margin: 0,
  textAlign: 'center',
  width: '100%',
  lineHeight: 1.1,
  boxShadow: '0 2px 10px #22291e25'
};

const coilTabBox = {
  color: '#E6E8DF',
  fontSize: '.9rem',
  fontWeight: 500,
  padding: '18px 24px 8px 24px',
  minHeight: 120,
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  gap: '0px',
  justifyContent: 'flex-start'
};

const sectionTitle = {
  color: '#fffb22ff',
  fontWeight: 700,
  fontSize: '.9rem',
  margin: '0px 0 0px 0'
};

const label = {
  fontWeight: 500,
  color: '#e6e8df',
  fontSize: '.9rem',
  margin: '3px 0'
};

const value = {
  fontWeight: 700,
  color: '#c3ffad',
  marginLeft: 8
};

export default function CoilTabCard({ job }) {
  // You can make these dynamic by passing props or fetching from job if needed.
  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        Personnel and Fleet
      </div>
      <div style={coilTabBox}>
        <div style={label}>
          Field Superintendent:<span style={value}>Scott Luscombe</span>
        </div>

        <div style={sectionTitle}>Dayshift</div>
        <div style={label}>Lead: Conor Stewart</div>
        <div style={label}>Support: Keegan Fiveland</div>
        <div style={label}>Fleet Unit #: PF-0014</div>

        <div style={sectionTitle}>Nightshift</div>
        <div style={label}>Lead: Sean Stewart</div>
        <div style={label}>Support: Jesse Bird</div>
        <div style={label}>Fleet Unit #: Personal Truck </div>
      </div>
    </div>
  );
}
