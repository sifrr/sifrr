const fs = require('fs');

const { SPORT } = require('./utils');
let sapp = require('../public/benchmarks/sifrr');

describe('form test', function() {
  before(async () => {
    sapp.listen(SPORT, () => global.console.log('listening sifrr on ', SPORT));
    await page.goto(`${PATH}/static.html`);
  });

  after(() => {
    sapp.close();
  });

  it('gives json body on res.json()', async () => {
    const resp = await page.evaluate(async (port) => {
      return await Sifrr.Fetch.post(`http://localhost:${port}/json`, {
        body: {
          json: 'body'
        }
      });
    }, SPORT);

    expect(resp).to.deep.equal({
      json: 'body'
    });
  });
});
