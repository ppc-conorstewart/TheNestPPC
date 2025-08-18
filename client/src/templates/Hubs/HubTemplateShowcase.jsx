// src/components/HubTemplateShowcase.jsx

import React, { useState } from "react";
const camoBg = "/assets/dark-bg.jpg";
const palomaGreen = "#6a7257";
const palomaGreenLight = "#949C7F";
const palomaDark = "#35392E";

// Dummy Data
const notifications = [
  "Scheduled Maintenance: July 15 @ 2pm",
  "New Asset Assigned: Valve-812",
  "RFP Bid Due: Prairie Co. - July 16",
  "Asset Inspection Required: Location 7",
  "Finance Report Uploaded: Sales Q2"
];

const statsData = [
  { label: "Active Assets", value: 82, icon: "🟢" },
  { label: "Jobs in Progress", value: 8, icon: "⚒️" },
  { label: "Bidded RFPs", value: 4, icon: "💼" },
  { label: "Pending Repairs", value: 2, icon: "🔧" }
];

const tableRows = [
  { customer: "Baytex", jobs: 12, complete: 9, overdue: 1, status: "On Track" },
  { customer: "Whitecap", jobs: 7, complete: 7, overdue: 0, status: "Complete" },
  { customer: "Prairie Co.", jobs: 5, complete: 2, overdue: 2, status: "Delayed" },
  { customer: "NuVista", jobs: 9, complete: 8, overdue: 0, status: "On Track" },
];

const quickActions = [
  { label: "Add New Job", icon: "➕" },
  { label: "Upload Doc", icon: "📄" },
  { label: "Open Planner", icon: "🗓️" },
  { label: "Customer Hub", icon: "👤" },
];

export default function HubTemplateShowcase({ width = 1620, height = "calc(100vh - 36px)" }) {
  const [tab, setTab] = useState("dashboard");

  return (
    <div
      className="min-h-screen w-full font-erbaum text-white bg-fixed bg-cover"
      style={{
        backgroundImage: `url(${camoBg})`,
        backgroundColor: "#000",
        padding: 0,
        margin: 0
      }}
    >
      {/* SIDEBAR-1 */}
      <aside
        className="sidebar-1"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 220,
          height: "100vh",
          background: palomaDark,
          borderRight: `3px solid ${palomaGreen}`,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "30px 0",
          boxShadow: "2px 0 12px #0009"
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <img src="/assets/paloma-logo.png" alt="Paloma Suite" style={{ width: 88, height: 88, borderRadius: 14, boxShadow: "0 2px 8px #0007" }} />
        </div>
        <nav style={{ width: "100%" }}>
          {[
            { label: "Dashboard", id: "dashboard" },
            { label: "Jobs", id: "jobs" },
            { label: "Assets", id: "assets" },
            { label: "Finance", id: "finance" },
            { label: "RFPs", id: "rfps" },
          ].map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                padding: "12px 0",
                textAlign: "center",
                background: tab === item.id ? palomaGreen : "transparent",
                color: tab === item.id ? "#fff" : palomaGreenLight,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 1,
                cursor: "pointer",
                borderRadius: "8px 0 0 8px",
                margin: "6px 0",
                transition: "all .2s"
              }}
              className={`sidebar-nav-${idx + 1}`}
            >
              {item.label}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: "auto", marginBottom: 0 }}>
          <div style={{ fontSize: 11, color: "#ccc" }}>v2.1.0</div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main
        style={{
          marginLeft: 220,
          width: `calc(100vw - 220px)`,
          minHeight: "100vh",
          padding: "32px 0",
          background: "rgba(0,0,0,0.87)",
        }}
      >
        <div
          style={{
            width: width,
            minHeight: height,
            margin: "0 auto",
            background: "#181A17",
            borderRadius: 20,
            border: `2.5px solid ${palomaGreen}`,
            boxShadow: "0 6px 32px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* HEADER BAR - 1 */}
          <div
            className="header-1"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 36px 12px 24px",
              background: "#232723",
              borderBottom: `1.5px solid ${palomaGreenLight}`,
              minHeight: 68
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <span style={{ fontWeight: 900, fontSize: 19, color: palomaGreen, letterSpacing: 2, textShadow: "0 2px 8px #0007" }}>
                Paloma Admin Suite
              </span>
              <div style={{ background: "#222", color: palomaGreenLight, fontSize: 12, borderRadius: 6, padding: "2px 10px", fontWeight: 700, marginLeft: 8 }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Notifications Bell */}
              <div className="notifications-1" style={{ position: "relative", marginRight: 16 }}>
                <span style={{ fontSize: 23 }}>🔔</span>
                <span style={{
                  position: "absolute", top: 0, right: -4,
                  background: "#f44", color: "#fff", borderRadius: "50%", fontSize: 10, width: 18, height: 18,
                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, boxShadow: "0 2px 6px #000b"
                }}>5</span>
              </div>
              {/* Avatar */}
              <div className="avatar-1" style={{
                background: palomaGreen,
                width: 38, height: 38,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 19, fontWeight: 800, color: "#fff", boxShadow: "0 2px 8px #000a"
              }}>
                CC
              </div>
            </div>
          </div>

          {/* TABS-1 */}
          <div style={{
            background: "#161916",
            padding: "0 36px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            borderBottom: `1.5px solid ${palomaGreenLight}`,
            minHeight: 40,
            fontSize: 13
          }}>
            {[
              { label: "Overview", id: "dashboard" },
              { label: "Quick Actions", id: "actions" },
              { label: "Summary Table", id: "table" },
              { label: "Charts", id: "charts" },
              { label: "Announcements", id: "announcements" },
            ].map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  padding: "5px 18px",
                  background: tab === item.id ? palomaGreen : "transparent",
                  color: tab === item.id ? "#fff" : palomaGreenLight,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  borderRadius: 7,
                  cursor: "pointer",
                  border: tab === item.id ? `1.5px solid #000` : "none",
                  boxShadow: tab === item.id ? "0 2px 10px #0006" : "none",
                  transition: "all .18s"
                }}
                className={`tab-${idx + 1}`}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* MAIN DASHBOARD GRID */}
          <div
            className="dashboard-main"
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "2.3fr 1fr",
              gap: 36,
              padding: "32px 36px 28px 36px",
              background: "none"
            }}
          >
            {/* LEFT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
              {/* Info Cards Row */}
              {tab === "dashboard" && (
                <div className="info-row-1" style={{ display: "flex", gap: 14 }}>
                  {statsData.map((stat, i) => (
                    <div
                      key={i}
                      className={`info-card-${i + 1}`}
                      style={{
                        background: "#212821",
                        borderRadius: 12,
                        border: `1.7px solid ${palomaGreen}`,
                        flex: 1,
                        minWidth: 120,
                        padding: "18px 15px 13px 15px",
                        boxShadow: "0 2px 16px #000a",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        position: "relative"
                      }}
                    >
                      <span style={{
                        fontSize: 14,
                        fontWeight: 800,
                        letterSpacing: 1.1,
                        color: palomaGreen,
                        marginBottom: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      }}>
                        {stat.icon} {stat.label}
                      </span>
                      <span style={{ fontSize: 27, fontWeight: 900, color: "#fff" }}>{stat.value}</span>
                      {/* Progress Bar */}
                      <div style={{
                        width: "100%",
                        height: 7,
                        background: "#1c211d",
                        borderRadius: 8,
                        marginTop: 7,
                        position: "relative",
                        overflow: "hidden"
                      }}>
                        <div
                          style={{
                            width: `${20 + stat.value * 0.9}%`,
                            height: "100%",
                            background: palomaGreen,
                            borderRadius: 8,
                            transition: "width .5s"
                          }}
                        />
                      </div>
                      <div style={{
                        position: "absolute",
                        top: 10,
                        right: 12,
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#eee8"
                      }}>
                        {stat.value > 50 ? "✔️" : stat.value > 5 ? "⏳" : "⚠️"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Table Section */}
              {tab === "table" && (
                <div
                  className="table-1"
                  style={{
                    background: "#181C18",
                    borderRadius: 12,
                    border: `1.5px solid ${palomaGreenLight}`,
                    boxShadow: "0 2px 12px #0009",
                    overflow: "hidden",
                  }}
                >
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                    <thead style={{ background: "#0a0a0a" }}>
                      <tr>
                        <th style={{ color: palomaGreen, padding: "14px 0", fontWeight: 800, letterSpacing: 1.1, borderBottom: `2.5px solid ${palomaGreen}` }}>Customer</th>
                        <th style={{ color: "#fff", padding: "14px 0", fontWeight: 800, letterSpacing: 1.1, borderBottom: `2.5px solid ${palomaGreen}` }}>Jobs</th>
                        <th style={{ color: "#fff", padding: "14px 0", fontWeight: 800, letterSpacing: 1.1, borderBottom: `2.5px solid ${palomaGreen}` }}>Complete</th>
                        <th style={{ color: "#fff", padding: "14px 0", fontWeight: 800, letterSpacing: 1.1, borderBottom: `2.5px solid ${palomaGreen}` }}>Overdue</th>
                        <th style={{ color: "#fff", padding: "14px 0", fontWeight: 800, letterSpacing: 1.1, borderBottom: `2.5px solid ${palomaGreen}` }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "#181A19" : "#212921" }}>
                          <td style={{ color: palomaGreen, fontWeight: 700, padding: "12px 0", textAlign: "center" }}>{row.customer}</td>
                          <td style={{ color: "#fff", fontWeight: 700, padding: "12px 0", textAlign: "center" }}>{row.jobs}</td>
                          <td style={{ color: palomaGreenLight, fontWeight: 700, padding: "12px 0", textAlign: "center" }}>{row.complete}</td>
                          <td style={{ color: row.overdue > 0 ? "#fa3" : "#ccc", fontWeight: 700, padding: "12px 0", textAlign: "center" }}>{row.overdue}</td>
                          <td style={{ color: row.status === "Complete" ? "#5d9" : row.status === "Delayed" ? "#fa3" : "#fff", fontWeight: 700, padding: "12px 0", textAlign: "center" }}>{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Chart Panel */}
              {tab === "charts" && (
                <div className="chart-panel-1" style={{
                  display: "flex", gap: 24, alignItems: "stretch",
                  justifyContent: "center",
                  width: "100%"
                }}>
                  {/* Pie Chart Placeholder */}
                  <div style={{
                    background: "#181C18",
                    borderRadius: 14,
                    flex: 1,
                    padding: 30,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    border: `1.8px solid ${palomaGreenLight}`,
                    boxShadow: "0 2px 10px #000a",
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: palomaGreen, marginBottom: 10 }}>Asset Distribution</div>
                    <div style={{
                      width: 120, height: 120, background: "#111",
                      borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: palomaGreenLight, marginBottom: 10,
                      border: `4px dashed ${palomaGreenLight}`
                    }}>
                      Pie Chart
                    </div>
                    <div style={{ fontSize: 12, color: "#bbb" }}>Pie chart: asset types (dummy)</div>
                  </div>
                  {/* Sparkline Chart Placeholder */}
                  <div style={{
                    background: "#181C18",
                    borderRadius: 14,
                    flex: 1,
                    padding: 30,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    border: `1.8px solid ${palomaGreenLight}`,
                    boxShadow: "0 2px 10px #000a",
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: palomaGreen, marginBottom: 10 }}>Weekly Completion Rate</div>
                    <div style={{
                      width: 150, height: 62, background: "#101411",
                      borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: palomaGreenLight, marginBottom: 12,
                      border: `2px solid ${palomaGreenLight}`
                    }}>
                      Sparkline
                    </div>
                    <div style={{ fontSize: 12, color: "#bbb" }}>Sparkline: jobs completed by week (dummy)</div>
                  </div>
                </div>
              )}

              {/* Announcements */}
              {tab === "announcements" && (
                <div
                  style={{
                    background: "#191c19",
                    borderRadius: 12,
                    padding: 32,
                    border: `1.5px solid ${palomaGreenLight}`,
                    boxShadow: "0 2px 12px #0008",
                    minHeight: 220
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 17, color: palomaGreen, marginBottom: 15 }}>Paloma Announcements</div>
                  <ul style={{ fontSize: 14, lineHeight: 1.65, color: "#fff", paddingLeft: 16 }}>
                    <li>🚀 New Job Planner module released July 14</li>
                    <li>🎉 Major system update: Night Mode default</li>
                    <li>📊 Monthly stats will update live</li>
                    <li>💬 Feedback? Email conor@paloma.com</li>
                  </ul>
                </div>
              )}

              {/* Quick Actions */}
              {tab === "actions" && (
                <div
                  className="quick-actions-1"
                  style={{
                    display: "flex",
                    gap: 22,
                    justifyContent: "flex-start"
                  }}
                >
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      style={{
                        background: palomaGreen,
                        color: "#fff",
                        border: "none",
                        borderRadius: 9,
                        padding: "18px 28px",
                        fontSize: 17,
                        fontWeight: 900,
                        letterSpacing: 1.2,
                        boxShadow: "0 2px 10px #0006",
                        cursor: "pointer",
                        outline: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 13,
                        transition: "background .16s"
                      }}
                      className={`quick-action-btn-${i + 1}`}
                      onClick={() => alert(action.label + " (Demo)")}
                    >
                      <span>{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Default: Operational Snapshot with Chart */}
              {tab === "dashboard" && (
                <div
                  className="snapshot-chart-1"
                  style={{
                    background: "#151B14",
                    borderRadius: 14,
                    padding: 32,
                    flex: 1,
                    border: `1.5px solid ${palomaGreenLight}`,
                    boxShadow: "0 2px 10px #0007",
                    marginTop: 7,
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 17, color: palomaGreen, marginBottom: 16 }}>
                    30-day Operational Snapshot
                  </div>
                  <div style={{
                    width: "100%",
                    minHeight: 190,
                    background: "#101411",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    color: palomaGreenLight,
                    border: `2px dashed ${palomaGreenLight}`
                  }}>
                    [ Area Chart Placeholder ]
                  </div>
                  <div style={{ marginTop: 20, fontSize: 13, color: "#bbb", textAlign: "center" }}>
                    Area chart showing jobs, assets, completions by day (dummy)
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Notifications Feed, Action Center */}
            <div style={{ display: "flex", flexDirection: "column", gap: 26, minWidth: 0 }}>
              {/* Notifications */}
              <div
                className="notifications-feed-1"
                style={{
                  background: "#1a211c",
                  borderRadius: 13,
                  border: `1.5px solid ${palomaGreenLight}`,
                  boxShadow: "0 2px 10px #0009",
                  padding: "18px 14px",
                  marginBottom: 7,
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                  minHeight: 188,
                  maxHeight: 235,
                  overflowY: "auto"
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 15, color: palomaGreen, marginBottom: 2, textAlign: "center" }}>
                  NOTIFICATIONS
                </div>
                {notifications.map((note, i) => (
                  <div key={i} style={{
                    background: "#232723",
                    border: `1.1px solid ${palomaGreen}`,
                    borderRadius: 6,
                    padding: "10px 13px",
                    fontSize: 12,
                    color: "#fff",
                    fontWeight: 600,
                    letterSpacing: 0.6
                  }}>
                    {note}
                  </div>
                ))}
              </div>
              {/* Action Center */}
              <div
                className="action-center-1"
                style={{
                  background: "#1a191f",
                  borderRadius: 13,
                  border: `1.5px solid ${palomaGreenLight}`,
                  boxShadow: "0 2px 10px #000a",
                  padding: "24px 18px",
                  minHeight: 190,
                  display: "flex",
                  flexDirection: "column",
                  gap: 19,
                  alignItems: "center"
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 15, color: palomaGreen, marginBottom: 2 }}>
                  ACTION CENTER
                </div>
                <button
                  style={{
                    background: palomaGreen,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "11px 24px",
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: 1.1,
                    margin: "2px 0",
                    boxShadow: "0 2px 10px #0004",
                    cursor: "pointer",
                  }}
                  onClick={() => alert("Action performed! (Demo)")}
                >
                  Execute Bulk Action
                </button>
                <div style={{ fontSize: 12, color: "#bbb", textAlign: "center" }}>
                  Use this panel for bulk actions, urgent items or smart automations.<br />
                  Customizable per-user!
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
