// =================== Imports and Dependencies ===================
import Lottie from "lottie-react"
import React, { useRef } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { NavLink, useNavigate } from 'react-router-dom'

// =================== Lottie Icon Imports ===================
import DashboardIcon from '../../assets/Fly-HQ Icons/DashboardIcon.json'
import DocumentIcon from '../../assets/Fly-IQ Icons/DocumentIcon.json'
import ExpensingIcon from '../../assets/Fly-IQ Icons/ExpensingIcon.json'
import GamesIcon from '../../assets/Fly-IQ Icons/GamesIcon.json'
import LeaderboardIcon from '../../assets/Fly-IQ Icons/LeaderboardIcon.json'
import ResourcesIcon from '../../assets/Fly-IQ Icons/ResourcesIcon.json'
import ScheduleIcon from '../../assets/Fly-IQ Icons/ScheduleIcon.json'
import ShopIcon from '../../assets/Fly-IQ Icons/ShopIcon.json'
import TrainingIcon from '../../assets/Fly-IQ Icons/TrainingIcon.json'

// =================== Logo Asset Paths ===================
const flyiqLogo = '/assets/logo.png'
const nestLogo  = '/assets/paloma-favicon.png'

// =================== SplitAnimatedText Component ===================
function SplitAnimatedText({ text, hovered }) {
  return (
    <span className="inline-block">
      {[...text].map((char, i) => (
        <span
          key={i}
          className={`inline-block transition-colors duration-300 ${
            hovered ? `text-[#6a7257]` : `text-white`
          }`}
          style={{
            transitionDelay: hovered ? `${i * 35}ms` : '0ms'
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

// =================== SidebarIconContainer Component ===================
const SidebarIconContainer = ({ children }) => (
  <span
    className="sidebar-icon-container flex items-center justify-center"
    style={{
      minWidth: 47,
      width: 52,
      maxWidth: 56,
      minHeight: 56,
      height: 48,
      maxHeight: 56,
      marginRight: 0,
    }}
  >
    {children}
  </span>
);

// =================== SidebarLottieIcon Component ===================
function SidebarLottieIcon({ animationData, hovered }) {
  const lottieRef = useRef();

  React.useEffect(() => {
    if (hovered) {
      lottieRef.current && lottieRef.current.play();
    } else {
      lottieRef.current && lottieRef.current.stop();
    }
  }, [hovered]);

  return (
    <SidebarIconContainer>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
        style={{ width: 32, height: 32 }}
      />
    </SidebarIconContainer>
  );
}

// =================== SidebarFlyIQ Component ===================
export default function SidebarFlyIQ() {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  // --------- Sidebar Navigation Items ---------
  const sidebarItems = [
    {
      to: "/",
      icon: () => (
        <SidebarIconContainer>
          <img src={nestLogo} alt="The Nest" style={{ width: 32, height: 32, borderRadius: 8 }} />
        </SidebarIconContainer>
      ),
      label: "The Nest"
    },
    {
      to: "/fly-iq",
      icon: (hovered) => <SidebarLottieIcon animationData={DashboardIcon} hovered={hovered} />,
      label: "Fly-IQ Dashboard"
    },
    {
      to: "/fly-iq/schedule",
      icon: (hovered) => <SidebarLottieIcon animationData={ScheduleIcon} hovered={hovered} />,
      label: "Schedule"
    },
    {
      to: "/fly-iq/documents",
      icon: (hovered) => <SidebarLottieIcon animationData={DocumentIcon} hovered={hovered} />,
      label: "Documents"
    },
    {
      to: "/fly-iq/resources",
      icon: (hovered) => <SidebarLottieIcon animationData={ResourcesIcon} hovered={hovered} />,
      label: "Resources"
    },
    {
      to: "/fly-iq/leaderboard",
      icon: (hovered) => <SidebarLottieIcon animationData={LeaderboardIcon} hovered={hovered} />,
      label: "Leaderboard"
    },
    {
      to: "/fly-iq/shop",
      icon: (hovered) => <SidebarLottieIcon animationData={ShopIcon} hovered={hovered} />,
      label: "Paloma Shop"
    },
    {
      to: "/fly-iq/games",
      icon: (hovered) => <SidebarLottieIcon animationData={GamesIcon} hovered={hovered} />,
      label: "Games"
    },
    {
      to: "/fly-iq/expensing",
      icon: (hovered) => <SidebarLottieIcon animationData={ExpensingIcon} hovered={hovered} />,
      label: "Expensing"
    },
    {
      to: "/fly-iq/training",
      icon: (hovered) => <SidebarLottieIcon animationData={TrainingIcon} hovered={hovered} />,
      label: "Training"
    },
  ];

  // =================== Render Sidebar ===================
  return (
    <aside
      className={`
        fixed
        top-0
        left-0
        group
        bg-black/80
        backdrop-blur-lg
        border-r-2 border-[#6a7257]
        border-b-2 border-[#6a7257]
        flex flex-col
        py-10
        z-30
        gap-0
        shadow
        text-white
        font-erbaum
        transition-all duration-300 ease-in-out
        overflow-hidden
        w-14
        hover:w-[256px]
        min-w-0
        max-w-[256px]
      `}
      style={{
        height: '100vh',
        right: 'auto',
      }}
    >
      {/* --------- FLY-IQ LOGO TOP --------- */}
      <div className="flex items-center w-full justify-center ml-1 mb-0 mt-">
        <img
          src={flyiqLogo}
          alt="FLY-IQ Logo"
          className="h-11 w-auto flex-none"
          style={{ maxHeight: 52, maxWidth: 180 }}
        />
      </div>
      {/* --------- NAVIGATION BUTTONS (ORDERED) --------- */}
      {sidebarItems.map((item, idx) =>
        item.label === "The Nest" ? (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center min-h-12 px-2 w-full hover:bg-black/80 transition"
            tabIndex={-1}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {item.icon(hoveredIndex === idx)}
            <span className="ml-2 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full text-left">
              <SplitAnimatedText text={item.label} hovered={hoveredIndex === idx} />
            </span>
          </NavLink>
        ) : item.label === "Fly-IQ Dashboard" ? (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center min-h-12 px-2 w-full hover:bg-black/80 transition"
            tabIndex={-1}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {item.icon(hoveredIndex === idx)}
            <span className="ml-2 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full text-left">
              <SplitAnimatedText text={item.label} hovered={hoveredIndex === idx} />
            </span>
          </NavLink>
        ) : null
      )}
      {/* --------- GO BACK BUTTON --------- */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center min-h-12 px-2 w-full hover:bg-black/80 transition"
        tabIndex={-1}
        onMouseEnter={() => setHoveredIndex(-2)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <SidebarIconContainer>
          <FaArrowLeft size={24} className="text-[#6a7257]" />
        </SidebarIconContainer>
        <span className="ml-2 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full text-left">
          <SplitAnimatedText text="Go Back" hovered={hoveredIndex === -2} />
        </span>
      </button>
      {/* --------- REMAINING NAVIGATION BUTTONS --------- */}
      {sidebarItems
        .filter(item => !["The Nest", "Fly-IQ Dashboard"].includes(item.label))
        .map((item, idx) => (
        <NavLink
          key={item.to}
          to={item.to}
          className="flex items-center min-h-12 px-2 w-full hover:bg-black/80 transition"
          onMouseEnter={() => setHoveredIndex(idx + 2)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {item.icon(hoveredIndex === idx + 2)}
          <span className="ml-2 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full text-left text-xs">
            <SplitAnimatedText text={item.label} hovered={hoveredIndex === idx + 2} />
          </span>
        </NavLink>
      ))}
    </aside>
  )
}
