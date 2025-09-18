// ==============================
// FILE: server/index.js — Express App Entry
// Sections: Imports • Config • Middleware • Static • Routers • Admin Import (Dev) • Exports
// ==============================
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const { FRONTEND_URL, SESSION_SECRET } = require('./config/config');
const passport = require('./auth/discordStrategy');

const { generalUpload, memoryUpload, uploadDir } = require('./utils/uploads');
const db = require('./db');

const app = express();

const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  app.set('trust proxy', 1);
}

// ==============================
// SECTION: CORS
// ==============================
const defaultCorsOrigins = [
  FRONTEND_URL,
  'https://thenestppc.ca',
  process.env.FRONTEND_URL_FALLBACK,
  process.env.RAILWAY_PUBLIC_DOMAIN && `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`,
].filter(Boolean);

app.use(cors({
  origin: defaultCorsOrigins,
  credentials: true,
}));

// ==============================
// SECTION: Core Middleware
// ==============================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ==============================
// SECTION: Static Files (Uploads)
// ==============================
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// ==============================
// SECTION: API Routers
// ==============================
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/sourcing', require('./routes/sourcing'));
try { app.use('/api/glb-assets', require('./routes/glbAssets')); } catch (e) { console.warn('glb-assets route not loaded:', e?.message); }
try { app.use('/api/service-equipment', require('./routes/serviceEquipment')); } catch (e) { console.warn('service-equipment route not loaded:', e?.message); }
try { app.use('/api/documents', require('./routes/documents')); } catch (e) { console.warn('documents route not loaded:', e?.message); }

// ==============================
// SECTION: Admin Import (Dev/One-Off Seed)
// ==============================
if (process.env.ADMIN_IMPORT_KEY) {
  app.use('/api/admin', require('./routes/adminImport'));
}

// ==============================
// SECTION: Exports
// ==============================
module.exports = app;
