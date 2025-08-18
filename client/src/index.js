// ==========================
// src/index.js
// ==========================

// ===== POLYFILL FOR BROWSER PROCESS ENV =====
import process from 'process';
window.process = window.process || process;

// ===== CORE REACT IMPORTS =====
import '@google/model-viewer';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// ===== MAIN APP IMPORT =====
import App from './App';
import { JobProvider } from './context/JobContext'; // <--- ADD THIS LINE

// ===== REACT ROOT RENDER =====
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <JobProvider>
      <App />
    </JobProvider>
  </React.StrictMode>
);
