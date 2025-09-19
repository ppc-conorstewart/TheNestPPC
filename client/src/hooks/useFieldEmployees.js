import { useCallback, useEffect, useState } from 'react';
import { resolveApiUrl } from '../api';

const EMPTY_COMPETENCIES = {};

function normalizeDocument(doc = {}) {
  if (!doc) return null;
  const id = doc.id || doc.document_id || null;
  return {
    id,
    name: doc.name || doc.original_filename || '',
    mime: doc.mime || doc.mime_type || '',
    uploaded_at: doc.uploaded_at || doc.created_at || null,
    downloadUrl: doc.downloadUrl || doc.download_url || (id ? `/api/field-employees/${doc.employee_id || doc.employeeId || ''}/documents/${id}/download` : null)
  };
}

function normalizeEmployee(raw = {}) {
  if (!raw) return null;
  const docs = Array.isArray(raw.documents) ? raw.documents : [];
  return {
    id: raw.id,
    full_name: raw.full_name || raw.fullName || '',
    base_location: raw.base_location ?? raw.baseLocation ?? '',
    rank: Number.isFinite(raw.rank) ? raw.rank : Number(raw.rank) || 0,
    level: Number.isFinite(raw.level) ? raw.level : Number(raw.level) || 0,
    is_active: typeof raw.is_active === 'boolean' ? raw.is_active : true,
    created_at: raw.created_at || null,
    updated_at: raw.updated_at || null,
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    competencies: (raw.competencies && typeof raw.competencies === 'object') ? raw.competencies : EMPTY_COMPETENCIES,
    documents: docs.map(normalizeDocument).filter(Boolean)
  };
}

export default function useFieldEmployees({ autoFetch = true } = {}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(resolveApiUrl('/api/field-employees'), {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Failed to fetch field employees: ${res.status}`);
      const data = await res.json();
      const normalized = Array.isArray(data) ? data.map(normalizeEmployee).filter(Boolean) : [];
      setEmployees(normalized);
      return normalized;
    } catch (err) {
      console.error('useFieldEmployees.fetchEmployees', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const mutateEmployee = useCallback((id, updater) => {
    setEmployees(prev => prev.map(emp => (emp.id === id ? { ...emp, ...updater(emp) } : emp)));
  }, []);

  const createEmployee = useCallback(async ({ full_name, base_location, rank = 0, level = 0 }) => {
    const payload = {
      full_name,
      base_location,
      rank,
      level
    };
    const res = await fetch(resolveApiUrl('/api/field-employees'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to create employee: ${res.status}`);
    const created = normalizeEmployee(await res.json());
    setEmployees(prev => [...prev, created]);
    return created;
  }, []);

  const updateEmployee = useCallback(async (id, updates = {}) => {
    const res = await fetch(resolveApiUrl(`/api/field-employees/${id}`), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`Failed to update employee: ${res.status}`);
    const updated = normalizeEmployee(await res.json());
    setEmployees(prev => prev.map(emp => (emp.id === id ? updated : emp)));
    return updated;
  }, []);

  const saveNotes = useCallback(async (id, body = '') => {
    const res = await fetch(resolveApiUrl(`/api/field-employees/${id}/notes`), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body })
    });
    if (!res.ok) throw new Error(`Failed to save employee notes: ${res.status}`);
    mutateEmployee(id, () => ({ notes: body }));
  }, [mutateEmployee]);

  const saveCompetencies = useCallback(async (id, data = {}) => {
    const res = await fetch(resolveApiUrl(`/api/field-employees/${id}/competencies`), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    if (!res.ok) throw new Error(`Failed to save competencies: ${res.status}`);
    mutateEmployee(id, () => ({ competencies: data }));
  }, [mutateEmployee]);

  const uploadDocuments = useCallback(async (id, files = []) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const res = await fetch(resolveApiUrl(`/api/field-employees/${id}/documents`), {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    if (!res.ok) throw new Error(`Failed to upload documents: ${res.status}`);
    const payload = await res.json();
    const docs = Array.isArray(payload) ? payload.map(normalizeDocument).filter(Boolean) : [];
    mutateEmployee(id, (emp) => ({ documents: docs }));
    return docs;
  }, [mutateEmployee]);

  const deleteDocument = useCallback(async (id, docId) => {
    const res = await fetch(resolveApiUrl(`/api/field-employees/${id}/documents/${docId}`), {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`Failed to delete employee document: ${res.status}`);
    mutateEmployee(id, (emp) => ({ documents: (emp.documents || []).filter(doc => doc.id !== docId) }));
  }, [mutateEmployee]);

  const deleteEmployee = useCallback(async (id) => {
    const res = await fetch(resolveApiUrl(`/api/field-employees/${id}`), {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`Failed to delete employee: ${res.status}`);
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  }, []);

  useEffect(() => {
    if (!autoFetch) return;
    fetchEmployees().catch(() => {});
  }, [autoFetch, fetchEmployees]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    saveNotes,
    saveCompetencies,
    uploadDocuments,
    deleteDocument,
    deleteEmployee,
    setEmployees
  };
}
