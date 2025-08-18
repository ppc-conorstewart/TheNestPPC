// src/hooks/useActivityLog.js
import { useState, useEffect, useCallback } from 'react';

export default function useActivityLog() {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingLog, setLoadingLog] = useState(false);

  const fetchActivityLogs = useCallback(async () => {
    setLoadingLog(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/activity`, {
        credentials: 'include',
      });
      const data = await res.json();
      setActivityLogs(data);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoadingLog(false);
    }
  }, []);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  return { activityLogs, fetchActivityLogs, loadingLog };
}
