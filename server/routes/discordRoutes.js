// ==============================
// FILE: bots/nest-bot/routes/discordRoutes.js
// Sections: Exports • Routes (/announce, /announce/test, /schedule - stub)
// ==============================

const { ChannelType } = require('discord.js');

module.exports = function mountDiscordRoutes(ctx) {
  const { api, client, guildId } = ctx;

  // ----- POST /announce : send to one or more channels -----
  api.post('/announce', async (req, res) => {
    try {
      const { channelIds, content } = req.body || {};
      if (!Array.isArray(channelIds) || channelIds.length === 0 || !content) {
        return res.status(400).json({ error: 'channelIds_and_content_required' });
      }
      const guild = await client.guilds.fetch(guildId);
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

  // ----- POST /announce/test : send to a single channel (smoke test) -----
  api.post('/announce/test', async (req, res) => {
    try {
      const { channelId, content = 'Test from The NEST' } = req.body || {};
      if (!channelId) return res.status(400).json({ error: 'channelId_required' });
      const guild = await client.guilds.fetch(guildId);
      const ch = await guild.channels.fetch(channelId);
      await ch.send({ content });
      res.json({ ok: true });
    } catch (e) {
      console.error('[BOT] /announce/test error:', e);
      res.status(500).json({ error: 'failed_to_send_test' });
    }
  });

  // ----- POST /schedule (stub for future scheduler) -----
  api.post('/schedule', async (_req, res) => {
    // Placeholder: integrate with your server scheduler / CRON later.
    res.json({ ok: true, note: 'scheduler not yet implemented' });
  });
};
