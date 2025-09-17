// ==============================
// src/components/Master Assembly Components/Support Files/masterMetaApi.js
// Meta & Gasket API + date helpers
// ==============================

import { resolveApiUrl } from '../../../api';
const MASTER_BASE = '/api/master';
const masterUrl = (suffix = '') => resolveApiUrl(`${MASTER_BASE}${suffix}`);

export function normDate(v) {
  if (!v) return '';
  const s = typeof v === 'string' ? v : String(v);
  const m = s.match(/^\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : '';
}

export function normDates(obj = {}) {
  return {
    ...obj,
    creation_date: normDate(obj.creation_date),
    recert_date: normDate(obj.recert_date),
  };
}

export function addMonths(dateStr, months) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export async function apiFetchMeta(assembly, child) {
  const res = await fetch(
    masterUrl(`/meta/${encodeURIComponent(assembly)}/${encodeURIComponent(child)}`),
    { credentials: 'include' }
  );
  if (!res.ok) return { status: 'Inactive', creation_date: '', recert_date: '' };
  const data = await res.json();
  return normDates(data);
}

export async function apiSaveMeta({ assembly, child, status, creation_date, recert_date, updated_by = 'Current User' }) {
  const body = {
    assembly,
    child,
    status,
    creation_date: normDate(creation_date),
    recert_date: normDate(recert_date),
    updated_by
  };
  const res = await fetch(masterUrl('/meta'), {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Failed to save meta');
  const data = await res.json();
  return normDates(data);
}

export async function apiFetchGaskets(assembly, child) {
  const res = await fetch(
    masterUrl(`/gaskets/${encodeURIComponent(assembly)}/${encodeURIComponent(child)}`),
    { credentials: 'include' }
  );
  if (!res.ok) return [];
  return await res.json();
}

export async function apiSaveGasketsBulk({ assembly, child, items, updated_by = 'Current User' }) {
  const payload = items.map(i => ({
    ...i,
    gasket_date: normDate(i.gasket_date)
  }));
  const res = await fetch(masterUrl('/gaskets/bulk'), {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assembly, child, items: payload, updated_by })
  });
  if (!res.ok) throw new Error('Failed to save gaskets');
  return await res.json();
}

