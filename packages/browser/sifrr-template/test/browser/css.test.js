describe('CSS', () => {
  before(async () => {
    await page.goto(`${PATH}/async.html`);
  });

  it('renders style tag', async () => {
    assert.equal(
      await page.evaluate(() => {
        const cSS = Sifrr.Template.css`p { padding: 10px; }`;
        return cSS()[0].nodeName;
      }),
      'STYLE'
    );
    assert.equal(
      await page.evaluate(() => {
        const cSS = Sifrr.Template.css`p { padding: 10px; }`;
        return cSS()[0].innerHTML;
      }),
      'p { padding: 10px; }'
    );
  });
});
