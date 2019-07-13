const Fetch = require('../../src/sifrr.fetch');
let fetch, mock;

describe('Fetch', () => {
  before(() => {
    fetch = new Fetch({
      host: 'ok',
      timeout: 5000
    });
    mock = sinon.mock(Fetch);
  });

  it('calls constructor method with default options', () => {
    mock.expects('get').withExactArgs('/ok', {
      body: {},
      defaultOptions: {
        host: 'ok',
        timeout: 5000
      }
    });
    fetch.get('/ok', {
      body: {}
    });
    mock.verify();
  });
});
