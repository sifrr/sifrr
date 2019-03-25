const { App, writeHeaders } = require('../../../src/sifrr.server');
const path = require('path');

const app = new App();

app.folder('', path.join(__dirname, 'public/compress'), {
  headers: {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': '*'
  },
  compress: true
});

app.file('/random/:pattern', path.join(__dirname, 'public/random.html'), {
  headers: {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': '*'
  },
  compress: false
});

app.options('/*', res => {
  writeHeaders(res, {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': '*'
  });
  writeHeaders(res, 'access-control-allow-headers', 'content-type');
  res.end();
});

app.post('/stream', res => {
  res.onAborted(err => { if (err) throw Error(err); });

  res.writeHeader('access-control-allow-origin', '*');
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

  res.writeHeader('access-control-allow-origin', '*');
  res.writeHeader('content-type', 'application/json');
  if (typeof res.formData === 'function') {
    res.formData({
      tmpDir: path.join(__dirname, './public/tmp')
    }).then(resp => {
      res.end(JSON.stringify(resp));
    });
  }
});

app.load(path.join(__dirname, './routes'));

module.exports = app;
