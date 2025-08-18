// src/pages/Projects.jsx

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import UniversalCard from "../templates/Cards/UniversalCard";

const camoBg = '/assets/dark-bg.jpg';

const CARD_LIST = [
  { key: "launcher", title: "Paloma Launcher", projectId: 1 },
  { key: "tubing", title: "Paloma Tubing Head", projectId: 2 },
  { key: "bev", title: "Birds-Eye-View", projectId: 3 },
  { key: "bpm", title: "Body Pressure Monitoring", projectId: 4 },
];

const API_BASE = import.meta?.env?.VITE_API_BASE || 'http://localhost:4000/api';

export default function Projects() {
  const [activeCard, setActiveCard] = useState(CARD_LIST[0].key);
  const [checklist, setChecklist] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newItem, setNewItem] = useState("");

  const activeProjectId = CARD_LIST.find(c => c.key === activeCard)?.projectId;

  // Fetch checklist & progress on project change
  useEffect(() => {
    if (!activeProjectId) return;
    fetch(`${API_BASE}/projects/${activeProjectId}/checklist`, { credentials: 'include' })
      .then(res => res.json())
      .then(setChecklist)
      .catch(console.error);

    fetch(`${API_BASE}/projects/${activeProjectId}/progress`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setProgress(data.progressPct || 0))
      .catch(console.error);
  }, [activeProjectId]);

  const handleAddChecklistItem = () => {
    if (!newItem.trim()) return;
    fetch(`${API_BASE}/projects/${activeProjectId}/checklist`, {
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
    fetch(`${API_BASE}/projects/checklist/${id}`, {
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
    fetch(`${API_BASE}/projects/checklist/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
      .then(() => {
        setChecklist(prev => prev.filter(i => i.id !== id));
      })
      .catch(console.error);
  };

  const renderActiveCard = () => {
    return (
      <div className="flex flex-col h-full w-full p-4 text-[#f3f4f1]">
        <UniversalCard title={CARD_LIST.find(c => c.key === activeCard)?.title} />

        {/* Progress */}
        <div className="mt-4">
          <div className="text-sm mb-1">Progress: {progress}%</div>
          <div className="w-full bg-[#35392e] rounded-full h-3">
            <div
              className="bg-[#6a7257] h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Checklist */}
        <div className="mt-6 flex-1 overflow-y-auto">
          <h2 className="text-lg font-bold mb-2">Checklist</h2>
          <ul className="space-y-2">
            {checklist.map(item => (
              <li key={item.id} className="flex items-center justify-between bg-[#23241f] p-2 rounded">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.is_completed}
                    onChange={() => handleToggleComplete(item.id, item.is_completed)}
                  />
                  <span className={item.is_completed ? "line-through" : ""}>{item.label}</span>
                </label>
                <button
                  className="text-red-400 hover:text-red-600"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Add checklist item */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            className="flex-1 rounded px-2 text-black"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            placeholder="New checklist item"
          />
          <button
            className="bg-[#6a7257] text-black px-3 rounded hover:bg-[#7d8b5e]"
            onClick={handleAddChecklistItem}
          >
            Add
          </button>
        </div>
      </div>
    );
  };

  const handleAddProject = () => {
    alert("Add Project button clicked!");
  };

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
      <div className="flex-1 flex flex-col items-center py-0 px-2 md:px-2">
        <div
          className="w-full max-w-full bg-black/90  shadow-2xl border-2 border-[#6a7257] flex-1"
          style={{ boxShadow: '0 8px 48px 0 #23241f99' }}
        >
          <div className="flex flex-row w-full h-full rounded-xl">
            {/* Navigation */}
            <div className="w-[270px] bg-black rounded-xl py-2 shadow-xl flex flex-col items-center px-3 mr-8 relative">
              <span className="text-[#b0b79f] font-bold text-base mb-6">Navigation</span>
              <div className="flex flex-col w-full gap-2 overflow-y-auto">
                {CARD_LIST.map(card => (
                  <button
                    key={card.key}
                    onClick={() => setActiveCard(card.key)}
                    className={`w-full py-1 px-1 rounded-md font-semibold transition-all duration-150 text-[#f3f4f1] bg-[#23241f] border-2 border-transparent hover:border-[#6a7257] hover:bg-[#35392e] text-base
                      ${activeCard === card.key ? "bg-[#6a7257] text-black border-[#6a7257]" : ""}`}
                    style={{
                      letterSpacing: 1,
                      boxShadow: activeCard === card.key ? "0 0 6px #6a7257cc" : "",
                    }}
                  >
                    {card.title}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddProject}
                className="absolute bottom-6 left-3 right-3 py-2 px-3 rounded-md font-semibold bg-[#6a7257] text-black border-2 border-[#6a7257] hover:bg-[#7d8b5e]"
              >
                + Add Project
              </button>
            </div>

            {/* Active Card */}
            <div className="flex-1 flex justify-center items-stretch rounded-xl">
              <div className="w-full h-full bg-[#181a16] shadow-2xl p-0 scale-100 rounded-2xl flex flex-col">
                {renderActiveCard()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
