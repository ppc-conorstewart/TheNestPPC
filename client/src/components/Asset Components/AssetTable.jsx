// =================== Imports and Assets ===================
import Lottie from "lottie-react";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
const palomaGreen = '#6a7257';
const zebraBg = '#161616';
const zebraAlt = '#0d0d0d';
const textMain = '#e6e8df';

// =================== Fixed Metrics ===================
const ROW_HEIGHT = 24;

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

// =================== Helpers: Status Formatting ===================
function formatStatusLabel(status) {
  if (!status || typeof status !== "string") return status;

  const missileMatch = status.match(/^MA-MI-(\d+)$/i);
  if (missileMatch) return `Master Assembly (Missile-${missileMatch[1]})`;

  const nonMissileMatch = status.match(/^MA\s*\(([A-Z]{2,3})-([A-Z0-9]+)\)$/i);
  if (nonMissileMatch) {
    const abbr = nonMissileMatch[1].toUpperCase();
    const num = nonMissileMatch[2];
    let fullName = abbr;
    if (abbr === "DB") fullName = "Dogbone";
    if (abbr === "ZIP") fullName = "Zipper";
    if (abbr === "FC") fullName = "Flowcross";
    return `Master Assembly (${fullName}-${num})`;
  }

  return status;
}
function routeForStatus(status) {
  if (!status || typeof status !== 'string') return null;

  const mi = status.match(/^MA-MI-(\d+)$/i);
  if (mi) {
    const child = `Missile-${mi[1]}`;
    const label = `Master Assembly (${child})`;
    return {
      to: `/fly-hq?tab=assemblies&assembly=${encodeURIComponent('Missiles')}&child=${encodeURIComponent(child)}`,
      label,
      title: `Click to navigate to ${label}`
    };
  }
  const m = status.match(/^MA\s*\(([A-Z]{2,3})-([A-Z0-9]+)\)$/i);
  if (!m) return null;

  const abbr = m[1].toUpperCase();
  const num = m[2];
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
    title: `Click to navigate to ${label}`
  };
}

// =================== Component: AssetTable ===================
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
  const [qrAsset, setQRAsset] = useState(null);
  const isCompact = useMediaQuery('(max-width: 1100px)');
  const [openMenuIdx, setOpenMenuIdx] = useState(null);

  useEffect(() => {
    if (!isCompact) setOpenMenuIdx(null);
  }, [isCompact]);

  const selectedSet = new Set(selectedIds);
  const allOnPageSelected = assets.length > 0 && assets.every((a) => selectedSet.has(a.id));

  const isMissileMA = (status) =>
    typeof status === 'string' && /^MA-MI-\d+$/i.test(status?.trim());
  const isNonMissileMA = (status) =>
    typeof status === 'string' && /^MA\s*\(([A-Z]{2,3})-[A-Z0-9]+\)$/i.test(status?.trim());

  const buttonHeight = 22;
  const iconButtonSize = 28;

  const [hoverEditIdx, setHoverEditIdx] = useState(null);
  const [hoverDeleteIdx, setHoverDeleteIdx] = useState(null);
  const [hoverQRIdx, setHoverQRIdx] = useState(null);
  const [hoverHistoryIdx, setHoverHistoryIdx] = useState(null);
  const lottieKey = (base, idx, hover) => `${base}-${idx}-${hover ? 'play' : 'pause'}`;

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
        height: '100%',
        minHeight: 0,
        overflowX: isCompact ? 'auto' : 'hidden',
        overflowY: 'hidden',
        WebkitOverflowScrolling: isCompact ? 'touch' : 'auto',
        display: 'block',
      }}
      className="w-full"
    >
      <table
        className="w-full text-center"
        style={{
          fontSize: '0.6rem',
          background: bgCard,
          color: textMain,
          borderCollapse: 'collapse',
          width: '100%',
          minWidth: isCompact ? 900 : 1100,
          tableLayout: 'fixed'
        }}
      >
        <colgroup>
          {Object.keys(colWidths).map((key) => (
            <col
              key={key}
              style={{
                width: colWidths[key],
                minWidth: colWidths[key],
                maxWidth: colWidths[key]
              }}
            />
          ))}
        </colgroup>
        <thead style={{ background: headerBg }}>
          <tr style={{ height: ROW_HEIGHT }}>
            <th style={{
              padding: 0,
              border: cardBorder,
              textAlign: 'center',
              color: palomaGreen,
              fontWeight: 700,
              textTransform: 'uppercase',
              background: headerBg,
              borderRight: cardBorder,
              height: ROW_HEIGHT
            }}>
              <input
                type="checkbox"
                onChange={onToggleAll}
                checked={allOnPageSelected}
                ref={el => {
                  if (el) el.indeterminate = !allOnPageSelected && assets.some(a => selectedSet.has(a.id));
                }}
              />
            </th>
            {Object.keys(headerLabels).map((key) => (
              <th
                key={key}
                style={{
                  padding: 0,
                  border: cardBorder,
                  cursor: 'pointer',
                  textAlign: 'center',
                  color: palomaGreen,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: headerBg,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  borderRight: cardBorder,
                  height: ROW_HEIGHT,
                  lineHeight: `${ROW_HEIGHT - 6}px`
                }}
                onClick={() => onSort(key)}
              >
                {headerLabels[key]}{' '}
                {sortConfig.key === key
                  ? sortConfig.direction === 'ascending'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            ))}
            <th style={{
              padding: 0,
              border: cardBorder,
              color: palomaGreen,
              fontWeight: 700,
              textTransform: 'uppercase',
              background: headerBg,
              borderRight: cardBorder,
              textAlign: 'center',
              height: ROW_HEIGHT,
              lineHeight: `${ROW_HEIGHT - 6}px`
            }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {assets.map((asset, idx) => {
            const rowBg = idx % 2 === 0 ? zebraBg : zebraAlt;

            let statusColor = asset.status_color || null;
            if (!statusColor) {
              if (isMissileMA(asset.status)) statusColor = missilePurple;
              else if (isNonMissileMA(asset.status)) statusColor = maYellow;
              else if (asset.status && asset.status.includes('In-Use')) statusColor = '#e51c1cd4';
              else if (asset.status === 'Available') statusColor = '#1fa02ac6';
            }

            const pretty = formatStatusLabel(asset.status);
            const route = routeForStatus(asset.status);

            return (
              <tr
                key={asset.id}
                style={{
                  background: rowBg,
                  transition: 'none',
                  height: ROW_HEIGHT
                }}
              >
                {[
                  <input type="checkbox" checked={!!selectedSet.has(asset.id)} onChange={() => onToggle(asset.id)} />,
                  asset.id,
                  asset.sn,
                  asset.name,
                  asset.category,
                  asset.location,
                  route ? (
                    <Link
                      to={route.to}
                      title={route.title}
                      style={{
                        color: statusColor || textMain,
                        fontWeight: 800,
                        textDecoration: 'none',
                        cursor: 'pointer',
                        display: 'inline-block'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      {pretty}
                    </Link>
                  ) : (
                    pretty
                  )
                ].map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    style={{
                      padding: '0 3px',
                      border: cardBorder,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      borderRight: cardBorder,
                      height: ROW_HEIGHT,
                      lineHeight: `${ROW_HEIGHT - 6}px`,
                      verticalAlign: 'middle',
                      ...(cellIdx === 6 && statusColor ? { color: statusColor, fontWeight: 800 } : {})
                    }}
                  >
                    {cell}
                  </td>
                ))}
                <td style={{
                  padding: '0 6px',
                  border: cardBorder,
                  background: 'transparent',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  borderRight: cardBorder,
                  height: ROW_HEIGHT,
                  verticalAlign: 'middle'
                }}>
                  {(() => {
                    const actions = [{
                      icon: EditIcon,
                      hoverIdx: hoverEditIdx,
                      setHover: setHoverEditIdx,
                      action: () => onEdit(asset),
                      title: 'Edit Asset',
                      label: 'Edit Asset'
                    }, {
                      icon: TrashIcon,
                      hoverIdx: hoverDeleteIdx,
                      setHover: setHoverDeleteIdx,
                      action: () => onDelete(asset),
                      title: 'Delete Asset',
                      label: 'Delete Asset'
                    }, {
                      icon: QRICon,
                      hoverIdx: hoverQRIdx,
                      setHover: setHoverQRIdx,
                      action: () => (onViewQR ? onViewQR(asset) : setQRAsset(asset)),
                      title: 'View QR',
                      label: 'View QR Code'
                    }, {
                      icon: HistoryIcon,
                      hoverIdx: hoverHistoryIdx,
                      setHover: setHoverHistoryIdx,
                      action: () => onViewHistory && onViewHistory(asset),
                      title: 'Asset History',
                      label: 'View History'
                    }];

                    if (isCompact) {
                      const menuOpen = openMenuIdx === idx;
                      return (
                        <div
                          style={{ position: 'relative', display: 'inline-flex' }}
                        >
                          <button
                            type='button'
                            onClick={() => setOpenMenuIdx(menuOpen ? null : idx)}
                            aria-haspopup='menu'
                            aria-expanded={menuOpen}
                            style={{
                              background: '#000',
                              border: `1.25px solid ${palomaGreen}`,
                              borderRadius: 6,
                              width: 32,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            <span style={{
                              display: 'inline-block',
                              width: 16,
                              height: 12,
                              position: 'relative'
                            }}>
                              {[0, 1, 2].map((bar) => (
                                <span
                                  key={bar}
                                  style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    height: 2,
                                    borderRadius: 999,
                                    background: palomaGreen,
                                    top: `${bar * 5}px`
                                  }}
                                />
                              ))}
                            </span>
                          </button>
                          {menuOpen && (
                            <div
                              role='menu'
                              style={{
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                right: 0,
                                background: '#0d0d0d',
                                border: `1px solid ${palomaGreen}`,
                                borderRadius: 8,
                                boxShadow: '0 12px 24px rgba(0,0,0,0.45)',
                                minWidth: 160,
                                zIndex: 10,
                                padding: 6
                              }}
                            >
                              {actions.map(({ label, action: run, title: menuTitle }, actionIdx) => (
                                <button
                                  key={menuTitle}
                                  type='button'
                                  onClick={() => {
                                    run();
                                    setOpenMenuIdx(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '6px 10px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: textMain,
                                    fontSize: '0.72rem',
                                    letterSpacing: '0.02em',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderRadius: 6
                                  }}
                                >
                                  <span>{label}</span>
                                  <span style={{ color: palomaGreen, fontSize: '0.65rem', letterSpacing: '0.05em' }}>{['EDIT','DEL','QR','HIST'][actionIdx]}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        {actions.map(({ icon, hoverIdx, setHover, action, title }, btnIdx) => (
                          <div
                            key={title}
                            style={{ position: 'relative', display: 'inline-block' }}
                            onMouseEnter={() => setHover(idx)}
                            onMouseLeave={() => setHover(null)}
                          >
                            <button
                              onClick={action}
                              title={title}
                              style={{
                                background: '#000',
                                border: `1.25px solid ${palomaGreen}`,
                                borderRadius: 6,
                                width: iconButtonSize,
                                height: buttonHeight,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Lottie key={lottieKey(title, idx, hoverIdx === idx)} animationData={icon} loop={false} autoplay={hoverIdx === idx} style={{ width: 16, height: 16 }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </td>
              </tr>
            );
          })}

          {assets.length === 0 && (
            <tr>
              <td colSpan={Object.keys(headerLabels).length + 2} style={{ textAlign: 'center', color: '#8b8d7a', padding: '14px 8px', border: cardBorder, background: bgCard }}>
                No assets found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!onViewQR && (
        <PalomaQRCodeModal asset={qrAsset} open={!!qrAsset} onClose={() => setQRAsset(null)} />
      )}
    </div>
  );
}
