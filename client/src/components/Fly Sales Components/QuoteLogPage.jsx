// ==============================
// FILE: client/src/components/Sales/QuoteLogTable.jsx
// Sections: Imports • Types • Helpers • Component • Styles • Export
// ==============================

import React, { useMemo, useState } from 'react';

// ==============================
// ============ TYPES ===========
// ==============================
// quotes: Array of {
//   id: string | number
//   category?: string
//   createdOn: string  // ISO or human date
//   customer: { name: string, avatarUrl?: string }
//   amount: number
//   dueDate?: string
//   status: 'Paid' | 'Overdue' | 'Pending' | 'Cancelled' | 'Draft'
// }
const statusStyles = {
  Paid: 'bg-green-900/30 text-green-300',
  Overdue: 'bg-yellow-900/30 text-yellow-300',
  Pending: 'bg-yellow-900/30 text-yellow-300',
  Cancelled: 'bg-red-900/30 text-red-300',
  Draft: 'bg-slate-700/60 text-slate-200'
};

// ==============================
// =========== HELPERS ==========
// ==============================
function currency(n) {
  if (typeof n !== 'number') return n;
  return n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 });
}
function clsx(...list) {
  return list.filter(Boolean).join(' ');
}

// ==============================
// ========= COMPONENT ==========
// ==============================
export default function QuoteLogTable({
  quotes = [],
  onView = () => {},
  onEdit = () => {},
  onDelete = () => {}
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    if (!search) return quotes;
    const q = search.toLowerCase();
    return quotes.filter(r =>
      String(r.id).toLowerCase().includes(q) ||
      (r.customer?.name || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q) ||
      (r.status || '').toLowerCase().includes(q)
    );
  }, [quotes, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  return (
    <div className='w-full'>
      <div className='paloma-frosted-glass p-3 md:p-4 rounded-2xl'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 border-b border-white/10 pb-3'>
          <div className='relative w-full md:w-96'>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className='w-full bg-black/30 text-white placeholder-white/50 rounded-xl pl-10 pr-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-[#6a7257]'
              placeholder='Search quotes, customers, status...'
            />
            <span className='absolute left-3 top-1/2 -translate-y-1/2 opacity-60'>🔎</span>
          </div>

          <div className='flex items-center gap-2'>
            <button
              className='rounded-xl bg-[#6a7257]/90 hover:bg-[#6a7257] px-4 py-2 font-semibold'
              onClick={() => onEdit(null)}
            >
              New Quote
            </button>
          </div>
        </div>

        <div className='table-wrap mt-3'>
          <table className='table text-white/90'>
            <thead className='bg-white/5'>
              <tr className='text-xs uppercase text-white/60'>
                <th className='ps-3 py-2 text-left'>Select</th>
                <th className='py-2 text-left'>Quote ID</th>
                <th className='py-2 text-left'>Category</th>
                <th className='py-2 text-left'>Created On</th>
                <th className='py-2 text-left'>Customer</th>
                <th className='py-2 text-left'>Amount</th>
                <th className='py-2 text-left'>Due Date</th>
                <th className='py-2 text-left'>Status</th>
                <th className='py-2 text-center'>Action</th>
              </tr>
            </thead>

            <tbody className='table--stack'>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className='py-8'>
                    <div className='text-center text-white/70'>
                      No quotes found. Try adjusting your search.
                    </div>
                  </td>
                </tr>
              )}

              {rows.map((r, idx) => (
                <tr key={r.id ?? idx} className='border-b border-white/5'>
                  <td className='ps-3 py-3' data-label='Select'>
                    <input type='checkbox' className='accent-[#6a7257]' />
                  </td>

                  <td className='py-3' data-label='Quote ID'>
                    <button
                      className='font-semibold hover:underline'
                      onClick={() => onView(r)}
                      title='View Quote'
                    >
                      #{r.id}
                    </button>
                  </td>

                  <td className='py-3' data-label='Category'>
                    {r.category || '—'}
                  </td>

                  <td className='py-3 text-white/70' data-label='Created On'>
                    {r.createdOn || '—'}
                  </td>

                  <td className='py-3' data-label='Customer'>
                    <div className='flex items-center gap-2'>
                      {r.customer?.avatarUrl ? (
                        <img
                          src={r.customer.avatarUrl}
                          alt=''
                          className='w-8 h-8 rounded-full object-cover'
                        />
                      ) : (
                        <div className='w-8 h-8 rounded-full bg-white/10 grid place-items-center text-xs'>
                          {(r.customer?.name || '?').slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className='font-medium'>{r.customer?.name || '—'}</span>
                    </div>
                  </td>

                  <td className='py-3' data-label='Amount'>
                    {currency(r.amount)}
                  </td>

                  <td className='py-3 text-white/70' data-label='Due Date'>
                    {r.dueDate || '—'}
                  </td>

                  <td className='py-3' data-label='Status'>
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                      statusStyles[r.status] || 'bg-slate-700/60 text-slate-200'
                    )}>
                      {r.status || 'Draft'}
                    </span>
                  </td>

                  <td className='py-3' data-label='Action'>
                    <div className='flex items-center justify-center gap-2'>
                      <button
                        className='rounded-full px-3 py-1 bg-white/10 hover:bg-white/15'
                        onClick={() => onView(r)}
                        title='View'
                      >
                        View
                      </button>
                      <button
                        className='rounded-full px-3 py-1 bg-white/10 hover:bg-white/15'
                        onClick={() => onEdit(r)}
                        title='Edit'
                      >
                        Edit
                      </button>
                      <button
                        className='rounded-full px-3 py-1 bg-red-900/40 hover:bg-red-900/60'
                        onClick={() => onDelete(r)}
                        title='Delete'
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex items-center justify-end gap-2 mt-4'>
          <button
            className='px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-40'
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={pageSafe <= 1}
          >
            ‹
          </button>
          <div className='px-3 py-1 rounded-lg bg-white/5'>
            Page {pageSafe} / {totalPages}
          </div>
          <button
            className='px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-40'
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={pageSafe >= totalPages}
          >
            ›
          </button>
        </div>
      </div>

      {/* ============================== STYLES ============================== */}
      <style>{`
        @media (max-width: 700px){
          tbody.table--stack tr{
            display: grid;
            grid-template-columns: 1fr;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,.08);
            margin-bottom: 10px;
            padding: 4px 8px;
          }
          tbody.table--stack td[data-label]{
            display: grid;
            grid-template-columns: 11ch 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
