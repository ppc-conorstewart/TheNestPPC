// ==============================
// MFVTableView.jsx — Full-Container Table View
// ==============================

export default function MFVTableView({
  displayHeaders,
  paginatedRows,
  COLUMN_MIN_WIDTHS,
  currentPage,
  totalPages,
  handlePrevPage,
  handleNextPage,
  handlePageClick,
  // NEW props
  rowsPerPage = 20,
  padToFullHeight = true
}) {
  // How many blank rows to add so the table visually fills the container
  const blanksNeeded = padToFullHeight
    ? Math.max(0, rowsPerPage - (paginatedRows?.length || 0))
    : 0;

  const blankRow = new Array(displayHeaders.length).fill("");

  return (
    <div
      className="bg-[#111] mx-auto mb-0 uppercase px-0 py-0 w-full h-full flex flex-col"
      style={{
        maxWidth: "100%",
        minHeight: 0,
        minWidth: 0,
        flex: 1,
        overflow: "hidden",
      }}
    >
      <div
        className="flex-1 w-full h-full overflow-auto"
        style={{
          minHeight: 0,
          minWidth: 0,
        }}
      >
        <table
          className="table-fixed font-erbaum w-full h-full border border-gray-600 text-[0.58rem]"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            {displayHeaders.map((_, idx) => (
              <col
                key={idx}
                style={{
                  width: `${100 / displayHeaders.length}%`,
                  minWidth: `${COLUMN_MIN_WIDTHS?.[idx] || 120}px`
                }}
              />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-black">
              {displayHeaders.map((h, i) => (
                <th
                  key={i}
                  className="px-1 py-[2px] border border-[#6a7257] uppercase text-center font-semibold tracking-wide text-[#6a7257] whitespace-normal break-words text-[0.68rem] leading-tight"
                  style={{ letterSpacing: "0.03em" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, rIdx) => (
              <tr key={`row-${rIdx}`} className={rIdx % 2 === 0 ? "bg-[#6a725740]" : ""}>
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="px-0 py-[2px] border border-[#6a7257] text-center text-gray-200 font-bold whitespace-normal break-words leading-tight text-[0.4rem]"
                    style={{ height: 24 }} // keep row height uniform so padding fills predictably
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}

            {/* --- Padding rows to visually fill container (Build & Test only) --- */}
            {Array.from({ length: blanksNeeded }).map((_, i) => (
              <tr key={`blank-${i}`} className={((paginatedRows.length + i) % 2 === 0) ? "bg-[#6a725740]" : ""}>
                {blankRow.map((_, cIdx) => (
                  <td
                    key={cIdx}
                    className="px-0 py-[2px] border border-[#6a7257] text-center text-gray-200 font-bold whitespace-normal break-words leading-tight text-[0.4rem]"
                    style={{ height: 24 }}
                  >
                    {/* empty to reserve space */}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full flex flex-col items-center mt-1">
        <div className="w-full h-full max-w-8xl flex text-xs justify-between items-center">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-2 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-700 text-gray-400"
                : "bg-[#6a7257] text-black hover:bg-[#4b533f]"
            }`}
          >
            Previous
          </button>
          <div className="flex-1 flex justify-center">
            <div className="flex space-x-1 overflow-x-auto max-w-[1200px] scrollbar-thin scrollbar-thumb-[#6a7257]">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageClick(i + 1)}
                  className={`px-2 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-[#6a7257] text-black text-xs"
                      : "bg-gray-800 text-white hover:bg-[#57614f]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-2 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-700 text-gray-400"
                : "bg-[#6a7257] text-black hover:bg-[#4b533f]"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
