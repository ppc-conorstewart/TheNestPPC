import React, { useRef, useState } from 'react';

const iconMap = {
  pdf: '📕',
  xlsx: '📊',
  docx: '📄',
  png: '🖼️',
  jpg: '🖼️',
  jpeg: '🖼️',
  gif: '🖼️',
  svg: '🖼️',
  default: '📁',
};
const getIcon = filename => {
  const ext = filename.split('.').pop().toLowerCase();
  return iconMap[ext] || iconMap.default;
};
function getFileShort(name) {
  if (name.length < 12) return name;
  const parts = name.split('.');
  if (parts.length === 1) return name.slice(0, 9) + '...';
  const ext = parts.pop();
  const base = parts.join('.');
  return base.slice(0, 7) + '...' + '.' + ext;
}
function formatSize(size) {
  if (!size) return '';
  if (size < 1024) return size + 'B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'KB';
  return (size / (1024 * 1024)).toFixed(1) + 'MB';
}

const theme = {
  bg: 'rgba(0, 0, 0, 0.92)',
  border: '#35392E',
  accent: '#6a7257',
  accentGlow: '#A9E76A',
  font: '#E6E8DF',
  fileHover: '#2c2e2f',
  danger: '#e53939'
};

const styleSheet = `
@keyframes fadein3d {
  0% { opacity: 0; transform: scale(.8) translateY(22px);}
  100% { opacity: 1; transform: scale(1) translateY(0);}
}
`;

const containerStyle = {
  width: '100%',
  background: theme.bg,
  border: `1.5px solid ${theme.border}`,
  borderRadius: 12,
  minHeight: 90,
  display: 'flex',
  padding: '12px 16px 12px 16px',
  boxSizing: 'border-box',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginTop: 12,
  gap: '14px',
  maxHeight: 196,
  overflow: 'hidden'
};

const mainArea = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  height: '100%',
  gap: '7px'
};

const gridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: '7px',
  width: '100%',
  maxHeight: 65,
  overflowY: 'auto',
  marginTop: '3px',
  paddingRight: 3
};

const fileBoxStyle = hovered => ({
  width: 56,
  height: 56,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: hovered ? '#1B1D16' : '#222',
  border: `1.2px solid ${hovered ? theme.accentGlow : theme.border}`,
  borderRadius: '7px',
  fontSize: '0.63rem',
  fontWeight: 700,
  color: theme.font,
  boxShadow: hovered ? '0 1px 8px #A9E76A44' : '0 1px 5px #35392E10',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all .15s cubic-bezier(.51,1.2,.62,1)',
  zIndex: 1,
  padding: 0,
  animation: 'fadein3d .38s cubic-bezier(.45,1.1,.36,1)'
});

const sidebarStyle = {
  width: 100,
  minWidth: 200,
  maxWidth: 100,
  border: `1px solid ${theme.border}`,
  padding: '7px 0 7px 3px',
  display: 'flex',
  flexDirection: 'column',
  gap: '7px',
  alignItems: 'center',
  background: 'rgba(36,36,36,0.92)',
  justifyContent: 'flex-start',
  borderRadius: '0 8px 8px 0',
  height: '100%',
  boxSizing: 'border-box'
};
const miniBtnStyle = {
  background: 'rgba(0, 0, 0, 0.89)',
  color: theme.font,
  fontWeight: 700,
  border: `1.2px solid ${theme.accentGlow}`,
  borderRadius: 6,
  padding: '2px 0',
  width: 120,
  fontSize: '0.69rem',
  cursor: 'pointer',
  letterSpacing: '.02em',
  marginBottom: 0,
  marginTop: 0,
  transition: 'all .13s',
  boxShadow: '0 1px 8px #6a725721'
};
const delBtnStyle = {
  ...miniBtnStyle,
  background: 'black',
  color: '#fff',
  border: `1.2px solid ${theme.danger}`
};

const tipStyle = {
  fontSize: '0.62rem',
  color: 'white',
  opacity: 0.7,
  fontWeight: 500,
  marginTop: 0,
  textAlign: 'center',
  lineHeight: 1.23
};

const MasterAssemblyDocuments = () => {
  const [files, setFiles] = useState([]);
  const [hoverIdx, setHoverIdx] = useState(null);
  const fileInput = useRef();

  const handleUpload = (event) => {
    event.preventDefault();
    let uploadFiles = [];
    if (event.dataTransfer) {
      uploadFiles = Array.from(event.dataTransfer.files);
    } else if (event.target && event.target.files) {
      uploadFiles = Array.from(event.target.files);
    }
    if (!uploadFiles.length) return;
    const newFiles = uploadFiles
      .filter(f => !files.some(file => file.name === f.name))
      .map(f => ({
        id: `${f.name}-${Date.now()}`,
        name: f.name,
        file: f,
        size: f.size
      }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDelete = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const openFileDialog = () => {
    fileInput.current.click();
  };

  return (
    <>
      <style>{styleSheet}</style>
      <div style={containerStyle}>
        <div style={mainArea}>
          {/* File Grid */}
          <div id="madocs-grid" style={gridStyle}>
            {files.length === 0 && (
              <div style={{
                color: '#fff',
                opacity: 1,
                fontSize: '0.95rem',
                fontWeight: 700,
                marginLeft: 2,
                userSelect: 'none'
              }}>
                NO FILES UPLOADED YET.
              </div>
            )}
            {files.map((file, idx) => (
              <div
                key={file.id}
                style={{
                  ...fileBoxStyle(hoverIdx === idx),
                  animationDelay: `${idx * 20}ms`
                }}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                title={file.name}
              >
                <div style={{
                  fontSize: '1.39rem',
                  marginBottom: 1,
                  filter: hoverIdx === idx ? 'drop-shadow(0 0 5px #B0FF85)' : undefined
                }}>{getIcon(file.name)}</div>
                <span style={{
                  fontSize: '0.61rem',
                  fontWeight: 800,
                  color: hoverIdx === idx ? theme.accentGlow : theme.font,
                  marginBottom: 1,
                  textAlign: 'center'
                }}>{getFileShort(file.name)}</span>
                <span style={{
                  fontSize: '0.52rem',
                  color: theme.font,
                  opacity: 0.54,
                  marginBottom: 0,
                  fontWeight: 600,
                  textShadow: '0 1px 2px #000',
                }}>{formatSize(file.size)}</span>
                {hoverIdx === idx && (
                  <button
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 4,
                      background: 'black',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontWeight: 900,
                      fontSize: '0.57rem',
                      padding: '1.5px 6px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px #e5393935',
                      opacity: 0.97,
                      borderTop: '1px solid #B0FF85',
                      borderBottom: '1px solid #fff',
                      transition: 'background .13s, opacity .13s'
                    }}
                    onClick={e => { e.stopPropagation(); handleDelete(file.id); }}
                    title="Delete file"
                  >X</button>
                )}
              </div>
            ))}
          </div>
          <input
            ref={fileInput}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
        </div>
        {/* Sidebar */}
        <div style={sidebarStyle}>
          <button style={miniBtnStyle} onClick={openFileDialog}>
            <span style={{
              marginRight: 0,
              fontSize: '1.05em',
              verticalAlign: 'middle'
            }}></span>Upload
          </button>
          <button
            style={delBtnStyle}
            disabled={files.length === 0}
            onClick={() => files.length && handleDelete(files[files.length - 1].id)}
            title="Delete most recent file"
          >
            <span style={{
              marginRight: 2,
              fontSize: '1.01em',
              verticalAlign: 'middle'
            }}></span>Delete
          </button>
          <div style={tipStyle}>
            TIP:<br />DRAG, CLICK, OR USE BUTTONS.<br />CLICK FILE FOR PREVIEW!
          </div>
        </div>
      </div>
    </>
  );
};

export default MasterAssemblyDocuments;
