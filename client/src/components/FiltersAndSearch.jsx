// src/components/FiltersAndSearch.jsx

import React from 'react';

export default function FiltersAndSearch({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  idOptions = [],
  snOptions = [],
  nameOptions = [],
  categoryOptions = [],
  locationOptions = [],
  statusOptions = [],
}) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Dropdown Filters */}
      {['id', 'sn', 'name', 'category', 'location', 'status'].map((key) => (
        <select
          key={key}
          className="bg-black text-white px-3 py-1 rounded border border-gray-600"
          value={filters[key]}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, [key]: e.target.value }))
          }
        >
          <option value="">
            All {key.charAt(0).toUpperCase() + key.slice(1)}
          </option>

          {(() => {
            switch (key) {
              case 'id':
                return idOptions.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ));
              case 'sn':
                return snOptions.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ));
              case 'name':
                return nameOptions.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ));
              case 'category':
                return categoryOptions.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ));
              case 'location':
                return locationOptions.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ));
              case 'status':
                return statusOptions.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ));
              default:
                return null;
            }
          })()}
        </select>
      ))}

      {/* Search Bar */}
      <div className="ml-auto w-full max-w-xs">
        <input
          type="text"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded border border-gray-600 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </div>
  );
}
