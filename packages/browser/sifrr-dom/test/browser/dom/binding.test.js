describe('Bindings', () => {
  before(async () => {
    await page.goto(`${PATH}/binding.html`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  it('works in text', async () => {
    const onlytext = await page.$eval('binding-text', el => el.$('#onlytext').textContent);

    assert.equal(onlytext, 'only text');

    const betweentext = await page.$eval('binding-text', el => el.$('#betweentext').textContent);

    assert.equal(betweentext, 'aa between text aa');
  });

  it('works with functions', async () => {
    const functiontext = await page.$eval('binding-text', el => el.$('#function').textContent);

    assert.equal(functiontext, 'fx function');
  });

  it('works in attribute', async () => {
    const attributetext = await page.$eval('binding-text', el => el.$('#attributetext').getAttribute('class'));

    assert.equal(attributetext, 'attribute text');
  });

  it('works in style', async () => {
    const color = await page.$eval('binding-style', el => window.getComputedStyle(el.$('p'))['color']);

    assert.equal(color, 'rgb(0, 0, 255)');
  });

  it("consoles error if error in binding and doesn't stop rendering", async () => {
    // No need to test, other tests will fail if this happens
  });

  describe('html', () => {
    it('works with array', async () => {
      const html = await page.$eval('binding-html', el => el.$('#array').innerHTML);

      assert.equal(html, '<p></p><p></p>');
    });

    it('works with childnodes', async () => {
      const html = await page.$eval('binding-html', el => el.$('#childnodes').innerHTML);

      assert.equal(html, '<div>childnode</div><a>a</a>');
    });

    it('works with children', async () => {
      const html = await page.$eval('binding-html', el => el.$('#children').innerHTML);

      assert.equal(html, '<div>children</div>');
    });

    it('works with template', async () => {
      const html = await page.$eval('binding-html', el => el.$('#template').innerHTML);

      assert.equal(html, '<div>template</div>');
    });

    it('works with onenode', async () => {
      const html = await page.$eval('binding-html', el => el.$('#onenode').innerHTML);

      assert.equal(html, '<p></p>');
    });

    it('works with string', async () => {
      const html = await page.$eval('binding-html', el => el.$('#string').innerHTML);

      assert.equal(html, '<h1>string</h1>');
    });
  });
});
