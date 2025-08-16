import React, { useEffect, useState, useRef } from 'react';

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

const livePressureTable = {
  background: '#181a19',
  border: '1.2px solid #949C7F',
  borderRadius: '6px',
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
  justifyContent: 'flex-start'
};

const tableHeaderRow = {
  display: 'flex',
  fontWeight: 700,
  borderBottom: '1px solid #949C7F',
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

// Default placeholder data
const defaultTransducers = [
  ["Transducer1", "[PPC # 12341 Alpha Upper Zipper]", 1149],
  ["Transducer2", "[PPC # 12342 Alpha Lower Zipper]", 2134],
  ["Transducer3", "[PPC # 12343 Bravo Upper Zipper]", 578],
  ["Transducer4", "[PPC # 12344 Bravo Lower Zipper]", 8765],
  ["Transducer5", "[PPC # 12345 Charlie Upper Zipper]", 13149]
];

// Palette matches chart lines
const lineColors = [
  '#A8FFA8', // green
  '#7AC8FF', // blue
  '#FFE57A', // gold
  '#FF7A7A', // red
  '#B07AFF', // purple
  '#7AFFCC', // aqua
];
function getLineColor(idx) {
  return lineColors[idx % lineColors.length];
}

function getRandomPressure(base) {
  // Clamp to >= 0, round to int, vary ±200
  const min = Math.max(0, base - 200);
  const max = base + 200;
  return Math.round(Math.random() * (max - min) + min);
}

export default function LiveBodyPressureCard({ job }) {
  const initialTransducers = Array.isArray(job?.transducers) && job.transducers.length > 0
    ? job.transducers
    : defaultTransducers;

  // Keep [name, desc, pressure]
  const [pressures, setPressures] = useState(
    initialTransducers.map(([name, desc, val]) => ({ name, desc, value: val }))
  );

  // Stable reference to initial values for randomizing around them
  const baseValues = useRef(
    initialTransducers.map(([name, desc, val]) => val)
  );

  // Simulate pressure updates every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setPressures(current =>
        current.map((tr, i) => {
          // always bounce around the LATEST value, not original static
          const lastVal = tr.value;
          let newVal = getRandomPressure(lastVal);
          return { ...tr, value: newVal };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        Body Pressure Live Data
      </div>
      <div style={livePressureTable}>
        <div style={tableHeaderRow}>
          <span style={{ width: 28 }}></span>
          <span style={tableCell(115, 'center', false)}>Transducer</span>
          <span style={tableDescCell}>Description</span>
          <span style={tableCell(90, 'center', false)}>Pressure</span>
        </div>
        {pressures.map(({ name, desc, value }, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: i !== (pressures.length - 1) ? `1px dashed #343A2D` : 'none',
              padding: '2.5px 0'
            }}
          >
            {/* Colored horizontal line ("—") */}
            <span
              style={{
                display: 'inline-block',
                width: 18,
                minWidth: 18,
                marginRight: 7,
                textAlign: 'center',
                color: getLineColor(i),
                fontWeight: 900,
                fontSize: '1.29rem',
                lineHeight: '1'
              }}
            >—</span>
            <span style={{ ...tableCell(115, 'center', false), fontWeight: 900, color: '#fff' }}>{name}</span>
            <span style={tableDescCell}>{desc}</span>
            <span style={{ ...tableCell(90, 'center', false), fontWeight: 700 }}>
              <span style={{
                color: value >= 9000 ? '#ff3b4e' : '#69e05a', // red if >=9000, green otherwise
                fontWeight: 700
              }}>
                {value.toLocaleString()}
              </span>
              <span style={{ color: '#fff', marginLeft: 3 }}> PSI</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
