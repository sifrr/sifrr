describe('Siffr.Dom', () => {
  before(async () => {
    await page.goto(`${PATH}/`);
  });

  it('has Sifrr.Dom', async () => {
    assert(await page.evaluate(() => !!Sifrr.Dom));
    assert(await page.evaluate(() => !!Sifrr.Dom.setup));
    assert(await page.evaluate(() => !!Sifrr.Dom.Element));
    assert(await page.evaluate(() => !!Sifrr.Dom.Event));
    assert(await page.evaluate(() => !!Sifrr.Dom.register));
    assert(await page.evaluate(() => !!Sifrr.Dom.load));
    assert(await page.evaluate(() => !!Sifrr.Dom.template));
  });
});
