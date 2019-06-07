process.env.NODE_PATH = require('path').join(__dirname, './node_modules');
require('module').Module._initPaths();
module.exports = require('./benchmarks/sifrr');
