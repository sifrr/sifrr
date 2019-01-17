const Seo = require('../../src/sifrr.seo');
// Middleware
const seo = new Seo();
seo.addUserAgent('Opera Mini');
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

// Show total request time
const ENV = process.env.NODE_ENV || process.env.ENV || 'development';
if (ENV === 'development') {
  let time;
  server.use(function (req, res, next) {
    time = Date.now();
    function afterResponse() {
      res.removeListener('finish', afterResponse);

      // action after response
      global.console.log('\x1b[36m%s\x1b[0m', `Request '${req.originalUrl}' took: ${Date.now() - time}ms`);
    }

    res.on('finish', afterResponse);

    // action before request
    next();
  });
}

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

