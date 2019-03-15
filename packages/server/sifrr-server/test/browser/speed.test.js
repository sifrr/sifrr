const EPORT = 4444, SPORT = 4445;
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
    await staticTest((p) => `http://localhost:${p}/b/c/d.html`, 1000, { cache: 'no-store' });
  });

  it('faster in static files (with-304)', async () => {
    await staticTest((p) => `http://localhost:${p}/b/c/d.html`, 1000, { cache: 'no-cache' });
  });

  it.skip('faster in static files (big, no-304)', async () => {
    await staticTest((p) => `http://localhost:${p}/b/c/d.html`, 1000, { cache: 'no-store' });
  });

  it.skip('faster in static files (big, with-304)', async () => {
    await staticTest((p) => `http://localhost:${p}/b/c/d.html`, 1000, { cache: 'no-cache' });
  });
});

async function staticTest(url, num, option) {
  const expressResults = await page.evaluate(async (u, n, o) => {
    return await testFetch(u, n, o );
  }, url(EPORT), num, option);
  const sifrrResults = await page.evaluate(async (u, n, o) => {
    return await testFetch(u, n, o );
  }, url(SPORT), num, option);
  global.console.table({ sifrr: sifrrResults, express: expressResults });
  assert(sifrrResults.rps > expressResults.rps);
  assert(sifrrResults.size === expressResults.size);
}
