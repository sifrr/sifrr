describe('hooks', () => {
  before(async () => {
    await page.goto(`${PATH}/hook.html`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  it('has initial value', async () => {
    const value = await page.$eval('sifrr-hook', (el) => el.innerHTML);
    expect(value).to.equal('<p>hahaha</p>');

    const value2 = await page.$eval('sifrr-hook2', (el) => el.innerHTML);
    expect(value2).to.equal('<p>string</p>');

    const value3 = await page.$eval('sifrr-hook3', (el) => el.innerHTML);
    expect(value3).to.equal('<p>ab</p>');
  });

  it('updates element on hook update', async () => {
    const value = await page.$eval('sifrr-hook', (el) => {
      el.hooks.haha.set({ a: 'not hahaha' });
      return el.innerHTML;
    });
    expect(value).to.equal('<p>not hahaha</p>');

    const value2 = await page.$eval('sifrr-hook2', (el) => {
      el.hooks.new.set('not hahaha');
      return el.innerHTML;
    });
    expect(value2).to.equal('<p>not hahaha</p>');

    const value3 = await page.$eval('sifrr-hook3', (el) => {
      el.hooks.new.set(['m', 'n']);
      return el.innerHTML;
    });
    expect(value3).to.equal('<p>mn</p>');
  });
});
