describe('HOC', () => {
  before(async () => {
    await page.goto(`${PATH}/async.html`);
    await delay(100);
  });

  it('create/update hoc components', async () => {
    assert.equal(
      await page.$eval('#hoc', el => el.textContent),
      `
        Name: Sifrr At
        Id: 2`
    );
    await page.evaluate(() =>
      window.Component2({ id: 1 }, document.getElementById('hoc').childNodes)
    );
    assert.equal(
      await page.$eval('#hoc', el => el.textContent),
      `
        Name: Aaditya Taparia
        Id: 1`
    );
  });
});
