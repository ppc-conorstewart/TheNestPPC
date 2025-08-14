// ==============================
// server/config/passport.js
// Passport init + (de)serialization + strategy wiring
// ==============================

const passport = require('passport');
const configureDiscordStrategy = require('../auth/discordStrategy');

// Basic (de)serialization – persist the whole profile for now
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Register strategies
configureDiscordStrategy(passport);

module.exports = passport;
