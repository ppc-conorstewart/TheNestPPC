import React from 'react';

const LoadingSpinner = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        background: 'transparent'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(106, 114, 87, 0.2)',
            borderTop: '4px solid #6A7257',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoadingSpinner;