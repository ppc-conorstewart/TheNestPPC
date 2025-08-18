// =================== Imports and Assets ===================
import Lottie from "lottie-react";
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import EditIcon from '../../assets/Fly-HQ Icons/EditIcon.json';
import HistoryIcon from '../../assets/Fly-HQ Icons/HistoryIcon.json';
import QRICon from '../../assets/Fly-HQ Icons/QRICon.json';
import TrashIcon from '../../assets/Fly-HQ Icons/TrashIcon.json';
import PalomaQRCodeModal from './PalomaQRCodeModal';

// =================== Style Constants ===================
const cardBorder = '1px solid #6a7257';
const bgCard = '#000';
const headerBg = '#10110f';
const palomaGreen = '#6a7257';
const zebraBg = '#161616';
const zebraAlt = '#0d0d0d';
const textMain = '#e6e8df';

// ── Status Colors
const missilePurple = '#A64DFF';      // MA-MI-n
const maYellow = '#F5D742';           // MA (DB-x) / MA (ZIP-x) / MA (FC-x)

// =================== Column Widths ===================
const colWidths = {
  checkbox: 38,
  id: 92,
  sn: 94,
  name: 318,
  category: 92,
  location: 92,
  status: 108,
  actions: 98,
};

// =================== Helper: Format Status (pretty label) ===================
function formatStatusLabel(status) {
  if (!status || typeof status !== "string") return status;

  // Missile
  const missileMatch = status.match(/^MA-MI-(\d+)$/i);
  if (missileMatch) {
    return `Master Assembly (Missile-${missileMatch[1]})`;
  }

  // Dogbones, Zippers, Flowcrosses like: MA (DB-1), MA (ZIP-2), MA (FC-3)
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

// =================== Helper: Build route target from status ===================
function routeForStatus(status) {
  if (!status || typeof status !== 'string') return null;

  // Missiles: MA-MI-1 -> Assemblies tab, assembly=Missiles, child=Missile-1
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

  // MA (DB-1) / MA (ZIP-2) / MA (FC-3)
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

// =================== Asset Table Component ===================
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
  const tableContainerRef = useRef(null);
  const rowRef = useRef(null);
  const [visibleRowCount, setVisibleRowCount] = useState(16);

  const buttonHeight = 28;
  const iconButtonSize = 34;

  useEffect(() => {
    function handleResize() {
      if (tableContainerRef.current && rowRef.current) {
        const tableHeight = tableContainerRef.current.offsetHeight;
        const headerHeight = tableContainerRef.current.querySelector('thead')?.offsetHeight || 30;
        const rowHeight = rowRef.current.offsetHeight || 30;
        const availableRows = Math.floor((tableHeight - headerHeight) / rowHeight);
        setVisibleRowCount(Math.max(availableRows, 1));
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [assets.length]);

  const selectedSet = new Set(selectedIds);
  const allOnPageSelected = assets.length > 0 && assets.every((a) => selectedSet.has(a.id));

  const isMissileMA = (status) =>
    typeof status === 'string' && /^MA-MI-\d+$/i.test(status?.trim());

  // Allow 2 or 3-letter assembly codes: DB, FC, ZIP
  const isNonMissileMA = (status) =>
    typeof status === 'string' && /^MA\s*\(([A-Z]{2,3})-[A-Z0-9]+\)$/i.test(status?.trim());

  const shownAssets = assets.slice(0, visibleRowCount);

  const [hoverEditIdx, setHoverEditIdx] = useState(null);
  const [hoverDeleteIdx, setHoverDeleteIdx] = useState(null);
  const [hoverQRIdx, setHoverQRIdx] = useState(null);
  const [hoverHistoryIdx, setHoverHistoryIdx] = useState(null);

  const lottieKey = (base, idx, hover) => `${base}-${idx}-${hover ? 'play' : 'pause'}`;

  return (
    <div
      ref={tableContainerRef}
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
        overflow: 'hidden',
        display: 'block',
      }}
      className="w-full"
    >
      <table
        className="w-full h-full text-center"
        style={{
          fontSize: '0.65rem',
          background: bgCard,
          color: textMain,
          borderCollapse: 'collapse',
          width: '100%',
          minWidth: 1100,
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
          <tr>
            <th style={{
              padding: '0px 0px',
              border: cardBorder,
              textAlign: 'center',
              color: palomaGreen,
              fontWeight: 700,
              textTransform: 'uppercase',
              background: headerBg,
              borderRight: cardBorder,
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
                  padding: '0px 0px',
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
              padding: '3px 3px',
              border: cardBorder,
              color: palomaGreen,
              fontWeight: 700,
              textTransform: 'uppercase',
              background: headerBg,
              borderRight: cardBorder,
              textAlign: 'center'
            }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shownAssets.map((asset, idx) => {
            const rowBg = idx % 2 === 0 ? zebraBg : zebraAlt;

            // Prefer server-provided status_color when present
            let statusColor = asset.status_color || null;

            if (!statusColor) {
              if (isMissileMA(asset.status)) {
                statusColor = missilePurple;
              } else if (isNonMissileMA(asset.status)) {
                statusColor = maYellow;
              } else if (asset.status && asset.status.includes("In-Use")) {
                statusColor = "#e51c1cd4";
              } else if (asset.status === "Available") {
                statusColor = "#1fa02ac6";
              }
            }

            // Build display and route for the status cell
            const pretty = formatStatusLabel(asset.status);
            const route = routeForStatus(asset.status);

            return (
              <tr
                key={asset.id}
                ref={idx === 0 ? rowRef : null}
                style={{ background: rowBg, transition: 'none' }}
              >
                {[
                  <input type="checkbox" checked={selectedSet.has(asset.id)} onChange={() => onToggle(asset.id)} />,
                  asset.id,
                  asset.sn,
                  asset.name,
                  asset.category,
                  asset.location,
                  // Status cell becomes a routed link (when routeable)
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
                      padding: '1px 3px',
                      border: cardBorder,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      borderRight: cardBorder,
                      ...(cellIdx === 6 && statusColor ? { color: statusColor, fontWeight: 800 } : {})
                    }}
                  >
                    {cell}
                  </td>
                ))}
                <td style={{
                  padding: '1px 7px',
                  border: cardBorder,
                  background: 'transparent',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  borderRight: cardBorder
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                    {[{
                      icon: EditIcon, hoverIdx: hoverEditIdx, setHover: setHoverEditIdx, action: () => onEdit(asset), title: "Edit Asset"
                    }, {
                      icon: TrashIcon, hoverIdx: hoverDeleteIdx, setHover: setHoverDeleteIdx, action: () => onDelete(asset), title: "Delete Asset"
                    }, {
                      icon: QRICon, hoverIdx: hoverQRIdx, setHover: setHoverQRIdx, action: () => onViewQR ? onViewQR(asset) : setQRAsset(asset), title: "View QR"
                    }, {
                      icon: HistoryIcon, hoverIdx: hoverHistoryIdx, setHover: setHoverHistoryIdx, action: () => onViewHistory && onViewHistory(asset), title: "Asset History"
                    }].map(({ icon, hoverIdx, setHover, action, title }, btnIdx) => (
                      <div
                        key={btnIdx}
                        style={{ position: 'relative', display: 'inline-block' }}
                        onMouseEnter={() => setHover(idx)}
                        onMouseLeave={() => setHover(null)}
                      >
                        <button
                          onClick={action}
                          title={title}
                          style={{
                            background: '#000',
                            border: `1.5px solid ${palomaGreen}`,
                            borderRadius: 6,
                            width: iconButtonSize,
                            height: buttonHeight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Lottie key={lottieKey(title, idx, hoverIdx === idx)} animationData={icon} loop={false} autoplay={hoverIdx === idx} style={{ width: 20, height: 20 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}

          {shownAssets.length === 0 && (
            <tr>
              <td colSpan={Object.keys(headerLabels).length + 2} style={{ textAlign: 'center', color: '#8b8d7a', padding: '18px 8px', border: cardBorder, background: bgCard }}>
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
