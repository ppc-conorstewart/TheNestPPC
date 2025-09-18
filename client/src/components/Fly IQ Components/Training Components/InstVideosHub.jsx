import { useEffect, useRef, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { resolveApiUrl } from '../../../api'

// ================== SECTION LABELS ==================
const SECTION_LABELS = [
  "CH1-LB Valve",
  "CH2-SB Valve",
  "CH3-Missile",
  "CH4-Hydraulics",
  "CH5-Torque",
  "CH6-Accumulator"
];

// ================== MAIN COMPONENT ==================
export default function InstVideosHub({ onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const uploadInputRef = useRef(null);

  useEffect(() => {
    fetchVideosForTab(SECTION_LABELS[activeTab]);
    // eslint-disable-next-line
  }, [activeTab]);

  async function fetchVideosForTab(tab) {
    setLoading(true);
    fetch(resolveApiUrl(`/api/instructional-videos-hub?tab=${encodeURIComponent(tab)}`))
      .then((res) => res.json())
      .then((data) => {
        const normalized = Array.isArray(data)
          ? data.map(video => ({
              ...video,
              file_url: resolveApiUrl(video?.file_url || '')
            }))
          : [];
        setVideos(normalized);
        setActiveVideo(normalized[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  const handleTab = (idx) => {
    setActiveTab(idx);
  };

  const handleVideo = (vid) => setActiveVideo(vid);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    setUploading(true);
    const formData = new FormData();
    for (const file of files) {
      formData.append("videos", file);
    }
    formData.append("tab", SECTION_LABELS[activeTab]);
    try {
      await fetch(resolveApiUrl(`/api/instructional-videos-hub`), {
        method: "POST",
        body: formData
      });
      fetchVideosForTab(SECTION_LABELS[activeTab]);
    } catch (err) {}
    setUploading(false);
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  };

  // ================== DELETE HANDLER ==================
  const handleDelete = async (videoId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this video?")) return;
    await fetch(resolveApiUrl(`/api/instructional-videos-hub/${videoId}`), { method: "DELETE" });
    fetchVideosForTab(SECTION_LABELS[activeTab]);
    if (activeVideo && activeVideo.id === videoId) setActiveVideo(null);
  };

  // ================== START RENAME ==================
  const handleStartRename = (video, e) => {
    e.stopPropagation();
    setRenamingId(video.id);
    setRenameValue(video.file_name.replace(/\.[^/.]+$/, ""));
  };

  // ================== SUBMIT RENAME ==================
  const handleRenameSubmit = async (video) => {
    if (!renameValue.trim() || renameValue.trim() === video.file_name.replace(/\.[^/.]+$/, "")) {
      setRenamingId(null);
      setRenameValue("");
      return;
    }
    const newFullName = renameValue.trim() + video.file_name.substring(video.file_name.lastIndexOf('.'));
    await fetch(resolveApiUrl(`/api/instructional-videos-hub/${video.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newName: newFullName })
    });
    fetchVideosForTab(SECTION_LABELS[activeTab]);
    setRenamingId(null);
    setRenameValue("");
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* ================== HEADER ================== */}
        <div style={styles.header}>
          <img
            src="/assets/whitelogo.png"
            alt="Paloma"
            style={styles.logo}
            draggable={false}
          />
          <span
            className="font-cornero"
            style={{
              ...styles.headerTitle,
              fontFamily: "Font-cornero, Cornero, sans-serif",
              textTransform: "uppercase",
              fontWeight: 900,
              letterSpacing: 2,
              display: "block"
            }}
          >
            INSTRUCTIONAL VIDEOS
          </span>
          <button style={styles.closeButton} onClick={onClose}>&#10006;</button>
        </div>

        {/* ================== MAIN CONTENT ================== */}
        <div style={styles.content}>
          {/* ================== LEFT PANEL ================== */}
          <div style={styles.leftPanel}>
            {/* Tabs */}
            <div style={styles.tabsRow}>
              {SECTION_LABELS.map((label, idx) => (
                <button
                  key={label}
                  style={{
                    ...styles.tab,
                    ...(activeTab === idx ? styles.activeTab : {}),
                  }}
                  onClick={() => handleTab(idx)}
                  className="font-cornero"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Video List (No Thumbnails) */}
            <div style={styles.thumbsPanel}>
              {loading ? (
                <div style={{ color: "#aab", padding: "28px 0", textAlign: "center" }}>
                  Loading…
                </div>
              ) : videos.length === 0 ? (
                <div style={{ color: "#aab", padding: "28px 0", textAlign: "center" }}>
                  No videos yet for this section.
                </div>
              ) : (
                videos.map((video, idx) => {
                  const isRenaming = renamingId === video.id;
                  const isActive = activeVideo && activeVideo.id === video.id;
                  const ext = video.file_name.substring(video.file_name.lastIndexOf('.'));
                  return (
                    <div
                      key={video.id}
                      style={{
                        ...styles.thumbRow,
                        ...(isActive ? styles.selectedThumb : {}),
                        position: "relative"
                      }}
                      className="font-cornero"
                      onClick={() => handleVideo(video)}
                    >
                      {isRenaming ? (
                        <form
                          style={{ display: "flex", alignItems: "center", width: "88%" }}
                          onSubmit={e => {
                            e.preventDefault();
                            handleRenameSubmit(video);
                          }}
                        >
                          <input
                            value={renameValue}
                            autoFocus
                            onChange={e => setRenameValue(e.target.value)}
                            style={{
                              width: "100%",
                              minWidth: 0,
                              background: "#181a16",
                              color: "#e6e8df",
                              border: "1.5px solid #6a7257",
                              borderRadius: 4,
                              fontFamily: "Erbaum, monospace, sans-serif",
                              fontWeight: 600,
                              fontSize: 13,
                              padding: "3px 5px",
                              marginRight: 3
                            }}
                            onClick={e => e.stopPropagation()}
                            onBlur={() => setRenamingId(null)}
                            maxLength={90}
                          />
                          <span style={{
                            color: "#bdbdbd",
                            fontSize: 12,
                            fontFamily: "monospace",
                            marginRight: 2
                          }}>{ext}</span>
                        </form>
                      ) : (
                        <>
                          <span style={styles.thumbText}>{video.file_name}</span>
                          <span style={{
                            display: "flex",
                            alignItems: "center",
                            position: "absolute",
                            right: 6,
                            top: "50%",
                            transform: "translateY(-50%)",
                            opacity: 0.88
                          }}>
                            <span
                              style={styles.iconWrap}
                              title="Rename"
                              onClick={e => handleStartRename(video, e)}
                            >
                              <AiOutlineEdit size={15} />
                            </span>
                            <span
                              style={styles.iconWrap}
                              title="Delete"
                              onClick={e => handleDelete(video.id, e)}
                            >
                              <AiOutlineDelete size={15} />
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* ================== MULTIFILE UPLOAD PANEL ================== */}
            <div style={styles.uploadPanel}>
              <label
                htmlFor="video-upload"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  padding: "8px 0",
                  background: "#000000ff",
                  borderRadius: 7,
                  border: "2px solid #6a7257",
                  color: uploading ? "#9a9a9a" : "#e6e8df",
                  fontWeight: 700,
                  fontFamily: "Erbaum, Cornero, sans-serif",
                  fontSize: 12,
                  marginTop: 12,
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.7 : 1,
                  transition: "opacity 0.1s",
                }}
              >
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  multiple
                  disabled={uploading}
                  onChange={handleUpload}
                  ref={uploadInputRef}
                  style={{ display: "none" }}
                />
                {uploading ? (
                  <span style={{ marginLeft: 8 }}>Uploading...</span>
                ) : (
                  <>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" style={{ marginRight: 7 }}>
                      <path d="M10.5 16.5v-11m0 0L7 8.5m3.5-3V16.5M17 13.5V16a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-2.5" stroke="#e6e8df" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>Add Video(s) to This Section</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* ================== RIGHT PANEL ================== */}
          <div style={styles.rightPanel}>
            <div style={styles.playerContainer}>
              {activeVideo ? (
                <video
                  key={activeVideo.id}
                  src={activeVideo.file_url}
                  controls
                  style={styles.videoPlayer}
                >
                  Sorry, your browser does not support embedded videos.
                </video>
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#e6e8df",
                  fontSize: 28,
                  fontWeight: 400,
                  fontFamily: "Font-cornero, Cornero, sans-serif"
                }}>
                  Select or upload a video to play
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================== STYLES ==================
const styles = {
  overlay: {
    position: "fixed",
    zIndex: 9999,
    top: 0, left: 0,
    width: "100vw", height: "100vh",
    background: "rgba(8,12,8,0.92)",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(2.5px)",
  },
  modal: {
    width: "110vw",
    maxWidth: 1900,
    height: "84vh",
    minHeight: 500,
    background: "#171b14",
    border: "2px solid #6a7257",
    borderRadius: 12,
    boxShadow: "0 0 24px 2px #000d",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
    position: "relative",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#000",
    height: "70px",
    padding: "4px 4px 4px 24px",
    borderBottom: "2px solid #6a7257",
    position: "relative",
    fontFamily: "Font-cornero, Cornero, sans-serif",
  },
  logo: {
    width: 180,
    height: 64,
    marginRight: 24,
    marginLeft: 6,
    marginTop: 2,
    filter: "drop-shadow(0 2px 10px #363)",
    background: "none"
  },
  headerTitle: {
    flex: 1,
    fontSize: "3.5rem",
    color: "#fff",
    fontWeight: 200,
    textAlign: "center",
    letterSpacing: 4,
    textShadow: "0 2px 4px #242, 0 0px 1px #fff4",
    fontFamily: "Font-cornero, Cornero, sans-serif",
    textTransform: "uppercase",
    marginRight: 80,
  },
  closeButton: {
    position: "absolute",
    top: 12, right: 18,
    fontSize: 26,
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    filter: "drop-shadow(0 1px 3px #000)",
    zIndex: 2,
  },
  content: {
    display: "flex",
    flex: 1,
    height: "100%",
    background: "rgba(14,16,12,0.96)",
  },
  leftPanel: {
    width: 460,
    background: "#000",
    borderRight: "2px solid #6a7257",
    display: "flex", flexDirection: "column",
    padding: "0 0 0 0",
    position: "relative",
  },
  tabsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 0,
    background: "#000",
    borderBottom: "1.5px solid #5d654b",
  },
  tab: {
    padding: "6px 0px",
    fontWeight: 700,
    fontSize: 15,
    color: "#6a7257",
    borderTopRightRadius: 24,
    background: "none",
    border: "none",
    borderBottom: "2px solid #6a7257",
    borderRight: "4px solid #ffffffff",
    cursor: "pointer",
    fontFamily: "Erbaum, monospace, sans-serif",
    textTransform: "uppercase",
    transition: "background 0.13s, border-color 0.13s",
  },
  activeTab: {
    background: "#000000ff",
    borderBottom: "2.5px solid #ffffffff",
    color: "#e6e8df",
    zIndex: 1,
  },
  thumbsPanel: {
    flex: 1,
    overflowY: "auto",
    background: "#000",
    padding: "0px 0 0px 0",
  },
  thumbRow: {
    display: "flex",
    alignItems: "center",
    padding: "0px 0px",
    borderRadius: 0,
    margin: "0 0px 10px 18px",
    cursor: "pointer",
    textTransform: "uppercase",
    transition: "background 0.13s, border-color 0.13s",
    background: "#000000ff",
    minHeight: 34,
    justifyContent: "flex-start",
    fontFamily: "Font-cornero, Cornero, sans-serif",
    fontSize: 13,
    position: "relative"
  },
  selectedThumb: {
    background: "#000000ff",
    borderBottom: '2px solid #6a7257',
    
  },
  thumbText: {
    color: "#ffffffff",
    fontWeight: 600,
    fontSize: 11,
    fontFamily: "Erbaum, monospace, sans-serif",
    textShadow: "0 1px 2px #000",
    
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 3800,
    minWidth: 0,
  },
  iconWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#b7b7b7",
    background: "none",
    border: "none",
    cursor: "pointer",
    marginLeft: 10,
    fontSize: 14,
    transition: "color 0.13s",
    padding: 0,
    outline: "none"
  },
  uploadPanel: {
    padding: "8px 14px 14px 14px",
    background: "rgba(0,0,0,0)",
    borderTop: "2px solid #23271b",
  },
  rightPanel: {
    flex: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "4px 0 4px 0",
    background: "none",
  },
  playerContainer: {
    width: "98%",
    maxWidth: 1600,
    maxHeight: 800,
    aspectRatio: "16/9",
    background: "#000",
    
    borderRadius: 0,
    boxShadow: "0 0 24px #1a1e12b8",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
    background: "#000",
    borderRadius: 8,
    outline: "none",
  },
};
