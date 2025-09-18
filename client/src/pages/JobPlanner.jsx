// ==============================
// FLY-HQ JOB PLANNER — PAGE
// ==============================

import { useCallback, useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API } from '../api';
import DocumentHubModal from '../components/DocumentHubModal';
import CalendarView from '../components/JobPlannerComponents/CalendarView';
import BOMPage from '../components/Workorder Components/BOMPage';

import JobModal from '../components/JobPlannerComponents/JobModal';
import SourcingModal from '../components/JobPlannerComponents/SourcingModal';
import TableView from '../components/JobPlannerComponents/TableView';
import { showPalomaToast } from '../utils/toastUtils';
import useCustomerLogos from '../hooks/useCustomerLogos';
import { getCustomerLogo as mapCustomerLogo } from '../utils/customerLogos';

export default function JobPlanner() {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [newJob, setNewJob] = useState({
    id: null,
    customer: '',
    surface_lsd: '',
    products: '',
    rig_in_date: '',
    start_date: '',
    end_date: '',
    num_wells: '',
    valve_7_1_16: '',
    valve_5_1_8: '',
    valve_hyd: '',
    valve_man: '',
    gateway_pods: '',
    awc_pods: '',
    grease_unit: '',
    coil_trees: '',
    accumulator: '',
    techs: '',
    work_orders: '',
    status: '',
  });
  const [showBOMModal, setShowBOMModal] = useState(false);
  const [selectedBOMJob, setSelectedBOMJob] = useState(null);
  const [selectedBOMObj, setSelectedBOMObj] = useState(null);
  const [rowStatus, setRowStatus] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jobPlanner_rowStatus')) || {}; }
    catch { return {}; }
  });
  const [unlockedMonths, setUnlockedMonths] = useState({});
  const [showSourcingModal, setShowSourcingModal] = useState(false);
  const [sourcingJob, setSourcingJob] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedAuditJob, setSelectedAuditJob] = useState(null);
  const [earliestInProgressMonthKey, setEarliestInProgressMonthKey] = useState(null);
  const scrollRef = useRef(null);
  const currentYear = new Date().getFullYear();
  const [showDocHubModal, setShowDocHubModal] = useState(false);
  const [selectedDocHubJob, setSelectedDocHubJob] = useState(null);

  const { logoMap: customerLogoMap } = useCustomerLogos();
  const getCustomerLogo = useCallback(
    (name) => mapCustomerLogo(customerLogoMap, name),
    [customerLogoMap]
  );

  const unlockMonth = (monthKey) => setUnlockedMonths((prev) => ({ ...prev, [monthKey]: true }));
  const lockMonth = (monthKey) => setUnlockedMonths((prev) => { const copy = { ...prev }; delete copy[monthKey]; return copy; });

  const handleOpenDocHub = (job) => { setSelectedDocHubJob(job); setShowDocHubModal(true); };

  const formatValue = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    return isNaN(num) ? '-' : num.toFixed(0);
  };

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API}/api/jobs`, { credentials: 'include' });
      const data = await res.json();
      let jobsData = data.map((job) => ({ ...job, customer: job.customer?.trim().toUpperCase() || '' }));
      const seen = new Set();
      jobsData = jobsData.filter((job) => {
        const key = `${job.customer}-${job.rig_in_date}-${job.surface_lsd}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const currentYear = new Date().getFullYear();
      jobsData = jobsData.filter((job) => new Date(job.rig_in_date).getFullYear() === currentYear);
      jobsData.sort((a, b) => new Date(a.rig_in_date) - new Date(b.rig_in_date));
      setJobs(jobsData);
    } catch (err) {
      console.error('❌ [JobPlanner] fetch error:', err);
    }
  };

  const handleCreateOrUpdate = async (jobData) => {
    const method = editMode ? 'PUT' : 'POST';
    const endpoint = editMode ? `${API}/api/jobs/${editingJobId}` : `${API}/api/jobs`;
    const payload = { ...jobData };
    if (!editMode) delete payload.id;

    try {
      await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      resetForm();
      fetchJobs();
      showPalomaToast({
        message: editMode ? "Job Edited Successfully" : "New Job Created",
        detail: editMode ? "The job was updated in the planner." : "A new job was added to the planner.",
        type: "success",
      });
    } catch (err) {
      console.error('Failed to save job:', err);
      showPalomaToast({
        message: "Error Saving Job",
        detail: "There was a problem saving the job. Please try again.",
        type: "error",
      });
    }
  };

  const handleEdit = (job) => {
    setEditMode(true);
    setEditingJobId(job.id);
    setNewJob({
      id: job.id,
      customer: job.customer || '',
      surface_lsd: job.surface_lsd || '',
      products: job.products || '',
      rig_in_date: job.rig_in_date || '',
      start_date: job.start_date || '',
      end_date: job.end_date || '',
      num_wells: job.num_wells ?? '',
      valve_7_1_16: job.valve_7_1_16 ?? '',
      valve_5_1_8: job.valve_5_1_8 ?? '',
      valve_hyd: job.valve_hyd ?? '',
      valve_man: job.valve_man ?? '',
      gateway_pods: job.gateway_pods ?? '',
      awc_pods: job.awc_pods ?? '',
      grease_unit: job.grease_unit ?? '',
      coil_trees: job.coil_trees ?? '',
      accumulator: job.accumulator ?? '',
      techs: job.techs || '',
      work_orders: job.work_orders || '',
      status: job.status || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await fetch(`${API}/api/jobs/${id}`, { method: 'DELETE', credentials: 'include' });
        fetchJobs();
        showPalomaToast({
          message: "Job Deleted",
          detail: "The job was removed from the planner.",
          type: "success",
        });
      } catch (err) {
        console.error('Failed to delete job:', err);
        showPalomaToast({
          message: "Error Deleting Job",
          detail: "There was a problem deleting the job. Please try again.",
          type: "error",
        });
      }
    }
  };

  const handleDeleteAudit = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this audit file?')) {
      try {
        const res = await fetch(`${API}/api/jobs/${jobId}/audit-checklist`, { method: 'DELETE', credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, auditChecklistUrl: null } : j)));
        showPalomaToast({
          message: "Audit File Deleted",
          detail: "The audit checklist file was removed.",
          type: "success",
        });
      } catch (err) {
        console.error('Failed to delete audit file:', err);
        showPalomaToast({
          message: "Error Deleting Audit File",
          detail: "There was a problem deleting the audit file. Please try again.",
          type: "error",
        });
      }
    }
  };

  const resetForm = () => {
    setNewJob({
      id: null,
      customer: '',
      surface_lsd: '',
      products: '',
      rig_in_date: '',
      start_date: '',
      end_date: '',
      num_wells: '',
      valve_7_1_16: '',
      valve_5_1_8: '',
      valve_hyd: '',
      valve_man: '',
      gateway_pods: '',
      awc_pods: '',
      grease_unit: '',
      coil_trees: '',
      accumulator: '',
      techs: '',
      work_orders: '',
      status: '',
    });
    setShowModal(false);
    setEditMode(false);
    setEditingJobId(null);
  };

  const handleShowBOM = (job, bomObj) => {
    setSelectedBOMJob(job);
    setSelectedBOMObj(bomObj);
    setShowBOMModal(true);
  };
  const handleCloseBOM = () => { setSelectedBOMJob(null); setSelectedBOMObj(null); setShowBOMModal(false); };

  const updateJobStatus = async (jobId, newStatus) => {
    const currentStatus = rowStatus[jobId] || '';
    const isSame = currentStatus === newStatus;
    const statusToSend = isSame ? '' : newStatus;

    const newRowStatus = { ...rowStatus };
    if (isSame) delete newRowStatus[jobId];
    else newRowStatus[jobId] = newStatus;

    setRowStatus(newRowStatus);
    localStorage.setItem('jobPlanner_rowStatus', JSON.stringify(newRowStatus));

    const logEntry = { jobId, oldStatus: currentStatus, newStatus: statusToSend, timestamp: new Date().toISOString() };
    const prevLog = JSON.parse(localStorage.getItem('jobPlanner_statusLog') || '[]');
    prevLog.push(logEntry);
    localStorage.setItem('jobPlanner_statusLog', JSON.stringify(prevLog));

    try {
      const res = await fetch(`${API}/api/jobs/${jobId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusToSend }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updatedJob = await res.json();
      setJobs((prev) => prev.map((job) => (job.id === jobId ? updatedJob : job)));
      showPalomaToast({
        message: "Job Status Updated",
        detail: `Job status set to "${newStatus}".`,
        type: "success",
      });
    } catch (err) {
      console.error('Failed to save status change:', err);
      setRowStatus(rowStatus);
      localStorage.setItem('jobPlanner_rowStatus', JSON.stringify(rowStatus));
      showPalomaToast({
        message: "Error Updating Status",
        detail: "Failed to update job status on the server.",
        type: "error",
      });
    }
  };

  const handleSubmitSourcing = async (job) => {
    setShowSourcingModal(true);
    setSourcingJob(job);
  };

  const groupByMonth = (entries) => {
    const map = new Map();
    entries.forEach((job) => {
      const date = new Date(job.rig_in_date);
      if (!isNaN(date)) {
        const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(job);
      }
    });
    return map;
  };
  const monthGroups = groupByMonth(jobs);

  const monthKeys = Array.from(monthGroups.keys());
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const parseMonthKey = (key) => {
    if (!key || key === "Full Year") return null;
    const [monthName, yearString] = key.trim().split(' ');
    const fixedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
    const yearNum = Number(yearString);
    const monthIndex = months.findIndex((m) => m === fixedMonth);
    if (monthIndex < 0 || isNaN(yearNum)) return null;
    return { year: yearNum, monthIndex };
  };

  const [selectedMonthKey, setSelectedMonthKey] = useState("Full Year");

  const filteredJobs = jobs.filter(job => {
    const jobMonth = new Date(job.rig_in_date).toLocaleString('default', { month: 'long', year: 'numeric' });
    return (!selectedCustomer || job.customer === selectedCustomer) &&
           (selectedMonthKey === "Full Year" || !selectedMonthKey || selectedMonthKey === jobMonth);
  });

  const renderMonthTabs = () => (
    <div className="flex items-center justify-between overflow-x-auto space-x-1 scrollbar-hide w-full">
      {/* Left: Month tabs */}
      <div className="flex items-center space-x-1">
        <button
          key="full-year"
          className={`px-4 py-1.5 rounded-t-lg font-semibold transition-all text-xs whitespace-nowrap
            ${selectedMonthKey === "Full Year" ? 'border-b-4 border-[#6a7257] text-[#6a7257] bg-black' : 'text-white bg-zinc-900 hover:bg-zinc-800'}`}
          onClick={() => setSelectedMonthKey("Full Year")}
          style={{ minWidth: 120, outline: 'none' }}
        >
          Full Year
        </button>
        {monthKeys.map(key => (
          <button
            key={key}
            className={`px-4 py-1.5 rounded-t-lg font-semibold transition-all text-xs whitespace-nowrap
              ${key === selectedMonthKey ? 'border-b-4 border-[#6a7257] text-[#6a7257] bg-black' : 'text-white bg-zinc-900 hover:bg-zinc-800'}`}
            onClick={() => setSelectedMonthKey(key)}
            style={{ minWidth: 120, outline: 'none' }}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Right: Global add (kept) */}
      <button
        onClick={() => setShowModal(true)}
        aria-label="Add New Job"
        title="Add New Job"
        className="ml-auto px-4 py-1 rounded-md border-2 border-green-400 text-green-400 bg-transparent hover:bg-[#6a7257] hover:text-black font-bold text-xs whitespace-nowrap"
        style={{ lineHeight: 1 }}
      >
        + Add New Job
      </button>
    </div>
  );

  const singleMonth = parseMonthKey(selectedMonthKey);

  return (
    <div
      className="job-planner-bg text-white"
      style={{
        backgroundImage: 'url("/assets/dark-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100%',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        marginLeft: 10,
        padding: 0,
        boxSizing: "border-box"
      }}
    >
      <ToastContainer position="bottom-right" autoClose={3400} newestOnTop={true} closeOnClick />
      {/* OUTER WRAPPER */}
      <div
        className="w-full h-full flex  justify-center items-top"
        style={{
          height: 1032, 
          minHeight: 1032,
          width: "100%",
          minWidth: "100%",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Main job planner container */}
        <div
          className="main-content-block  h-full mt-0 shadow-xl flex flex-row"
          style={{
            width: "100%",
            maxWidth: "100%",
            minWidth: "100%",
            height: "100%", 
            minHeight: "0",
            marginTop: "0",
            background: 'rgba(0,0,0,0.86)',
            boxShadow: '0 4px 42px 0 #2229',
            alignItems: "stretch",
            border: '2px solid #6a7257',
            boxSizing: "border-box",
          }}
        >
          {/* LEFT: Main table/calendar content */}
          <div
            className="flex-1 flex flex-col min-w-0"
            style={{
              height: '100%',
              overflowY: 'auto',
              minHeight: 0,
              maxHeight: '100%',
            }}
          >
            {/* Month Tabs + Add button */}
            <div
              className="flex justify-between items-center px-6 py- bg-black bg-opacity-90 border-b-4 border-[#6a7257] shadow-xl  mb-0"
              style={{
                width: '100%',
                margin: 0,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }}>
              {renderMonthTabs()}
            </div>

            <div className="w-full" style={{ margin: 0, padding: 0 }}>
              <TableView
                monthGroups={monthGroups}
                isVisible={(job) => {
                  if (selectedMonthKey === "Full Year") return (!selectedCustomer || job.customer === selectedCustomer);
                  const jobMonth = new Date(job.rig_in_date).toLocaleString('default', { month: 'long', year: 'numeric' });
                  return (!selectedCustomer || job.customer === selectedCustomer) && (!selectedMonthKey || selectedMonthKey === jobMonth);
                }}
                rowStatus={rowStatus}
                unlockedMonths={unlockedMonths}
                unlockMonth={unlockMonth}
                lockMonth={lockMonth}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleSubmitSourcing={handleSubmitSourcing}
                handleStatusChange={updateJobStatus}
                handleDeleteAudit={handleDeleteAudit}
                formatValue={formatValue}
                scrollRef={scrollRef}
                showAuditModal={showAuditModal}
                setShowAuditModal={setShowAuditModal}
                selectedAuditJob={selectedAuditJob}
                setSelectedAuditJob={setSelectedAuditJob}
                onShowBOM={handleShowBOM}
                handleOpenDocHub={handleOpenDocHub}
                onDiscordIdUpdated={fetchJobs}
                getCustomerLogo={getCustomerLogo}
                /* >>> per-month buttons open the same JobModal <<< */
                onAddJob={() => setShowModal(true)}
              />
            </div>

            <div className="w-full" style={{ margin: 0, padding: 0 }}>
              <CalendarView
                months={months}
                currentYear={currentYear}
                singleMonth={singleMonth}
                setSelectedMonth={setSelectedMonthKey}
                events={jobs.map(job => ({
                  id: job.id?.toString() || '',
                  title: `${job.customer} – ${job.surface_lsd}`,
                  start: job.rig_in_date,
                  end: job.end_date,
                  allDay: true,
                  extendedProps: { ...job },
                }))}
                getCustomerLogo={getCustomerLogo}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals and overlays --- */}
      <JobModal
        isOpen={showModal}
        onClose={resetForm}
        onSave={handleCreateOrUpdate}
        existingJob={editMode ? newJob : null}
      />

      <SourcingModal
        isOpen={showSourcingModal}
        onClose={() => { setShowSourcingModal(false); setSourcingJob(null); }}
        onSubmit={async (ticketInfo) => {
          try {
            for (let it of ticketInfo.items) {
              const payload = {
                base: ticketInfo.base,
                neededBy: ticketInfo.neededBy,
                project: ticketInfo.project,
                vendor: ticketInfo.vendor,
                category: ticketInfo.category,
                priority: ticketInfo.priority,
                status: ticketInfo.status,
                itemDescription: it.description,
                quantity: it.quantity,
              };
              const res = await fetch(`${API}/api/sourcing`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
              if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.error || `HTTP ${res.status}`);
              }
            }
            setShowSourcingModal(false);
            setSourcingJob(null);
            showPalomaToast({
              message: "Sourcing Ticket Submitted",
              detail: "Sourcing ticket(s) submitted successfully.",
              type: "success",
            });
          } catch (err) {
            console.error('Failed to submit sourcing ticket:', err);
            showPalomaToast({
              message: "Sourcing Submission Failed",
              detail: err.message,
              type: "error",
            });
          }
        }}
        job={sourcingJob}
      />

      {showBOMModal && selectedBOMJob && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative bg-black border-4 border-[#6a7257] shadow-2xl rounded-2xl p-6 max-w-5xl w-full overflow-y-auto max-h-[90vh]">
            <button
              onClick={handleCloseBOM}
              className="absolute top-3 right-5 text-3xl text-[#6a7257] hover:text-red-600 font-bold focus:outline-none"
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="text-3xl font-erbaum uppercase mb-4 text-center text-[#6a7257]">
              Bill of Materials – {selectedBOMJob.customer} ({selectedBOMJob.surface_lsd})
            </h2>
            {(() => {
              let bomProps = {};
              if (selectedBOMObj && selectedBOMObj.bom) bomProps = selectedBOMObj.bom;
              else if (selectedBOMJob.work_orders) {
                try {
                  const parsed = typeof selectedBOMJob.work_orders === 'object'
                    ? selectedBOMJob.work_orders
                    : JSON.parse(selectedBOMJob.work_orders);
                  if (parsed && parsed.bom) bomProps = parsed.bom;
                } catch { /* ignore */ }
              }
              return (
                <div className="overflow-x-auto">
                  <BOMPage {...bomProps} />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {showDocHubModal && selectedDocHubJob && (
        <DocumentHubModal
          isOpen={showDocHubModal}
          onClose={() => setShowDocHubModal(false)}
          job={selectedDocHubJob}
          notify={showPalomaToast}
        />
      )}
    </div>
  );
}
