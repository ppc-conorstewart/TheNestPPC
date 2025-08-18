// ==============================
// CustomerListPanel.jsx
// ==============================

export default function CustomerListPanel({
  customers,
  selected,
  loading,
  onSelect,
  onAdd
}) {
  // Only group if customer has category, else default to Fracstack
  const fracstackCustomers = customers.filter(
    c => !c.category || (c.category || '').toLowerCase() === 'fracstack'
  );
  const missileCustomers = customers.filter(
    c => (c.category || '').toLowerCase() === 'missile'
  );

  return (
    <div className="bg-[#161616] border border-[#949C7F] rounded-lg p-2 min-w-[320px] max-w-[350px] flex flex-col">
      <div className="mb-4 flex flex-row items-center justify-between">
        <h2
          className="text-xl uppercase font-varien text-[#949C7F] text-center w-full"
          style={{ letterSpacing: "0.14em" }}
        >
          Customer List
        </h2>
        <button
          className="bg-[#949C7F] text-black px-3 py-1 rounded font-bold ml-2 text-lg shadow-sm hover:bg-[#b3b99a] transition"
          style={{ height: 34, minWidth: 34, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={onAdd}
        >
          +
        </button>
      </div>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Fracstack Header */}
          <div className="mb-2">
            <div
              className="w-full text-center font-bold border-b-4 rounded-lg border bg-black text-[.93rem] text-[#949C7F] tracking-wide uppercase"
              style={{
                letterSpacing: '1.0em',
                fontFamily: 'Erbaum, sans-serif'
              }}
            >
              FRACSTACK
            </div>
          </div>
          <ul className="pl-0 overflow-y-auto">
            {fracstackCustomers.map((c) => (
              <li
                key={c.id}
                onClick={() => onSelect(c)}
                className={`flex flex-row items-center gap-0
                  text-[.8rem] py-[0px] px-0 border-b  uppercase border-[#232429]/30 last:border-b-0 font-semibold cursor-pointer transition
                  ${selected && c.id === selected.id ? "bg-[#949C7F] text-black rounded" : ""}
                `}
                style={{ fontFamily: 'Erbaum, sans-serif', minHeight: 32, lineHeight: 1.0 }}
              >
                {c.logo_url && (
                  <img
                    src={c.logo_url}
                    alt="logo"
                    className="w-8 h-8 object-contain mr-1"
                    style={{ minWidth: 40, minHeight: 26, maxHeight: 28, maxWidth: 30 }}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <span className="truncate" style={{ fontSize: '.7rem' }}>{c.name}</span>
              </li>
            ))}
          </ul>
          {/* Missile Header */}
          <div className="mt-3 mb-2">
            <div
              className="w-full text-center font-bold border-b-4 rounded-lg border bg-black text-[.93rem] text-[#949C7F] tracking-wide uppercase"
              style={{
                letterSpacing: '1.0em',
                fontFamily: 'Erbaum, sans-serif'
              }}
            >
              MISSILE
            </div>
          </div>
          <ul className="pl-0 overflow-y-auto">
            {missileCustomers.map((c) => (
              <li
                key={c.id}
                onClick={() => onSelect(c)}
                className={`flex flex-row items-center gap-0
                  text-[.7rem] py-[0px] px-0 border-b border-[#232429]/30 last:border-b-0 font-semibold cursor-pointer transition
                  ${selected && c.id === selected.id ? "bg-[#949C7F] text-black rounded" : ""}
                `}
                style={{ fontFamily: 'Erbaum, sans-serif', minHeight: 32, lineHeight: 1.0 }}
              >
                {c.logo_url && (
                  <img
                    src={c.logo_url}
                    alt="logo"
                    className="w-8 h-8 object-contain mr-1"
                    style={{ minWidth: 40, minHeight: 26, maxHeight: 28, maxWidth: 30 }}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <span className="truncate" style={{ fontSize: '.7rem' }}>{c.name}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
