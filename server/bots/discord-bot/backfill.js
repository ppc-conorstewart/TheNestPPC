// ==============================
// Discord Bot - Backfill Script
// SECTIONS: Imports • Config • Discord Client • Utils • Backfill Logic • Start
// ==============================

require('dotenv').config()

const { Client, GatewayIntentBits, Partials } = require('discord.js')
const fetch = require('node-fetch')
const FormData = require('form-data')
const path = require('path')

// ==============================
// Config
// ==============================
const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const API_BASE_URL = process.env.NEST_API_URL || 'http://localhost:3001/api'
const API_BOT_KEY = process.env.NEST_BOT_KEY

const CHANNEL_ID = process.argv[2] // e.g. node backfill.js 123...

if (!CHANNEL_ID) {
  console.error('❌ Please provide a channel ID: node backfill.js <channelId>')
  process.exit(1)
}

// ==============================
// Discord Client
// ==============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
})

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

async function getJobIdByChannel(channelId) {
  const url = `${API_BASE_URL}/jobs`
  const res = await fetch(url, {
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
  formData.append('tab', 'Equipment') // match UI tab exactly
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
// Backfill Logic
// ==============================
client.once('ready', async () => {
  console.log(`[BOT] Logged in as ${client.user.tag}`)
  const channel = await client.channels.fetch(CHANNEL_ID)
  if (!channel) {
    console.error(`❌ Could not find channel with ID ${CHANNEL_ID}`)
    process.exit(1)
  }

  const jobId = await getJobIdByChannel(CHANNEL_ID)
  if (!jobId) {
    console.error(`❌ No job found for channel ID ${CHANNEL_ID}`)
    process.exit(1)
  }

  console.log(`[BOT] Starting backfill for job ${jobId} from channel ${channel.name}`)

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
          console.log(`[BOT] Uploaded file "${file.name}" from ${message.author.username}`)
        } catch (err) {
          console.error(`[BOT] Failed to upload file:`, err)
        }
      }
    }

    fetchedCount += messages.size
    lastId = messages.last().id
    console.log(`[BOT] Processed ${fetchedCount} messages so far.`)
  }

  console.log(`[BOT] Backfill complete for job ${jobId}`)
  process.exit(0)
})

// ==============================
// Start
// ==============================
client.login(DISCORD_TOKEN)
