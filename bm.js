const {
  Worker, isMainThread, workerData
} = require('worker_threads');

const a = 'hahaha';

if (isMainThread) {
  for (let i = 0; i < 8; i++) {
    new Worker(__filename, {
      workerData: {
        i
      }
    });
  }
} else {
  process.stdout.getWindowSize = () => [60, 85];
  process.stdout.write(`${a}${workerData.i} \n`);
  const { runTests } = require('@sifrr/dev');
  runTests();
}