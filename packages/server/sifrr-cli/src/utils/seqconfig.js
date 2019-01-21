const path = require('path');

global.ENV = global.ENV || process.env.NODE_ENV || process.env.ENV || 'development';
const configFile = require(path.resolve('./.sequelizerc')).config;
const config = require(path.resolve(configFile))[ENV];

module.exports = config;
