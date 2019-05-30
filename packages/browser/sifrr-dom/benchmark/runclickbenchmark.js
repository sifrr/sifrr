const verbose =  Math.max(process.argv.indexOf(`--verbose`), process.argv.indexOf(`-v`)) > 0;

module.exports = async function(benchmark, port, runs = 5, url, warmups = runs, metrics = ['ScriptDuration', 'LayoutCount', 'TaskDuration']) {
  const BM = require(`./benchmarks/${benchmark}`);
  let totals = {};
  if (verbose) process.stdout.write(`Running ${benchmark} benchmark with ${warmups} warmups for ${runs} runs: \n`);

  // Reload page
  url = url || `http://localhost:${port}/speedtest.html`;

  await page.evaluate(async () => {
    if (typeof Sifrr !== 'undefined') {
      if (typeof Sifrr.Dom.loading === 'function') await Sifrr.Dom.loading();
    }
  });
  const client = await page.target().createCDPSession();

  const times = (warmups + 1) * runs;
  for (let i = 0; i < times; i++) {
    if (i % (warmups + 1) === 0) {
      if (url !== page.url()) await page.goto(url);
      // await page.goto(url, { waitUntil: 'networkidle0' });
      await BM.setup();

      // Run before all
      BM.beforeAll();
      await page.waitForFunction(BM.beforeAllWait());
    }
    const bm = new BM(i % (warmups + 1));

    // Run before
    bm.before();
    await page.waitForFunction(bm.beforeWait());
    const beforeMetrics = await BM.metrics();

    // Run bechmark
    await client.send('Emulation.setCPUThrottlingRate', { rate: bm.cpuSlowdown });
    bm.run();
    await page.waitForFunction(bm.runWait());
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const afterMetrics = await BM.metrics();

    if (i % (warmups + 1) === warmups) {
      if (verbose) process.stdout.write(`${i + 1}R `);
      const diff = BM.metricsDiff(beforeMetrics, afterMetrics);
      for (let m in diff) {
        totals[m] = totals[m] || 0;
        totals[m] += diff[m];
      }
    } else {
      if (verbose) process.stdout.write(`${i + 1}W `);
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