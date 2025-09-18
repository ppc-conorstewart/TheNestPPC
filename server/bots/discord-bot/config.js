// ==============================
// SECTIONS: Exports • Notes
// ==============================

module.exports = {
  token: process.env.DISCORD_TOKEN,
  nestApiUrl: process.env.NEST_API_URL,
  nestBotKey: process.env.NEST_BOT_KEY,
  guildId: process.env.DISCORD_GUILD_ID,
  port: Number(process.env.BOT_HTTP_PORT || process.env.PORT || 3020)
}
