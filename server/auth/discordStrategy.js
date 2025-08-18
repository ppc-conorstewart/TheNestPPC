const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const {
  DISCORD_CALLBACK_URL,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET
} = require('../config/config');

passport.use(new DiscordStrategy(
  {
    clientID: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    callbackURL: DISCORD_CALLBACK_URL,
    scope: ['identify'],
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// Serialize / Deserialize
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

module.exports = passport;