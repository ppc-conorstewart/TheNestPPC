import { useRef, useState } from "react";
import { useJobContext } from '../../../context/JobContext';


import EquipmentListModal from "./Job Update Components/EquipmentListModal";
import ImageUploadRow from "./Job Update Components/ImageUploadRow";
import JobSelector from "./Job Update Components/JobSelector";
import JobUpdateForm from "./Job Update Components/JobUpdateForm";
import ValvePanel from "./Job Update Components/ValvePanel";

const EMPTY_VALVES = [];

export default function JobUpdate({ open, onClose, onSubmit }) {
  const fileInputRef = useRef(null);

  const { setActiveJobById } = useJobContext(); // <--- ADD THIS LINE

  const [form, setForm] = useState({
    operationalState: "",
    wsm1: "",
    wsm2: "",
    wsm3: "",
    stars: "",
    incident: "",
    hazardIds: "",
    observations: "",
    fracsOpened: "",
    totalZones: "",
    aZone: "",
    bZone: "",
    cZone: "",
    dZone: "",
    eZone: "",
    equipmentRequired: "",
    equipmentQty: "",
    operationalNotes: "",
    palomaNotes: "",
    crossShiftNotes: "",
    images: []
  });

  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showEquipList, setShowEquipList] = useState(false);

  const [jobValvesMap, setJobValvesMap] = useState({});

  const currentValves = selectedJobId && jobValvesMap[selectedJobId] ? jobValvesMap[selectedJobId] : EMPTY_VALVES;

  function handleValvePsiChange(idx, value) {
    if (!selectedJobId) return;
    setJobValvesMap(prev => {
      const jobVals = prev[selectedJobId] ? [...prev[selectedJobId]] : [];
      if (jobVals[idx]) {
        jobVals[idx] = { ...jobVals[idx], psi: value };
      }
      return { ...prev, [selectedJobId]: jobVals };
    });
  }

  function handleDefineValves(valveDefs) {
    if (!selectedJobId) return;
    setJobValvesMap(prev => ({
      ...prev,
      [selectedJobId]: valveDefs
    }));
  }

  // ============ CRITICAL CHANGE ===============
  function handleJobChange(id, jobObj, jobs) {
    setSelectedJobId(id);
    setSelectedJob(jobObj);
    setActiveJobById(id); // <--- This will sync context!
  }
  // ============================================

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    setForm(f => ({
      ...f,
      images: [...f.images, ...files]
    }));
  }

  function removeImage(idx) {
    setForm(f => ({
      ...f,
      images: f.images.filter((_, i) => i !== idx)
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (onSubmit) onSubmit({ ...form, valves: currentValves, selectedJob });
    onClose();
    setForm({
      operationalState: "",
      wsm1: "",
      wsm2: "",
      wsm3: "",
      stars: "",
      incident: "",
      hazardIds: "",
      observations: "",
      fracsOpened: "",
      totalZones: "",
      aZone: "",
      bZone: "",
      cZone: "",
      dZone: "",
      eZone: "",
      equipmentRequired: "",
      equipmentQty: "",
      operationalNotes: "",
      palomaNotes: "",
      crossShiftNotes: "",
      images: []
    });
    setSelectedJobId('');
    setSelectedJob(null);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.83)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)"
      }}
    >
      <EquipmentListModal
        open={showEquipList}
        onClose={() => setShowEquipList(false)}
        equipmentList={[]}
      />

      <button
        type="button"
        onClick={onClose}
        className="text-[#c3c3c3] hover:text-[#fff] text-3xl font-bold focus:outline-none z-40"
        style={{
          position: "absolute",
          top: 18,
          right: 24,
          background: "none",
          border: "none",
          cursor: "pointer",
          lineHeight: "30px"
        }}
      >
        ×
      </button>

      <div
        className="bg-[#181b17] border-2 border-[#6a7257] shadow-2xl w-full flex flex-row relative"
        style={{
          boxShadow: "0 10px 60px 6px #23281c99",
          color: "#e6e8df",
          maxWidth: "1540px",
          minWidth: "1340px",
          maxHeight: "94vh",
          minHeight: "600px",
          boxSizing: "border-box",
          overflow: "hidden",
          alignItems: "stretch",
          borderRadius: "30px",
          borderBottomRightRadius: 0
        }}
      >
        {/* LEFT PANEL */}
        <div className="flex-1 flex flex-col" style={{ minWidth: 0, height: "100%", minHeight: 0 }}>
          <div
            className="w-full relative flex flex-row items-center px-6 pt-5 pb-3"
            style={{
              borderTopLeftRadius: '15px',
              borderTopRightRadius: '15px',
              minHeight: 52,
              boxSizing: "border-box"
            }}
          >
            <img
              src="/assets/whitelogo.png"
              alt="Paloma Logo"
              style={{ height: 34, width: "auto", marginRight: 18, marginTop: -3, filter: "drop-shadow(0 1px 4px #23281c)" }}
            />
            <div style={{
              position: "absolute",
              left: 0, right: 0,
              top: 0, bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none"
            }}>
              <h2 className="text-xl font-bold text-white tracking-wide mb-0" style={{ lineHeight: "32px", pointerEvents: "none" }}>
                Job Update
              </h2>
            </div>
            <div style={{ flex: 1 }} />
          </div>
          <JobSelector
            selectedJobId={selectedJobId}
            setSelectedJobId={handleJobChange}
          />
          <JobUpdateForm
            form={form}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            showEquipList={() => setShowEquipList(true)}
            selectedJob={selectedJob}
          />
          <ImageUploadRow
            form={form}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            removeImage={removeImage}
            handleSubmit={handleSubmit}
          />
        </div>
        {/* RIGHT PANEL */}
        <div
          style={{
            width: "600px",
            minWidth: "480px",
            maxWidth: "650px",
            height: "800px",
            minHeight: 0,
            alignSelf: "stretch",
            background: "#000",
            borderLeft: "2px solid #6a7257",
            borderTopRightRadius: "30px",
            borderBottomRightRadius: "30px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <ValvePanel
            mode={currentValves.length === 0 ? "define" : "input"}
            valves={currentValves}
            onPsiChange={handleValvePsiChange}
            onDefine={handleDefineValves}
            form={form}
            handleChange={handleChange}
            showEquipList={() => setShowEquipList(true)}
          />
        </div>
      </div>
    </div>
  );
}
