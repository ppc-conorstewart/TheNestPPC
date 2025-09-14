// ==============================
// FILE: bots/nest-bot/index.js
// Sections: Env • Discord Setup • Caching • Server Fetch Helpers • Event Handlers • HTTP API (Health • Members • DM • Channels • Announce • Server Data Proxies) • Startup
// ==============================

require('dotenv').config({ path: __dirname + '/.env' });

const { Client, GatewayIntentBits, Partials, ChannelType } = require('discord.js');
const fetch = require('node-fetch');
const FormData = require('form-data');
const express = require('express');
const cors = require('cors');
const path = require('path');

// ==============================
// Env
// ==============================
const DISCORD_TOKEN   = process.env.DISCORD_TOKEN;
const GUILD_ID        = process.env.DISCORD_GUILD_ID;
const API_BASE_URL    = (process.env.NEST_API_URL || 'http://localhost:3001/api').replace(/\/+$/,'');
const API_BOT_KEY     = process.env.NEST_BOT_KEY || 'Paloma2025*';
const BOT_HTTP_PORT   = Number(process.env.BOT_HTTP_PORT || 3020);

// ==============================
// Discord Setup
// ==============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message]
});

// ==============================
// Caching
// ==============================
const cache = new Map(); // key -> { at, ttl, value }
function setCache(key, value, ttlMs = 60_000) {
  cache.set(key, { at: Date.now(), ttl: ttlMs, value });
}
function getCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > hit.ttl) { cache.delete(key); return null; }
  return hit.value;
}

// ==============================
// Server Fetch Helpers
// ==============================
async function apiGet(pathname) {
  const url = `${API_BASE_URL}${pathname}`;
  const r = await fetch(url, { headers: { 'x-bot-key': API_BOT_KEY } });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}
async function apiPost(pathname, body) {
  const url = `${API_BASE_URL}${pathname}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bot-key': API_BOT_KEY },
    body: JSON.stringify(body || {})
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
}
async function downloadBuffer(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}
function shouldUpload(file) {
  const url = file.url || file.attachment;
  const name = file.name || '';
  const ext = path.extname(name).toLowerCase();
  if (ext === '.gif') return false;
  if (url && (url.includes('emojis') || url.includes('stickers'))) return false;
  return true;
}

// ==============================
// Event Handlers
// ==============================
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.attachments || message.attachments.size === 0) return;

    // Pull jobs list from server and map discord_channel_id -> job.id
    const jobsKey = 'jobs:list';
    let jobs = getCache(jobsKey);
    if (!jobs) {
      jobs = await apiGet('/jobs');
      setCache(jobsKey, jobs, 60_000);
    }
    const match = jobs.find(j => String(j.discord_channel_id) === String(message.channel.id));
    if (!match) return;

    for (const [, file] of message.attachments) {
      if (!shouldUpload(file)) continue;
      try {
        const buf = await downloadBuffer(file.url || file.attachment);
        const form = new FormData();
        form.append('file', buf, file.name || file.filename || 'file');
        form.append('tab', 'Equipment');
        form.append('uploaded_by', message.author.username || 'DiscordBot');

        const r = await fetch(`${API_BASE_URL}/jobs/${match.id}/files`, {
          method: 'POST',
          headers: { 'x-bot-key': API_BOT_KEY, ...form.getHeaders() },
          body: form
        });
        if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
        console.log(`[BOT] Uploaded "${file.name}" to job ${match.id}`);
      } catch (err) {
        console.error('[BOT] File upload failed:', err);
      }
    }
  } catch (err) {
    console.error('[BOT] messageCreate error:', err);
  }
});

// ==============================
// HTTP API (Health • Members • DM • Channels • Announce • Server Data Proxies)
// ==============================
const api = express();
api.use(cors());
api.use(express.json());

// Auth
api.use((req, res, next) => {
  if (req.headers['x-bot-key'] !== API_BOT_KEY) return res.status(401).json({ error: 'unauthorized' });
  next();
});

// ----- Health -----
api.get('/healthz', async (_req, res) => {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    res.json({
      ok: true,
      bot: client.user ? client.user.tag : null,
      guild: { id: guild.id, name: guild.name },
      time: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

// ----- Members -----
api.get('/members', async (_req, res) => {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const members = await guild.members.fetch();
    const list = members.map(m => ({
      id: m.user.id,
      username: m.user.username,
      displayName: m.displayName || m.user.username,
      avatar: m.user.displayAvatarURL({ size: 64, extension: 'png' })
    })).sort((a, b) => a.displayName.localeCompare(b.displayName));
    res.json(list);
  } catch (e) {
    console.error('[BOT] /members error:', e);
    res.status(500).json({ error: 'failed_to_fetch_members' });
  }
});

// ----- DM -----
api.post('/dm', async (req, res) => {
  try {
    const { userId, message, attachmentUrl, attachmentName } = req.body || {};
    if (!userId || !message) return res.status(400).json({ error: 'userId_and_message_required' });

    const user = await client.users.fetch(userId);
    if (attachmentUrl) {
      try {
        const absolute = attachmentUrl.startsWith('http')
          ? attachmentUrl
          : `${API_BASE_URL.replace(/\/api$/,'')}${attachmentUrl}`;
        const buf = await downloadBuffer(absolute);
        await user.send({ content: message, files: [{ attachment: buf, name: attachmentName || 'attachment' }] });
      } catch (e) {
        console.warn('[BOT] /dm attachment failed, fallback to text:', e.message || e);
        await user.send(message);
      }
    } else {
      await user.send(message);
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('[BOT] /dm error:', e);
    res.status(500).json({ error: 'failed_to_dm' });
  }
});

// ----- Channels (text/announcements/threads) -----
api.get('/channels', async (_req, res) => {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const channels = await guild.channels.fetch();
    const allowed = [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread];
    const list = channels
      .filter(ch => ch && allowed.includes(ch.type))
      .map(ch => ({ id: ch.id, name: ch.name, type: ch.type, position: ch.rawPosition ?? 0 }))
      .sort((a, b) => a.position - b.position);
    res.json(list);
  } catch (e) {
    console.error('[BOT] /channels error:', e);
    res.status(500).json({ error: 'failed_to_fetch_channels' });
  }
});

// ----- Announce (multi) -----
api.post('/announce', async (req, res) => {
  try {
    const { channelIds, content } = req.body || {};
    if (!Array.isArray(channelIds) || channelIds.length === 0 || !content) {
      return res.status(400).json({ error: 'channelIds_and_content_required' });
    }
    const guild = await client.guilds.fetch(GUILD_ID);
    const results = [];
    for (const id of channelIds) {
      try {
        const ch = await guild.channels.fetch(id);
        if (!ch || ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(ch.type)) {
          results.push({ id, ok: false, reason: 'unsupported_channel_type' });
          continue;
        }
        await ch.send({ content });
        results.push({ id, ok: true });
      } catch (e) {
        results.push({ id, ok: false, reason: String(e.message || e) });
      }
    }
    res.json({ ok: true, results });
  } catch (e) {
    console.error('[BOT] /announce error:', e);
    res.status(500).json({ error: 'failed_to_announce' });
  }
});

// ----- Announce Test (single) -----
api.post('/announce/test', async (req, res) => {
  try {
    const { channelId, content = 'Test from The NEST' } = req.body || {};
    if (!channelId) return res.status(400).json({ error: 'channelId_required' });
    const guild = await client.guilds.fetch(GUILD_ID);
    const ch = await guild.channels.fetch(channelId);
    await ch.send({ content });
    res.json({ ok: true });
  } catch (e) {
    console.error('[BOT] /announce/test error:', e);
    res.status(500).json({ error: 'failed_to_send_test' });
  }
});

// ----- Server Data Proxies (read-through cache) -----
// Jobs
api.get('/server/jobs', async (_req, res) => {
  try {
    const key = 'jobs:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/jobs'); setCache(key, data, 60_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// Customers
api.get('/server/customers', async (_req, res) => {
  try {
    const key = 'customers:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/customers'); setCache(key, data, 5 * 60_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// Assets
api.get('/server/assets', async (_req, res) => {
  try {
    const key = 'assets:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/assets'); setCache(key, data, 60_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// Projects
api.get('/server/projects', async (_req, res) => {
  try {
    const key = 'projects:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/projects'); setCache(key, data, 5 * 60_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// Activity
api.get('/server/activity', async (_req, res) => {
  try {
    const key = 'activity:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/activity'); setCache(key, data, 30_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// Workorders
api.get('/server/workorders', async (_req, res) => {
  try {
    const key = 'workorders:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/workorders'); setCache(key, data, 60_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// GLB Assets
api.get('/server/glb-assets', async (_req, res) => {
  try {
    const key = 'glb-assets:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/glb-assets'); setCache(key, data, 5 * 60_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// Sourcing
api.get('/server/sourcing', async (_req, res) => {
  try {
    const key = 'sourcing:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/sourcing'); setCache(key, data, 5 * 60_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// Transfers
api.get('/server/transfers', async (_req, res) => {
  try {
    const key = 'transfers:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/transfers'); setCache(key, data, 2 * 60_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// Master Assignments
api.get('/server/master-assignments', async (_req, res) => {
  try {
    const key = 'master:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/master'); setCache(key, data, 5 * 60_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// Field Docs
api.get('/server/field-docs', async (_req, res) => {
  try {
    const key = 'field-docs:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/field-docs'); setCache(key, data, 10 * 60_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// Service Equipment
api.get('/server/service-equipment', async (_req, res) => {
  try {
    const key = 'service-equipment:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/service-equipment'); setCache(key, data, 5 * 60_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// MFV Pads
api.get('/server/mfv', async (_req, res) => {
  try {
    const key = 'mfv:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/mfv'); setCache(key, data, 10 * 60_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// Documents
api.get('/server/documents', async (_req, res) => {
  try {
    const key = 'documents:list';
    let data = getCache(key);
    if (!data) { data = await apiGet('/documents'); setCache(key, data, 10 * 60_000); }
    res.json(data);
  } catch (e) { res.status(502).json({ error: 'server_unavailable' }); }
});

// ==============================
// Startup
// ==============================
client.once('ready', () => {
  console.log(`[BOT] Discord bot is online as ${client.user.tag}`);
  api.listen(BOT_HTTP_PORT, () => console.log(`[BOT] HTTP control API listening on :${BOT_HTTP_PORT}`));
});
client.login(DISCORD_TOKEN);
