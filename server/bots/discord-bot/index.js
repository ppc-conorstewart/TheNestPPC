// ==============================
// Discord Bot - File Collector
// ==============================

require('dotenv').config({ path: __dirname + '/.env' });

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// ==============================
// CONFIGURATION (env only)
// ==============================
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const API_BASE_URL = process.env.NEST_API_URL || 'http://localhost:3001/api';
const API_BOT_KEY = process.env.NEST_BOT_KEY || 'Paloma2025*';

// ==============================
// Discord.js Client Setup
// ==============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction]
});

// ==============================
// Util: Check If Attachment Should Be Uploaded
// ==============================
function shouldUpload(file) {
  const url = file.url || file.attachment;
  const name = file.name || '';
  const ext = path.extname(name).toLowerCase();
  if (ext === '.gif') return false;
  if (url && (url.includes('emojis') || url.includes('stickers'))) return false;
  return true;
}

// ==============================
// Util: Download Attachment Buffer
// ==============================
async function downloadBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch file: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

// ==============================
// Util: Find Job by Discord Channel ID
// ==============================
async function getJobIdByChannel(channelId) {
  const url = `${API_BASE_URL}/jobs`;
  const res = await fetch(url, { headers: { 'x-bot-key': API_BOT_KEY } });
  if (!res.ok) return null;
  const jobs = await res.json();
  const job = jobs.find(j => String(j.discord_channel_id) === String(channelId));
  return job ? job.id : null;
}

// ==============================
// Util: Upload File to Document Hub (Equipment Tab)
// ==============================
async function uploadFileToJob(jobId, file, authorName) {
  const fileBuffer = await downloadBuffer(file.url || file.attachment);
  const formData = new FormData();
  formData.append('file', fileBuffer, file.name || file.filename || 'file');
  formData.append('tab', 'Equipment');
  formData.append('uploaded_by', authorName || 'DiscordBot');

  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/files`, {
    method: 'POST',
    headers: { 'x-bot-key': API_BOT_KEY, ...formData.getHeaders() },
    body: formData
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error: ${res.status} ${errText}`);
  }
}

// ==============================
// Main Event: On Message Create
// ==============================
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.attachments || message.attachments.size === 0) return;

    const jobId = await getJobIdByChannel(message.channel.id);
    if (!jobId) return;

    for (const [, file] of message.attachments) {
      if (!shouldUpload(file)) continue;
      try {
        await uploadFileToJob(jobId, file, message.author.username);
        console.log(`[BOT] Uploaded file "${file.name}" from ${message.author.username} to job ${jobId}`);
      } catch (err) {
        console.error(`[BOT] Failed to upload file:`, err);
      }
    }
  } catch (err) {
    console.error('[BOT] Error in messageCreate:', err);
  }
});

// ==============================
// Startup
// ==============================
client.once('ready', () => {
  console.log(`[BOT] Discord bot is online as ${client.user.tag}`);
  console.log(`[BOT] Watching for file uploads in all channels...`);
});

client.login(DISCORD_TOKEN);
