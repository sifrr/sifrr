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
    '1k-replace',
    '10k-replace',
    '1k-clear',
    '10k-clear',
    '1k-swap',
    '1k-select',
    '1k-delete',
    '10k-update10th',
    '1k-append'
  ],
  runs = parseInt(getArg('runs') || 1, 10),
  warmups = parseInt(getArg('warmups') || 1, 10);

const benchmarkFilters = (getArg('benchmarks') || '').split(',');
benchmarks = benchmarks.filter(b => {
  return benchmarkFilters.map(bf => b.indexOf(bf) >= 0).indexOf(true) >= 0;
});

const ExpectedLayoutCounts = {
  '1k-run': 1,
  '10k-run': 1,
  '1k-replace': 1,
  '10k-replace': 1,
  '1k-clear': 1,
  '10k-clear': 1,
  '1k-swap': 1,
  '1k-select': 1,
  '1k-delete': 1,
  '10k-update10th': 1,
  '1k-append': 1
};

describe('Speed tests', async function() {
  this.timeout(0);
  this.retries(2);

  const suffixes = ['', '?useKey', '?useSifrr', '?useSifrr&useKey'],
    compare = {};
  const url = getArg('url') || `${PATH}/speedtest.html`;
  const urls = suffixes.map(s => url + s);
  // const urls = [`http://localhost:8080/frameworks/non-keyed/sifrr/`, `http://localhost:8080/frameworks/non-keyed/stage0/`];

  for (let j = 0; j < urls.length; j++) {
    const u = urls[j];

    for (let i = 0; i < benchmarks.length; i++) {
      const bm = benchmarks[i];
      it(`passes speed test for ${u.replace(PATH, '')} - ${bm}`, async () => {
        const results = await new BenchmarkRunner(
          [bm],
          { port, runs: runs, warmups: warmups, url: u },
          false
        ).run();
        const bmd = results[bm];

        assert.isAtMost(
          bmd['LayoutCount'],
          ExpectedLayoutCounts[bm],
          `${bm} layoutcount should be ${ExpectedLayoutCounts[bm]}, but was ${bmd['LayoutCount']}`
        );

        const shortu = u.split('/').pop();
        compare[bm] = compare[bm] || {};
        compare[bm][shortu] = bmd['TaskDuration'];
      });
    }
  }

  after(() => {
    global.console.table(compare);
  });
});
