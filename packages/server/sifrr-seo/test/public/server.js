const Seo = require('../../src/sifrr.seo');
/* istanbul ignore next */
async function afterRender() {
  // Wait till all sifrr elements are loaded
  if (typeof Sifrr === 'undefined' || typeof Sifrr.Dom === 'undefined') return false;
  await Sifrr.Dom.loading();
}

const seo = new Seo(['UC Browser'], {
  cacheKey: (url, headers) => url + (headers['x-user'] ? headers['x-user'] : ''),
  beforeRender: () => {
    // Force shadyDom (no shadow root)
    // eslint-disable-next-line no-undef
    ShadyDOM = { force: true };
  },
  afterRender
});

seo.addUserAgent('Opera Mini');
seo.setPuppeteerOption('headless', process.env.HEADLESS !== 'false');
seo.shouldRender = (url, headers) => {
  return seo._isUserAgent(headers) && url.indexOf('elements') === -1;
};

const express = require('express'),
  compression = require('compression'),
  serveStatic = require('serve-static'),
  path = require('path');

const server = express();

// Show total request time
if (global.ENV === 'development') {
  let time;
  server.use(function(req, res, next) {
    time = Date.now();
    function afterResponse() {
      res.removeListener('finish', afterResponse);

      // action after response
      global.console.log(
        '\x1b[36m%s\x1b[0m',
        `Request '${req.originalUrl}' took: ${Date.now() - time}ms`
      );
    }

    res.on('finish', afterResponse);

    // action before request
    next();
  });
}

// serve sifrr-fetch and sifrr-dom
const baseDir = path.join(__dirname, '../../../../');
server.use(serveStatic(path.join(baseDir, './browser/sifrr-dom/dist')));
server.use(serveStatic(path.join(baseDir, './browser/sifrr-fetch/dist')));
process.stdout.write('Serving sifrr-dom and sifrr-fetch \n');

// export server for importing
server.use(seo.getExpressMiddleware(expressReq => `${PATH}${expressReq.originalUrl}`));
server.use(compression());
server.get('/xuser', (req, res) => {
  res.set('content-type', 'text/html');
  res.send(`
    <html>
    <body>${JSON.stringify(req.headers)}<body>
    </html>
    `);
});
server.get('/nothtml', (req, res) => {
  res.set('content-type', 'text/random');
  res.send('nothtml');
});

server.post('/post', (req, res) => {
  res.set('content-type', 'text/html');
  res.send(`
    <html>
    <body>post<body>
    </html>
    `);
});
server.use(serveStatic(__dirname));
server.use(serveStatic(path.join(__dirname, '../../dist')));
server.use((req, res) => res.sendFile(path.join(__dirname, './index.html')));

let ss;

module.exports = {
  listen: port => (ss = server.listen(port)),
  close: () => {
    ss && ss.close();
    seo.close();
  }
};
