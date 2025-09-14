// ==========================================
// FILE: src/pages/SourcingPage.jsx
// ==========================================

import axios from 'axios';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { API } from '../api';
import SubmitTicketModal from '../components/SubmitTicketModal';
import './SourcingPage.css';

// ==============================
// ======= NAV ITEMS ============
// ==============================
const NAV_ITEMS = [
  { label: 'TABLE & CALENDAR', key: 'table' },
  { label: 'PARTS LIST', key: 'parts' },
  { label: 'VENDORS LIST', key: 'vendors' },
  { label: 'SOURCING ANALYTICS', key: 'analytics' },
];

// ==============================
// Helper: format date for inputs
// ==============================
function formatInputDate(dateValue) {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

// ==========================================
// COMPONENT: SourcingPage
// ==========================================
export default function SourcingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [activeNav, setActiveNav] = useState('table');
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    category: 'All',
  });

  // ==============================
  // ======= UI LOCAL STATE =======
  // ==============================
  const [isCompletedOpen, setIsCompletedOpen] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openForm') === 'true') {
      setShowForm(true);
    }
  }, [location.search]);

  const defaultFormData = {
    base: '',
    neededBy: '',
    project: '',
    vendor: '',
    category: 'Other',
    priority: 'Medium',
    status: 'Requested',
    items: [{ description: '', quantity: '' }],
  };
  const [formData, setFormData] = useState(defaultFormData);

  const fetchTickets = async () => {
    try {
      const { status, priority, category } = filters;
      const params = {};
      if (status !== 'All') params.status = status;
      if (priority !== 'All') params.priority = priority;
      if (category !== 'All') params.category = category;
      const res = await axios.get(`${API}/api/sourcing`, { params });
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to load sourcing tickets:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line
  }, [filters]);

  const handleSubmitTicket = async (modalFormData, idToEdit = null) => {
    setError('');
    try {
      if (idToEdit !== null) {
        await axios.put(`${API}/api/sourcing/${idToEdit}`, {
          base: modalFormData.base,
          neededBy: modalFormData.neededBy,
          project: modalFormData.project,
          vendor: modalFormData.vendor,
          category: modalFormData.category,
          priority: modalFormData.priority,
          status: modalFormData.status,
          itemDescription: modalFormData.items[0].description,
          quantity: modalFormData.items[0].quantity,
        });
      } else {
        await Promise.all(
          modalFormData.items.map((item) =>
            axios.post(`${API}/api/sourcing`, {
              base: modalFormData.base,
              neededBy: modalFormData.neededBy,
              project: modalFormData.project,
              vendor: modalFormData.vendor,
              category: modalFormData.category,
              priority: modalFormData.priority,
              status: modalFormData.status,
              itemDescription: item.description,
              quantity: item.quantity,
            })
          )
        );
      }
      await fetchTickets();
      handleModalClose();
    } catch (err) {
      setError(err.response?.data?.error || 'There was an error submitting the tickets.');
    }
  };

  const handleEditClick = (ticket) => {
    setEditingId(ticket.id);
    setFormData({
      base: ticket.base,
      neededBy: ticket.needed_by || ticket.neededBy,
      project: ticket.project,
      vendor: ticket.vendor || '',
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      items: [
        {
          description: ticket.item_description || ticket.itemDescription,
          quantity: ticket.quantity,
        },
      ],
    });
    setError('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmation = prompt('Type DELETE (all caps) to confirm deletion of this ticket.');
    if (confirmation !== 'DELETE') return;
    try {
      await axios.delete(`${API}/api/sourcing/${id}`);
      await fetchTickets();
    } catch {
      alert('Unable to delete. Please try again.');
    }
  };

  const handleModalOpen = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const handleModalClose = () => {
    setShowForm(false);
    setEditingId(null);
    setError('');
    setFormData(defaultFormData);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpectedDateChange = async (e, ticketId) => {
    const newDate = e.target.value;
    try {
      const res = await axios.patch(`${API}/api/sourcing/${ticketId}`, {
        expectedDate: newDate,
      });
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? res.data : t)));
    } catch (err) {
      alert(err.response?.data?.error || 'There was an error updating the expected date.');
    }
  };

  const completedTickets = tickets.filter(
    (t) => t.status === 'Received' || t.status === 'Complete'
  );

  const TICKETS_AREA_HEIGHT = 420;

  return (
    <div className="w-full min-h-screen flex justify-center items-start bg-transparent py-0 px-0">
      <SubmitTicketModal
        open={showForm}
        onClose={handleModalClose}
        onSubmit={handleSubmitTicket}
        initialData={formData}
        editingId={editingId}
        error={error}
        setError={setError}
      />

      <div className="w-full max-w-full flex flex-row rounded-none border-none shadow-none min-h-full bg-transparent">
        {/* ============================== */}
        {/* LEFT NAV PANEL (Glass)         */}
        {/* ============================== */}
        <div className="w-[210px] min-w-[170px] glass glass-panel border-r border-transparent/20 flex flex-col py-4 px-2 items-start">
          {NAV_ITEMS.map(({ label, key }) => (
            <button
              key={key}
              className={`mb-0 font-varien text-[1.02rem] tracking-wide text-center w-full py-1 px-1 rounded transition-all ${
                activeNav === key
                  ? 'glass-button-active'
                  : 'glass-button'
              }`}
              onClick={() => setActiveNav(key)}
              style={{ textTransform: 'uppercase', lineHeight: 1.2, letterSpacing: '0.08em' }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ============================== */}
        {/* MAIN CONTENT                   */}
        {/* ============================== */}
        <div className="flex-1 flex flex-col gap-0 px-0 py-0 min-h-[calc(100vh-64px)]">
          {/* HUB HEADER (Glass) */}
          <div className="w-full flex items-center justify-center pb-1 px-8 mb-0 glass glass-header">
            <h1
              className="text-[2.8rem] tracking-widest text-white text-center uppercase font-bold drop-shadow-lg"
              style={{
                fontFamily: "'Varien', 'varien', 'Inter', 'Arial', 'sans-serif'",
                fontStyle: 'italic',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Sourcing Hub
            </h1>
            <button
              onClick={handleModalOpen}
              className="ml-80 glass-cta text-white font-bold px-5 py-1 rounded-lg transition text-base"
            >
              + Submit New Ticket
            </button>
          </div>

          {activeNav === 'table' && (
            <div
              className="flex flex-col w-full gap-4 px-3 flex-1 relative"
              style={{ height: 'calc(100vh - 110px)' }}
            >
              {/* ============================== */}
              {/* CURRENT TICKETS (Glass)        */}
              {/* ============================== */}
              <div
                className="glass rounded-xl w-full shadow mb-1 overflow-auto"
                style={{ flex: '0 0 auto', maxHeight: TICKETS_AREA_HEIGHT, minHeight: 180 }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between glass-subheader px-6 py-2 gap-2">
                  <h2 className="text-lg text-[#cfd3c3] font-varien font-bold uppercase">Current Tickets</h2>
                  <div className="flex flex-wrap gap-3 justify-end items-center">
                    <div>
                      <label className="text-[#cfd3c3] mr-1 font-xs">Filter by Status:</label>
                      <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="glass-input text-white px-3 py-0 rounded"
                      >
                        <option>All</option>
                        <option>Requested</option>
                        <option>Ordered</option>
                        <option>Received</option>
                        <option>Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[#cfd3c3] mr-1 font-xs">Filter by Priority:</label>
                      <select
                        name="priority"
                        value={filters.priority}
                        onChange={handleFilterChange}
                        className="glass-input text-white px-3 py-0 rounded"
                      >
                        <option>All</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[#cfd3c3] mr-2 font-xs">Filter by Category:</label>
                      <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="glass-input text-white px-3 py-0 rounded"
                      >
                        <option>All</option>
                        <option>Consumables</option>
                        <option>Equipment</option>
                        <option>Spare Parts</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <table className="min-w-full my-0 text-center text-gray-200 bg-transparent text-left text-sm">
                    <thead>
                      <tr>
                        <th className="px-2 py-2">Item</th>
                        <th className="px-2 py-2">Base</th>
                        <th className="px-2 py-2">Needed By</th>
                        <th className="px-2 py-2">Quantity</th>
                        <th className="px-2 py-2">Project</th>
                        <th className="px-2 py-2">Vendor</th>
                        <th className="px-2 py-2">Category</th>
                        <th className="px-2 py-2">Priority</th>
                        <th className="px-2 py-2">Expected Date</th>
                        <th className="px-2 py-2">Status</th>
                        <th className="px-2 py-2">Attachments</th>
                        <th className="px-2 py-2">Created At</th>
                        <th className="px-2 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets
                        .filter(
                          (t) =>
                            t.status !== 'Received' &&
                            t.status !== 'Complete' &&
                            t.status !== 'Cancelled'
                        )
                        .map((t) => (
                          <tr key={t.id} className="glass-row">
                            <td className="px-2 text-xs font-bold py-2">{t.item_description || t.itemDescription}</td>
                            <td className="px-2 text-xs py-1">{t.base}</td>
                            <td className="px-2 text-xs py-1">
                              {formatInputDate(t.needed_by || t.neededBy)}
                            </td>
                            <td className="px-2 text-xs py-1">{t.quantity}</td>
                            <td className="px-2 text-sm text-[#cfd3c3] font-bold py-1">{t.project}</td>
                            <td className="px-2 text-xs py-1">{t.vendor || '—'}</td>
                            <td className="px-2 text-xs py-1">{t.category}</td>
                            <td className="px-2 text-xs py-1">{t.priority}</td>
                            <td className="px-2 text-xs py-1">
                              <input
                                type="date"
                                value={formatInputDate(t.expected_date || t.expectedDate)}
                                onChange={(e) => handleExpectedDateChange(e, t.id)}
                                className="glass-input text-xs text-white px-2 py-1 rounded"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`px-2 py-1 text-sm font-bold status-pill ${
                                  t.status === 'Requested'
                                    ? 'pill-requested'
                                    : t.status === 'Ordered'
                                    ? 'pill-ordered'
                                    : t.status === 'Received'
                                    ? 'pill-received'
                                    : 'pill-default'
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              {t.attachments?.length ? (
                                t.attachments.map((p, i) => (
                                  <a
                                    key={i}
                                    href={p}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-[#cfd3c3] mr-2 text-xs"
                                  >
                                    View
                                  </a>
                                ))
                              ) : (
                                <button className="glass-chip text-white px-2 py-1 rounded text-xs">Upload</button>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {new Date(t.created_at || t.createdAt).toLocaleString()}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => handleEditClick(t)}
                                className="glass-btn-warn text-black mr-2 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="glass-btn-danger text-white text-xs"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ flex: 1 }} />

              {/* ============================== */}
              {/* BOTTOM ROW                     */}
              {/* ============================== */}
              <div className="flex flex-row text-center gap-4 w-full mt-auto">
                {/* ====================================== */}
                {/* Completed Orders (Glass • Collapsible) */}
                {/* ====================================== */}
                <div className="glass rounded-xl w-1/2 shadow mb-2 overflow-hidden flex flex-col"
                     style={{
                       transition: 'max-height 280ms ease',
                       transformOrigin: 'bottom',
                       maxHeight: isCompletedOpen ? 600 : 44
                     }}>
                  <div className="flex items-center justify-between glass-subheader px-6 py-0">
                    <h2 className="text-lg text-center text-[#cfd3c3] font-varien uppercase">
                      Completed Orders Log
                    </h2>
                    <button
                      onClick={() => setIsCompletedOpen((s) => !s)}
                      className="glass-chip text-white px-3 py-0.5 rounded text-xs"
                      aria-label="Toggle Completed Orders"
                      title={isCompletedOpen ? 'Collapse' : 'Expand'}
                    >
                      {isCompletedOpen ? '▼' : '▲'}
                    </button>
                  </div>

                  <div className="p-1" style={{ overflow: 'auto' }}>
                    <table className="min-w-full my-0 text-center text-gray-200 bg-transparent text-left text-sm">
                      <thead>
                        <tr>
                          <th className="px-2 py-2">Item</th>
                          <th className="px-2 py-2">Base</th>
                          <th className="px-2 py-2">Quantity</th>
                          <th className="px-2 py-2">Project</th>
                          <th className="px-2 py-2">Vendor</th>
                          <th className="px-2 py-2">Category</th>
                          <th className="px-2 py-2">Priority</th>
                          <th className="px-2 py-2">Expected Date</th>
                          <th className="px-2 py-2">Status</th>
                          <th className="px-2 py-2">Completed At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedTickets.map((t) => (
                          <tr key={t.id} className="glass-row">
                            <td className="px-2 text-xs font-bold py-2">{t.item_description || t.itemDescription}</td>
                            <td className="px-2 text-xs py-1">{t.base}</td>
                            <td className="px-2 text-xs py-1">{t.quantity}</td>
                            <td className="px-2 text-sm text-[#cfd3c3] font-bold py-1">{t.project}</td>
                            <td className="px-2 text-xs py-1">{t.vendor || '—'}</td>
                            <td className="px-2 text-xs py-1">{t.category}</td>
                            <td className="px-2 text-xs py-1">{t.priority}</td>
                            <td className="px-2 text-xs py-1">{formatInputDate(t.expected_date || t.expectedDate) || '—'}</td>
                            <td className="px-2 py-2">
                              <span className="status-pill pill-received text-xs font-bold">{t.status}</span>
                            </td>
                            <td className="px-2 py-2">
                              {new Date(t.updated_at || t.completedAt || t.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        {!completedTickets.length && (
                          <tr>
                            <td colSpan={10} className="text-center py-6 text-gray-400">No completed orders yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ================================ */}
                {/* Calendar (Glass • Collapsible)   */}
                {/* ================================ */}
                <div className="glass rounded-xl w-1/2 shadow mb-2 overflow-hidden flex flex-col"
                     style={{
                       transition: 'max-height 280ms ease',
                       transformOrigin: 'bottom',
                       maxHeight: isCalendarOpen ? 600 : 44
                     }}>
                  <div className="flex items-center justify-between glass-subheader px-6 py-0">
                    <h2 className="text-lg text-[#cfd3c3] font-varien font-bold uppercase">
                      Sourcing Calendar
                    </h2>
                    <button
                      onClick={() => setIsCalendarOpen((s) => !s)}
                      className="glass-chip text-white px-3 py-0.5 rounded text-xs"
                      aria-label="Toggle Calendar"
                      title={isCalendarOpen ? 'Collapse' : 'Expand'}
                    >
                      {isCalendarOpen ? '▼' : '▲'}
                    </button>
                  </div>

                  <div className="flex justify-center py-6 flex-1" style={{ overflow: 'auto' }}>
                    <Calendar
                      calendarType="US"
                      className="my-calendar"
                      tileContent={({ date, view }) => {
                        if (view === 'month') {
                          const dString = date.toISOString().slice(0, 10);
                          const found = tickets.find((t) => {
                            const tDate = formatInputDate(t.expected_date || t.expectedDate);
                            return tDate === dString;
                          });
                          return found ? (
                            <div className="tile-label">
                              {(found.item_description || found.itemDescription) + ' Delivery'}
                            </div>
                          ) : null;
                        }
                        return null;
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'parts' && (
            <div className="flex flex-1 justify-center items-center text-2xl text-gray-300 font-varien glass">Parts List coming soon...</div>
          )}
          {activeNav === 'vendors' && (
            <div className="flex flex-1 justify-center items-center text-2xl text-gray-300 font-varien glass">Vendors List coming soon...</div>
          )}
          {activeNav === 'analytics' && (
            <div className="flex flex-1 justify-center items-center text-2xl text-gray-300 font-varien glass">Sourcing Analytics coming soon...</div>
          )}
        </div>
      </div>
    </div>
  );
}
