describe('Parser', () => {
  before(async () => {
    await page.goto(`${PATH}/`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  it("doesn't evaluate if string doesn't have ${", async () => {
    const res = await page.evaluate('Sifrr.Dom.Parser.evaluateString("abcd")');
    expect(res).to.equal('abcd');
  });
});
