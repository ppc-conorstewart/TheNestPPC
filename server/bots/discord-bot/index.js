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
const { Client, GatewayIntentBits, Partials, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const fetch = require('node-fetch')
const { token, nestApiUrl, nestBotKey, guildId, port } = require('./config')

const resolveAttachmentUrl = (rawUrl) => {
  if (!rawUrl) return null
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl
  if (!nestApiUrl) return null
  const base = nestApiUrl.replace(/\/+$/, '')
  const suffix = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  return `${base}${suffix}`
}

const normalizeAttachments = (attachments) => {
  const list = []
  if (Array.isArray(attachments)) {
    for (const entry of attachments) {
      if (!entry) continue
      if (typeof entry === 'string') list.push({ url: entry })
      else if (entry.url) list.push({ url: entry.url, name: entry.name })
    }
  } else if (attachments && typeof attachments === 'object') {
    if (attachments.url) list.push({ url: attachments.url, name: attachments.name })
  }
  return list
}

const fetchAttachmentBuffers = async (attachmentList) => {
  const files = []
  for (const att of attachmentList) {
    const resolved = resolveAttachmentUrl(att.url)
    if (!resolved) {
      console.warn('[BOT] Skipping attachment without resolvable URL:', att)
      continue
    }
    try {
      const response = await fetch(resolved)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const fallbackName = att.name || resolved.split('/').filter(Boolean).pop() || `attachment-${files.length + 1}`
      files.push({ attachment: buffer, name: fallbackName })
    } catch (err) {
      console.error(`[BOT] Failed to fetch attachment from ${resolved}:`, err)
    }
  }
  return files
}

const buildComponents = (rawRows) => {
  if (!Array.isArray(rawRows)) return []
  const rows = []
  for (const rawRow of rawRows) {
    if (!rawRow || !Array.isArray(rawRow.components)) continue
    const rowBuilder = new ActionRowBuilder()
    for (const rawComponent of rawRow.components) {
      if (!rawComponent) continue
      if ((rawComponent.type ?? rawComponent.component_type) !== 2) continue
      const customId = rawComponent.custom_id || rawComponent.customId
      if (!customId) continue
      try {
        const button = new ButtonBuilder()
          .setCustomId(customId)
          .setLabel(rawComponent.label || 'Button')
          .setStyle(typeof rawComponent.style === 'number' ? rawComponent.style : ButtonStyle.Secondary)
        if (rawComponent.disabled) button.setDisabled(true)
        if (rawComponent.emoji) button.setEmoji(rawComponent.emoji)
        rowBuilder.addComponents(button)
      } catch (err) {
        console.error('[BOT] Failed to build button component:', err)
      }
    }
    if (rowBuilder.components.length) rows.push(rowBuilder)
  }
  return rows
}

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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User]
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
    const { channelId, channelName, message, embed, attachments, components } = req.body || {}
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

    const attachmentList = normalizeAttachments(attachments)
    const files = await fetchAttachmentBuffers(attachmentList)
    const componentRows = buildComponents(components)

    const payload = embed ? { content: message, embeds: [embed] } : { content: message }
    if (files.length) payload.files = files
    if (componentRows.length) payload.components = componentRows
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

// Send direct messages to one or more users
app.post('/dm', async (req, res) => {
  try {
    const { userId, userIds, message, attachments } = req.body || {}
    const ids = new Set()
    if (userId) ids.add(String(userId))
    if (Array.isArray(userIds)) {
      for (const id of userIds) {
        if (id) ids.add(String(id))
      }
    }
    if (!ids.size || !message) {
      return res.status(400).json({ error: 'userIds_and_message_required' })
    }

    const attachmentList = normalizeAttachments(attachments)
    const retrievedFiles = await fetchAttachmentBuffers(attachmentList)

    const results = []
    for (const id of ids) {
      try {
        const user = await client.users.fetch(id)
        if (!user) throw new Error('user_not_found')
        const files = retrievedFiles.map(file => ({ attachment: Buffer.from(file.attachment), name: file.name }))
        const componentRows = buildComponents(req.body.components)
        const payload = { content: message }
        if (files.length) payload.files = files
        if (componentRows.length) payload.components = componentRows
        const sent = await user.send(payload)
        results.push({ userId: id, ok: true, messageId: sent.id })
      } catch (err) {
        console.error(`[BOT] DM to ${id} failed:`, err)
        results.push({ userId: id, ok: false, reason: String(err?.message || err) })
      }
    }

    const ok = results.some(r => r.ok)
    res.status(ok ? 200 : 500).json({ ok, results })
  } catch (e) {
    console.error('[BOT] /dm error:', e)
    res.status(500).json({ error: 'failed_to_dm' })
  }
})

client.on('interactionCreate', async interaction => {
  try {
    if (!interaction.isButton()) return
    if (!interaction.customId || !interaction.customId.startsWith('ack:')) return
    if (!nestApiUrl) {
      await interaction.reply({ content: 'Action item service unavailable.', ephemeral: true })
      return
    }

    const [, itemId, token] = interaction.customId.split(':')
    if (!itemId || !token) {
      await interaction.reply({ content: 'Invalid acknowledgement payload.', ephemeral: true })
      return
    }

    let response
    try {
      const ackRes = await fetch(`${nestApiUrl.replace(/\/+$/, '')}/api/hq/action-items/${itemId}/ack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-bot-key': nestBotKey },
        body: JSON.stringify({ token, userId: interaction.user.id })
      })
      response = await ackRes.json().catch(() => ({}))
      if (!ackRes.ok) {
        const note = response?.error || `Failed with status ${ackRes.status}`
        await interaction.reply({ content: `Unable to acknowledge: ${note}`, ephemeral: true })
        return
      }
    } catch (err) {
      console.error('[BOT] Ack request failed:', err)
      await interaction.reply({ content: 'Unable to acknowledge at this time.', ephemeral: true })
      return
    }

    const updatedComponents = interaction.message.components?.map(row => {
      const rowBuilder = new ActionRowBuilder()
      row.components.forEach(component => {
        if (component.type !== 2) return
        const button = ButtonBuilder.from(component)
        if ((component.customId || component.custom_id) === interaction.customId) {
          button.setLabel('Acknowledged').setStyle(ButtonStyle.Success).setDisabled(true)
        } else {
          button.setDisabled(true)
        }
        rowBuilder.addComponents(button)
      })
      return rowBuilder
    }).filter(row => row && row.components.length) || []

    await interaction.update({ components: updatedComponents })
    await interaction.followUp({ content: 'Acknowledged. Thank you!', ephemeral: true })
  } catch (err) {
    console.error('[BOT] interaction handler error:', err)
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
