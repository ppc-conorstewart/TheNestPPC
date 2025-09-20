// =====================================================
// Overwatch • LiveBodyPressureCard.jsx — Glass Morphism
// Sections: Imports • Styles • Helpers • Component
// =====================================================

import { useEffect, useRef, useState } from 'react';

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

const livePressureTable = {
  background: 'rgba(24,26,25,0.6)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  width: '100%',
  color: '#E6E8DF',
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  padding: '7px 6px 5px 12px',
  lineHeight: '1.34',
  marginTop: 2,
  minHeight: 100,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)'
};

const tableHeaderRow = {
  display: 'flex',
  fontWeight: 700,
  borderBottom: '1px solid #949C7F55',
  marginBottom: 2,
  paddingBottom: 2,
  color: '#6a7257',
  fontSize: '1.01rem',
  textAlign: 'left',
  width: '100%',
  justifyContent: 'flex-start'
};

const tableCell = (w = 140, align = 'center', wrap = true) => ({
  width: w,
  minWidth: w,
  maxWidth: w,
  textAlign: align,
  whiteSpace: wrap ? 'pre-wrap' : 'nowrap',
  overflowWrap: 'break-word'
});

const tableDescCell = {
  width: 360,
  minWidth: 190,
  maxWidth: 360,
  textAlign: 'center',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word'
};

// -----------------------------
// Helpers
// -----------------------------
const defaultTransducers = [
  ['Transducer1', '[PPC # 12341 Alpha Upper Zipper]', 1149],
  ['Transducer2', '[PPC # 12342 Alpha Lower Zipper]', 2134],
  ['Transducer3', '[PPC # 12343 Bravo Upper Zipper]', 578],
  ['Transducer4', '[PPC # 12344 Bravo Lower Zipper]', 8765],
  ['Transducer5', '[PPC # 12345 Charlie Upper Zipper]', 13149]
];

const lineColors = ['#A8FFA8','#7AC8FF','#FFE57A','#FF7A7A','#B07AFF','#7AFFCC'];
function getLineColor(idx){return lineColors[idx % lineColors.length];}
function getRandomPressure(base){const min=Math.max(0,base-200);const max=base+200;return Math.round(Math.random()*(max-min)+min);}

// -----------------------------
// Component
// -----------------------------
export default function LiveBodyPressureCard({ job }) {
  const initialTransducers =
    Array.isArray(job?.transducers) && job.transducers.length > 0
      ? job.transducers
      : defaultTransducers;

  const [pressures, setPressures] = useState(
    initialTransducers.map(([name, desc, val]) => ({ name, desc, value: val }))
  );
  const baseValues = useRef(initialTransducers.map(([, , val]) => val));

  // Removed fake data polling - showing static values

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>Body Pressure Live Data</div>
      <div style={livePressureTable}>
        <div style={tableHeaderRow}>
          <span style={{ width: 28 }}></span>
          <span style={tableCell(115,'center',false)}>Transducer</span>
          <span style={tableDescCell}>Description</span>
          <span style={tableCell(90,'center',false)}>Pressure</span>
        </div>
        {pressures.map(({ name, desc, value }, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: i !== pressures.length - 1 ? '1px dashed #343A2D80' : 'none',
              padding: '2.5px 0'
            }}
          >
            <span style={{display:'inline-block',width:18,minWidth:18,marginRight:7,textAlign:'center',color:getLineColor(i),fontWeight:900,fontSize:'1.29rem',lineHeight:'1'}}>—</span>
            <span style={{ ...tableCell(115,'center',false), fontWeight:900, color:'#fff' }}>{name}</span>
            <span style={tableDescCell}>{desc}</span>
            <span style={{ ...tableCell(90,'center',false), fontWeight:700 }}>
              <span style={{ color: value >= 9000 ? '#ff3b4e' : '#69e05a', fontWeight:700 }}>
                {value.toLocaleString()}
              </span>
              <span style={{ color:'#fff', marginLeft:3 }}> PSI</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
