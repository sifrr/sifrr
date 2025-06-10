const verbose = Math.max(process.argv.indexOf(`--verbose`), process.argv.indexOf(`-v`)) > 0;

export default async function (
  benchmark,
  port,
  runs = 5,
  url,
  warmups = runs,
  metrics = [
    'ScriptDuration',
    'LayoutDuration',
    'LayoutCount',
    'TaskDuration',
    'RecalcStyleDuration'
  ],
  page
) {
  const BM = (await import(`./benchmarks/${benchmark}`)).default;

  const totals = {};
  if (verbose)
    process.stdout.write(
      `Running ${benchmark} benchmark with ${warmups} warmups for ${runs} runs: \n`
    );

  // Reload page
  url =
    url ||
    `http://localhost:${port}/iframe.html?globals=&id=sifrr-template-speed--primary&viewMode=story`;

  const client = await page.context().newCDPSession(page);

  const times = (warmups + 1) * runs;
  for (let i = 0; i < times; i++) {
    const bm = new BM(i % (warmups + 1), page);
    if (i % (warmups + 1) === 0) {
      await page.goto(url);
      // await page.goto(url, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
        HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
        document.$ = document.querySelector;
        document.$$ = document.querySelectorAll;
      });
      await bm.setup();
      await page.waitForFunction(bm.main);

      // Run before all
      bm.beforeAll();
      await page.waitForFunction(bm.beforeAllWait());
    }

    // Run before
    bm.before();
    await page.waitForFunction(bm.beforeWait());
    const beforeMetrics = await bm.metrics();

    // Run bechmark
    await client.send('Emulation.setCPUThrottlingRate', { rate: bm.cpuSlowdown });
    bm.run(page);
    await page.waitForFunction(bm.runWait());
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const afterMetrics = await bm.metrics();

    if (i % (warmups + 1) === warmups) {
      if (verbose) process.stdout.write(`${i + 1}R `);
      const diff = bm.metricsDiff(beforeMetrics, afterMetrics);
      for (const m in diff) {
        totals[m] = totals[m] || 0;
        totals[m] += diff[m];
      }
    } else if (verbose) process.stdout.write(`${i + 1}W `);
  }
  if (verbose) process.stdout.write('\n');

  // Filter metrics
  // for (const m in totals) {
  //   if (metrics.indexOf(m) >= 0) {
  //     totals[m] = totals[m] / runs;
  //   } else {
  //     delete totals[m];
  //   }
  // }

  // Save metrics
  return totals;
}
