// ==============================
// server/auth/discordStrategy.js
// Passport Discord strategy configuration
// ==============================

const { Strategy: DiscordStrategy } = require('passport-discord');
const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_CALLBACK_URL,
} = require('../config/config');

module.exports = function configureDiscordStrategy(passport) {
  passport.use(
    new DiscordStrategy(
      {
        clientID: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        callbackURL: DISCORD_CALLBACK_URL,
        scope: ['identify', 'email'], // add 'guilds' later if needed
      },
      (accessToken, refreshToken, profile, done) => {
        // Pass the Discord profile through; attach tokens if you plan to store/use them later
        return done(null, profile);
      }
    )
  );
};
