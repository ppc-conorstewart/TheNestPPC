// src/hooks/useActivityLog.js
import { useState, useEffect, useCallback } from 'react';
import { resolveApiUrl } from '../api';

export default function useActivityLog() {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingLog, setLoadingLog] = useState(false);

  const fetchActivityLogs = useCallback(async () => {
    setLoadingLog(true);
    try {
      const res = await fetch(resolveApiUrl('/api/activity'), {
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
