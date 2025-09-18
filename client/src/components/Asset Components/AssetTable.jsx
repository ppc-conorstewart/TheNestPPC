// =================== Imports and Assets ===================
import Lottie from 'lottie-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import EditIcon from '../../assets/Fly-HQ Icons/EditIcon.json';
import HistoryIcon from '../../assets/Fly-HQ Icons/HistoryIcon.json';
import QRICon from '../../assets/Fly-HQ Icons/QRICon.json';
import TrashIcon from '../../assets/Fly-HQ Icons/TrashIcon.json';
import PalomaQRCodeModal from './PalomaQRCodeModal';
import useMediaQuery from '../../hooks/useMediaQuery';

// =================== Style Constants ===================
const cardBorder = '1px solid #6a7257';
const bgCard = '#000';
const headerBg = '#10110f';
const zebraBg = '#161616';
const zebraAlt = '#0d0d0d';
const textMain = '#e6e8df';
const palomaGreen = '#6a7257';

// =================== Fixed Metrics ===================
const ROW_HEIGHT = 24;
const VIRTUAL_ROW_HEIGHT = ROW_HEIGHT + 18;

// =================== Column Widths ===================
const colWidths = {
  checkbox: 36,
  id: 92,
  sn: 94,
  name: 318,
  category: 92,
  location: 92,
  status: 108,
  actions: 96,
};

// =================== Status Colors ===================
const missilePurple = '#A64DFF';
const maYellow = '#F5D742';

const DATA_COLUMNS = ['id', 'sn', 'name', 'category', 'location', 'status'];

const defaultHeaderLabel = key => key.toUpperCase();

function formatStatusLabel(status) {
  if (!status || typeof status !== 'string') return status;

  const missileMatch = status.match(/^MA-MI-(\d+)$/i);
  if (missileMatch) return `Master Assembly (Missile-${missileMatch[1]})`;

  const nonMissileMatch = status.match(/^MA\s*\(([A-Z]{2,3})-([A-Z0-9]+)\)$/i);
  if (nonMissileMatch) {
    const abbr = nonMissileMatch[1].toUpperCase();
    const num = nonMissileMatch[2];
    let fullName = abbr;
    if (abbr === 'DB') fullName = 'Dogbone';
    if (abbr === 'ZIP') fullName = 'Zipper';
    if (abbr === 'FC') fullName = 'Flowcross';
    return `Master Assembly (${fullName}-${num})`;
  }

  return status;
}

function routeForStatus(status) {
  if (!status || typeof status !== 'string') return null;

  const missile = status.match(/^MA-MI-(\d+)$/i);
  if (missile) {
    const child = `Missile-${missile[1]}`;
    const label = `Master Assembly (${child})`;
    return {
      to: `/fly-hq?tab=assemblies&assembly=${encodeURIComponent('Missiles')}&child=${encodeURIComponent(child)}`,
      label,
      title: `Click to navigate to ${label}`,
    };
  }

  const ma = status.match(/^MA\s*\(([A-Z]{2,3})-([A-Z0-9]+)\)$/i);
  if (!ma) return null;

  const abbr = ma[1].toUpperCase();
  const num = ma[2];
  let assemblyTitle = '';
  let child = '';

  if (abbr === 'DB') { assemblyTitle = 'Dog Bones'; child = `Dogbone-${num}`; }
  else if (abbr === 'ZIP') { assemblyTitle = 'Zippers'; child = `Zipper-${num}`; }
  else if (abbr === 'FC') { assemblyTitle = 'Flowcrosses'; child = `Flowcross-${num}`; }
  else return null;

  const label = `Master Assembly (${child})`;
  return {
    to: `/fly-hq?tab=assemblies&assembly=${encodeURIComponent(assemblyTitle)}&child=${encodeURIComponent(child)}`,
    label,
    title: `Click to navigate to ${label}`,
  };
}

function buildGridTemplate() {
  return [
    colWidths.checkbox,
    colWidths.id,
    colWidths.sn,
    colWidths.name,
    colWidths.category,
    colWidths.location,
    colWidths.status,
    colWidths.actions,
  ].map(w => `${w}px`).join(' ');
}

export default function AssetTable({
  assets,
  selectedIds,
  onToggle,
  onToggleAll,
  onSort,
  sortConfig,
  headerLabels,
  onEdit,
  onDelete,
  deleteButtonStyle,
  onViewQR,
  onViewHistory,
}) {
  const isCompact = useMediaQuery('(max-width: 1100px)');
  const [qrAsset, setQRAsset] = useState(null);
  const [hoveredActionId, setHoveredActionId] = useState(null);
  const [hoveredActionType, setHoveredActionType] = useState(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allOnPageSelected = assets.length > 0 && assets.every(a => selectedSet.has(a.id));
  const gridTemplate = useMemo(buildGridTemplate, []);
  const useVirtualized = !isCompact && assets.length > 120;

  const renderStatus = (asset) => {
    const statusRoute = routeForStatus(asset.status);
    const isMissile = /^MA-MI-\d+$/i.test(asset.status || '');
    const isNonMissile = /^MA\s*\(([A-Z]{2,3})-[A-Z0-9]+\)$/i.test(asset.status || '');

    if (statusRoute) {
      return (
        <Link to={statusRoute.to} title={statusRoute.title} className='underline text-[#8CF94A]'>
          {statusRoute.label}
        </Link>
      );
    }

    if (isMissile || isNonMissile) {
      const color = isMissile ? missilePurple : maYellow;
      return <span style={{ color }}>{formatStatusLabel(asset.status)}</span>;
    }

    return formatStatusLabel(asset.status);
  };

  const RowActions = ({ asset }) => {
    const play = type => hoveredActionId === asset.id && hoveredActionType === type;

    const makeButton = (type, icon, handler, title) => (
      <button
        key={type}
        onClick={handler}
        title={title}
        onMouseEnter={() => { setHoveredActionId(asset.id); setHoveredActionType(type); }}
        onMouseLeave={() => setHoveredActionId(null)}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(0,0,0,0.35)',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          ...(type === 'delete' ? deleteButtonStyle : {}),
        }}
      >
        <Lottie
          animationData={icon}
          loop={false}
          autoplay={false}
          style={{ width: 22, height: 22 }}
          play={play(type)}
        />
      </button>
    );

    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center', height: 22 }}>
        {makeButton('edit', EditIcon, () => onEdit(asset), 'Edit Asset')}
        {makeButton('history', HistoryIcon, () => onViewHistory(asset), 'Asset History')}
        {makeButton('qr', QRICon, () => { setQRAsset(asset); onViewQR && onViewQR(asset); }, 'View QR')}
        {makeButton('delete', TrashIcon, () => onDelete(asset), 'Delete Asset')}
      </div>
    );
  };

  const TableRow = ({ asset, index }) => {
    const zebra = index % 2 === 0 ? zebraBg : zebraAlt;
    return (
      <tr
        key={asset.id}
        style={{ background: zebra, height: ROW_HEIGHT }}
        className='border-b border-[#1e1e1e] text-xs tracking-wide'
      >
        <td>
          <input type='checkbox' checked={selectedSet.has(asset.id)} onChange={() => onToggle(asset.id)} />
        </td>
        <td>{asset.id}</td>
        <td>{asset.sn}</td>
        <td className='text-left font-semibold'>{asset.name}</td>
        <td>{asset.category}</td>
        <td>{asset.location}</td>
        <td>{renderStatus(asset)}</td>
        <td><RowActions asset={asset} /></td>
      </tr>
    );
  };

  const renderTable = () => (
    <div
      style={{
        border: cardBorder,
        borderRadius: 0,
        background: bgCard,
        marginBottom: 0,
        padding: 0,
        boxShadow: '0 2px 12px #111a 0.15',
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflowX: isCompact ? 'auto' : 'hidden',
        overflowY: 'hidden',
        WebkitOverflowScrolling: isCompact ? 'touch' : 'auto',
        display: 'block',
      }}
      className='w-full'
    >
      <table
        className='w-full text-center'
        style={{
          fontSize: '0.6rem',
          background: bgCard,
          color: textMain,
          borderCollapse: 'collapse',
          width: '100%',
          minWidth: isCompact ? 900 : 1100,
          tableLayout: 'fixed',
        }}
      >
        <colgroup>
          {Object.keys(colWidths).map(key => (
            <col key={key} style={{ width: colWidths[key], minWidth: colWidths[key], maxWidth: colWidths[key] }} />
          ))}
        </colgroup>
        <thead style={{ background: headerBg }}>
          <tr style={{ height: ROW_HEIGHT }}>
            <th style={{ border: cardBorder }}>
              <input
                type='checkbox'
                onChange={onToggleAll}
                checked={allOnPageSelected}
                ref={el => {
                  if (el) el.indeterminate = !allOnPageSelected && assets.some(a => selectedSet.has(a.id));
                }}
              />
            </th>
            {DATA_COLUMNS.map(col => (
              <th
                key={col}
                onClick={() => onSort(col)}
                style={{
                  border: cardBorder,
                  cursor: 'pointer',
                  color: palomaGreen,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: headerBg,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {headerLabels[col] || defaultHeaderLabel(col)}
                {sortConfig.key === col ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
            <th style={{ border: cardBorder, color: palomaGreen, fontWeight: 700, textTransform: 'uppercase' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, index) => (
            <TableRow key={asset.id} asset={asset} index={index} />
          ))}
        </tbody>
      </table>

      {qrAsset && (
        <PalomaQRCodeModal asset={qrAsset} onClose={() => setQRAsset(null)} />
      )}
    </div>
  );

  if (!useVirtualized) {
    return renderTable();
  }

  const listHeight = Math.min(assets.length, 18) * VIRTUAL_ROW_HEIGHT || VIRTUAL_ROW_HEIGHT;

  const headerRow = (
    <div
      className='uppercase tracking-widest text-[0.6rem] text-[#a8b58f]'
      style={{
        display: 'grid',
        gridTemplateColumns: gridTemplate,
        background: headerBg,
        padding: '6px 10px',
        alignItems: 'center',
      }}
    >
      <div>
        <input type='checkbox' checked={allOnPageSelected} onChange={onToggleAll} />
      </div>
      {DATA_COLUMNS.map(col => (
        <div
          key={col}
          role='button'
          onClick={() => onSort(col)}
          className='cursor-pointer'
          style={{ textAlign: col === 'name' ? 'left' : 'center' }}
        >
          {headerLabels[col] || defaultHeaderLabel(col)}
          {sortConfig.key === col ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ''}
        </div>
      ))}
      <div>Actions</div>
    </div>
  );

  const VirtualRow = ({ index, style }) => {
    const asset = assets[index];
    if (!asset) return null;
    const zebra = index % 2 === 0 ? zebraBg : zebraAlt;

    return (
      <div
        style={{
          ...style,
          display: 'grid',
          gridTemplateColumns: gridTemplate,
          alignItems: 'center',
          padding: '6px 10px',
          background: zebra,
          borderBottom: '1px solid #1e1e1e',
          fontSize: '0.72rem',
        }}
        key={asset.id}
      >
        <div>
          <input type='checkbox' checked={selectedSet.has(asset.id)} onChange={() => onToggle(asset.id)} />
        </div>
        <div>{asset.id}</div>
        <div>{asset.sn}</div>
        <div className='text-left font-semibold truncate'>{asset.name}</div>
        <div>{asset.category}</div>
        <div>{asset.location}</div>
        <div>{renderStatus(asset)}</div>
        <RowActions asset={asset} />
      </div>
    );
  };

  return (
    <div
      style={{
        border: cardBorder,
        borderRadius: 0,
        background: bgCard,
        marginBottom: 0,
        padding: 0,
        boxShadow: '0 2px 12px #111a 0.15',
        width: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {headerRow}
      <div style={{ flex: 1, minHeight: listHeight }}>
        <List height={listHeight} itemCount={assets.length} itemSize={VIRTUAL_ROW_HEIGHT} width='100%'>
          {VirtualRow}
        </List>
      </div>

      {qrAsset && (
        <PalomaQRCodeModal asset={qrAsset} onClose={() => setQRAsset(null)} />
      )}
    </div>
  );
}
