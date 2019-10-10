const fs = require('fs');
const path = require('path');

module.exports = dir => {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  if (files.length < 1) return null;
  const lastFile = files[files.length - 1];
  return path.join(dir, lastFile);
};
