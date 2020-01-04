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
];
const runs = parseInt(getArg('runs') || 1, 10),
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

// eslint-disable-next-line no-undef
pdescribe(__filename, 'Speed tests', async function() {
  this.timeout(0);
  this.retries(2);

  const suffixes = ['?', '?useKey', '?useClean'],
    compare = {};
  const url = getArg('url') || `${PATH}/speedtest.html`;
  const urls = suffixes.map(s => url + s);
  // .concat([`http://localhost:8080/frameworks/non-keyed/domc/`]);

  for (let j = 0; j < urls.length; j++) {
    const u = urls[j];
    const shortu = u.replace(url, '').replace('http://localhost:8080/frameworks', '');

    for (let i = 0; i < benchmarks.length; i++) {
      const bm = benchmarks[i];
      it(`passes speed test for ${shortu} - ${bm}`, async () => {
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

        compare[bm] = compare[bm] || {};
        compare[bm][shortu] = [
          bmd['ScriptDuration'] + bmd['LayoutDuration'] + bmd['RecalcStyleDuration'],
          bmd['TaskDuration']
        ];
      });
    }
  }

  after(() => {
    global.console.table(compare);
  });
});
