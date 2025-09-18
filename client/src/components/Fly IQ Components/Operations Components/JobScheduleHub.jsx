import { useEffect, useState } from "react";
import { resolveApiUrl } from '../../../api'

// ==============================
// JobScheduleHub.jsx
// ==============================
const LOGO_PATH = "/assets/logos/";

export default function JobScheduleHub({ onClose }) {
  const [jobs, setJobs] = useState({ inProgress: [], upcoming: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(resolveApiUrl("/api/jobs-schedule"))
      .then((r) => r.json())
      .then((data) => {
        setJobs(data);
        setLoading(false);
      });
  }, []);

  // Inject pulsing keyframes only once
  useEffect(() => {
    if (typeof window !== "undefined" && !window.__palomaScheduleKeyframesTiny) {
      const style = document.createElement("style");
      style.innerHTML = `
      @keyframes pulse-green-tiny {
        0% { box-shadow: 0 0 7px 2px #2fbf48; }
        60% { box-shadow: 0 0 18px 7px #86ff8e40; }
        100% { box-shadow: 0 0 7px 2px #2fbf48; }
      }
      @keyframes pulse-yellow-tiny {
        0% { box-shadow: 0 0 7px 2px #ffe95a55; }
        60% { box-shadow: 0 0 18px 7px #fff6cd30; }
        100% { box-shadow: 0 0 7px 2px #ffe95a55; }
      }
      `;
      document.head.appendChild(style);
      window.__palomaScheduleKeyframesTiny = true;
    }
  }, []);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Modal Header */}
        <div style={styles.header}>
          <img src="/assets/whitelogo.png" alt="Paloma" style={styles.logo} />
          <span style={styles.title}>Job Schedule</span>
          <button style={styles.closeBtn} onClick={onClose}>
            &#10006;
          </button>
        </div>
        {/* Main Body */}
        <div style={styles.bodyVert}>
          {/* ACTIVE */}
          <div style={styles.sectionVert}>
            <div style={styles.sectionTitleActive}>ACTIVE</div>
            <div style={styles.tableWrap}>
              <div style={{ ...styles.table, background: "#172416" }}>
                <div style={{ ...styles.tableRow, ...styles.tableHeaderRow }}>
                  <div style={styles.dotCol}></div>
                  <div style={styles.logoCol}></div>
                  <div style={styles.headerCol}>CUSTOMER</div>
                  <div style={styles.headerCol}>LSD</div>
                  <div style={styles.headerCol}>PRODUCT(S)</div>
                  <div style={styles.headerCol}>RIG-IN</div>
                  <div style={styles.headerCol}>START</div>
                  <div style={styles.headerCol}>END</div>
                  <div style={styles.headerCol}># WELLS</div>
                </div>
                {loading ? (
                  <div style={styles.loading}>Loading…</div>
                ) : jobs.inProgress.length === 0 ? (
                  <div style={styles.loading}>No active jobs</div>
                ) : (
                  jobs.inProgress.map((job, idx) => (
                    <div style={{ ...styles.tableRow, background: "#19321c" }} key={idx}>
                      <div style={styles.dotCol}>
                        <span className="paloma-dot paloma-dot-green" style={styles.dotActive} />
                      </div>
                      <div style={styles.logoCol}>
                        <div style={styles.logoBg}>
                          <LogoCell customer={job.customer} large />
                        </div>
                      </div>
                      <div style={styles.col}>{job.customer}</div>
                      <div style={styles.col}>{job.surface_lsd}</div>
                      <div style={styles.col}>{job.products}</div>
                      <div style={styles.col}>{job.rig_in_date}</div>
                      <div style={styles.col}>{job.start_date}</div>
                      <div style={styles.col}>{job.end_date}</div>
                      <div style={styles.col}>{job.num_wells}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {/* UPCOMING */}
          <div style={styles.sectionVert}>
            <div style={styles.sectionTitleUpcoming}>UPCOMING</div>
            <div style={styles.tableWrap}>
              <div style={{ ...styles.table, background: "#191919" }}>
                <div style={{ ...styles.tableRow, ...styles.tableHeaderRow }}>
                  <div style={styles.dotCol}></div>
                  <div style={styles.logoCol}></div>
                  <div style={styles.headerCol}>CUSTOMER</div>
                  <div style={styles.headerCol}>LSD</div>
                  <div style={styles.headerCol}>PRODUCT(S)</div>
                  <div style={styles.headerCol}>RIG-IN</div>
                  <div style={styles.headerCol}>START</div>
                  <div style={styles.headerCol}>END</div>
                  <div style={styles.headerCol}># WELLS</div>
                </div>
                {loading ? (
                  <div style={styles.loading}>Loading…</div>
                ) : jobs.upcoming.length === 0 ? (
                  <div style={styles.loading}>No upcoming jobs</div>
                ) : (
                  jobs.upcoming.map((job, idx) => (
                    <div style={{ ...styles.tableRow, background: "#232323" }} key={idx}>
                      <div style={styles.dotCol}>
                        <span className="paloma-dot paloma-dot-yellow" style={styles.dotUpcoming} />
                      </div>
                      <div style={styles.logoCol}>
                        <div style={styles.logoBg}>
                          <LogoCell customer={job.customer} large />
                        </div>
                      </div>
                      <div style={styles.col}>{job.customer}</div>
                      <div style={styles.col}>{job.surface_lsd}</div>
                      <div style={styles.col}>{job.products}</div>
                      <div style={styles.col}>{job.rig_in_date}</div>
                      <div style={styles.col}>{job.start_date}</div>
                      <div style={styles.col}>{job.end_date}</div>
                      <div style={styles.col}>{job.num_wells}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Logo cell with fallback
function LogoCell({ customer, large }) {
  const [error, setError] = useState(false);
  if (!customer) return null;
  const logoName = customer
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") + ".png";
  const size = large ? { height: 36, width: 76 } : { height: 18, width: 38 };
  return error ? (
    <span style={{ fontWeight: 900, color: "#ccc", fontSize: 13 }}>{customer[0] || "?"}</span>
  ) : (
    <img
      src={`${LOGO_PATH}${logoName}`}
      alt={customer}
      style={{
        ...size,
        objectFit: "contain",
        borderRadius: 4,
        marginRight: 0
      }}
      onError={() => setError(true)}
    />
  );
}

// ==============================
// STYLES
// ==============================
const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, width: "100vw", height: "100%",
    background: "rgba(0, 0, 0, 0.93)",
    zIndex: 9999,
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(2.5px)"
  },
  modal: {
    width: "93vw",
    maxWidth: 1900,
    minHeight: 900,
    maxHeight: 1100,
    background: "#181d14",
    border: "3px solid #3c4133",
    borderRadius: 18,
    boxShadow: "0 0 24px 2px #000d",
    overflow: "hidden",
    display: "flex", flexDirection: "column",
    position: "relative",
  },
  header: {
    width: "100%",
    background: "#000000ff",
    color: "#fff",
    fontWeight: 800,
    fontFamily: "Font-cornero, Cornero, Erbaum, monospace, sans-serif",
    letterSpacing: 5,
    fontSize: "1rem",
    textAlign: "center",
    borderBottom: "2.5px solid #949c7f",
    // Reduced padding/margin for less vertical height
    padding: "0px 0 0px 0",
    marginBottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 64,
    maxHeight: 90
  },
  logo: {
    height: 72, // 10% smaller than 80px
    marginLeft: 20,
    marginRight: 24,
    filter: "drop-shadow(0 2px 10px #272)",
    background: "none"
  },
  title: {
    flex: 1,
    fontFamily: "Font-cornero, Cornero, Erbaum, monospace, sans-serif",
    textAlign: "center",
    letterSpacing: 15,
    fontSize: "2.3rem", // Slightly smaller for vertical fit
    fontWeight: 900,
    color: "#fff",
    textShadow: "0 2px 4px #242, 0 0px 1px #fff4",
    lineHeight: 1.06,
    margin: "0px 0 0px 0",
    padding: 0,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 32,
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: 32,
    cursor: "pointer",
    filter: "drop-shadow(0 2px 10px #222)",
    zIndex: 2
  },
  // VERTICAL LAYOUT
  bodyVert: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flex: 1,
    minHeight: 480,
    background: "black",
    padding: "0px 0px 0 0px",
    gap: 8,
    alignItems: "center"
  },
  sectionVert: {
    width: "100%",
    maxWidth: 1850,
    marginBottom: 0
  },
  sectionTitleActive: {
    color: "#2af91fff",
    fontWeight: 900,
    fontSize: 30,
    textShadow: "0 1px 6px #77fa3a28",
    letterSpacing: 10,
    textAlign: "center",
    marginBottom: 0,
    fontFamily: "Font-cornero, Cornero, Erbaum, monospace, sans-serif"
  },
  sectionTitleUpcoming: {
    color: "#ffe95a",
    fontWeight: 900,
    fontSize: 30,
    textAlign: "center",
    textShadow: "0 1px 6px #ffe95a28",
    letterSpacing: 10,
    marginBottom: 0,
    fontFamily: "Font-cornero, Cornero, Erbaum, monospace, sans-serif"
  },
  tableWrap: {
    width: "100%",
    marginTop: 0,
    borderRadius: 0,
    boxShadow: "0 2px 24px #242a13a8",
    overflow: "hidden",
    background: "#000000ff"
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    textAlign: "center",
    fontFamily: "Erbaum, monospace, sans-serif"
  },
  tableRow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    textAlign: "center",
    border: "1px solid #ffffffff",
    fontWeight: 600,
    fontSize: 12,
    padding: "0 0",
    minHeight: 40,
    height: 36,
    lineHeight: 1.1
  },
  // NEW TABLE HEADER COLUMN STYLES
  tableHeaderRow: {
    color: "#e5f7ce",
    background: "#000", // <-- Black
    fontWeight: 800,
    fontSize: 15,
    textAlign: "center",
    letterSpacing: 1,
    textTransform: "uppercase",
    border: "2.5px solid #6a7257", // <-- Section border color
    minHeight: 22,
    height: 36,
  },
  headerCol: {
    flex: 1,
    padding: "2px 3px",
    minWidth: 45,
    
    fontSize: 15,
    color: "#6a7257",
    background: "#000", // Black background for header col
    
    fontWeight: 800,
    textTransform: "uppercase",
    fontFamily: "Erbaum, monospace, sans-serif",
    letterSpacing: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dotCol: {
    width: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: 34,
    marginLeft: 12,
    marginRight: 0,
  },
  // LOGO CELL: WHITE BACKGROUND
  logoCol: {
    width: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: 76,
    marginLeft: 0,
    marginRight: 2,
    padding: 0,
    zIndex: 1,
  },
  logoBg: {
    background: "#fff",
    borderRadius: 6,
    padding: "1px 4px 1px 4px",
    boxShadow: "0 2.5px 8px #aaa8, 0 0px 1px #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 76,
    height: 34,
  },
  col: {
    flex: 1,
    padding: "2px 3px",
    minWidth: 45,
    fontSize: 13,
    color: "#fff",
    fontFamily: "Erbaum, monospace, sans-serif",
    letterSpacing: 0.5,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    background: "none"
  },
  loading: {
    width: "100%",
    padding: "18px",
    textAlign: "center",
    color: "#bbb",
    fontWeight: 700
  },
  dotActive: {
    display: "inline-block",
    width: 13,
    height: 13,
    borderRadius: 10,
    background: "radial-gradient(circle, #7bff6a 62%, #257d30 100%)",
    marginRight: 0,
    boxShadow: "0 0 7px 2px #2fbf48",
    animation: "pulse-green-tiny 2.2s infinite",
    verticalAlign: "middle"
  },
  dotUpcoming: {
    display: "inline-block",
    width: 13,
    height: 13,
    borderRadius: 10,
    background: "radial-gradient(circle, #ffe95a 55%, #b7a12f 100%)",
    marginRight: 0,
    boxShadow: "0 0 7px 2px #ffe95a55",
    animation: "pulse-yellow-tiny 2.2s infinite",
    verticalAlign: "middle"
  },
};
