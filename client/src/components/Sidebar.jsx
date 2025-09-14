// ==============================
// Sidebar.jsx — Fly-HQ Sidebar (Paloma Logo Top • Discord User Footer w/o Logout)
// Sections: Imports • Animated Text • Icon Containers • Lottie Icon • Image Icon • Auth/User Utils • Sidebar Items • Animated Paloma Logo (SidebarTopBrand) • Component • Styles
// ==============================

import Lottie from 'lottie-react';
import { useEffect, useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import AssetManagementIcon from '../assets/Fly-HQ Icons/AssetManagementIcon.json';
import CustomersIcon from '../assets/Fly-HQ Icons/CustomersIcon.json';
import DashboardIcon from '../assets/Fly-HQ Icons/DashboardIcon.json';
import DiscordIcon from '../assets/Fly-HQ Icons/DiscordIcon.json';
import DocumentHubIcon from '../assets/Fly-HQ Icons/Documenthubicon.json';
import FieldSupeIcon from '../assets/Fly-HQ Icons/FieldSupeIcon.json';
import JobMapIcon from '../assets/Fly-HQ Icons/JobMapIcon.json';
import JobPlannerIcon from '../assets/Fly-HQ Icons/JobPlannerIcon.json';
import OverwatchIcon from '../assets/Fly-HQ Icons/OverwatchIcon.json';
import ProjectsIcon from '../assets/Fly-HQ Icons/ProjectsIcon.json';
import SafetyIcon from '../assets/Fly-HQ Icons/SafetyIcon.json';
import SourcingIcon from '../assets/Fly-HQ Icons/SourcingIcon.json';
import TrainingIcon from '../assets/Fly-HQ Icons/TrainingIcon.json';
import WorkorderHubIcon from '../assets/Fly-HQ Icons/WorkorderHubIcon.json';

// ==============================
// ASSETS
// ==============================
const palomaLogo = '/assets/Paloma_Logo_White_Rounded.png';
const nestLogo  = '/assets/paloma-favicon.png';
const mfvIconPng = '/assets/mfv-icon.png';

// ==============================
// SplitAnimatedText — Staggered Character Reveal
// ==============================
function SplitAnimatedText({ text, hovered }) {
  return (
    <span className='inline-block'>
      {[...text].map((char, i) => (
        <span
          key={i}
          className={`inline-block transition-colors duration-300 ${hovered ? 'text-[#6a7257]' : 'text-white'}`}
          style={{ transitionDelay: hovered ? `${i * 35}ms` : '0ms' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

// ==============================
// SidebarIconContainer — Fixed Icon Box
// ==============================
const SidebarIconContainer = ({ children }) => (
  <span
    className='sidebar-icon-container flex items-center justify-center'
    style={{
      minWidth: 52,
      width: 52,
      maxWidth: 56,
      minHeight: 28,
      height: 28,
      maxHeight: 28,
      marginRight: 0
    }}
  >
    {children}
  </span>
);

// ==============================
// SidebarLottieIcon — Hover-Play Lottie Wrapper
// ==============================
function SidebarLottieIcon({ animationData, hovered }) {
  const lottieRef = useRef();
  useEffect(() => { hovered ? lottieRef.current?.play() : lottieRef.current?.stop(); }, [hovered]);
  return (
    <SidebarIconContainer>
      <Lottie lottieRef={lottieRef} animationData={animationData} loop={false} autoplay={false} style={{ width: 28, height: 28 }} />
    </SidebarIconContainer>
  );
}

// ==============================
// SidebarImageIcon — Static Image Icon Wrapper
// ==============================
function SidebarImageIcon({ src, alt = '' }) {
  return (
    <SidebarIconContainer>
      <img src={src} alt={alt} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
    </SidebarIconContainer>
  );
}

// ==============================
// AUTH / USER UTILS
// ==============================
function useDiscordUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const stored = localStorage.getItem('flyiq_user');
    if (stored) { try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('flyiq_user'); } }
  }, []);
  return user;
}
function getAvatarUrl(user) {
  if (!user) return 'https://cdn.discordapp.com/embed/avatars/0.png';
  if (user.avatar?.startsWith('http')) return user.avatar;
  if (!user.avatar) {
    const idx = parseInt(user.discriminator || '0', 10) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`;
}

// ==============================
// Sidebar Items (Alphabetized in UI)
// ==============================
const baseItems = [
  { to: '/interactive-training', icon: TrainingIcon,     label: 'Int Training', type: 'lottie' },
  { to: '/job-planner',          icon: JobPlannerIcon,   label: 'Job Planner',          type: 'lottie' },
  { to: '/fly-hq',               icon: AssetManagementIcon, label: 'Asset Manager',     type: 'lottie' },
  { to: '/workorder-hub',        icon: WorkorderHubIcon, label: 'Workorders',           type: 'lottie' },
  { to: '/sourcing',             icon: SourcingIcon,     label: 'Sourcing',             type: 'lottie' },
  { to: '/documentation',        icon: DocumentHubIcon,  label: 'Documentation',        type: 'lottie' },
  { to: '/job-map',              icon: JobMapIcon,       label: 'Job Map',              type: 'lottie' },
  { to: '/projects',             icon: ProjectsIcon,     label: 'Projects',             type: 'lottie' },
  { to: '/safety',               icon: SafetyIcon,       label: 'Safety',               type: 'lottie' },
  { to: '/service-equipment',    icon: FieldSupeIcon,    label: 'Service Equipment',    type: 'lottie' },
  { to: '/pad-overwatch',        icon: OverwatchIcon,    label: 'Pad Overwatch',        type: 'lottie' },
  { to: '/training-hub',         icon: TrainingIcon,     label: 'Training',             type: 'lottie' },
  { to: '/customer-hub',         icon: CustomersIcon,    label: 'Customer',             type: 'lottie' },
  { to: '/discord-hub',          icon: DiscordIcon,      label: 'Discord Hub',          type: 'lottie' },
  { to: '/fly-hq/mfv',           icon: mfvIconPng,       label: 'MFV Info Hub',         type: 'image' }
];
const dashboardItem = { to: '/fly-hq-tools', icon: DashboardIcon, label: 'Fly HQ Dashboard' };

// ==============================
// Animated Paloma Logo (SidebarTopBrand) — Orbit • Radiate • Breathe (Very Slow)
// ==============================
function SidebarTopBrand() {
  useEffect(() => {
    const id = '__paloma_sidebar_anim__';
    if (typeof document !== 'undefined' && !document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        @keyframes paloma-breathe {
          0%,100% { transform: scale(1); filter: drop-shadow(0 2px 5px rgba(106,114,87,0.12)); }
          50%     { transform: scale(1.03); filter: drop-shadow(0 3px 8px rgba(106,114,87,0.25)); }
        }
        @keyframes paloma-orbit {
          0%   { transform: rotate(0deg); opacity:.85; }
          50%  { transform: rotate(180deg); opacity:.55; }
          100% { transform: rotate(360deg); opacity:.85; }
        }
        @keyframes paloma-radiate {
          0%   { box-shadow: 0 0 0 0 rgba(106,114,87,0.2), inset 0 0 0 0 rgba(106,114,87,0.05); }
          70%  { box-shadow: 0 0 0 12px rgba(106,114,87,0), inset 0 0 0 5px rgba(106,114,87,0.04); }
          100% { box-shadow: 0 0 0 0 rgba(106,114,87,0), inset 0 0 0 0 rgba(106,114,87,0.04); }
        }
        .paloma-anim {
          position: relative;
          display: inline-grid;
          place-items: center;
          border-radius: 50%;
          padding: 2px;
          background: radial-gradient(70px 70px at 40% 30%, rgba(106,114,87,0.10), transparent 60%);
          animation: paloma-radiate 14s ease-out infinite;
        }
        .paloma-anim::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1px solid rgba(106,114,87,0.20);
          border-top-color: rgba(106,114,87,0.45);
          animation: paloma-orbit 25s linear infinite;
        }
        .paloma-anim::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px dashed rgba(106,114,87,0.25);
          transform: scale(.8);
          animation: paloma-orbit 35s linear infinite reverse;
          opacity: .65;
        }
        .paloma-anim img {
          display:block;
          height:auto;
          animation: paloma-breathe 12s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className='flex items-center w-full justify-center py-2'>
      <div className='paloma-anim'>
        <img
          src={palomaLogo}
          alt='Paloma'
          className='h-6 w-auto flex-none'
          style={{ maxHeight: 34, maxWidth: 100, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.25))' }}
        />
      </div>
    </div>
  );
}

// ==============================
// Sidebar — Main Component
// ==============================
export default function Sidebar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const user = useDiscordUser();

  const sortedSidebarItems = [...baseItems].sort((a, b) => a.label.localeCompare(b.label));
  const ROW = 'flex items-center h-11 px-0 w-full transition leading-none';
  const LABEL = 'ml-0 text-white text-sm border-b border-[#6a7257] uppercase font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full text-left';

  return (
    <aside
      className={`
        app-sidebar
        fixed top-0 left-0 group
        bg-black/40 backdrop-blur-sm
        border-r-2 border-[#6a7257]
        flex flex-col z-30 shadow text-white font-erbaum
        transition-all duration-300 ease-in-out overflow-hidden
        w-14 hover:w-[256px] min-w-0 max-w-[256px]
      `}
      style={{ height: '100vh' }}
    >
      {/* ================= Top: Paloma Logo (Animated) ================= */}
      <SidebarTopBrand />

      {/* ================= Brand Home Link ================= */}
      <NavLink
        to='/'
        className={ROW}
        tabIndex={-1}
        onMouseEnter={() => setHoveredIndex(-1)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <SidebarIconContainer>
          <img src={nestLogo} alt='The NEST' style={{ width: 28, height: 28 }} />
        </SidebarIconContainer>
        <span className={LABEL}>
          <SplitAnimatedText text='The NEST' hovered={hoveredIndex === -1} />
        </span>
      </NavLink>

      {/* ================= Dashboard Shortcut ================= */}
      <NavLink
        to={dashboardItem.to}
        className={ROW}
        tabIndex={-1}
        onMouseEnter={() => setHoveredIndex(-100)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <SidebarLottieIcon animationData={dashboardItem.icon} hovered={hoveredIndex === -100} />
        <span className={LABEL}>
          <SplitAnimatedText text={dashboardItem.label} hovered={hoveredIndex === -100} />
        </span>
      </NavLink>

      {/* ================= Back Button ================= */}
      <button
        onClick={() => navigate(-1)}
        className={`${ROW} appearance-none bg-transparent p-0 border-0 focus:outline-none`}
        tabIndex={-1}
        onMouseEnter={() => setHoveredIndex(-2)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <SidebarIconContainer>
          <FaArrowLeft size={28} className='text-[#6a7257]' />
        </SidebarIconContainer>
        <span className={LABEL}>
          <SplitAnimatedText text='Go Back' hovered={hoveredIndex === -2} />
        </span>
      </button>

      {/* ================= Main Nav (Alphabetized) ================= */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden'>
        {sortedSidebarItems.map((item, idx) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={ROW}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {item.type === 'image' ? (
              <SidebarImageIcon src={item.icon} alt={item.label} />
            ) : (
              <SidebarLottieIcon animationData={item.icon} hovered={hoveredIndex === idx} />
            )}
            <span className={`${LABEL}`}>
              <SplitAnimatedText text={item.label} hovered={hoveredIndex === idx} />
            </span>
          </NavLink>
        ))}
      </div>

      {/* ================= Bottom: User Only ================= */}
      <div className='px-2 py-3 border-t border-[#6a7257]/60 bg-transparent backdrop-blur-sm'>
        <div className='flex items-center'>
          <img
            src={getAvatarUrl(user)}
            alt='Discord Avatar'
            className='w-7 h-7 rounded-full border border-[#6a7257] object-cover'
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
          />
          <span className='ml-2 uppercase text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
            {user?.username || ''}
          </span>
        </div>
      </div>
    </aside>
  );
}
