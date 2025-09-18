import { useEffect, useState } from 'react';
import { API } from '../api';
import { buildCustomerLogoMap, resolveCustomerLogo } from '../utils/customerLogos';

export default function useCustomerLogos() {
  const [customers, setCustomers] = useState([]);
  const [logoMap, setLogoMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API}/api/customers`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setCustomers(list.map((customer) => ({
          ...customer,
          logo_url: resolveCustomerLogo(customer?.logo_url)
        })));
        setLogoMap(buildCustomerLogoMap(list));
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setCustomers([]);
        setLogoMap({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { customers, logoMap, loading, error };
}
