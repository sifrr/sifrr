const express = require('express');
const compression = require('compression');
const app = express();
const path = require('path');

app.get('/empty', (req, res) => {
  res.send();
});
app.use((req, res, next) => {
  res.set('access-control-allow-origin', '*');
  res.set('access-control-allow-methods', '*');
  next();
});
app.use(require('serve-static')(path.join(__dirname, 'public')));
app.get('/*', compression(), require('serve-static')(path.join(__dirname, 'public/compress')));

module.exports = app;
