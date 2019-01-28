describe('Siffr.Dom', () => {
  before(async () => {
    await page.goto(`${PATH}/`);
  });

  it('has Sifrr.Dom', async () => {
    const isSifrr = await page.evaluate(() => !!Sifrr.Dom);
    assert(isSifrr);
  });
});
