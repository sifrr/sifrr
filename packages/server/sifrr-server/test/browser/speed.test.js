const { loadTest, EPORT, SPORT } = require('./utils');
let eapp = require('../public/benchmarks/express'), sapp = require('../public/benchmarks/sifrr');

describe('speed test', function() {
  this.timeout(30000);

  before(async () => {
    eapp = eapp.listen(EPORT, () => global.console.log('listening express on ', EPORT));
    sapp.listen(SPORT, () => global.console.log('listening sifrr on ', SPORT));
    await page.goto(`${PATH}/static.html`);
  });

  after(() => {
    eapp.close();
    sapp.close();
  });

  it('faster in static files (no-304)', async () => {
    await loadTest((p) => `http://localhost:${p}/example.json`, 100, { cache: 'no-store' });
  });

  it('faster in static files (with-304)', async () => {
    await loadTest((p) => `http://localhost:${p}/example.json`, 100, { cache: 'no-cache' });
  });

  it('faster in static files (big, no-304)', async () => {
    await loadTest((p) => `http://localhost:${p}/random.html`, 100, { cache: 'no-store' });
  });

  it('faster in static files (big, no-304, compression)', async () => {
    await loadTest((p) => `http://localhost:${p}/compressed.html`, 100, {
      cache: 'no-store',
      headers: {
        'accept-encoding': 'gzip'
      }
    });
  });

  it('faster in static files (big, with-304)', async () => {
    await loadTest((p) => `http://localhost:${p}/random.html`, 100, { cache: 'no-cache' });
  });
});
