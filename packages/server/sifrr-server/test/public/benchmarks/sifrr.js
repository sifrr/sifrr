const { App, writeHeaders } = require('../../../src/sifrr.server');
const path = require('path');
const memoryCache = require('cache-manager').caching({ store: 'memory', max: 100, ttl: 0 });

const app = new App();
const headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': '*',
  Connection: 'keep-alive'
};

app.folder('', path.join(__dirname, 'public/compress'), {
  headers,
  compress: true
});

app.file('/random/:pattern', path.join(__dirname, 'public/random.html'), {
  headers
});

app.options('/*', res => {
  writeHeaders(res, headers);
  writeHeaders(res, 'access-control-allow-headers', 'content-type');
  res.end();
});

app.get('/empty', res => {
  res.end();
});

app.post('/stream', res => {
  res.onAborted(err => { if (err) throw Error(err); });

  for (let h in headers) {
    writeHeaders(res, h, headers[h]);
  }
  res.writeHeader('content-type', 'application/json');
  if (typeof res.formData === 'function') {
    res.formData({
      // onFile pr tmpDir required else promise will not resolve if there are files
      onFile: (fieldname, file) => {
        file.resume();
      },
      onField: () => {}
    }).then(resp => {
      res.end(JSON.stringify(resp));
    });
  }
});

app.post('/tmpdir', res => {
  res.onAborted(err => { if (err) throw Error(err); });

  for (let h in headers) {
    writeHeaders(res, h, headers[h]);
  }
  res.writeHeader('content-type', 'application/json');
  if (typeof res.formData === 'function') {
    res.formData({
      tmpDir: path.join(__dirname, './public/tmp'),
      filename: (f) => f.indexOf('all.js') > -1 ? 'some.js' : f
    }).then(resp => {
      res.end(JSON.stringify(resp));
    });
  }
});

app.load(path.join(__dirname, './routes'));
app.load(path.join(__dirname, './routes/prefix.js'));

app.file('/cache.html', path.join(__dirname, 'public/cache.html'), {
  headers,
  cache: memoryCache,
  overwriteRoute: true
});

app.file('/cache_compress', path.join(__dirname, 'public/cache.html'), {
  headers,
  cache: memoryCache,
  compress: true
});

module.exports = app;
