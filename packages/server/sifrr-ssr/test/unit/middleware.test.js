const SifrrSeo = require('../../src/sifrr.seo');

describe('middleware', () => {
  it('calls next() if render is false', async () => {
    const seo = new SifrrSeo();
    const m = seo.getExpressMiddleware(() => 'http://');
    sinon.stub(seo, 'render').resolves(false);
    sinon.stub(seo, 'getShouldRenderCache').returns(true);
    const next = sinon.spy();

    await m(
      {
        method: 'GET',
        headers: {}
      },
      {},
      next
    );

    assert(next.calledOnce);
  });

  it('calls next() if render gives error', async () => {
    const seo = new SifrrSeo();
    const m = seo.getExpressMiddleware(() => 'http://');
    const err = Error('error');
    sinon.stub(seo, 'render').rejects(err);
    sinon.stub(seo, 'getShouldRenderCache').returns(true);
    const next = sinon.spy();

    await m(
      {
        method: 'GET',
        headers: {}
      },
      {},
      next
    );

    assert(next.calledOnceWith(err));
  });

  it("doesn't set shouldRenderCache when res has no content-type", async () => {
    const seo = new SifrrSeo();
    const m = seo.getExpressMiddleware(() => 'http://');
    sinon.stub(seo, 'render').resolves(false);
    const next = sinon.spy();
    const req = {
      method: 'GET',
      headers: {}
    };
    const res = {
      hasHeader: () => false,
      getHeader: () => 'aa/html/bb',
      end: () => {}
    };

    await m(req, res, next);
    res.end();

    assert.equal(
      seo.getShouldRenderCache({
        fullUrl: 'http://',
        headers: {}
      }),
      null
    );
  });
});
