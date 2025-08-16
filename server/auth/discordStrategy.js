// ==============================
// server/auth/discordStrategy.js
// Always register a 'discord' strategy.
// - If env vars are set -> real Discord OAuth.
// - If missing -> safe stub so routes never throw "Unknown strategy".
// ==============================

const { Strategy: DiscordStrategy } = require('passport-discord');
const cfg = require('../config/config');

const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;

module.exports = function configureDiscordStrategy(passport) {
  const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_CALLBACK_URL
  } = cfg;

  const hasAll =
    nonEmpty(DISCORD_CLIENT_ID) &&
    nonEmpty(DISCORD_CLIENT_SECRET) &&
    nonEmpty(DISCORD_CALLBACK_URL);

  if (hasAll) {
    // Real Discord OAuth
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
    console.log('[Auth] Discord strategy registered (real).');
  } else {
    // Stub strategy to prevent "Unknown strategy 'discord'"
    passport.use({
      name: 'discord',
      authenticate() {
        const detail = {
          hasId: nonEmpty(DISCORD_CLIENT_ID),
          hasSecret: nonEmpty(DISCORD_CLIENT_SECRET),
          hasCallback: nonEmpty(DISCORD_CALLBACK_URL)
        };
        console.warn('[Auth] Discord OAuth not configured. Using stub strategy.', detail);
        this.fail({ message: 'Discord OAuth not configured', detail }, 503);
      }
    });
    console.warn('[Auth] Discord strategy registered (stub).');
  }

  // Session (works in both cases)
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));
};
