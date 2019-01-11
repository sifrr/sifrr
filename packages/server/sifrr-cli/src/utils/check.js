function check(cmnd, err) {
  let isWorking;
  try {
    exec(cmnd, { stdio: 'ignore' });
    isWorking = true;
  } catch(e) {
    isWorking = false;
  }

  if (!isWorking) {
    global.console.error(err);
    process.exit(1);
  }

  return true;
}

module.exports = check;
