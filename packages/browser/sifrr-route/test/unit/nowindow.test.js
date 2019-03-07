const mock = require('mock-require');

describe('Route with window sifrr/dom', () => {
  before(() => {
    const route = require.resolve('../../src/sifrr.route');
    delete require.cache[route];
  });

  after(() => {
    sinon.restore();
  });

  it('sets up Sifrr.Dom.Route properly', () => {
    const dom = {};
    mock('@sifrr/dom', dom);

    assert.notExists(dom.Route);
    expect(() => require('../../src/sifrr.route')).to.throw();
    assert.exists(dom.Route);

    mock.stop('@sifrr/dom');
  });
});