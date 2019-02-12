const BenchmarkRunner = require('../../benchmark/benchmarkrunner');

const benchmarks = [
    '1k-run',
    '10k-run',
    '1k-update',
    '10k-update',
    '1k-clear',
    '10k-clear',
    '1k-swap',
    '1k-select',
    '1k-delete',
    '10k-update10th',
    '10k-append'
  ], bl = benchmarks.length,
  url = `${PATH}/speedtest.html`;

const ExpectedLayoutCounts = {
  '1k-run': 1,
  '10k-run': 1,
  '1k-update': 1,
  '10k-update': 1,
  '1k-clear': 1,
  '10k-clear': 1,
  '1k-swap': 1,
  '1k-select': 0,
  '1k-delete': 1,
  '10k-update10th': 1,
  '10k-append': 1
};

describe('Siffr.Dom', () => {
  for (let i = 0; i < bl; i++) {
    const bm = benchmarks[i];
    it(`passes ${bm} Speedtest`, async () => {
      const results = await new BenchmarkRunner([bm], { port, runs: 1, url }, false).run();

      let bmd = results[bm];
      let total = 0;
      for (let dur in bmd) {
        if (dur.indexOf('Duration')) total += bmd[dur];
      }
      assert.equal(bmd['LayoutCount'], ExpectedLayoutCounts[bm]);

      global.console.log(bm, '(total duration in ms): ', total);
    });
  }
});
