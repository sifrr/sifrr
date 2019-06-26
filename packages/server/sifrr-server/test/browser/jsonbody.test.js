describe('json body test', function() {
  before(async () => {
    await page.goto(`${PATH}/static.html`);
  });

  it('gives json body on res.json()', async () => {
    const resp = await page.evaluate(async path => {
      return await Sifrr.Fetch.post(`${path}/json`, {
        body: {
          json: 'body'
        }
      });
    }, PATH);

    expect(resp).to.deep.equal({
      json: 'body'
    });
  });
});
