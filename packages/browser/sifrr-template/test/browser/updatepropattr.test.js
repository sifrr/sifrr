function getAttribute(el, name) {
  return page.evaluate((el, name) => document.querySelector(el).getAttribute(name), el, name);
}

function hasAttribute(el, name) {
  return page.evaluate((el, name) => document.querySelector(el).hasAttribute(name), el, name);
}

describe('Update Prop and Update Attribute', () => {
  before(async () => {
    await page.goto(`${PATH}/update.html`);
    await page.evaluate(() => {
      window.pdiv = document.querySelector('#props');
      window.replaced = document.querySelector('#replaced');
      window.row = document.querySelector('#row');
    });
  });

  it('works with props', async () => {
    assert.equal(await page.evaluate(() => window.pdiv.string), 'value', 'works with string prop');
    assert.deepEqual(await page.evaluate(() => window.pdiv.object), { a: 'b' }),
      'works with object prop';
    assert.deepEqual(
      await page.evaluate(() => window.pdiv.directObject),
      { b: 'c' },
      'works with direct object prop'
    );
  });

  it('works with attributes', async () => {
    assert.equal(await hasAttribute('#attr', 'nullattr'), false, 'null attribute is removed');
    assert.equal(await hasAttribute('#attr', 'udattr'), false, 'undefined attribute is removed');
    assert.equal(await hasAttribute('#attr', 'falseattr'), false, 'false attribute is removed');
    assert.equal(await getAttribute('#attr', 'attr1'), 'some', 'string attribute is okay');
    assert.equal(await hasAttribute('#attr', 'esattr'), true, 'empty attribute is not removed');
    assert.equal(await getAttribute('#attr', 'esattr'), '', 'empty attribute is empty');
    assert.equal(
      await getAttribute('#attr', 'falsesattr'),
      'false',
      'false string is false string'
    );
  });
});
