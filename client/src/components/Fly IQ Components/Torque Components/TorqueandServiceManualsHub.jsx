import { resolveApiUrl } from '../../../api'
// ==============================
// TorqueandServiceManualsHub.jsx
// ==============================

import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import { useEffect, useRef, useState } from "react";
import {
  AiFillFile,
  AiFillFileExcel,
  AiFillFileWord,
  AiOutlineEdit,
  AiOutlinePlus
} from "react-icons/ai";

const TAB_LABELS = [
  "TQ-Hydraulic",
  "TQ-Pneumatic",
  "Grease Pumps",
  "Service Equipment"
];

function PDFSpinner({ size = 44 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          border: "4px solid #6a725770",
          borderTop: "4px solid #6a7257",
          borderRadius: "50%",
          width: size,
          height: size,
          animation: "spin 1s linear infinite"
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
}

function PDFThumbnail({ fileUrl, width = 134, height = 134 }) {
  const canvasRef = useRef();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    async function renderPDF() {
      setLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const scale = 4;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        await page.render({
          canvasContext: canvas.getContext("2d"),
          viewport: viewport
        }).promise;
      } catch (err) {}
      if (isSubscribed) setLoading(false);
    }
    if (isSubscribed && fileUrl) renderPDF();
    return () => { isSubscribed = false; };
  }, [fileUrl, width, height]);

  return (
    <div style={{
      width: width,
      height: height,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      background: "#191b17",
      borderRadius: 8,
      overflow: "hidden"
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: width,
          height: height,
          objectFit: "cover",
          borderRadius: 8,
          background: "#222",
          display: loading ? "none" : "block"
        }}
      />
      {loading && (
        <div style={{
          position: "absolute",
          left: 0, top: 0, right: 0, bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#191b17"
        }}>
          <PDFSpinner size={40} />
        </div>
      )}
    </div>
  );
}

function getFileIcon(fileName, mimeType, fileUrl) {
  const lower = fileName.toLowerCase();
  if (mimeType && mimeType.startsWith('image/')) return <img src={fileUrl} alt={fileName} style={{ width: 134, height: 134, objectFit: "cover", borderRadius: 8, background: "#222" }} />;
  if (lower.endsWith('.pdf')) return <PDFThumbnail fileUrl={fileUrl} />;
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return <AiFillFileWord color="#3a80e6" size={140} />;
  if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || lower.endsWith('.csv')) return <AiFillFileExcel color="#2fdb84" size={140} />;
  return <AiFillFile color="#bbb" size={140} />;
}

function splitNameAndExt(filename) {
  const match = filename.match(/^(.*?)(\.[^\.]+)$/);
  if (!match) return [filename, ""];
  return [match[1], match[2]];
}

export default function TorqueandServiceManualsHub({ open, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TAB_LABELS[0]);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameExt, setRenameExt] = useState("");

  const textareaRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    fetchDocsForTab(activeTab);
  }, [open, activeTab]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [renamingId]);

  function fetchDocsForTab(tab) {
    setLoading(true);
    fetch(resolveApiUrl(`/api/torque-manuals?tab=${encodeURIComponent(tab)}`))
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  function handleTabClick(tab) {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  }

  function handleAddDocument() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("tab", activeTab);
        await fetch(resolveApiUrl("/api/torque-manuals"), {
          method: "POST",
          body: formData,
        });
      }
      fetchDocsForTab(activeTab);
    };
    fileInput.click();
  }

  async function handleRename(doc) {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    const newFullName = renameValue.trim() + renameExt;
    if (newFullName === doc.file_name) {
      setRenamingId(null);
      return;
    }
    const res = await fetch(resolveApiUrl(`/api/torque-manuals/${doc.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newName: newFullName })
    });
    if (res.ok) {
      fetchDocsForTab(activeTab);
    }
    setRenamingId(null);
  }

  function handleRenameInput(e) {
    setRenameValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }

  function handleRenameKeyDown(e, doc) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRename(doc);
    }
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(14,18,15, 0.72)",
        backdropFilter: "blur(13px) saturate(160%) brightness(1.08)",
        WebkitBackdropFilter: "blur(13px) saturate(160%) brightness(1.08)",
        boxShadow: "0 0 180px 0 #1b1f1c70 inset",
        transition: "background .16s",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "84vw",
          maxWidth: 1200,
          minHeight: 700,
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          background: "#090a08",
          border: "3px solid #6a7257",
          borderRadius: 22,
          boxShadow: "0 6px 44px #000b",
          overflow: "hidden",
          padding: 0,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            background: "#10110e",
            borderBottom: "2px solid #6a7257",
            padding: "7px 36px 6px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 62,
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "center",
            position: "relative"
          }}>
            <img
              src="/assets/whitelogo.png"
              alt="Paloma"
              style={{
                width: 140,
                height: 54,
                marginRight: 24,
                marginLeft: 6,
                marginTop: 2,
                filter: "drop-shadow(0 2px 10px #363)",
                background: "none"
              }}
              draggable={false}
            />
            <span
              className="font-cornero"
              style={{
                color: "#fff",
                fontSize: "1.7rem",
                fontWeight: 900,
                letterSpacing: ".03em",
                textAlign: "center",
                lineHeight: 1.04,
                fontFamily: "Cornero, Erbaum, sans-serif",
                flex: 1,
                marginLeft: 6,
                marginRight: 8
              }}
            >
              Torque and Service Manuals
            </span>
            <button
              onClick={onClose}
              style={{
                fontSize: 20,
                color: "#ffffffb3",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: 400,
                lineHeight: 1,
                outline: "none",
                marginLeft: 12,
                transition: "color .14s",
                position: "absolute",
                right: -24,
                top: "30%",
                transform: "translateY(-50%)"
              }}
              title="Close"
            >
             🞫
            </button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            background: "#090a08",
            borderBottom: "1px solid #6a7257",
            padding: "0 0 0 4px",
            minHeight: 0,
            height: 40,
            position: "relative",
            zIndex: 10
          }}
        >
          {TAB_LABELS.map((tab, idx) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                style={{
                  fontFamily: "Erbaum, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  color: isActive ? "#ffffffff" : "#babfc2",
                  background: isActive ? "#000000ff" : "#000000ff",
                  border: "none",
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 36,
                  borderBottom: isActive ? "3px solid #ffffffff" : "0px solid #6a7257",
                  borderLeft: isActive ? "2.5px solid #ffffffff" : "2px solid #6a7257",
                  borderRight: isActive ? "2.5px solid #ffffffff" : "2px solid #6a7257",
                  borderTop: isActive ? "2.5px solid #ffffffff" : "2px solid #6a7257",
                  marginRight: 12,
                  marginTop: isActive ? 0 : 0,
                  marginBottom: isActive ? 0 : 0,
                  padding: "4px 26px 2px 26px",
                  letterSpacing: ".01em",
                  cursor: isActive ? "default" : "pointer",
                  opacity: isActive ? 1 : 0.78,
                  boxShadow: isActive
                    ? "0 4px 14px #141a0d10, 0 2px 7px #0007"
                    : "none",
                  position: "relative",
                  zIndex: isActive ? 12 : 11,
                  transition:
                    "background .13s, color .13s, border .13s, box-shadow .13s, margin .13s",
                }}
                tabIndex={isActive ? -1 : 0}
                disabled={isActive}
              >
                {tab}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <button
            style={{
              color: "#e6ffe6",
              marginRight: 10,
              marginBottom: 4,
              fontSize: 22,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background .13s, color .13s, border .13s"
            }}
            onClick={handleAddDocument}
            title="Add Document(s)"
          >
            <AiOutlinePlus />
          </button>
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            height: "100%",
            padding: "20px 12px 20px 12px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            gap: "4px 10px",
            overflowY: "auto",
            background: "#000",
          }}
        >
          {loading ? (
            <div style={{ color: "#aaa", fontSize: "1.3rem" }}>Loading…</div>
          ) : (
            documents.length === 0 ? (
              <div style={{ color: "#aaa", fontSize: "1.2rem" }}>No documents found.</div>
            ) : (
              documents.map((doc) => {
                const [namePart, extPart] = splitNameAndExt(doc.file_name);
                const isImage = doc.mime_type && doc.mime_type.startsWith("image/");
                const isPDF = doc.file_name.toLowerCase().endsWith('.pdf');
                return (
                  <div
                    key={doc.id}
                    style={{
                      width: 180,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      marginBottom: 4,
                      wordBreak: "break-all",
                      position: "relative"
                    }}
                  >
                    <button
                      style={{
                        position: "absolute",
                        top: -18,
                        right: 0,
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 12,
                        background: "none",
                        border: "none",
                        boxShadow: "none"
                      }}
                      onClick={() => {
                        setRenamingId(doc.id);
                        setRenameValue(namePart);
                        setRenameExt(extPart);
                      }}
                      title="Rename"
                    >
                      <AiOutlineEdit color="#e6ffe6" size={18} />
                    </button>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 140,
                        height: 140,
                        cursor: "pointer",
                        border: "3px solid #6a7257",
                        borderRadius: 12,
                        background: "#121212",
                        marginBottom: 12,
                        marginTop: 6,
                        boxShadow: "0 2px 7px #18201744"
                      }}
                      onClick={() => window.open(doc.file_url, "_blank")}
                      title={`Open ${doc.file_name}`}
                    >
                      {isImage ? (
                        <img
                          src={doc.file_url}
                          alt={doc.file_name}
                          style={{
                            width: 134,
                            height: 134,
                            objectFit: "cover",
                            borderRadius: 8,
                            background: "#222",
                          }}
                        />
                      ) : isPDF ? (
                        <PDFThumbnail fileUrl={doc.file_url} />
                      ) : (
                        getFileIcon(doc.file_name, doc.mime_type, doc.file_url)
                      )}
                    </div>
                    {renamingId === doc.id ? (
                      <form
                        style={{
                          width: "100%",
                          marginTop: 8,
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          whiteSpace: "normal"
                        }}
                        onSubmit={e => {
                          e.preventDefault();
                          handleRename(doc);
                        }}
                      >
                        <textarea
                          ref={textareaRef}
                          rows={1}
                          value={renameValue}
                          onChange={handleRenameInput}
                          onKeyDown={e => handleRenameKeyDown(e, doc)}
                          onBlur={() => setRenamingId(null)}
                          style={{
                            width: "100%",
                            minHeight: 32,
                            maxHeight: 120,
                            fontSize: "0.62rem",
                            background: "#000000ff",
                            color: "#f4f4e9",
                            border: "1.5px solid #6a7257",
                            borderRadius: 4,
                            fontFamily: "Erbaum, sans-serif",
                            fontWeight: 700,
                            padding: "7px 3px",
                            display: "inline-block",
                            resize: "none",
                            overflow: "hidden"
                          }}
                        />
                        <span
                          style={{
                            color: "#bbb",
                            fontSize: ".6rem",
                            marginLeft: 2,
                            display: "inline-block",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {renameExt}
                        </span>
                      </form>
                    ) : (
                      <div
                        style={{
                          fontFamily: "Erbaum, sans-serif",
                          fontWeight: 700,
                          color: "#f7f7f2",
                          fontSize: "0.62rem",
                          marginTop: 8,
                          letterSpacing: ".01em",
                          textShadow: "0 2px 8px #222b",
                          textAlign: "center",
                          wordBreak: "break-all",
                          maxWidth: 164,
                          minHeight: 18,
                        }}
                      >
                        {doc.file_name}
                      </div>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
}
