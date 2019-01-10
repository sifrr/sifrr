const Seo = require('../../src/sifrr.seo');
// Middleware
const seo = new Seo();
seo.addBot('Opera Mini');
// Middleware

const express = require('express'),
  compression = require('compression'),
  serveStatic = require('serve-static'),
  path = require('path');


let port = false;
const index = Math.max(process.argv.indexOf('--port'), process.argv.indexOf('-p'));
if (index !== -1) {
  port = +process.argv[index + 1];
}

let dir = __dirname;
const diri = Math.max(process.argv.indexOf('--dir'), process.argv.indexOf('-d'));
if (diri !== -1) {
  dir = path.join(__dirname, process.argv[diri + 1]);
}

const server = express();

// export server for importing
server.use(seo.middleware);
server.use(compression());
server.use(serveStatic(__dirname));
server.use(serveStatic(path.join(__dirname, '../../dist')));
server.use((req, res) => res.sendFile(path.join(__dirname, './index.html')));

// listen on port if port given
if (port) {
  server.listen(port, () => global.console.log(`Listening on port ${port} and directory '${dir}'`));
}

