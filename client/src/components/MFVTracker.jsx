import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Filler, annotationPlugin);

const PALOMA_GREEN = "#a2b978";
const CONOCO_RED = "#e93232";
const COLORS = [
  "#a2b978", "#57b4ff", "#ffe066", "#4adeff", "#eaffef", "#ffd2b6", "#d57fff",
  "#95e7a6", "#e93232", "#ff7d7d", "#6a7257", "#ffe066", "#ffbe76", "#e77f67", "#b8e994"
];

const VALVES = [
  { well: "Bravo", ppc: "3595", location: "Upper Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Bravo", ppc: "32766", location: "Lower Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Bravo", ppc: "41674", location: "Inline ISO", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Bravo", ppc: "34425", location: "Hydraulic Master", data: [2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000] },
  { well: "Charlie", ppc: "34517", location: "Upper Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Charlie", ppc: "30373", location: "Lower Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Charlie", ppc: "33872", location: "Inline ISO", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Charlie", ppc: "34283", location: "Hydraulic Master", data: [2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000] },
  { well: "Delta", ppc: "20630", location: "Hydraulic Master", data: [2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,0,0,0,0,0,0] },
  { well: "Delta", ppc: "42106", location: "Upper Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Delta", ppc: "30357", location: "Lower Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Delta", ppc: "34816", location: "Inline ISO", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Echo", ppc: "24622", location: "Hydraulic Master", data: [2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2500,2000,2000,2000,2500,2500] },
  { well: "Echo", ppc: "4813", location: "Upper Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Echo", ppc: "30486", location: "Lower Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Echo", ppc: "30267", location: "Inline ISO", data: [0,0,0,0,0,0,0,0,0,0,2000,0,0,0,0,0] },
  { well: "Foxtrot", ppc: "30340", location: "Hydraulic Master", data: [2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,0] },
  { well: "Foxtrot", ppc: "4855", location: "Inline ISO", data: [0,0,0,0,0,0,0,0,0,0,0,1000,1000,1000,0,0] },
  { well: "Foxtrot", ppc: "32753", location: "Upper Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Foxtrot", ppc: "20999", location: "Lower Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Golf", ppc: "34277", location: "Hydraulic Master", data: [2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,3000,2000,2000,2000,2000,0] },
  { well: "Golf", ppc: "41326", location: "Inline ISO", data: [0,0,0,0,0,0,0,0,0,0,500,500,500,500,500,0] },
  { well: "Golf", ppc: "32744", location: "Lower Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Golf", ppc: "2844", location: "Upper Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Hotel", ppc: "32694", location: "Upper Master", data: [2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,0,0] },
  { well: "Hotel", ppc: "40093", location: "Inline ISO", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Hotel", ppc: "3415", location: "Lower Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Hotel", ppc: "4152", location: "Upper Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Indigo", ppc: "33892", location: "Hydraulic Master", data: [2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2500,0,0,0,0,0] },
  { well: "Indigo", ppc: "30284", location: "Lower Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { well: "Indigo", ppc: "40210", location: "Upper Zipper", data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
];

const chartLabels = [
  "Day 1","Day 2","Day 3","Day 4","Day 5","Day 6","Day 7","Day 8",
  "Day 9","Day 10","Day 11","Day 12","Day 13","Day 14","Day 15","Day 16"
];

const chartData = {
  labels: chartLabels,
  datasets: VALVES.map((row, idx) => ({
    label: `${row.ppc} - ${row.location} - ${row.well}`,
    data: row.data,
    borderColor: COLORS[idx % COLORS.length],
    backgroundColor: COLORS[idx % COLORS.length] + "33",
    borderWidth: 2,
    pointRadius: 2,
    tension: 0.33,
    spanGaps: true
  }))
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (ctx) {
          return (
            (chartData.datasets[ctx.datasetIndex]?.label || "") +
            ": " +
            (ctx.formattedValue || "") +
            " psi"
          );
        }
      }
    },
    annotation: {
      annotations: {
        threshold: {
          type: "line",
          yMin: 9000,
          yMax: 9000,
          borderColor: CONOCO_RED,
          borderWidth: 2.5,
          borderDash: [7, 8],
          label: {
            display: true,
            content: "9000 PSI THRESHOLD",
            position: "start",
            color: "#fff",
            backgroundColor: CONOCO_RED,
            font: {
              size: 13,
              weight: "bold"
            }
          }
        }
      }
    }
  },
  layout: { padding: 0 },
  scales: {
    y: {
      min: 0,
      max: 15000,
      ticks: { color: PALOMA_GREEN, font: { size: 12 } },
      grid: { color: PALOMA_GREEN + "55", lineWidth: 0.7 }
    },
    x: {
      ticks: {
        display: false
      },
      grid: { color: PALOMA_GREEN + "22" },
      title: {
        display: true,
        text: "FULL JOB DURATION",
        color: "#ffe066",
        font: { size: 18, weight: "bold" },
        padding: { top: 28 }
      }
    }
  }
};

export default function MFVTrackerLandscape() {
  // Helper to uppercase all index text
  const getIndexLabel = (row) =>
    `${row.ppc} - ${row.location} - ${row.well}`.toUpperCase();

  return (
    <div style={{
      background: "#000",
      minHeight: "100vh",
      color: PALOMA_GREEN,
      fontFamily: "Erbaum, monospace, Arial",
      padding: 0,
      position: "relative",
      width: "100%",
      overflowX: "auto",
    }}>
      {/* ---- SPACER/HEADER FOR JOB INFO ---- */}
      <div style={{
        width: "100%",
        minWidth: "1008px",
        maxWidth: "1344px",
        margin: "0 auto",
        padding: "26px 0 0 0",
        background: "none",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 42,
        height: 60
      }}>
        <div style={{
          color: "#ffe066",
          fontWeight: 700,
          fontSize: "1.04rem",
          letterSpacing: ".05em"
        }}>
          {/* Job Info / Controls / Buttons Here */}
        </div>
      </div>
      {/* ---- MAIN CHART+INDEX LANDSCAPE (logo centered above chart) ---- */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "flex-start",
        width: "100%",
        minWidth: "1008px",
        maxWidth: "1344px",
        margin: "0 auto",
        background: "#000",
        borderRadius: 0,
        border: `2.5px solid ${PALOMA_GREEN}`,
        boxShadow: "0 8px 44px 0 #181f1060",
      }}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
        }}>
          {/* Index (twice as wide) */}
          <div style={{
            minWidth: 268,
            maxWidth: 358,
            background: "#000",
            border: "none",
            borderRadius: 0,
            padding: "13px 9px 13px 44px",
            fontSize: "0.70rem",
            fontWeight: 500,
            color: PALOMA_GREEN,
            fontFamily: "monospace",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            textTransform: "uppercase"
          }}>
            <div
              style={{
                fontWeight: 900,
                fontSize: "0.78rem",
                color: "#ffe066",
                letterSpacing: ".04em",
                marginBottom: 8,
                marginLeft: 3,
                textShadow: "0 2px 8px #0007",
                textTransform: "uppercase"
              }}
            >
              VALVE INDEX
            </div>
            {VALVES.map((row, idx) => (
              <div
                key={`${row.ppc}-${row.location}-${row.well}`}
                style={{
                  color: COLORS[idx % COLORS.length],
                  fontWeight: 700,
                  borderBottom: "1px dashed #42493d",
                  marginBottom: 2,
                  paddingBottom: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: "0.70rem",
                  textTransform: "uppercase"
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 18,
                    height: 6,
                    background: COLORS[idx % COLORS.length],
                    borderRadius: 3,
                    marginRight: 6,
                    borderBottom: idx % 2 === 0 ? "2px dotted #ffe066" : "",
                  }}
                ></span>
                <span>
                  {getIndexLabel(row)}
                </span>
              </div>
            ))}
          </div>
          {/* Divider */}
          <div style={{
            width: 2.5,
            background: PALOMA_GREEN,
            margin: "0 17px",
            borderRadius: 3,
            alignSelf: "flex-start",
            minHeight: 80,
            opacity: 0.34
          }} />
          {/* Chart panel with logo and info */}
          <div style={{
            flex: 1,
            background: "#000",
            border: "none",
            borderRadius: 0,
            padding: "9px 24px 9px 0",
            minWidth: "784px",
            maxWidth: "1176px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            {/* Logo */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              marginBottom: "6px"
            }}>
              <img
                src="/assets/logos/conocophilips.png"
                alt="ConocoPhillips"
                style={{
                  width: "32%",
                  maxWidth: "330px",
                  minWidth: "160px",
                  objectFit: "contain",
                  display: "block",
                  borderRadius: "8px",
                  boxShadow: "0 3px 14px #0006",
                  background: "#fff",
                  padding: "6px 10px",
                }}
              />
            </div>
            {/* Project Info Centered Under Logo */}
            <div style={{
              width: "100%",
              textAlign: "center",
              color: "#fff",
              margin: "5px 0 15px 0",
              fontSize: "1.08rem",
              fontFamily: "Erbaum, Arial, sans-serif",
              letterSpacing: ".04em",
              fontWeight: 700,
              lineHeight: 1.4
            }}>
              <div style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.14rem",
                marginBottom: 5,
                letterSpacing: ".04em"
              }}>CONOCO B-25-K</div>
              <div style={{ fontSize: "1.01rem", fontWeight: 500, marginBottom: 0 }}>
                <span style={{ color: PALOMA_GREEN }}>RIG-IN DATE:&nbsp;</span>
                <span style={{ color: "#fff" }}>2025-04-04</span>
                <span style={{ color: PALOMA_GREEN }}> &nbsp;|&nbsp; SHUTDOWN DATES:&nbsp;</span>
                <span style={{ color: "#fff" }}>2025-04-24 to 2025-05-03</span>
                <br />
                <span style={{ color: PALOMA_GREEN }}>RIG-OUT START DATE:&nbsp;</span>
                <span style={{ color: "#fff" }}>2025-06-06</span>
              </div>
            </div>
            <div style={{
              width: "100%",
              minHeight: 504
            }}>
              <Line data={chartData} options={chartOptions} height={504}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
