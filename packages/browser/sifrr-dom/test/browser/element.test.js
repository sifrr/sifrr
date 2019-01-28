describe('Sifrr.Dom.Element', () => {
  before(async () => {
    await page.goto(`${PATH}/`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  it('has Sifrr.Dom.Element', async () => {
    const isSifrr = await page.evaluate(() => !!Sifrr.Dom.Element);
    assert(isSifrr);
  });

  it('loads sifrr-small', async () => {
    const isSifrr = await page.$eval('sifrr-small', el => el.isSifrr('sifrr-small'));
    assert(isSifrr, 'sifrr-small is sifrr element');

    const hasSR = await page.$eval('sifrr-small', el => !!el.shadowRoot);
    assert(hasSR, 'sifrr-small has shadowroot');

    const content = await page.$eval('sifrr-small', el => el.shadowRoot.innerHTML);
    expect(content).to.have.string('Sifrr Small', 'Has content from template tag');
  });
});
