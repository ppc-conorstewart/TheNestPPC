// =====================================================
// CustomerFieldContacts.jsx — Customer Hub Field Contacts Panel • Glass
// Sections: Component
// =====================================================

export default function CustomerFieldContacts() {
  return (
    <div className="glass-card p-4 flex flex-col flex-1 min-w-[200px]">
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
