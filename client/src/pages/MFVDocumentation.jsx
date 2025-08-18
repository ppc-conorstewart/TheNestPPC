// src/pages/MFVDocumentation.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MFVDocumentation() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDocUrl, setPreviewDocUrl] = useState(null);

  const allDocs = [
    // QF / QV documents
    {
      key: 'qf-1000',
      title: 'QF.1000 – SLV Inspection Report Checklist',
      url: encodeURI('/assets/mfv-docs/QF.1000 - SLV Inspection Report Checklist.pdf'),
    },
    {
      key: 'qf-1001',
      title: 'QF.1001 – SLV Retest Procedure',
      url: encodeURI('/assets/mfv-docs/QF.1001 - SLV Retest Procedure.pdf'),
    },
    {
      key: 'qf-571-01',
      title: 'QF-571.01 Valve Teardown – Rev H',
      url: encodeURI('/assets/mfv-docs/QF-571.01 Valve Teardown- Rev H.pdf'),
    },
    {
      key: 'qf-571-12',
      title: 'Valve Testing – QF-571.12 – Rev I',
      url: encodeURI('/assets/mfv-docs/Valve Testing - QF-571.12 - REV I.pdf'),
    },

    // VW stack‐ups 5-15K FM3 Rev B
    {
      key: 'vw-a-fm3-b',
      title: 'VW (A) – Stack-Up 5-15K FM3 – Rev B',
      url: encodeURI('/assets/mfv-docs/VW (A) - STACK UP - 5-15K FM3 - REV B.pdf'),
    },
    {
      key: 'vw-b-fm3-b',
      title: 'VW (B) – Stack-Up 5-15K FM3 – Rev B',
      url: encodeURI('/assets/mfv-docs/VW (B) - STACK UP - 5-15K FM3 - REV B.pdf'),
    },
    {
      key: 'vw-c-fm3-b',
      title: 'VW (C) – Stack-Up 5-15K FM3 – Rev B',
      url: encodeURI('/assets/mfv-docs/VW (C) - STACK UP - 5-15K FM3 - REV B.pdf'),
    },
    {
      key: 'vw-d-fm3-b',
      title: 'VW (D) – Stack-Up 5-15K FM3 – Rev B',
      url: encodeURI('/assets/mfv-docs/VW (D) - STACK UP - 5-15K FM3 - REV B.pdf'),
    },
    {
      key: 'vw-e-fm3-b',
      title: 'VW (E) – Stack-Up 5-15K FM3 – Rev B',
      url: encodeURI('/assets/mfv-docs/VW (E) - STACK UP - 5-15K FM3 - REV B.pdf'),
    },
    {
      key: 'vw-f-fm3-b',
      title: 'VW (F) – Stack-Up 5-15K FM3 – Rev B',
      url: encodeURI('/assets/mfv-docs/VW (F) - STACK UP - 5-15K FM3 - REV B.pdf'),
    },

    // VW stack‐ups 7-15K FM1 Rev C
    {
      key: 'vw-a-fm1-c',
      title: 'VW (A) – Stack-Up 7-15K FM1 – Rev C',
      url: encodeURI('/assets/mfv-docs/VW(A) - STACK UP - 7-15K FM1 - REV C.pdf'),
    },
    {
      key: 'vw-b-fm1-c',
      title: 'VW (B) – Stack-Up 7-15K FM1 – Rev C',
      url: encodeURI('/assets/mfv-docs/VW(B) - STACK UP - 7-15K FM1 - REV C.pdf'),
    },
    {
      key: 'vw-c-fm1-c',
      title: 'VW (C) – Stack-Up 7-15K FM1 – Rev C',
      url: encodeURI('/assets/mfv-docs/VW(C) - STACK UP - 7-15K FM1 - REV C.pdf'),
    },
    {
      key: 'vw-d-fm1-c',
      title: 'VW (D) – Stack-Up 7-15K FM1 – Rev C',
      url: encodeURI('/assets/mfv-docs/VW(D) - STACK UP - 7-15K FM1 - REV C.pdf'),
    },
    {
      key: 'vw-e-fm1-c',
      title: 'VW (E) – Stack-Up 7-15K FM1 – Rev C',
      url: encodeURI('/assets/mfv-docs/VW(E) - STACK UP - 7-15K FM1 - REV C.pdf'),
    },
    {
      key: 'vw-f-fm1-c',
      title: 'VW (F) – Stack-Up 7-15K FM1 – Rev C',
      url: encodeURI('/assets/mfv-docs/VW(F) - STACK UP - 7-15K FM1 - REV C.pdf'),
    },

    // VW (OEM) variants
    {
      key: 'vw-oem-fm3-b',
      title: 'VW (OEM) – Stack-Up 5-15K FM3 – Rev B',
      url: encodeURI('/assets/mfv-docs/VW(OEM) - STACK UP - 5-15K FM3 - REV B.pdf'),
    },
    {
      key: 'vw-oem-fm1-c',
      title: 'VW (OEM) – Stack-Up 7-15K FM1 – Rev C',
      url: encodeURI('/assets/mfv-docs/VW(OEM) - STACK UP - 7-15K FM1 - REV C.pdf'),
    },
  ];

  const [docs, setDocs] = useState(allDocs);
  const filtered = docs.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (key) => {
    if (!window.confirm('Delete this document?')) return;
    setDocs((prev) => prev.filter((d) => d.key !== key));
  };

  // Split out headers/revs for display
  const parseTitle = (title) => {
    const vwMatch = title.match(/^VW \(([A-Z])\) – (.+?) – Rev ([A-Z])$/);
    if (vwMatch) {
      return {
        headerLine: `Seat Size: ${vwMatch[1]}`,
        revLine: `Rev ${vwMatch[3]}`,
        nameLine: vwMatch[2],
        isVW: true,
      };
    }
    const revMatch = title.match(/^(.+?) – Rev ([A-Z])$/);
    if (revMatch) {
      const header = revMatch[1].split('–')[0].trim();
      return {
        headerLine: header,
        revLine: `Rev ${revMatch[2]}`,
        nameLine: revMatch[1].replace(header, '').replace(/^–\s*/, ''),
        isVW: false,
      };
    }
    const qMatch = title.match(/^(Q[FV]\.\d+)\s–\s(.+)$/);
    if (qMatch) {
      return {
        headerLine: qMatch[1],
        revLine: null,
        nameLine: qMatch[2],
        isVW: false,
      };
    }
    return { headerLine: null, revLine: null, nameLine: title, isVW: false };
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center p-6 relative">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 px-4 py-2 bg-black border border-[#EF4444] rounded-md text-[#EF4444] hover:bg-[#EF4444] hover:text-black transition"
      >
        ← Back
      </button>

      {/* Logo */}
      <img
        src="/assets/FLY-MFV.png"
        alt="FLY-MFV Logo"
        className="w-48 sm:w-56 md:w-64 lg:w-72 xl:w-[300px] drop-shadow-xl mt-8"
      />

      {/* Header */}
      <h1 className="text-3xl font-bold mt-4 mb-2 text-center">MFV Documentation Hub</h1>
      <p className="text-gray-300 text-center mb-4 max-w-lg">
        Browse, preview, and open any PDF manuals, drawings, or spec sheets for MFV valves.
      </p>

      {/* Search + Add */}
      <div className="w-full max-w-md mb-6 flex items-center gap-2">
        <input
          type="text"
          placeholder="🔍 Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-4 py-3 bg-[#222] text-white placeholder-gray-400 border border-[#EF4444] rounded-lg focus:ring-2 focus:ring-[#EF4444] transition"
        />
        <button
          onClick={() => alert('Add Document…')}
          className="px-4 py-3 bg-[#EF4444] text-black font-semibold rounded-lg hover:bg-red-600 transition"
        >
          + Add Document
        </button>
      </div>

      {/* Grid */}
      <div className="w-full px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {filtered.map((doc) => {
          const { headerLine, revLine, nameLine, isVW } = parseTitle(doc.title);
          return (
            <div
              key={doc.key}
              className="bg-[#111] border-2 border-[#EF4444] rounded-2xl shadow-lg p-4 flex flex-col justify-between hover:bg-black transition"
            >
              <div className="flex flex-col items-center text-center">
                {headerLine && (
                  <div className={`${isVW ? 'text-blue-400' : 'text-white'} text-xl font-bold`}>
                    {headerLine}
                  </div>
                )}
                {revLine && (
                  <div className="text-yellow-400 text-lg font-semibold mt-1">
                    {revLine}
                  </div>
                )}
                <div className="text-2xl font-bold text-white mt-2">
                  {nameLine}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => setPreviewDocUrl(doc.url)}
                  className="px-3 py-2 bg-black border border-[#EF4444] text-[#EF4444] font-semibold rounded-md hover:bg-red-600 hover:text-black transition"
                >
                  Preview
                </button>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-[#EF4444] text-black font-semibold rounded-md hover:bg-red-600 transition"
                >
                  Open
                </a>
                <button
                  onClick={() => handleDelete(doc.key)}
                  className="px-3 py-2 bg-black border border-[#EF4444] text-[#EF4444] font-semibold rounded-md hover:bg-red-600 hover:text-black transition"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <div className="relative w-[90%] h-[90%] bg-black rounded-lg overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewDocUrl(null)}
              className="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center text-lg"
            >
              ×
            </button>
            <iframe
              src={`${previewDocUrl}#page=1&view=FitH`}
              title="PDF Preview"
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
