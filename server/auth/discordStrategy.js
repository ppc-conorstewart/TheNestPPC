// ==============================
// server/auth/discordStrategy.js
// Wires Discord strategy into a provided Passport instance
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
        scope: ['identify', 'email'],
      },
      (accessToken, refreshToken, profile, done) => done(null, profile)
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));
};
