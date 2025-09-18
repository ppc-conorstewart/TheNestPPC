// =================== FILE: client/src/components/HQ-Dashboard/DeployedCoilCard.jsx ===================

// =================== Imports and Dependencies ===================
import { useState } from 'react';
import ScaleToFit from '../ui/ScaleToFit';

// =================== Icon SVGs ===================
const icons = {
  plus: (
    <svg width='20' height='20' viewBox='0 0 24 24' fill='none'
      stroke='#57b4ff' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
      <circle cx='12' cy='12' r='10' />
      <line x1='12' y1='7' x2='12' y2='17' />
      <line x1='7' y1='12' x2='17' y2='12' />
    </svg>
  )
};

// =================== Action Icon Button Component ===================
function ActionIconBtn({ icon, tooltip, color, border, bg, onClick }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className='relative flex items-center justify-center'>
      <button
        className={`
          rounded-full border-2 flex items-center justify-center
          bg-[#191d18]
          border-[#393c32]
          transition duration-150 transform
          w-[24px] h-[24px]
          hover:scale-110
          hover:border-[#57b4ff]
          focus:outline-none
        `}
        style={{
          color: color || '#57b4ff',
          borderColor: border || '#393c32',
          background: bg || '#191d18'
        }}
        tabIndex={0}
        aria-label={tooltip}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onFocus={() => setShowTip(true)}
        onBlur={() => setShowTip(false)}
        onClick={onClick}
      >
        {icon}
      </button>
      {showTip && (
        <span
          className={`
            absolute z-30 left-1/2 -translate-x-1/2 top-7
            pointer-events-none select-none
            whitespace-nowrap
            bg-black bg-opacity-90 text-[#57b4ff] text-xs px-2 py-1 rounded
            font-bold
            shadow-md border border-[#57b4ff]
            animate-fadein
          `}
          style={{
            fontSize: 11,
            fontWeight: 700
          }}
        >
          {tooltip}
        </span>
      )}
    </div>
  );
}

// =================== Inline Add Job Panel (Scaled Down Fonts) ===================
function InlineAddJobPanel({ onClose, onSubmit }) {
  const [customer, setCustomer] = useState('');
  const [lsd, setLsd] = useState('');
  const [numWells, setNumWells] = useState('');
  const [dateDeployed, setDateDeployed] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      customer,
      surface_lsd: lsd,
      num_wells: numWells,
      date_deployed: dateDeployed,
      expected_return_date: expectedReturn,
      customerLogo: ''
    });
    onClose();
  }

  return (
    <div className='w-full h-full flex flex-col'>
      <div className='w-full border-b-2 border-[#6a7257] pb-1 pt-1 flex items-center justify-center'>
        <span className='text-[#e6ffe6] font-extrabold text-xs uppercase tracking-wide flex-1 text-center'>
          Add Deployed Coil Job
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

          <div className='col-span-12 md:col-span-4'>
            <label className='block text-[#e6ffe6] font-bold mb-1 text-xs'># Wells</label>
            <input
              className='w-full bg-[#191d18] border-2 border-[#6a7257] rounded px-2 py-1 text-white text-xs font-bold'
              type='number'
              min={1}
              max={20}
              required
              value={numWells}
              onChange={e => setNumWells(e.target.value)}
            />
          </div>

          <div className='col-span-12 md:col-span-4'>
            <label className='block text-[#e6ffe6] font-bold mb-1 text-xs'>Date Deployed</label>
            <input
              className='w-full bg-[#191d18] border-2 border-[#6a7257] rounded px-2 py-1 text-white text-xs font-bold'
              type='date'
              required
              value={dateDeployed}
              onChange={e => setDateDeployed(e.target.value)}
            />
          </div>

          <div className='col-span-12 md:col-span-4'>
            <label className='block text-[#e6ffe6] font-bold mb-1 text-xs'>Expected Return</label>
            <input
              className='w-full bg-[#191d18] border-2 border-[#6a7257] rounded px-2 py-1 text-white text-xs font-bold'
              type='date'
              required
              value={expectedReturn}
              onChange={e => setExpectedReturn(e.target.value)}
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

// =================== Deployed Coil Card Component ===================
export default function DeployedCoilCard() {
  const [jobs, setJobs] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);

  const colClasses = 'grid grid-cols-6 w-full';

  return (
    <div
      className='border-2 border-[#6a7257] rounded-2xl shadow-2xl px-4 flex flex-row min-h-[60px]'
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--glass-tint)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        boxShadow: 'var(--glass-shadow)',
        borderColor: '#6a7257'
      }}
    >
      <div className='flex-1 min-w-0'>
        {panelOpen ? (
          <InlineAddJobPanel
            onClose={() => setPanelOpen(false)}
            onSubmit={job => setJobs(j => [...j, job])}
          />
        ) : (
          <ScaleToFit className='w-full flex-1 min-h-0'>
            <div className='w-full'>
              <div
                className={
                  colClasses +
                  ' items-center pb-1 pt-2 border-b border-[#393c32] mb-1 font-bold text-[#b0b79f] text-xs uppercase tracking-wider'
                }
                style={{ fontSize: '0.75rem' }}
              >
                <span className='text-center'>Logo</span>
                <span className='text-center underline'>Customer</span>
                <span className='text-center underline'>LSD</span>
                <span className='text-center underline'># Wells</span>
                <span className='text-center underline'>Date Deployed</span>
                <span className='text-center underline'>Expected Return</span>
              </div>

              <div className='flex flex-col'>
                {jobs.length === 0 ? (
                  <div className='text-center py-8 text-[#6a7257] text-sm italic font-bold tracking-wide opacity-70'>
                    No coil jobs deployed yet.
                  </div>
                ) : (
                  jobs.map((job, idx) => (
                    <div
                      key={idx}
                      className={
                        colClasses +
                        ' items-center py-1 group relative transition-all duration-200 rounded-lg ' +
                        'hover:bg-gradient-to-r hover:from-[#20241a]/90 hover:to-[#34381a]/90 cursor-pointer'
                      }
                      style={{
                        minHeight: 32,
                        fontSize: '0.75rem',
                        boxShadow: '0 0 0.5px 0 #35392e, 0 8px 24px 0 #23240e33'
                      }}
                    >
                      <div className='flex flex-row items-center justify-center'>
                        <span className='inline-block w-2 h-2 rounded-full bg-blue-400 shadow border border-[#162b49] mr-1'></span>
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
                          <span style={{ color: '#b0d6ff', fontSize: 8, fontWeight: 900 }}>Logo</span>
                        </div>
                      </div>
                      <div className='flex flex-col items-center justify-center'>
                        <span className='font-bold text-white text-xs uppercase tracking-wide text-center'>
                          {job.customer}
                        </span>
                      </div>
                      <div className='flex flex-col items-center'>
                        <span className='text-xs text-[#b0b79f] font-mono text-center'>
                          {job.surface_lsd}
                        </span>
                      </div>
                      <div className='flex flex-col items-center'>
                        <span className='text-xs text-[#ffe066] font-bold font-mono text-center'>
                          {job.num_wells != null && !isNaN(Number(job.num_wells)) ? Number(job.num_wells).toFixed(0) : '-'}
                        </span>
                      </div>
                      <div className='flex flex-col items-center'>
                        <span className='text-xs font-bold font-mono text-[#4adeff] text-center'>
                          {job.date_deployed
                            ? new Date(job.date_deployed).toLocaleDateString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric'
                              })
                            : '-'}
                        </span>
                      </div>
                      <div className='flex flex-col items-center'>
                        <span className='text-xs font-bold font-mono text-[#ffe066] text-center'>
                          {job.expected_return_date
                            ? new Date(job.expected_return_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric'
                              })
                            : '-'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ScaleToFit>
        )}
      </div>

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
