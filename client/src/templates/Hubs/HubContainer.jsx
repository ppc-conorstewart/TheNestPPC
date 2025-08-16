import React from 'react';

const camoBg = '/assets/dark-bg.jpg';

export default function HubContainer({
  width = 2035,   // exact width
  height = 'calc(100vh - 48px)', // exact height, change as needed
  style = {},
  className = '',
  children,
}) {
  return (
    <div
      className={`min-h-screen w-full font-erbaum uppercase py-3 text-sm text-white bg-fixed bg-cover flex items-center justify-center ${className}`}
      style={{
        backgroundImage: `url(${camoBg})`,
        backgroundColor: '#000',
        ...style,
      }}
    >
      <div
        style={{
          background: '#000',
          borderRadius: '18px',
          width: width,
          height: height,
          margin: '0 auto',
          border: '2px solid #282d25',
          boxShadow: '0 4px 36px 0 #10141177',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
}
