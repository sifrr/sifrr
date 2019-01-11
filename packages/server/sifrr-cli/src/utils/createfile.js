const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = (elemPath, content, force = false, exit = true) => {
  mkdirp.sync(path.dirname(elemPath), (err) => {
    if (err) throw err;
  });

  if (fs.existsSync(elemPath) && !force) {
    global.console.error(`File already exists at ${elemPath}`);
    if (exit) process.exit(1);
    return false;
  }

  fs.writeFileSync(elemPath, content, err => {
    if(err) throw err;
    global.console.log(`File was saved at '${elemPath}'!`);
  });

  return true;
};
