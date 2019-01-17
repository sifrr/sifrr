const express = require('express'),
  compression = require('compression'),
  serveStatic = require('serve-static'),
  path = require('path');

let port = false;
const index = Math.max(process.argv.indexOf('--port'), process.argv.indexOf('-p'));
if (index !== -1) {
  port = +process.argv[index + 1];
}

let dir = path.join(__dirname, '../');
const diri = Math.max(process.argv.indexOf('--dir'), process.argv.indexOf('-d'));
if (diri !== -1) {
  dir = path.join(dir, process.argv[diri + 1]).split(',');
}

const server = express();

// export server for importing

const sss = function(port, dirs = dir) {
  server.use(compression());

  // serve all directories
  if (!Array.isArray(dirs)) dirs = [dirs];
  dirs.forEach(dirS => {
    server.use(serveStatic(dirS));
    server.use(serveStatic(path.join(dirS, '../../dist')));
  });

  return server.listen(port, () => global.console.log(`Listening on port ${port} and directories`, dirs));
};

// listen on port if port given
if (port) {
  sss(port);
}

module.exports = sss;
