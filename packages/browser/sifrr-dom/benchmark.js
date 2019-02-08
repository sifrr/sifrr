const loadBrowser = require('../../../scripts/test/loadbrowser');
const exec = require('child_process').exec;

const speedMetrics = {};
async function runClickBenchmark(name, before, after, metrics = ['LayoutDuration', 'ScriptDuration', 'RecalcStyleDuration'], times = 5) {
  let totals = {};
  process.stdout.write(`Running ${name} benchmark ${times} times: \n`);
  for (let i = 0; i < times; i++) {
    process.stdout.write(`${i + 1} `);

    // Run before
    await page.$eval('main-element', (el, before) => el.$(before).click(), before);
    const beforeMetrics = (await page._client.send('Performance.getMetrics')).metrics;

    // run after
    await page.$eval('main-element', (el, after) => el.$(after).click(), after);
    const metrics = (await page._client.send('Performance.getMetrics')).metrics;

    metrics.forEach((m, i) => {
      totals[m.name] = totals[m.name] || 0;
      if (beforeMetrics[i].name !== m.name) throw Error('Misconfigured metrics');
      totals[m.name] += (m.value - beforeMetrics[i].value) * 1000;
    });
  }
  process.stdout.write('\n');

  // Filter metrics
  for (let m in totals) {
    if (metrics.indexOf(m) >= 0) {
      totals[m] = totals[m] / times;
    } else {
      delete totals[m];
    }
  }

  // Save metrics
  speedMetrics[name] = totals;
}

(async () => {
  await exec('yarn run test-server-only');
  await loadBrowser();

  await page._client.send('Performance.enable');
  await page.goto(`http://localhost:1111/speedtest.html`);
  await page.evaluate(async () => await Sifrr.Dom.loading());

  // benchmarks
  await runClickBenchmark('1k-run', '#clear', '#run');
  await runClickBenchmark('10k-run', '#clear', '#runlots');
  await runClickBenchmark('1k-clear', '#run', '#clear');
  await runClickBenchmark('10k-clear', '#runlots', '#clear');
  await runClickBenchmark('1k-update10th', '#run', '#update');
  await runClickBenchmark('10k-update10th', '#runlots', '#update');

  browser.close();
  global.console.table(speedMetrics);
})();
