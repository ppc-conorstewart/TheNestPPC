// ==============================
// src/components/AssetTabsNav.jsx
// ==============================
import { useEffect, useRef } from 'react';

// ==============================
// TABS — BASE STYLE
// ==============================
const tabBase = {
  padding: '7px 28px 7px 28px',
  fontWeight: 700,
  border: 'none',
  outline: 'none',
  borderRadius: '0px 0px 0 0',
  fontSize: '1.2em',
  marginRight: 8,
  cursor: 'pointer',
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  background: 'transparent',
  borderBottom: '4px solid transparent',
  transition: 'background 0.18s, color 0.18s, border-bottom 0.18s, box-shadow 180ms ease, transform 160ms ease, opacity 160ms ease',
  position: 'relative',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale'
};

// ==============================
// TABS — COMPONENT
// ==============================
export default function AssetTabsNav({
  activeTab,
  setActiveTab,
  showRightPanelAssets = true,
  setShowRightPanelAssets = () => {},
  unreadBadge = false,
  masterHistoryOpen = false,
  onToggleMasterHistory = () => {}
}) {
  const railAccent = '#6a7257';
  const railText = '#ffffffff';

  const tabsWrapRef = useRef(null);
  const indicatorRef = useRef(null);

  const tabRefs = {
    assets: useRef(null),
    assemblies: useRef(null),
    ma_db: useRef(null),
    analytics: useRef(null),
    downed: useRef(null)
  };

  // ==============================
  // BOTTOM INDICATOR — POSITIONING
  // ==============================
  const positionIndicator = () => {
    const wrap = tabsWrapRef.current;
    const indicator = indicatorRef.current;
    const btn = tabRefs[activeTab]?.current;
    if (!wrap || !indicator || !btn) return;
    const left = btn.offsetLeft;
    const width = btn.clientWidth;
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${width}px`;
  };

  useEffect(() => {
    positionIndicator();
    const onResize = () => positionIndicator();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ==============================
  // TABS — STYLE FACTORY
  // ==============================
  const getTabStyle = (isActive) => ({
    ...tabBase,
    color: isActive ? '#687257' : 'rgba(255,255,255,.68)',
    borderTop: `2px solid ${isActive ? railAccent : 'rgba(255,255,255,.22)'}`,
    borderLeft: `2px solid ${isActive ? railAccent : 'rgba(255,255,255,.22)'}`,
    borderRight: `2px solid ${isActive ? railAccent : 'rgba(255,255,255,.22)'}`,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    opacity: isActive ? 1 : 0.9
  });

  const topGlow = (isActive) => ({
    position: 'absolute',
    top: -1,
    left: 10,
    right: 10,
    height: 2,
    filter: 'blur(.2px)'
  });

  // ==============================
  // RIGHT PANEL — OPEN TOGGLE
  // ==============================
  const OpenToggle = (
    <button
      onClick={() => setShowRightPanelAssets(true)}
      title='Open panel'
      style={{
        position: 'relative',
        minHeight: 42,
        padding: '4px 6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        background: 'linear-gradient(180deg, rgba(17,18,16,.92), rgba(17,18,16,.82))',
        border: `2px solid ${railAccent}`,
        color: railText,
        fontWeight: 900,
        letterSpacing: '.08em',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 220ms cubic-bezier(.16,1,.3,1), box-shadow 200ms ease',
        boxShadow: '0 4px 12px rgba(0,0,0,.35)'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,.45)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.35)'; }}
    >
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ color: railText, fontWeight: 900, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em' }}>Asset Summary</span>
        <span style={{ color: railText, fontWeight: 900, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em' }}>Active Transfers</span>
        <span style={{ color: railText, fontWeight: 900, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em' }}>Activity Log</span>
      </span>
      <span
        style={{
          width: 0,
          height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: `9px solid ${railAccent}`
        }}
      />
      {unreadBadge && (
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 10,
            height: 10,
            borderRadius: 999,
            background: '#ff6a6a',
            animation: 'palomaPulse 1.6s ease-in-out infinite'
          }}
        />
      )}
    </button>
  );

  // ==============================
  // RIGHT PANEL — CLOSE TOGGLE
  // ==============================
  const CloseToggle = (
    <button
      onClick={() => setShowRightPanelAssets(false)}
      title='Close panel'
      style={{
        height: 42,
        width: 42,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(17,18,16,.9), rgba(17,18,16,.78))',
        border: `2px solid ${railAccent}`,
        color: railAccent,
        cursor: 'pointer',
        transition: 'transform 220ms cubic-bezier(.16,1,.3,1), box-shadow 200ms ease',
        boxShadow: '0 4px 12px rgba(0,0,0,.35)'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,.45)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.35)'; }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `8px solid ${railAccent}`
        }}
      />
    </button>
  );

  // ==============================
  // MASTER HISTORY — TOGGLE
  // ==============================
  const MasterHistoryToggle = (
    <button
      onClick={onToggleMasterHistory}
      title='Master History Log'
      style={{
        minHeight: 42,
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        background: masterHistoryOpen
          ? 'linear-gradient(180deg,#2a3026,#1a1f18)'
          : 'linear-gradient(180deg, rgba(17,18,16,.92), rgba(17,18,16,.82))',
        border: `2px solid ${railAccent}`,
        color: '#ffffffff',
        fontWeight: 900,
        letterSpacing: '.08em',
        cursor: 'pointer',
        userSelect: 'none',
        textTransform: 'uppercase',
        transition: 'transform 220ms cubic-bezier(.16,1,.3,1), box-shadow 200ms ease'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,.45)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.35)'; }}
    >
      {masterHistoryOpen ? 'Close Master History' : 'Master History Log'}
    </button>
  );

  // ==============================
  // RENDER
  // ==============================
  return (
    <div
      className='flex items-center'
      style={{
        width: '100%',
        background: 'linear-gradient(180deg, #0b0c0a 0%, #050605 100%)',
        margin: 0,
        padding: '0 10px 0 0',
        boxSizing: 'border-box',
        borderRadius: 0,
        minHeight: 50,
        overflow: 'hidden',
        marginBottom: '-2px',
        justifyContent: 'space-between',
        gap: 8,
        borderBottom: '1px solid rgba(106,114,87,.35)'
      }}
    >
      {/* ============================== LEFT: TABS ============================== */}
      <div
        className='flex justify-start gap-1'
        style={{ position: 'relative' }}
        ref={tabsWrapRef}
      >
        <button
          ref={tabRefs.assets}
          style={getTabStyle(activeTab === 'assets')}
          onClick={() => setActiveTab('assets')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>Assets Main</span>
          <span style={topGlow(activeTab === 'assets')} />
        </button>

        <button
          ref={tabRefs.assemblies}
          style={getTabStyle(activeTab === 'assemblies')}
          onClick={() => setActiveTab('assemblies')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>Master Assemblies Hub</span>
          <span style={topGlow(activeTab === 'assemblies')} />
        </button>

        <button
          ref={tabRefs.ma_db}
          style={getTabStyle(activeTab === 'ma_db')}
          onClick={() => setActiveTab('ma_db')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>Master Assemblies DB</span>
          <span style={topGlow(activeTab === 'ma_db')} />
        </button>

        <button
          ref={tabRefs.analytics}
          style={getTabStyle(activeTab === 'analytics')}
          onClick={() => setActiveTab('analytics')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>Analytics</span>
          <span style={topGlow(activeTab === 'analytics')} />
        </button>

        <button
          ref={tabRefs.downed}
          style={getTabStyle(activeTab === 'downed')}
          onClick={() => setActiveTab('downed')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>Downed Assets</span>
          <span style={topGlow(activeTab === 'downed')} />
        </button>

        {/* ============================== SLIDING BOTTOM INDICATOR ============================== */}
        <span
          ref={indicatorRef}
          style={{
            position: 'absolute',
            bottom: -6,
            left: 0,
            height: 4,
            width: 0,
            background: 'linear-gradient(90deg, transparent 0%, #6a7257 10%, #ffffffff 50%, #6a7257 90%, transparent 100%)',
            boxShadow: '0 0 14px rgba(106,114,87,.55)',
            transition: 'transform 240ms cubic-bezier(.22,.61,.36,1), width 240ms cubic-bezier(.22,.61,.36,1)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* ============================== RIGHT: PANEL TOGGLES ============================== */}
      <div className='flex items-center gap-2'>
        {activeTab === 'assets' && (!showRightPanelAssets ? OpenToggle : CloseToggle)}
        {activeTab === 'assemblies' && MasterHistoryToggle}
      </div>
    </div>
  );
}
