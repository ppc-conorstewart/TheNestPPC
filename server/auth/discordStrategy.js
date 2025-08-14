// ==============================
// server/auth/discordStrategy.js
// Configure Discord strategy with strict env validation
// ==============================

const { Strategy: DiscordStrategy } = require('passport-discord');
const cfg = require('../config/config');

// ==============================
// Helpers
// ==============================
function isNonEmpty(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

// ==============================
// Exported configurator
// ==============================
module.exports = function configureDiscordStrategy(passport) {
  const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_CALLBACK_URL
  } = cfg;

  const hasAll =
    isNonEmpty(DISCORD_CLIENT_ID) &&
    isNonEmpty(DISCORD_CLIENT_SECRET) &&
    isNonEmpty(DISCORD_CALLBACK_URL);

  if (!hasAll) {
    console.warn('[Auth] Skipping Discord strategy: missing/empty env vars.', {
      hasId: isNonEmpty(DISCORD_CLIENT_ID),
      hasSecret: isNonEmpty(DISCORD_CLIENT_SECRET),
      hasCallback: isNonEmpty(DISCORD_CALLBACK_URL)
    });

    // Still wire serializer/deserializer so req.login works without the strategy.
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));
    return;
  }

  passport.use(
    new DiscordStrategy(
      {
        clientID: DISCORD_CLIENT_ID.trim(),
        clientSecret: DISCORD_CLIENT_SECRET.trim(),
        callbackURL: DISCORD_CALLBACK_URL.trim(),
        scope: ['identify']
      },
      (accessToken, refreshToken, profile, done) => done(null, profile)
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));
};
