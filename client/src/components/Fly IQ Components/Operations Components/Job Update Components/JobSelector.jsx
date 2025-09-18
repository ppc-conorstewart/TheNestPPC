import { resolveApiUrl } from '../../../../api'
// ==============================
// JobSelector.jsx — Custom Listbox with Font and Field Styling (Customer, LSD, Well Count) [Always Passes Job Object to Parent]
// ==============================
import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

function dedupeJobs(jobs) {
  const seen = new Set();
  return jobs.filter(job => {
    const key = [
      job.customer?.trim().toUpperCase(),
      (job.surface_lsd || '').trim().toUpperCase(),
      job.end_date || ''
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function JobSelector({ selectedJobId, setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch(resolveApiUrl("/api/hq/active-jobs"))
      .then(res => res.json())
      .then(data => {
        let filtered = Array.isArray(data) ? data : [];
        filtered = dedupeJobs(filtered);
        setJobs(filtered);
      })
      .catch(() => setJobs([]));
  }, []);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || null;

  function handleListboxChange(id) {
    const jobObj = jobs.find(j => j.id === id) || null;
    setSelectedJobId(id, jobObj, jobs); // Always send id, full job, and job list to parent!
  }

  return (
    <div className="mb-3 flex ml-6 flex-row gap-4 items-center">
      <label className="font-bold text-[#b0b79f] text-xs uppercase mr-2">Select Pad:</label>
      <div className="min-w-[500px] w-[340px] relative">
        <Listbox value={selectedJobId} onChange={handleListboxChange}>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-pointer rounded bg-black border border-[#6a7257] text-white py-2 pl-3 pr-8 text-left text-[13px]">
              <span className="flex items-center gap-2">
                {selectedJob ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400 shadow animate-pulse border border-[#283618]" />
                    <span className="font-bold text-white">
                      {selectedJob.customer || ""}
                    </span>
                    <span className="mx-1 text-[#6a7257] font-mono">
                      {selectedJob.surface_lsd || ""}
                    </span>
                    <span className="ml-1 text-[#a9c27a] font-mono">
                      {selectedJob.num_wells ? `${selectedJob.num_wells} Well Pad` : ""}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400">— Choose a Job —</span>
                )}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                ▼
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-black border border-[#6a7257] py-1 text-sm shadow-lg z-50">
                {jobs.length === 0 && (
                  <div className="px-4 py-2 text-gray-400">No active jobs found.</div>
                )}
                {jobs.map(job => (
                  <Listbox.Option
                    key={job.id}
                    value={job.id}
                    className={({ active, selected }) =>
                      `cursor-pointer select-none relative py-2 pl-3 pr-8 flex items-center gap-2 ${
                        active ? "bg-[#23241b] text-white" : "text-white"
                      } ${selected ? "font-bold" : ""}`
                    }
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400 shadow animate-pulse border border-[#283618]" />
                    <span className="font-bold text-white">
                      {job.customer || ""}
                    </span>
                    <span className="mx-1 text-[#6a7257] font-mono">
                      {job.surface_lsd || ""}
                    </span>
                    <span className="ml-1 text-white font-mono">
                      {job.num_wells ? `${job.num_wells} Well Pad` : ""}
                    </span>
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>
    </div>
  );
}
