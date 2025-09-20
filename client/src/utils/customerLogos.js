import { API_BASE_URL } from '../api';

const RAW_API_BASE = (API_BASE_URL || '').trim();
const API_BASE = RAW_API_BASE.replace(/\/+$/, '');
const WINDOW_ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';
const LOGO_PATH_PREFIX = '/assets/logos/';

let API_ORIGIN = '';
try {
  API_ORIGIN = API_BASE ? new URL(API_BASE).origin : '';
} catch {
  API_ORIGIN = '';
}

const FALLBACK_BASE = (API_BASE || WINDOW_ORIGIN || '').replace(/\/+$/, '');
const IMG_BASE = (API_ORIGIN || FALLBACK_BASE || '').replace(/\/+$/, '');

function withBase(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith(LOGO_PATH_PREFIX)) {
    return IMG_BASE ? `${IMG_BASE}${normalized}` : normalized;
  }
  return FALLBACK_BASE ? `${FALLBACK_BASE}${normalized}` : normalized;
}

export function resolveCustomerLogo(value) {
  if (!value || typeof value !== 'string') return null;

  const cleaned = value.trim();
  if (!cleaned) return null;
  if (cleaned.startsWith('blob:')) return cleaned;

  const base = IMG_BASE;
  if (base && cleaned.startsWith(base)) return cleaned;

  if (/^https?:\/\//i.test(cleaned)) {
    try {
      const parsed = new URL(cleaned);
      const path = parsed.pathname || '';
      if (path.startsWith(LOGO_PATH_PREFIX)) {
        return withBase(path);
      }
      return cleaned;
    } catch {
      return cleaned;
    }
  }

  const normalized = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  return withBase(normalized);
}

export function prepareCustomerLogoForSubmit(value) {
  if (!value || typeof value !== 'string') return '';
  const cleaned = value.trim();
  if (!cleaned) return '';
  if (cleaned.startsWith('blob:')) return '';
  if (/^https?:\/\//i.test(cleaned)) {
    try {
      const parsed = new URL(cleaned);
      const path = parsed.pathname || '';
      if (path.startsWith(LOGO_PATH_PREFIX)) return path;
      return cleaned;
    } catch {
      return cleaned;
    }
  }
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
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
