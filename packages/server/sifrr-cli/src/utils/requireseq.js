function requireSeq() {
  let isSequelizeCliInstalled;
  try {
    exec(`${seqCMD} --version`, { stdio: 'ignore' });
    isSequelizeCliInstalled = true;
  } catch(e) {
    isSequelizeCliInstalled = false;
  }

  if (!isSequelizeCliInstalled) {
    global.console.error('sequelize-cli is required to run this command. Install it by running `npm i sequelize-cli`');
    process.exit(1);
  }

  return true;
}

module.exports = requireSeq;
