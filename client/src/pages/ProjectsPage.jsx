import React from "react";
import PalomaLauncherCard from "./cards/PalomaLauncherCard";
import PalomaTubingHeadCard from "./cards/PalomaTubingHeadCard";
import ProjectCard3 from "./cards/ProjectCard3";
import BodyPressureMonitoringCard from "./cards/BodyPressureMonitoringCard";
import ProjectCard5 from "./cards/ProjectCard5";
import ProjectCard6 from "./cards/ProjectCard6";

const ProjectsPage = () => {
  return (
    <div className="min-h-screen bg-[#23241f] py-8 px-6 flex flex-col items-center justify-start">
      <div className="w-full max-w-7xl">
        <h1 className="text-3xl font-bold tracking-wide text-[#FAF5E6] mb-10 flex items-center justify-center">
          PROJECTS HUB
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Card 1: Paloma Launcher */}
          <PalomaLauncherCard />
          {/* Card 2: Paloma Tubing Head */}
          <PalomaTubingHeadCard />
          {/* Card 3: Generic/Customizable */}
          <ProjectCard3 />
          {/* Card 4: Body Pressure Monitoring */}
          <BodyPressureMonitoringCard />
          {/* Card 5: Placeholder for another project */}
          <ProjectCard5 />
          {/* Card 6: Placeholder for another project */}
          <ProjectCard6 />
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
