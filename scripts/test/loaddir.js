const fs = require('fs'),
  path = require('path');

function loadDir(dir, fxn) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    fs.statSync(filePath).isDirectory()
      ? loadDir(filePath, fxn)
      : fxn(filePath);
  });
}

module.exports = loadDir;
