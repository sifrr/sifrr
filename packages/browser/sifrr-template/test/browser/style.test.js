describe('Style', () => {
  before(async () => {
    await page.goto(`${PATH}/style.html`);
  });

  it('sets direct style', async () => {
    const style = await page.$eval('#directstyle', el => {
      return {
        marginTop: el.style.marginTop,
        paddingTop: el.style.paddingTop
      };
    });

    assert.equal(style.marginTop, '20px', 'hyphen case works');
    assert.equal(style.paddingTop, '10px', 'camelcase works');
  });

  it('sets/unsets normal style', async () => {
    const style = await page.$eval('#style', el => {
      window.setStyle({ 'margin-top': '20px', paddingTop: '10px' });
      return {
        marginTop: el.style.marginTop,
        paddingTop: el.style.paddingTop,
        total: el.getAttribute('style')
      };
    });

    assert.equal(style.marginTop, '20px', 'hyphen case works');
    assert.equal(style.paddingTop, '10px', 'camelcase works');
    assert.equal(style.total, 'margin-top: 20px; padding-top: 10px;', 'adds new style');

    const style2 = await page.$eval('#style', el => {
      window.setStyle({ margin: '10px' });
      return {
        marginTop: el.style.marginTop,
        paddingTop: el.style.paddingTop,
        margin: el.style.margin,
        total: el.getAttribute('style')
      };
    });

    assert.equal(style2.marginTop, '10px', 'takes from total style');
    assert.equal(style2.paddingTop, '', 'removes old style');
    assert.equal(style2.margin, '10px', 'adds new style');
    assert.equal(style2.total, 'margin: 10px;', 'adds new style');
  });
});
