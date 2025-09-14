// ==============================
// MFVBodyPressureChart.jsx — Right-Panel Legend with Click-to-Isolate & Reset-All (Hooks-safe)
// ==============================
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from "chart.js";
import { format, parseISO } from "date-fns";
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// ==============================
// Plugins
// ==============================
const blackBgPlugin = {
  id: "blackBg",
  beforeDraw: (chart) => {
    const ctx = chart.canvas.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};

// ==============================
// Component
// ==============================
const MFVBodyPressureChart = forwardRef(function MFVBodyPressureChart(
  { displayHeaders, displayRows, pads, selectedPad, hideTitle },
  ref
) {
  const chartJsRef = useRef();
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Always compute with safe fallbacks so hooks run every render
  const safeHeaders = Array.isArray(displayHeaders) ? displayHeaders : [];
  const safeRows = Array.isArray(displayRows) ? displayRows : [];
  const hasData = safeHeaders.length > 0 && safeRows.length > 0;

  // Export (keep hook order stable)
  useImperativeHandle(ref, () => ({
    toBase64Image: () => {
      if (chartJsRef.current) {
        if (typeof chartJsRef.current.toBase64Image === "function") {
          return chartJsRef.current.toBase64Image("image/png", 1);
        }
        if (
          chartJsRef.current.chartInstance &&
          typeof chartJsRef.current.chartInstance.toBase64Image === "function"
        ) {
          return chartJsRef.current.chartInstance.toBase64Image("image/png", 1);
        }
      }
      return null;
    }
  }));

  // Data prep (hooks always executed)
  const dateColIdx = 0;
  const startIdx = 3;

  const dates = useMemo(
    () =>
      safeRows.map((r) => {
        const raw = Array.isArray(r) ? r[dateColIdx] : r?.[dateColIdx] ?? "";
        try {
          return format(parseISO(String(raw)), "MMMM do 'at' HH:mm");
        } catch {
          return String(raw);
        }
      }),
    [safeRows]
  );

  const valveCols = useMemo(() => safeHeaders.slice(startIdx), [safeHeaders]);

  const palette = [
    "#A3BE8C",
    "#88C0D0",
    "#EBCB8B",
    "#B48EAD",
    "#81A1C1",
    "#D08770",
    "#8FBCBB",
    "#5E81AC",
    "#E06C75",
    "#61AFEF",
    "#C678DD",
    "#98C379"
  ];

  const datasets = useMemo(() => {
    const ds = valveCols.map((col, i) => {
      const series = safeRows.map((r) => {
        const raw = Array.isArray(r) ? (r[startIdx + i] ?? "") : r?.[startIdx + i] ?? "";
        const num = parseInt(String(raw).replace(/\D/g, ""), 10);
        return isNaN(num) ? 0 : num;
      });

      const isDimmed = selectedIndex !== null && selectedIndex !== i;

      return {
        label: col,
        data: series,
        fill: false,
        borderWidth: isDimmed ? 1 : 2,
        borderColor: isDimmed ? `${palette[i % palette.length]}33` : palette[i % palette.length],
        backgroundColor: isDimmed ? `${palette[i % palette.length]}33` : palette[i % palette.length],
        pointRadius: isDimmed ? 0 : 2,
        pointHoverRadius: isDimmed ? 0 : 5,
        tension: 0.3,
        hidden: false,
        order: 1
      };
    });

    ds.push({
      label: "9000 PSI Threshold",
      data: Array(dates.length).fill(9000),
      fill: false,
      borderColor: "rgba(220,20,60,0.8)",
      borderWidth: 3,
      borderDash: [6, 4],
      pointRadius: 0,
      order: 0
    });

    return ds;
  }, [valveCols, safeRows, selectedIndex, dates.length]);

  // Legend item (no hooks here)
  const LegendItem = ({ idx, label, color }) => {
    const isActive = selectedIndex === idx;
    return (
      <button type="button" onClick={() => setSelectedIndex(idx)} className="w-full text-left" title={label}>
        <div
          className="flex items-center gap-2 px-2 py-1 rounded select-none transition-all"
          style={{
            background: isActive ? "#21281b" : "transparent",
            border: "1px solid #2b3325",
            marginBottom: 6,
            boxShadow: isActive ? "0 0 0 1px #6a7257 inset" : "none"
          }}
        >
          <span
            className="inline-block"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: color,
              boxShadow: isActive ? `0 0 8px ${color}` : "none"
            }}
          />
          <span
            className="text-[11px] uppercase tracking-wide font-erbaum"
            style={{ color: "#e6e8df", letterSpacing: "0.04em" }}
          >
            {label}
          </span>
        </div>
      </button>
    );
  };

  const selectedLabel = selectedIndex === null ? null : valveCols[selectedIndex] || null;

  // Render
  return (
    <div className="w-full h-full bg-black border-2 border-[#6a7257] rounded-xl shadow-lg flex">
      <div className="flex-1 p-4">
        {hasData ? (
          <Line
            ref={chartJsRef}
            data={{ labels: dates, datasets }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: {
                  display: !hideTitle,
                  text: `Daily Body Pressure – ${
                    pads.find((p) => p.key === selectedPad)?.label || ""
                  }`,
                  color: "#fff",
                  font: { size: 18 }
                },
                tooltip: { mode: "index", intersect: false }
              },
              layout: { padding: { right: 24, left: 10, bottom: 12, top: 8 } },
              scales: {
                x: {
                  ticks: { color: "#ddd", maxRotation: 60, minRotation: 60 },
                  grid: { color: "#333" },
                  title: { display: true, text: "Date", color: "#aaa" }
                },
                y: {
                  beginAtZero: true,
                  min: 0,
                  max: 15000,
                  ticks: { color: "#ddd" },
                  grid: { color: "#333" },
                  title: { display: true, text: "PSI", color: "#aaa" }
                }
              },
              animation: { duration: 250 }
            }}
            plugins={[blackBgPlugin]}
          />
        ) : (
          <div className="w-full h-full p-4 bg-black border-2 border-[#6a7257] rounded-xl shadow-lg flex items-center justify-center">
            <div className="text-gray-300 font-erbaum tracking-wide uppercase text-sm">
              No data to display
            </div>
          </div>
        )}
      </div>

      <div
        className="w-[280px] min-w-[280px] max-w-[280px] border-l-2 border-[#6a7257] p-3 overflow-auto"
        style={{ background: "#0a0b09" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-[#cfd3c3] font-varien uppercase tracking-wider text-sm">Legend</div>
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            className="px-2 py-1 text-[10px] font-bold uppercase rounded border border-[#6a7257] bg-[#23281c] text-[#e6e8df] hover:bg-[#2b3325] transition-all"
            title="Show all lines"
          >
            Reset
          </button>
        </div>

        <div className="mb-3 px-2 py-2 rounded border" style={{ borderColor: "#2b3325", background: "#0f120e" }}>
          <div className="text-[10px] uppercase tracking-widest text-[#949C7F] mb-1">Selected Valve</div>
          <div className="text-[11px] text-[#e6e8df] font-erbaum">{selectedLabel ? selectedLabel : "All"}</div>
        </div>

        <div className="space-y-0.5">
          {valveCols.map((label, i) => (
            <LegendItem key={i} idx={i} label={label} color={palette[i % palette.length]} />
          ))}
          <div className="mt-3 flex items-center gap-2 opacity-90">
            <span style={{ width: 18, height: 0, borderTop: "3px dashed rgba(220,20,60,0.8)" }} />
            <span className="text-[11px] uppercase tracking-wide font-erbaum text-[#ffdf66]">9000 PSI Threshold</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MFVBodyPressureChart;
