var mongoose = require('mongoose');

var configDB = require('../config/database.js');

mongoose.set('debug', true);

mongoose.connect(configDB.url), configDB.options;

module.exports = mongoose;