// =====================================================
// FILE: src/pages/Projects.jsx
// =====================================================

// ==============================
// IMPORTS
// ==============================
import { useEffect, useMemo, useRef, useState } from "react";
import { resolveApiUrl } from "../api";
import Sidebar from "../components/Sidebar";
import UniversalCard from "../templates/Cards/UniversalCard";

// ==============================
// CONSTANTS
// ==============================
const camoBg = '/assets/dark-bg.jpg';

const CARD_LIST = [
  { key: "launcher", title: "Paloma Launcher", projectId: 1 },
  { key: "tubing", title: "Paloma Tubing Head", projectId: 2 },
  { key: "bev", title: "Birds-Eye-View", projectId: 3 },
  { key: "bpm", title: "Body Pressure Monitoring", projectId: 4 },
];


// ==============================
// COMPONENT
// ==============================
export default function Projects() {
  // ---------- State ----------
  const [activeCard, setActiveCard] = useState(CARD_LIST[0].key);
  const [checklist, setChecklist] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newItem, setNewItem] = useState("");

  // Dynamic layout: resizable left-nav width + collapsible
  const initialNav = useMemo(() => {
    const saved = Number(localStorage.getItem('projects:leftnav:w'));
    if (Number.isFinite(saved) && saved >= 220 && saved <= 420) return saved;
    return 320;
  }, []);
  const [navWidth, setNavWidth] = useState(initialNav);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(navWidth);

  const activeProjectId = CARD_LIST.find(c => c.key === activeCard)?.projectId;

  // ---------- Effects ----------
  useEffect(() => {
    if (!activeProjectId) return;
    fetch(resolveApiUrl(`/api/projects/${activeProjectId}/checklist`), { credentials: 'include' })
      .then(res => res.json())
      .then(setChecklist)
      .catch(console.error);

    fetch(resolveApiUrl(`/api/projects/${activeProjectId}/progress`), { credentials: 'include' })
      .then(res => res.json())
      .then(data => setProgress(data.progressPct || 0))
      .catch(console.error);
  }, [activeProjectId]);

  useEffect(() => {
    function onMove(e) {
      if (!dragging.current || navCollapsed) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const delta = clientX - startX.current;
      let w = Math.min(420, Math.max(220, startW.current + delta));
      setNavWidth(w);
    }
    function onUp() {
      if (!dragging.current) return;
      dragging.current = false;
      localStorage.setItem('projects:leftnav:w', String(navWidth));
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [navCollapsed, navWidth]);

  // ---------- Handlers ----------
  const handleAddChecklistItem = () => {
    if (!newItem.trim()) return;
    fetch(resolveApiUrl(`/api/projects/${activeProjectId}/checklist`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ label: newItem })
    })
      .then(res => res.json())
      .then(item => {
        setChecklist(prev => [...prev, item]);
        setNewItem("");
      })
      .catch(console.error);
  };

  const handleToggleComplete = (id, isCompleted) => {
    fetch(resolveApiUrl(`/api/projects/checklist/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isCompleted: !isCompleted })
    })
      .then(res => res.json())
      .then(updated => {
        setChecklist(prev => prev.map(i => i.id === id ? updated : i));
      })
      .catch(console.error);
  };

  const handleDeleteItem = (id) => {
    fetch(resolveApiUrl(`/api/projects/checklist/${id}`), {
      method: 'DELETE',
      credentials: 'include'
    })
      .then(() => {
        setChecklist(prev => prev.filter(i => i.id !== id));
      })
      .catch(console.error);
  };

  // ---------- Render Helpers ----------
  const renderActiveCard = () => {
    return (
      <div className="flex flex-col h-full w-full p-4 text-[#f3f4f1]">
        <UniversalCard title={CARD_LIST.find(c => c.key === activeCard)?.title} />
      </div>
    );
  };

  const handleAddProject = () => {
    alert("Add Project button clicked!");
  };

  // ---------- Render ----------
  return (
    <div
      className="min-h-screen w-full flex flex-row"
      style={{
        backgroundImage: `url(${camoBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: '#000',
      }}
    >
      <Sidebar />

      {/* ===== Style: Documents-like left nav + resizable/collapsible shell ===== */}
      <style>{`
        .projects-shell { display:flex; width:100%; height:100%; }
        .projects-leftnav {
          background: rgba(20,20,20,0.55);
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(255,255,255,0.08);
          transition: width 180ms ease, transform 180ms ease;
          overflow: hidden;
        }
        .projects-leftnav__title {
          color: #e1e5d0;
          font-size: 26px;
          font-weight: 900;
          text-align: center;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 10px 10px 6px 10px;
          border-bottom: 1px solid #6a7257;
        }
        .projects-leftnav__list {
          list-style: none;
          margin: 10px 0 0 0;
          padding: 0 6px 8px 6px;
        }
        .projects-leftnav__item {
          display: grid;
          grid-template-columns: 18px 1fr;
          align-items: center;
          padding: 6px 8px;
          margin: 2px 0;
          color: #e1e5d0;
          font-size: 12px;
          line-height: 1.15;
          letter-spacing: .04em;
          border: 1px solid transparent;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          user-select: none;
          transition: background .15s ease, border-color .15s ease, color .15s ease;
        }
        .projects-leftnav__item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.08);
        }
        .projects-leftnav__item.active {
          background: rgba(106,114,87,0.14);
          border-color: #6a7257;
          box-shadow: inset 0 0 0 1px rgba(106,114,87,0.35);
          color: #e6e8df;
        }
        .projects-leftnav__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.35);
          margin-left: 2px;
        }
        .projects-leftnav__item.active .projects-leftnav__dot { background:#6a7257; }
        .projects-leftnav__footer {
          padding: 10px;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.35);
        }
        .projects-leftnav__addbtn {
          display: inline-flex;
          width: 100%;
          justify-content: center;
          align-items: center;
          padding: 8px 10px;
          color: #e1e5d0;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: .06em;
          text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.10);
          background: transparent;
          border-radius: 8px;
          transition: background .15s ease, border-color .15s ease;
        }
        .projects-leftnav__addbtn:hover { background: rgba(255,255,255,0.04); border-color:#6a7257; }

        .projects-resizer {
          width: 8px;
          cursor: col-resize;
          background: transparent;
          position: relative;
        }
        .projects-resizer::after {
          content:'';
          position:absolute; top:0; bottom:0; left:2px; right:2px;
          border-left:1px dashed rgba(106,114,87,0.45);
          opacity:.35;
        }
        .projects-main { flex:1; display:flex; }
        .projects-toolbar {
          position:absolute; top:8px; right:12px; z-index:3;
          display:flex; gap:6px;
        }
        .projects-btn {
          padding:4px 8px; font-size:11px; letter-spacing:.08em; text-transform:uppercase;
          border:1px solid #6a7257; background:#0c0d0b; color:#e6e8df; border-radius:6px;
        }
        @media (max-width: 1024px) {
          .projects-leftnav { transform: translateX(-100%); }
          .projects-leftnav.open { transform: translateX(0); }
          .projects-resizer { display:none; }
        }
      `}</style>

      <div className="flex-1 flex flex-col items-center py-0 px-2 md:px-2">
        <div
          className="w-full max-w-full bg-black/90 shadow-2xl border-2 border-[#6a7257] flex-1 relative"
          style={{ boxShadow: '0 8px 48px 0 #23241f99' }}
        >
          <div className="projects-shell rounded-xl">
            {/* Navigation (Documents-style, resizable/collapsible) */}
            <aside
              className={`projects-leftnav ${!navCollapsed ? '' : 'open'}`}
              style={{ width: navCollapsed ? 0 : navWidth }}
            >
              <div className="projects-leftnav__title">Navigation</div>

              <ul className="projects-leftnav__list flex-1 overflow-y-auto">
                {CARD_LIST.map(card => {
                  const active = activeCard === card.key;
                  return (
                    <li
                      key={card.key}
                      className={`projects-leftnav__item ${active ? 'active' : ''}`}
                      onClick={() => setActiveCard(card.key)}
                      title={card.title}
                    >
                      <span className="projects-leftnav__dot" />
                      <span className="truncate">{card.title}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="projects-leftnav__footer">
                <button onClick={handleAddProject} className="projects-leftnav__addbtn">+ Add Project</button>
              </div>
            </aside>

            {/* Drag handle */}
            {!navCollapsed && (
              <div
                className="projects-resizer"
                onMouseDown={(e) => {
                  dragging.current = true;
                  startX.current = e.clientX;
                  startW.current = navWidth;
                  document.body.style.cursor = 'col-resize';
                  document.body.style.userSelect = 'none';
                }}
                onTouchStart={(e) => {
                  dragging.current = true;
                  startX.current = e.touches[0].clientX;
                  startW.current = navWidth;
                }}
              />
            )}

            {/* Right/Main */}
            <div className="projects-main">
              <div className="projects-toolbar">
                <button
                  className="projects-btn"
                  onClick={() => setNavCollapsed(v => {
                    const next = !v;
                    // when expanding, restore saved width
                    if (!next) setNavWidth(Number(localStorage.getItem('projects:leftnav:w')) || 320);
                    return next;
                  })}
                >
                  {navCollapsed ? 'Show Nav' : 'Hide Nav'}
                </button>
              </div>

              <div className="flex-1 flex justify-center items-stretch rounded-xl">
                <div className="w-full h-full bg-[#181a16] shadow-2xl p-0 scale-100 rounded-2xl flex flex-col">
                  {renderActiveCard()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}
