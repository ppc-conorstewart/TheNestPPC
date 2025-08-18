// ===============================
// ValveStatsChart.jsx — Chart for Valve Analytics
// ===============================
import { Bar, Doughnut } from "react-chartjs-2";

export default function ValveStatsChart({ chartType, chartData }) {
  const labels = chartData.map(d => d.size);
  const dataMFV = chartData.map(d => d.MFV);
  const dataOEM = chartData.map(d => d.OEM);

  const data = {
    labels,
    datasets: [
      {
        label: "MFV",
        data: dataMFV,
        borderWidth: 1,
      },
      {
        label: "OEM",
        data: dataOEM,
        borderWidth: 1,
      },
    ],
  };

  // Donut chart: combine all MFV/OEM counts for all sizes
  const donutData = {
    labels: ["MFV", "OEM"],
    datasets: [
      {
        data: [
          chartData.reduce((a, c) => a + c.MFV, 0),
          chartData.reduce((a, c) => a + c.OEM, 0),
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: 320, minWidth: 220, maxWidth: 400 }}>
      {chartType === "bar" ? (
        <Bar
          data={data}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true },
            },
            scales: {
              x: { beginAtZero: true, title: { display: true, text: "Valve Size" } },
              y: { beginAtZero: true, title: { display: true, text: "Count" }, precision: 0 },
            },
          }}
        />
      ) : (
        <Doughnut
          data={donutData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true, position: "bottom" },
            },
            cutout: 64,
          }}
        />
      )}
    </div>
  );
}
