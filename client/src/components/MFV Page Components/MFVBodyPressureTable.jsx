// ==============================
// MFVBodyPressureTable.jsx — Always Shows True Headers, No Pagination, Numeric Pressure Formatting & Trimming
// ==============================
function normalizePressure(value) {
  if (typeof value === 'number') return value;
  if (!value) return '';
  let str = String(value).toLowerCase().replace(/,/g, '').trim();

  // Already thousands, don't convert again
  if (/^\d{4,}$/.test(str)) return Number(str);

  // If contains 'k' (thousand)
  if (str.includes('k')) {
    let num = parseFloat(str.replace('k', ''));
    if (!isNaN(num)) return Math.round(num * 1000);
  }

  // Decimal (e.g. 4.2 → 4200)
  if (/^\d+\.\d+$/.test(str)) {
    let num = parseFloat(str);
    return Math.round(num * 1000);
  }

  // Single or double digit, treat as thousands (4 → 4000)
  if (/^\d+$/.test(str)) {
    let num = parseInt(str, 10);
    if (num < 1000) return num * 1000;
    return num;
  }

  // fallback: try to extract any numeric part (preserve old logic for weird cells)
  const matches = str.match(/-?\d+(\.\d+)?/g);
  if (matches && matches.length > 0) {
    // If decimal, apply 1000x rule
    if (matches[0].includes('.')) {
      return Math.round(parseFloat(matches[0]) * 1000);
    }
    // If it's a whole number, apply 1000x rule if less than 1000
    const n = parseInt(matches[0], 10);
    if (!isNaN(n)) {
      if (n < 1000) return n * 1000;
      return n;
    }
  }
  return '';
}

export default function MFVBodyPressureTable({
  displayHeaders,
  paginatedRows,
  COLUMN_MIN_WIDTHS
}) {
  const scale = 1;

  return (
    <div
      className="bg-[#000] rounded px-1 py-1 border border-[#6a7257] flex flex-col justify-between"
      style={{
        width: "100%",
        minWidth: 0,
        height: '100%',
        
        maxWidth: "100%",
        overflowX: "auto"
      }}
    >
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          transform: `scale(${scale})`,
          transformOrigin: "top left"
        }}
      >
        <table
          className="font-erbaum border border-gray-600 text-[0.72rem] w-full"
          style={{
            tableLayout: "fixed",
            width: "100%",
            minWidth: 0
          }}
        >
          <colgroup>
            {displayHeaders.map((_, idx) => (
              <col
                key={idx}
                style={{
                  width: `${100 / displayHeaders.length}%`
                }}
              />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-black">
              {displayHeaders.map((h, i) => (
                <th
                  key={i}
                  className="px-1 py-[3px] border border-[#6a7257] text-center font-semibold tracking-wide text-[#6a7257] whitespace-normal text-[0.72rem] leading-snug"
                  style={{ letterSpacing: "0.03em" }}
                  title={h}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, idx) => (
              <tr key={idx} className="border-b border-[#35392E]">
                {row.map((cell, colIdx) => {
                  let displayValue = cell;
                  if (colIdx > 2) {
                    displayValue = normalizePressure(cell);
                  } else {
                    // For 0-2: Just trim string (original behavior)
                    displayValue = String(cell).trim();
                  }
                  return (
                    <td
                      key={colIdx}
                      className="px-3 py-2 text-xs text-[#e6e8df] font-erbaum border-r border-[#35392E] text-center"
                      style={{
                        minWidth: 80,
                        maxWidth: 190,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                      title={String(cell)} // Show full value on hover
                    >
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
