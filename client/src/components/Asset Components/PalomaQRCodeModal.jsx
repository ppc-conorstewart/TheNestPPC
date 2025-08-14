// =================== Imports and Dependencies ===================
import QRCode from 'react-qr-code';
import logoUrl from '../../assets/Paloma_Icon_Black_large.png';

// =================== PPC Formatting Utility ===================
function getPrettyPPC(ppc) {
  if (!ppc) return '';
  const match = String(ppc).match(/PPC\s*0*(\d+)/i) || String(ppc).match(/PPC\s*(\d+)/i);
  if (match) return `PPC ${match[1]}`;
  const numMatch = String(ppc).replace(/\D/g, '').replace(/^0+/, '');
  return numMatch ? `PPC ${numMatch}` : ppc;
}

// =================== Paloma QR Code Modal Component ===================
export default function PalomaQRCodeModal({ asset, open, onClose }) {
  if (!open || !asset) return null;

  // --------- Prepare Data for QR ---------
  let ppcRaw = asset.id || asset.ppc || asset.sn || '';
  let prettyPPC = getPrettyPPC(ppcRaw);
  const assetName = asset.name || '';
  const qrValue = prettyPPC;

  // =================== Modal Rendering ===================
  return (
    <div
      className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-70 no-print-bg"
      onClick={onClose}
      style={{ zIndex: 9999 }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-2 px-6 relative flex flex-col items-center modal-qr"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 260, minWidth: 180 }}
      >
        {/* --------- Close Button --------- */}
        <span
          className="absolute top-2 right-4 font-bold text-black text-sm cursor-pointer no-print"
          onClick={onClose}
        >
          ✕
        </span>
        {/* --------- QR Content (Print Section) --------- */}
        <div className="print-qr-content flex flex-col items-center" style={{ padding: 0, background: '#fff' }}>
          <div
            className="text-black font-extrabold text-lg mb-1 text-center tracking-widest"
            style={{ letterSpacing: 2 }}
          >
            PALOMA QR
          </div>
          <div
            style={{
              position: 'relative',
              width: 140,
              height: 140,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <QRCode
              value={qrValue}
              size={140}
              bgColor="#fff"
              fgColor="#111"
              level="H"
              style={{ borderRadius: 8, display: 'block' }}
            />
            <img
              src={logoUrl}
              alt="Paloma Logo"
              className="paloma-logo-overlay"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 40,
                height: 40,
                transform: 'translate(-50%, -50%)',
                borderRadius: 8,
                background: '#fff',
                padding: 2,
                boxShadow: 'none',
                objectFit: 'contain',
                display: 'block',
                zIndex: 10
              }}
            />
          </div>
          {assetName && (
            <div
              className="mt-1 text-center text-black"
              style={{ fontSize: 9, fontWeight: 600, opacity: 0.75, maxWidth: 170, lineHeight: 1.1 }}
            >
              {assetName}
            </div>
          )}
          <div className="mt-1 text-center text-black text-base font-erbaum font-bold">
            {prettyPPC}
          </div>
        </div>
        {/* --------- Action Buttons --------- */}
        <div className="flex flex-row gap-2 mt-4 no-print">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-black text-white font-bold rounded-lg shadow hover:bg-gray-800 transition text-xs"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1 bg-[#6a7257] text-white font-bold rounded-lg shadow hover:bg-[#494f3c] transition text-xs"
          >
            Print QR
          </button>
        </div>
        {/* --------- Print CSS --------- */}
        <style>
          {`
            @media print {
              @page { margin: 0; }
              body * { visibility: hidden !important; }
              .print-qr-content, .print-qr-content * {
                visibility: visible !important;
                position: static !important;
                box-shadow: none !important;
                background: #fff !important;
                color: #000 !important;
              }
              .print-qr-content {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: flex-start !important;
              }
              .modal-qr, .modal-qr * {
                box-shadow: none !important;
                background: #fff !important;
                border: none !important;
                border-radius: 0 !important;
              }
              .paloma-logo-overlay {
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: 10 !important;
                background: #fff !important;
                box-shadow: none !important;
                display: block !important;
                width: 40px !important;
                height: 40px !important;
                border-radius: 8px !important;
                padding: 2px !important;
                object-fit: contain !important;
              }
              .no-print { display: none !important; }
              .no-print-bg { background: none !important; }
            }
          `}
        </style>
      </div>
    </div>
  );
}
