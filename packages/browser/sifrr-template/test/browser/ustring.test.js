describe('createUniqueString', () => {
  before(async () => {
    await page.goto(`${PATH}/index.html`);
  });

  it('creates unique string with same length', async () => {
    const string = await page.evaluate(async () => {
      return Sifrr.Template.createUniqueString(10);
    });

    assert.equal(string.length, 10);
  });
});
