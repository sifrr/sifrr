const exec = require('child_process').execSync;

const seqCMD = 'PATH=$(npm bin):$PATH sequelize';
const supportedCmds = ['reset', 'setup'];
const logs = {
  reset: (dbName) => `Database ${dbName} dropped and recreated.`,
  setup: (dbName) => `Database ${dbName} set up.`
};

module.exports = (cmd) => {
  return () => {
    if (supportedCmds.indexOf(cmd) < 0) throw Error('This db command not supported. Supported commands: \n', supportedCmds.map(c => `db:${c}`).join('\n'));

    require('../utils/check')(`${seqCMD} --version`, 'sequelize-cli is required to run this command. Install it by running `npm i sequelize-cli`');

    const config = require('../utils/seqconfig');
    global.console.log(`Using ${config.dialect} in ${ENV} environment`);
    const db = require(`./db/${config.dialect}.js`);

    db(config, cmd, (err) => {
      if (err) throw err;

      global.console.log(logs[cmd](config.database));
      process.stdout.write(`Running migrations`);
      exec(`${seqCMD} db:migrate`, { stdio: 'inherit' });
      process.stdout.write(`Done`);

      process.exit(0);
    });
  };
};
