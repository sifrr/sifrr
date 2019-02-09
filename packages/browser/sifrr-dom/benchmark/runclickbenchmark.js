const verbose =  Math.max(process.argv.indexOf(`--verbose`), process.argv.indexOf(`-v`)) > 0;

module.exports = async function(benchmark, port, runs = 5, url, warmups = runs, metrics = ['LayoutDuration', 'ScriptDuration', 'RecalcStyleDuration', 'LayoutCount']) {
  const BM = require(`./benchmarks/${benchmark}`);
  let totals = {};
  if (verbose) process.stdout.write(`Running ${benchmark} benchmark for ${warmups} warmups and ${runs} runs: \n`);

  // Reload page
  await page.goto(url || `http://localhost:${port}/speedtest.html`);
  await page.evaluate(async () => {
    if (typeof Sifrr !== 'undefined') {
      await Sifrr.Dom.loading();
    } else {
      document.querySelector('#main').$$ = document.querySelector('#main').querySelectorAll;
      document.querySelector('#main').$ = document.querySelector('#main').querySelector;
    }
  });

  // Run before all
  BM.beforeAll();
  await page.waitForFunction(BM.beforeAllWait());

  const times = warmups + runs;
  for (let i = 0; i < times; i++) {
    const bm = new BM(i, !url);
    if (verbose) process.stdout.write(`${i + 1} `);

    // Run before
    bm.before();
    await page.waitForFunction(bm.beforeWait());
    const beforeMetrics = await BM.metrics();

    // Run bechmark
    bm.run();
    await page.waitForFunction(bm.runWait());
    const afterMetrics = await BM.metrics();

    if (i >= warmups) {
      const diff = BM.metricsDiff(beforeMetrics, afterMetrics);
      for (let m in diff) {
        totals[m] = totals[m] || 0;
        totals[m] += diff[m];
      }
    }
  }
  if (verbose) process.stdout.write('\n');

  // Filter metrics
  for (let m in totals) {
    if (metrics.indexOf(m) >= 0) {
      totals[m] = totals[m] / runs;
    } else {
      delete totals[m];
    }
  }

  // Save metrics
  return totals;
};