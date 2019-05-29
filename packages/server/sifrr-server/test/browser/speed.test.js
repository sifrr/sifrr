const { loadTest, EPORT } = require('./utils');
let eapp = require('../public/benchmarks/express');

describe('speed test', function() {
  this.retries(3);

  before(async () => {
    eapp = eapp.listen(EPORT, () => global.console.log('listening express on ', EPORT));
    await page.goto(`${PATH}/static.html`);
  });

  after(() => {
    eapp.close();
  });

  it('faster in static files', async () => {
    await loadTest((p) => `${p}/example.json`);
  });

  it('faster in static files (big)', async () => {
    await loadTest((p) => `${p}/random.html`, 50);
  });

  it('faster in static files (big, compression)', async () => {
    await loadTest((p) => `${p}/compressed.html`);
  });

  it('faster in cached files (big)', async () => {
    await page.evaluate((p) => {
      return Sifrr.Fetch.get(`${p}/cache.html`).then(r => r.text());
    }, PATH);
    await loadTest((p) => `${p}/cache.html`);
  });

  it('faster in cached compressed files (big)', async () => {
    await page.evaluate((p) => {
      return Sifrr.Fetch.get(`${p}/cache_compress`).then(r => r.text());
    }, PATH);
    await loadTest((p) => {
      if (p.indexOf(EPORT) > 0) {
        return `${p}/compressed.html`;
      } else {
        return `${p}/cache_compress`;
      }
    });
  });
});
