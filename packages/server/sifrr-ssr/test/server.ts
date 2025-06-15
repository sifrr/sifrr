import express from 'express';
import serveStatic from 'serve-static';
import { dirname, join } from 'path';
import SifrrSeo from '@/index';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function afterRender() {
  return Promise.resolve();
}

const seo = new SifrrSeo({
  cacheKey: (url) => url,
  afterRender,
  puppeteerOptions: {
    headless: process.env.HEADLESS !== 'false'
  }
});

const server = express();
server.use(async (req, res, next) => {
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  try {
    const rendered = await seo.render(url, req.headers);
    if (rendered) {
      console.log('Rendered middleware ', url, rendered);
      res.set('content-type', 'text/html');
      res.set('x-ssr-powered-by', '@sifrr/ssr');
      res.send(rendered);
    } else {
      next();
    }
  } catch (e) {
    console.error(e);
    next();
  }
});

// Show total request time
if (process.env.NODE_ENV === 'development') {
  server.use(function (req, res, next) {
    const time = Date.now();
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
const baseDir = join(__dirname, '../../../');
server.use('/dom', serveStatic(join(baseDir, './browser/sifrr-dom/dist')));

// export server for importing
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
server.use(serveStatic(join(__dirname, './public')));

const port = parseInt(process.env.PORT ?? '6006');

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default server;
