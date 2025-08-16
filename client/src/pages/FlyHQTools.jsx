// ===========================
// FlyHQTools.jsx
// ===========================

// ===== IMPORTS =====
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import 'swiper/css'
import 'swiper/css/navigation'
import { FreeMode, Mousewheel, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import './FlyHQTools.css'

// === GLASS BACKDROP & STYLES ===
import GlassBackdrop from '../components/ui/GlassBackdrop'
import '../styles/glass.css'

// === LOTTIE ICON IMPORTS ===
import Lottie from "lottie-react"
import AnalyticsIcon from "../assets/Fly-HQ Icons/AnalyticsIcon.json"
import AssetManagementIcon from "../assets/Fly-HQ Icons/AssetManagementIcon.json"
import FieldSupeIcon from "../assets/Fly-HQ Icons/FieldSupeIcon.json"
import JobMapIcon from "../assets/Fly-HQ Icons/JobMapIcon.json"
import JobPlannerIcon from "../assets/Fly-HQ Icons/JobPlannerIcon.json"
import OverwatchIcon from "../assets/Fly-HQ Icons/OverwatchIcon.json"
import ProjectsIcon from "../assets/Fly-HQ Icons/ProjectsIcon.json"
import SafetyIcon from "../assets/Fly-HQ Icons/SafetyIcon.json"
import SourcingIcon from "../assets/Fly-HQ Icons/SourcingIcon.json"
import TrainingIcon from "../assets/Fly-HQ Icons/TrainingIcon.json"
import WorkorderHubIcon from "../assets/Fly-HQ Icons/WorkorderHubIcon.json"

// === DASHBOARD CARD IMPORTS ===
import ActiveJobsCard from '../components/HQ-Dashboard/ActiveJobsCard'
import DeployedCoilCard from '../components/HQ-Dashboard/DeployedCoilCard'
import MissileJobHubCard from '../components/HQ-Dashboard/MissileJobHubCard'
import UpcomingPadsCard from '../components/HQ-Dashboard/UpcomingPadsCard'

// ===== ICONS MAP =====
const ICONS = {
  jobPlanner: JobPlannerIcon,
  assetManagement: AssetManagementIcon,
  workorderHub: WorkorderHubIcon,
  sourcing: SourcingIcon,
  analytics: AnalyticsIcon,
  projects: ProjectsIcon,
  safety: SafetyIcon,
  jobMap: JobMapIcon,
  superintendantHub: FieldSupeIcon,
  padOverwatch: OverwatchIcon,
  trainingHub: TrainingIcon
}

// ===== MARQUEE STATS CONFIG =====
const STAT_ITEMS = [
  {
    label: "Wells Completed",
    valueKey: "wells",
    color: "#8fffbb",
    icon: <span style={{fontSize:30,marginRight:7}}>🛢️</span>,
  },
  {
    label: "7-15K Valves Deployed",
    valueKey: "valve_7_1_16",
    color: "#ff1111ff",
    icon: <span style={{fontSize:30,marginRight:7}}>🔩</span>,
  },
  {
    label: "5-15K Valves Deployed",
    valueKey: "valve_5_1_8",
    color: "#39b1ff",
    icon: <span style={{fontSize:30,marginRight:7}}>🔧</span>,
  },
  {
    label: "3-15K Valves Deployed",
    valueKey: "hyd_3_1_16",
    color: "#ffd100",
    icon: <span style={{fontSize:30,marginRight:7}}>🛠️</span>,
  },
  {
    label: "Gateway Pods Deployed",
    valueKey: "man_3_1_16",
    color: "#ff82d3",
    icon: <span style={{fontSize:30,marginRight:7}}>🟢</span>,
  },
]

// ===== LAYOUT CONSTANTS =====
const HEADER_HEIGHT = 30
const FOOTER_HEIGHT = 56
const CAROUSEL_HEIGHT = 180
const GRID_TOP_MARGIN = 8
const GRID_BOTTOM_MARGIN = 12

// ===== GLASS CONTAINER STYLE (fully translucent) =====
const BLACK_CONTAINER_STYLE = {
  background: 'transparent',
  padding: '0px',
  minWidth: 0,
  width: '100%',
  maxWidth: '100%',
  marginTop: 0,
  minHeight: '81%',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  overflow: 'visible',
  transition: 'box-shadow .25s',
}

// ===== DASHBOARD HEADER STYLE =====
const DASH_HEADER_STYLE = {
  fontFamily: "'Punoer', 'erbaum', 'Inter', Arial, sans-serif",
  fontSize: '2.2rem',
  color: '#c3c3c3ff',
  textShadow: '0 2px 24px #000, 0 1px 1px #6a7257ff',
  letterSpacing: '.4em',
  fontWeight: 600,
  textTransform: 'uppercase',
  textAlign: 'center',
  marginTop: 4,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  lineHeight: .9,
  zIndex: 11,
  width: '100%',
  userSelect: 'none',
  pointerEvents: 'auto',
  fontStyle: 'italic',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 24,
}

// ===========================
// MAIN COMPONENT
// ===========================
export default function FlyHQTools() {
  // ===== STATE =====
  const navigate = useNavigate()
  const [jobsInProgress, setJobsInProgress] = useState([])
  const [yearTotals, setYearTotals] = useState({
    wells: 0,
    valve_7_1_16: 0,
    valve_5_1_8: 0,
    hyd_3_1_16: 0,
    man_3_1_16: 0,
  })
  const currentYear = new Date().getFullYear()
  const [showSummary, setShowSummary] = useState(false)

  // ===== JOB SUMMARY LOGIC =====
  useEffect(() => {
    setShowSummary(true)
  }, [])

  useEffect(() => {
    if (!showSummary) return
    fetch(`${process.env.REACT_APP_API_URL}/api/jobs`)
      .then((res) => {
        if (!res.ok) throw new Error(`Jobs fetch failed: ${res.status}`)
        return res.json()
      })
      .then((allJobs) => {
        const inProgress = allJobs.filter((job) => job.status === 'in-progress')
        setJobsInProgress(inProgress)
        const completedThisYear = allJobs.filter((job) => {
          if (job.status !== 'completed') return false
          const rigDate = new Date(job.rig_in_date)
          return rigDate.getFullYear() === currentYear
        })
        const totals = completedThisYear.reduce(
          (acc, job) => ({
            wells: acc.wells + Number(job.num_wells || 0),
            valve_7_1_16: acc.valve_7_1_16 + Number(job.valve_7_1_16 || 0),
            valve_5_1_8: acc.valve_5_1_8 + Number(job.valve_5_1_8 || 0),
            hyd_3_1_16: acc.hyd_3_1_16 + Number(job.valve_hyd || 0),
            man_3_1_16: acc.man_3_1_16 + Number(job.valve_man || 0),
          }),
          { wells: 0, valve_7_1_16: 0, valve_5_1_8: 0, hyd_3_1_16: 0, man_3_1_16: 0 }
        )
        setYearTotals(totals)
      })
      .catch((err) => {
        console.error('Error fetching jobs for summary:', err)
        setJobsInProgress([])
        setYearTotals({ wells: 0, valve_7_1_16: 0, valve_5_1_8: 0, hyd_3_1_16: 0, man_3_1_16: 0 })
      })
  }, [showSummary, currentYear])

  // ===== TOOL CAROUSEL LOGIC =====
  const tools = [
    { key: 'jobPlanner', title: 'Job Planner', description: 'View and manage job schedules', route: '/job-planner' },
    { key: 'assetManagement', title: 'Asset Management', description: 'Track and update component inventory', route: '/fly-hq' },
    { key: 'workorderHub', title: 'Workorder Hub', description: 'Create and plan new workorders', route: '/workorder-hub' },
    { key: 'sourcing', title: 'Sourcing', description: 'Find and request new components', route: '/sourcing' },
    { key: 'analytics', title: 'Analytics', description: 'An overview of various metrics', route: '/analytics' },
    { key: 'projects', title: 'Projects', description: 'Track and manage ongoing projects', route: '/projects' },
    { key: 'safety', title: 'Safety', description: 'Company safety resources and documents', route: '/safety' },
    { key: 'jobMap', title: 'Job Map', description: 'View and search jobs on map', route: '/job-map' },
    {
      key: 'superintendantHub',
      title: 'Superintendants',
      description: 'Central hub for Superintendant operations',
      route: '/superintendant-hub'
    },
    {
      key: 'padOverwatch',
      title: 'Pad Overwatch',
      description: 'Live pad stats, pressure & job monitoring',
      route: '/pad-overwatch'
    },
    {
      key: 'trainingHub',
      title: 'Training Hub',
      description: 'Access training modules, resources & certification',
      route: '/training-hub'
    },
  ]
  const sortedTools = [...tools].sort((a, b) => a.title.localeCompare(b.title))
  const slideData = Array(40).fill(sortedTools).flat();
  const lottieRefs = useRef([]);
  if (lottieRefs.current.length !== slideData.length) {
    lottieRefs.current = Array(slideData.length)
      .fill()
      .map((_, i) => lottieRefs.current[i] || React.createRef());
  }
  const swiperRef = useRef(null);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const pauseTimeout = useRef();
  const pauseAutoScroll = useCallback(() => {
    setAutoScrollPaused(true);
    if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
    pauseTimeout.current = setTimeout(() => {
      setAutoScrollPaused(false);
    }, 5000);
  }, []);
  useEffect(() => {
    const swiper = swiperRef.current && swiperRef.current.swiper;
    if (!swiper) return;
    const handleTouchStart = () => pauseAutoScroll();
    const handleSliderMove = () => pauseAutoScroll();
    const handleWheel = () => pauseAutoScroll();
    swiper.on('touchStart', handleTouchStart);
    swiper.on('sliderMove', handleSliderMove);
    swiper.on('wheel', handleWheel);
    return () => {
      swiper.off('touchStart', handleTouchStart);
      swiper.off('sliderMove', handleSliderMove);
      swiper.off('wheel', handleWheel);
    };
  }, [pauseAutoScroll]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoScrollPaused) return;
      const swiper = swiperRef.current && swiperRef.current.swiper;
      if (swiper && swiper.enabled) {
        swiper.setTranslate(swiper.getTranslate() - 0.6);
        swiper.updateProgress();
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }
    }, 16);
    return () => clearInterval(interval);
  }, [autoScrollPaused]);

  // ===== HEIGHT CALCULATION =====
  const TOTAL_HEIGHT = window.innerHeight || 800;
  const cardsContainerHeight = TOTAL_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - CAROUSEL_HEIGHT - GRID_TOP_MARGIN - GRID_BOTTOM_MARGIN;

  // ===========================
  // RENDER / RETURN
  // ===========================
  return (
    <div
      className="flex flex-col min-h-0 h-full w-full text-white overflow-auto"
      style={{
        background: 'transparent',
        minHeight: 0,
        height: '100%',
        width: '98%',
        marginLeft: 20,
        position: '',
        overflow: 'auto',
      }}
    >
      {/* === Page-scoped Glass Backdrop — uses /public/assets/dark-bg.png === */}
      <GlassBackdrop image="/assets/dark-bg.png" blur={0} opacity={0.18} />

      {/* === Unified Glass Dashboard Container === */}
      <div
        className="glass-card"
        style={{
          ...BLACK_CONTAINER_STYLE,
          height: cardsContainerHeight,
          maxHeight: cardsContainerHeight,
          marginTop: GRID_TOP_MARGIN,
          marginBottom: GRID_BOTTOM_MARGIN,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {/* === DASHBOARD HEADER === */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: -6,
              transform: 'translateX(-50%)',
              width: 460,
              height: 54,
              borderRadius: 999,
              background:
                'radial-gradient(60% 120% at 50% 50%, rgba(106,114,87,0.28), rgba(0,0,0,0) 70%)',
              filter: 'blur(10px)',
              animation: 'pulseGlow 3.2s ease-in-out infinite',
              pointerEvents: 'none',
              zIndex: 5
            }}
          />
          <div style={DASH_HEADER_STYLE}></div>
        </div>

        <style>
          {`
            @keyframes pulseGlow {
              0% { opacity: .55; transform: translateX(-50%) scale(0.98); }
              50% { opacity: .85; transform: translateX(-50%) scale(1.02); }
              100% { opacity: .55; transform: translateX(-50%) scale(0.98); }
            }
            .gradient-frame {
              position: relative;
              border-radius: 14px;
              padding: 1px;
              /* removed conic gradient fill for cleaner look */
              background: rgba(255,255,255,0.04);
            }
            .gradient-inner {
              border-radius: 13px;
              background: rgba(10,12,10,0.25); /* more transparent */
              box-shadow: 0 10px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04);
              height: 100%;
              width: 100%;
              backdrop-filter: blur(4px);
              -webkit-backdrop-filter: blur(4px);
              overflow: hidden;
            }
            .carousel-glass {
              background: rgba(12,14,12,0.35);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              border: 1px solid rgba(106,114,87,0.55);
              box-shadow: 0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05);
            }
          `}
        </style>

        <div
          style={{
            width: '100%',
            flex: '1 1 auto',
            minHeight: 0,
            minWidth: 0,
            marginTop: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Grid for the four dashboard cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: '20px',
              width: '100%',
              height: '100%',
              minHeight: 0,
            }}
          >
            <div style={{ minHeight: 0, height: '100%', width: '100%', overflow: 'visible', borderRadius: 0, display: 'flex' }}>
              <div className="gradient-frame" style={{ width: '100%' }}>
                <div className="gradient-inner">
                  <ActiveJobsCard />
                </div>
              </div>
            </div>
            <div style={{ minHeight: 0, height: '100%', width: '100%', overflow: 'visible', borderRadius: 0, display: 'flex' }}>
              <div className="gradient-frame" style={{ width: '100%' }}>
                <div className="gradient-inner">
                  <DeployedCoilCard />
                </div>
              </div>
            </div>
            <div style={{ minHeight: 0, height: '100%', width: '100%', overflow: 'visible', borderRadius: 0, display: 'flex' }}>
              <div className="gradient-frame" style={{ width: '100%' }}>
                <div className="gradient-inner">
                  <UpcomingPadsCard />
                </div>
              </div>
            </div>
            <div style={{ minHeight: 0, height: '100%', width: '100%', overflow: 'visible', borderRadius: 0, display: 'flex' }}>
              <div className="gradient-frame" style={{ width: '100%' }}>
                <div className="gradient-inner">
                  <MissileJobHubCard />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === MARQUEE BAR (Stats) — glassy === */}
        <div
          className="w-full glass-card"
          style={{
            marginTop: 50,
            marginBottom: 0,
            width: '100%',
            height: 36,
            border: 'var(--glass-ring)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            zIndex: 21,
          }}
        >
          <div
            className="marquee-inner"
            style={{
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              animation: 'marquee-scroll 60s linear infinite',
              minWidth: '100%',
              fontFamily: 'Erbaum, sans-serif',
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: '.02em',
              height: '100%',
            }}
          >
            {STAT_ITEMS.map((item) => (
              <span
                key={item.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: 16,
                  fontFamily: 'Varien, sans-serif',
                  padding: '0 0px 0 0px',
                  margin: '0 0px',
                  boxShadow: '0 2px 12px 0 rgba(50,60,30,0.13)',
                  color: 'white',
                  minWidth: '100%',
                  height: 30,
                  fontSize: 20,
                }}
              >
                <span style={{ marginRight: 12 }}>{item.label}</span>
                <span style={{
                  fontWeight: 800,
                  fontSize: 20,
                  color: item.color,
                  marginLeft: 4,
                }}>
                  {yearTotals[item.valueKey] || 0}
                </span>
              </span>
            ))}
          </div>
          <style>
            {`
              @keyframes marquee-scroll {
                0% { transform: translateX(0%);}
                100% { transform: translateX(-60%);}
              }
              .marquee-inner:hover {
                animation-play-state: paused;
              }
            `}
          </style>
        </div>
      </div>

      {/* ===== HQ TOOLS SWIPER SECTION (FLUSH TO FOOTER) ===== */}
      <div
        className="w-full flex justify-center carousel-glass"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          marginBottom: 0,
          padding: 0,
          pointerEvents: 'auto',
          zIndex: 1,
          minHeight: CAROUSEL_HEIGHT,
          height: CAROUSEL_HEIGHT,
        }}
      >
        <div
          className="w-full max-w-screen-2xl px-2 "
          style={{
            minHeight: CAROUSEL_HEIGHT,
            height: CAROUSEL_HEIGHT,
            pointerEvents: 'auto',
          }}
        >
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Mousewheel, FreeMode]}
            freeMode={true}
            freeModeMomentum={false}
            direction="horizontal"
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            mousewheel={{
              forceToAxis: true,
              sensitivity: 1,
              releaseOnEdges: false,
            }}
            spaceBetween={20}
            slidesPerView={4}
            loop={true}
            loopedSlides={slideData.length}
            allowTouchMove={true}
            centeredSlides
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            style={{
              '--swiper-navigation-color': '#6a7257',
              '--swiper-navigation-size': '50px',
              overflow: 'visible',
              height: CAROUSEL_HEIGHT,
              minHeight: CAROUSEL_HEIGHT,
              cursor: 'grab',
            }}
            className="relative overflow-visible"
          >
            {slideData.map((tool, idx) => (
              <SwiperSlide
                key={tool.key + '-' + idx}
                className="overflow-visible relative group hover:z-50"
              >
                <div
                  onClick={() => navigate(tool.route)}
                  onMouseEnter={() => {
                    lottieRefs.current[idx]?.current?.play?.();
                  }}
                  onMouseLeave={() => {
                    lottieRefs.current[idx]?.current?.stop?.();
                  }}
                  className="relative rounded-2xl glass-card border-4 border-[#6a7257] shadow-xl transition-transform duration-300 ease-out hover:scale-[1.05] hover:shadow-[0_10px_20px_rgba(106,114,87,0.3)] overflow-visible flex flex-col items-center min-h-[146px] max-w-[340px] mx-auto"
                  style={{
                    boxShadow: "0 6px 18px 0 rgba(0, 0, 0, 0.23)",
                  }}
                >
                  <div
                    className="w-full flex items-center uppercase border-2 border-[#6a7257] font-cornero justify-center rounded-t-2xl glass-header"
                    style={{
                      minHeight: 30,
                      paddingTop: 0,
                      paddingBottom: 0,
                    }}
                  >
                    <h2 className="text-lg  text-white tracking-wide px-2 text-center w-full" style={{ lineHeight: 1.0 }}>
                      {tool.title}
                    </h2>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center mt-0 mb-1">
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "rgba(35,37,29,0.6)",
                        border: "2px solid #6a7257",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 0,
                        marginTop: 1,
                        boxShadow: "0 2px 8px 0 rgba(106,114,87,0.12)",
                        backdropFilter: "blur(6px)",
                        WebkitBackdropFilter: "blur(6px)"
                      }}
                    >
                      <Lottie
                        lottieRef={lottieRefs.current[idx]}
                        animationData={ICONS[tool.key]}
                        loop={false}
                        autoplay={false}
                        style={{ width: 30, height: 30 }}
                      />
                    </div>
                  </div>
                  <div className="w-full px-2 pb-1 border border-[#6a7257] rounded-xl flex items-end justify-center">
                    <p className="text-[#e6e8df] text-sm uppercase font-cornero  text-center " style={{ letterSpacing: ".03em" }}>
                      {tool.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}
