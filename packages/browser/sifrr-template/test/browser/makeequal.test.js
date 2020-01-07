describe('Make Equal', () => {
  before(async () => {
    await page.goto(`${PATH}/makeequal.html`);
  });

  it('deep equal', async () => {
    const same = await page.evaluate(() => {
      Sifrr.Template.update(window.a, { html: window.newhtml });
      return window.a.innerHTML === window.newhtml;
    });
    assert(same);
  });
});
