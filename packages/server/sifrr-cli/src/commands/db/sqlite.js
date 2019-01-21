const sqlite = require('sqlite3');
const exec = require('child_process').execSync;

module.exports = (config, cmd, fxn) => {
  if (cmd == 'reset') {
    if (config.storage) exec(`rm ${config.storage}`);
  }
  new sqlite.Database(
    config.storage || ':memory:',
    sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE,
    fxn
  );
};
