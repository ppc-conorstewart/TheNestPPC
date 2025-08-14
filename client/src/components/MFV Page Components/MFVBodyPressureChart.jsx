// ==============================
// MFVBodyPressureChart.jsx — ChartJS with Exportable Image Support via Ref & Black Background
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
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Line } from "react-chartjs-2";

// Ensure controllers are registered even if parent doesn't
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const blackBgPlugin = {
  id: "blackBg",
  beforeDraw: (chart) => {
    const ctx = chart.canvas.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#000"; // true black background
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};

const MFVBodyPressureChart = forwardRef(function MFVBodyPressureChart(
  {
    displayHeaders,
    displayRows,
    pads,
    selectedPad,
    hideTitle
  },
  ref
) {
  const hasData =
    Array.isArray(displayHeaders) &&
    Array.isArray(displayRows) &&
    displayHeaders.length > 0 &&
    displayRows.length > 0;

  const chartJsRef = useRef();

  // Allow parent to export chart as PNG (for PDF)
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

  // If no data yet, render a stable empty state instead of returning null (prevents layout jumps)
  if (!hasData) {
    return (
      <div className="w-full h-full p-4 bg-black border-2 border-[#6a7257] rounded-xl shadow-lg flex items-center justify-center">
        <div className="text-gray-300 font-erbaum tracking-wide uppercase text-sm">
          No data to display
        </div>
      </div>
    );
  }

  const dateColIdx = 0;
  const startIdx = 3;

  const dates = displayRows.map((r) => {
    const raw = Array.isArray(r) ? r[dateColIdx] : r?.[dateColIdx] ?? "";
    try {
      return format(parseISO(String(raw)), "MMMM do 'at' HH:mm");
    } catch {
      return String(raw);
    }
  });

  const valveCols = displayHeaders.slice(startIdx);

  const softerPalette = [
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

  const datasets = valveCols.map((col, i) => ({
    label: col,
    data: displayRows.map((r) => {
      const raw = Array.isArray(r) ? (r[startIdx + i] ?? "") : r?.[startIdx + i] ?? "";
      const num = parseInt(String(raw).replace(/\D/g, ""), 10);
      return isNaN(num) ? 0 : num;
    }),
    fill: false,
    borderWidth: 2,
    borderColor: softerPalette[i % softerPalette.length],
    backgroundColor: softerPalette[i % softerPalette.length],
    pointRadius: 2,
    pointHoverRadius: 5,
    tension: 0.3
  }));

  const thresholdData = Array(dates.length).fill(9000);
  datasets.push({
    label: "9000 PSI Threshold",
    data: thresholdData,
    fill: false,
    borderColor: "rgba(220,20,60,0.8)",
    borderWidth: 3,
    borderDash: [6, 4],
    pointRadius: 0,
    order: 0
  });

  return (
    <div className="w-full h-full p-4 bg-black border-2 border-[#6a7257] rounded-xl shadow-lg">
      <Line
        ref={chartJsRef}
        data={{ labels: dates, datasets }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                boxWidth: 10,
                color: "#fff",
                usePointStyle: true,
                pointStyle: "circle"
              }
            },
            title: {
              display: !hideTitle,
              text: `Daily Body Pressure – ${
                pads.find((p) => p.key === selectedPad)?.label || ""
              }`,
              color: "#fff",
              font: { size: 18 }
            }
          },
          layout: {
            padding: { bottom: 20 }
          },
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
          }
        }}
        plugins={[
          blackBgPlugin,
          {
            id: "legendBg",
            beforeDraw: (chart) => {
              const { ctx, legend } = chart;
              if (!legend) return;
              ctx.save();
              ctx.fillStyle = "#000000ff";
              ctx.fillRect(
                legend.left - 12,
                legend.top - 8,
                legend.width + 24,
                legend.height + 20
              );
              ctx.restore();
            }
          }
        ]}
      />
    </div>
  );
});

export default MFVBodyPressureChart;
