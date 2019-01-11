const exec = require('child_process').execSync;

function check(cmnd, err, exit = true) {
  let isWorking;
  try {
    exec(cmnd, { stdio: 'ignore' });
    isWorking = true;
  } catch(e) {
    isWorking = false;
  }

  if (!isWorking) {
    global.console.error(err);
    if (exit) process.exit(1);
    return false;
  }

  return true;
}

module.exports = check;
