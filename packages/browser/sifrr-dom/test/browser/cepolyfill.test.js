describe('customElements polyfill', () => {
  before(async () => {
    await page.goto(`${PATH}/cepolyfill.html`);
    await page.evaluate(async () => {
      await Sifrr.Dom.loading();
    });
  });

  it('works with sifrrElements', async () => {
    const srhtml = await page.$eval('element-ds-sr', el => el.shadowRoot.innerHTML);
    const nosrhtml = await page.$eval('element-ds-nosr', el => el.innerHTML);
    const isPolyfill = await page.evaluate('!!customElements.polyfillWrapFlushCallback');

    assert.equal(srhtml, '<p>Sifrr ok Simple</p>');
    assert.equal(nosrhtml, '<p>Sifrr ok Simple</p>');
    assert.equal(isPolyfill, true);
  });
});
