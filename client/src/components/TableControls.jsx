// src/components/TableControls.jsx

import React from 'react';

export default function TableControls({
  currentPage,
  totalPages,
  onPageChange,
}) {
  return (
    <div
      className="flex justify-between items-center p-1 border-t border-[#333] text-xs text-white"
      style={{ fontSize: '0.78em' }}
    >
      <span>Total Pages: {totalPages}</span>
      <div className="space-x-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className="px-2 py-1 bg-[#6a7257] text-black rounded disabled:opacity-50"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className="px-2 py-1 bg-[#6a7257] text-black rounded disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
