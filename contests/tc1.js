const { Contest } = require('../models.js');

module.exports = new Contest("Test contest", [], "This is a test disclaimer.",
    new Date("2023-08-10T15:54:00.000-05:00"), new Date("2023-08-15T20:30:00.000-05:00"), 0,
    [], [],
    0, new Set([]));