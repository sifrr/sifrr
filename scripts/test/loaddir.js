const fs = require('fs'),
  path = require('path');

function loadDir(dir, fxn, deep = 100) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    fs.statSync(filePath).isDirectory()
      ? (deep > 0 ? loadDir(filePath, fxn, deep - 1) : () => {}) 
      : fxn(filePath);
  });
}

module.exports = loadDir;
