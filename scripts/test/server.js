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
  dir = path.join(dir, process.argv[diri + 1]).split(',');
}

const server = express();

// export server for importing
const sss = function(port, dirs = dir) {
  server.use(compression());

  const toCover = process.env.COVERAGE === 'true';

  // serve sifrr-fetch and sifrr-dom
  const baseDir = path.join(__dirname, '../../');
  server.use(serveStatic(path.join(baseDir, './packages/browser/sifrr-dom/dist')));
  server.use(serveStatic(path.join(baseDir, './packages/browser/sifrr-fetch/dist')));
  process.stdout.write('Serving sifrr-dom and sifrr-fetch');

  // serve all directories
  if (!Array.isArray(dirs)) dirs = [dirs];
  dirs.forEach(dirS => {
    server.use(serveStatic(dirS));

    if (toCover) {
      const { createInstrumenter } = require('istanbul-lib-instrument');
      const instrumenter = createInstrumenter();
      const st = staticTransform({
        root: path.join(dirS, '../../dist'),
        match: /.+\.js/,
        transform: function (path, text, send) {
          send(instrumenter.instrumentSync(text, path, JSON.parse(fs.readFileSync(path + '.map'))));
        }
      });
      server.use(st);
    } else {
      server.use(serveStatic(path.join(dirS, '../../dist')));
    }

    server.use((req, res) => res.sendFile(path.join(dirS, './index.html')));
  });

  return server.listen(port, () => global.console.log(`Listening on port ${port} and directories`, dirs));
};

// listen on port if port given
if (port) {
  sss(port);
}

module.exports = sss;
