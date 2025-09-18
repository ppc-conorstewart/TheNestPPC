// ==============================
// FILE: client/src/pages/FlySales.jsx
// Sections: Imports • State & Const • Layout • Styles • Export
// ==============================

import React from 'react';
import { useNavigate } from 'react-router-dom';

// ==============================
// ======== STATE & CONST =======
// ==============================
const salesCrest = '/assets/SALES.png';

// ==============================
// ============ LAYOUT ==========
// ==============================
export default function FlySales() {
  const navigate = useNavigate();

  return (
    <div className='w-full h-full text-white'>
      <div className='flex flex-col items-center justify-start min-h-[calc(100vh-80px)] px-4 pt-10 pb-20'>
        <h1 className='uppercase font-erbaum font-extrabold text-4xl md:text-5xl text-white mb-6 text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]'>
          Sales Hub
        </h1>

        <div className='relative w-full max-w-[1100px] flex items-center justify-center my-2'>
          <img
            src={salesCrest}
            alt='Sales Crest'
            className='sales-crest-img'
            draggable='false'
          />
          <div className='sales-crest-shadow' />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1200px] mt-10'>
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
      </div>

      {/* ============================== STYLES ============================== */}
      <style>{`
        .sales-crest-img{
          width: 300px;
          height: 300px;
          object-fit: contain;
          filter: drop-shadow(0 10px 28px rgba(0,0,0,.55));
          position: relative;
          z-index: 2;
          user-select: none;
        }
        .sales-crest-shadow{
          position: absolute;
          bottom: -8px;
          width: 180px;
          height: 18px;
          border-radius: 999px;
          background: radial-gradient(ellipse at center, rgba(0,0,0,.5), rgba(0,0,0,0));
          filter: blur(6px);
          transform: translateY(-10px);
          z-index: 1;
        }
        @media (max-width: 860px){
          .sales-crest-img{
            width: 200px;
            height: 200px;
          }
          .sales-crest-shadow{
            width: 120px;
            height: 14px;
            bottom: -6px;
          }
        }
      `}</style>
    </div>
  );
}
