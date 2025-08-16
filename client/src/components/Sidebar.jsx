import Lottie from "lottie-react"
import React, { useRef } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import AnalyticsIcon from "../assets/Fly-HQ Icons/AnalyticsIcon.json"
import AssetManagementIcon from "../assets/Fly-HQ Icons/AssetManagementIcon.json"
import DashboardIcon from "../assets/Fly-HQ Icons/DashboardIcon.json"
import FieldSupeIcon from "../assets/Fly-HQ Icons/FieldSupeIcon.json"
import JobMapIcon from "../assets/Fly-HQ Icons/JobMapIcon.json"
import JobPlannerIcon from "../assets/Fly-HQ Icons/JobPlannerIcon.json"
import OverwatchIcon from "../assets/Fly-HQ Icons/OverwatchIcon.json"
import ProjectsIcon from "../assets/Fly-HQ Icons/ProjectsIcon.json"
import SafetyIcon from "../assets/Fly-HQ Icons/SafetyIcon.json"
import SourcingIcon from "../assets/Fly-HQ Icons/SourcingIcon.json"
import TrainingIcon from "../assets/Fly-HQ Icons/TrainingIcon.json"
import WorkorderHubIcon from "../assets/Fly-HQ Icons/WorkorderHubIcon.json"
// --------- ADD: Customer Hub Icon ---------
import CustomersIcon from "../assets/Fly-HQ Icons/CustomersIcon.json"

const flyhqLogo = '/assets/flyhq-logo.png'
const nestLogo  = '/assets/paloma-favicon.png'
const mfvIcon2  = '/assets/mfv-icon.png'

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

export default function Sidebar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  // --- MAIN SIDEBAR ITEMS (rest of menu) ---
  const sidebarItems = [
    {
      to: "/job-planner",
      icon: (hovered) => <SidebarLottieIcon animationData={JobPlannerIcon} hovered={hovered} />,
      label: "Job Planner"
    },
    {
      to: "/fly-hq",
      icon: (hovered) => <SidebarLottieIcon animationData={AssetManagementIcon} hovered={hovered} />,
      label: "Asset Manager"
    },
    {
      to: "/workorder-hub",
      icon: (hovered) => <SidebarLottieIcon animationData={WorkorderHubIcon} hovered={hovered} />,
      label: "Workorder Hub"
    },
    {
      to: "/sourcing",
      icon: (hovered) => <SidebarLottieIcon animationData={SourcingIcon} hovered={hovered} />,
      label: "Sourcing"
    },
    {
      to: "/analytics",
      icon: (hovered) => <SidebarLottieIcon animationData={AnalyticsIcon} hovered={hovered} />,
      label: "Analytics"
    },
    {
      to: "/fly-hq/mfv",
      icon: () => (
        <SidebarIconContainer>
          <img src={mfvIcon2} alt="MFV Info Hub" style={{ width: 32, height: 22 }} />
        </SidebarIconContainer>
      ),
      label: "MFV Info Hub"
    },
    {
      to: "/job-map",
      icon: (hovered) => <SidebarLottieIcon animationData={JobMapIcon} hovered={hovered} />,
      label: "Job Map"
    },
    {
      to: "/projects",
      icon: (hovered) => <SidebarLottieIcon animationData={ProjectsIcon} hovered={hovered} />,
      label: "Projects"
    },
    {
      to: "/safety",
      icon: (hovered) => <SidebarLottieIcon animationData={SafetyIcon} hovered={hovered} />,
      label: "Safety"
    },
    {
      to: "/superintendant-hub",
      icon: (hovered) => <SidebarLottieIcon animationData={FieldSupeIcon} hovered={hovered} />,
      label: "Superintendants"
    },
    {
      to: "/pad-overwatch",
      icon: (hovered) => <SidebarLottieIcon animationData={OverwatchIcon} hovered={hovered} />,
      label: "Pad Overwatch"
    },
    {
      to: "/training-hub",
      icon: (hovered) => <SidebarLottieIcon animationData={TrainingIcon} hovered={hovered} />,
      label: "Training Hub"
    },
    // --------- ADD: Customer Hub Sidebar Item ---------
    {
      to: "/customer-hub",
      icon: (hovered) => <SidebarLottieIcon animationData={CustomersIcon} hovered={hovered} />,
      label: "Customer Hub"
    }
  ];

  const flyHQDashboardItem = {
    to: "/fly-hq-tools",
    icon: (hovered) => <SidebarLottieIcon animationData={DashboardIcon} hovered={hovered} />,
    label: "Fly HQ Dashboard"
  };

  const sortedSidebarItems = [...sidebarItems].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <aside
      className={`
        fixed
        top-0
        left-0
        group
        bg-black/40
        backdrop-blur-sm
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
      <div className="flex items-center w-full justify-center ml-1 mb-0 mt-">
        <img
          src={flyhqLogo}
          alt="FLY-HQ Logo"
          className="h-11 w-auto flex-none"
          style={{ maxHeight: 52, maxWidth: 180 }}
        />
      </div>
      <NavLink
        to="/"
        className="flex items-center min-h-12 px-2 w-full  mt- transition"
        tabIndex={-1}
        onMouseEnter={() => setHoveredIndex(-1)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <SidebarIconContainer>
          <img src={nestLogo} alt="The NEST" style={{ width: 32, height: 32 }} />
        </SidebarIconContainer>
        <span className="ml-2 text-white text-sm border-b border-[#6a7257] uppercase font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full text-left">
          <SplitAnimatedText text="The NEST" hovered={hoveredIndex === -1} />
        </span>
      </NavLink>
      <NavLink
        to={flyHQDashboardItem.to}
        className="flex items-center min-h-12 px-2 w-full  transition"
        tabIndex={-1}
        onMouseEnter={() => setHoveredIndex(-100)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {flyHQDashboardItem.icon(hoveredIndex === -100)}
        <span className="ml-2 text-white text-sm border-b border-[#6a7257] uppercase font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full text-left">
          <SplitAnimatedText text={flyHQDashboardItem.label} hovered={hoveredIndex === -100} />
        </span>
      </NavLink>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center min-h-12 px-2 w-full  transition"
        tabIndex={-1}
        onMouseEnter={() => setHoveredIndex(-2)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <SidebarIconContainer>
          <FaArrowLeft size={24} className="text-[#6a7257]" />
        </SidebarIconContainer>
        <span className="ml-2 text-white text-sm border-b border-[#6a7257] uppercase font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full text-left">
          <SplitAnimatedText text="Go Back" hovered={hoveredIndex === -2} />
        </span>
      </button>
      {sortedSidebarItems.map((item, idx) => (
        <NavLink
          key={item.to}
          to={item.to}
          className="flex items-center min-h-12 px-2 w-full  transition"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {item.icon(typeof item.icon === "function" ? hoveredIndex === idx : undefined)}
          <span className="ml-2 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 border-b border-[#6a7257] uppercase transition-opacity duration-300 w-full text-left text-sm">
            <SplitAnimatedText text={item.label} hovered={hoveredIndex === idx} />
          </span>
        </NavLink>
      ))}
    </aside>
  )
}
