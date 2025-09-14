// ==============================
// VENDOR PILL — IMPORTS
// ==============================

// ==============================
// VENDOR PILL — COMPONENT
// ==============================
export default function VendorPill({ name = '—', location = '' }) {
  const label = location ? name + ' • ' + location : name;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 6px',
        border: '1px solid #2d332a',
        borderRadius: 4,
        background: '#1b221b',
        color: '#6a7257',
        fontSize: 11,
        whiteSpace: 'nowrap'
      }}
      title={label}
    >
      {label}
    </span>
  );
}
