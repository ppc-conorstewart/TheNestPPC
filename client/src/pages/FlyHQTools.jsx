// ===========================================
// FILE: client/src/pages/FlyHQTools.jsx
// ===========================================

import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { API_BASE_URL } from '../api'
import ActionItemsCard from '../components/HQ-Dashboard/ActionItemsCard'
import ActiveJobsCard from '../components/HQ-Dashboard/ActiveJobsCard'
import DeployedCoilCard from '../components/HQ-Dashboard/DeployedCoilCard'
import MissileJobHubCard from '../components/HQ-Dashboard/MissileJobHubCard'
import SourcingTableCard from '../components/HQ-Dashboard/SourcingTableCard'
import UpcomingPadsCard from '../components/HQ-Dashboard/UpcomingPadsCard'
import '../styles/dragula.min.css'
import dragula from '../styles/dragula.min.js'
import './FlyHQTools.css'

const API_BASE = API_BASE_URL || ''

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

const CollapsiblePanel = memo(function CollapsiblePanel({
  title,
  collapsed,
  onToggle,
  children,
  contentRef,
  panelContentHeight,
  indicatorColor
}) {
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

        <span
          className='fhq-collapse-indicator'
          style={{
            position: 'absolute',
            right: 28,
            width: 16,
            height: 16,
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
          style={{
            position: 'absolute',
            right: 6,
            top: 2,
            bottom: 2,
            width: 18,
            display: 'grid',
            placeItems: 'center',
            cursor: 'grab',
            userSelect: 'none',
            fontSize: 14,
            opacity: 0.9
          }}
        >
          ⋮⋮
        </span>
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
        {!collapsed && (
          <div style={{ width: '100%', height: '100%' }}>
            {children}
          </div>
        )}
      </div>
    </div>
  )
})

export default function FlyHQTools() {
  const [yearTotals, setYearTotals] = useState({ wells: 0, valve_7_1_16: 0, valve_5_1_8: 0, hyd_3_1_16: 0, man_3_1_16: 0 })
  const currentYear = new Date().getFullYear()
  const [showSummary, setShowSummary] = useState(false)

  const [collapsed, setCollapsed] = useState({
    active: false,
    coil: false,
    upcoming: false,
    missile: false,
    action: false,
    sourcing: false
  })

  const [order, setOrder] = useState(PANEL_DEFS.map(p => p.key))

  const refs = {
    active: useRef(null),
    coil: useRef(null),
    upcoming: useRef(null),
    missile: useRef(null),
    action: useRef(null),
    sourcing: useRef(null)
  }

  const gridRef = useRef(null)

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

  useEffect(() => { setShowSummary(true) }, [])
  useEffect(() => {
    if (!showSummary) return
    fetch(`${API_BASE}/api/jobs`)
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
      })
      .catch(() => {
        setYearTotals({ wells: 0, valve_7_1_16: 0, valve_5_1_8: 0, hyd_3_1_16: 0, man_3_1_16: 0 })
      })
  }, [showSummary, currentYear])

  const toggle = key => setCollapsed(s => ({ ...s, [key]: !s[key] }))
  const expandAll = () => { const next = {}; order.forEach(k => { next[k] = false }); setCollapsed(next) }
  const collapseAll = () => { const next = {}; order.forEach(k => { next[k] = true }); setCollapsed(next) }

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

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

    return () => { try { drake.destroy() } catch {} }
  }, [])

  const displayOrder = useMemo(() => order, [order])

  return (
    <div className='flex text-white fhq-pagewrap' style={PAGE_WRAPPER_STYLE}>
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

        <div className='dashboard-cards-grid' ref={gridRef}>
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
