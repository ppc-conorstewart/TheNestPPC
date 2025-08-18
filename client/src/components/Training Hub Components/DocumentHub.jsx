import React, { useRef, useState } from "react";

/**
 * DocumentHub component
 * Handles file uploads, downloads, and deletions.
 *
 * @param {Object} props
 * @param {Array} props.documents
 * @param {Function} props.onAddDocuments
 * @param {Function} props.onDeleteDocument
 * @param {Function} props.onDownloadDocument
 * @param {String} props.employeeName   // NEW: employee name to show in title
 */
export default function DocumentHub({
  documents,
  onAddDocuments,
  onDeleteDocument,
  onDownloadDocument,
  employeeName = ""
}) {
  const fileInputRef = useRef(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleFileInputChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    onAddDocuments(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    if (!e.dataTransfer.files.length) return;
    onAddDocuments(Array.from(e.dataTransfer.files));
  }

  async function handleSaveNotes() {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsSaving(false);
  }

  return (
    <div className="flex flex-col border-t-2 border-[#6a7257] px-3 py-3 bg-black" style={{ height: "100%" }}>
      {/* Top: Documents & Upload */}
      <div
        className="flex flex-col justify-between"
        style={{ flex: 1, minHeight: 0, height: "50%" }}
      >
        <div className="mb-2 flex flex-col items-center justify-center text-center">
          <span className="text-white font-erbaum font-bold text-xs uppercase tracking-wide">
            {employeeName ? `${employeeName} Document Hub` : "Document Hub"}
          </span>
          <button
            className="mt-1 bg-[#6a7257] text-black px-2 py-1 rounded font-bold font-erbaum text-xs hover:bg-[#7fa173] transition focus:outline-none"
            style={{ fontSize: ".72rem" }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            + Add Document
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
        <div
          className="flex-1 overflow-y-auto mb-1"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            border: documents.length === 0 ? "1.2px dashed #6a7257" : "none",
            minHeight: 52,
            borderRadius: 6,
            background: documents.length === 0 ? "#000000ff" : "transparent",
            color: "#aaa",
            fontSize: ".83rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: documents.length === 0 ? "center" : "flex-start",
            alignItems: "center",
            textAlign: "center",
            padding: 4,
            height: "calc(100% - 30px)"
          }}
        >
          {documents.length === 0 ? (
            <span>
              Drag & Drop files here or click 'Add Document' to upload training docs.
            </span>
          ) : (
            <ul className="w-full">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between border-b border-[#23282b] py-1 px-1"
                >
                  <span className="truncate max-w-[90px] text-[#6a7257] font-erbaum text-xs">
                    {doc.name}
                  </span>
                  <span className="ml-2 text-gray-400 font-erbaum text-xs" style={{ fontSize: ".68rem" }}>
                    {doc.uploaded}
                  </span>
                  <span className="ml-2 flex gap-1">
                    <button
                      className="px-1 py-0.5 bg-blue-800 text-white rounded hover:bg-blue-600 text-[0.60rem]"
                      onClick={() => onDownloadDocument(doc)}
                      title="Download"
                    >
                      ⬇
                    </button>
                    <button
                      className="px-1 py-0.5 bg-red-700 text-white rounded hover:bg-red-600 text-[0.60rem]"
                      onClick={() => onDeleteDocument(doc.id)}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Divider */}
      <div className="w-full h-[1.5px] bg-[#35392E] my-2" />
      {/* Bottom: Employee Notes */}
      <div
        className="flex flex-col"
        style={{ flex: 1, minHeight: 0, height: "50%" }}
      >
        <div className="flex flex-col items-center justify-center mb-1 text-center">
          <span className="text-white font-erbaum font-bold text-xs uppercase tracking-wide">
            {employeeName ? `${employeeName} Employee Notes` : "Employee Notes"}
          </span>
          <button
            onClick={handleSaveNotes}
            disabled={isSaving}
            className={`mt-1 px-3 py-1 rounded font-bold font-erbaum text-xs transition focus:outline-none
              ${isSaving
                ? "bg-[#35392e] text-gray-400 cursor-not-allowed"
                : "bg-[#6a7257] text-white hover:bg-[#7fa173]"}
            `}
            style={{ fontSize: ".81rem" }}
            title="Save Notes"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
        <textarea
          className="w-full flex-1 bg-black border border-[#6a7257] text-center rounded px-2 py-2 text-xs   text-white font-erbaum resize-none"
          style={{
            minHeight: 60,
            height: "100%",
            fontSize: ".86rem",
            outline: "none",
          }}
          value={notes}
          placeholder="Add employee-specific notes here..."
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
}
