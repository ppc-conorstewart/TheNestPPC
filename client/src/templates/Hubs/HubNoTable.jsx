import React from 'react';

const camoBg = '/assets/dark-bg.jpg';
const palomaGreen = '#6a7257';

export default function HubNoTable({
  width = 1600,
  height = 'calc(100vh - 48px)',
}) {
  return (
    <div
      className="min-h-screen w-full font-erbaum uppercase py-2 text-xs text-white bg-fixed bg-cover flex items-center justify-center"
      style={{
        backgroundImage: `url(${camoBg})`,
        backgroundColor: '#000',
      }}
    >
      <div
        style={{
          background: '#000',
          borderRadius: '18px',
          width: width,
          height: height,
          margin: '0 auto',
          border: '2px solid #282d25',
          boxShadow: '0 4px 36px 0 #10141177',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
        }}
      >
        {/* LEFT SIDE: Mini tab and summary display */}
        <div
          style={{
            flex: 1.5,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '2px solid #282d25',
            height: '100%',
            padding: '16px',
            background: '#0a0a0a',
          }}
        >
          {/* Tabs Row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            {['Dashboard', 'Charts', 'Notifications'].map((tab, i) => (
              <div key={i}
                style={{
                  padding: '7px 18px',
                  borderRadius: 9,
                  background: i === 0 ? palomaGreen : '#1c1d1c',
                  color: i === 0 ? '#fff' : '#aaa',
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: 1,
                }}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} style={{
                flex: 1,
                background: '#121512',
                padding: 14,
                borderRadius: 9,
                border: '2px solid #222',
                boxShadow: '0 0 14px rgba(0,0,0,0.3)',
              }}>
                <div style={{ fontSize: 12, color: '#ccc', marginBottom: 6 }}>
                  Metric {idx + 1}
                </div>
                <div style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: palomaGreen,
                  letterSpacing: 1.2
                }}>
                  ---
                </div>
              </div>
            ))}
          </div>

          {/* Chart Placeholder */}
          <div style={{
            flex: 1,
            background: '#161916',
            borderRadius: 9,
            border: '2px solid #282d25',
            padding: 16,
            color: '#aaa',
            fontSize: 13,
            letterSpacing: 0.5,
            textAlign: 'center',
          }}>
            Chart Placeholder (Insert bar/pie/time series visualization here)
          </div>
        </div>

        {/* RIGHT SIDE: Full-height Summary Panel */}
        <div
          style={{
            flex: 1,
            background: '#181a1b',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '18px 14px',
          }}
        >
          {/* Summary Cards */}
          <div style={{
            background: '#101411',
            borderRadius: 10,
            border: '2px solid #232823',
            padding: '10px 14px',
            marginBottom: 12,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 14,
            textShadow: '0 1px 10px #0009',
            letterSpacing: 1,
          }}>
            Summary Section
            <div style={{
              display: 'flex',
              marginTop: 10,
              gap: 10,
              justifyContent: 'space-around',
            }}>
              <SumCard label="Active Jobs" value="--" color="#84ff74" />
              <SumCard label="Jobs Planned" value="--" color="#f4d67e" />
              <SumCard label="Resources In Field" value="--" color="#6ac0ff" />
            </div>
          </div>

          {/* Activity Feed */}
          <div style={{
            flex: 1,
            background: '#101411',
            borderRadius: 9,
            padding: '8px',
            border: '2px solid #222',
            overflowY: 'auto',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}>
            <div style={{ textAlign: 'center', color: '#fff', marginBottom: 8 }}>
              ACTIVITY LOG
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                background: '#181a1b',
                padding: '6px 8px',
                borderRadius: 6,
                marginBottom: 6,
                border: `1.2px solid ${palomaGreen}`,
                color: '#ccc'
              }}>
                Placeholder log entry {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SumCard({ label, value, color }) {
  return (
    <div style={{
      background: '#1c2117',
      padding: '6px 12px',
      borderRadius: 7,
      textAlign: 'center',
      fontSize: 12,
      color: '#fff',
      minWidth: 90,
      border: `1px solid ${color}`,
    }}>
      <div style={{ fontSize: 16, color, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 10, marginTop: 4, letterSpacing: 0.8 }}>{label}</div>
    </div>
  )
}
