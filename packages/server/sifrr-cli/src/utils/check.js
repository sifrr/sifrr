const exec = require('child_process').execSync;

function check(cmnd, err) {
  let isWorking;
  try {
    exec(cmnd, { stdio: 'ignore' });
    isWorking = true;
  } catch(e) {
    isWorking = false;
  }

  if (!isWorking) {
    process.stderr.write(err);
    process.exit(1);
    return false;
  }

  return true;
}

module.exports = check;
