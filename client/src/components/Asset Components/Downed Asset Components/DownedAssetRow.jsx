// ==============================
// DOWNED ASSET ROW — IMPORTS
// ==============================

// ==============================
// DOWNED ASSET ROW — CONSTANTS
// ==============================
const cardBorder = '1px solid #6a7257';

// ==============================
// DOWNED ASSET ROW — COMPONENT
// ==============================
export default function DownedAssetRow({ asset, rowIndex = 0, onEdit = () => {} }) {
  const zebraBg = rowIndex % 2 === 0 ? '#161616' : '#0d0d0d';
  const vendor = asset?.machining_vendor || asset?.machiningVendor || asset?.location || '—';
  const expected = asset?.expected_return || asset?.expectedReturn || asset?.refurb_date || null;
  const expectedStr = expected ? new Date(expected).toISOString().slice(0, 10) : '—';

  return (
    <tr style={{ background: zebraBg }}>
      <td style={{ border: cardBorder }} className='px-2 py-1'>{asset?.id}</td>
      <td style={{ border: cardBorder }} className='px-2 py-1'>{asset?.sn || '—'}</td>
      <td style={{ border: cardBorder }} className='px-2 py-1 text-left'>{asset?.name}</td>
      <td style={{ border: cardBorder }} className='px-2 py-1'>{asset?.category}</td>
      <td style={{ border: cardBorder }} className='px-2 py-1'>{vendor}</td>
      <td style={{ border: cardBorder }} className='px-2 py-1'>{asset?.status}</td>
      <td style={{ border: cardBorder }} className='px-2 py-1'>{expectedStr}</td>
      <td style={{ border: cardBorder }} className='px-2 py-1'>
        <button
          onClick={() => onEdit(asset)}
          title='Edit'
          className='uppercase font-bold'
          style={{ padding: '4px 8px', border: '1px solid #6a7257', background: '#0c0d0b', color: '#e6e8df', letterSpacing: '.08em' }}
        >
          Edit
        </button>
      </td>
    </tr>
  );
}
