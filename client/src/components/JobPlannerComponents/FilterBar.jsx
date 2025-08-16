// =================== Imports and Dependencies ===================
// src/pages/JobPlannerComponents/FilterBar.jsx


// =================== FilterBar Component ===================
export default function FilterBar({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  monthGroups,
  selectedMonth,
  setSelectedMonth,
}) {
  // =================== Render Filter Bar ===================
  return (
    <div className="flex gap-4 mb-4">
      {/* --------- Customer Filter Dropdown --------- */}
      <select
        value={selectedCustomer}
        onChange={(e) => setSelectedCustomer(e.target.value)}
        className="bg-black border border-white px-2 py-1 text-white"
      >
        <option value="">All Customers</option>
        {customers.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* --------- Month Filter Dropdown --------- */}
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="bg-black border border-white px-2 py-1 text-white"
      >
        <option value="">All Months</option>
        {Object.keys(monthGroups).map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
