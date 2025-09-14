// ==============================
// FILE: client/src/pages/DiscordHub.jsx
// Sections: Imports • Local State • Sidebar + Pushed Layout • Header (with Icon) • Tabs • Active Tab Switch
// ==============================

import Lottie from 'lottie-react';
import { useEffect, useRef, useState } from 'react';
import DiscordIcon from '../assets/Fly-HQ Icons/DiscordIcon.json';
import Sidebar from '../components/Sidebar';

import AnnouncementsTab from '../components/Discord Hub Components/AnnouncementsTab';
import CustomCommandsTab from '../components/Discord Hub Components/CustomCommandsTab';
import RemindersTab from '../components/Discord Hub Components/RemindersTab';
import ScheduledPostsTab from '../components/Discord Hub Components/ScheduledPostsTab';
import WelcomeMessagesTab from '../components/Discord Hub Components/WelcomeMessagesTab';

// ==============================
// TAB DEFINITIONS
// ==============================
const tabDefs = [
  { key: 'announcements', label: 'Announcements', Component: AnnouncementsTab },
  { key: 'reminders', label: 'Reminders', Component: RemindersTab },
  { key: 'scheduled-posts', label: 'Scheduled Posts', Component: ScheduledPostsTab },
  { key: 'custom-commands', label: 'Custom Commands', Component: CustomCommandsTab },
  { key: 'welcome-messages', label: 'Welcome Messages', Component: WelcomeMessagesTab }
];

// ==============================
// DiscordHub — Page With Tabs
// ==============================
export default function DiscordHub() {
  const [expanded, setExpanded] = useState(false);
  const [activeKey, setActiveKey] = useState(tabDefs[0].key);
  const lottieRef = useRef();

  useEffect(() => {
    lottieRef.current?.play();
  }, []);

  const basePad = 56;
  const openPad = 256;
  const ActiveComponent = tabDefs.find(t => t.key === activeKey)?.Component ?? AnnouncementsTab;

  return (
    <div className='w-screen h-screen overflow-hidden bg-transparent'>
      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{ position: 'relative', zIndex: 30 }}
      >
        <Sidebar />
      </div>

      <main
        className='transition-all duration-300 ease-in-out relative'
        style={{ paddingLeft: expanded ? openPad : basePad, minHeight: '100vh', width: '100%' }}
      >
        <div className='px-6 pt-6 pb-5 border-b border-[#6a7257]/60 bg-black/30 backdrop-blur-sm sticky top-0 z-10'>
          <div className='flex items-center gap-3 mb-3'>
            <Lottie
              lottieRef={lottieRef}
              animationData={DiscordIcon}
              loop={false}
              autoplay={false}
              style={{ width: 48, height: 48 }}
            />
            <div>
              <h1
                className='text-4xl tracking-wide text-white uppercase font-bold'
                style={{ fontFamily: 'Punoer, sans-serif' }}
              >
                DISCORD HUB
              </h1>
            </div>
          </div>

          <div className='flex gap-4 overflow-x-auto pb-1'>
            {tabDefs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveKey(tab.key)}
                className={`px-4 py-2 rounded-t-md text-sm uppercase tracking-wide transition-colors font-bold`}
                style={{
                  fontFamily: 'Punoer, sans-serif',
                  backgroundColor: activeKey === tab.key ? '#6a7257' : 'rgba(0,0,0,0.4)',
                  color: activeKey === tab.key ? '#000000' : 'rgba(255,255,255,0.7)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className='p-6'>
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}
