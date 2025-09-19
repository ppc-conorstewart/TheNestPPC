// ==============================
// Discord Bot - Backfill Script
// SECTIONS: Imports • Config • Discord Client • API • Utils • Backfill: Files • Backfill: Members • Start
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

const MODE_OR_CHANNEL = process.argv[2] || '' // "members" OR <channelId>

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
  const name = file.name || ''
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

// ==============================
// Backfill: Files (Per-Channel)
// ==============================
async function runFileBackfill(channelId) {
  console.log(`[BOT] Starting file backfill for channel ${channelId}`)
  const channel = await client.channels.fetch(channelId)
  if (!channel) {
    console.error(`❌ Could not find channel with ID ${channelId}`)
    process.exit(1)
  }

  const jobId = await getJobIdByChannel(channelId)
  if (!jobId) {
    console.error(`❌ No job found for channel ID ${channelId}`)
    process.exit(1)
  }

  let lastId
  let fetchedCount = 0
  while (true) {
    const options = { limit: 100 }
    if (lastId) options.before = lastId

    const messages = await channel.messages.fetch(options)
    if (messages.size === 0) break

    for (const [, message] of messages) {
      if (!message.attachments || message.attachments.size === 0) continue

      for (const [, file] of message.attachments) {
        if (!shouldUpload(file)) continue
        try {
          await uploadFileToJob(jobId, file, message.author.username)
          console.log(`[BOT] Uploaded "${file.name}" from ${message.author.username}`)
        } catch (err) {
          console.error(`[BOT] Failed to upload file:`, err)
        }
      }
    }

    fetchedCount += messages.size
    lastId = messages.last().id
    console.log(`[BOT] Processed ${fetchedCount} messages so far.`)
  }

  console.log(`[BOT] File backfill complete for job ${jobId}`)
}

// ==============================
// Backfill: Members (Bulk)
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
      console.error('❌ Usage:\n  - Bulk members backfill: node backfill.js members\n  - File backfill for a channel: node backfill.js <channelId>')
      process.exit(1)
    }

    if (MODE_OR_CHANNEL.toLowerCase() === 'members') {
      await runMembersBackfill()
    } else {
      await runFileBackfill(MODE_OR_CHANNEL)
    }
  } catch (e) {
    console.error('❌ Backfill error:', e)
    process.exit(1)
  }

  process.exit(0)
})

client.login(DISCORD_TOKEN)
