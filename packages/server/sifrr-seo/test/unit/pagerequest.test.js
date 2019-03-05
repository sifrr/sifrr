const PageRequest = require('../../src/pagerequest');
const request = (url) => {
  return {
    resourceType: () => 'document',
    url: () => url,
    continue: () => {},
    abort: () => {}
  };
};
const ee = new (require('events').EventEmitter.EventEmitter)();
ee.setRequestInterception = () => Promise.resolve(true);

describe('PageRequest', () => {
  it('filters request if function is given', async () => {
    const pr = new PageRequest(ee, (url) => url.indexOf('sifrr') > -1);
    await pr.addListener;

    const randomReq = request('/random'), sifrrReq = request('/sifrrhaha');

    ee.emit('request', sifrrReq);

    assert.equal(pr.pendingRequests, 1);

    ee.emit('request', randomReq);

    assert.equal(pr.pendingRequests, 1);

    ee.emit('requestfinished', randomReq);

    assert.equal(pr.pendingRequests, 1);

    ee.emit('requestfinished', sifrrReq);

    assert.equal(pr.pendingRequests, 0);
  });
});
