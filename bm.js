const { Readable } = require('stream');

const times = 1000;

function test1() {
  new Readable();
  return 0;
}

function test2() {
  new Readable();
  return 0;
}

(async function runBM() {
  // warmup
  test1();
  test2();
  // warmup -end
  let timing1, timing2, from, to;
  let r1, r2;
  from = process.hrtime();
  for (let i = 0; i < times; i++) {
    r1 = test1();
  }
  to = process.hrtime(from);
  timing1 = to[0] * 1000000 + to[1] / 1000;
  global.console.log(`1st bm is ${ 1000000 * times / timing1} ops/s`);

  from = process.hrtime();
  for (let i = 0; i < times; i++) {
    r2 = test2();
  }
  to = process.hrtime(from);
  timing2 = to[0] * 1000000 + to[1] / 1000;
  global.console.log(`2nd bm is ${ 1000000 * times / timing2} ops/s`);
  global.console.log(r1, r1, r1 === r2);
  global.console.log('total timings (in us)', timing1, timing2);
})();
