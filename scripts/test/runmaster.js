const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');
const { exec } = require('@sifrr/dev');
const transformCoverage = require('@sifrr/dev/src/test/transformcoverage');

const roots = (process.argv[2] || './').split(/[ ,\n]/g).map(p => path.join(__dirname, '../../', p));
let argv = process.argv;
argv.splice(0, 3);

(async function() {
  let errors = 0;
  const promises = [];
  for (let i = 0; i < roots.length; i++) {
    const root = roots[i];
    if (fs.existsSync(path.join(root, './test/public/package.json'))) {
      await exec(`cd ${path.join(root, './test/public')} && yarn && yarn build`);
    }

    const childRun = fork(path.join(__dirname, './runchild'));
    promises.push(new Promise(res => {
      childRun.on('exit', code => {
        if (code && code > 0) {
          global.console.log('\x1b[36m%s\x1b[0m', `tests from ${root} exited with code ${code}, ${code} FAILURED MAYBE`);
          errors += Number(code);
        }
        res();
      });

      childRun.send({
        root,
        i,
        argv
      });
    }));
  }

  await Promise.all(promises);
  await transformCoverage(path.join(__dirname, '../../.nyc_output'), path.join(__dirname, '../../packages'), /sifrr-[a-z-]+\/src\/.*\.js$/, ['html', 'lcov']);
  global.console.log('\x1b[36m%s\x1b[0m', `--------- ${errors} FAILURES ---------`);
  if (errors) process.exit(1);
  else process.exit(0);
})();
