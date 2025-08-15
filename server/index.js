// ==============================
// index.js — Express App Entry
// ==============================

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const {
  FRONTEND_URL,
  SESSION_SECRET,
  HAS_DISCORD_OAUTH
} = require('./config/config');
const passport = require('./config/passport');

const { generalUpload, memoryUpload, uploadDir } = require('./utils/uploads');
const db = require('./db');

const app = express();

// Render/Proxy awareness for cookies
const isRender = !!process.env.RENDER;

// ==============================
// CORS
// ==============================
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [FRONTEND_URL, 'http://localhost:3000'];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));

// ==============================
// Static Uploads and Logos
// ==============================
app.use('/uploads', express.static(uploadDir));
// ✅ cross‑platform logo path (works on Render/Linux and Windows)
const LOGOS_DIR = path.join(__dirname, 'public', 'assets', 'logos');
console.log('Serving customer logos from:', LOGOS_DIR);
app.use('/assets/logos', express.static(LOGOS_DIR));

// ==============================
// JSON Parsing
// ==============================
app.use(express.json());

// ==============================
// API Logger
// ==============================
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==============================
// Trust proxy (Render) + Session and Passport
// ==============================
app.set('trust proxy', 1);
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure: isRender ? true : false
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user && req.user.id) {
    req.user_id = req.user.id;
  }
  next();
});

// ==============================
// Routers and Logic Modules
// ==============================
const draftsRouter = require('./routes/drafts');
const transfersRouter = require('./routes/transfers');
const assetRoutes = require('./routes/assets');
const jobsRouter = require('./routes/jobs');
const sourcingRouter = require('./routes/sourcing');
const masterAssignmentsRouter = require('./routes/masterAssignments');
const activityRouter = require('./routes/activity');
const mfvPadsRouter = require('./routes/mfvPads');
const customersRouter = require('./routes/customers');
const fieldDocsRouter = require('./routes/FieldDocumentationHub');
const torqueManualsRouter = require('./routes/TorqueandServiceHub');
const instructionalVideosHubRouter = require('./routes/InstructionalVideosHub');
const flyIQJobsScheduleRouter = require('./routes/FlyIQJobsSchedule'); // <--- ADDED
const projectsRouter = require('./routes/projects'); // <--- NEW

// ==============================
// Router Mounts
// ==============================
app.use('/api/mfv', mfvPadsRouter);
app.use('/api', draftsRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/assets', assetRoutes);
app.use('/api/jobs', jobsRouter);
app.use('/api/sourcing', sourcingRouter);
app.use('/api/master', masterAssignmentsRouter);
app.use('/api/activity', activityRouter);
app.use('/api/customers', customersRouter);
app.use('/api/field-docs', fieldDocsRouter);
app.use('/api/torque-manuals', torqueManualsRouter);
app.use('/api/instructional-videos-hub', instructionalVideosHubRouter);
app.use('/api/jobs-schedule', flyIQJobsScheduleRouter); // <--- ADDED
app.use('/api/projects', projectsRouter); // <--- NEW

// ==============================
// Universal Upload (GLB & Images)
// ==============================
app.post('/api/upload-model', generalUpload.single('model'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    res.status(500).json({ error: 'Upload failed', detail: err.message });
  }
});

// ==============================
// Quiz Endpoints
// ==============================
app.get('/api/questions', (req, res) => {
  res.json(questions);
});
app.get('/api/module2', (req, res) => {
  res.json(module2);
});
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// ==============================
// Active HQ Jobs Only (In Progress)
// ==============================
app.get('/api/hq/active-jobs', async (req, res) => {
  try {
    const jobs = require('./jobs');
    const allJobs = await jobs.getAllJobs();
    const inProgress = allJobs.filter(
      job => (job.status && job.status.toLowerCase() === "in-progress")
    );
    const withLogo = inProgress.map(job => ({
      ...job,
      customerLogo: `/assets/logos/${(job.customer || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')}.png`
    }));
    res.json(withLogo);
  } catch (err) {
    console.error('Failed to get active HQ jobs:', err);
    res.status(500).json({ error: 'Failed to load active jobs' });
  }
});

// ==============================
// Workorder Endpoints
// ==============================
app.get('/api/workorders', (req, res) => {
  return res.json([]);
});
app.get('/api/workorder/test-template', async (req, res) => {
  try {
    const templatePath = path.join(
      __dirname,
      'templates',
      'Workorder Blank NEST.pdf'
    );
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const [firstPage] = pdfDoc.getPages();
    const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    firstPage.drawText('PDF Template Loaded!', {
      x: 50,
      y: 750,
      size: 14,
      font: timesFont,
      color: rgb(1, 0, 0),
    });
    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="workorder_test.pdf"'
    );
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Error loading or annotating PDF:', err);
    return res.status(500).send('Failed to load PDF template');
  }
});
app.post('/api/workorder/generate', async (req, res) => {
  try {
    const { customer, location, wells, rigInDate, revision } = req.body;
    if (!customer || !location || !wells || !rigInDate || !revision) {
      return res.status(400).json({
        error:
          'Must include customer, location, wells, rigInDate, and revision in the request body.',
      });
    }
    const templatePath = path.join(
      __dirname,
      'templates',
      'Workorder Blank NEST.pdf'
    );
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const [firstPage] = pdfDoc.getPages();
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const coords = {
      customer: { x: 90, y: 738 },
      location: { x: 350, y: 738 },
      wells: { x: 550, y: 738 },
      rigInDate: { x: 160, y: 712 },
      revision: { x: 572, y: 712 },
    };
    const fontSize = 10;
    firstPage.drawText(customer, {
      x: coords.customer.x,
      y: coords.customer.y,
      size: fontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(location, {
      x: coords.location.x,
      y: coords.location.y,
      size: fontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(String(wells), {
      x: coords.wells.x,
      y: coords.wells.y,
      size: fontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(rigInDate, {
      x: coords.rigInDate.x,
      y: coords.rigInDate.y,
      size: fontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(revision, {
      x: coords.revision.x,
      y: coords.revision.y,
      size: fontSize,
      font: helveticaBold,
      color: rgb(1, 0, 0),
    });
    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="workorder_populated.pdf"'
    );
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Error generating the populated PDF:', err);
    return res.status(500).json({ error: 'Failed to generate workorder PDF' });
  }
});

// ==============================
// Discord Auth (guarded to avoid "Unknown strategy")
// ==============================
if (HAS_DISCORD_OAUTH) {
  app.get('/auth/discord', passport.authenticate('discord'));

  app.get('/auth/discord/callback', (req, res, next) => {
    passport.authenticate('discord', (err, user, info) => {
      if (err) {
        console.error('Discord OAuth error:', err, info || '');
        return res
          .status(500)
          .send('OAuth error. Check server logs for details.');
      }
      if (!user) {
        console.warn('Discord OAuth failed. Info:', info || '');
        return res.redirect('/');
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Passport login error:', loginErr);
          return res.status(500).send('Login error.');
        }
        return res.redirect(
          `${FRONTEND_URL}/?user=${encodeURIComponent(JSON.stringify(user))}`
        );
      });
    })(req, res, next);
  });
} else {
  // Fallback endpoints so we never hit unknown strategy
  app.get('/auth/discord', (_req, res) => {
    res.status(503).send('Discord OAuth is not configured on this deployment.');
  });
  app.get('/auth/discord/callback', (_req, res) => {
    res.status(503).send('Discord OAuth is not configured on this deployment.');
  });
}

module.exports = app;
