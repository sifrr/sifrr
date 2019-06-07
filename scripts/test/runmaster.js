const path = require('path');
const { fork } = require('child_process');

const roots = (process.argv[2] || './').split(/[ ,\n]/g).map(p => path.join(__dirname, '../../', p));

const promises = roots.map((root, i) => {
  const childRun = fork(path.join(__dirname, './runchild'));
  return new Promise((res, rej) => {
    childRun.on('error', (err) => {
      if (process.exitCode === 0) process.exitCode = 1;
      rej(err);
    });

    childRun.on('exit', code => {
      global.console.log(`tests from ${root} exited with code ${code}`);
      if (code && code > 0) process.exitCode = code;
      res();
    });

    childRun.send({
      root,
      i
    });
  });
});

(async function() {
  await Promise.all(promises);
  process.exit(process.exitCode);
})();
