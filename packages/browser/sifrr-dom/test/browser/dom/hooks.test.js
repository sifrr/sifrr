describe('hooks', () => {
  before(async () => {
    await page.goto(`${PATH}/hook.html`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  it('has initial value', async () => {
    const value = await page.$eval('sifrr-hook', (el) => el.innerHTML);
    expect(value).to.equal('<p>hahaha</p>');
  });

  it('updates element on hook update', async () => {
    const value = await page.$eval('sifrr-hook', (el) => {
      el.hooks.haha.set({ a: 'not hahaha' });
      return el.innerHTML;
    });
    expect(value).to.equal('<p>not hahaha</p>');
  });
});
