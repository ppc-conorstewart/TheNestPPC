// ==============================
// FILE: client/src/pages/FlySales.jsx
// Sections: Imports • Layout • Styles • Export
// ==============================

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function FlySales() {
  const navigate = useNavigate();

  return (
    <div className='w-full h-full text-white'>
      <div className='flex flex-col items-center justify-start min-h-[calc(100vh-80px)] px-4 pt-10 pb-20'>
        <h1 className='uppercase font-erbaum font-extrabold text-4xl md:text-5xl text-white mb-10 text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]'>
          Sales Hub
        </h1>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1200px]'>
          <button
            className='paloma-frosted-glass hover:glow transition p-5 rounded-2xl text-left'
            onClick={() => navigate('/sales/quotes')}
          >
            <div className='text-2xl font-semibold mb-2'>Quote Log</div>
            <div className='opacity-80'>Browse, search, and filter existing quotes.</div>
          </button>

          <button className='paloma-frosted-glass hover:glow transition p-5 rounded-2xl text-left'>
            <div className='text-2xl font-semibold mb-2'>Create Quote</div>
            <div className='opacity-80'>Start a new quote with customer & layout details.</div>
          </button>

          <button className='paloma-frosted-glass hover:glow transition p-5 rounded-2xl text-left'>
            <div className='text-2xl font-semibold mb-2'>Link Layout Package</div>
            <div className='opacity-80'>Attach a layout package to a selected quote.</div>
          </button>

          <button className='paloma-frosted-glass hover:glow transition p-5 rounded-2xl text-left'>
            <div className='text-2xl font-semibold mb-2'>Field Ticket</div>
            <div className='opacity-80'>Generate field tickets tied to quotes/jobs.</div>
          </button>

          <button className='paloma-frosted-glass hover:glow transition p-5 rounded-2xl text-left'>
            <div className='text-2xl font-semibold mb-2'>Invoice</div>
            <div className='opacity-80'>Build invoices and export to PDF/XLSX.</div>
          </button>

          <button className='paloma-frosted-glass hover:glow transition p-5 rounded-2xl text-left'>
            <div className='text-2xl font-semibold mb-2'>Revenue Reports</div>
            <div className='opacity-80'>Run reports for a specific date range.</div>
          </button>
        </div>

        <style>{`
          .paloma-frosted-glass{
            background: rgba(20, 20, 20, 0.55);
            border: 1px solid rgba(255,255,255,0.08);
            backdrop-filter: blur(8px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
          }
          .hover\\:glow:hover{
            box-shadow: 0 16px 44px rgba(0,0,0,0.5), 0 0 12px rgba(148, 156, 127, 0.35);
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    </div>
  );
}
