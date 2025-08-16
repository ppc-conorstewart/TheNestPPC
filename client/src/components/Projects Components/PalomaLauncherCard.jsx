import React, { useState, useRef } from "react";
import {
  FaRocket, FaPlus, FaTrash, FaCheck, FaRegFileAlt, FaImage, FaChartBar, FaMoneyBillWave, FaChevronLeft, FaChevronRight, FaDownload
} from "react-icons/fa";

const PalomaLauncherCard = () => {
  // Checklist state
  const [checklist, setChecklist] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  // Carousel images state
  const [carousel, setCarousel] = useState([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const imageInputRef = useRef();

  // Documents state
  const [documents, setDocuments] = useState([]);
  const docInputRef = useRef();

  // Progress from checklist
  const percent =
    checklist.length === 0
      ? 0
      : Math.round(
          (checklist.filter((x) => x.done).length / checklist.length) * 100
        );

  // Checklist handlers
  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist([
        ...checklist,
        { label: newChecklistItem, done: false }
      ]);
      setNewChecklistItem("");
    }
  };

  const handleDeleteChecklistItem = (idx) => {
    setChecklist(checklist.filter((_, i) => i !== idx));
  };

  const handleToggleChecklistItem = (idx) => {
    setChecklist(list =>
      list.map((item, i) =>
        i === idx ? { ...item, done: !item.done } : item
      )
    );
  };

  // Carousel handlers
  const handleAddImage = (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const newImgs = [];
    for (let file of files) {
      const url = URL.createObjectURL(file);
      newImgs.push({ url, name: file.name });
    }
    setCarousel((c) => [...c, ...newImgs]);
    setCarouselIdx((c) => c === -1 ? 0 : c);
    e.target.value = "";
  };

  const handleDeleteImage = (idx) => {
    setCarousel((imgs) => imgs.filter((_, i) => i !== idx));
    setCarouselIdx((i) =>
      idx === 0 ? 0 : Math.max(0, i - (carouselIdx >= idx ? 1 : 0))
    );
  };

  // Save image handler
  const handleSaveImage = () => {
    const img = carousel[carouselIdx];
    if (!img) return;
    const a = document.createElement("a");
    a.href = img.url;
    a.download = img.name || "image.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Documents handlers
  const handleAddDoc = (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const newDocs = [];
    for (let file of files) {
      newDocs.push({
        name: file.name,
        url: URL.createObjectURL(file),
        file,
      });
    }
    setDocuments((docs) => [...docs, ...newDocs]);
    e.target.value = "";
  };

  const handleDeleteDoc = (idx) => {
    setDocuments((docs) => docs.filter((_, i) => i !== idx));
  };

  // Carousel navigation
  const prevImg = () => setCarouselIdx((idx) =>
    carousel.length === 0 ? 0 : (idx - 1 + carousel.length) % carousel.length
  );
  const nextImg = () => setCarouselIdx((idx) =>
    carousel.length === 0 ? 0 : (idx + 1) % carousel.length
  );

  // Action handlers (fill in as needed)
  const handleViewForecast = () => alert("View Job Forecast");
  const handleViewBudget = () => alert("View Budget");
  const handleOpenImageUpload = () => imageInputRef.current.click();

  return (
    <div
      className="w-full h-full bg-black rounded-[32px] shadow-2xl border-2 border-[#6a7257] flex flex-col"
      style={{ minHeight: 500, maxHeight: 650, padding: 0 }}
    >
      {/* HEADER */}
      <div className="w-full flex items-center justify-center border-b border-[#35392e] py-3 px-2">
        <FaRocket className="text-green-400 text-xl drop-shadow mr-2" />
        <h2 className="text-2xl font-bold tracking-wide text-[#FAF5E6] uppercase">
          Paloma Launcher
        </h2>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full border-b border-[#35392e] px-4 py-2 flex flex-col items-center bg-black">
        <div className="w-full max-w-md">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-[#b0b79f] font-semibold">Progress</span>
            <span className="text-xs text-[#b0b79f]">{percent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-lg bg-[#22261e] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6a7257] to-[#b0b79f] transition-all duration-300"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div
        className="flex-1 w-full grid"
        style={{
          gridTemplateColumns: "2.2fr 2.4fr 1.2fr 0.4fr",
          alignItems: "stretch",
          minHeight: 0
        }}
      >
        {/* Checklist */}
        <div className="flex flex-col items-start justify-start border-r border-[#35392e] px-6 py-6 bg-black">
          <div className="text-center w-full mb-3">
            <span className="text-lg text-[#cfddb3] font-bold">Checklist</span>
          </div>
          <ul className="space-y-2 w-full mb-3">
            {checklist.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => handleToggleChecklistItem(idx)}
                  className="accent-[#6a7257] w-4 h-4"
                />
                <span className={`text-sm ${item.done ? "line-through text-[#949c7f]" : "text-[#f3f4f1]"}`}>{item.label}</span>
                <button
                  className="ml-2 text-[#b0b79f] hover:text-red-400"
                  onClick={() => handleDeleteChecklistItem(idx)}
                  title="Delete"
                  style={{ fontSize: 13 }}
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex w-full gap-2 mt-2">
            <input
              className="flex-1 rounded bg-[#23241f] border border-[#6a7257] text-sm text-[#faf5e6] px-2 py-1 focus:outline-none"
              placeholder="Add new item..."
              value={newChecklistItem}
              maxLength={80}
              onChange={e => setNewChecklistItem(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddChecklistItem()}
            />
            <button
              onClick={handleAddChecklistItem}
              className="px-2 py-1 rounded bg-[#22261e] border border-[#6a7257] text-[#cfddb3] hover:bg-[#6a7257] hover:text-black flex items-center"
              title="Add Item"
              style={{ fontSize: 15 }}
            >
              <FaPlus />
            </button>
          </div>
        </div>

        {/* Images Carousel (fills the section) */}
        <div className="flex flex-col items-center justify-center border-r border-[#35392e] py-6 px-2 bg-black relative h-full w-full">
          {carousel.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <span className="text-[#949c7f] text-sm">No images yet</span>
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-full h-full" style={{ minHeight: 0, minWidth: 0 }}>
              {/* Left arrow */}
              <button
                onClick={prevImg}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#6a7257] hover:bg-[#b0b79f] rounded-full p-[6px] z-20 shadow-lg border-2 border-[#23241f] flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  transform: "translateY(-50%)"
                }}
                title="Previous"
              >
                <FaChevronLeft className="text-white text-xl" />
              </button>
              {/* Image */}
              <img
                src={carousel[carouselIdx]?.url}
                alt="Project"
                className="object-contain w-full h-full rounded-md border border-[#35392e] bg-[#1a1c1a]"
                style={{
                  minWidth: 0,
                  minHeight: 0,
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              />
              {/* Right arrow */}
              <button
                onClick={nextImg}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#6a7257] hover:bg-[#b0b79f] rounded-full p-[6px] z-20 shadow-lg border-2 border-[#23241f] flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  transform: "translateY(-50%)"
                }}
                title="Next"
              >
                <FaChevronRight className="text-white text-xl" />
              </button>
              {/* Delete image */}
              <button
                className="absolute top-3 right-12 bg-[#22261e] border border-[#6a7257] text-[#cfddb3] rounded-full p-1 hover:text-red-400 z-30"
                onClick={() => handleDeleteImage(carouselIdx)}
                title="Delete Image"
                style={{
                  width: 26,
                  height: 26,
                  fontSize: 15,
                  display: carousel.length ? "flex" : "none",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FaTrash />
              </button>
              {/* Save image */}
              <button
                className="absolute top-3 right-3 bg-[#22261e] border border-[#6a7257] text-[#cfddb3] rounded-full p-1 hover:text-green-400 z-30"
                onClick={handleSaveImage}
                title="Save Image"
                style={{
                  width: 26,
                  height: 26,
                  fontSize: 15,
                  display: carousel.length ? "flex" : "none",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FaDownload />
              </button>
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="flex flex-col items-center justify-start border-r border-[#35392e] bg-black px-4 pt-6">
          <div className="flex flex-row w-full justify-between items-center mb-3">
            <span className="text-lg text-[#cfddb3] font-bold">Documents</span>
            <input
              type="file"
              ref={docInputRef}
              className="hidden"
              onChange={handleAddDoc}
              multiple
            />
            <button
              className="ml-2 p-1 bg-[#22261e] border border-[#6a7257] rounded hover:bg-[#35392e] text-[#cfddb3]"
              title="Add Document"
              onClick={() => docInputRef.current.click()}
              style={{ fontSize: "11px", width: 22, height: 22, minWidth: 22, minHeight: 22 }}
            >
              <FaPlus />
            </button>
          </div>
          <div className="flex flex-row gap-2 w-full flex-wrap">
            {documents.length === 0 && (
              <span className="text-[#949c7f] text-sm italic">No documents uploaded</span>
            )}
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="relative group"
              >
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-[#22261e] border-2 border-[#6a7257] rounded-md hover:bg-[#35392e]"
                  title={doc.name}
                  style={{ fontSize: 15 }}
                >
                  <FaRegFileAlt className="text-[#b0b79f]" />
                </a>
                <button
                  className="absolute -top-2 -right-2 bg-[#22261e] border border-[#6a7257] text-[#b0b79f] rounded-full p-0.5 hover:text-red-400 z-10"
                  title="Delete"
                  onClick={() => handleDeleteDoc(idx)}
                  style={{ fontSize: 11, width: 16, height: 16, minWidth: 16, minHeight: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <FaTrash />
                </button>
                {/* Tooltip on hover */}
                <span className="absolute left-1/2 bottom-full -translate-x-1/2 mb-1 hidden group-hover:flex bg-[#262920] border border-[#6a7257] text-[#faf5e6] px-2 py-1 rounded text-xs z-20 whitespace-nowrap pointer-events-none">
                  {doc.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex flex-col gap-2 items-center justify-start px-0 pt-5 bg-black">
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleAddImage}
            multiple
          />
          <button
            className="w-8 h-8 rounded-full border-2 border-[#6a7257] flex items-center justify-center hover:bg-[#262920] mb-2"
            title="Add Image to Carousel"
            onClick={handleOpenImageUpload}
            style={{ fontSize: 13 }}
          >
            <FaImage className="text-[#b0b79f]" />
          </button>
          <button
            className="w-8 h-8 rounded-full border-2 border-[#6a7257] flex items-center justify-center hover:bg-[#262920] mb-2"
            title="View Job Forecast"
            onClick={handleViewForecast}
            style={{ fontSize: 13 }}
          >
            <FaChartBar className="text-[#b0b79f]" />
          </button>
          <button
            className="w-8 h-8 rounded-full border-2 border-[#6a7257] flex items-center justify-center hover:bg-[#262920]"
            title="View Budget"
            onClick={handleViewBudget}
            style={{ fontSize: 13 }}
          >
            <FaMoneyBillWave className="text-[#b0b79f]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PalomaLauncherCard;
