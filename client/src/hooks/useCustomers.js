// ==========================================
// FILE: client/src/hooks/useCustomers.js
// ==========================================

// ==============================
// Imports
// ==============================
import { useEffect, useRef, useState } from 'react';
import { API } from '../api';

// ==============================
// Constants
// ==============================
const API_URL = `${API}/api/customers`;
const IMG_BASE = API;

// ==============================
// Module Cache (In-Memory)
// ==============================
let _cache = {
  loading: false,
  error: null,
  data: null,
  listeners: new Set(),
};

// ==============================
// Helpers
// ==============================
function normalizeLogo(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${IMG_BASE}${url}`;
}

function emit() {
  _cache.listeners.forEach((fn) => {
    try { fn(); } catch {}
  });
}

async function fetchCustomersOnce() {
  if (_cache.loading || _cache.data) return;
  _cache.loading = true;
  _cache.error = null;
  emit();

  try {
    const res = await fetch(API_URL, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();

    const data = rows.map((c) => ({
      id: c.id,
      name: (c.name || '').trim(),
      category: c.category || '',
      logo_url: normalizeLogo(c.logo_url || ''),
      head_office_address: c.head_office_address || '',
      head_of_completions: c.head_of_completions || '',
      head_office_phone: c.head_office_phone || '',
    }));

    data.sort((a, b) => a.name.localeCompare(b.name));

    _cache.data = data;
  } catch (err) {
    _cache.error = err;
  } finally {
    _cache.loading = false;
    emit();
  }
}

// ==============================
// Hook: useCustomers
// ==============================
export function useCustomers() {
  const [, force] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const listener = () => mounted.current && force((n) => n + 1);
    _cache.listeners.add(listener);

    fetchCustomersOnce();

    return () => {
      mounted.current = false;
      _cache.listeners.delete(listener);
    };
  }, []);

  return {
    customers: _cache.data || [],
    loading: _cache.loading,
    error: _cache.error,
    refetch: fetchCustomersOnce,
  };
}

// ==============================
// Utility: map to simple list (names)
// ==============================
export function useCustomerNames() {
  const { customers, loading, error, refetch } = useCustomers();
  return {
    names: customers.map((c) => c.name),
    loading,
    error,
    refetch,
  };
}
