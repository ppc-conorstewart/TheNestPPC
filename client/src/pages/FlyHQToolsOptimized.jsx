// ===========================================
// FILE: client/src/pages/FlyHQToolsOptimized.jsx
// OPTIMIZED VERSION WITH LAZY LOADING & PERFORMANCE IMPROVEMENTS
// ===========================================

import React, { lazy, Suspense, memo, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { API_BASE_URL } from '../api'
import '../styles/dragula.min.css'
import './FlyHQTools.css'

const API_BASE = API_BASE_URL || ''

// Lazy load all dashboard components
const ActiveJobsCard = lazy(() => import('../components/HQ-Dashboard/ActiveJobsCard'))
const DeployedCoilCard = lazy(() => import('../components/HQ-Dashboard/DeployedCoilCard'))
const UpcomingPadsCard = lazy(() => import('../components/HQ-Dashboard/UpcomingPadsCard'))
const MissileJobHubCard = lazy(() => import('../components/HQ-Dashboard/MissileJobHubCard'))
const ActionItemsCard = lazy(() => import('../components/HQ-Dashboard/ActionItemsCard'))
const SourcingTableCard = lazy(() => import('../components/HQ-Dashboard/SourcingTableCard'))

// Lazy load dragula only when needed
let dragula = null;

const STAT_ITEMS = [
  { label: 'Wells Completed', valueKey: 'wells', color: '#8fffbb' },
  { label: '7-15K Valves Deployed', valueKey: 'valve_7_1_16', color: '#ff3b3b' },
  { label: '5-15K Valves Deployed', valueKey: 'valve_5_1_8', color: '#39b1ff' },
  { label: '3-15K Valves Deployed', valueKey: 'hyd_3_1_16', color: '#ffd100' },
  { label: 'Gateway Pods Deployed', valueKey: 'man_3_1_16', color: '#ff82d3' }
]

const GRID_GAP = 14
const MARQUEE_HEIGHT = 26
const BORDER = '0px solid #6a7257'
const HEADER_H = 36

const PAGE_WRAPPER_STYLE = {
  background: 'transparent',
  minHeight: '100svh',
  height: 'auto',
  width: '100%',
  position: 'relative',
  overflow: 'visible'
}

const MAIN_CONTAINER_STYLE = {
  position: 'absolute',
  inset: 0,
  paddingLeft: 0,
  paddingRight: 12,
  paddingTop: MARQUEE_HEIGHT + 0,
  paddingBottom: GRID_GAP,
  display: 'flex',
  flexDirection: 'column',
  gap: GRID_GAP,
  zIndex: 1
}

const PANEL_DEFS = [
  { key: 'active', title: 'ACTIVE JOBS', Comp: ActiveJobsCard },
  { key: 'coil', title: 'DEPLOYED COIL EQUIPMENT', Comp: DeployedCoilCard },
  { key: 'upcoming', title: 'UPCOMING JOB BUILDS', Comp: UpcomingPadsCard },
  { key: 'missile', title: 'MISSILE JOBS', Comp: MissileJobHubCard },
  { key: 'action', title: 'ACTION ITEMS', Comp: ActionItemsCard },
  { key: 'sourcing', title: 'SOURCING TABLE', Comp: SourcingTableCard }
]

// Loading placeholder component
const CardLoading = memo(function CardLoading() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6a7257',
      fontSize: 14,
      fontFamily: 'Erbaum, sans-serif'
    }}>
      Loading...
    </div>
  )
})

// Optimized CollapsiblePanel with lazy loading
const CollapsiblePanel = memo(function CollapsiblePanel({
  title,
  collapsed,
  onToggle,
  children,
  contentRef,
  panelContentHeight,
  indicatorColor
}) {
  const [hasBeenExpanded, setHasBeenExpanded] = useState(!collapsed)

  // Track if panel has ever been expanded
  useEffect(() => {
    if (!collapsed && !hasBeenExpanded) {
      setHasBeenExpanded(true)
    }
  }, [collapsed, hasBeenExpanded])

  const titleColor = '#ffffffff'
  const panelMinH = collapsed ? HEADER_H : (panelContentHeight + HEADER_H)

  return (
    <div
      className='fhq-panel'
      data-dkey={title}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        borderRadius: 12,
        background: 'transparent',
        overflow: 'hidden',
        minHeight: panelMinH,
        height: 'auto',
        alignSelf: 'start'
      }}
    >
      <div
        onClick={onToggle}
        className='fhq-panel-header'
        style={{
          height: HEADER_H,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: 'transparent',
          userSelect: 'none',
          position: 'relative'
        }}
      >
        <span
          className='fhq-panel-title'
          style={{
            fontFamily: 'Punoer, Erbaum, sans-serif',
            letterSpacing: '.14em',
            fontWeight: 600,
            textTransform: 'uppercase',
            textAlign: 'center',
            width: '100%',
            fontSize: 22,
            color: titleColor,
            lineHeight: 1
          }}
        >
          {title}
        </span>

        <div
          className='fhq-panel-controls'
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}
        >
          <span
            className='fhq-collapse-indicator'
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              display: 'grid',
              placeItems: 'center',
              border: '1px solid rgba(106,114,87,0.6)',
              background: 'transparent',
              fontWeight: 900,
              color: indicatorColor,
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 160ms ease, color 160ms ease',
              fontSize: 10,
              lineHeight: 1
            }}
          >
            {collapsed ? '+' : '–'}
          </span>

          <span
            className='fhq-drag-handle'
            title='Drag to reorder'
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
            style={{
              width: 22,
              height: 24,
              display: 'grid',
              placeItems: 'center',
              cursor: 'grab',
              userSelect: 'none',
              fontSize: 16,
              opacity: 0.9
            }}
          >
            ⋮⋮
          </span>
        </div>
      </div>

      <div
        ref={contentRef}
        className='scrollbar-paloma scrollbar-hover'
        style={{
          overflow: collapsed ? 'hidden' : 'auto',
          maxHeight: collapsed ? 0 : panelContentHeight,
          height: collapsed ? 0 : panelContentHeight,
          opacity: collapsed ? 0 : 1,
          padding: collapsed ? 0 : 0,
          transition: 'max-height 220ms ease, opacity 180ms ease, padding 180ms ease, height 220ms ease'
        }}
      >
        {/* Only render children if panel has been expanded at least once */}
        {hasBeenExpanded && !collapsed && (
          <div style={{ width: '100%', height: '100%' }}>
            <Suspense fallback={<CardLoading />}>
              {children}
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
})

// Memoized marquee component
const StatsMarquee = memo(function StatsMarquee({ yearTotals, currentYear }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: MARQUEE_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        paddingLeft: 10,
        paddingRight: 10,
        borderTop: BORDER,
        borderBottom: BORDER,
        background: 'transparent',
        zIndex: 3
      }}
    >
      <div
        className='marquee-strip'
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 28,
          whiteSpace: 'nowrap',
          animation: 'marquee-loop 90s linear infinite',
          willChange: 'transform'
        }}
      >
        {[...STAT_ITEMS, ...STAT_ITEMS].map((item, idx) => (
          <React.Fragment key={`${item.label}-${idx}`}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 6,
                color: '#e6e8df',
                fontFamily: 'Erbaum, sans-serif',
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: '.02em'
              }}
            >
              <span>{`${item.label} in ${currentYear}:`}</span>
              <span style={{ color: item.color, fontWeight: 900, fontSize: 12 }}>
                {yearTotals[item.valueKey] || 0}
              </span>
            </span>
            {idx !== STAT_ITEMS.length * 2 - 1 && (
              <span
                style={{
                  fontSize: 14,
                  color: '#6a7257',
                  fontWeight: 900,
                  transform: 'rotate(15deg)',
                  margin: '0 6px',
                  opacity: 0.9
                }}
              >
                ✦
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      <style>{`
        @keyframes marquee-loop {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-strip:hover { animation-play-state: paused; }
      `}</style>
    </div>
  )
})

export default function FlyHQToolsOptimized() {
  const [yearTotals, setYearTotals] = useState({ wells: 0, valve_7_1_16: 0, valve_5_1_8: 0, hyd_3_1_16: 0, man_3_1_16: 0 })
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const [dataFetched, setDataFetched] = useState(false)

  const [collapsed, setCollapsed] = useState({
    active: false,
    coil: false,
    upcoming: false,
    missile: false,
    action: false,
    sourcing: false
  })

  const [order, setOrder] = useState(PANEL_DEFS.map(p => p.key))
  const [dragEnabled, setDragEnabled] = useState(false)

  const refs = {
    active: useRef(null),
    coil: useRef(null),
    upcoming: useRef(null),
    missile: useRef(null),
    action: useRef(null),
    sourcing: useRef(null)
  }

  const gridRef = useRef(null)
  const drakeRef = useRef(null)

  const panelContentHeight = useFixedPanelContentHeight({
    rows: 3,
    cols: 2,
    headerH: HEADER_H,
    gridGap: GRID_GAP,
    marquee: MARQUEE_HEIGHT,
    mainPadTopExtra: 8,
    mainPadBottom: GRID_GAP,
    minContent: 180,
    maxContent: 520
  })

  // Fetch data only once with caching
  useEffect(() => {
    if (dataFetched) return

    const controller = new AbortController()

    fetch(`${API_BASE}/api/jobs`, { signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error('Jobs fetch failed'); return res.json() })
      .then(allJobs => {
        const completedThisYear = allJobs.filter(job => {
          if (job.status !== 'completed') return false
          const rigDate = new Date(job.rig_in_date)
          return rigDate.getFullYear() === currentYear
        })
        const totals = completedThisYear.reduce((acc, job) => ({
          wells: acc.wells + Number(job.num_wells || 0),
          valve_7_1_16: acc.valve_7_1_16 + Number(job.valve_7_1_16 || 0),
          valve_5_1_8: acc.valve_5_1_8 + Number(job.valve_5_1_8 || 0),
          hyd_3_1_16: acc.hyd_3_1_16 + Number(job.valve_hyd || 0),
          man_3_1_16: acc.man_3_1_16 + Number(job.valve_man || 0)
        }), { wells: 0, valve_7_1_16: 0, valve_5_1_8: 0, hyd_3_1_16: 0, man_3_1_16: 0 })
        setYearTotals(totals)
        setDataFetched(true)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setYearTotals({ wells: 0, valve_7_1_16: 0, valve_5_1_8: 0, hyd_3_1_16: 0, man_3_1_16: 0 })
          setDataFetched(true)
        }
      })

    return () => controller.abort()
  }, [currentYear, dataFetched])

  const toggle = useCallback(key => setCollapsed(s => ({ ...s, [key]: !s[key] })), [])
  const expandAll = useCallback(() => { const next = {}; order.forEach(k => { next[k] = false }); setCollapsed(next) }, [order])
  const collapseAll = useCallback(() => { const next = {}; order.forEach(k => { next[k] = true }); setCollapsed(next) }, [order])

  // Lazy load dragula only when first drag attempt
  useEffect(() => {
    if (!dragEnabled) return
    if (drakeRef.current) return

    // Dynamically import dragula
    import('../styles/dragula.min.js').then(module => {
      dragula = module.default || module

      const grid = gridRef.current
      if (!grid || drakeRef.current) return

      const drake = dragula({
        containers: [grid],
        moves: (el, source, handle) => {
          return !!(handle && (handle.classList.contains('fhq-drag-handle') || handle.closest('.fhq-drag-handle')))
        },
        copy: false,
        direction: 'vertical'
      })

      drake.on('drop', () => {
        const keys = Array.from(grid.querySelectorAll('.fhq-panel'))
          .map(panel => {
            const title = panel.querySelector('.fhq-panel-title')?.textContent || ''
            const def = PANEL_DEFS.find(p => p.title === title)
            return def ? def.key : null
          })
          .filter(Boolean)
        if (keys.length) setOrder(keys)
      })

      drakeRef.current = drake
    })

    return () => {
      if (drakeRef.current) {
        try { drakeRef.current.destroy() } catch {}
        drakeRef.current = null
      }
    }
  }, [dragEnabled])

  // Enable drag on first interaction
  const handleDragStart = useCallback(() => {
    if (!dragEnabled) setDragEnabled(true)
  }, [dragEnabled])

  const displayOrder = useMemo(() => order, [order])

  return (
    <div className='flex text-white fhq-pagewrap' style={PAGE_WRAPPER_STYLE}>
      <StatsMarquee yearTotals={yearTotals} currentYear={currentYear} />

      <div style={MAIN_CONTAINER_STYLE}>
        <div className='fhq-topbar'>
          <div className='fhq-btn-group'>
            <button className='fhq-chip fhq-chip-positive' onClick={expandAll}>
              <span className='fhq-chip-icon'>▾</span>
              <span className='fhq-chip-text'>Expand All</span>
            </button>
            <button className='fhq-chip fhq-chip-neutral' onClick={collapseAll}>
              <span className='fhq-chip-icon'>▴</span>
              <span className='fhq-chip-text'>Collapse All</span>
            </button>
          </div>
        </div>

        <div className='dashboard-cards-grid' ref={gridRef} onMouseDown={handleDragStart}>
          {displayOrder.map(key => {
            const def = PANEL_DEFS.find(p => p.key === key)
            if (!def) return null
            const Comp = def.Comp
            const isCollapsed = !!collapsed[key]
            const indicatorColor = isCollapsed ? '#8a8f85' : '#7CFF02'

            return (
              <CollapsiblePanel
                key={key}
                title={def.title}
                collapsed={isCollapsed}
                onToggle={() => toggle(key)}
                contentRef={refs[key]}
                panelContentHeight={panelContentHeight}
                indicatorColor={indicatorColor}
              >
                <Comp />
              </CollapsiblePanel>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function useFixedPanelContentHeight({
  rows,
  cols,
  headerH,
  gridGap,
  marquee,
  mainPadTopExtra,
  mainPadBottom,
  minContent = 160,
  maxContent = 560
}) {
  const [h, setH] = useState(300)

  useEffect(() => {
    const calc = () => {
      const vh = window.innerHeight || 900
      const available = vh - (marquee + mainPadTopExtra) - mainPadBottom
      const perRowTotal = (available - (rows - 1) * gridGap) / rows
      const content = Math.max(minContent, Math.min(maxContent, Math.floor(perRowTotal - headerH)))
      setH(content)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [rows, cols, headerH, gridGap, marquee, mainPadTopExtra, mainPadBottom, minContent, maxContent])

  return h
}