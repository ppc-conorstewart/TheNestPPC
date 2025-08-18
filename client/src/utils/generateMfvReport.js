// ==============================
// Imports
// ==============================
import jsPDF from "jspdf";
import "jspdf-autotable";

// ==============================
// Helpers: Validation & Analysis
// ==============================
function isValidPressure(val) {
  const n = Number(val);
  return !isNaN(n) && n >= 0 && n < 20000; // allow zeros
}

function analyzeValves(headers, rows) {
  const ppcStartIdx = 3;
  const ppcHeaders = headers.slice(ppcStartIdx);

  return ppcHeaders.map((ppc, i) => {
    const pressures = rows
      .map((row) => {
        let v = row[ppcStartIdx + i];
        if (typeof v === "number") return v;
        let s = String(v || "").replace(/,/g, "").replace(/[^\d.]/g, "");
        if (s === "") return 0;
        let n = parseFloat(s);
        return isNaN(n) ? 0 : n;
      })
      .filter(isValidPressure);

    const highCount = pressures.filter((p) => p > 9000).length;
    const highest = pressures.length ? Math.max(...pressures) : 0;
    const designation = highCount > 1 ? "TEARDOWN" : "RE-TEST";
    return {
      ppc,
      highest,
      highCount,
      designation,
      pressures,
    };
  });
}

// ==============================
// Helpers: Image Load
// ==============================
async function loadImageBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL("image/png");
      resolve(base64);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ==============================
// Main Export
// ==============================
export default async function generateMfvReport({
  headers,
  rows,
  padLabel,
  customer,
  lsd,
  chartBase64,
}) {
  // ------------------------------
  // Page 1: Portrait Header + Summary Table + Centered Lists
  // ------------------------------
  const logoUrl = "/assets/Paloma_Logo_White_Rounded3.png";
  let logoBase64 = null;
  try {
    logoBase64 = await loadImageBase64(logoUrl);
  } catch (e) {
    logoBase64 = null;
  }

  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  if (logoBase64) {
    const logoWidth = 170;
    const logoHeight = 55;
    doc.addImage(
      logoBase64,
      "PNG",
      (pageWidth - logoWidth) / 2,
      28,
      logoWidth,
      logoHeight,
      undefined,
      "FAST"
    );
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("PALOMA PRESSURE CONTROL", pageWidth / 2, 100, { align: "center" });

  const reportTitle = `${(customer || "").toUpperCase()} ${(lsd || "").toUpperCase()} MFV REPORT`;
  doc.setFontSize(22);
  doc.text(reportTitle, pageWidth / 2, 130, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DATE:", 70, 155);
  doc.setFont("helvetica", "normal");
  doc.text(`${new Date().toLocaleDateString()}`, 200, 155);
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER:", 70, 174);
  doc.setFont("helvetica", "normal");
  doc.text((customer || "").toUpperCase(), 200, 174);
  doc.setFont("helvetica", "bold");
  doc.text("LSD:", 70, 193);
  doc.setFont("helvetica", "normal");
  doc.text((lsd || "").toUpperCase(), 200, 193);

  const valveStats = analyzeValves(headers, rows);

  // --- Summary table with colored far-right column ---
  doc.autoTable({
    head: [["PPC #", "Highest PSI", "# >9000PSI", "RETEST/TEARDOWN"]],
    body: valveStats.map((v) => [v.ppc, v.highest, v.highCount, v.designation]),
    startY: 215,
    theme: "grid",
    headStyles: {
      fillColor: [106, 114, 87],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    styles: { fontSize: 11, halign: "center", cellPadding: 3 },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 3) {
        const val = String(data.cell.raw || "");
        if (val === "TEARDOWN") {
          data.cell.styles.textColor = [210, 46, 46];
          data.cell.styles.fontStyle = "bold";
        } else if (val === "RE-TEST") {
          data.cell.styles.textColor = [36, 185, 85];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  // --- Centered two-column lists (no boxes; black headers) ---
  let listsStartY =
    (doc.previousAutoTable && doc.previousAutoTable.finalY + 40) || 255;
  if (listsStartY > pageHeight - 220) {
    doc.addPage("a4", "portrait");
    listsStartY = 120;
  } else {
    listsStartY = Math.max(listsStartY, 260);
  }

  const teardownVals = valveStats.filter((v) => v.designation === "TEARDOWN");
  const retestVals = valveStats.filter((v) => v.designation === "RE-TEST");

  const colGap = 32;
  const colWidth = 200; // fixed for balance
  const totalWidth = colWidth * 2 + colGap;
  const leftX = (pageWidth - totalWidth) / 2;
  const rightX = leftX + colWidth + colGap;

  doc.setFont("erbaum", "bold"); // keep styling consistent with your theme
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("TEARDOWN", leftX, listsStartY);
  doc.text("RE-TEST", rightX, listsStartY);

  const lineH = 20;
  let yLeft = listsStartY + 20;
  let yRight = listsStartY + 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  // Teardown items (red)
  doc.setTextColor(210, 46, 46);
  if (teardownVals.length === 0) {
    doc.text("None", leftX, yLeft);
    yLeft += lineH;
  } else {
    teardownVals.forEach((v) => {
      const lines = doc.splitTextToSize(v.ppc, colWidth);
      lines.forEach((ln) => {
        doc.text(ln, leftX, yLeft);
        yLeft += lineH;
      });
    });
  }

  // Retest items (green)
  doc.setTextColor(36, 185, 85);
  if (retestVals.length === 0) {
    doc.text("None", rightX, yRight);
    yRight += lineH;
  } else {
    retestVals.forEach((v) => {
      const lines = doc.splitTextToSize(v.ppc, colWidth);
      lines.forEach((ln) => {
        doc.text(ln, rightX, yRight);
        yRight += lineH;
      });
    });
  }

  doc.setTextColor(0, 0, 0);

  // ------------------------------
  // Page 2: Landscape Chart (fills area)
  // ------------------------------
  if (chartBase64) {
    doc.addPage("a4", "landscape");
    const lw = doc.internal.pageSize.getWidth();
    const lh = doc.internal.pageSize.getHeight();
    const left = 30;
    const top = 60;
    const width = lw - left * 2;
    const height = lh - top - 40;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text("BODY PRESSURE CHART", lw / 2, 40, { align: "center" });
    doc.addImage(chartBase64, "PNG", left, top, width, height, undefined, "FAST");
  }

  // ------------------------------
  // Page 3+: Landscape Table (reserved title band)
  // ------------------------------
  doc.addPage("a4", "landscape");
  const lw = doc.internal.pageSize.getWidth();
  const bodyRows = rows.map((row) => headers.map((_, i) => row[i] ?? ""));
  const tableTitle = "BODY PRESSURE TABLE";

  doc.autoTable({
    head: [headers],
    body: bodyRows,
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 1,
      overflow: "linebreak",
      halign: "center",
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [106, 114, 87],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    margin: { top: 70, left: 18, right: 18 },
    tableWidth: "auto",
    pageBreak: "auto",
    didDrawPage: function () {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text(tableTitle, lw / 2, 46, { align: "center" });
    },
  });

  // ------------------------------
  // Save
  // ------------------------------
  doc.save(`${(customer || "")}${(lsd || "")}_MFV_REPORT.pdf`);
}
