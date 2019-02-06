describe('Sifrr.Dom.Element', () => {
  before(async () => {
    await page.goto(`${PATH}/`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });
});
