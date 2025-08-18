import React from 'react';

export default function PalomaQRCodeModal({ asset, open, onClose }) {
  if (!open) return null;

  // Replace this with your actual QR code rendering logic.
  // If you use a QR library, import and use it here.
  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 2000,
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(20,20,20,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a1d1a',
          border: '2px solid #35392E',
          borderRadius: 12,
          padding: 38,
          minWidth: 300,
          minHeight: 300,
          boxShadow: '0 4px 24px #000b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div style={{ marginBottom: 18, color: '#6a7257', fontWeight: 800, fontSize: 22 }}>
          Asset QR Code
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20
        }}>
          {/* Insert your QR code library here.
              For demo: showing asset name/id as a placeholder */}
          <div style={{
            color: '#222',
            fontSize: 24,
            fontWeight: 600
          }}>
            {asset?.name || asset?.id || 'No asset'}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 10,
            padding: '8px 28px',
            background: '#6a7257',
            color: '#181818',
            fontWeight: 700,
            border: 'none',
            borderRadius: 7,
            fontSize: 16,
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
