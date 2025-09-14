// ==============================
// MFVBodyPressureTable.jsx — Always Shows True Headers, No Pagination, Numeric Pressure Formatting & Trimming
// ==============================
function normalizePressure(value) {
  if (typeof value === 'number') return value;
  if (!value) return '-'; // show "-" when nothing present

  let str = String(value).toLowerCase().replace(/,/g, '').trim();
  if (str === '' || str === 'null' || str === 'undefined') return '-';

  // Already thousands, don't convert again
  if (/^\d{4,}$/.test(str)) return Number(str);

  // If contains 'k' (thousand)
  if (str.includes('k')) {
    const num = parseFloat(str.replace('k', ''));
    if (!isNaN(num)) return Math.round(num * 1000);
    return '-';
  }

  // Decimal (e.g. 4.2 → 4200)
  if (/^\d+\.\d+$/.test(str)) {
    const num = parseFloat(str);
    return Math.round(num * 1000);
  }

  // Single or double digit, treat as thousands (4 → 4000, 42 → 42000)
  // Three-digit numbers should NOT be scaled
  if (/^\d+$/.test(str)) {
    const num = parseInt(str, 10);
    if (num < 100) return num * 1000;
    return num; // 3+ digits stay as-is
  }

  // Fallback: extract any numeric part
  const matches = str.match(/-?\d+(\.\d+)?/g);
  if (matches && matches.length > 0) {
    if (matches[0].includes('.')) {
      return Math.round(parseFloat(matches[0]) * 1000);
    }
    const n = parseInt(matches[0], 10);
    if (!isNaN(n)) {
      if (n < 100) return n * 1000;
      return n;
    }
  }

  // If truly no number found
  return '-';
}

// ==============================
// COMPONENT
// ==============================
export default function MFVBodyPressureTable({
  displayHeaders,
  paginatedRows,
  COLUMN_MIN_WIDTHS
}) {
  const scale = 1;

  return (
    <div
      className="bg-[#000] rounded px-1 py-1 border border-[#6a7257] flex flex-col"
      style={{
        width: '100%',
        minWidth: 0,
        height: '100%',
        maxWidth: '100%'
      }}
    >
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          flex: '0 0 auto',
          transform: `scale(${scale})`,
          transformOrigin: 'top left'
        }}
      >
        <table
          className="font-erbaum border border-gray-600 text-[0.72rem] w-full"
          style={{
            tableLayout: 'fixed',
            width: '100%',
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
          <thead className="sticky top-0 z-10">
            <tr className="bg-black">
              {displayHeaders.map((h, i) => (
                <th
                  key={i}
                  className="px-1 py-[3px] border border-[#6a7257] text-center font-semibold tracking-wide text-[#6a7257] whitespace-normal text-[0.72rem] leading-snug"
                  style={{ letterSpacing: '0.03em' }}
                  title={h}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      <div
        style={{
          flex: '1 1 auto',
          overflowY: 'auto',
          overflowX: 'auto',
          width: '100%'
        }}
      >
        <table
          className="font-erbaum text-[0.72rem] w-full"
          style={{
            tableLayout: 'fixed',
            width: '100%',
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
          <tbody>
            {paginatedRows.map((row, idx) => (
              <tr key={idx} className="border-b border-[#35392E]">
                {row.map((cell, colIdx) => {
                  let displayValue = cell;
                  if (colIdx > 2) {
                    displayValue = normalizePressure(cell);
                  } else {
                    const raw = String(cell || '').trim();
                    displayValue = raw === '' ? '-' : raw;
                  }
                  return (
                    <td
                      key={colIdx}
                      className="px-3 py-2 text-xs text-[#e6e8df] font-erbaum border-r border-[#35392E] text-center"
                      style={{
                        minWidth: 80,
                        maxWidth: 190,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={String(cell)}
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
