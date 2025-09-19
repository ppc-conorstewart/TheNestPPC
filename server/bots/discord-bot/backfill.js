// ==============================
// backfill.js — Discord Bot Backfill
// SECTIONS: Imports • Config • Discord Client • API • Utils • Backfill: Files (Single) • Backfill: Files (All Jobs) • Backfill: Members • Start
// ==============================

require('dotenv').config()

// ===== Imports =====
const { Client, GatewayIntentBits, Partials, PermissionsBitField } = require('discord.js')
const fetch = require('node-fetch')
const FormData = require('form-data')
const path = require('path')

// ==============================
// Config
// ==============================
const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const API_BASE_URL = process.env.NEST_API_URL || 'http://localhost:3001/api'
const API_BOT_KEY = process.env.NEST_BOT_KEY

const MODE_OR_CHANNEL = process.argv[2] || '' // "members" | "files" | <channelId>

// ==============================
// Discord Client
// ==============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
})

// ==============================
// API
// ==============================
async function apiGetJobs() {
  const res = await fetch(`${API_BASE_URL}/jobs`, {
    headers: { 'x-bot-key': API_BOT_KEY }
  })
  if (!res.ok) throw new Error(`GET /jobs failed: ${res.status}`)
  return res.json()
}

async function apiGetJobFiles(jobId) {
  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/files`, {
    headers: { 'x-bot-key': API_BOT_KEY }
  })
  if (!res.ok) return []
  return res.json()
}

async function apiPutJobDiscordMembers(jobId, memberIds) {
  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/discord_members`, {
    method: 'PUT',
    headers: {
      'x-bot-key': API_BOT_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ member_ids: memberIds })
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`PUT /jobs/${jobId}/discord_members failed: ${res.status} ${t}`)
  }
}

async function getJobIdByChannel(channelId) {
  const res = await fetch(`${API_BASE_URL}/jobs`, {
    headers: { 'x-bot-key': API_BOT_KEY }
  })
  if (!res.ok) return null
  const jobs = await res.json()
  const job = jobs.find(j => String(j.discord_channel_id) === String(channelId))
  return job ? job.id : null
}

async function uploadFileToJob(jobId, file, authorName) {
  const fileBuffer = await downloadBuffer(file.url || file.attachment)
  const formData = new FormData()
  formData.append('file', fileBuffer, file.name || file.filename || 'file')
  formData.append('tab', 'Equipment')
  formData.append('uploaded_by', authorName || 'DiscordBot')

  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/files`, {
    method: 'POST',
    headers: {
      'x-bot-key': API_BOT_KEY,
      ...formData.getHeaders()
    },
    body: formData
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`API error: ${res.status} ${errText}`)
  }
}

// ==============================
// Utils
// ==============================
function shouldUpload(file) {
  const url = file.url || file.attachment
  const name = file.name || file.filename || ''
  const ext = path.extname(name).toLowerCase()
  if (ext === '.gif') return false
  if (url && (url.includes('emojis') || url.includes('stickers'))) return false
  return true
}

async function downloadBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch file: ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

function makeDedupKey(name, size) {
  return `${(name || '').toLowerCase()}::${size || 0}`
}

// ==============================
// Backfill: Files (Single Channel)
// ==============================
async function runFileBackfillSingle(channelId) {
  console.log(`[BOT] Starting file backfill for channel ${channelId}`)
  const channel = await resolveChannel(channelId)
  if (!channel) {
    console.error(`[BOT] Channel ${channelId} not found or bot lacks access.`)
    return
  }

  const jobId = await getJobIdByChannel(channelId)
  if (!jobId) {
    console.error(`[BOT] No job found for channel ID ${channelId}`)
    return
  }

  const existing = await apiGetJobFiles(jobId)
  const seen = new Set(existing.map(f => makeDedupKey(f.filename, Number(f.size))))

  let uploaded = 0
  let lastId
  while (true) {
    const options = { limit: 100 }
    if (lastId) options.before = lastId
    const messages = await channel.messages.fetch(options)
    if (messages.size === 0) break

    for (const [, message] of messages) {
      if (!message.attachments || message.attachments.size === 0) continue
      for (const [, file] of message.attachments) {
        if (!shouldUpload(file)) continue
        const key = makeDedupKey(file.name, file.size)
        if (seen.has(key)) continue
        try {
          await uploadFileToJob(jobId, file, message.author?.username || 'DiscordUser')
          seen.add(key)
          uploaded++
          console.log(`[BOT] Uploaded "${file.name}" for job ${jobId}`)
        } catch (err) {
          console.error(`[BOT] Failed upload "${file.name}" for job ${jobId}:`, err.message)
        }
      }
    }

    lastId = messages.last().id
  }

  console.log(`[BOT] File backfill complete for job ${jobId}. Uploaded ${uploaded} new file(s).`)
}

async function resolveChannel(channelId) {
  for (const [, g] of client.guilds.cache) {
    const ch = await g.channels.fetch(channelId).catch(() => null)
    if (ch) return ch
  }
  return null
}

// ==============================
// Backfill: Files (All Jobs)
// ==============================
async function runFileBackfillAllJobs() {
  console.log('[BOT] Starting bulk file backfill for all jobs with a discord_channel_id')
  const jobs = await apiGetJobs()
  const target = jobs.filter(j => j.discord_channel_id)

  if (target.length === 0) {
    console.log('[BOT] No jobs with discord_channel_id found.')
    return
  }

  let updatedJobs = 0
  for (const job of target) {
    const chanId = String(job.discord_channel_id)
    const channel = await resolveChannel(chanId)
    if (!channel) {
      console.warn(`[BOT] Skipping job ${job.id}: channel ${chanId} not found or bot lacks access.`)
      continue
    }

    const existing = await apiGetJobFiles(job.id)
    const seen = new Set(existing.map(f => makeDedupKey(f.filename, Number(f.size))))

    let uploaded = 0
    let lastId
    while (true) {
      const options = { limit: 100 }
      if (lastId) options.before = lastId
      const messages = await channel.messages.fetch(options)
      if (messages.size === 0) break

      for (const [, message] of messages) {
        if (!message.attachments || message.attachments.size === 0) continue
        for (const [, file] of message.attachments) {
          if (!shouldUpload(file)) continue
          const key = makeDedupKey(file.name, file.size)
          if (seen.has(key)) continue
          try {
            await uploadFileToJob(job.id, file, message.author?.username || 'DiscordUser')
            seen.add(key)
            uploaded++
          } catch (err) {
            console.error(`[BOT] Job ${job.id}: failed upload "${file.name}":`, err.message)
          }
        }
      }

      lastId = messages.last().id
    }

    console.log(`[BOT] Job ${job.id}: Uploaded ${uploaded} new file(s) from channel ${chanId}`)
    if (uploaded > 0) updatedJobs++
  }

  console.log(`[BOT] Files backfill finished. Updated ${updatedJobs}/${target.length} jobs.`)
}

// ==============================
// Backfill: Members (All Jobs)
// ==============================
async function runMembersBackfill() {
  console.log('[BOT] Starting bulk Discord member ID backfill for all jobs with a discord_channel_id')

  const jobs = await apiGetJobs()
  const targetJobs = jobs.filter(j => j.discord_channel_id)

  if (targetJobs.length === 0) {
    console.log('[BOT] No jobs with discord_channel_id found. Nothing to do.')
    return
  }

  for (const [, g] of client.guilds.cache) {
    try {
      await g.members.fetch()
      console.log(`[BOT] Members fetched for guild: ${g.name}`)
    } catch (e) {
      console.warn(`[BOT] Could not fetch members for guild ${g.id}: ${e.message}`)
    }
  }

  let successCount = 0
  for (const job of targetJobs) {
    const chanId = String(job.discord_channel_id)
    let channel = null

    for (const [, g] of client.guilds.cache) {
      channel = await g.channels.fetch(chanId).catch(() => null)
      if (channel) break
    }

    if (!channel) {
      console.warn(`[BOT] Skipping job ${job.id}: channel ${chanId} not found or bot lacks access.`)
      continue
    }

    const memberIds = new Set()
    try {
      const guild = channel.guild
      await guild.members.fetch()

      for (const [, m] of guild.members.cache) {
        const perms = channel.permissionsFor(m)
        if (perms && perms.has(PermissionsBitField.Flags.ViewChannel)) {
          memberIds.add(m.user.id)
        }
      }

      if (channel.members && typeof channel.members.forEach === 'function') {
        channel.members.forEach(m => memberIds.add(m.user?.id || m.id))
      }
    } catch (e) {
      console.warn(`[BOT] Member resolution issue on channel ${chanId}: ${e.message}`)
    }

    const ids = Array.from(memberIds)
    try {
      await apiPutJobDiscordMembers(job.id, ids)
      console.log(`[BOT] Job ${job.id}: Stored ${ids.length} member IDs from channel ${chanId}`)
      successCount++
    } catch (e) {
      console.error(`[BOT] Job ${job.id}: Failed to store member IDs -> ${e.message}`)
    }
  }

  console.log(`[BOT] Members backfill finished. Updated ${successCount}/${targetJobs.length} jobs.`)
}

// ==============================
// Start
// ==============================
client.once('ready', async () => {
  console.log(`[BOT] Logged in as ${client.user.tag}`)

  try {
    if (!MODE_OR_CHANNEL) {
      console.error('❌ Usage:\n  - Bulk members backfill: node backfill.js members\n  - Bulk files backfill:   node backfill.js files\n  - Single-channel files:  node backfill.js <channelId>')
      process.exit(1)
    }

    if (MODE_OR_CHANNEL.toLowerCase() === 'members') {
      await runMembersBackfill()
    } else if (MODE_OR_CHANNEL.toLowerCase() === 'files') {
      await runFileBackfillAllJobs()
    } else {
      await runFileBackfillSingle(MODE_OR_CHANNEL)
    }
  } catch (e) {
    console.error('❌ Backfill error:', e)
    process.exit(1)
  }

  process.exit(0)
})

client.login(DISCORD_TOKEN)
