// =================== Imports and Dependencies ===================

// =================== Missile Jobs Card Component ===================
export default function MissileJobsCard({ jobs = [] }) {
  // --------- Display Jobs (Default Placeholder or Provided Data) ---------
  const displayJobs = jobs && jobs.length > 0 ? jobs.slice(0, 7) : [
    { id: 1, name: "Missile Job #1", date: "2025-07-21" },
    { id: 2, name: "Missile Job #2", date: "2025-07-28" }
  ];

  // =================== Render Missile Jobs Card ===================
  return (
    <div className="bg-black border-2 border-[#6a7257] rounded-2xl shadow-lg flex-1 p-6 flex flex-col min-h-[350px]">
      {/* --------- Card Title Section --------- */}
      <h2 className="text-lg text-[#e6e8df] font-bold mb-3 tracking-wide text-center">
        Missile Jobs
      </h2>
      {/* --------- Missile Jobs List --------- */}
      <ul className="flex-1 space-y-2 overflow-y-auto">
        {displayJobs.length === 0 ? (
          <li className="text-gray-400 italic text-center">
            Missile jobs feature coming soon...
          </li>
        ) : (
          displayJobs.map(job => (
            <li
              key={job.id}
              className="bg-[#1a1a1a] rounded px-3 py-2 text-[#E6E8DF] flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{job.name}</div>
                <div className="text-xs text-[#b0b79f]">
                  {job.date ? `Planned: ${job.date}` : ""}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
      {/* --------- View All Button --------- */}
      <div className="mt-4 text-right">
        <button className="text-[#6a7257] font-bold hover:underline text-sm">
          View All
        </button>
      </div>
    </div>
  );
}
