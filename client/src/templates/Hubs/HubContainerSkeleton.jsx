import React from 'react';

const camoBg = '/assets/dark-bg.jpg';
const palomaGreen = '#6a7257';
const tableHeaderBg = '#181a1b';

export default function HubContainerSkeleton({
  width = 2035,
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
        {/* LEFT SIDE: Main table region */}
        <div
          // Table-1
          style={{
            flex: 1.7,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '2px solid #282d25',
            height: '100%',
            minWidth: 1100,
          }}
        >
          {/* Tabs Bar - Tabs-1 */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            background: '#111211',
            borderBottom: `2px solid #282d25`,
            minHeight: 38,
            alignItems: 'center',
            paddingLeft: 14,
            paddingRight: 14,
          }}>
            {/* Tabs-1-Tab-1 */}
            <div style={{
              padding: '0 18px',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#fff',
              height: 34,
              display: 'flex',
              alignItems: 'center',
              borderBottom: `2px solid ${palomaGreen}`,
              marginRight: 11,
              letterSpacing: 1,
            }}>
              Placeholder Tab 1
            </div>
            {/* Tabs-1-Tab-2 */}
            <div style={{
              padding: '0 18px',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#c2c2c2',
              height: 34,
              display: 'flex',
              alignItems: 'center',
              marginRight: 11,
              opacity: 0.6,
            }}>
              Placeholder Tab 2
            </div>
            {/* Tabs-1-Tab-3 */}
            <div style={{
              padding: '0 18px',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#c2c2c2',
              height: 34,
              display: 'flex',
              alignItems: 'center',
              marginRight: 11,
              opacity: 0.6,
            }}>
              Placeholder Tab 3
            </div>
            {/* Tabs-1-Tab-4 */}
            <div style={{
              padding: '0 18px',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#c2c2c2',
              height: 34,
              display: 'flex',
              alignItems: 'center',
              marginRight: 11,
              opacity: 0.6,
            }}>
              Placeholder Tab 4
            </div>
            {/* Tabs-1-Tab-5 */}
            <div style={{
              padding: '0 18px',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#c2c2c2',
              height: 34,
              display: 'flex',
              alignItems: 'center',
              marginRight: 11,
              opacity: 0.6,
            }}>
              Placeholder Tab 5
            </div>
          </div>
          {/* Filter Row - FilterBar-1 */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 10,
            padding: '14px 14px 0 14px',
            alignItems: 'center',
            background: '#000',
          }}>
            {[...'123456'].map((_, idx) => (
              // FilterBar-1-Filter-[idx]
              <select
                key={idx}
                style={{
                  background: '#181a1b',
                  color: '#fff',
                  border: `1.5px solid ${palomaGreen}`,
                  borderRadius: 8,
                  padding: '6px 16px 6px 9px',
                  minWidth: 118,
                  fontFamily: 'inherit',
                  fontWeight: 500,
                  fontSize: 13,
                  outline: 'none',
                  appearance: 'none',
                }}
                disabled
                defaultValue=""
              >
                <option value="">Placeholder Filter</option>
              </select>
            ))}
            {/* FilterBar-1-SearchBtn */}
            <button
              style={{
                background: palomaGreen,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 15px',
                fontWeight: 600,
                fontSize: 13,
                marginLeft: 12,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
              disabled
            >
              Placeholder Search Button
            </button>
            {/* Action buttons */}
            {/* ActionBtn-1 */}
            <button className="ml-2" style={actionBtnStyle}>Placeholder Action 1</button>
            {/* ActionBtn-2 */}
            <button className="ml-2" style={actionBtnStyle}>Placeholder Action 2</button>
            {/* ActionBtn-3 */}
            <button className="ml-2" style={{ ...actionBtnStyle, background: '#333' }}>Placeholder Add New</button>
          </div>
          {/* Table */}
          <div
            // Table-1-Container
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '9px 14px 7px 14px',
              background: '#000',
            }}>
            {/* Table header - Table-1-Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '36px 150px 94px 1.4fr 130px 122px 99px 175px',
              background: tableHeaderBg,
              color: palomaGreen,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              fontWeight: 700,
              fontSize: '0.87rem',
              padding: '9px 0',
              borderBottom: `1.2px solid ${palomaGreen}`,
              letterSpacing: 0.7,
              textShadow: '0 1px 6px #0007',
              minHeight: 30,
              marginBottom: 1,
            }}>
              <span></span>
              <span>Placeholder Col 1</span>
              <span>Placeholder Col 2</span>
              <span>Placeholder Col 3</span>
              <span>Placeholder Col 4</span>
              <span>Placeholder Col 5</span>
              <span>Placeholder Col 6</span>
              <span>Placeholder Col 7</span>
            </div>
            {/* Placeholder Table Rows - Table-1-Row-[i] */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 150px 94px 1.4fr 130px 122px 99px 175px',
                  background: i % 2 === 0 ? '#131514' : '#191c19',
                  color: '#fff',
                  borderBottom: '1px solid #232823',
                  minHeight: 29,
                  alignItems: 'center',
                  fontSize: 12,
                  letterSpacing: 0.22,
                }}
              >
                <span><input type="checkbox" disabled /></span>
                <span>Placeholder</span>
                <span>Placeholder</span>
                <span>Placeholder</span>
                <span>Placeholder</span>
                <span>Placeholder</span>
                <span>Placeholder</span>
                <span>
                  <button style={tableBtn}>Edit</button>
                  <button style={deleteBtn}>Delete</button>
                  <button style={miniBtn}>Btn</button>
                  <button style={miniBtn}>Btn</button>
                </span>
              </div>
            ))}
            {/* Footer - Table-1-Footer */}
            <div style={{
              background: '#101411',
              color: '#bbb',
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: 0.8,
              padding: '6px 15px 6px 8px',
              borderTop: '1.2px solid #232823',
              marginTop: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Placeholder Footer Left</span>
              <span>Placeholder Footer Center</span>
              <span>
                <button style={tableNavBtn} disabled>Previous</button>
                <button style={tableNavBtn}>Next</button>
              </span>
            </div>
          </div>
        </div>
        {/* RIGHT SIDE: Summary/Log Panel */}
        <div
          // SummaryPanel-1
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 13px 8px 14px',
            background: '#181a1b',
            height: '100%',
            minWidth: 350,
          }}>
          {/* Asset Summary - SummaryCard-1 */}
          <div style={{
            background: '#101411',
            borderRadius: 9,
            marginBottom: 11,
            padding: '9px 14px 5px 14px',
            border: `2px solid #222`,
            minHeight: 64,
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            textAlign: 'center',
            letterSpacing: 1.1,
            textShadow: '0 1px 10px #0009',
          }}>
            <div style={{
              letterSpacing: 1.2,
              marginBottom: 3,
              fontSize: 13,
              color: '#fff',
            }}>Placeholder Summary Title</div>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 6,
              marginTop: 4,
              marginBottom: 3,
            }}>
              <SumCard label="SummaryCard-1" value="---" color={palomaGreen} />
              <SumCard label="SummaryCard-2" value="---" color="#f4d67e" />
              <SumCard label="SummaryCard-3" value="---" color="#6ac0ff" />
              <SumCard label="SummaryCard-4" value="---" color="#fff" />
            </div>
          </div>
          {/* Active Transfers - Card-1 */}
          <div style={{
            background: '#101411',
            borderRadius: 9,
            marginBottom: 11,
            padding: '7px 11px 5px 11px',
            border: `2px solid #222`,
            minHeight: 94,
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
          }}>
            <div style={{
              marginBottom: 4,
              letterSpacing: 1.2,
              fontSize: 13,
              color: '#fff',
              textAlign: 'center'
            }}>Placeholder Card Title</div>
            {Array.from({ length: 2 }).map((_, t) => (
              <div key={t}
                // Card-1-Row-[t]
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#181a1b',
                  borderRadius: 6,
                  marginBottom: 6,
                  padding: '7px 7px 5px 7px',
                  border: `1.2px solid ${palomaGreen}`,
                  fontWeight: 500,
                  fontSize: 10,
                }}
              >
                <span>
                  <b>Placeholder</b>
                  <br />
                  <b>Placeholder</b>
                </span>
                <span>
                  <button style={miniBtn}>Btn</button>
                  <button style={tableBtn}>Btn</button>
                  <button style={partialBtn}>Btn</button>
                  <button style={removeBtn}>Btn</button>
                </span>
                <span style={{ color: '#ffe864', fontWeight: 600 }}>Placeholder</span>
              </div>
            ))}
          </div>
          {/* Activity Log - Log-1 */}
          <div style={{
            background: '#101411',
            borderRadius: 9,
            padding: '7px 8px 6px 8px',
            border: `2px solid #222`,
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            flex: 1,
            minHeight: 80,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              marginBottom: 4,
              letterSpacing: 1.2,
              fontSize: 13,
              color: '#fff',
              textAlign: 'center'
            }}>Placeholder Log Title</div>
            {/* Log-1-Row-1 */}
            <div style={{
              background: '#181a1b',
              borderRadius: 6,
              border: `1.2px solid ${palomaGreen}`,
              color: '#fff',
              fontWeight: 400,
              fontSize: 10,
              padding: '6px 7px',
              marginBottom: 4,
            }}>
              Placeholder Log Row
            </div>
            {/* Log-1-Row-2 */}
            <div style={{
              background: '#181a1b',
              borderRadius: 6,
              border: `1.2px solid ${palomaGreen}`,
              color: '#fff',
              fontWeight: 400,
              fontSize: 10,
              padding: '6px 7px',
              marginBottom: 4,
            }}>
              Placeholder Log Row
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper subcomponents and styles
function SumCard({ label, value, color }) {
  return (
    <div
      // SummaryCard-{label}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: '#1c2117', borderRadius: 7, padding: '5px 14px',
        minWidth: 60, color: color, fontWeight: 700, fontSize: 14, boxShadow: '0 1px 6px #0007'
      }}>
      <span style={{ fontSize: 16, color }}>{value}</span>
      <span style={{
        fontSize: 9,
        color: '#fff',
        opacity: 0.95,
        fontWeight: 700,
        marginTop: 2,
        letterSpacing: 1.1,
      }}>{label}</span>
    </div>
  );
}
const actionBtnStyle = {
  background: '#232823',
  color: palomaGreen,
  border: `2px solid ${palomaGreen}`,
  borderRadius: 5,
  padding: '7px 10px',
  fontWeight: 600,
  fontSize: 11,
  marginLeft: 6,
  letterSpacing: 0.2,
  textTransform: 'uppercase',
  minWidth: 60,
  transition: 'all 0.14s',
  opacity: 0.96,
};
const tableBtn = {
  background: '#151d13',
  color: palomaGreen,
  border: `2px solid ${palomaGreen}`,
  borderRadius: 4,
  padding: '2px 8px',
  fontWeight: 700,
  fontSize: 10,
  margin: '0 2px',
  letterSpacing: 0.7,
  textTransform: 'uppercase',
  minWidth: 30,
  outline: 'none',
  cursor: 'pointer',
};
const miniBtn = {
  ...tableBtn,
  padding: '2px 6px',
  minWidth: 22,
  fontSize: 9,
  color: '#bbb',
  border: `1.2px solid #3a3f39`,
  background: '#191c19',
};
const partialBtn = {
  ...tableBtn,
  background: '#181a1b',
  color: '#ffe864',
  border: `2px solid #ffe864`,
};
const removeBtn = {
  ...tableBtn,
  background: '#191a19',
  color: '#ff6864',
  border: `2px solid #ff6864`,
};
const deleteBtn = {
  ...tableBtn,
  background: '#191a19',
  color: '#ff4b4b',
  border: `2px solid #ff4b4b`,
};
const tableNavBtn = {
  ...tableBtn,
  minWidth: 44,
  background: '#181a1b',
  color: palomaGreen,
  border: `1.2px solid ${palomaGreen}`,
  fontWeight: 600,
  fontSize: 10,
  margin: '0 2px',
  opacity: 0.7,
  cursor: 'pointer',
};
