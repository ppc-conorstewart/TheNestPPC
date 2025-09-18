// =================== Imports and Dependencies ===================
// src/components/CalendarView.jsx
import FullCalendar from '@fullcalendar/react';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';


import { useEffect, useRef, useState } from 'react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

// =================== CalendarView Component ===================
export default function CalendarView({
  months,
  currentYear,
  singleMonth,
  setSelectedMonth,
  events,
  getCustomerLogo,
}) {
  // --------- Local State and References ---------
  const [showCalendar, setShowCalendar] = useState(true);
  const calendarRef = useRef(null);

  // --------- Filter Events by Selected Month ---------
  let filteredEvents = events;
  if (singleMonth) {
    filteredEvents = events.filter((e) => {
      const d = new Date(e.start);
      return (
        d instanceof Date &&
        !isNaN(d) &&
        d.getFullYear() === singleMonth.year &&
        d.getMonth() === singleMonth.monthIndex
      );
    });
  }

  // --------- Date Click Handler (expand if needed) ---------
  const handleDateClick = (arg) => {};

  // --------- Render Custom Event Content ---------
  const renderEventContent = (eventInfo) => {
    const job = eventInfo.event.extendedProps;
    const logoPath = getCustomerLogo
      ? getCustomerLogo(job.customer)
      : `/assets/logos/${(job.customer || '').toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;
    return {
      domNodes: [
        (() => {
          const wrapper = document.createElement('div');
          wrapper.className = 'flex items-center justify-center text-center gap-3 rounded text-white px-2 border-2 border-[#6a7257]';
          wrapper.style.backgroundColor = 'white';
          wrapper.style.boxShadow = 'none';
          wrapper.style.color = 'black';
          wrapper.style.height = '30px';
          wrapper.style.overflow = 'hidden';
          wrapper.style.width = '100%';

          if (logoPath) {
            const img = document.createElement('img');
            img.src = logoPath;
            img.alt = 'logo';
            img.className = 'h-10 w-10 object-contain';
            img.onerror = (e) => (e.currentTarget.style.display = 'none');
            wrapper.appendChild(img);
          }

          const textDiv = document.createElement('div');
          textDiv.className = 'text-sm font-bold leading-tight';
          textDiv.innerText = `${job.customer} • ${job.surface_lsd || 'LSD'} • Wells: ${parseInt(job.num_wells) || 0}`;

          wrapper.appendChild(textDiv);
          return wrapper;
        })()
      ]
    };
  };

  // --------- Add Tooltip on Event Mount ---------
  const handleEventDidMount = (info) => {
    const job = info.event.extendedProps;
    if (info.el) tippy(info.el, {
      content: `
        <div style="text-align:center; max-width: 250px; background-color: black; color: white; border: none; box-shadow: 0 0 0 2px #6a7257; padding: 10px; border-radius: 0px; font-weight: bold;">
          <div style='background-color: white; padding: 4px; border-radius: 4px; margin-bottom: 6px; display:flex; justify-content:center;'>
            ${(() => {
              const logo = getCustomerLogo ? getCustomerLogo(job.customer) : `/assets/logos/${job.customer?.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;
              if (!logo) return '';
              return `<img src='${logo}' alt='logo' style='height: 54px; width: 54px; object-fit: contain;' onerror="this.style.display='none'" />`;
            })()}
          </div>
          <div style='margin-bottom: 4px;'>LSD: ${job.surface_lsd || 'N/A'}</div>
          <div style='margin-bottom: 8px;'>Wells: ${parseInt(job.num_wells) || 0}</div>
          <strong style='color: yellow; text-decoration: underline;'>Requirements:</strong>
          <ul style='padding-left: 18px; text-align: left; color: #6a7257;'>
            <li>7-1/16" Valves: <strong style='color: white;'>${parseInt(job.valve_7_1_16) || 0}</strong></li>
            <li>5-1/8" Valves: <strong style='color: white;'>${parseInt(job.valve_5_1_8) || 0}</strong></li>
            <li>3-1/16" HYD: <strong style='color: white;'>${parseInt(job.valve_hyd) || 0}</strong></li>
            <li>3-1/16" MAN: <strong style='color: white;'>${parseInt(job.valve_man) || 0}</strong></li>
            <li>Gateway Pods: <strong style='color: white;'>${parseInt(job.gateway_pods) || 0}</strong></li>
            <li>AWC: <strong style='color: white;'>${parseInt(job.awc_pods) || 0}</strong></li>
            <li>Grease: <strong style='color: white;'>${parseInt(job.grease_unit) || 0}</strong></li>
            <li>Coil Trees: <strong style='color: white;'>${parseInt(job.coil_trees) || 0}</strong></li>
            <li>Accumulator: <strong style='color: white;'>${parseInt(job.accumulator) || 0}</strong></li>
            <li>Techs: <strong style='color: white;'>${parseInt(job.techs) || 0}</strong></li>
          </ul>
        </div>
      `,
      allowHTML: true,
      placement: 'top',
    });
  };

  // --------- Force FullCalendar Resize on Show ---------
  useEffect(() => {
    if (showCalendar && calendarRef.current) {
      calendarRef.current.getApi().updateSize();
    }
  }, [showCalendar]);

  // --------- Calendar Header Text ---------
  const headerText =
    singleMonth
      ? `${months[singleMonth.monthIndex]} ${singleMonth.year} Calendar`
      : 'Calendar';

  // --------- Calendar Icon Component ---------
  function CalendarIcon() {
    return (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a4ac85"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          marginRight: 14,
          marginLeft: 8,
          filter: 'drop-shadow(0 1px 6px #1b1d16cc)',
          verticalAlign: 'middle',
          background: 'rgba(0,0,0,0.88)',
          borderRadius: 6,
        }}
      >
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M16 3v4M8 3v4M3 9h18" />
      </svg>
    );
  }

  // --------- Chevron Icon Component ---------
  function ChevronIcon({ open }) {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.22s cubic-bezier(.5,1.8,.6,.9)',
          display: 'block',
          marginLeft: 12,
          filter: 'drop-shadow(0 2px 6px #000a)',
        }}
        stroke="#a4ac85"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
  }

  // =================== Render CalendarView Component ===================
  return (
    <div
      className="w-full"
      style={{
        background: 'black',
        border: '1px solid #6a7257',
        borderRadius: '12px',
        padding: 0,
        margin: 0,
      }}
    >
      {/* --------- Toggle Bar --------- */}
      <div
        className="w-full select-none cursor-pointer flex items-center justify-between"
        style={{
          background: 'black',
          minHeight: '48px',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          borderBottom: '1px solid #222',
          userSelect: 'none',
          transition: 'background 0.2s',
        }}
        onClick={() => setShowCalendar((v) => !v)}
        title="Click to expand/collapse calendar"
      >
        {/* Left: calendar icon, Center: title, Right: chevron */}
        <div className="flex items-center flex-1 justify-center w-full">
          <CalendarIcon />
          <h2 className="text-2xl font-bold text-center py-2 text-[#a4ac85] uppercase tracking-wide transition-all duration-200"
              style={{ letterSpacing: '0.05em' }}>
            {headerText}
          </h2>
        </div>
        <ChevronIcon open={showCalendar} />
      </div>

      {/* --------- Calendar Content --------- */}
      <div
        style={{
          maxHeight: showCalendar ? 2400 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.36s cubic-bezier(0.42,0,0.58,1)',
          background: 'black',
        }}
      >
        {showCalendar && (
          <div className="w-full" style={{ margin: 0, padding: 0 }}>
            <FullCalendar
  key={singleMonth ? `${singleMonth.year}-${singleMonth.monthIndex}` : 'all'}
  ref={calendarRef}
  plugins={[dayGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  initialDate={singleMonth ? `${singleMonth.year}-${(singleMonth.monthIndex + 1).toString().padStart(2, '0')}-01` : undefined}
  headerToolbar={false}
  events={filteredEvents}
  dateClick={handleDateClick}
  eventContent={renderEventContent}
  eventDidMount={handleEventDidMount}
  height="auto"
  firstDay={0}
  dayHeaderClassNames={() => 'text-xs font-semibold text-white'}
  dayCellClassNames={() => 'text-xs'}
/>

          </div>
        )}
      </div>
    </div>
  );
}
