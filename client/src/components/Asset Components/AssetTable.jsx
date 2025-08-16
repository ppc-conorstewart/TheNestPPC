// =================== Imports and Assets ===================
import Lottie from "lottie-react";
import { useEffect, useRef, useState } from 'react';
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
                  asset.status
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
