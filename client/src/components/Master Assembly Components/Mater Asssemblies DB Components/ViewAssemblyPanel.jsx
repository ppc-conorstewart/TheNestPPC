// ==============================
// Mater Asssemblies DB Components/ViewAssemblyPanel.jsx
// Detail panel (matches styling from MasterAssembliesDBTable.jsx)
// ==============================
import masterDogboneImg from '../../assets/Master Assemblies/MasterDogbone.png';
import masterZipperImg from '../../assets/Master Assemblies/MasterZipper.png';

const palomaGreen = '#6a7257';
const cardBorder  = '1px solid #6a7257';
const headerBg    = '#10110f';

export default function ViewAssemblyPanel({ assembly = null }) {
  if (!assembly) {
    return (
      <div style={{ height:'100%', background:'#000', border:cardBorder, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#8b8d7a', fontSize:'0.8rem', fontFamily:'Font-erbaum, Erbaum, sans-serif' }}>
        Select an assembly to view details.
      </div>
    );
  }
  return (
    <div style={{ background:'#000', border:cardBorder, borderRadius:10, overflow:'hidden' }}>
      <div style={{ background: headerBg, padding:'8px 10px', borderBottom: cardBorder, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ color: palomaGreen, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Font-cornero, sans-serif' }}>
          {assembly.type} — {assembly.name}
        </div>
      </div>

      <div style={{ display:'block', padding:12 }}>
        <div style={{ marginBottom:12 }}>
          <AssemblyImage type={assembly.type} />
        </div>

        <div style={{ marginBottom:6, fontFamily:'Font-erbaum, Erbaum, sans-serif', fontSize:'0.82rem' }}>
          <InfoRowFull label="Name" value={assembly.name} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, fontFamily:'Font-erbaum, Erbaum, sans-serif', fontSize:'0.78rem' }}>
          <InfoField label="Status" value={assembly.status || '—'} />
          <InfoField label="Location" value={assembly.location || '—'} />
          <InfoField label="Creation Date" value={fmt(assembly.creation_date)} />
          <InfoField label="Re-Cert Date" value={fmt(assembly.recert_date)} />
        </div>

        {/* Assets */}
        <div style={{ borderTop:'1px solid #222', marginTop:12, paddingTop:10 }}>
          <SectionTitle>Assets Used</SectionTitle>
          {(!assembly.assets || assembly.assets.length === 0) ? (
            <div style={{ color:'#8b8d7a', fontFamily:'Font-erbaum, Erbaum, sans-serif', fontSize:'0.78rem' }}>No assets currently assigned.</div>
          ) : (
            <MiniTable
              cols={['Slot','PPC #','Name','Status']}
              rows={assembly.assets.map(a => [a.meta || '—', a.id || '—', a.name || '—', a.status || '—'])}
            />
          )}
        </div>

        {/* Gaskets */}
        <div style={{ borderTop:'1px solid #222', marginTop:12, paddingTop:10 }}>
          <SectionTitle>Gaskets Used</SectionTitle>
          {(!assembly.gaskets || assembly.gaskets.length === 0) ? (
            <div style={{ color:'#8b8d7a', fontFamily:'Font-erbaum, Erbaum, sans-serif', fontSize:'0.78rem' }}>No gaskets set.</div>
          ) : (
            <MiniTable
              cols={['Slot','Gasket ID','Date']}
              rows={assembly.gaskets.map(g => [g.name || '—', g.id || '—', fmt(g.meta)])}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AssemblyImage({ type }) {
  const t = (type || '').toLowerCase();
  const src = t === 'dogbones' ? masterDogboneImg : t === 'zippers' ? masterZipperImg : null;
  if (!src) {
    return (
      <div style={{ background:'#0d0d0d', border:'1px solid #222', height:140, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#888', fontFamily:'Font-erbaum, Erbaum, sans-serif' }}>
        Assembly Image
      </div>
    );
  }
  return (
    <div style={{ background:'#0d0d0d', border:'1px solid #222', height:140, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <img src={src} alt={`${type} image`} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', display:'block' }} />
    </div>
  );
}

function InfoRowFull({ label, value }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'110px 1fr', columnGap:8, alignItems:'center' }}>
      <div style={{ fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color: palomaGreen, fontFamily:'Font-cornero, sans-serif', fontSize:'0.78rem' }}>{label}:</div>
      <div style={{ fontFamily:'Font-erbaum, Erbaum, sans-serif', fontSize:'0.82rem' }}>{value}</div>
    </div>
  );
}
function InfoField({ label, value }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'110px 1fr', columnGap:8, alignItems:'center' }}>
      <div style={{ fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color: palomaGreen, fontFamily:'Font-cornero, sans-serif', fontSize:'0.76rem' }}>{label}:</div>
      <div style={{ fontFamily:'Font-erbaum, Erbaum, sans-serif', fontSize:'0.78rem' }}>{value}</div>
    </div>
  );
}

function SectionTitle({ children }){
  return (
    <div style={{ fontWeight:800, color: palomaGreen, marginBottom:8, letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:'Font-cornero, sans-serif', fontSize:'0.86rem' }}>
      {children}
    </div>
  );
}

function MiniTable({ cols=[], rows=[] }){
  return (
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.72rem', fontFamily:'Font-erbaum, Erbaum, sans-serif' }}>
      <thead>
        <tr>{cols.map((c,i)=><th key={i} style={miniTh}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r,i)=>(
          <tr key={i} style={{ background: i%2===0 ? '#0e0e0e' : '#0a0a0a' }}>
            {r.map((cell,j)=><td key={j} style={miniTd}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const miniTh = {
  padding:'4px 6px',
  lineHeight:'1rem',
  border: cardBorder,
  textAlign:'left',
  color: palomaGreen,
  fontWeight:800,
  letterSpacing:'0.05em',
  background: headerBg,
  whiteSpace:'nowrap',
  position:'sticky',
  top:0,
  zIndex:2,
  boxShadow:'0 2px 0 rgba(0,0,0,0.6)',
  fontFamily:'Font-cornero, sans-serif',
};
const miniTd = {
  padding:'4px 6px',
  border: cardBorder,
  textAlign:'left',
  verticalAlign:'middle',
  height:20,
  whiteSpace:'nowrap',
  overflow:'hidden',
  textOverflow:'ellipsis',
  fontFamily:'Font-erbaum, Erbaum, sans-serif',
};
function fmt(s){ return s ? String(s).slice(0,10) : '—'; }
