// =====================================================
// QuickFilters.jsx — Quick Filter Chips (REV, Recently Updated, Favorites)
// =====================================================
export default function QuickFilters({ filters, activeFilter, onFilterChange }) {
  return (
    <div className='flex gap-2 px-3 py-2 flex-wrap'>
      {filters.map(filter => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              borderRadius: 14,
              border: isActive
                ? '1px solid rgba(106,114,87,0.8)'
                : '1px solid rgba(255,255,255,0.1)',
              background: isActive
                ? 'rgba(106,114,87,0.25)'
                : 'rgba(255,255,255,0.05)',
              color: isActive ? '#e1e5d0' : '#aab196',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e =>
              (e.currentTarget.style.background = isActive
                ? 'rgba(106,114,87,0.35)'
                : 'rgba(255,255,255,0.12)')
            }
            onMouseLeave={e =>
              (e.currentTarget.style.background = isActive
                ? 'rgba(106,114,87,0.25)'
                : 'rgba(255,255,255,0.05)')
            }
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
