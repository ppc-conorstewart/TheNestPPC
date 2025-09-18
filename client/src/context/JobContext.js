import { resolveApiUrl } from '../api'
// ==============================
// JobContext.js — Global Job State Context (with Overwatch Sync, History, Required Items)
// ==============================

console.log("JobContext.js LOADED from", import.meta && import.meta.url ? import.meta.url : "unknown location");

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// ==============================
// Context Creation
// ==============================
const JobContext = createContext();

// ==============================
// Helpers
// ==============================
function mergeOverwatchIntoJob(job, ow) {
  if (!ow) return job;
  return {
    ...job,
    zoneProgress: ow.zoneProgress || job.zoneProgress,
    requiredItems: ow.requiredItems || job.requiredItems,
    lastShiftNotes: ow.lastShiftNotes || job.lastShiftNotes
  };
}

function shallowEqualJob(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.id !== b.id) return false;
  if (a.zoneProgress !== b.zoneProgress) return false;
  if (a.lastShiftNotes !== b.lastShiftNotes) return false;

  const ra = a.requiredItems || [];
  const rb = b.requiredItems || [];
  if (ra.length !== rb.length) return false;
  for (let i = 0; i < ra.length; i++) {
    const ia = ra[i] || {};
    const ib = rb[i] || {};
    if (ia.id !== ib.id) return false;
    if (ia.item_text !== ib.item_text) return false;
    if (ia.qty !== ib.qty) return false;
    if (ia.status !== ib.status) return false;
  }
  return true;
}

function isAnyMenuOpen() {
  const G = typeof window !== "undefined" ? window : globalThis;
  return Number(G.__palomaMenuOpenAny || 0) > 0;
}

function isVisible() {
  return typeof document === "undefined" ? true : document.visibilityState === "visible";
}

// ==============================
// Provider Component
// ==============================
export function JobProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const pollRef = useRef(null);
  const jobsRef = useRef(jobs);
  const activeJobRef = useRef(activeJob);

  useEffect(() => { jobsRef.current = jobs; }, [jobs]);
  useEffect(() => { activeJobRef.current = activeJob; }, [activeJob]);

  // ==============================
  // Initial Load: Jobs + pick most recent in-progress as active
  // ==============================
  useEffect(() => {
    let ignore = false;
    async function fetchJobs() {
      setLoading(true);
      try {
        const resJobs = await fetch(resolveApiUrl("/api/hq/active-jobs"));
        const jobsData = await resJobs.json();

        const inProgress = (Array.isArray(jobsData) ? jobsData : []).filter(
          j => j.status && j.status.toLowerCase() === "in-progress"
        );
        let mostRecent = null;
        if (inProgress.length > 0) {
          mostRecent = inProgress.reduce((a, b) =>
            new Date(a.last_updated || 0) > new Date(b.last_updated || 0) ? a : b
          );
        }

        if (!ignore) {
          setJobs(Array.isArray(jobsData) ? jobsData : []);
          setActiveJob(mostRecent || null);
        }

        const ids = (Array.isArray(jobsData) ? jobsData : []).map(j => j.id).slice(0, 8);
        ids.forEach(id => fetchOverwatch(id).catch(() => {}));
      } catch {
        if (!ignore) {
          setJobs([]);
          setActiveJob(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchJobs();
    return () => { ignore = true; };
  }, []);

  // ==============================
  // Fetch Overwatch summary for a job and merge into state (dropdown-safe)
  // ==============================
  const fetchOverwatch = useCallback(async (jobId) => {
    if (!jobId) return null;

    if (!isVisible()) return null;
    if (isAnyMenuOpen()) return null;

    const res = await fetch(resolveApiUrl(`/api/jobs/${jobId}/overwatch`));
    if (!res.ok) return null;
    const ow = await res.json();

    const prevJobs = jobsRef.current;
    const nextJobs = Array.isArray(prevJobs) ? prevJobs.map(j => {
      if (j.id !== jobId) return j;
      const merged = mergeOverwatchIntoJob(j, ow);
      return shallowEqualJob(j, merged) ? j : merged;
    }) : [];

    let changed = false;
    if (prevJobs.length !== nextJobs.length) {
      changed = true;
    } else {
      for (let i = 0; i < prevJobs.length; i++) {
        if (prevJobs[i] !== nextJobs[i]) { changed = true; break; }
      }
    }
    if (changed) setJobs(nextJobs);

    const prevActive = activeJobRef.current;
    if (prevActive && prevActive.id === jobId) {
      const mergedActive = mergeOverwatchIntoJob(prevActive, ow);
      if (!shallowEqualJob(prevActive, mergedActive)) {
        setActiveJob(mergedActive);
      }
    }

    return ow;
  }, []);

  // ==============================
  // Update Job (history + latest snapshot)
  // ==============================
  const updateJob = useCallback(async ({ jobId, updateData, updatedBy }) => {
    setJobs(prevJobs =>
      prevJobs.map(j =>
        j.id === jobId
          ? { ...j, job_update_json: updateData, last_updated: new Date().toISOString() }
          : j
      )
    );
    if (activeJobRef.current && activeJobRef.current.id === jobId) {
      setActiveJob(prev => ({
        ...prev,
        job_update_json: updateData,
        last_updated: new Date().toISOString()
      }));
    }

    await fetch(resolveApiUrl(`/api/jobs/${jobId}/update`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        update_data: updateData,
        updated_by: updatedBy || 'system'
      })
    });

    await fetchOverwatch(jobId);
  }, [fetchOverwatch]);

  // ==============================
  // Add Required Item
  // ==============================
  const addRequiredItem = useCallback(async (jobId, { item_text, qty, status }) => {
    const res = await fetch(resolveApiUrl(`/api/jobs/${jobId}/required-items`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_text, qty, status })
    });
    if (!res.ok) return;
    await fetchOverwatch(jobId);
  }, [fetchOverwatch]);

  // ==============================
  // Delete Required Item
  // ==============================
  const deleteRequiredItem = useCallback(async (jobId, itemId) => {
    await fetch(resolveApiUrl(`/api/jobs/${jobId}/required-items/${itemId}`), { method: "DELETE" });
    await fetchOverwatch(jobId);
  }, [fetchOverwatch]);

  // ==============================
  // Set Active Job by ID
  // ==============================
  const setActiveJobById = useCallback((jobId) => {
    const found = jobsRef.current.find(j => j.id === jobId);
    if (found) setActiveJob(found);
  }, []);

  // ==============================
  // Polling for Active Job Overwatch (dropdown-safe)
  // ==============================
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (activeJob?.id) {
      pollRef.current = setInterval(() => {
        if (!isVisible()) return;
        if (isAnyMenuOpen()) return;
        fetchOverwatch(activeJob.id).catch(() => {});
      }, 10000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [activeJob?.id, fetchOverwatch]);

  // ==============================
  // Provider Value
  // ==============================
  return (
    <JobContext.Provider
      value={{
        jobs,
        activeJob,
        loading,
        updateJob,
        fetchOverwatch,
        addRequiredItem,
        deleteRequiredItem,
        setActiveJobById
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

// ==============================
// Hook — useJobContext
// ==============================
export function useJobContext() {
  return useContext(JobContext);
}
