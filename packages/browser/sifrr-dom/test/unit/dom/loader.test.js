describe('Loader', () => {
  afterEach(() => {
    const loader = require.resolve('../../../src/dom/loader');
    delete require.cache[loader];
    sinon.restore();
  });

  it('throws error if fetch is not present', () => {
    const fetch = window.fetch;
    window.fetch = undefined;
    const Loader = require('../../../src/dom/loader');

    expect(() => new Loader()).to.throw();
    window.fetch = fetch;
  });

  it('returns loader if already present', () => {
    const Loader = require('../../../src/dom/loader');
    const a = {};
    Loader.all['random'] = a;

    expect(new Loader('random')).to.eq(a);
  });

  it('returns exec promise if already present', () => {
    const Loader = require('../../../src/dom/loader');
    const l = new Loader('random', 'ok');
    const exec = {};
    l._exec = exec;

    expect(l.executeScripts()).to.eq(exec);
  });

  it('throws error on execute script fail', async () => {
    const Loader = require('../../../src/dom/loader');
    const l = new Loader('random', 'ok');
    l._exec = Promise.reject('err');

    l.executeScripts().should.be.rejectedWith('err');
  });
});
