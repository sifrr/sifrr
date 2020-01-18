describe('Async bindings', () => {
  before(async () => {
    await page.goto(`${PATH}/async.html`);
    await delay(100);
  });

  it('renders async bindings', async () => {
    assert.equal(
      await page.$eval('#inside', el => el.textContent),
      `
        Name:
        Aaditya Taparia
        Id:
        1`
    );
    assert.equal(
      await page.$eval('#hoc', el => el.textContent),
      `
        Name: Sifrr At
        Id: 2`
    );
  });
});
