describe('stores', () => {
  before(async () => {
    await page.goto(`${PATH}/store.html`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  it('has initial value', async () => {
    const value = await page.$eval('sifrr-store', (el) => el.innerHTML);
    expect(value).to.equal('<p>hahaha</p>');

    const value2 = await page.$eval('sifrr-store2', (el) => el.innerHTML);
    expect(value2).to.equal('<p>string</p>');

    const value3 = await page.$eval('sifrr-store3', (el) => el.innerHTML);
    expect(value3).to.equal('<p>ab</p>');
  });

  it('updates element on store update', async () => {
    const value = await page.$eval('sifrr-store', (el) => {
      el.stores.haha.set({ a: 'not hahaha' });
      return el.innerHTML;
    });
    expect(value).to.equal('<p>not hahaha</p>');

    const value2 = await page.$eval('sifrr-store2', (el) => {
      el.stores.new.set('not hahaha');
      return el.innerHTML;
    });
    expect(value2).to.equal('<p>not hahaha</p>');

    const value3 = await page.$eval('sifrr-store3', (el) => {
      el.stores.new.set(['m', 'n']);
      return el.innerHTML;
    });
    expect(value3).to.equal('<p>mn</p>');
  });
});
