const BenchmarkRunner = require('../../benchmark/benchmarkrunner');
function getArg(name) {
  const argi = Math.max(process.argv.indexOf(`--${name}`), process.argv.indexOf(`-${name[0]}`));
  if (argi !== -1) {
    return process.argv[argi + 1];
  }
  return false;
}

let benchmarks = [
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
    '1k-append'
  ],
  url = `${PATH}/speedtest.html`,
  runs = parseInt(getArg('runs') || 1, 10);

const benchmarkFilters = (getArg('benchmarks') || '').split(',');
benchmarks = benchmarks.filter((b) => {
  return benchmarkFilters.map(bf => b.indexOf(bf) >= 0).indexOf(true) >= 0;
});

const ExpectedLayoutCounts = {
  '1k-run': 1,
  '10k-run': 1,
  '1k-update': 1,
  '10k-update': 1,
  '1k-clear': 1,
  '10k-clear': 1,
  '1k-swap': 1,
  '1k-select': 1,
  '1k-delete': 1,
  '10k-update10th': 1,
  '1k-append': 1
};

const ExpectedTotalDurations = {
  '1k-run': 130,
  '10k-run': 1200,
  '1k-update': 50,
  '10k-update': 400,
  '1k-clear': 30,
  '10k-clear': 170,
  '1k-swap': 15,
  '1k-select': 1,
  '1k-delete': 40,
  '10k-update10th': 90,
  '1k-append': 140
};

describe('Siffr.Dom', function() {
  this.timeout(0);

  const bl = benchmarks.length;
  for (let i = 0; i < bl; i++) {
    const bm = benchmarks[i];
    describe(bm, () => {
      it(`passes ${bm} Speedtest with simpleElement`, async () => {
        const results = await new BenchmarkRunner([bm], { port, runs: runs, url }, false).run();
        const bmd = results[bm];
        assert.isAtMost(bmd['LayoutCount'], ExpectedLayoutCounts[bm], `${bm} layoutcount should be ${ExpectedLayoutCounts[bm]}, but was ${bmd['LayoutCount']}`);
        // assert.isAtMost(bmd['TotalDuration'], ExpectedTotalDurations[bm], `${bm} duration should be ${ExpectedTotalDurations[bm]}, but was ${bmd['TotalDuration']}`);

        global.console.log(bm, '(se-nokey total duration in ms): ', bmd['TaskDuration']);
      });

      it(`passes ${bm} Speedtest with sifrrElement`, async () => {
        const results = await new BenchmarkRunner([bm], { port, runs: runs, url: url + '?useSifrr' }, false).run();
        const bmd = results[bm];
        assert.isAtMost(bmd['LayoutCount'], ExpectedLayoutCounts[bm], `${bm} layoutcount should be ${ExpectedLayoutCounts[bm]}, but was ${bmd['LayoutCount']}`);

        global.console.log(bm, '(sf-nokey total duration in ms): ', bmd['TaskDuration']);
      });

      it(`passes ${bm} Speedtest with simpleElement (keyed)`, async () => {
        const results = await new BenchmarkRunner([bm], { port, runs: runs, url: url + '?useKey' }, false).run();
        const bmd = results[bm];
        assert.isAtMost(bmd['LayoutCount'], ExpectedLayoutCounts[bm], `${bm} layoutcount should be ${ExpectedLayoutCounts[bm]}, but was ${bmd['LayoutCount']}`);

        global.console.log(bm, '(se-keyed total duration in ms): ', bmd['TaskDuration']);
      });

      it(`passes ${bm} Speedtest with sifrrElement (keyed)`, async () => {
        const results = await new BenchmarkRunner([bm], { port, runs: runs, url: url + '?useSifrr&useKey' }, false).run();
        const bmd = results[bm];
        assert.isAtMost(bmd['LayoutCount'], ExpectedLayoutCounts[bm], `${bm} layoutcount should be ${ExpectedLayoutCounts[bm]}, but was ${bmd['LayoutCount']}`);

        global.console.log(bm, '(sf-keyed total duration in ms): ', bmd['TaskDuration']);
      });
    });
  }
});
