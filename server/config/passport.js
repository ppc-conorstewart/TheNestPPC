// ==============================
// server/config/passport.js
// Exports an initialized Passport instance
// ==============================

const passport = require('passport');
const configureDiscordStrategy = require('../auth/discordStrategy');

configureDiscordStrategy(passport);

module.exports = passport;
