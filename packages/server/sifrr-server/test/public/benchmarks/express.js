const express = require('express');
const app = express();
const path = require('path');

app.use((req, res, next) => {
  res.set('access-control-allow-origin', '*');
  res.set('access-control-allow-methods', '*');
  next();
});
app.use(require('serve-static')(path.join(__dirname, 'public')));

module.exports = app;
