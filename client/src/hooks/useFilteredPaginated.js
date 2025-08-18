// src/hooks/useFilteredPaginated.js
import { useMemo } from 'react';

export default function useFilteredPaginated(
  items,
  filters,
  sortConfig,
  currentPage,
  itemsPerPage
) {
  // 1) Filter
  const filtered = useMemo(() => {
    return items.filter((a) => {
      return (
        (!filters.id || a.id === filters.id) &&
        (!filters.sn || a.sn === filters.sn) &&
        (!filters.name || a.name === filters.name) &&
        (!filters.category || a.category === filters.category) &&
        (!filters.location || a.location === filters.location) &&
        (!filters.status || a.status === filters.status)
      );
    });
  }, [items, filters]);

  // 2) Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filtered, sortConfig]);

  // 3) Paginate
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return { filtered, paginated, totalPages };
}
