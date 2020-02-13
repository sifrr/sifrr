const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = (elemPath, content, force = false) => {
  mkdirp.sync(path.dirname(elemPath), err => {
    /* istanbul ignore next */
    if (err) throw err;
  });

  if (fs.existsSync(elemPath) && !force) {
    process.stderr.write(`File already exists at ${elemPath}`);
    process.exit(1);
  }

  fs.writeFileSync(elemPath, content, err => {
    /* istanbul ignore next */
    if (err) throw err;
  });

  process.stdout.write(`File was saved at '${elemPath}'!`);
  return true;
};
