const fs = require('fs');

const times = 1000;
const ab = Buffer.concat([fs.readFileSync('yarn.lock'), fs.readFileSync('yarn.lock'), fs.readFileSync('yarn.lock'), fs.readFileSync('yarn.lock')]).buffer;

function test1() {
  return new Uint8Array(ab, ab.byteOffset, ab.byteLength).slice(0, ab.byteLength).length;
}

function test2() {
  return new Uint8Array(ab.slice(ab.byteOffset, ab.byteLength)).length;
}

(async function runBM() {
  let timing1 = 0;
  let r1, r2;
  for (let i = 0; i < times; i++) {
    const from = process.hrtime();
    r1 = test1();
    const to = process.hrtime(from);
    timing1 += to[0] * 1000000 + to[1] / 1000;
  }
  global.console.log(`1st bm is ${ 1000000 * times / timing1} ops/s`);

  let timing2 = 0;
  for (let i = 0; i < times; i++) {
    const from = process.hrtime();
    r2 = test2();
    const to = process.hrtime(from);
    timing2 += to[0] * 1000000 + to[1] / 1000;
  }
  global.console.log(`2nd bm is ${ 1000000 * times / timing2} ops/s`);
  global.console.log(r1, r1, r1 === r2);
  global.console.log('total timing', timing1, timing2);
})();
