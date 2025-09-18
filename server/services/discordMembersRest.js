// ===============================================
// FILE: server/services/discordMembersRest.js
// Provides a lightweight Discord REST fallback for member listings when the bot service is unavailable.
// ===============================================

const fetch = require('node-fetch')

const API_BASE = 'https://discord.com/api/v10'
const token = (process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN || '').trim()
const guildId = (process.env.DISCORD_GUILD_ID || process.env.DISCORD_GUILD || '').trim()
const cacheTtlMs = Number(process.env.DISCORD_MEMBERS_CACHE_MS || 60000)
const fetchLimit = 1000
const maxPages = 10

let cache = { data: null, expiresAt: 0 }
let inflightPromise = null

function isConfigured () {
  return Boolean(token && guildId)
}

function resolveAvatarUrl (member) {
  const user = member?.user || {}
  const userId = user.id
  if (member?.avatar && userId) {
    const hash = member.avatar
    const ext = hash.startsWith('a_') ? 'gif' : 'png'
    return `https://cdn.discordapp.com/guilds/${guildId}/users/${userId}/avatars/${hash}.${ext}?size=64`
  }
  if (user.avatar && userId) {
    const hash = user.avatar
    const ext = hash.startsWith('a_') ? 'gif' : 'png'
    return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${ext}?size=64`
  }
  const discriminator = typeof user.discriminator === 'string' ? user.discriminator : null
  let idx = 0
  if (discriminator && discriminator !== '0') {
    idx = Number(discriminator) % 5
  } else if (userId) {
    const last = userId.slice(-1)
    idx = Number.isInteger(Number(last)) ? Number(last) % 5 : 0
  }
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`
}

function shapeMember (member) {
  const user = member?.user || {}
  return {
    id: user.id,
    username: user.username,
    displayName: member.nick || user.global_name || user.display_name || user.username || '',
    avatar: resolveAvatarUrl(member)
  }
}

async function fetchPage (after) {
  const url = new URL(`${API_BASE}/guilds/${guildId}/members`)
  url.searchParams.set('limit', String(fetchLimit))
  if (after) url.searchParams.set('after', after)

  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${token}`
    }
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Discord REST error ${res.status}: ${body}`)
  }

  return res.json()
}

async function loadMembers () {
  if (!isConfigured()) {
    throw new Error('Discord REST fallback not configured (missing token or guild ID).')
  }

  const combined = []
  let after = undefined

  for (let page = 0; page < maxPages; page += 1) {
    const chunk = await fetchPage(after)
    if (!Array.isArray(chunk) || chunk.length === 0) break
    combined.push(...chunk)
    if (chunk.length < fetchLimit) break
    after = chunk[chunk.length - 1]?.user?.id
    if (!after) break
  }

  const shaped = combined
    .map(shapeMember)
    .filter(m => m.id && (m.username || m.displayName))

  cache = {
    data: shaped,
    expiresAt: Date.now() + cacheTtlMs
  }

  return shaped
}

async function fetchMembers () {
  const now = Date.now()
  if (cache.data && cache.expiresAt > now) {
    return cache.data
  }

  if (inflightPromise) {
    return inflightPromise
  }

  inflightPromise = loadMembers()

  try {
    return await inflightPromise
  } finally {
    inflightPromise = null
  }
}

module.exports = {
  isConfigured,
  fetchMembers
}
