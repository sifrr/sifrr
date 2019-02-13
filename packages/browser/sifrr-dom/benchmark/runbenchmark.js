const BenchmarkRunner = require('./benchmarkrunner');
const loadTestBrowser = require('../../../../scripts/test/loadbrowser');

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
  '1k-append',
  '10k-update10th'
];

const benchmarkFilters = (getArg('benchmarks') || '').split(',');
benchmarks = benchmarks.filter((b) => {
  return benchmarkFilters.map(bf => b.indexOf(bf) >= 0).indexOf(true) >= 0;
});

const port = getArg('server') || 1111;
const runs = parseInt(getArg('runs') || 5, 10);
const url = getArg('url');

(async function() {
  await loadTestBrowser(process.env.HEADLESS === 'false' ? 10 : 0);
  const results = await new BenchmarkRunner(benchmarks, { port, runs, url }, false).run();

  for (let bm in results) {
    const bmd = results[bm];
    let total = 0;
    for (let dur in bmd) {
      if (dur.indexOf('Duration')) total += bmd[dur];
    }
    bmd['TotalDuration'] = total;
  }

  await browser.close();
  global.console.table(results);
})();
