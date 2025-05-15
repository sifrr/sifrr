import { test } from '@playwright/test';
import BenchmarkRunner from '../benchmark/benchmarkrunner';

function getArg(name: string) {
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
const runs = parseInt(getArg('runs') || '1', 10),
  warmups = parseInt(getArg('warmups') || '1', 10);

const benchmarkFilters = (getArg('benchmarks') || '').split(',');
benchmarks = benchmarks.filter((b) => {
  return benchmarkFilters.map((bf) => b.indexOf(bf) >= 0).indexOf(true) >= 0;
});

const ExpectedLayoutCounts: Record<(typeof benchmarks)[number], number> = {
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

const suffixes = ['', '&useKey', '&useClean', '&useAsync'],
  compare: any = {};
const url =
  getArg('url') ||
  `http://localhost:6006/iframe.html?globals=&id=sifrr-template-speed--primary&viewMode=story&speedtest=true`;
const urls = suffixes.map((s) => url + s);
// .concat([`http://localhost:8080/frameworks/non-keyed/domc/`]);

for (const u of urls) {
  const shortu = u.replace(url, '').replace('http://localhost:8080/frameworks', '');

  for (const bm of benchmarks) {
    test(`Speed test for ${bm} and url: ${shortu}`, async function ({ page }) {
      const results = await new BenchmarkRunner(
        [bm],
        { port: 6006, runs, warmups: warmups, url: u, page },
        false
      ).run();
      const bmd = results[bm];

      // expect(bmd['LayoutCount']).toBeLessThanOrEqual(
      //   ExpectedLayoutCounts[bm],
      //   `${bm} layoutcount should be ${ExpectedLayoutCounts[bm]}, but was ${bmd['LayoutCount']}`
      // );

      compare[bm] = compare[bm] || {};
      compare[bm][shortu] = [
        bmd['ScriptDuration'] + bmd['LayoutDuration'] + bmd['RecalcStyleDuration'],
        bmd['TaskDuration']
      ];

      global.console.table(compare);
    });
  }
}
