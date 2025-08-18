// =================== Imports and Dependencies ===================
// src/pages/JobPlannerComponents/ViewToggleButtons.jsx

import Button from '../../components/ui/Button'

// =================== ViewToggleButtons Component ===================
export default function ViewToggleButtons({
  viewMode,
  setViewMode,
  setShowModal,
  resetCalendarMonth, 
}) {
  // =================== Render ViewToggleButtons ===================
  return (
    <div className="flex gap-4">
      {/* Table View Button */}
      <Button onClick={() => setViewMode('table')}>
        Table View
      </Button>

      {/* Calendar View Button */}
      <Button
        onClick={() => {
          setViewMode('calendar')
          if (typeof resetCalendarMonth === 'function') resetCalendarMonth()
        }}
      >
        Calendar View
      </Button>

      {/* Add New Job Button */}
      <Button onClick={() => setShowModal(true)}>
        + Add New Job
      </Button>
    </div>
  )
}
