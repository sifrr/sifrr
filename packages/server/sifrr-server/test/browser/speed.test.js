const { loadTest, EPORT } = require('./utils');
let eapp = require('../public/benchmarks/express');

describe('speed test', function() {
  before(async () => {
    eapp = eapp.listen(EPORT, () => global.console.log('listening express on ', EPORT));
    await page.goto(`${PATH}/static.html`);
  });

  after(() => {
    eapp.close();
  });

  it('faster in static files (no-304)', async () => {
    await loadTest((p) => `${p}/example.json`, 100, { cache: 'no-store' });
  });

  it('faster in static files (with-304)', async () => {
    await loadTest((p) => `${p}/example.json`, 100, { cache: 'no-cache' });
  });

  it('faster in static files (big, no-304)', async () => {
    await loadTest((p) => `${p}/random.html`, 100, { cache: 'no-store' });
  });

  it('faster in static files (big, no-304, compression)', async () => {
    await loadTest((p) => `${p}/compressed.html`, 100, { cache: 'no-store' });
  });

  it('faster in cached files (big, no-304)', async () => {
    await loadTest((p) => `${p}/cache.html`, 100, { cache: 'no-store' });
  });
});
