// src/components/ToolCardCarousel.jsx
import React, { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Mousewheel, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

import Lottie from "lottie-react"

// Icons placeholder structure (swap these later)
import AnalyticsIcon from '../assets/Fly-HQ Icons/AnalyticsIcon.json'
import AssetManagementIcon from '../assets/Fly-HQ Icons/AssetManagementIcon.json'
import JobMapIcon from '../assets/Fly-HQ Icons/JobMapIcon.json'
import JobPlannerIcon from '../assets/Fly-HQ Icons/JobPlannerIcon.json'
import ProjectsIcon from '../assets/Fly-HQ Icons/ProjectsIcon.json'
import SafetyIcon from '../assets/Fly-HQ Icons/SafetyIcon.json'
import SourcingIcon from '../assets/Fly-HQ Icons/SourcingIcon.json'
import WorkorderHubIcon from '../assets/Fly-HQ Icons/WorkorderHubIcon.json'
import FieldSupeIcon from '../assets/Fly-HQ Icons/FieldSupeIcon.json'

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
}

export default function ToolCardCarousel({ tools = [], onClick }) {
  const lottieRefs = useRef([]);
  if (lottieRefs.current.length !== tools.length) {
    lottieRefs.current = tools.map((_, i) => lottieRefs.current[i] || React.createRef());
  }

  return (
    <div className="w-full flex justify-center mt-32 mb-2">
      <div className="w-full max-w-screen-2xl px-2" style={{ minHeight: 160 }}>
        <Swiper
          modules={[Navigation, Mousewheel, FreeMode]}
          freeMode={true}
          freeModeMomentum={false}
          direction="horizontal"
          spaceBetween={40}
          slidesPerView={4}
          loop={true}
          loopedSlides={tools.length}
          mousewheel={{ forceToAxis: true }}
          navigation
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          style={{
            '--swiper-navigation-color': '#6a7257',
            '--swiper-navigation-size': '32px',
            overflow: 'visible',
            height: 160,
            minHeight: 160,
            cursor: 'grab',
          }}
          className="relative overflow-visible"
        >
          {tools.map((tool, idx) => (
            <SwiperSlide key={tool.key + '-' + idx} className="overflow-visible relative group hover:z-50">
              <div
                onClick={() => onClick(tool.route)}
                onMouseEnter={() => lottieRefs.current[idx]?.current?.play?.()}
                onMouseLeave={() => lottieRefs.current[idx]?.current?.stop?.()}
                className="relative rounded-2xl bg-[#111] border-2 border-white shadow-xl transition-transform duration-300 ease-out hover:scale-[1.05] hover:shadow-[0_10px_20px_rgba(106,114,87,0.3)] overflow-visible flex flex-col items-center min-h-[140px] max-w-[340px] mx-auto"
              >
                {/* Top Tab */}
                <div className="w-full flex items-center uppercase font-bold justify-center rounded-t-2xl bg-black border-b border-white py-1">
                  <h2 className="text-lg text-[#6a7257] tracking-wide text-center w-full font-erbaum">{tool.title}</h2>
                </div>

                {/* Icon Circle */}
                <div className="flex-1 flex flex-col items-center justify-center mt-1 mb-1">
                  <div className="w-11 h-11 rounded-full bg-[#23251d] border-2 border-[#6a7257] flex items-center justify-center shadow-md mb-1 mt-1">
                    <Lottie
                      lottieRef={lottieRefs.current[idx]}
                      animationData={ICONS[tool.key]}
                      loop={false}
                      autoplay={false}
                      style={{ width: 30, height: 30 }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="w-full px-2 pb-1 flex items-end justify-center">
                  <p className="text-[#e6e8df] text-xs uppercase text-center leading-tight font-erbaum tracking-wider">
                    {tool.description}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}
