const Loader = require('../../../src/dom/loader').default;

describe('Loader', () => {
  afterEach(() => {
    Loader.all = {};
  });

  it('throws error if fetch is not present', () => {
    const fetch = global.fetch;
    global.fetch = undefined;

    expect(() => new Loader()).to.throw();
    global.fetch = fetch;
  });

  it('returns loader if already present', () => {
    const a = {};
    Loader.all['random'] = a;

    expect(new Loader('random')).to.eq(a);
  });

  it('returns exec promise if already present', () => {
    const l = new Loader('random', 'ok');
    const exec = {};
    l._exec = exec;

    expect(l.executeScripts()).to.eq(exec);
  });

  it('throws error on execute script fail', async () => {
    const l = new Loader('random', 'ok');
    l._exec = Promise.reject('err');

    l.executeScripts().should.be.rejectedWith('err');
  });
});
