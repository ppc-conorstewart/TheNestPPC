// =====================================================
// Overwatch • BodyPressureChartCard.jsx — Glass Morphism
// Sections: Imports • Styles • Helpers • Component
// =====================================================

import 'chart.js/auto';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

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

// -----------------------------
// Helpers
// -----------------------------
const defaultTransducers = [
  ['Transducer1','[PPC # 12341 Alpha Upper Zipper]',1149],
  ['Transducer2','[PPC # 12342 Alpha Lower Zipper]',2134],
  ['Transducer3','[PPC # 12343 Bravo Upper Zipper]',578],
  ['Transducer4','[PPC # 12344 Bravo Lower Zipper]',8765],
  ['Transducer5','[PPC # 12345 Charlie Upper Zipper]',13149]
];

function getRandomPressure(base){const min=Math.max(0,base-200);const max=base+200;return Math.round(Math.random()*(max-min)+min);}
const lineColors=['#A8FFA8','#7AC8FF','#FFE57A','#FF7A7A','#B07AFF','#7AFFCC'];
function getLineColor(i){return lineColors[i%lineColors.length];}

// -----------------------------
// Component
// -----------------------------
export default function BodyPressureChartCard({ job }) {
  const initialTransducers = Array.isArray(job?.transducers) && job.transducers.length > 0 ? job.transducers : defaultTransducers;

  const [series, setSeries] = useState(() =>
    initialTransducers.map(([name, desc, value], i) => ({ name, desc, color: getLineColor(i), data: [value] }))
  );
  const [labels, setLabels] = useState([new Date().toLocaleTimeString()]);

  // Removed fake data polling - showing static chart

  const data = {
    labels,
    datasets: series.map(tr => ({
      label: `${tr.name} ${tr.desc}`,
      data: tr.data,
      borderColor: tr.color,
      backgroundColor: tr.color + '33',
      borderWidth: 2.1,
      pointRadius: 0,
      tension: 0.22
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true, callbacks: { label: c => `${c.dataset.label}: ${c.parsed.y.toLocaleString()} PSI` } } },
    layout: { padding: 12 },
    scales: {
      x: { ticks: { color:'#b0b79f', maxTicksLimit:8, font:{ size:12 } }, grid: { color:'#23251f' } },
      y: { beginAtZero: true, ticks: { color:'#b0b79f', font:{ size:12 } }, grid: { color:'#23251f' } }
    }
  };

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>BODY PRESSURE CHART (LIVE)</div>
      <div style={{ flex:1, height:'100%', width:'100%' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
