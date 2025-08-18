// ==============================
// CustomerFieldContacts.jsx — Customer Hub Subcomponent
// ==============================

export default function CustomerFieldContacts() {
  return (
    <div className="flex flex-col flex-1 bg-[#1c1c1e] border border-[#949C7F] rounded-lg p-4 min-w-[200px]">
      <h2 className="text-lg font-bold text-[#949C7F] mb-2">
        Field Contacts
      </h2>
      <div className="flex flex-col gap-2 text-[#b0b79f]">
        <div>
          <span className="font-semibold">Completions Lead:</span> [—]
        </div>
        <div>
          <span className="font-semibold">Frac Supervisor:</span> [—]
        </div>
        <div>
          <span className="font-semibold">Onsite Contact:</span> [—]
        </div>
      </div>
    </div>
  );
}
