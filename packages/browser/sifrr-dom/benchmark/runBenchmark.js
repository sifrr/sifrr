const loadBrowser = require('../../../../scripts/test/loadbrowser');

const speedMetrics = {};
async function runClickBenchmark(benchmark, warmups = 5, runs = 5, metrics = ['LayoutDuration', 'ScriptDuration', 'RecalcStyleDuration']) {
  const BM = require(`./benchmarks/${benchmark}`);
  let totals = {};
  process.stdout.write(`Running ${benchmark} benchmark for ${warmups} warmups and ${runs} runs: \n`);

  // Reload page
  await page.goto(`http://localhost:1111/speedtest.html`);
  await page.evaluate(async () => await Sifrr.Dom.loading());

  // Run before all
  BM.beforeAll();
  await page.waitForFunction(BM.beforeAllWait());

  const times = warmups + runs;
  for (let i = 0; i < times; i++) {
    const bm = new BM(i);
    process.stdout.write(`${i + 1} `);

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
  process.stdout.write('\n');

  // Filter metrics
  for (let m in totals) {
    if (metrics.indexOf(m) >= 0) {
      totals[m] = totals[m] / runs;
    } else {
      delete totals[m];
    }
  }

  // Save metrics
  speedMetrics[benchmark] = totals;
}

(async () => {
  await loadBrowser(process.env.HEADLESS === 'false' ? 10 : 0);

  await page._client.send('Performance.enable');

  // benchmarks
  await runClickBenchmark('1k-run');
  await runClickBenchmark('1k-update');
  await runClickBenchmark('10k-run');
  await runClickBenchmark('10k-update');
  await runClickBenchmark('1k-clear');
  await runClickBenchmark('10k-clear');
  await runClickBenchmark('1k-swap');
  await runClickBenchmark('10k-update10th');
  await runClickBenchmark('10k-append');

  await browser.close();
  global.console.table(speedMetrics);
})();
