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
    global.console.log('# small static file');
    await loadTest(p => `${p}/example.json`);
  });

  it('faster in static files (big)', async () => {
    global.console.log('# big file');
    await loadTest(p => `${p}/random.html`, 50);
  });

  it('faster in static files (big, compression)', async () => {
    global.console.log('# big file with gzip compression');
    await loadTest(p => `${p}/compressed.html`);
  });

  it('faster in cached files (big)', async () => {
    global.console.log('# big file with cache vs normal express');
    await page.evaluate(p => {
      return Sifrr.Fetch.get(`${p}/cache.html`).then(r => r.text());
    }, PATH);
    await loadTest(p => `${p}/cache.html`);
  });

  it('faster in cached compressed files (big)', async () => {
    global.console.log('# big file gzip compressin and cache vs normal express with compression');
    await page.evaluate(p => {
      return Sifrr.Fetch.get(`${p}/cache_compress`).then(r => r.text());
    }, PATH);
    await loadTest(p => {
      if (p.indexOf(EPORT) > 0) {
        return `${p}/compressed.html`;
      } else {
        return `${p}/cache_compress`;
      }
    });
  });
});
