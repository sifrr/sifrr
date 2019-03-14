const EPORT = 4444, SPORT = 4445;
let eapp = require('../public/benchmarks/express'), sapp = require('../public/benchmarks/sifrr');

describe('speed test', () => {
  before(async () => {
    eapp = eapp.listen(EPORT, () => global.console.log('listening express on ', EPORT));
    sapp.listen(SPORT, () => global.console.log('listening sifrr on ', SPORT));
    await page.goto(`${PATH}/static.html`);
  });

  after(() => {
    eapp.close();
    sapp.close();
  });

  it('faster in static files', async () => {
    const expressResults = await page.evaluate(async (port) => {
      return await testFetch(`http://localhost:${port}/example.json`, 1000);
    }, EPORT);
    const sifrrResults = await page.evaluate(async (port) => {
      return await testFetch(`http://localhost:${port}/example.json`, 1000);
    }, SPORT);
    console.log(expressResults, sifrrResults);
  });
});
