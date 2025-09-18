import { API_BASE_URL } from '../api';

const API_BASE = (API_BASE_URL || '').replace(/\/+$/, '');
const WINDOW_ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';
const IMG_BASE = (API_BASE || WINDOW_ORIGIN || '').replace(/\/+$/, '');
const LOGO_PATH_PREFIX = '/assets/logos/';

function withBase(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return IMG_BASE ? `${IMG_BASE}${normalized}` : normalized;
}

export function resolveCustomerLogo(value) {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('blob:')) return value;

  const base = IMG_BASE;
  if (base && value.startsWith(base)) return value;

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      const path = parsed.pathname || '';
      if (path.startsWith(LOGO_PATH_PREFIX)) {
        return withBase(path);
      }
      return value;
    } catch {
      return value;
    }
  }

  const normalized = value.startsWith('/') ? value : `/${value}`;
  return withBase(normalized);
}

export function prepareCustomerLogoForSubmit(value) {
  if (!value || typeof value !== 'string') return '';
  if (value.startsWith('blob:')) return '';
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      const path = parsed.pathname || '';
      if (path.startsWith(LOGO_PATH_PREFIX)) return path;
      return value;
    } catch {
      return value;
    }
  }
  return value.startsWith('/') ? value : `/${value}`;
}

export function buildCustomerLogoMap(customers = []) {
  const map = {};
  customers.forEach((customer) => {
    const key = (customer?.name || '').trim().toLowerCase();
    if (!key) return;
    const resolved = resolveCustomerLogo(customer?.logo_url);
    if (resolved) map[key] = resolved;
  });
  return map;
}

export function fallbackCustomerLogo(name) {
  const slug = (name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!slug) return null;
  return withBase(`${LOGO_PATH_PREFIX}${slug}.png`);
}

export function getCustomerLogo(map, name) {
  const key = (name || '').trim().toLowerCase();
  if (!key) return null;
  return map[key] || fallbackCustomerLogo(name);
}

export { LOGO_PATH_PREFIX, IMG_BASE };
