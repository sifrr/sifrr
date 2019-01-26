const express = require('express'),
  compression = require('compression'),
  serveStatic = require('serve-static'),
  staticTransform = require('connect-static-transform'),
  fs = require('fs'),
  path = require('path');

let port = false;
const index = Math.max(process.argv.indexOf('--port'), process.argv.indexOf('-p'));
if (index !== -1) {
  port = +process.argv[index + 1];
}

let dir = path.join(__dirname, '../../');
const diri = Math.max(process.argv.indexOf('--dir'), process.argv.indexOf('-d'));
if (diri !== -1) {
  dir = path.join(dir, process.argv[diri + 1]);
}

const server = express();

// export server for importing
const sss = function(port, dirS = dir) {
  server.use(compression());

  const toCover = process.env.COVERAGE === 'true';



  if (toCover) {
    const { createInstrumenter } = require('istanbul-lib-instrument');
    const instrumenter = createInstrumenter();
    const st = staticTransform({
      root: path.join(dirS),
      match: /.+\.js/,
      transform: function (path, text, send) {
        if (fs.existsSync(path + '.map')) {
          send(instrumenter.instrumentSync(text, path, JSON.parse(fs.readFileSync(path + '.map'))), { 'content-type': 'application/javascript; charset=UTF-8' });
        } else {
          send(text);
        }
      }
    });
    const st2 = staticTransform({
      root: path.join(dirS, '../../dist'),
      match: /.+\.js/,
      transform: function (path, text, send) {
        if (fs.existsSync(path + '.map')) {
          send(instrumenter.instrumentSync(text, path, JSON.parse(fs.readFileSync(path + '.map'))), { 'content-type': 'application/javascript; charset=UTF-8' });
        } else {
          send(text);
        }
      }
    });
    server.use(st);
    server.use(st2);
    server.use(serveStatic(dirS));
  } else {
    // serve test public directories
    server.use(serveStatic(dirS));
    server.use(serveStatic(path.join(dirS, '../../dist')));
  }

  // serve sifrr-fetch and sifrr-dom
  const baseDir = path.join(__dirname, '../../');
  server.use(serveStatic(path.join(baseDir, './packages/browser/sifrr-dom/dist')));
  server.use(serveStatic(path.join(baseDir, './packages/browser/sifrr-fetch/dist')));
  process.stdout.write('Serving sifrr-dom and sifrr-fetch \n');

  server.use((req, res) => res.sendFile(path.join(dirS, './index.html')));

  return server.listen(port, () => global.console.log(`Listening on port ${port} and directories`, dirS));
};

// listen on port if port given
if (port) {
  sss(port);
}

module.exports = sss;
