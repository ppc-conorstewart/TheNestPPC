// =================== Imports and Dependencies ===================
import { useEffect, useState } from 'react';
import PalomaIcon from '../../assets/Paloma_Icon_Black_large.png';

// =================== Constants and Utility Functions ===================
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

function padTicketNumber(id, length = 4) {
  return String(id).padStart(length, '0');
}

function groupAssets(assets) {
  const grouped = {};
  assets.forEach(asset => {
    const key = asset.name || asset.asset_name || asset.id || 'unknown';
    if (!grouped[key]) {
      grouped[key] = {
        qty: 0,
        name: asset.name || asset.asset_name || '-',
        ppcs: [],
        weight: asset.weight || '-',
      };
    }
    grouped[key].qty += 1;
    const ppcId = asset.id || asset.serial || '-';
    grouped[key].ppcs.push(ppcId);
  });
  return Object.values(grouped);
}

// =================== View BOL Modal Component ===================
export default function ViewBOLModal({ bolId, isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --------- Fetch BOL Data Effect ---------
  useEffect(() => {
    if (isOpen && bolId) {
      setError(null);
      setLoading(true);
      fetch(`${API_BASE_URL}/api/transfers/${bolId}`)
        .then(res => {
          if (!res.ok) throw new Error(`Transfer not found (status ${res.status})`);
          return res.json();
        })
        .then(row => {
          setData(row);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isOpen, bolId]);

  // --------- Modal State and Data Handling ---------
  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center overflow-y-auto">
        <div className="rounded-xl shadow-2xl w-full max-w-3xl relative p-8 bg-white text-black text-center">
          <span>Loading BOL...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center overflow-y-auto">
        <div className="rounded-xl shadow-2xl w-full max-w-3xl relative p-8 bg-white text-black text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-600 font-bold"
            type="button"
          >
            ×
          </button>
          <span style={{ color: "#c70000" }}>Could not load Bill of Lading: {error || "No data"}</span>
        </div>
      </div>
    );
  }

  // --------- Defensive Data Parsing ---------
  let assetRows = [];
  try {
    if (data.assets && Array.isArray(data.assets)) assetRows = data.assets;
    else if (typeof data.assets === "string" && data.assets) assetRows = JSON.parse(data.assets);
  } catch (e) {
    assetRows = [];
  }

  let nonSerRows = [];
  try {
    if (data.non_serialized_items && Array.isArray(data.non_serialized_items)) nonSerRows = data.non_serialized_items;
    else if (typeof data.non_serialized_items === "string" && data.non_serialized_items) nonSerRows = JSON.parse(data.non_serialized_items);
  } catch (e) {
    nonSerRows = [];
  }

  const groupedAssets = groupAssets(assetRows);

  // --------- Export PDF Handler ---------
  async function exportToPDF() {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    const imgWidth = 56;
    const imgY = 48;
    const centerX = doc.internal.pageSize.getWidth() / 2;
    const logoImg = PalomaIcon;
    try {
      let imgData = logoImg;
      if (!logoImg.startsWith('data:image')) {
        const toDataUrl = url => fetch(url)
          .then(r => r.blob())
          .then(blob => new Promise(res => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result);
            reader.readAsDataURL(blob);
          }));
        imgData = await toDataUrl(logoImg);
      }
      doc.addImage(imgData, 'PNG', 48, imgY, imgWidth, imgWidth);
      doc.addImage(imgData, 'PNG', doc.internal.pageSize.getWidth() - imgWidth - 48, imgY, imgWidth, imgWidth);
    } catch {}

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("PALOMA PRESSURE CONTROL", centerX, 70, { align: "center" });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("#210-129 Queens Drive, Red Deer, AB T4P 0R8", centerX, 88, { align: "center" });
    doc.text("403-598-7342", centerX, 102, { align: "center" });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    const col1 = 48, col2 = centerX, col3 = doc.internal.pageSize.getWidth() - 48;
    doc.text("BILL OF LADING", col1, 128, { align: "left" });
    doc.text("PROOF OF DELIVERY", col2, 128, { align: "center" });
    doc.setTextColor(200,0,0);
    doc.text(`NO. ${padTicketNumber(data.id)}`, col3, 128, { align: "right" });
    doc.setTextColor(0,0,0);

    let y = 148;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("SHIPPER:", col1, y);
    doc.text("ADDRESS:", col2, y, { align: "center" });
    doc.setFont('helvetica', 'normal');
    doc.text(data.shipper || '-', col1 + 66, y);
    doc.text(data.address || '-', col2 + 40, y, { align: "left" });

    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.text("DELIVER TO (LSD):", col1, y);
    doc.text("DATE:", col2, y, { align: "center" });
    doc.setFont('helvetica', 'normal');
    doc.text(data.delivery_address || '-', col1 + 104, y);
    doc.text(data.date || '-', col2 + 22, y, { align: "left" });

    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.text("PO #:", col1, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.po_number || '-', col1 + 40, y);

    y += 20;
    const tableColumn = [
      { header: "QTY", dataKey: "qty" },
      { header: "ASSET NAME", dataKey: "name" },
      { header: "PPC#", dataKey: "ppcs" },
      { header: "WEIGHT (LBS)", dataKey: "weight" }
    ];
    const tableRows = [];
    if (groupedAssets && groupedAssets.length > 0) {
      groupedAssets.forEach(asset => {
        tableRows.push({
          qty: asset.qty.toString(),
          name: asset.name,
          ppcs: asset.ppcs.join(", "),
          weight: asset.weight.toString()
        });
      });
    }
    if (nonSerRows && nonSerRows.length > 0) {
      nonSerRows.forEach(item => {
        tableRows.push({
          qty: item.qty ? item.qty.toString() : "-",
          name: item.name,
          ppcs: "-",
          weight: item.weight ? item.weight.toString() : "-"
        });
      });
    }
    doc.autoTable({
      columns: tableColumn,
      body: tableRows,
      startY: y + 10,
      margin: { left: 48, right: 48 },
      styles: { fontSize: 9, fontStyle: 'bold', textColor: [0,0,0], halign: 'center' },
      headStyles: {
        fillColor: [230, 232, 223],
        textColor: [0,0,0],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.4,
        lineColor: [0,0,0]
      },
      bodyStyles: {
        fillColor: [255,255,255],
        textColor: [0,0,0],
        fontSize: 10,
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.4,
        lineColor: [0,0,0]
      },
      alternateRowStyles: { fillColor: [245,245,245] },
      theme: 'grid'
    });
    let finalY = doc.lastAutoTable.finalY + 10;

    doc.setFont('helvetica', 'bold');
    doc.text("ROAD, WEATHER, OTHER COMMENTS:", col1, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.comments || '-', col1 + 208, finalY);

    finalY += 22;
    const infoRows = [
      [
        { label: "RECEIVER NAME:", value: data.receiver_name || '-' },
        { label: "PHONE:", value: data.receiver_phone || '-' },
        { label: "EMAIL:", value: data.receiver_email || '-' }
      ],
      [
        { label: "DRIVER NAME:", value: data.driver_name || '-' },
        { label: "TIME:", value: data.driver_time || '-' },
        { label: "TRUCKING PROVIDER:", value: data.trucking_provider || '-' }
      ],
      [
        { label: "BOL TOTAL:", value: data.bol_total || '-' },
        { label: "", value: "" },
        { label: "", value: "" }
      ]
    ];
    doc.setFont('helvetica', 'bold');
    infoRows.forEach(row => {
      let curX = col1;
      row.forEach(cell => {
        if (cell.label) {
          doc.text(cell.label, curX, finalY);
          doc.setFont('helvetica', 'normal');
          doc.text(cell.value, curX + 80, finalY);
          doc.setFont('helvetica', 'bold');
        }
        curX += 168;
      });
      finalY += 16;
    });

    if (data.signature) {
      try {
        let imgData = data.signature;
        if (!imgData.startsWith('data:image')) {
          const toDataUrl = url => fetch(url)
            .then(r => r.blob())
            .then(blob => new Promise(res => {
              const reader = new FileReader();
              reader.onloadend = () => res(reader.result);
              reader.readAsDataURL(blob);
            }));
          imgData = await toDataUrl(data.signature);
        }
        doc.setFont('helvetica', 'bold');
        doc.text("SIGNATURE:", col1, finalY + 8);
        doc.addImage(imgData, 'PNG', col1 + 80, finalY - 8, 120, 40);
      } catch {}
    }

    doc.save(`BOL_${padTicketNumber(data.id)}.pdf`);
  }

  // =================== Modal Rendering ===================
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center overflow-y-auto">
      <div
        className="rounded-xl shadow-2xl w-full max-w-3xl relative p-8"
        style={{ background: 'white', color: '#000' }}
      >
        {/* --------- Close Button --------- */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-600 font-bold"
          type="button"
        >
          ×
        </button>

        {/* --------- Modal Header Section --------- */}
        <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-1">
          <img src={PalomaIcon} alt="Paloma Logo" className="w-20 h-20 object-contain" />
          <div className="text-center flex-1">
            <h1 className="font-bold text-2xl tracking-wider text-black mb-1">PALOMA PRESSURE CONTROL</h1>
            <p className="text-xs text-black">#210-129 Queens Drive, Red Deer, AB T4P 0R8</p>
            <p className="text-xs text-black">403-598-7342</p>
          </div>
          <img src={PalomaIcon} alt="Paloma Logo" className="w-20 h-20 object-contain" />
        </div>

        <div
          className="flex items-center justify-between font-bold text-black border-b-2 border-black tracking-wider uppercase"
          style={{
            letterSpacing: '0.08em',
            fontSize: '1rem',
            padding: '0.35rem 0 0.3rem 0',
            marginBottom: '0.4rem',
            marginTop: '-0.6rem'
          }}
        >
          <span>BILL OF LADING</span>
          <span>PROOF OF DELIVERY</span>
          <span className="font-bold">
            NO. <span style={{ color: 'red' }}>{padTicketNumber(data.id)}</span>
          </span>
        </div>

        {/* --------- Ticket Details Section --------- */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
          <div className="flex flex-col">
            <span className="font-bold text-black text-xs mb-0" style={{ fontSize: '12px' }}>SHIPPER:</span>
            <div className="text-xs">{data.shipper || '-'}</div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-black text-xs mb-0" style={{ fontSize: '12px' }}>ADDRESS:</span>
            <div className="text-xs">{data.address || '-'}</div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-black text-xs mb-0" style={{ fontSize: '12px' }}>DELIVER TO (LSD):</span>
            <div className="text-xs">{data.delivery_address || '-'}</div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-black text-xs mb-0" style={{ fontSize: '12px' }}>DATE:</span>
            <div className="text-xs">{data.date || '-'}</div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-black text-xs mb-0" style={{ fontSize: '12px' }}>PO #:</span>
            <div className="text-xs">{data.po_number || '-'}</div>
          </div>
        </div>

        {/* --------- Assets and Items Table --------- */}
        <table className="w-full border mt-2" style={{ fontSize: '10px' }}>
          <thead>
            <tr style={{ background: '#e6e8df', lineHeight: '1', height: '28px' }}>
              <th className="border text-black font-bold text-center" style={{ fontSize: '9px', fontWeight: 700, width: '40px', padding: '4px 6px', whiteSpace: 'nowrap' }}>
                QTY
              </th>
              <th className="border px-2 py-0.5 text-black font-bold" style={{ fontSize: '9.5px', fontWeight: 700 }}>
                ASSET NAME
              </th>
              <th className="border px-2 py-0.5 text-black font-bold" style={{ fontSize: '9.5px', fontWeight: 700 }}>
                PPC#
              </th>
              <th className="border px-2 py-0.5 text-black font-bold" style={{ fontSize: '9.5px', fontWeight: 700 }}>
                WEIGHT (LBS)
              </th>
            </tr>
          </thead>
          <tbody>
            {(!groupedAssets || groupedAssets.length === 0) && (
              <tr>
                <td colSpan={4} className="text-center py-2" style={{ color: '#111', background: '#f3f4f1', fontSize: '10px' }}>
                  NO ASSETS
                </td>
              </tr>
            )}
            {groupedAssets && groupedAssets.map((asset, idx) => (
              <tr key={asset.name + idx} style={{ height: '24px', lineHeight: '1' }}>
                <td className="border text-black text-center font-bold" style={{ fontSize: '9px', padding: '2px 6px', width: '40px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                  {asset.qty}
                </td>
                <td className="border px-2 py-1 text-black font-bold" style={{ fontSize: '10px' }}>
                  {asset.name}
                </td>
                <td className="border px-2 py-1 text-black font-bold" style={{ fontSize: '10px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  {asset.ppcs.join(', ')}
                </td>
                <td className="border px-2 py-1 text-black text-center font-bold" style={{ fontSize: '10px' }}>
                  {asset.weight}
                </td>
              </tr>
            ))}
            {nonSerRows && nonSerRows.length > 0 && nonSerRows.map((item, idx) => (
              <tr key={'nonser-' + idx}>
                <td className="border text-black text-center font-bold" style={{ fontSize: '9px', padding: '2px 6px', width: '40px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                  {item.qty || '-'}
                </td>
                <td className="border px-2 py-1 text-black font-bold" style={{ fontSize: '10px' }}>
                  {item.name || '-'}
                </td>
                <td className="border px-2 py-1 text-black font-bold" style={{ fontSize: '10px' }}>-</td>
                <td className="border px-2 py-1 text-black text-center font-bold" style={{ fontSize: '10px' }}>
                  {item.weight || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --------- Comments and Additional Info Section --------- */}
        <div className="flex flex-col mt-3 mb-1">
          <span className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>ROAD, WEATHER, OTHER COMMENTS:</span>
          <div className="text-xs">{data.comments || '-'}</div>
        </div>

        <div className="grid grid-cols-3 gap-x-2 gap-y-1 mb-2 mt-3">
          <div className="flex flex-col">
            <span className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>RECEIVER NAME:</span>
            <div className="text-xs">{data.receiver_name || '-'}</div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>PHONE:</span>
            <div className="text-xs">{data.receiver_phone || '-'}</div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>EMAIL:</span>
            <div className="text-xs">{data.receiver_email || '-'}</div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>DRIVER NAME:</span>
            <div className="text-xs">{data.driver_name || '-'}</div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>TIME:</span>
            <div className="text-xs">{data.driver_time || '-'}</div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>TRUCKING PROVIDER:</span>
            <div className="text-xs">{data.trucking_provider || '-'}</div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>BOL TOTAL:</span>
            <div className="text-xs">{data.bol_total || '-'}</div>
          </div>
        </div>

        {data.signature && (
          <div className="flex flex-col items-start mt-2 mb-1">
            <span className="font-bold text-black mb-0" style={{ fontSize: '12px' }}>SIGNATURE:</span>
            <img
              src={data.signature}
              alt="Signature"
              style={{ width: 180, height: 46, border: '1px solid #888', background: '#fff' }}
            />
          </div>
        )}

        {/* --------- Modal Action Buttons --------- */}
        <div className="flex justify-end gap-2 mt-3">
          <button
            className="px-2 py-0.5 rounded bg-black text-white font-bold border border-[#6a7257] hover:bg-[#35392e] transition text-xs"
            style={{ fontSize: '11px', minWidth: '60px', minHeight: '28px' }}
            onClick={onClose}
            type="button"
          >
            Close
          </button>
          <button
            className="px-3 py-0.5 rounded bg-[#6a7257] text-black font-bold border border-[#23241b] hover:bg-[#949c7f] transition text-xs"
            style={{ fontSize: '11px', minWidth: '135px', minHeight: '28px' }}
            onClick={exportToPDF}
            type="button"
          >
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
