const SPORT = 8890;
let sapp = require('../public/benchmarks/sifrrssl');

describe('ssl app', function() {
  before(async () => {
    sapp.listen(SPORT, () => global.console.log('listening sifrr on ', SPORT));
    await page.goto(`https://localhost:${SPORT}/random.html`);
  });

  after(() => {
    sapp.close();
  });

  it('ssl works', async () => {
    expect(await page.title()).to.equal('random');
  });
});
