const fs = require('fs');
const path = require('path');

const models = {};

fs.readdirSync(__dirname)
  .filter(
    file =>
      path.extname(file) === '.js' &&
      path.join(__dirname, file) !== __filename &&
      path.join(__dirname, file) !== path.join(__dirname, './basemodel.js')
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    models[model.name] = model;
  });

Object.keys(models).forEach(modelName => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
});

module.exports = models;
