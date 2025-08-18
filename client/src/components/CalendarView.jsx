// src/components/CalendarView.jsx
import dayGridPlugin from '@fullcalendar/daygrid';
import '@fullcalendar/daygrid/main.css';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { useRef } from 'react';
import { Tooltip } from 'react-tippy';
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/dist/svg-arrow.css';
import 'tippy.js/dist/tippy.css';

/**
 * Props:
 *   - jobs: array of job objects. Each job must have:
 *       { id, customer, surface_lsd, products, rig_in_date, start_date, end_date,
 *         num_wells, valve_7_1_16, valve_5_1_8, valve_hyd, valve_man,
 *         gateway_pods, awc_pods, grease_unit, coil_trees, accumulator,
 *         techs, work_orders }
 *
 *   - selectedMonth: string like "April 2025". If empty or null, show full year grid.
 *   - currentYear: number (e.g. 2025)
 */
export default function CalendarView({ jobs, selectedMonth, currentYear }) {
  const calendarRefs = useRef({}); // to keep one ref per month

  // 1) Build FullCalendar “events” from each job
  const events = jobs.map((job) => {
    // FullCalendar expects an ISO date: “YYYY-MM-DD”
    // We assume job.rig_in_date and job.end_date are already in “YYYY-MM-DD” format.
    // If not, you can do new Date(job.rig_in_date).toISOString().split('T')[0] etc.
    const start = job.rig_in_date;
    const end = job.end_date;

    // Title on the calendar – “CUSTOMER – LSD”
    const title = `${job.customer} – ${job.surface_lsd}`;

    // All other fields we’ll pass as `extendedProps` so they show in tooltip
    return {
      id: job.id.toString(),
      title,
      start,
      end,
      allDay: true,
      extendedProps: {
        products: job.products,
        num_wells: job.num_wells,
        valve_7_1_16: job.valve_7_1_16,
        valve_5_1_8: job.valve_5_1_8,
        valve_hyd: job.valve_hyd,
        valve_man: job.valve_man,
        gateway_pods: job.gateway_pods,
        awc_pods: job.awc_pods,
        grease_unit: job.grease_unit,
        coil_trees: job.coil_trees,
        accumulator: job.accumulator,
        techs: job.techs,
        work_orders: job.work_orders,
      },
    };
  });

  // 2) Helper to render tooltip content
  const renderTooltipContent = (info) => {
    const p = info.event.extendedProps;
    return `
      <div style="font-size: 0.9rem; line-height: 1.2rem;">
        <strong>Customer:</strong> ${info.event.title.split(' – ')[0]}<br/>
        <strong>LSD:</strong> ${info.event.title.split(' – ')[1]}<br/>
        <strong>Products:</strong> ${p.products || '-'}<br/>
        <strong># Wells:</strong> ${p.num_wells || '0'}<br/>
        <strong>7-1/16" Valves:</strong> ${p.valve_7_1_16 || '0'}<br/>
        <strong>5-1/8" Valves:</strong> ${p.valve_5_1_8 || '0'}<br/>
        <strong>3-1/16" HYD:</strong> ${p.valve_hyd || '0'}<br/>
        <strong>3-1/16" MAN:</strong> ${p.valve_man || '0'}<br/>
        <strong>Gateway Pods:</strong> ${p.gateway_pods || '0'}<br/>
        <strong>AWC:</strong> ${p.awc_pods || '0'}<br/>
        <strong>Grease:</strong> ${p.grease_unit || '0'}<br/>
        <strong>Coil:</strong> ${p.coil_trees || '0'}<br/>
        <strong>Acc:</strong> ${p.accumulator || '0'}<br/>
        <strong>Techs:</strong> ${p.techs || '0'}<br/>
        <strong>W.O.:</strong> ${p.work_orders || '-'}
      </div>
    `;
  };

  // 3) When FullCalendar renders an event, attach a Tippy tooltip
  const handleEventDidMount = (info) => {
    // We wrap the event element in a Tooltip
    new Tooltip({
      target: info.el,
      html: renderTooltipContent(info),
      position: 'right',
      theme: 'light-border',
      animation: 'scale-subtle',
      inertia: true,
      hideOnClick: false,
      duration: [200, 200],
      arrow: true,
      offset: [0, 10],
    });
  };

  // 4) If user picks a specific month, we only display that month’s calendar.
  // Otherwise, we show a grid of all 12 months (each in its own <FullCalendar>).
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Helper: convert "April 2025" -> { year: 2025, monthIndex: 3 }
  const parseMonthKey = (key) => {
    if (!key) return null;
    const [monthName, yearString] = key.split(' ');
    const yearNum = Number(yearString);
    const monthIndex = months.findIndex((m) => m === monthName);
    if (monthIndex < 0 || isNaN(yearNum)) return null;
    return { year: yearNum, monthIndex };
  };

  // If a single month is selected, we just render one FullCalendar for that month
  const singleMonth = parseMonthKey(selectedMonth);

  return (
    <div className="bg-[#111] border border-[#6a7257] rounded-lg p-4 text-white">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="material-icons-outlined">calendar_month</span>
        Calendar View
      </h2>

      {singleMonth ? (
        // ────────────────────── One‐Month Calendar ──────────────────────
        <div className="mx-auto max-w-3xl">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={`${singleMonth.year}-${(singleMonth.monthIndex + 1)
              .toString()
              .padStart(2, '0')}-01`}
            headerToolbar={false}
            events={events}
            eventDidMount={handleEventDidMount}
            height="auto"
            firstDay={0} // Sunday=0, Monday=1, etc.
          />
        </div>
      ) : (
        // ────────────────────── Full‐Year Grid (12 Months) ──────────────────────
        <div className="grid grid-cols-3 gap-6">
          {months.map((monthName, idx) => (
            <div key={monthName} className="bg-[#222] rounded-md p-3">
              <h3 className="text-center font-semibold mb-2">
                {monthName} {currentYear}
              </h3>
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                initialDate={`${currentYear}-${(idx + 1)
                  .toString()
                  .padStart(2, '0')}-01`}
                headerToolbar={false}
                events={events}
                eventDidMount={handleEventDidMount}
                height="auto"
                firstDay={0}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
