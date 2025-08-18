// =================== Imports and Dependencies ===================
import { QrReader } from 'react-qr-reader';

// =================== QR Scan Modal Component ===================
export default function QRScanModal({
  show,
  setShow,
  qrScanResult,
  setQrScanResult,
  addAssetByScannedQR,
}) {
  if (!show) return null;

  // =================== Modal Rendering ===================
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center" style={{ minWidth: 320 }}>
        {/* --------- Modal Title --------- */}
        <h2 className="font-bold text-black mb-2 text-center">
          Scan Asset QR Code
        </h2>
        {/* --------- QR Reader Section --------- */}
        <QrReader
          constraints={{ facingMode: 'environment' }}
          onResult={(result, error) => {
            if (result?.text && result.text !== qrScanResult) {
              setQrScanResult(result.text);
              addAssetByScannedQR(result.text);
              setShow(false);
              setTimeout(() => setQrScanResult(''), 800);
            }
          }}
          style={{ width: 260, maxWidth: '90vw' }}
        />
        {/* --------- Close Button --------- */}
        <button
          className="mt-2 px-4 py-1 rounded bg-black text-white font-bold text-xs"
          onClick={() => {
            setShow(false);
            setQrScanResult('');
          }}
        >
          Close
        </button>
        {/* --------- QR Scan Result Display --------- */}
        {qrScanResult && (
          <div className="mt-2 text-sm text-green-700">
            QR scanned: <b>{qrScanResult}</b>
          </div>
        )}
      </div>
    </div>
  );
}
