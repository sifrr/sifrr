const mock = require('mock-require');

describe('Loader', () => {
  afterEach(() => {
    const fetch = require.resolve('@sifrr/fetch');
    delete require.cache[fetch];
    const template = require.resolve('../../../src/dom/template');
    delete require.cache[template];
    const loader = require.resolve('../../../src/dom/loader');
    delete require.cache[loader];
    sinon.restore();
  });

  before(() => {
  });

  after(() => {
  });

  it('throws error if sifrr-fetch is not present', () => {
    mock('@sifrr/fetch', undefined);
    mock('../../../src/dom/template', () => 'ok');
    const Loader = require('../../../src/dom/loader');

    expect(() => new Loader()).to.throw();

    mock.stop('@sifrr/fetch');
    mock.stop('../../../src/dom/template');
  });

  it('returns loader if already present', () => {
    mock('@sifrr/fetch', true);
    mock('../../../src/dom/template', () => 'ok');
    const Loader = require('../../../src/dom/loader');
    const a = {};
    Loader.all['random'] = a;

    expect(new Loader('random')).to.eq(a);

    mock.stop('@sifrr/fetch');
    mock.stop('../../../src/dom/template');
  });

  it('returns html and js if already present', () => {
    mock('@sifrr/fetch', true);
    mock('../../../src/dom/template', () => 'ok');
    const Loader = require('../../../src/dom/loader');
    const l = new Loader('random', 'ok');
    const html = {}, js = {};
    l._html = html, l._js = js;

    expect(l.html).to.eq(html);
    expect(l.js).to.eq(js);

    mock.stop('@sifrr/fetch');
    mock.stop('../../../src/dom/template');
  });
});
