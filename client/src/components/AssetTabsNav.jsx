// ==============================
// src/components/AssetTabsNav.jsx
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
  transition: 'background 0.18s, color 0.18s, border-bottom 0.18s, box-shadow 180ms ease, transform 160ms ease',
  position: 'relative',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale'
};

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
  const railMuted = '#b0b79f';

  // ==============================
  // TAB FACTORY (Keeps size, upgrades visuals)
  // ==============================
  const getTabStyle = (isActive) => ({
    ...tabBase,
    color: isActive ? '#6a7257' : railMuted,
    background: isActive
      ? 'linear-gradient(180deg, #121310 0%, #0f100e 55%, #0b0c0a 100%)'
      : 'linear-gradient(180deg, rgba(20,22,18,.35) 0%, rgba(14,15,13,.15) 100%)',
    boxShadow: isActive
      ? `inset 0 2px 0 0 rgba(255,255,255,.08),
         inset 0 -1px 0 0 rgba(0,0,0,.55),
         0 4px 10px rgba(0,0,0,.35),
         0 0 0 1px rgba(106,114,87,.22)`
      : `inset 0 1px 0 0 rgba(255,255,255,.05),
         0 0 0 1px rgba(106,114,87,.15)`,
    borderTop: `2px solid rgba(255,255,255,.06)`,
    borderLeft: `2px solid rgba(106,114,87,.25)`,
    borderRight: `2px solid rgba(106,114,87,.25)`,
  });

  const underline = (isActive) => ({
    position: 'absolute',
    bottom: -6,
    left: 0,
    width: '100%',
    height: 4,
    background: isActive
      ? `linear-gradient(90deg, transparent 0%, ${railAccent} 10%, ${railText} 50%, ${railAccent} 90%, transparent 100%)`
      : 'transparent',
    boxShadow: isActive ? '0 0 14px rgba(106,114,87,.55)' : 'none',
    transition: 'opacity 160ms ease',
    opacity: isActive ? 1 : 0
  });

  const topGlow = (isActive) => ({
    position: 'absolute',
    top: -1,
    left: 10,
    right: 10,
    height: 2,
    background: isActive ? 'linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent)' : 'transparent',
    filter: 'blur(.2px)'
  });

  // ==============================
  // RIGHT PANEL OPEN TOGGLE (ASSETS TAB)
  // ==============================
  const OpenToggle = (
    <button
      onClick={() => setShowRightPanelAssets(true)}
      title="Open panel"
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
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'; e.currentTarget.style.boxShadow='0 6px 16px rgba(0,0,0,.45)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.35)'; }}
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
  // RIGHT PANEL CLOSE TOGGLE (ASSETS TAB)
  // ==============================
  const CloseToggle = (
    <button
      onClick={() => setShowRightPanelAssets(false)}
      title="Close panel"
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
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px) scale(1.04)'; e.currentTarget.style.boxShadow='0 6px 16px rgba(0,0,0,.45)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.35)'; }}
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
  // MASTER HISTORY LOG TOGGLE (ASSEMBLIES TAB)
  // ==============================
  const MasterHistoryToggle = (
    <button
      onClick={onToggleMasterHistory}
      title="Master History Log"
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
        color: '#e6e8df',
        fontWeight: 900,
        letterSpacing: '.08em',
        cursor: 'pointer',
        userSelect: 'none',
        textTransform: 'uppercase',
        transition: 'transform 220ms cubic-bezier(.16,1,.3,1), box-shadow 200ms ease',
        boxShadow: '0 4px 12px rgba(0,0,0,.35)'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'; e.currentTarget.style.boxShadow='0 6px 16px rgba(0,0,0,.45)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.35)'; }}
    >
      {masterHistoryOpen ? 'Close Master History' : 'Master History Log'}
    </button>
  );

  // ==============================
  // RENDER
  // ==============================
  return (
    <div
      className="flex items-center"
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
        borderBottom: '1px solid rgba(106,114,87,.35)',
        boxShadow: 'inset 0 -1px 0 rgba(255,255,255,.04)'
      }}
    >
      {/* ============================== LEFT: TABS ============================== */}
      <div className="flex justify-start gap-1" style={{ position: 'relative' }}>
        {/* subtle rail behind tabs */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: -8,
            right: 0,
            bottom: 0,
            height: 26,
            background: 'linear-gradient(180deg, rgba(255,255,255,.03), rgba(0,0,0,0))'
          }}
        />
        <button
          style={getTabStyle(activeTab === 'assets')}
          onClick={() => setActiveTab('assets')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>Assets Main</span>
          <span style={topGlow(activeTab === 'assets')} />
          <span style={underline(activeTab === 'assets')} />
        </button>

        <button
          style={getTabStyle(activeTab === 'assemblies')}
          onClick={() => setActiveTab('assemblies')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>Master Assemblies Hub</span>
          <span style={topGlow(activeTab === 'assemblies')} />
          <span style={underline(activeTab === 'assemblies')} />
        </button>

        <button
          style={getTabStyle(activeTab === 'ma_db')}
          onClick={() => setActiveTab('ma_db')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>Master Assemblies DB</span>
          <span style={topGlow(activeTab === 'ma_db')} />
          <span style={underline(activeTab === 'ma_db')} />
        </button>

        <button
          style={getTabStyle(activeTab === 'analytics')}
          onClick={() => setActiveTab('analytics')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>Analytics</span>
          <span style={topGlow(activeTab === 'analytics')} />
          <span style={underline(activeTab === 'analytics')} />
        </button>
      </div>

      {/* ============================== RIGHT: CONTEXTUAL ACTIONS ============================== */}
      <div style={{ display: 'flex,', alignItems: 'center', gap: 8 }}>
        {activeTab === 'assets' ? (!showRightPanelAssets ? OpenToggle : CloseToggle) : null}
        {activeTab === 'assemblies' ? MasterHistoryToggle : null}
      </div>

      {/* ============================== KEYFRAMES ============================== */}
      <style>{`
        @keyframes palomaPulse {
          0% { transform: scale(1); opacity: .8; }
          50% { transform: scale(1.4); opacity: .35; }
          100% { transform: scale(1); opacity: .8; }
        }
        @keyframes glideUnderline {
          0% { transform: translateX(-10%); opacity: .2; }
          50% { transform: translateX(0%); opacity: 1; }
          100% { transform: translateX(10%); opacity: .2; }
        }
      `}</style>
    </div>
  );
}
