// src/pages/ContactList.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

export default function ContactList() {
  const [data, setData] = useState([]);      // Array of row objects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch the XLSX file from public/
    fetch('/contact_list.xlsx')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        return res.arrayBuffer();
      })
      .then((arrayBuffer) => {
        // 2. Read the workbook using XLSX
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // First sheet
        const worksheet = workbook.Sheets[sheetName];

        // 3. Convert sheet to JSON (header row → keys)
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading XLSX:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#6a7257] p-8 text-white">
        <p>Loading Contact List…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#6a7257] p-8 text-red-500">
        <p>Error loading contact list: {error}</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="min-h-screen bg-[#6a7257] p-8 text-white">
        <p>No contact data found in the spreadsheet.</p>
      </div>
    );
  }

  // 4. Get column headers from the first row’s keys
  const columns = Object.keys(data[0]);

  // 5. Split the data into three roughly equal chunks
  const chunkSize = Math.ceil(data.length / 3);
  const columnChunks = [
    data.slice(0, chunkSize),
    data.slice(chunkSize, chunkSize * 2),
    data.slice(chunkSize * 2),
  ];

  return (
    <div className="min-h-screen bg-[#6a7257] p-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition"
      >
        ← Back
      </button>

      {/* Bigger logo centered above the tables */}
      <img
        src="/assets/Paloma_Logo_Rounded_Black_large.png"
        alt="Paloma Logo"
        className="h-28 w-28 mx-auto mb-4"
      />

      {/* “PALOMA CONTACT LIST” text centered under the logo */}
      <h1 className="text-3xl font-bold text-white text-center mb-6">
        PALOMA CONTACT LIST
      </h1>

      {/* Three columns of tables, side by side */}
      <div className="overflow-auto">
        <div className="flex gap-4 justify-center">
          {columnChunks.map((chunk, chunkIndex) => (
            <table
              key={chunkIndex}
              className="table-auto bg-transparent border-4 border-black"
            >
              <thead className="bg-gray-100 bg-opacity-50">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-2 py-1 text-left text-sm font-bold text-black whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chunk.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 0 ? 'bg-[#6a7257]' : 'bg-[#778265]'}
                  >
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="px-2 py-1 text-sm font-bold text-black whitespace-nowrap"
                      >
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </div>
    </div>
  );
}
