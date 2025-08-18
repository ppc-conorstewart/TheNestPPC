// src/components/Footer.jsx

import React from 'react'

export default function Footer() {
  return (
    <>
      {/* Vertical Divider at left, connects footer to sidebar */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '2px',
          height: '2rem', // match footer height exactly
          background: '#6a7257',
          zIndex: 51, // above footer itself
        }}
      />

      <footer
        className="w-full bg-black border-t-2 border-[#6a7257] text-white font-erbaum text-sm z-50"
        style={{
          minHeight: '2rem',
          height: '2rem',
          maxHeight: '2rem',
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="flex items-center justify-center min-w-full h-full">
          <img
            src="/assets/Paloma_Logo_White_Rounded.png"
            alt="Paloma Logo"
            className="h-7"
          />
          <span className="uppercase font-semibold">
            Paloma Pressure Control™
          </span>
        </div>
      </footer>
    </>
  )
}
