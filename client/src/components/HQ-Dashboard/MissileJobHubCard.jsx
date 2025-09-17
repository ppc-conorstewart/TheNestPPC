// =================== FILE: client/src/components/HQ-Dashboard/MissileJobHubCard.jsx ===================

// =================== Imports and Dependencies ===================
import { useState } from 'react';
import ScaleToFit from '../ui/ScaleToFit';

// =================== SVG ICONS ===================
const icons = {
  plus: (
    <svg width='20' height='20' viewBox='0 0 24 24' fill='none'
      stroke='#36c172' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
      <circle cx='12' cy='12' r='10' />
      <line x1='12' y1='7' x2='12' y2='17' />
      <line x1='7' y1='12' x2='17' y2='12' />
    </svg>
  )
};

// =================== Action Icon Button Component ===================
function ActionIconBtn({ icon, tooltip, onClick, color, border, bg }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className='relative flex rounded-2xl items-center justify-center'>
      <button
        className={`
          rounded-full border-2 flex items-center justify-center
          bg-[#191d18]
          border-[#393c32]
          transition duration-150 transform
          w-[24px] h-[24px]
          hover:scale-110
          hover:border-[#36c172]
          focus:outline-none
        `}
        style={{
          color: color || '#36c172',
          borderColor: border || '#393c32',
          background: bg || '#191d18'
        }}
        tabIndex={0}
        aria-label={tooltip}
        type='button'
        onClick={onClick}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onFocus={() => setShowTip(true)}
        onBlur={() => setShowTip(false)}
      >
        {icon}
      </button>
      {showTip && (
        <span
          className={`
            absolute z-30 left-1/2 -translate-x-1/2 top-7
            pointer-events-none select-none
            whitespace-nowrap
            bg-black bg-opacity-90 text-[#36c172] text-xs px-2 py-1 rounded
            font-bold
            shadow-md border border-[#36c172]
            animate-fadein
          `}
          style={{ fontSize: 11, fontWeight: 700 }}
        >
          {tooltip}
        </span>
      )}
    </div>
  );
}

// =================== Grid Layout Classes ===================
const colClasses =
  'grid grid-cols-[56px_170px_140px_120px_170px_120px] w-full';

// =================== Missile Job Row Component ===================
function MissileJobRow({ job, highlight = false }) {
  return (
    <div
      className={
        colClasses +
        ' items-center py-1 group relative transition-all duration-200 rounded-lg ' +
        (highlight
          ? 'bg-gradient-to-r from-[#1e232a]/90 via-[#293233]/90 to-[#191a1b]/90 scale-[1.012]'
          : 'hover:bg-gradient-to-r hover:from-[#20241a]/90 hover:to-[#34381a]/90 hover:scale-[1.01] cursor-pointer')
      }
      style={{
        minHeight: 32,
        boxShadow: highlight
          ? '0 0 1px 0 #35392e, 0 6px 18px 0 #22441e23'
          : '0 0 0.5px 0 #35392e, 0 8px 24px 0 #23240e33'
      }}
    >
      <div className='flex flex-row items-center justify-center'>
        <span
          className='inline-block w-2 h-2 rounded-full bg-green-400 shadow border border-[#157d42] mr-1'
          title={job.status === 'Active' ? 'Active Missile' : 'Upcoming'}
        ></span>
        <div
          style={{
            width: 19,
            height: 19,
            borderRadius: '50%',
            background: '#151d17',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #242b1c',
            overflow: 'hidden'
          }}
        >
          <span style={{ color: '#36c172', fontSize: 8, fontWeight: 900 }}>Logo</span>
        </div>
      </div>
      <div className='flex flex-col items-center justify-center'>
        <span className='font-bold text-white text-xs uppercase tracking-wide text-center'>
          {job.customer}
        </span>
      </div>
      <div className='flex flex-col items-center'>
        <span className='text-xs text-[#b0b79f] font-mono text-center'>{job.lsd}</span>
      </div>
      <div className='flex flex-col items-center'>
        <span className='text-xs text-[#a9c27a] font-bold font-mono text-center'>{job.missile}</span>
      </div>
      <div className='flex flex-col items-center'>
        <span className='text-xs font-bold font-mono text-[#e6e8df] text-center'>{job.start_date}</span>
      </div>
      <div className='flex flex-col items-center'>
        <span className={`text-xs font-bold font-mono text-center ${job.status === 'Active' ? 'text-[#36c172]' : 'text-yellow-300'}`}>
          {job.status}
        </span>
      </div>
    </div>
  );
}

// =================== Inline Add Missile Panel (Full-Size Swap) ===================
function InlineAddMissilePanel({ onClose, onSubmit }) {
  const [customer, setCustomer] = useState('');
  const [lsd, setLsd] = useState('');
  const [missile, setMissile] = useState('');
  const [startDate, setStartDate] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ customer, lsd, missile, start_date: startDate, status: 'Active' });
    onClose();
  }

  return (
    <div className='w-full h-full flex flex-col'>
      <div className='w-full border-b-2 border-[#6a7257] pb-1 pt-1 flex items-center justify-center'>
        <span className='text-[#e6ffe6] font-extrabold text-xs uppercase tracking-wide flex-1 text-center'>
          Add Missile Job
        </span>
        <button
          type='button'
          onClick={onClose}
          className='text-[#ffffffb3] text-sm ml-2'
          title='Close'
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className='flex-1 w-full px-2 py-2 text-xs'>
        <div className='grid gap-2' style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}>
          <div className='col-span-12 md:col-span-6'>
            <label className='block text-[#e6ffe6] font-bold mb-1 text-xs'>Customer</label>
            <input
              className='w-full bg-[#191d18] border-2 border-[#6a7257] rounded px-2 py-1 text-white text-xs font-bold'
              required
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              placeholder='Customer Name'
              autoFocus
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <label className='block text-[#e6ffe6] font-bold mb-1 text-xs'>LSD</label>
            <input
              className='w-full bg-[#191d18] border-2 border-[#6a7257] rounded px-2 py-1 text-white text-xs font-bold'
              required
              value={lsd}
              onChange={e => setLsd(e.target.value)}
              placeholder='Location LSD'
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <label className='block text-[#e6ffe6] font-bold mb-1 text-xs'>Missile</label>
            <input
              className='w-full bg-[#191d18] border-2 border-[#6a7257] rounded px-2 py-1 text-white text-xs font-bold'
              required
              value={missile}
              onChange={e => setMissile(e.target.value)}
              placeholder='Missile'
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <label className='block text-[#e6ffe6] font-bold mb-1 text-xs'>Start Date</label>
            <input
              className='w-full bg-[#191d18] border-2 border-[#6a7257] rounded px-2 py-1 text-white text-xs font-bold'
              type='date'
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          <div className='col-span-12 flex gap-2 justify-end pt-1'>
            <button
              type='button'
              className='px-3 py-1 rounded font-bold text-xs'
              style={{ background: '#10110e', border: '2px solid #6a7257', color: '#ffe066' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-3 py-1 rounded font-bold text-xs'
              style={{ background: '#6a7257', border: '2px solid #e6ffe6', color: '#fff' }}
            >
              Add Job
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// =================== Missile Job Hub Card Component ===================
export default function MissileJobHubCard() {
  const [activeMissileJobs, setActiveMissileJobs] = useState([]);
  const [upcomingMissileJobs, setUpcomingMissileJobs] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);

  function handleAddJob(job) {
    setActiveMissileJobs(jobs => [...jobs, { ...job, status: 'Active' }]);
  }

  return (
    <div
      className='border-2 border-[#6a7257] rounded-2xl shadow-2xl px-4 flex flex-row min-h-[60px]'
      style={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        background: 'var(--glass-tint)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        boxShadow: 'var(--glass-shadow)',
        borderColor: '#6a7257'
      }}
    >
      {/* ===== Main Content ===== */}
      <div className='flex-1 min-w-0'>
        {panelOpen ? (
          <InlineAddMissilePanel
            onClose={() => setPanelOpen(false)}
            onSubmit={handleAddJob}
          />
        ) : (
          <ScaleToFit className='w-full flex-1 min-h-0'>
            <div className='w-full'>
              {/* ===== Active Section ===== */}
              <div className='mb-0'>
                <div
                  className={
                    colClasses +
                    ' items-center pb-1 pt-2 border-b border-[#393c32] mb-1 font-extrabold text-[#b0b79f] text-xs uppercase tracking-wider'
                  }
                  style={{ fontSize: '0.75rem' }}
                >
                  <span />
                  <span className='text-center underline'>Customer</span>
                  <span className='text-center underline'>LSD</span>
                  <span className='text-center underline'>Missile</span>
                  <span className='text-center underline'>Start Date</span>
                  <span className='text-center underline'>Status</span>
                </div>
                <div className='flex flex-col'>
                  {activeMissileJobs.length === 0 ? (
                    <div className='text-center italic text-sm text-[#6a7257] py-3'>
                      No active missile jobs.
                    </div>
                  ) : (
                    activeMissileJobs.map((job, idx) => (
                      <MissileJobRow job={job} key={idx} highlight />
                    ))
                  )}
                </div>
              </div>

              {/* ===== Upcoming Section ===== */}
              <div>
                <div
                  className={
                    colClasses +
                    ' items-center pb-1 pt-2 border-b border-[#393c32] mb-1 font-bold text-[#b0b79f] text-xs uppercase tracking-wider'
                  }
                  style={{ fontSize: '0.75rem' }}
                >
                  <span />
                  <span className='text-center underline'>Customer</span>
                  <span className='text-center underline'>LSD</span>
                  <span className='text-center underline'>Missile</span>
                  <span className='text-center underline'>Start Date</span>
                  <span className='text-center underline'>Status</span>
                </div>
                <div className='flex flex-col'>
                  {upcomingMissileJobs.length === 0 ? (
                    <div className='text-center italic text-sm text-[#6a7257] py-3'>
                      No upcoming missile jobs.
                    </div>
                  ) : (
                    upcomingMissileJobs.map((job, idx) => (
                      <MissileJobRow job={job} key={idx} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </ScaleToFit>
        )}
      </div>

      {/* ===== Right Actions Panel ===== */}
      <div className='ml-3 pl-3 fhq-action-rail'>
        <ActionIconBtn
          icon={icons.plus}
          tooltip='Add Job'
          onClick={() => setPanelOpen(true)}
        />
      </div>
    </div>
  );
}
