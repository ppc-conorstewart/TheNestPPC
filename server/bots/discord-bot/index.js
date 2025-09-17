// ==============================
// FILE: index.js — Paloma Discord Bot Service
// SECTIONS: Imports • Config • Discord Client • Express App • Auth Middleware • REST Endpoints • Startup
// ==============================

// ==============================
// Imports
// ==============================
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Client, GatewayIntentBits, Partials, ChannelType } = require('discord.js')
const fetch = require('node-fetch')
const { token, nestApiUrl, nestBotKey, guildId, port } = require('./config')

// ==============================
// Config
// ==============================
const app = express()
app.use(cors())
app.use(express.json())

// ==============================
// Discord Client
// ==============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message]
})

client.once('ready', () => {
  console.log(`[BOT] Logged in as ${client.user.tag}`)
})

// ==============================
// Express App — Auth Middleware
// ==============================
function requireBotKey(req, res, next) {
  const key = req.header('x-bot-key')
  if (!nestBotKey || key !== nestBotKey) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  next()
}
app.use(requireBotKey)

// ==============================
// REST Endpoints
// ==============================

// List members of the configured guild
app.get('/members', async (_req, res) => {
  try {
    const g = await client.guilds.fetch(guildId)
    const members = await g.members.fetch()
    const out = members.map(m => ({
      id: m.user.id,
      username: m.user.username,
      displayName: m.displayName
    }))
    res.json(out)
  } catch (e) {
    console.error('[BOT] /members error:', e)
    res.status(500).json({ error: 'failed_to_list_members' })
  }
})

// List text & announcement channels
app.get('/channels', async (_req, res) => {
  try {
    const g = await client.guilds.fetch(guildId)
    const channels = await g.channels.fetch()
    const out = channels
      .filter(ch => ch && [ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(ch.type))
      .map(ch => ({
        id: ch.id,
        name: ch.name,
        type: ch.type
      }))
    res.json(out)
  } catch (e) {
    console.error('[BOT] /channels error:', e)
    res.status(500).json({ error: 'failed_to_list_channels' })
  }
})

// Post an announcement to a channel by id or name
app.post('/announce', async (req, res) => {
  try {
    const { channelId, channelName, message, embed } = req.body || {}
    if (!message || (!channelId && !channelName)) {
      return res.status(400).json({ error: 'channel_and_message_required' })
    }

    const g = await client.guilds.fetch(guildId)
    let channel = null
    if (channelId) {
      channel = await g.channels.fetch(channelId)
    } else {
      const channels = await g.channels.fetch()
      channel = channels.find(ch => ch && ch.name === String(channelName))
    }
    if (!channel) return res.status(404).json({ error: 'channel_not_found' })

    const payload = embed ? { content: message, embeds: [embed] } : { content: message }
    const sent = await channel.send(payload)
    res.json({ ok: true, id: sent.id })
  } catch (e) {
    console.error('[BOT] /announce error:', e)
    res.status(500).json({ error: 'failed_to_announce' })
  }
})

// Lightweight test endpoint that never posts
app.post('/announce/test', async (req, res) => {
  try {
    const { channelId, channelName, message } = req.body || {}
    res.json({
      ok: true,
      echo: { channelId, channelName, message },
      note: 'No message was sent (test endpoint)'
    })
  } catch (e) {
    console.error('[BOT] /announce/test error:', e)
    res.status(500).json({ error: 'failed_to_test' })
  }
})

// ==============================
// Startup
// ==============================
async function start() {
  await client.login(token)
  app.listen(port, () => {
    console.log(`[BOT] HTTP listening on :${port}`)
    if (nestApiUrl) {
      // Optional heartbeat to the server (ignored if unreachable)
      fetch(nestApiUrl).catch(() => {})
    }
  })
}

start().catch(err => {
  console.error('[BOT] Startup error:', err)
  process.exit(1)
})
