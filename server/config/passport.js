// server/config/passport.js

const DiscordStrategy = require('passport-discord').Strategy;

module.exports = function(passport) {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  passport.use(
    new DiscordStrategy(
      {
        clientID:     process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL:  process.env.DISCORD_CALLBACK_URL,
        scope:        ['identify', 'email', 'guilds']
      },
      (accessToken, refreshToken, profile, done) => {
        // You can save or lookup the user in your DB here.
        // For now, just pass the profile through:
        return done(null, profile);
      }
    )
  );
};
