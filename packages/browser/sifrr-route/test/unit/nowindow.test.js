const mock = require('mock-require');

describe('Route with window sifrr/dom', () => {
  before(() => {
    const route = require.resolve('../../src/sifrr.route');
    delete require.cache[route];
  });

  after(() => {
    sinon.restore();
  });

  it('sets up properly', () => {
    mock('@sifrr/dom', {});
    const sfr = window.Sifrr;
    window.Sifrr = undefined;

    assert.notExists(window.Sifrr);
    expect(() => require('../../src/sifrr.route')).to.throw();
    assert.exists(window.Sifrr);

    window.Sifrr = sfr;
    mock.stop('@sifrr/dom');
  });
});