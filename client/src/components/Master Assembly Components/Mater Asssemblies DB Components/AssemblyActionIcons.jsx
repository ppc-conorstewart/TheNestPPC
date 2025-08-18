// ==============================
// Mater Asssemblies DB Components/AssemblyActionIcons.jsx
// Small icon buttons (style matches page action buttons)
// ==============================

const textMain = '#e6e8df';

const btn = {
  border: '1px solid #2c2f27',
  background: '#0e100c',
  color: textMain,
  width: 24,
  height: 24,
  display: 'grid',
  placeItems: 'center',
  borderRadius: 6,
  cursor: 'pointer',
};

export function IconButton({ title, onClick, children }) {
  return <button title={title} onClick={onClick} style={btn}>{children}</button>;
}

export function WrenchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#e6e8df">
      <path d="M22.7 19.3l-7.9-7.9a6 6 0 1 0-2.8 2.8l7.9 7.9a2 2 0 1 0 2.8-2.8zM10 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
    </svg>
  );
}

export function PdfIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff5656">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
      <text x="8" y="17" fontSize="7" fill="#fff" fontFamily="monospace">PDF</text>
    </svg>
  );
}
