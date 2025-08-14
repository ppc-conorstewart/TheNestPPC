// ==============================
// server/config/passport.js
// Initialized Passport instance (exported object)
// ==============================

const passport = require('passport');
const configureDiscordStrategy = require('../auth/discordStrategy');

configureDiscordStrategy(passport);

module.exports = passport;
