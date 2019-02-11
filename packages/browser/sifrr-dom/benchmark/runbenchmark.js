const BenchmarkRunner = require('./benchmarkrunner');

function getArg(name) {
  const argi = Math.max(process.argv.indexOf(`--${name}`), process.argv.indexOf(`-${name[0]}`));
  if (argi !== -1) {
    return process.argv[argi + 1];
  } else {
    return;
  }
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
  '10k-append'
];

const benchmarkFilters = (getArg('benchmarks') || '').split(',');
benchmarks = benchmarks.filter((b) => {
  return benchmarkFilters.map(bf => b.indexOf(bf) >= 0).indexOf(true) >= 0;
});

const port = getArg('server');
const runs = parseInt(getArg('runs') || 5);
const url = getArg('url');

(async function() {
  const results = await new BenchmarkRunner(benchmarks, { port, runs, url }).run();

  for (let bm in results) {
    const bmd = results[bm];
    let total = 0;
    for (let dur in bmd) {
      if (dur.indexOf('Duration')) total += bmd[dur];
    }
    bmd['TotalDuration'] = total;
  }

  global.console.table(results);
})();
