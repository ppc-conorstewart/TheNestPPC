// ==============================
// FILE: server/index.js — Express App Entry
// Sections: Imports • Middleware • Routers • Discord Proxy • Action Items (In-Memory) • Admin Import (Seed) • Exports
// ==============================

const express = require('express')
const cors = require('cors')
const session = require('express-session')
const path = require('path')
const fs = require('fs')
const fetch = require('node-fetch')
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')
const { v4: uuidv4 } = require('uuid')

const { FRONTEND_URL, SESSION_SECRET } = require('./config/config')
const passport = require('./auth/discordStrategy')

const { generalUpload, memoryUpload, uploadDir } = require('./utils/uploads')
const db = require('./db')
const discordMembersRest = require('./services/discordMembersRest')

const app = express()

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  app.set('trust proxy', 1)
}


// ==============================
// SECTION: CORS
// ==============================
const defaultCorsOrigins = [
  FRONTEND_URL,
  'https://thenestppc.ca',
  process.env.FRONTEND_URL_FALLBACK,
  process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]
  .filter(Boolean)
  .map(origin => origin.replace(/\/+$/, ''))

const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/i
const railwayPattern = /^https?:\/\/[^\s]+\.railway\.app$/i
const extraCors = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)
  .map(origin => origin.replace(/\/+$/, ''))

const allowedCorsOrigins = new Set([...defaultCorsOrigins, ...extraCors])

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const normalized = origin.replace(/\/+$/, '')
    if (allowedCorsOrigins.has(normalized)) return callback(null, true)
    if (localhostPattern.test(normalized)) return callback(null, true)
    if (isProd && railwayPattern.test(normalized)) return callback(null, true)
    console.warn(`[CORS] Blocked origin: ${origin}`)
    return callback(new Error('Not allowed by CORS'), false)
  },
  credentials: true
}))

// ==============================
// SECTION: Static
// ==============================
app.use('/uploads', express.static(uploadDir, {
  index: false,
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  }
}))
app.use('/uploads/docs', express.static(path.join(uploadDir, 'docs')))
const LOGOS_DIR = path.join(__dirname, 'public', 'assets', 'logos')
console.log('Serving customer logos from:', LOGOS_DIR)
app.use('/assets/logos', express.static(LOGOS_DIR))

// ==============================
// SECTION: Body & Logging
// ==============================
app.use(express.json())
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// ==============================
// SECTION: Session / Passport
// ==============================
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use((req, _res, next) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user && req.user.id) {
    req.user_id = req.user.id
  }
  next()
})

// ==============================
// SECTION: Routers (existing)
// ==============================
const draftsRouter = require('./routes/drafts')
const transfersRouter = require('./routes/transfers')
const assetRoutes = require('./routes/assets')
const jobsRouter = require('./routes/jobs')
const sourcingRouter = require('./routes/sourcing')
const masterAssignmentsRouter = require('./routes/masterAssignments')
const activityRouter = require('./routes/activity')
const mfvPadsRouter = require('./routes/mfvPads')
const customersRouter = require('./routes/customers')
const fieldDocsRouter = require('./routes/FieldDocumentationHub')
const torqueManualsRouter = require('./routes/TorqueandServiceHub')
const instructionalVideosHubRouter = require('./routes/InstructionalVideosHub')
const flyIQJobsScheduleRouter = require('./routes/FlyIQJobsSchedule')
const projectsRouter = require('./routes/projects')
const documentsRouter = require('./routes/documents')
const serviceEquipmentRouter = require('./routes/serviceEquipment')
const workordersRouter = require('./routes/workorders')
const glbAssetsRouter = require('./routes/glbAssets')

app.use('/api/mfv', mfvPadsRouter)
app.use('/api', draftsRouter)
app.use('/api/transfers', transfersRouter)
app.use('/api/assets', assetRoutes)
app.use('/api/jobs', jobsRouter)
app.use('/api/sourcing', sourcingRouter)
app.use('/api/master', masterAssignmentsRouter)
app.use('/api/activity', activityRouter)
app.use('/api/customers', customersRouter)
app.use('/api/field-docs', fieldDocsRouter)
app.use('/api/torque-manuals', torqueManualsRouter)
app.use('/api/instructional-videos-hub', instructionalVideosHubRouter)
app.use('/api/jobs-schedule', flyIQJobsScheduleRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/documents', documentsRouter)
app.use('/api/service-equipment', serviceEquipmentRouter)
app.use('/api/workorders', workordersRouter)
app.use('/api/glb-assets', glbAssetsRouter)

// ==============================
// SECTION: Universal Upload
// ==============================
app.post('/api/upload-model', generalUpload.single('model'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  try {
    const url = `/uploads/${req.file.filename}`
    res.json({ url })
  } catch (err) {
    console.error('UPLOAD ERROR:', err)
    res.status(500).json({ error: 'Upload failed', detail: err.message })
  }
})

// ==============================
// existing quiz and user endpoints
app.get('/api/questions', (_req, res) => res.json(questions))
app.get('/api/module2', (_req, res) => res.json(module2))
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) res.json({ user: req.user })
  else res.status(401).json({ error: 'Not authenticated' })
})

// ==============================
// SECTION: HQ Jobs (existing helpers)
// ==============================
app.get('/api/hq/active-jobs', async (req, res) => {
  try {
    const jobs = require('./jobs')
    const allJobs = await jobs.getAllJobs()
    const inProgress = allJobs.filter(job => (job.status && job.status.toLowerCase() === 'in-progress'))
    const withLogo = inProgress.map(job => ({
      ...job,
      customerLogo: `/assets/logos/${(job.customer || '').toLowerCase().replace(/[^a-z0-9]/g, '')}.png`
    }))
    res.json(withLogo)
  } catch (err) {
    console.error('Failed to get active HQ jobs:', err)
    res.status(500).json({ error: 'Failed to load active jobs' })
  }
})

app.get('/api/hq/upcoming-jobs', async (req, res) => {
  try {
    const jobs = require('./jobs')
    const allJobs = await jobs.getAllJobs()
    const upcoming = allJobs
      .filter(job => {
        const status = (job.status || '').toLowerCase()
        return status !== 'in-progress' && status !== 'complete'
      })
      .sort((a, b) => {
        const ad = a.rig_in_date ? new Date(a.rig_in_date) : new Date(8640000000000000)
        const bd = b.rig_in_date ? new Date(b.rig_in_date) : new Date(8640000000000000)
        return ad - bd
      })
      .slice(0, 6)
    const withLogo = upcoming.map(job => ({
      ...job,
      customerLogo: `/assets/logos/${(job.customer || '').toLowerCase().replace(/[^a-z0-9]/g, '')}.png`
    }))
    res.json(withLogo)
  } catch (err) {
    console.error('Failed to get upcoming HQ jobs:', err)
    res.status(500).json({ error: 'Failed to load upcoming jobs' })
  }
})

// ==============================
// SECTION: Discord Proxy (Members/DM/Channels/Announce)
// ==============================
const BOT_SERVICE_URL = (() => {
  const fromEnv = (process.env.BOT_SERVICE_URL || '').trim()
  if (fromEnv) return fromEnv
  return process.env.NODE_ENV !== 'production' ? 'http://localhost:3020' : ''
})()
const BOT_KEY = process.env.NEST_BOT_KEY || 'Paloma2025*'

app.get('/api/discord/members', async (_req, res) => {
  const hasRemote = Boolean(BOT_SERVICE_URL)
  const hasFallback = discordMembersRest.isConfigured()

  if (!hasRemote && !hasFallback) {
    return res.status(503).json({ error: 'bot_service_unconfigured' })
  }

  const errors = []

  if (hasRemote) {
    try {
      const r = await fetch(`${BOT_SERVICE_URL}/members`, { headers: { 'x-bot-key': BOT_KEY } })
      if (!r.ok) {
        let details = ''
        try {
          details = await r.text()
        } catch (_) {
          details = ''
        }
        const statusInfo = `${r.status} ${r.statusText}`.trim()
        const message = details ? `${statusInfo}: ${details}` : statusInfo
        throw new Error(`Bot service responded ${message}`)
      }
      const list = await r.json()
      return res.json(list)
    } catch (err) {
      errors.push({ scope: 'remote', error: err })
    }
  }

  if (hasFallback) {
    try {
      const list = await discordMembersRest.fetchMembers()
      return res.json(list)
    } catch (err) {
      errors.push({ scope: 'fallback', error: err })
    }
  }

  if (errors.length) {
    for (const { scope, error } of errors) {
      console.error(`[Discord members ${scope} error]:`, error)
    }
  }

  return res.status(502).json({ error: 'bot_unavailable' })
})

app.get('/api/discord/channels', async (_req, res) => {
  try {
    if (!BOT_SERVICE_URL) return res.status(503).json({ error: 'bot_service_unconfigured' })
    const r = await fetch(`${BOT_SERVICE_URL}/channels`, { headers: { 'x-bot-key': BOT_KEY } })
    if (!r.ok) return res.status(502).json({ error: 'bot_unavailable' })
    const list = await r.json()
    res.json(list)
  } catch (e) {
    console.error('Discord channels proxy error:', e)
    res.status(502).json({ error: 'bot_unavailable' })
  }
})

app.post('/api/discord/announce', async (req, res) => {
  try {
    if (!BOT_SERVICE_URL) return res.status(503).json({ error: 'bot_service_unconfigured' })

    const { channelIds, channelId, content, message, attachments: incomingAttachments } = req.body || {}
    const collected = []

    if (Array.isArray(channelIds)) collected.push(...channelIds)
    if (channelId) collected.push(channelId)

    const payloadContent = content || message || ''
    const ids = Array.from(new Set(collected.map(id => String(id || '').trim()).filter(Boolean)))

    const resolveAttachmentUrlServer = (raw) => {
      if (!raw) return null
      if (/^https?:\/\//i.test(raw)) return raw
      const envBase = (process.env.NEST_PUBLIC_UPLOAD_BASE || process.env.NEST_PUBLIC_BASE_URL || process.env.NEST_API_URL || '').trim()
      const reqOrigin = (() => {
        if (!req || typeof req.get !== 'function') return ''
        const proto = req.header('x-forwarded-proto') || req.protocol || 'https'
        const host = req.get('host')
        if (!host) return ''
        return `${proto}://${host}`
      })()
      const base = (envBase || reqOrigin).replace(/\/+$/, '')
      if (!base) return null
      const suffix = raw.startsWith('/') ? raw : `/${raw}`
      return `${base}${suffix}`
    }

    const attachments = Array.isArray(incomingAttachments)
      ? incomingAttachments
          .map(att => ({
            url: resolveAttachmentUrlServer(att && att.url ? String(att.url) : null),
            name: att && att.name ? String(att.name) : undefined
          }))
          .filter(att => att.url)
      : []

    if (!ids.length || !payloadContent) {
      return res.status(400).json({ error: 'channelIds_and_content_required' })
    }

    const headers = { 'Content-Type': 'application/json', 'x-bot-key': BOT_KEY }
    const results = []

    for (const id of ids) {
      try {
        const r = await fetch(`${BOT_SERVICE_URL}/announce`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ channelId: id, message: payloadContent, attachments })
        })
        const out = await r.json().catch(() => ({}))
        if (!r.ok) {
          const reason = out?.error || out?.message || `${r.status}`
          results.push({ id, ok: false, reason })
        } else {
          results.push({ id, ok: true, data: out })
        }
      } catch (err) {
        results.push({ id, ok: false, reason: String(err?.message || err) })
      }
    }

    const anyOk = results.some(r => r.ok)
    res.status(anyOk ? 200 : 502).json({ ok: anyOk, results })
  } catch (e) {
    console.error('Discord announce proxy error:', e)
    res.status(502).json({ error: 'bot_unavailable' })
  }
})

app.post('/api/discord/announce/test', async (req, res) => {
  try {
    if (!BOT_SERVICE_URL) return res.status(503).json({ error: 'bot_service_unconfigured' })
    const r = await fetch(`${BOT_SERVICE_URL}/announce/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bot-key': BOT_KEY },
      body: JSON.stringify(req.body || {})
    })
    const out = await r.json().catch(() => ({}))
    res.status(r.status).json(out)
  } catch (e) {
    console.error('Discord announce test proxy error:', e)
    res.status(502).json({ error: 'bot_unavailable' })
  }
})

// ==============================
// SECTION: Action Items — In-Memory (no DB yet)
// ==============================
let actionItems = []
let nextId = 1

const sanitizeActionItem = (item) => {
  if (!item) return item
  const stakeholders_detail = Array.isArray(item.stakeholders_detail)
    ? item.stakeholders_detail.map(({ ack_token, ...rest }) => ({ ...rest }))
    : item.stakeholders_detail
  return { ...item, stakeholders_detail }
}

app.get('/api/hq/action-items', (_req, res) => {
  res.json(actionItems.map(sanitizeActionItem))
})

app.post('/api/hq/action-items', async (req, res) => {
  try {
    const { description, priority, category, due_date, attachment_url, attachment_name } = req.body || {}

    const rawStakeholderObjects = Array.isArray(req.body.stakeholder_objects) ? req.body.stakeholder_objects : []
    const rawStakeholderNames = Array.isArray(req.body.stakeholders) ? req.body.stakeholders : []
    const rawStakeholderIds = Array.isArray(req.body.stakeholder_ids) ? req.body.stakeholder_ids : []

    const detailById = new Map()
    const detailByName = new Map()
    const stakeholderDetails = []

    const registerDetail = (rawId, rawName) => {
      const id = rawId ? String(rawId) : null
      const name = (rawName || '').toString().trim()
      if (id && detailById.has(id)) {
        const existing = detailById.get(id)
        if (!existing.name && name) existing.name = name
        return existing
      }
      const key = id ? id : name.toLowerCase()
      if (!id && name && detailByName.has(key)) {
        return detailByName.get(key)
      }
      const detail = {
        id,
        name: name || (id ? `User ${id}` : 'Stakeholder'),
        acknowledged: false,
        acknowledged_at: null,
        ack_token: uuidv4()
      }
      stakeholderDetails.push(detail)
      if (id) detailById.set(id, detail)
      else if (name) detailByName.set(key, detail)
      return detail
    }

    for (const obj of rawStakeholderObjects) {
      if (!obj) continue
      registerDetail(obj.id, obj.name || obj.displayName || obj.username)
    }

    rawStakeholderIds.forEach((rawId, idx) => {
      if (!rawId) return
      const name = rawStakeholderNames[idx] || ''
      registerDetail(rawId, name)
    })

    rawStakeholderNames.forEach(name => {
      if (!name) return
      registerDetail(null, name)
    })

    const stakeholderNames = stakeholderDetails.map(detail => detail.name).filter(Boolean)
    const stakeholderIds = stakeholderDetails.filter(detail => detail.id).map(detail => detail.id)

    const id = nextId++

    const item = {
      id,
      description,
      priority: priority || 'Normal',
      category: category || 'General',
      due_date: due_date || null,
      stakeholders: stakeholderNames,
      stakeholder_ids: stakeholderIds,
      stakeholders_detail: stakeholderDetails,
      acknowledged_ids: [],
      attachment_url: attachment_url || null,
      attachment_name: attachment_name || null
    }
    actionItems.unshift(item)

    const recipients = stakeholderDetails.filter(detail => detail.id)

    if (recipients.length) {
      const dateStr = item.due_date ? new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'
      let message =
`You have been Added to an Action Item:\n` +
`**Description:** ${item.description}\n` +
`**Priority:** ${item.priority}\n` +
`**Due Date:** ${dateStr}`

      const attachments = []
      if (item.attachment_url) {
        const attachmentLabel = item.attachment_name || 'Attachment'
        const resolveAttachmentUrlServer = (raw) => {
          if (!raw) return null
          if (/^https?:\/\//i.test(raw)) return raw
          const envBase = (process.env.NEST_PUBLIC_UPLOAD_BASE || process.env.NEST_PUBLIC_BASE_URL || process.env.NEST_API_URL || '').trim()
          const reqOrigin = (() => {
            if (!req || typeof req.get !== 'function') return ''
            const proto = req.header('x-forwarded-proto') || req.protocol || 'https'
            const host = req.get('host')
            if (!host) return ''
            return `${proto}://${host}`
          })()
          const base = (envBase || reqOrigin).replace(/\/+$/, '')
          if (!base) return null
          const suffix = raw.startsWith('/') ? raw : `/${raw}`
          return `${base}${suffix}`
        }
        const absoluteUrl = resolveAttachmentUrlServer(item.attachment_url)
        if (absoluteUrl) {
          message += `\n**${attachmentLabel}:** Attached`
          attachments.push({ url: absoluteUrl, name: item.attachment_name || undefined })
        } else {
          message += `\n**${attachmentLabel}:** Attached`
        }
      }

      if (BOT_SERVICE_URL) {
        for (const detail of recipients) {
          const buttonComponents = detail.ack_token
            ? [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: detail.acknowledged ? 3 : 1,
                    label: detail.acknowledged ? 'Acknowledged' : 'Acknowledge',
                    custom_id: `ack:${id}:${detail.ack_token}`,
                    disabled: detail.acknowledged
                  }
                ]
              }
            ]
            : []

          try {
            await fetch(`${BOT_SERVICE_URL}/dm`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-bot-key': BOT_KEY },
              body: JSON.stringify({ userId: detail.id, message, attachments, components: buttonComponents })
            })
          } catch (err) {
            console.error(`Failed to dispatch action item DM to ${detail.id}:`, err)
          }
        }
      }
    }

    res.json(sanitizeActionItem(item))
  } catch (e) {
    console.error('Create action item failed:', e)
    res.status(500).json({ error: 'create_failed' })
  }
})

app.put('/api/hq/action-items/:id', async (req, res) => {
  const id = Number(req.params.id)
  const idx = actionItems.findIndex(i => i.id === id)
  if (idx === -1) return res.status(404).json({ error: 'not_found' })
  const prev = actionItems[idx]
  const stakeholders = Array.isArray(req.body.stakeholders) ? req.body.stakeholders : null
  const incomingDetail = Array.isArray(req.body.stakeholders_detail) ? req.body.stakeholders_detail : null

  let stakeholders_detail = Array.isArray(prev.stakeholders_detail) ? prev.stakeholders_detail.map(detail => ({ ...detail })) : []

  if (incomingDetail) {
    const byToken = new Map(stakeholders_detail.map(detail => [detail.ack_token, detail]))
    const byId = new Map(stakeholders_detail.filter(detail => detail.id).map(detail => [detail.id, detail]))
    stakeholders_detail = incomingDetail.map(entry => {
      const id = entry?.id ? String(entry.id) : null
      const token = entry?.ack_token
      const name = entry?.name || ''
      const existing = (token && byToken.get(token)) || (id && byId.get(id)) || null
      return {
        id,
        name: name || existing?.name || (id ? `User ${id}` : 'Stakeholder'),
        acknowledged: Boolean(existing?.acknowledged),
        acknowledged_at: existing?.acknowledged_at || null,
        ack_token: token || existing?.ack_token || uuidv4()
      }
    })
  } else if (stakeholders) {
    stakeholders_detail = stakeholders_detail.map((detail, idx) => ({
      ...detail,
      name: stakeholders[idx] || detail.name
    }))
  }

  const updatedStakeholderNames = stakeholders
    ? stakeholders.map(s => (typeof s === 'string' ? s : (s?.name || s?.displayName || s?.username || ''))).filter(Boolean)
    : (stakeholders_detail.length ? stakeholders_detail.map(detail => detail.name).filter(Boolean) : prev.stakeholders)

  const updatedStakeholderIds = stakeholders_detail.filter(detail => detail.id).map(detail => detail.id)
  const acknowledgedIds = stakeholders_detail.filter(detail => detail.acknowledged && detail.id).map(detail => detail.id)

  const next = {
    ...prev,
    description: req.body.description ?? prev.description,
    priority: req.body.priority ?? prev.priority,
    category: req.body.category ?? prev.category,
    due_date: req.body.due_date ?? prev.due_date,
    stakeholders: updatedStakeholderNames,
    stakeholder_ids: updatedStakeholderIds,
    stakeholders_detail,
    acknowledged_ids: acknowledgedIds
  }
  actionItems[idx] = next
  res.json(sanitizeActionItem(next))
})

app.patch('/api/hq/action-items/:id/close', (req, res) => {
  const id = Number(req.params.id)
  const idx = actionItems.findIndex(i => i.id === id)
  if (idx === -1) return res.status(404).json({ error: 'not_found' })
  actionItems.splice(idx, 1)
  res.json({ ok: true })
})

app.post('/api/hq/action-items/:id/reminders', async (req, res) => {
  const id = Number(req.params.id)
  const item = actionItems.find(i => i.id === id)
  if (!item) return res.status(404).json({ error: 'not_found' })
  const { when, note } = req.body || {}
  const msg = `Reminder: "${item.description}" (Priority: ${item.priority}). ${note ? 'Note: ' + note : ''}`
  res.json({ ok: true, when, note, msg })
})

app.post('/api/hq/action-items/:id/ack', (req, res) => {
  if ((req.header('x-bot-key') || '') !== BOT_KEY) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const id = Number(req.params.id)
  const item = actionItems.find(i => i.id === id)
  if (!item) return res.status(404).json({ error: 'not_found' })

  const { token, userId } = req.body || {}
  if (!token) return res.status(400).json({ error: 'token_required' })

  const details = Array.isArray(item.stakeholders_detail) ? item.stakeholders_detail : []
  const detail = details.find(entry => entry.ack_token === token)
  if (!detail) return res.status(404).json({ error: 'stakeholder_not_found' })
  if (detail.id && userId && String(userId) !== String(detail.id)) {
    return res.status(403).json({ error: 'mismatched_user' })
  }

  const alreadyAcknowledged = Boolean(detail.acknowledged)
  if (!alreadyAcknowledged) {
    detail.acknowledged = true
    detail.acknowledged_at = new Date().toISOString()
    if (detail.id) {
      const current = new Set(Array.isArray(item.acknowledged_ids) ? item.acknowledged_ids.map(v => String(v)) : [])
      current.add(String(detail.id))
      item.acknowledged_ids = Array.from(current)
    }
  }

  res.json({
    ok: true,
    alreadyAcknowledged,
    stakeholder: { id: detail.id, name: detail.name },
    itemId: item.id
  })
})

// ==============================
// SECTION: Workorder PDF (legacy demo)
// ==============================
app.get('/api/workorders', (_req, res) => res.json([]))
app.get('/api/workorder/test-template', async (_req, res) => {
  try {
    const templatePath = path.join(__dirname, 'templates', 'Workorder Blank NEST.pdf')
    const existingPdfBytes = fs.readFileSync(templatePath)
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    const [firstPage] = pdfDoc.getPages()
    const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    firstPage.drawText('PDF Template Loaded!', { x: 50, y: 750, size: 14, font: timesFont, color: rgb(1, 0, 0) })
    const pdfBytes = await pdfDoc.save()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename="workorder_test.pdf"')
    return res.send(Buffer.from(pdfBytes))
  } catch (err) {
    console.error('Error loading or annotating PDF:', err)
    return res.status(500).send('Failed to load PDF template')
  }
})

app.post('/api/workorder/generate', async (req, res) => {
  try {
    const { customer, location, wells, rigInDate, revision } = req.body
    if (!customer || !location || !wells || !rigInDate || !revision) {
      return res.status(400).json({ error: 'Must include customer, location, wells, rigInDate, and revision in the request body.' })
    }
    const templatePath = path.join(__dirname, 'templates', 'Workorder Blank NEST.pdf')
    const existingPdfBytes = fs.readFileSync(templatePath)
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    const [firstPage] = pdfDoc.getPages()
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const coords = {
      customer: { x: 90, y: 738 },
      location: { x: 350, y: 738 },
      wells: { x: 550, y: 738 },
      rigInDate: { x: 160, y: 712 },
      revision: { x: 572, y: 712 }
    }
    const fontSize = 10
    firstPage.drawText(customer, { x: coords.customer.x, y: coords.customer.y, size: fontSize, font: helveticaBold, color: rgb(0, 0, 0) })
    firstPage.drawText(location, { x: coords.location.x, y: coords.location.y, size: fontSize, font: helveticaBold, color: rgb(0, 0, 0) })
    firstPage.drawText(String(wells), { x: coords.wells.x, y: coords.wells.y, size: fontSize, font: helveticaBold, color: rgb(0, 0, 0) })
    firstPage.drawText(rigInDate, { x: coords.rigInDate.x, y: coords.rigInDate.y, size: fontSize, font: helveticaBold, color: rgb(0, 0, 0) })
    firstPage.drawText(revision, { x: coords.revision.x, y: coords.revision.y, size: fontSize, font: helveticaBold, color: rgb(1, 0, 0) })
    const pdfBytes = await pdfDoc.save()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename="workorder_populated.pdf"')
    return res.send(Buffer.from(pdfBytes))
  } catch (err) {
    console.error('Error generating the populated PDF:', err)
    return res.status(500).json({ error: 'Failed to generate workorder PDF' })
  }
})

app.get('/auth/discord', passport.authenticate('discord'))
app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
  res.redirect(`${require('./config/config').FRONTEND_URL}/?user=${encodeURIComponent(JSON.stringify(req.user))}`)
})

// ==============================
// SECTION: Static Client (Production)
// ==============================
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build')
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath))
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'))
    })
  } else {
    console.warn('[Static] client/build not found at:', clientBuildPath)
  }
}

// ==============================
// SECTION: Admin Import (Seed)
// ==============================
if (process.env.ADMIN_IMPORT_KEY) {
  app.use('/api/admin', require('./routes/adminImport'))
}

// ==============================
// SECTION: Exports
// ==============================
module.exports = app
