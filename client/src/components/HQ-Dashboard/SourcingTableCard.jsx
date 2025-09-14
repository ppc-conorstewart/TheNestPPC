// ===========================
// FILE: client/src/components/HQ-Dashboard/SourcingTableCard.jsx
// Sections: Imports • Helpers • RightPanelBtn • TableRow • Component
// ===========================

import { useEffect, useMemo, useState } from 'react'

function RightPanelBtn({ icon, tooltip, onClick }) {
  const [show, setShow] = useState(false)
  return (
    <div className='relative flex items-center justify-center'>
      <button
        type='button'
        className='rounded-full border-2 flex items-center justify-center bg-[#191d18] border-[#393c32] transition duration-150 transform w-[24px] h-[24px] hover:scale-110 hover:border-[#57b4ff] focus:outline-none'
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={onClick}
        aria-label={tooltip}
      >
        {icon}
      </button>
      {show && (
        <span className='absolute z-30 left-1/2 -translate-x-1/2 top-7 pointer-events-none select-none whitespace-nowrap bg-black bg-opacity-90 text-[#cfd3c3] text-xs px-2 py-1 rounded font-bold shadow-md border border-[#393c32]'>
          {tooltip}
        </span>
      )}
    </div>
  )
}

const icons = {
  refresh: (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#57b4ff' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
      <polyline points='23 4 23 10 17 10'></polyline>
      <polyline points='1 20 1 14 7 14'></polyline>
      <path d='M3.51 9a9 9 0 0114.13-3.36L23 10'></path>
      <path d='M20.49 15a9 9 0 01-14.13 3.36L1 14'></path>
    </svg>
  ),
  csv: (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#cfd3c3' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/>
      <polyline points='14 2 14 8 20 8'/>
      <path d='M8 13h2a2 2 0 1 1 0 4H8zM14 17l1.8-4L18 17l2.2-4'/>
    </svg>
  ),
}

function Pill({ value }) {
  const map = {
    Requested: 'bg-yellow-700/40 text-yellow-200 border-yellow-400/50',
    Ordered: 'bg-blue-700/40 text-blue-200 border-blue-400/50',
    Received: 'bg-green-700/30 text-green-200 border-green-400/50',
    Cancelled: 'bg-red-800/30 text-red-200 border-red-400/50'
  }
  return (
    <span className={`px-2 py-0.5 text-[11px] font-bold rounded border ${map[value] || 'bg-[#252821] text-[#cfd3c3] border-[#3a3d33]'}`}>
      {value}
    </span>
  )
}

function TableRow({ t }) {
  return (
    <tr className='hover:bg-[#1b1f18]/60 transition'>
      <td className='px-2 py-2 text-xs font-bold'>{t.item_description || t.itemDescription}</td>
      <td className='px-2 py-2 text-xs'>{t.base}</td>
      <td className='px-2 py-2 text-xs'>{(t.needed_by || t.neededBy) ? new Date(t.needed_by || t.neededBy).toLocaleDateString() : '—'}</td>
      <td className='px-2 py-2 text-xs'>{t.quantity}</td>
      <td className='px-2 py-2 text-xs font-bold text-[#cfd3c3]'>{t.project}</td>
      <td className='px-2 py-2 text-xs'>{t.vendor || '—'}</td>
      <td className='px-2 py-2 text-xs'>{t.category}</td>
      <td className='px-2 py-2 text-xs'>{t.priority}</td>
      <td className='px-2 py-2 text-xs'>{(t.expected_date || t.expectedDate) ? new Date(t.expected_date || t.expectedDate).toLocaleDateString() : '—'}</td>
      <td className='px-2 py-2 text-xs'><Pill value={t.status} /></td>
      <td className='px-2 py-2 text-xs'>{new Date(t.created_at || t.createdAt).toLocaleString()}</td>
    </tr>
  )
}

export default function SourcingTableCard() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: 'All', priority: 'All', category: 'All' })

  const fetchData = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.status !== 'All') params.append('status', filters.status)
    if (filters.priority !== 'All') params.append('priority', filters.priority)
    if (filters.category !== 'All') params.append('category', filters.category)
    fetch(`/api/sourcing?${params.toString()}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { setTickets(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [filters.status, filters.priority, filters.category])

  const csv = useMemo(() => {
    const header = ['Item','Base','Needed By','Qty','Project','Vendor','Category','Priority','Expected','Status','Created At']
    const rows = tickets.map(t => [
      (t.item_description || t.itemDescription) ?? '',
      t.base ?? '',
      (t.needed_by || t.neededBy) ? new Date(t.needed_by || t.neededBy).toISOString().slice(0,10) : '',
      t.quantity ?? '',
      t.project ?? '',
      t.vendor ?? '',
      t.category ?? '',
      t.priority ?? '',
      (t.expected_date || t.expectedDate) ? new Date(t.expected_date || t.expectedDate).toISOString().slice(0,10) : '',
      t.status ?? '',
      new Date(t.created_at || t.createdAt).toISOString()
    ])
    return [header, ...rows].map(r => r.map(x => `"${String(x).replaceAll('"','""')}"`).join(',')).join('\n')
  }, [tickets])

  const downloadCSV = () => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sourcing_tickets.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className='border-2 border-[#6a7257] rounded-2xl shadow-2xl px-4 flex flex-row min-h-[60px]' style={{ width: '100%', height: '100%', background: 'var(--glass-tint)', backdropFilter: 'blur(var(--glass-blur))', WebkitBackdropFilter: 'blur(var(--glass-blur))', boxShadow: 'var(--glass-shadow)', borderColor: '#6a7257' }}>
      <div className='flex-1 min-w-0 flex flex-col'>
        <div className='flex items-center justify-between py-2 border-b border-[#393c32] mb-2'>
          <div className='text-xs font-extrabold uppercase tracking-wider text-[#b0b79f]'>Sourcing Tickets</div>
          <div className='flex gap-3 items-center'>
            <label className='text-[11px] text-[#cfd3c3]'>Status</label>
            <select className='glass-input text-white text-xs px-2 py-0.5 rounded' value={filters.status} onChange={e => setFilters(s => ({ ...s, status: e.target.value }))}>
              <option>All</option><option>Requested</option><option>Ordered</option><option>Received</option><option>Cancelled</option>
            </select>
            <label className='text-[11px] text-[#cfd3c3] ml-2'>Priority</label>
            <select className='glass-input text-white text-xs px-2 py-0.5 rounded' value={filters.priority} onChange={e => setFilters(s => ({ ...s, priority: e.target.value }))}>
              <option>All</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
            <label className='text-[11px] text-[#cfd3c3] ml-2'>Category</label>
            <select className='glass-input text-white text-xs px-2 py-0.5 rounded' value={filters.category} onChange={e => setFilters(s => ({ ...s, category: e.target.value }))}>
              <option>All</option><option>Consumables</option><option>Equipment</option><option>Spare Parts</option><option>Other</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className='text-center text-gray-400 py-6'>Loading...</div>
        ) : (
          <div className='w-full h-full overflow-auto'>
            <table className='min-w-full my-0 text-gray-200 bg-transparent text-left text-[.3rem]'>
              <thead className='sticky top-0 bg-[#12140f] z-10'>
                <tr>
                  <th className='px-2 py-2'>Item</th>
                  <th className='px-2 py-2'>Base</th>
                  <th className='px-2 py-2'>Needed By</th>
                  <th className='px-2 py-2'>Qty</th>
                  <th className='px-2 py-2'>Project</th>
                  <th className='px-2 py-2'>Vendor</th>
                  <th className='px-2 py-2'>Category</th>
                  <th className='px-2 py-2'>Priority</th>
                  <th className='px-2 py-2'>Expected</th>
                  <th className='px-2 py-2'>Status</th>
                  <th className='px-2 py-2'>Created At</th>
                </tr>
              </thead>
              <tbody>
                {tickets
                  .filter(t => t.status !== 'Complete')
                  .map(t => <TableRow key={t.id} t={t} />)}
                {tickets.length === 0 && (
                  <tr><td colSpan={11} className='text-center text-[#6a7257] py-8 italic font-bold'>No sourcing tickets.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className='ml-3 pl-3 flex flex-col items-center justify-start' style={{ width: 54, borderLeft: '2px solid #6a7257', paddingTop: 8, gap: 10, flexShrink: 0 }}>
        <RightPanelBtn icon={icons.refresh} tooltip='Refresh' onClick={fetchData} />
        <RightPanelBtn icon={icons.csv} tooltip='Export CSV' onClick={downloadCSV} />
      </div>
    </div>
  )
}
